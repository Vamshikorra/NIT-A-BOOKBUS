const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json()); 

mongoose.connect('mongodb://localhost:27017/busbook', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const userSchema = new mongoose.Schema({
  email: String,
  usertype: { type: String, default: "user" },
  dob: String,
  password: String,
});

const seatSchema = new mongoose.Schema({
  number: String,
  status: {
    type: String,
    enum: ['available', 'booked', 'reserved'],
    default: 'available',
  },
});

const busSchema = new mongoose.Schema({
  busNumber: String,
  from: String,
  to: String,
  date: String,
  price: Number,
  seatMap: [seatSchema],

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusOwner',
    required: true
  }
});

const bookingSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  seatsBooked: [String],
  paymentStatus: String,
  paymentInfo: Object,
});

const User = mongoose.model('User', userSchema);
const Bus = mongoose.model('Bus', busSchema);
const Booking = mongoose.model('Booking', bookingSchema);

// ===== AUTH ROUTES =====
app.post('/api/register', async (req, res) => {
  const { email, dob, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ email, dob, password: hash });
  await user.save();
  res.json({ message: 'User registered successfully' });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.json({ message: 'Login successful', userId: user._id });
});

app.post('/api/change-password', async (req, res) => {
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Password changed successfully' });
});

// ===== BUS OPERATIONS =====
app.get('/api/buses', async (req, res) => {
  try {
    const buses = await Bus.find();
    res.json(buses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch buses' });
  }
});

app.post('/api/search', async (req, res) => {
  const { from, to, date } = req.body;
  const buses = await Bus.find({ from, to, date });
  res.json(buses);
});

app.get('/api/bus/:id', async (req, res) => {
  const bus = await Bus.findById(req.params.id);
  if (!bus) return res.status(404).json({ message: 'Bus not found' });
  res.json({ seatMap: bus.seatMap, price: bus.price });
});

// ===== BOOKING & PAYMENT =====
app.post('/api/book', async (req, res) => {
  const { userId, busId, seatsBooked } = req.body;

  // Update seat status to "booked"
  const bus = await Bus.findById(busId);
  bus.seatMap.forEach(seat => {
    if (seatsBooked.includes(seat.number)) {
      seat.status = 'booked';
    }
  });
  await bus.save();

  const booking = new Booking({
    userId,
    busId,
    seatsBooked,
    paymentStatus: 'pending',
    paymentInfo: {},
  });

  await booking.save();
  res.json({ message: 'Booking initiated', bookingId: booking._id });
});

app.post('/api/pay', async (req, res) => {
  const { bookingId, paymentInfo } = req.body;
  const booking = await Booking.findById(bookingId);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });

  booking.paymentStatus = 'success';
  booking.paymentInfo = paymentInfo;
  await booking.save();

  res.json({ message: 'Payment successful' });
});

