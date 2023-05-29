import React, { Component } from 'react';
import axios from 'axios';
import { getAuth} from "firebase/auth";
import firebase from 'firebase/compat/app';
import getFirebaseConfig from './firebase-config';
import './LoginForm.css'
import './Profile.css'

const addRequestUrl = 'https://addrequest-7g4ibqksta-uc.a.run.app'
const config = getFirebaseConfig;
const firebaseApp = firebase.initializeApp(config);
const auth = getAuth(firebaseApp);

class SearchResult extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPending: false
    };
  }

  handleAddFriend = () => {
    this.setState({ isPending: true });
    if(auth.currentUser.email) {
      const request = {
        email: auth.currentUser.email,
        newRequest: this.props.email
      };
      axios.post(addRequestUrl, request, {headers: {'Content-Type': 'application/json'}})
        .then()
        .catch(err => alert(err));
    }

    // Logic to send friend request or perform necessary actions
    // After the request is processed, update the state accordingly
  };

  handleCancelRequest = () => {
    this.setState({ isPending: false });
  };

  render() {
    const { isPending } = this.state;
    const { email } = this.props;
    if(!isPending) {
      return (
          <div>
            <p> </p>
            <p style={{display:'block'}}>
            <span>{email}</span>
            <button className="add-button" onClick={this.handleAddFriend}>Add Friend</button>
            </p>
          </div>
      )
    }
  }
}

export default SearchResult;


