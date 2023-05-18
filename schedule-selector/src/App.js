import ScheduleSelector from 'react-schedule-selector'
import './App.css';
import React from 'react';
import Form from './Form';

class App extends React.Component {
  state = { schedule : [], phoneNum : '', maxHangouts : '', daysInAdvance : ''}

  handleChange = newSchedule => {
    this.setState({ schedule: newSchedule })
  }

  // Add min time and max time as settings for user

  render() {
    return (
      <div><ScheduleSelector
        selection={this.state.schedule}
        numDays={7}
        minTime={8}
        maxTime={22}
        hourlyChunks={2}
        onChange={this.handleChange} />
        <Form schedule={this.state.schedule} />
      </div>
    )
  }
}

export default App;
