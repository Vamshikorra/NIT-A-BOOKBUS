import { useState } from 'react';
import axios from 'axios';
import './index.css';

const Register = ({ onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/register', {
        email,
        dob,
        password,
      });
      setMessage(res.data.message);
      onRegister(); 
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className='login-cont '>
    <div className="register-wrapper">
      <h2 className="register-title">User Registration</h2>
      <form className="register-form" onSubmit={handleRegister}>
        <label className="form-label">Email</label>
        <input
          className="form-input"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="form-label">Date of Birth</label>
        <input
          className="form-input"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          required
        />

        <label className="form-label">Password</label>
        <input
          className="form-input"
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="form-button" type="submit">Register</button>
        <p className="message">{message}</p>
      </form>
    </div>
    </div>
  );
};

export default Register;
