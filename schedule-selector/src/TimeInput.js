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
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Start Time:</label>
          <input type="number" min="0" max="23" value={startTime} onChange={handleStartTimeChange} />
        </div>
        <div>
          <label>End Time:</label>
          <input type="number" min="0" max="23" value={endTime} onChange={handleEndTimeChange} />
        </div>
        <button className="rectangle-button blue" type="submit">Update</button>
      </form>
    </div>
  );
};

export default TimeInput;
