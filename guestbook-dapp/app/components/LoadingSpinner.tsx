import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#cde2eb]"></div>
    </div>  
    );
};

export default LoadingSpinner;