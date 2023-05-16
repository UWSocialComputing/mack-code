import ScheduleSelector from 'react-schedule-selector'
import './App.css';
import React from 'react';
import axios from 'axios'

const url='http://127.0.0.1:5001/friendstomeet-155ac/us-central1/getPlans'

function SaveButton() {
  function handleClick() {
    alert('You clicked me!');
  }

  return (
    <button onClick={handleClick}>
      Save
    </button>
  );
}

function PhoneButton() {
  function handleClick() {
    alert('You clicked me!');
  }

  return (
    <button onClick={handleClick}>
      Save
    </button>
  );
}

function NumNotifButton() {
  function handleClick() {
    alert('You clicked me!');
  }

  return (
    <button onClick={handleClick}>
      Save
    </button>
  );
}

function DaysNotifButton() {
  function handleClick() {
    alert('You clicked me!');
  }

  return (
    <button onClick={handleClick}>
      Save
    </button>
  );
}

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
      <div>
      <h> Friends2Meet</h>
      <ScheduleSelector
        selection={this.state.schedule}
        numDays={14}
        minTime={8}
        maxTime={22}
        hourlyChunks={2}
        onChange={this.handleChange}
      />
      <SaveButton />
      <body> Enter your phone number: </body>
      <input
            id = "phone"
            label = "phone"
            type="text"
            value={this.state.value}
         />
      <PhoneButton />
      <body> Enter number of times you would like to be notified of a hangout: </body>
      <input
            id = "numnotif"
            label = "numnotif"
            type="text"
            value={this.state.value}
         />
      <NumNotifButton />
      <body> Enter number of days in advance you would like to be notified: </body>
      <input
            id = "daysnotif"
            label = "daysnotif"
            type="text"
            value={this.state.value}
         />
      <DaysNotifButton />
      </div>
    )
  }
}

export default App;
