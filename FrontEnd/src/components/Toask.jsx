// components/Toast.jsx
import React from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  const baseStyle = 'fixed top-5 right-5 z-50 px-4 py-3 rounded shadow-lg text-white animate-fade-in-up';
  const typeStyle = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  };

  return (
    <div className={`${baseStyle} ${typeStyle[type]}`}>
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button className="ml-4 text-white font-bold" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
