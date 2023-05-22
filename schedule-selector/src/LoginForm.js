import React, { Component } from 'react';
import firebase from 'firebase/compat/app';
import getFirebaseConfig from './firebase-config';
import axios from 'axios';

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const url='https://getplans-7g4ibqksta-uc.a.run.app/'

const config = getFirebaseConfig;
const firebaseApp = firebase.initializeApp(config);
const auth = getAuth(firebaseApp);


class LoginForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      loginError: false,
      isLoading: false
    };
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = this.state;

    // Set loading state to true
    this.setState({ isLoading: true });
    alert("Trying to sign in");
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      this.setState({ loginError: false });
      alert("Login Sucess!");
      console.log(userCredential);
      axios.post(url, {
        user: user
      },
      {'Content-Type': 'application/json'});
      })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage);
    });
    
    this.setState({ isLoading: false });
  };

  render() {
    const { email, password, loginError, isLoading } = this.state;

    return (
      <div>
        <h3>Login</h3>
        <form onSubmit={this.handleSubmit}>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={this.handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={this.handleChange}
              required
            />
          </div>
          {loginError && <p style={{ color: 'red' }}>Invalid email or password</p>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging In...' : 'Log In'}
          </button>
        </form>
      </div>
    );
  }
}

export default LoginForm;
