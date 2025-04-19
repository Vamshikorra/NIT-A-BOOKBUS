import React, { useState } from 'react';
import axios from 'axios';
import Header from '../Header'

const AddBusPanel = ({ ownerId }) => {
  const [form, setForm] = useState({
    busNumber: '',
    from: '',
    to: '',
    date: '',
    price: '',
    seats: '',
    departureTime: '',
    arrivalTime: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const seatArray = form.seats.split(',').map(seat => seat.trim());
    const payload = {
      ...form,
      seats: seatArray,
      ownerId
    };

    try {
      await axios.post('http://localhost:5000/api/owner/add-bus', payload);
      alert('Bus added successfully!');
      setForm({
        busNumber: '',
        from: '',
        to: '',
        date: '',
        price: '',
        seats: '',
        departureTime: '',
        arrivalTime: ''
      });
    } catch (err) {
      alert('Failed to add bus: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <>
    <Header/>
    <div>
      <h2>Add New Bus</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Bus Number</label>
          <input name="busNumber" value={form.busNumber} onChange={handleChange} required />
        </div>
        <div>
          <label>From</label>
          <input name="from" value={form.from} onChange={handleChange} required />
        </div>
        <div>
          <label>To</label>
          <input name="to" value={form.to} onChange={handleChange} required />
        </div>
        <div>
          <label>Date (YYYY-MM-DD)</label>
          <input name="date" value={form.date} onChange={handleChange} required />
        </div>
        <div>
          <label>Price</label>
          <input name="price" type="number" value={form.price} onChange={handleChange} required />
        </div>
        <div>
          <label>Seats (comma-separated e.g. A1,B1,B2)</label>
          <input name="seats" value={form.seats} onChange={handleChange} required />
        </div>
        <div>
          <label>Departure Time</label>
          <input name="departureTime" value={form.departureTime} onChange={handleChange} required />
        </div>
        <div>
          <label>Arrival Time</label>
          <input name="arrivalTime" value={form.arrivalTime} onChange={handleChange} required />
        </div>
        <button type="submit">Add Bus</button>
      </form>
    </div>
    </>
  );
};

export default AddBusPanel;