// ===== MY BOOKINGS =====
app.get('/api/mybookings', async (req, res) => {
  try {
    const userId = req.query.userId;  // The userId should be passed in the query parameter
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Fetch all bookings for the user
    const bookings = await Booking.find({ userId }).populate('busId');

    if (!bookings.length) {
      return res.status(404).json({ message: 'No bookings found for this user' });
    }

    // Format the bookings response
    const formattedBookings = bookings.map(b => ({
      bookingId: b._id,
      busNumber: b.busId.busNumber,
      from: b.busId.from,
      to: b.busId.to,
      date: b.busId.date,
      seats: b.seatsBooked,
      paymentStatus: b.paymentStatus,
      amount: b.paymentInfo?.amount || null, // Assuming 'amount' is inside paymentInfo
    }));

    // Send the formatted response
    res.json(formattedBookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// ===== CANCEL BOOKING =====
app.delete('/api/cancelbooking', async (req, res) => {
  const { bookingId } = req.body;  // Assume bookingId is passed in the request body

  try {
    const deletedBooking = await Booking.findByIdAndDelete(bookingId);

    if (!deletedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update seat status to "available" after cancellation
    const bus = await Bus.findById(deletedBooking.busId);
    bus.seatMap.forEach((seat) => {
      if (deletedBooking.seatsBooked.includes(seat.number)) {
        seat.status = 'available';
      }
    });
    await bus.save();

    res.status(200).json({ message: 'Booking canceled successfully' });
  } catch (error) {
    console.error('Error canceling booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


//busowners 
const busOwnerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  usertype: { type: String, default: "owner" },
  contact: String,

  dashboardStats: {
    totalBookings: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    upcomingTrips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bus' }],
  },

  buses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus'
  }],

  documents: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],

  routes: [{
    from: String,
    to: String,
    departureTime: String,
    arrivalTime: String,
    price: Number,
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' }
  }],

  bookings: [{
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    status: { type: String, enum: ['confirmed', 'canceled'], default: 'confirmed' },
    passengerList: [{
      name: String,
      seatNumber: String,
      contact: String
    }],
    createdAt: { type: Date, default: Date.now }
  }]
});





const BusOwner = mongoose.model('BusOwner', busOwnerSchema);

app.post('/api/busowner/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const owner = await BusOwner.findOne({ email });
    if (!owner) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, owner.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      message: 'Login successful',
      ownerId: owner._id,
      name: owner.name,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Update the route to match the frontend call
app.post('/api/busowner/register', async (req, res) => {
  const { email, password, contact, name } = req.body;
  if (!email || !password || !contact || !name) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if the email is already registered
    const existingOwner = await BusOwner.findOne({ email });
    if (existingOwner) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new BusOwner
    const newOwner = new BusOwner({
      email,
      password: hashedPassword,
      contact,
      name,
    });

    await newOwner.save();
    res.status(201).json({ message: 'Owner registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

//  confirm owner or not
app.get('/api/getUserRole', async (req, res) => {
  const { userId } = req.query;

  try {
    const user = await User.findById(userId);
    if (user) return res.json({ role: user.usertype || 'user' });

    const owner = await BusOwner.findById(userId);
    if (owner) return res.json({ role: owner.usertype || 'owner' });

    return res.status(404).json({ message: 'User not found' });
  } catch (error) {
    console.error('Error determining user role:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/busowner/dashboard/:ownerId', async (req, res) => {
  const { ownerId } = req.params;

  try {
    const owner = await BusOwner.findById(ownerId)
      .populate({
        path: 'buses',
        populate: {
          path: 'seatMap'
        }
      })
      .populate({
        path: 'dashboardStats.upcomingTrips',
        select: 'busNumber from to date'
      });

    if (!owner) return res.status(404).json({ message: 'Bus owner not found' });

    const bookings = await Booking.find({ busId: { $in: owner.buses } });

    // Aggregate stats
    const totalBookings = bookings.length;
    const totalEarnings = bookings.reduce((sum, b) => {
      const amt = b.paymentInfo?.amount || 0;
      return b.paymentStatus === 'success' ? sum + amt : sum;
    }, 0);

    const upcomingTrips = owner.dashboardStats.upcomingTrips || [];

    res.json({
      ownerName: owner.name,
      totalBookings,
      totalEarnings,
      upcomingTrips,
      buses: owner.buses.map(bus => ({
        busId: bus._id,
        busNumber: bus.busNumber,
        route: `${bus.from} ➝ ${bus.to}`,
        date: bus.date,
        price: bus.price
      }))
    });
  } catch (err) {
    console.error('Dashboard fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

//add bus
app.post('/owner/add-bus', async (req, res) => {
  const {
    ownerId,
    busNumber,
    from,
    to,
    date,
    price,
    seats,
    departureTime,
    arrivalTime
  } = req.body;

  try {
    const owner = await BusOwner.findById(ownerId);
    if (!owner) return res.status(404).json({ message: 'Owner not found' });

    const seatMap = seats.map(number => ({ number, status: 'available' }));

    const newBus = new Bus({
      busNumber,
      from,
      to,
      date,
      price,
      seatMap,
      owner: owner._id
    });

    const savedBus = await newBus.save();

    // Update owner document
    owner.buses.push(savedBus._id);
    owner.dashboardStats.upcomingTrips.push(savedBus._id);
    owner.routes.push({
      from,
      to,
      departureTime,
      arrivalTime,
      price,
      busId: savedBus._id
    });

    await owner.save();

    res.status(201).json({
      message: 'Bus added and synced with owner data',
      bus: savedBus
    });
  } catch (err) {
    res.status(500).json({ message: 'Error adding bus', error: err.message });
  }
});



// ===== SERVER =====
app.listen(5000, () => console.log('🚍 BusBook backend running on port 5000'));
