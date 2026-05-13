import React from 'react';

const Card = ({ children, className = '', hoverEffect = false }) => {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden ${
      hoverEffect ? 'transition-all duration-300 hover:shadow-md hover:-translate-y-1' : ''
    } ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-50 ${className}`}>{children}</div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 bg-gray-50 border-t border-gray-50 ${className}`}>{children}</div>
);

export default Card;
