import React, { Component } from 'react';
import axios from 'axios';
import { getAuth} from "firebase/auth";

const editSettingsUrl='https://editsettings-7g4ibqksta-uc.a.run.app'

const getSettingsUrl='https://getsettingsforuser-7g4ibqksta-uc.a.run.app'

class SettingsForm extends Component {
  constructor(props) {
    super(props)
    this.state = { maxHangoutValue: 1, daysInAdvanceValue: 1}
    axios.get(getSettingsUrl, { params: { email: getAuth().currentUser.email } })
    .then( response => {
      this.state = {
        maxHangoutValue: response.data.maxPlans,
        daysInAdvanceValue: response.data.minNotice 
      }
    })
    .catch(err => {
      alert(err)
    })
  }

  handleChange = (e) => {
    let { name, value } = e.target;
    value = parseInt(value);

    if (isNaN(value)) {
      value = 1;
    } else if (value < 1) {
      value = 1;
    }
    
    this.setState({ [name]: value });
  };


  handleSubmit = (e) => {
    var res = {
      email: getAuth().currentUser.email,
      maxPlans: this.state.maxHangoutValue,
      minNotice: this.state.daysInAdvanceValue
    };
    axios.post(editSettingsUrl, res, {headers: {'Content-Type': 'application/json'}})
    .then(data => alert("successfully updated your profile settings"))
    .catch(err => alert(err))

  };
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <div>
          <label htmlFor="maxHangoutValue">Up to how many plans would you want to receive? :</label>
          <input
            type="number"
            id="maxHangoutValue"
            name="maxHangoutValue"
            value={this.state.maxHangoutValue}
            onChange={this.handleChange}
          />
        </div>
        <div>
          <label htmlFor="daysInAdvance">What's the minimum number of days you want to receive a plan's notice? </label>
          <input
            type="number"
            id="daysInAdvance"
            name="daysInAdvance"
            value={this.state.daysInAdvanceValue}
            onChange={this.handleChange}
          />
        </div>
        <button className="rectangle-button blue" type="submit">Submit</button>
      </form>
    );
  };
}

function Profile() {
    return (
      <SettingsForm></SettingsForm>
    );
}

export default Profile;
