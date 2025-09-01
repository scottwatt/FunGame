import React from 'react';

function Input({ placeholder, value, onChange, maxLength, className = '', ...props }) {
  return (
    <input
      type="text"
      className={`input ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      {...props}
    />
  );
}

export default Input;