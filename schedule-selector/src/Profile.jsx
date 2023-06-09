import React, { Component } from 'react';
import SearchBar from './SearchBar';
import axios from 'axios';
import { getAuth} from "firebase/auth";
import firebase from 'firebase/compat/app';
import getFirebaseConfig from './firebase-config';
import './index.css'
import './Profile.css'
import './LoginForm.css'

const editSettingsUrl='https://editsettings-7g4ibqksta-uc.a.run.app'

const getUserInfoUrl='https://getuserinfo-7g4ibqksta-uc.a.run.app'

const addOrDeleteFriendUrl = 'https://addordeletefriend-7g4ibqksta-uc.a.run.app'

const deleteRequestUrl = 'https://deleterequest-7g4ibqksta-uc.a.run.app'

const config = getFirebaseConfig;
const firebaseApp = firebase.initializeApp(config);
const auth = getAuth(firebaseApp);

class SettingsForm extends Component {
  constructor(props) {
    super(props);
    this.state = { daysInAdvanceValue: 0, friends: [], requestsSent: [], requestsRecieved: []};
  }
  
  componentDidMount() {
    if(auth.currentUser.email) {
      axios.get(getUserInfoUrl, { params: { email: auth.currentUser.email } })
      .then(response => {
        this.setState({
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

  componentDidUpdate() {
    if(auth.currentUser.email) {
      axios.get(getUserInfoUrl, { params: { email: auth.currentUser.email } })
      .then(response => {
        this.setState({
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

  addFriend = (friend) => {
    if(auth.currentUser.email) {
      const request = {
        email: auth.currentUser.email,
        newFriend: friend,
        operation: 'add'
      };
      axios.post(addOrDeleteFriendUrl, request, {headers: {'Content-Type': 'application/json'}})
        .then(
          this.declineRequest(friend)
        )
        .catch(err => alert(err));
    }
  }

  deleteFriend = (friend) => {
    if(auth.currentUser.email) {
      const request = {
        email: auth.currentUser.email,
        newFriend: friend,
        operation: 'delete'
      };
      axios.post(addOrDeleteFriendUrl, request, {headers: {'Content-Type': 'application/json'}})
        .then()
        .catch(err => alert(err));
    }
  }

  declineRequest = (friend) => {
    if(auth.currentUser.email) {
      const request = {
        email: auth.currentUser.email,
        newRequest: friend,
      };
      axios.post(deleteRequestUrl, request, {headers: {'Content-Type': 'application/json'}})
        .then()
        .catch(err => alert(err));
    }
  }

  handleDaysChange = (e) => {
    let { value } = e.target;
    value = parseInt(value);

    if (isNaN(value)) {
        value = 0;
    } else if (value < 0) {
        value = 0;
    }
    this.setState({daysInAdvanceValue: value});
  }
    


  handleSubmit = (e) => {
    e.preventDefault()
    if(auth.currentUser.email) {
      const request = {
        email: auth.currentUser.email,
        minNotice: this.state.daysInAdvanceValue
      };
      axios.post(editSettingsUrl, request, {headers: {'Content-Type': 'application/json'}})
      .then()
      .catch(err => alert(err));
      axios.get(getUserInfoUrl, { params: { email: auth.currentUser.email } })
        .then(response => {
          this.setState({
            daysInAdvanceValue: response.data.minNotice,
          })
        })
        .catch(err => {
          alert(err)
        })
    }
  }

  render() {
    return (
      <div>
      <div style={{marginLeft:'2%', marginRight:'2%', borderTop: '1px solid black', width: '95%', display: 'flex', justifyContent: 'space-between' }}></div>
      <div style={{marginLeft: '2%'}}><p>
      <h2>Welcome to your profile page: {auth.currentUser.email}</h2>
      <form onSubmit={this.handleSubmit}>
        <div>
          <label htmlFor="daysInAdvance">What's the minimum number of days in advance you want to be notified about a plan? </label>
          <input
            type="number"
            id="daysInAdvance"
            name="daysInAdvance"
            value={this.state.daysInAdvanceValue}
            style={{ width: '50px' }}
            onChange={this.handleDaysChange}
          />
        </div>
        <button className="rectangle-button blue" type="submit">Submit</button>
      </form>
      </p>
      </div>
      <div>
        <div className="columns-container" >
        <div className="column">
        <p style={{ fontSize: '25px'}}>Pending Friend Requests</p>
        <ul><p>
        {
          this.state.requestsRecieved.map(friend => {
              return <div> {friend} <button className="accept-button" type='button' onClick={() => this.addFriend(friend)}> accept </button> <button className="decline-button" type='button' onClick={() => this.declineRequest(friend)}> decline </button> </div>
          })
        }
        </p>
        </ul>
        <p style={{ fontSize: '25px'}}>Sent Friend Requests</p>
        <ul>
        <p>
        {
          this.state.requestsSent.map(friend => {
              return <div> {friend} <button className="delete-button" type='button' onClick={() => this.declineRequest(friend)}> delete </button> </div>
          })
        }
        </p>
        </ul>
        </div>
        <div className="column-wide">
        <p style={{ fontSize: '25px'}}>My Friends </p>
        <ul><p>
        {
          this.state.friends.map(friend => {
            return <div> {friend} <button className="delete-button" type='button' onClick={() => this.deleteFriend(friend)}> delete </button> </div>
          })
        }
        </p>
        </ul>
        </div>
        <div className='column-right'>
        <SearchBar friends={this.state.friends} requestsSent={this.state.requestsSent} requestsRecieved={this.state.requestsRecieved}></SearchBar>

        </div>
      </div>
      </div>
      </div>
    );
  }
}

function Profile() {
  if(auth.currentUser) {
    return (
      <SettingsForm></SettingsForm>
    );
  } else {
    return <h2> you are not signed in</h2>
  }
}

export default Profile;
    