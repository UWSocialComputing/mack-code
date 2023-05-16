import ScheduleSelector from 'react-schedule-selector'
import './App.css';
import React from 'react';
import axios from 'axios'

const url='http://127.0.0.1:5001/friendstomeet-155ac/us-central1/getPlans'


class App extends React.Component {
  state = { schedule : [] }

  handleChange = newSchedule => {
    this.setState({ schedule: newSchedule })
    axios.post(url, {calendar: newSchedule}, {
      headers: {'Content-Type': 'application/json'}})
    .then(data => alert(data))
    .catch(err => alert(err))
  }



  render() {
    return (
      <ScheduleSelector
        selection={this.state.schedule}
        numDays={14}
        minTime={8}
        maxTime={22}
        hourlyChunks={2}
        onChange={this.handleChange}
      />
    )
  }
}

export default App;
