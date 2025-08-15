import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`inline-block ${sizes[size]} ${className}`}>
      <div className="spinner"></div>
    </div>
  );
};

const LoadingCard = ({ className = '' }) => {
  return (
    <div className={`brutal-card p-6 animate-pulse ${className}`}>
      <div className="space-y-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 dark:bg-gray-600"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 w-5/6"></div>
        </div>
        <div className="h-8 bg-gray-300 dark:bg-gray-600 w-1/4"></div>
      </div>
    </div>
  );
};

const LoadingPage = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-gray-600 dark:text-gray-400 text-lg">
        {message}
      </p>
    </div>
  );
};

export { LoadingSpinner, LoadingCard, LoadingPage };
export default LoadingSpinner;
