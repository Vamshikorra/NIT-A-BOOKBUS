import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register2 from './components/Register2';
import Register from './components/Register';
import Home from './components/Home';
import Payment from './components/Payment';
import SeatLayout from './components/SeatLayout';
import MyBookings from './components/MyBookings';
import Buses from './components/Buses';
import Header from './components/Header';
import AddBusPanel from './components/AddBusPanel'
import NotFound from './components/NotFound'
import './app.css'

function App() {
  const [userId, setUserId] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [bookingDone, setBookingDone] = useState(false);

  return (
    <div>
    <Router>
      {userId && <Header onLogout={() => setUserId(null)} />}


      <Routes> 
     
        <Route path="/" element={<Navigate to={userId ? "/home" : "/login"} />} />

        <Route path="/login" element={
          userId ? <Navigate to="/home" /> : <Login onLogin={setUserId} />
        } />

<Route path="/add-bus" element={
  userId ? <AddBusPanel ownerId={userId} /> : <Navigate to="/login" />
} />


        <Route path="/register" element={
          userId ? <Navigate to="/home" /> : <Register onRegister={() => window.location.replace('/login')} />
        } />
        <Route path="/ownerregister" element={
          userId ? <Navigate to="/home" /> : <Register2 onRegister={() => window.location.replace('/login')} />
        } />
        

        <Route path="/home" element={
          userId ? <Home userId={userId} /> : <Navigate to="/login" />
        } />

        <Route path="/seats/:busId" element={
          userId ? (
            <SeatLayout
              userId={userId}
              onBack={() => window.history.back()}
              onSeatsBooked={(data) => {
                setBookingId(data.bookingId);
                setBookingData(data);
              }}
            />
          ) : <Navigate to="/login" />
        } />

<Route path="/payment" element={
  userId && bookingId && bookingData ? (
    <Payment
      bookingId={bookingId}
      userId={userId}
      bookingData={bookingData}
      onBack={() => {
        setBookingId(null);
        setBookingData(null);
      }}
      onComplete={() => setBookingDone(true)}
    />
  ) : <Navigate to="/seats" />
} />


        <Route path="/success" element={
          bookingDone ? (
            <div>
              <h3>Payment Successful!</h3>
              <button onClick={() => {
                setBookingId(null);
                setBookingData(null);
                setBookingDone(false);
                window.location.replace('/home');
              }}>
                Book Another
              </button>
            </div>
          ) : <Navigate to="/home" />
        } />

        <Route path="/mybookings" element={
          userId ? <MyBookings userId={userId} onBack={() => window.history.back()} />
          : <Navigate to="/login" />
        } />

        <Route path="/buses" element={
          userId ? <Buses />
          : <Navigate to="/login" />
        } />
         <Route path="*" element={<NotFound />} />
      </Routes>
     
    </Router>
    </div>
  );
}

export default App;


