import { Link, useNavigate } from 'react-router-dom';
import "./index.css";

const Header = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();        
    navigate('/login'); 
  };

  return (
    <nav className="nav-header">
      <div className="header-link">
        <p><Link to="/home" className="link">Home</Link></p>
        <p><Link to="/mybookings" className="link">My Booking</Link></p>
        <p><Link to="/buses" className="link">Buses</Link></p>
        <p><span onClick={handleLogout} className="link-logout-button">Logout</span></p>
      </div>
    </nav>
  );
};

export default Header;

