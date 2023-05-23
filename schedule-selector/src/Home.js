import ScheduleSelector from 'react-schedule-selector'
import './App.css';
import React from 'react';
import TimeInput from './TimeInput';
import DateInput from './DateInput';
import './DaysofWeek.css'
import logo from './logo.png'; // Tell webpack this JS file uses this image
import axios from 'axios';

const config = getFirebaseConfig;
const firebaseApp = firebase.initializeApp(config);
const auth = getAuth(firebaseApp);

const editCalendarUrl='http://127.0.0.1:5001/friendstomeet-155ac/us-central1/editAvailabilityForUser'

const getCalendarUrl='http://127.0.0.1:5001/friendstomeet-155ac/us-central1/getAvailabilityForUser'

class Home extends React.Component {
  state = { schedule : [], start : 8, end: 22, date : '5/21/23'}

  componentDidMount() {
    if(auth.currentUser.email) {
      axios.get(getCalendarUrl, { params: { email: auth.currentUser.email } })
      .then(response => {
        this.setState({
          schedule : response.data.schedule
        })
      })
      .catch(err => {
        alert(err)
      })
    }
  }

  handleDateChange = (date) => {
    // Perform any necessary actions with the updated date
    console.log('Updated date:', date);
    this.setState({ date: date})
  };

  handleTimeSubmit = (startTime, endTime) => {
    this.setState({ start: startTime})
    this.setState({ end: endTime})
  };
  
  onSubmitAvailabilityClick = (e) => {
    axios.post(editCalendarUrl, {'calendar': this.state.get('schedule')}, {headers: {'Content-Type': 'application/json'}})
    .then(data => alert("successfully updated your availability"))
    .catch(err => alert(err))
  }
  
  
  handleChange = newSchedule => {
    this.setState({ schedule: newSchedule })
  }

  // Add min time and max time as settings for user
  
  render() {
    return (
      <div>
        <DateInput initialDate="2023-05-21" onDateChange={this.handleDateChange} />
        <div className="container">
      <div className="text-container">
        <p className="scaling-text">Sunday</p>
        <p className="scaling-text">Monday</p>
        <p className="scaling-text">Tuesday</p>
        <p className="scaling-text">Wednesday</p>
        <p className="scaling-text">Thursday</p>
        <p className="scaling-text">Friday</p>
        <p className="scaling-text">Saturday</p>
      </div>
    </div>
        {/* <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Sunda</span>
        <span style={{letterSpacing: 205}}>y</span>
        <span>Monda</span>
        <span style={{letterSpacing: 195}}>y</span>
        <span>Tuesda</span>
        <span style={{letterSpacing: 190}}>y</span>
        <span>Wednesda</span>
        <span style={{letterSpacing: 180}}>y</span>
        <span>Thursda</span>
        <span style={{letterSpacing: 200}}>y</span>
        <span>Frida</span>
        <span style={{letterSpacing: 200}}>y</span>
        <span>Saturday</span> */}
        <ScheduleSelector
        selection={this.state.schedule}
        numDays={7}
        minTime={this.state.start}
        maxTime={this.state.end}
        startDate={this.state.date}
        hourlyChunks={2}
        onChange={this.handleChange} />
        <button className="rectangle-button blue" type="submit" onclick={this.onSubmitAvailabilityClick}>Submit Availability</button>
        <TimeInput onSubmit={this.handleTimeSubmit}/>
      </div>
    )
  }
}

export default Home;
