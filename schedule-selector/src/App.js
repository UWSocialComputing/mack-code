import ScheduleSelector from 'react-schedule-selector'
import './App.css';
import React from 'react';
import axios from 'axios'
/*
axios.post(url, {calendar: newSchedule}, {
  headers: {'Content-Type': 'application/json'}})
.then(data => alert(data))
.catch(err => alert(err))
*/

const url='http://127.0.0.1:5001/friendstomeet-155ac/us-central1/getPlans'

class App extends React.Component {
  state = { schedule : [], phoneNum : '', maxHangouts : '', daysInAdvance : ''}

  handleScheduleChange = newSchedule => {
    this.setState({ schedule: newSchedule })
  }

  handleClick() {
    axios.post(url, {calendar: this.state.schedule, phoneNum : this.state.phoneNum, maxHangouts : this.state.maxHangouts, daysInAdvance : this.state.daysInAdvance}, {
      headers: {'Content-Type': 'application/json'}})
    .then(data => alert(data))
    .catch(err => alert(err))
  }


  render() {
    return (
      <div>
      <h> Friends2Meet</h>
      <ScheduleSelector
        selection={this.state.schedule}
        numDays={14}
        minTime={8}
        maxTime={22}
        hourlyChunks={2}
        onChange={this.handleScheduleChange}
      />
      <body> Enter your phone number:</body> 
      <input
          id = "phone"
          label = "phone"
          type="text"
          value={this.state.phoneNum}
          onChange={e => this.setState({phoneNum: e.target.value})}
        />
        <body> Enter the number of plans you would like to be notified of:</body>
        <input
            id = "numnotif"
            label = "numnotif"
            type="text"
            value={this.state.maxHangouts}
            onChange={e => this.setState({maxHangouts: e.target.value})}
         />
      <body> Enter number of days in advance you would like to be notified: </body>
      <input
            id = "daysnotif"
            label = "daysnotif"
            type="text"
            value={this.state.daysInAdvance}
            onChange={e => this.setState({daysInAdvance: e.target.value})}
         />
         <br></br>
         <button onClick={this.handleClick.bind(this)}>
          Save
        </button>ç
      </div>
    )
  }
}

export default App;
