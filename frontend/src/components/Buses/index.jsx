import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './index.css'

const Buses = () => {
  const [buses, setBuses] = useState([]);
  const [message, setMessage] = useState('');


  useEffect(() => {
    fetchAllBuses();
  }, []);

  const fetchAllBuses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/buses');
      setBuses(res.data);
      setMessage('');
    } catch (err) {
      setMessage('Error loading buses');
    }
  };
  const navigate = useNavigate();
  return (
    <div className="home-container">
      <h2 className="heading"> Buses</h2>

      {message && <p>{message}</p>}

      {buses.length > 0 ? (
        <div className="bus-list">
          {buses.map(bus => (
            <div key={bus._id} className="bus-card">
              <p><strong>{bus.busNumber}</strong> | {bus.from} → {bus.to}</p>
              <div className="">

              <p>Date: {bus.date}</p>
              <p>Price: ₹{bus.price}</p>
              </div>
              <button onClick={() => navigate(`/seats/${bus._id}`)}>book</button>
            </div>
          ))}
        </div>
      ) : (
        <p>No buses available</p>
      )}
    </div>
  );
};

export default Buses;
