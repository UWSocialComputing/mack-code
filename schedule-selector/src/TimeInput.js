import React, { useState } from 'react';

const TimeInput = ({ onSubmit }) => {
  const [startTime, setStartTime] = useState(8);
  const [endTime, setEndTime] = useState(22);


  const handleStartTimeChange = (event) => {
    const time = Number(event.target.value);
    if (time >= 0 && time <= 23) {
      setStartTime(time);
    }
  };

  const handleEndTimeChange = (event) => {
    const time = Number(event.target.value);
    if (time >= 0 && time <= 23) {
      setEndTime(time);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(startTime, endTime);
  };

  return (
    <div style={{ fontSize: '20px' }}>
      <form onSubmit={handleSubmit}>
          <label>Start Time:</label>
          <input style={{ fontSize: '18px' }} type="number" min="0" max="23" value={startTime} onChange={handleStartTimeChange} />
          <label>End Time:</label>
          <input style={{ fontSize: '18px' }} type="number" min="0" max="23" value={endTime} onChange={handleEndTimeChange} />
        <button className="rectangle-button blue" type="submit">Update</button>
      </form>
    </div>
  );
};

export default TimeInput;
