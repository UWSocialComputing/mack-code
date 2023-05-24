import React, { Component } from 'react';
import SearchBar from './SearchBar';
import axios from 'axios';
import { getAuth} from "firebase/auth";
import firebase from 'firebase/compat/app';
import getFirebaseConfig from './firebase-config';

const editSettingsUrl='https://editsettings-7g4ibqksta-uc.a.run.app'

const getSettingsUrl='https://getsettingsforuser-7g4ibqksta-uc.a.run.app'

const config = getFirebaseConfig;
const firebaseApp = firebase.initializeApp(config);
const auth = getAuth(firebaseApp);

class SettingsForm extends Component {
  constructor(props) {
    super(props);
    this.state = { maxHangoutValue: 1, daysInAdvanceValue: 1};
  }
  
  componentDidMount() {
    if(auth.currentUser.email) {
      axios.get(getSettingsUrl, { params: { email: auth.currentUser.email } })
      .then(response => {
        this.setState({
          maxHangoutValue: response.data.maxPlans,
          daysInAdvanceValue: response.data.minNotice 
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
      <h1>Welcome to your profile page: {auth.currentUser.email}</h1>
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
      </div>
    );
  }
}

function Profile() {
    return (
      <>
        <SettingsForm></SettingsForm>
        <SearchBar></SearchBar>
      </>
    );
}

export default Profile;
    