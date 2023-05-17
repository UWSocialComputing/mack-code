import axios from 'axios';
import React, { useState } from 'react';

const url='http://127.0.0.1:5001/friendstomeet-155ac/us-central1/getPlans'

const Form = ({schedule}) => {
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
            'endTime' : t2.endTime
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

    schedule.sort();
    const convertedArray = [];
    for(var i = 0; i < schedule.length; i++){
        var date = schedule[i];
        const month = date.getMonth() + 1; // Adding 1 to get 1-indexed month
        const day = date.getDate();
        const dayOfWeek = date.getDay(); // Returns 0 (Sunday) to 6 (Saturday)
        const startTime = `${date.getHours()}:${date.getMinutes()}`;
        const duration = 30;
        const endDate = new Date(date.getTime() + duration*60000);
        const endTime = `${endDate.getHours()}:${endDate.getMinutes()}`;
        convertedArray.push ( {
            'month': month,
            'day': day,
            'dayOfWeek': dayOfWeek,
            'startTime' : startTime,
            'duration' : duration,
            'endTime' : endTime
        });
    }
    convertedArray.sort(function(x, y) {
        if(x.month < y.month) {
            return -1;
        } else if (x.month > y.month) {
            return 1;
        }
        if(x.day < y.day) {
            return -1;
        } else if (x.day > y.day) {
            return 1;
        }
        if(x.startTime < y.startTime) {
            return -1;
        } else if (y.startTime > x.startTime) {
            return 1;
        }
        return 0;
    });
    console.log(convertedArray);
    var t1  = convertedArray[0];
    var t2 = convertedArray[1];
    var c = null;
    var combinedArray = [];
    for(i = 1; i < convertedArray.length; i++) {
        t2 = convertedArray[i];
        c = combine(t1, t2);
        if(c == null) {
            combinedArray.push(t1);
            t1 = convertedArray[i];
        } else {
            t1 = c;
        }
    }
    combinedArray.push(t1);
    console.log(combinedArray);
    combinedArray.sort(function(x, y) {
        if(x.duration > y.duration) {
          return -1;
        } else if (x.duration < y.duration) {
          return 1;
        }
        return 0;
    });
    
    var res = {
        calendar: combinedArray,
        phoneNum: phoneNumber,
        maxHangouts: maxHangoutValue,
        daysInAdvance: daysInAdvanceValue
    };

    axios.post(url, res, {headers: {'Content-Type': 'application/json'}})
    .then(data => alert("successfully sent your availability! get excited for some fun plans coming your way!"))
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
        <button type="button" onClick={handleNumberIncrement}>
          +
        </button>
        <button type="button" onClick={handleNumberDecrement}>
          -
        </button>
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
        <button type="button" onClick={handleDaysIncrement}>
          +
        </button>
        <button type="button" onClick={handleDaysDecrement}>
          -
        </button>
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default Form;
