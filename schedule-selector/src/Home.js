import ScheduleSelector from 'react-schedule-selector'
import './App.css';
import React from 'react';
import TimeInput from './TimeInput';
import DateInput from './DateInput';
import './DaysofWeek.css'
import { getAuth} from "firebase/auth";
import firebase from 'firebase/compat/app';
import getFirebaseConfig from './firebase-config';

import logo from './logo.png'; // Tell webpack this JS file uses this image
import axios from 'axios';

const config = getFirebaseConfig;
const firebaseApp = firebase.initializeApp(config);
const auth = getAuth(firebaseApp);

const editCalendarUrl='https://editavailabilityforuser-7g4ibqksta-uc.a.run.app'

const getCalendarUrl='https://getavailabilityforuser-7g4ibqksta-uc.a.run.app'

const currentDate = new Date();
const currentDayOfWeek = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)

const daysToSunday = currentDayOfWeek === 0 ? 7 : currentDayOfWeek; // Calculate the number of days from the current day to the previous Sunday
const previousSunday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - daysToSunday);

const previousSundayString = previousSunday.toLocaleDateString('en-US');


class Home extends React.Component {
  state = { schedule : [], start : 8, end: 22, date : previousSunday}

  componentDidMount() {
    if(auth.currentUser.email) {
      axios.get(getCalendarUrl, { params: { email: auth.currentUser.email } })
      .then(response => {
        this.setState({
          schedule : response.data.calendar
        })
      })
      .catch(err => {
        alert(err)
      })
    }
  }

  handleDateChange = (date) => {
    // Perform any necessary actions with the updated date
    this.setState({ date: date})
  };

  handleTimeSubmit = (startTime, endTime) => {
    this.setState({ start: startTime})
    this.setState({ end: endTime})
  };
  
  onSubmitAvailabilityClick = () => {
    const email = auth.currentUser.email
    if(email && this.state.schedule) {
      axios.post(editCalendarUrl, {email: email,'calendar': this.state.schedule}, {headers: {'Content-Type': 'application/json'}})
      .then(data => alert("successfully updated your availability"))
      .catch(err => alert(err))
    }
  }
  
  
  handleChange = newSchedule => {
    this.setState({ schedule: newSchedule })
  }

  // Add min time and max time as settings for user
  
  render() {
    return (
      <div >
        
        <div style={{ marginLeft:'2%', marginRight:'2%', borderTop: '1px solid black', width: '95%', display: 'flex', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '22px' }}>Enter times you would be willing to hang out below:</p>
          <div style={{ marginTop: '20px' }}>
          
          <button className="rectangle-button blue" type="button" onClick={this.onSubmitAvailabilityClick}>Submit Availability</button>
          </div>
          
        </div>
        <div style={{marginLeft:'2%', marginRight:'2%',}}><p><DateInput initialDate={previousSundayString} onDateChange={this.handleDateChange} /></p></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        </div>       
        <div className="container">
      <div style={{marginLeft: '5%', marginRight: '3%'}} className="text-container">
        <p className="scaling-text">Sunday</p>
        <p className="scaling-text">Monday</p>
        <p className="scaling-text">Tuesday</p>
        <p className="scaling-text">Wednesday</p>
        <p className="scaling-text">Thursday</p>
        <p className="scaling-text">Friday</p>
        <p className="scaling-text">Saturday</p>
      </div>
    </div>
    <div style={{marginLeft: '3%', marginRight: '3%'}}>
        <ScheduleSelector
        selection={this.state.schedule}
        numDays={7}
        minTime={this.state.start}
        maxTime={this.state.end}
        startDate={this.state.date}
        hourlyChunks={2}
        onChange={this.handleChange} />
        <p><TimeInput onSubmit={this.handleTimeSubmit}/></p>
        </div>
      </div>
    )
  }
}

export default Home;