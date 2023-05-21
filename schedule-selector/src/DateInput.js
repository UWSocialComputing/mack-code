import React, { useState } from 'react';
import './DateInput.css';

const DateInput = ({ initialDate, onDateChange }) => {
  const [startDate, setStartDate] = useState(initialDate);

  const handleBackward = () => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() - 1);
    setStartDate(newDate.toISOString().split('T')[0]);
    onDateChange(newDate.toISOString().split('T')[0]);
  };

  const handleForward = () => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + 1);
    setStartDate(newDate.toISOString().split('T')[0]);
    onDateChange(newDate.toISOString().split('T')[0]);
  };

  return (
    <div>
      <button className="circle-button blue" onClick={handleBackward}>&lt;</button>
      <span>{startDate}</span>
      <button className="circle-button blue" onClick={handleForward}>&gt;</button>
    </div>
  );
};

export default DateInput;
