import ScheduleSelector from 'react-schedule-selector'
import './App.css';
import React from 'react';
import Form from './Form';

class App extends React.Component {
  state = { schedule : [] }

  handleChange = newSchedule => {
    this.setState({ schedule: newSchedule })
  }

  render() {
    return (
      <><ScheduleSelector
        selection={this.state.schedule}
        numDays={14}
        minTime={8}
        maxTime={22}
        hourlyChunks={2}
        onChange={this.handleChange} />
        <div>
          <Form schedule={this.state.schedule} />
        </div>
      </>
    )
  }
}

export default App;
