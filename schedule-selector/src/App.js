import ScheduleSelector from 'react-schedule-selector'
import './App.css';
import React from 'react';
import axios from 'axios'

const url='http://127.0.0.1:5001/friendstomeet-155ac/us-central1/getPlans'

class PlanInterval {
  constructor ({startDate, duration}) {
    this.startDate = new Date(startDate);
    this.duration = Number(duration);
    this.endDate = new Date(+this.startDate + this.duration * 60e3)
    this.__type = 'PlanInterval'
  }

  // Return new bigger plan interval, or make current plan bigger
  combine(planInterval) {
    // if(planInterval.startDate == this.endDate) {
    //   return new PlanInterval(this.startDate, this.duration + planInterval.duration);
    // } else if (planInterval.endDate == this.startDate) {
    //   return new PlanInterval(planInterval.startDate, this.duration + planInterval.duration);
    // }
    // OR
    if(planInterval.startDate == this.endDate) {
      this.endDate = planInterval.endDate;
      this.duration += planInterval.duration;
      return true;
    } else if (planInterval.endDate == this.startDate) {
      this.startDate = planInterval.startDate;
      this.duration += planInterval.duration;
      return true;
    }
    return false;
  }
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

  // Create array of times sorted by longest duration
  planArray = state => {
    plans = [];
    var p = new PlanInterval(schedule[0], 30);
    for(var i = 0; i < state.schedule.length; i++) {
      if(!p.combine(new PlanInterval(state.schedule[i], 30))) { 
        // Separate plans when there is a gap
        plans.add(p);
        p = new PlanInterval(state.schedule[i], 30);
      }
    }
    plans.add(p);
    plans.sort(function(x, y) {
      if(x.duration > y.duration) {
        return -1;
      } else if (x.duration < y.duration) {
        return 1;
      }
      return 0;
    })
  }

  // Turn into JSON Format

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
