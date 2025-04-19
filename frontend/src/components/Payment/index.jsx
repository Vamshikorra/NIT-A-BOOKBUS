import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './index.css';

function Payment({ bookingId, userId, onBack, onComplete }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedSeats, totalCost, gstAmount, totalAmount } = location.state || {};

  const [paymentStatus, setPaymentStatus] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!selectedSeats || !totalAmount) {
      setMessage('Invalid payment details.');
      return;
    }
  }, [selectedSeats, totalAmount]);

  const handlePaymentSubmit = async () => {
    try {
      setPaymentStatus('Processing...');
      const paymentInfo = { amount: totalAmount, paymentMethod: 'Dummy Payment' };

    
      const res = await axios.post('http://localhost:5000/api/pay', { bookingId, paymentInfo });

      if (res.data.success) {
        setPaymentStatus('Success');
        onComplete(); 
        navigate("/success");
      } else {
        setPaymentStatus('Failed');
        setMessage('Payment failed. Please try again.');
      }
    } catch (err) {
      setPaymentStatus('Failed');
      setMessage('Payment error: ' + err.message);
    }
  };

  return (
    <div className="payment">
      <h2>Payment Details</h2>
      <button onClick={onBack}>Back</button>

      <div className="payment-summary">
        <h3>Selected Seats: {selectedSeats?.join(', ')}</h3>
        <p>Total Cost: ₹{totalCost}</p>
        <p>GST (5%): ₹{gstAmount}</p>
        <p><strong>Grand Total: ₹{totalAmount}</strong></p>
      </div>

      {message && <p className="error-message">{message}</p>}

      <button onClick={handlePaymentSubmit} disabled={paymentStatus === 'Processing'}>
        {paymentStatus === 'Processing' ? 'Processing...' : 'Complete Payment'}
      </button>
    </div>
  );
}

export default Payment;
