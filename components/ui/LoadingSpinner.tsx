import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center space-x-2">
    <div className="w-5 h-5 border-2 border-medical-200 border-t-medical-600 rounded-full animate-spin"></div>
    <span className="text-sm text-slate-500 font-medium">Processing...</span>
  </div>
);
