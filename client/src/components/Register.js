import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/styles.css';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return alert('Passwords do not match');

    try {
      await axios.post('/register', form);
      alert('Registered successfully!');
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" 
        name="name" 
        placeholder="Name" 
        onChange={handleChange} required />

        <input type="email" 
        name="email" 
        placeholder="Email" 
        onChange={handleChange} 
        required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />
        <button type="submit">Register</button>
        <p className="register-prompt">
                    have an account? <Link to="/login" className="register-link">Login</Link>
                </p>
      </form>
    </div>
  );
};

export default Register;