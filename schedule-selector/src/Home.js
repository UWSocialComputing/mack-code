import ScheduleSelector from 'react-schedule-selector'
import './App.css';
import React from 'react';
import TimeInput from './TimeInput';
import DateInput from './DateInput';



import logo from './logo.png'; // Tell webpack this JS file uses this image
console.log(logo); // /logo.84287d09.png


class Home extends React.Component {
  state = { schedule : [], phoneNum : '', maxHangouts : '', daysInAdvance : '', start : 8, end: 22, date : '5/21/23'}

  handleDateChange = (date) => {
    // Perform any necessary actions with the updated date
    console.log('Updated date:', date);
    this.setState({ date: date})
  };

  handleTimeSubmit = (startTime, endTime) => {
    this.setState({ start: startTime})
    this.setState({ end: endTime})
  };
  
  handleChange = newSchedule => {
    this.setState({ schedule: newSchedule })
  }

  // Add min time and max time as settings for user
  
  render() {
    return (
      <div>
        <img style={{ width: 350, height: 75 }} src={logo} alt="Logo" />
        <DateInput initialDate="2023-05-21" onDateChange={this.handleDateChange} />
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Sunda</span>
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
        <span>Saturday</span>
        <ScheduleSelector
        selection={this.state.schedule}
        numDays={7}
        minTime={this.state.start}
        maxTime={this.state.end}
        startDate={this.state.date}
        hourlyChunks={2}
        onChange={this.handleChange} />
        <TimeInput onSubmit={this.handleTimeSubmit}/>
        
      </div>
    )
  }
}

export default Home;
