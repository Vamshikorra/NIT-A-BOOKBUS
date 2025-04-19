


import React, { useEffect, useState } from 'react';
import './indexMyBooking.css';

const MyBookings = ({ userId }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/mybookings?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const data = await response.json();
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId]);

  const handleCancelBooking = async (bookingId) => {
    try {
      const response = await fetch('http://localhost:5000/api/cancelbooking', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      setBookings((prev) => prev.filter((b) => b.bookingId !== bookingId));
      alert('Booking canceled successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading bookings...</div>;
  if (error) return <div>Error: {error}</div>;
  if (bookings.length === 0) return <div>You have no bookings yet.</div>;

  return (
    <div className="MyBooking-page">
      <h2 className='My-Bookings'>My Bookings</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {bookings.map((booking) => (
          <li key={booking.bookingId} className="booking-card">
           
            <div className="bus-booked-card">
            <div>

           
            <h3 className="busName">Bus Number: {booking.busNumber}</h3>
            <div className="route-date">
            <p><strong>Route:</strong> {booking.from} ➝ {booking.to}</p>
            <p><strong>Date:</strong> {booking.date}</p>
            </div>
            <div className="route-date">
            <p><strong>Seats Booked:</strong> {booking.seats.join(', ')}</p>
            <p><strong>Payment Status:</strong> {booking.paymentStatus}</p>
            </div>

            </div>
            
            {booking.paymentStatus === 'success' && (
              <p><strong>Amount Paid:</strong> ${booking.amount}</p>
            )}
            <button
              onClick={() => handleCancelBooking(booking.bookingId)}
              className="cancel-button"
            >
              Cancel Booking
            </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyBookings;

