import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from "./components/Register";
import Login from "./components/Loginpage";
import Home from './components/Homepage';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/home" element={<Home isLoggedIn={isLoggedIn} />} />
      </Routes>
    </Router>
  );
}

export default App;

