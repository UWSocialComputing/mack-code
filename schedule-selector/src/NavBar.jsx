import React from "react";
import { BrowserRouter, Route, Link } from "react-router-dom";
import logo from './logo.png';
import profile from './profile.png';
import './NavBar.css';

function Navbar() {
  return (
    <nav>
      <div style={{ marginLeft:'2%', marginRight:'2%', display: 'flex', justifyContent: 'space-between' }}>
      <Link to="/calendar"><img src={logo} alt="Logo" className="left-image" /></Link>
      <Link to="/profile"><img src={profile} alt="Profile" className="right-image" /></Link>
    </div>
    </nav>
  );
}

export default Navbar;