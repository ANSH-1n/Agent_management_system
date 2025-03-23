import React from 'react';

const Spinner = ({ fullScreen }) => {
  if (fullScreen) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );
};

export default Spinner;