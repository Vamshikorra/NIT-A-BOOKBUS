import { useState } from 'react';
import { Link ,useNavigate} from 'react-router-dom';
import axios from 'axios';
import './index.css';


const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isOwnerLogin, setIsOwnerLogin] = useState(false); 

  
 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const url = isOwnerLogin
      ? 'http://localhost:5000/api/busowner/login'
      : 'http://localhost:5000/api/login'; 
    try {
      const res = await axios.post(url, {
        email,
        password,
      });
      setMessage(res.data.message);
      onLogin(res.data.userId);
  
      
    
        setTimeout(() => {
          onLogin(res.data.userId);
          navigate('/home'); 
        }, 1500); 

      
     
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };
  

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="login-header">
          <button   onClick={() => setIsOwnerLogin(!isOwnerLogin)} className="toggle-button">
            {isOwnerLogin ? 'User Login' : 'BusManagerForm'}
          </button>
        </div>
        <h2 className="headinglogintype" >{isOwnerLogin ? 'BusManagerForm' : 'USER LOGIN'}</h2>
        <p>{isOwnerLogin ? 'BusManagerForm: Enter your details.' : 'User login: Please enter your credentials.'}</p>
        <form onSubmit={handleLogin}>
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
          <div className="login-options">
            <a href="#">Forgot password</a>
          </div>
          <button className="btn-signin" type="submit">
            Sign in
          </button>
          
          {
            <p className="signup-text">
            Don’t have an account? <Link to={isOwnerLogin ? '/ownerregister' : '/register'}>Sign up for free!</Link>
          </p>
           }
          
        </form>
        
        <p className="message">{message}</p>
      </div>

     
    </div>
  );
};

export default Login;

