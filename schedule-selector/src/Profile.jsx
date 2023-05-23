import axios from 'axios';
import React, { useState } from 'react';
import { getAuth} from "firebase/auth";

const url='http://127.0.0.1:5001/friendstomeet-155ac/us-central1/editSettings'

const Form = () => {
  const [maxHangoutValue, setMaxHangoutValue] = useState(1);
  const [daysInAdvanceValue, setDaysInAdvanceValue] = useState(1);

  const handleNumberChange = (e) => {
    let { value } = e.target;
    value = parseInt(value);

    if (isNaN(value)) {
      value = 1;
    } else if (value < 1) {
      value = 1;
    }

    setMaxHangoutValue(value);
  };

  const handleNumberIncrement = () => {
    setMaxHangoutValue((prevValue) => prevValue + 1);
  };

  const handleNumberDecrement = () => {
    if (maxHangoutValue > 1) {
      setMaxHangoutValue((prevValue) => prevValue - 1);
    }
  };

  const handleDaysChange = (e) => {
    let { value } = e.target;
    value = parseInt(value);

    if (isNaN(value)) {
        value = 1;
    } else if (value < 1) {
        value = 1;
    }

    setDaysInAdvanceValue(value);
  }

  const handleDaysIncrement = () => {
    setDaysInAdvanceValue((prevValue) => prevValue + 1);
  };

  const handleDaysDecrement = () => {
    if (daysInAdvanceValue > 1) {
      setDaysInAdvanceValue((prevValue) => prevValue - 1);
    }
  };

  const combine = (t1, t2) => {
    if(t1['month'] !== t2['month'])
        return null;
    if(t1.day !== t2.day)
        return null;
    if(t1.endTime === t2.startTime)
        return {
            'month': t1.month,
            'day': t1.day,
            'dayOfWeek': t1.dayOfWeek,
            'startTime' : t1.startTime,
            'duration' : t1.duration + t2.duration,
            'endTime' : t2.endTime,
            'startTimeMinutes' : t1.startTimeMinutes,
            'endTimeMinutes' : t2.endTimeMinutes
        };
    else
        return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();


    // Handle form submission
    console.log('Number Value:', maxHangoutValue);
    console.log('Days In Advance:', daysInAdvanceValue);

    var res = {
      email: getAuth().currentUser.email,
      maxPlans: maxHangoutValue,
      minNotice: daysInAdvanceValue
    };
    axios.post(url, res, {headers: {'Content-Type': 'application/json'}})
    .then(data => alert("successfully updated your profile settings"))
    .catch(err => alert(err))

    // Reset form
    setMaxHangoutValue(1);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="maxHangoutValue">Up to how many plans would you want to receive? :</label>
        <input
          type="number"
          id="maxHangoutValue"
          name="maxHangoutValue"
          value={maxHangoutValue}
          onChange={handleNumberChange}
        />
      </div>
      <div>
        <label htmlFor="daysInAdvance">What's the minimum number of days you want to receive a plan's notice? </label>
        <input
          type="number"
          id="daysInAdvance"
          name="daysInAdvance"
          value={daysInAdvanceValue}
          onChange={handleDaysChange}
        />
      </div>
      <button className="rectangle-button blue" type="submit">Submit</button>
    </form>
  );
};

function Profile() {
    return (
      <Form></Form>
        
    );
}

export default Profile;
