import { useState } from 'react';
import axios from 'axios';
import './indexRegister2.css';

const Register2 = ({ onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contact, setContact] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/busowner/register', {
        email,
        password,
        contact,
        name,
      });
      setMessage(res.data.message);
      onRegister();  // Handle successful registration
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="reg-wrap">
      <h2>Bus Owner Registration</h2>
      <form onSubmit={handleRegister} className="reg-form">
        <label>Name</label>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Password</label>
        <input
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label>Contact</label>
        <input
          type="text"
          placeholder="Enter your contact number"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
        />
        <button type="submit">Register</button>
        <p className="msg">{message}</p>
      </form>
    </div>
  );
};

export default Register2;
