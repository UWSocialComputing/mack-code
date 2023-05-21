import ScheduleSelector from 'react-schedule-selector'
import './App.css';
import React from 'react';
import Form from './Form';

class Home extends React.Component {
  state = {schedule : []}

  handleChange = newSchedule => {
    this.setState({ schedule: newSchedule })
  }

  render() {
    return (
      <div>
        <ScheduleSelector
        selection={this.state.schedule}
        numDays={7}
        minTime={8}
        maxTime={22}
        hourlyChunks={2}
        onChange={this.handleChange} />
      </div>
    )
  }
}

export default Home;
