import React, { useState } from 'react';
import firebase from 'firebase/compat/app';
import getFirebaseConfig from './firebase-config';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import 'firebase/firestore';
import axios from 'axios';

const config = getFirebaseConfig;
const firebaseApp = firebase.initializeApp(config);
const auth = getAuth();

const url='https://adduserinfo-7g4ibqksta-uc.a.run.app'

function createUsers(p_email, p_password, phoneNumber, username) {
    createUserWithEmailAndPassword(auth, p_email, p_password)
    .then((userRecord) => {
        // See the UserRecord reference doc for the contents of userRecord.
        alert('Successfully created new user:', userRecord.uid);
        alert(auth.currentUser);
        console.log(auth.currentUser);
        axios.post(url, {
            user: auth.currentUser,
            email: p_email,
            phoneNumber: phoneNumber,
            username: username
        },
        {'Content-Type': 'application/json'})
        .then((userRecord) => {
          alert("successfully added to db")
        }).catch((error) => {
          alert("failed to add to db")
        })
    })
    .catch((error) => {
        alert('Error creating new user:', error);
    });
}

const SignUpForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = (e) => {
    e.preventDefault();
    createUsers(email, password, phoneNumber, username, '');
  };

  return (
    <div>
      <h2>Sign Up</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleSignUp}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUpForm;
