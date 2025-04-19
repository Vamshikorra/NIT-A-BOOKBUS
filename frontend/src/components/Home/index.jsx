
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './index.css';

const Home = ({ userId }) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [buses, setBuses] = useState([]);
  const [message, setMessage] = useState('');
  const [role, setRole] = useState('');
  const [ownerData, setOwnerData] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/getUserRole`, {
          params: { userId },
        });
        setRole(res.data.role);

        if (res.data.role === 'owner') {
          const ownerRes = await axios.get(`http://localhost:5000/api/busOwnerDashboard`, {
            params: { userId },
          });
          setOwnerData(ownerRes.data);
        }
      } catch (err) {
        console.error('Error fetching user role or owner data', err);
        setMessage('Unable to load user role or owner data');
      }
    };

    if (userId) fetchUserRole();
  }, [userId]);

 
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!from || !to || !date) {
      setMessage('All fields are required');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/search', { from, to, date });
      setBuses(res.data);
      setMessage(res.data.length ? '' : 'No buses found');
    } catch (err) {
      console.error('Error fetching buses:', err);
      setMessage('Error fetching buses');
    }
  };

 
  return (
    <div className="home">
      <div className="home-container">
        {role === 'owner' ? (
  <div className="owner-dashboard">
    <h2>Owner Dashboard</h2>
    <p><strong>Total Bookings:</strong> {ownerData?.totalBookings ?? 0}</p>
    <p><strong>Total Earnings:</strong> ₹{ownerData?.totalEarnings ?? 0}</p>

 
    <button onClick={() => navigate(`/add-bus`)} style={{ display: 'inline-block', margin: '10px 0', color: 'blue' }}>
      ➕ Add New Bus
    </button>

    <h3>Upcoming Trips</h3>
    <ul>
      {(ownerData?.upcomingTrips || []).map((trip, idx) => (
        <li key={idx}>
          From: {trip.from} - To: {trip.to} at {trip.departureTime}
        </li>
      ))}
    </ul>

    <h3>Buses</h3>
    <ul>
      {(ownerData?.buses || []).map((bus, idx) => (
        <li key={idx}>
          {bus.name} - {bus.registrationNumber}
        </li>
      ))}
    </ul>
  </div>
): (
          <div className="bus-search">
            <h2 className="heading-search-bus">Search Buses</h2>

            <form className="searchform" onSubmit={handleSearch}>
              <label  className="label"htmlFor="from">From</label>
              <input
                id="from"
                className="userInputSearch"
                type="text"
                placeholder="From"
                value={from}
                onChange={e => setFrom(e.target.value)}
              />

              <label  className="label"htmlFor="to">To</label>
              <input
                id="to"
                className="userInputSearch"
                type="text"
                placeholder="To"
                value={to}
                onChange={e => setTo(e.target.value)}
              />

              <label className="label" htmlFor="date">Date</label>
              <input

                id="date"
                className="userInputSearch"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
              />

              <button className="btnsumbit" type="submit">Search</button>
            </form>

            {message && <p className="message">{message}</p>}

            {buses.length > 0 && (
              <div className="bus-list">
                {buses.map(bus => (
                  <div key={bus._id} className="bus-card">
                    <p><strong>{bus.busNumber}</strong> | {bus.from} → {bus.to}</p>
                    <p>Date: {bus.date}</p>
                    <p>Price: ₹{bus.price}</p>
                    <button onClick={() => navigate(`/seats/${bus._id}`)}>Book</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
