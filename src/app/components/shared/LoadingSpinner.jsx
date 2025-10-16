"use client";
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...', 
  className = '',
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
        {showText && (
          <p className={`${textSizeClasses[size]} text-gray-600`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export const PageLoader = ({ text = 'Loading page...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingSpinner size="xl" text={text} />
  </div>
);

export const CardLoader = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-200"></div>
        <div className="p-4">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

export const ButtonLoader = ({ text = 'Loading...' }) => (
  <div className="flex items-center space-x-2">
    <Loader2 className="w-4 h-4 animate-spin" />
    <span>{text}</span>
  </div>
);

export default LoadingSpinner;









