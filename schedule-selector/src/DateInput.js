import React, { useState } from 'react';
import './DateInput.css';

const DateInput = ({ initialDate, onDateChange }) => {
  const [startDate, setStartDate] = useState(initialDate);

  const handleBackward = () => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() - 7);
    setStartDate(newDate.toISOString().split('T')[0]);
    onDateChange(newDate.toISOString().split('T')[0]);
  };

  const handleForward = () => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + 7);
    setStartDate(newDate.toISOString().split('T')[0]);
    onDateChange(newDate.toISOString().split('T')[0]);
  };

  return (
    <div style={{ fontSize: '22px' }}>
      <button style={{ fontSize: '22px' }} className="circle-button clear" onClick={handleBackward}>&lt;</button>
      <span>{startDate}</span>
      <button style={{ fontSize: '22px' }} className="circle-button clear" onClick={handleForward}>&gt;</button>
    </div>
  );
};

export default DateInput;
