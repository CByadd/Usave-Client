'use client';

import React, { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (onClose && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, duration]);

  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-[#0B4866] text-white'
  };

  return (
    <div
      className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${typeStyles[type]} animate-in slide-in-from-top-5 transition-all duration-300`}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 text-white hover:text-gray-200 font-bold text-lg leading-none"
        >
          ×
        </button>
      )}
    </div>
  );
}

