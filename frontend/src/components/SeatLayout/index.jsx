

import{   React , useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import './index.css';

const SeatLayout = ({ userId, onBack, onSeatsBooked }) => {
  const { busId } = useParams();
  const navigate = useNavigate(); 
  const [seatMap, setSeatMap] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [message, setMessage] = useState('');
  const [waitingInfo, setWaitingInfo] = useState(null);
  const [busPrice, setBusPrice] = useState(0);
  const gstRate = 0.05; 

  useEffect(() => {
    const fetchSeatMap = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/bus/${busId}`);
        const allSeats = res.data.seatMap || [];
        setBusPrice(res.data.price);
        setSeatMap(allSeats);

       
        const bookedCount = allSeats.filter(seat => seat.status === 'booked').length;
        if (bookedCount === allSeats.length) {
          const travelDate = new Date(res.data.date);
          const daysLeft = Math.max(0, Math.ceil((travelDate - new Date()) / (1000 * 60 * 60 * 24)));
          const chance = daysLeft > 5 ? 'High' : daysLeft > 2 ? 'Moderate' : 'Low';

          setWaitingInfo({
            position: Math.floor(Math.random() * 10) + 1,
            chance
          });
        }
      } catch (err) {
        setMessage('Error loading seat map');
      }
    };
    fetchSeatMap();
  }, [busId]);

  const toggleSeat = (seat) => {
    if (seat.status === 'booked') return;
    setSelectedSeats(prev =>
      prev.includes(seat.number)
        ? prev.filter(s => s !== seat.number)
        : [...prev, seat.number]
    );
  };

  const handleBook = async () => {
    try {
      const totalSeats = selectedSeats.length;
      const totalCost = busPrice * totalSeats;
      const gstAmount = totalCost * gstRate;
      const totalAmount = totalCost + gstAmount;

     
      const res = await axios.post('http://localhost:5000/api/book', {
        userId,
        busId,
        seatsBooked: selectedSeats
      });

      const bookingId = res.data.bookingId;

      onSeatsBooked({
        bookingId,
        seatsBooked: selectedSeats,
        pricePerSeat: busPrice,
        totalCost,
        gstAmount,
        totalAmount
      });

     
      navigate('/payment', {
        state: {
          selectedSeats,
          totalCost,
          gstAmount,
          totalAmount
        }
      });
    } catch (err) {
      setMessage('Error processing your booking');
    }
  };

  return (
    <div className="seat-Page">
    <div className="seat-layout">
      <h2>Select Seats</h2>
      <div className="seats-grid">
        {seatMap.map(seat => {
          const isSelected = selectedSeats.includes(seat.seatNumber);
          const className =
            seat.status === 'booked' ? 'seat booked' :
            isSelected ? 'seat selected' : 'seat available';

          return (
            <div
              key={seat.seatNumber}
              className={className}
              onClick={() => toggleSeat(seat)}
            >
              {seat.seatNumber}
            </div>
          );
        })}
      </div>

      <p>Selected Seats: {selectedSeats.join(', ')}</p>
      {console.log(selectedSeats)}
      <button onClick={onBack}>Back</button>
      <button onClick={handleBook} disabled={!selectedSeats.length}>Continue to Payment</button>
      {message && <p>{message}</p>}

      {waitingInfo && (
        <div className="waiting-list">
          <h4>⚠️ All seats booked</h4>
          <p>You are in Waiting List Position: <strong>WL{waitingInfo.position}</strong></p>
          <p>Chance of confirmation: <strong>{waitingInfo.chance}</strong></p>
        </div>
      )}
    </div>
    </div>
   

  );
};

export default SeatLayout;

