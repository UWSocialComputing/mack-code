import axios from 'axios';
import React, { useState } from 'react';

const url='https://getplans-7g4ibqksta-uc.a.run.app/'

const Form = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [maxHangoutValue, setMaxHangoutValue] = useState(1);
  const [daysInAdvanceValue, setDaysInAdvanceValue] = useState(1);
  const [phoneNumberError, setPhoneNumberError] = useState('');

  const handlePhoneNumberChange = (e) => {
    const { value } = e.target;
    setPhoneNumber(value);
  };

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

    if (!phoneNumber) {
      setPhoneNumberError('Please enter your phone number.');
      return;
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      setPhoneNumberError('Please enter a valid 10-digit phone number.');
      return;
    }

    // Handle form submission
    console.log('Phone Number:', phoneNumber);
    console.log('Number Value:', maxHangoutValue);
    console.log('Days In Advance:', daysInAdvanceValue);

    var res = {
        phoneNum: phoneNumber,
        maxHangouts: maxHangoutValue,
        daysInAdvance: daysInAdvanceValue
    };

    axios.post(url, res, {headers: {'Content-Type': 'application/json'}})
    .then(data => alert("successfully updated your profile settings"))
    .catch(err => alert(err))

    // Reset form
    setPhoneNumber('');
    setMaxHangoutValue(1);
    setPhoneNumberError('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="phoneNumber">What is your Phone Number:</label>
        <input
          type="text"
          id="phoneNumber"
          name="phoneNumber"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
        />
        {phoneNumberError && <p>{phoneNumberError}</p>}
      </div>

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
