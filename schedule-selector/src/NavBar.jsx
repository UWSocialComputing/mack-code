import React from "react";
import { BrowserRouter, Route, Link } from "react-router-dom";
import logo from './logo.png';
import profile from './profile.png';
import './NavBar.css';

function Navbar() {
  return (
    <nav>
      <ul>
          {/* <img style={{ width: 350, height: 75 }} src={logo} alt="Logo" /></Link> */}
          {/* <Link to="/profile"><img style={{ width: 50, height: 50 }} src={profile} alt="Profile" /></Link> */}
      </ul>
      <div className="container">
      <Link to="/"><img src={logo} alt="Logo" className="left-image" /></Link>
      <Link to="/profile"><img src={profile} alt="Profile" className="right-image" /></Link>
    </div>
    </nav>
  );
}

export default Navbar;