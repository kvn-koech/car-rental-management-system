import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${
          error ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
        }`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
};

export default Input;
