import React, { Component } from 'react';
import axios from 'axios';
import { getAuth} from "firebase/auth";
import firebase from 'firebase/compat/app';
import getFirebaseConfig from './firebase-config';
import './index.css'

const editSettingsUrl='https://editsettings-7g4ibqksta-uc.a.run.app'

const getUserInfoUrl='https://getuserinfo-7g4ibqksta-uc.a.run.app'

const config = getFirebaseConfig;
const firebaseApp = firebase.initializeApp(config);
const auth = getAuth(firebaseApp);

class SettingsForm extends Component {
  constructor(props) {
    super(props);
    this.state = { maxHangoutValue: 1, daysInAdvanceValue: 1, friends: [], requestsSent: [], requestsRecieved: []};
  }
  
  componentDidMount() {
    if(auth.currentUser.email) {
      axios.get(getUserInfoUrl, { params: { email: auth.currentUser.email } })
      .then(response => {
        this.setState({
          maxHangoutValue: response.data.maxPlans,
          daysInAdvanceValue: response.data.minNotice,
          friends: response.data.friends,
          requestsSent: response.data.requestsSent,
          requestsRecieved: response.data.requestsRecieved
        })
      })
      .catch(err => {
        alert(err)
      })
    }
  }

  handleDaysChange = (e) => {
    let { value } = e.target;
    value = parseInt(value);

    if (isNaN(value)) {
        value = 1;
    } else if (value < 1) {
        value = 1;
    }
    this.setState({daysInAdvanceValue: value});
  }
    
  handleMaxPlansChange = (e) => {
    let { value } = e.target;
    value = parseInt(value);

    if (isNaN(value)) {
        value = 1;
    } else if (value < 1) {
        value = 1;
    }
    this.setState({maxHangoutValue: value});
  }


  handleSubmit = (e) => {
    e.preventDefault()
    if(auth.currentUser.email) {
      var response = {
        email: auth.currentUser.email,
        maxPlans: this.state.maxHangoutValue,
        minNotice: this.state.daysInAdvanceValue
      };
      axios.post(editSettingsUrl, response, {headers: {'Content-Type': 'application/json'}})
      .then(data => alert("successfully updated your profile settings"))
      .catch(err => alert(err));
    }
  }

  render() {
    return (
      <div>
      <h2>Welcome to your profile page: {auth.currentUser.email}</h2>
      <form onSubmit={this.handleSubmit}>
        <div>
          <label htmlFor="maxHangoutValue">Up to how many plans would you want to receive? :</label>
          <input
            type="number"
            id="maxHangoutValue"
            name="maxHangoutValue"
            value={this.state.maxHangoutValue}
            onChange={this.handleMaxPlansChange}
          />
        </div>
        <div>
          <label htmlFor="daysInAdvance">What's the minimum number of days you want to receive a plan's notice? </label>
          <input
            type="number"
            id="daysInAdvance"
            name="daysInAdvance"
            value={this.state.daysInAdvanceValue}
            onChange={this.handleDaysChange}
          />
        </div>
        <button className="rectangle-button blue" type="submit">Submit</button>
      </form>
      <div>
        <h3> Friends </h3>
        <ul>
        {
          this.state.friends.map(friend => {
            return <div> {friend} <button type='button'> delete friend </button> </div>
          })
        }
        </ul>
        <h3>Pending Friend Requests</h3>
        <ul>
        {
          this.state.requestsRecieved.map(friend => {
              return <div> {friend} <button type='button'> accept </button> <button type='button'> decline </button> </div>
          })
        }
        </ul>
        <h3> Sent Friend Requests</h3>
        <ul>
        {
          this.state.requestsSent.map(friend => {
              return <li>{friend}</li>
          })
        }
        </ul>
      </div>
      </div>
    );
  }
}

function Profile() {
    return (
      <SettingsForm></SettingsForm>
    );
}

export default Profile;
    