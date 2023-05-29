import React, { Component, useState } from 'react';
import firebase from 'firebase/compat/app';
import getFirebaseConfig from './firebase-config';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { Navigate } from "react-router-dom";
import 'firebase/firestore';
import axios from 'axios';
import './LoginForm.css'

const config = getFirebaseConfig;
const firebaseApp = firebase.initializeApp(config);
const auth = getAuth();

const url='https://adduserinfo-7g4ibqksta-uc.a.run.app'

class SignUpForm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      username: '',
      email: '',
      password: '',
      phoneNumber: '',
      redirectTo: ''
    };
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }; 
  
  handleSignUp = async (e) => {
    e.preventDefault();
    const { username, email, password, phoneNumber, redirectTo } = this.state;
    this.createUsers(email, password, phoneNumber, username);
  };

  createUsers = (p_email, p_password, phoneNumber, username) => {
    createUserWithEmailAndPassword(auth, p_email, p_password)
    .then((userRecord) => {
        // See the UserRecord reference doc for the contents of userRecord.
        axios.post(url, {
            user: auth.currentUser,
            email: p_email,
            phoneNumber: phoneNumber,
            username: username
        },
        {'Content-Type': 'application/json'})
        .then((userRecord) => {
        }).catch((error) => {
        })
        this.setState({
          username: '',
          email: '',
          password: '',
          phoneNumber: '',
          redirectTo: '/calendar'
        });
    })
    .catch((error) => {
        alert('Error creating new user:', error);
    });
  }

  render() {
    const { username, email, password, phoneNumber, redirectTo } = this.state;
    
    if(redirectTo) {
      return <Navigate to={redirectTo} />
    }
    return <>
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={this.handleSignUp}>
      <label htmlFor="username">Username:</label>
        <div>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={this.handleChange}
            required
            className="custom-input"
          />
        </div>
        <label htmlFor="email">Email:</label>
        <div>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={this.handleChange}
            required
            className="custom-input"
          />
        </div>
        <label htmlFor="password">Password:</label>
        <div>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={this.handleChange}
            required
            className="custom-input"
          />
        </div>
        <label htmlFor="phoneNumber">Phone Number:</label>
        <div>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={phoneNumber}
            onChange={this.handleChange}
            required
            className="custom-input"
          />
        </div>
        <button className="button button-primary" type="submit">Sign Up</button>
      </form>
    </div>
    </>
  }
}

export default SignUpForm;


