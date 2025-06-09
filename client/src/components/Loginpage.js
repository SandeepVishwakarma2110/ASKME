import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/styles.css';

const Login = ({ setIsLoggedIn }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/login', form);
      localStorage.setItem('token', res.data.token);
      //console.log("JWT_SECRET:", process.env.JWT_SECRET);
      alert('Logged in successfully!');
      setIsLoggedIn(true);
      navigate('/home');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert('Invalid email or password.');
      } else {
        alert('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Login</button>
      </form>
      <p className="register-prompt">
                    Don't have an account? <Link to="/ " className="register-link">Register</Link>
                </p>
    </div>
  );
};

export default Login;