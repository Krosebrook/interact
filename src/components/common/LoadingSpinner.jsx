import React from 'react';

export default function LoadingSpinner({ className = '', size = 'default' }) {
  const sizeClasses = {
    small: 'h-6 w-6',
    default: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-int-orange ${sizeClasses[size]}`} />
    </div>
  );
}