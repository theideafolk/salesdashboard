// ErrorDisplay.tsx
// Component for displaying error messages

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  retry: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, retry }) => (
  <div className="animate-fade-in">
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-slate-800">Area Sales Managers</h1>
    </div>
    
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start text-red-800">
      <AlertCircle className="h-5 w-5 flex-shrink-0 mr-3 mt-0.5" />
      <div>
        <h3 className="text-lg font-medium">Error loading area sales managers</h3>
        <p className="mt-1">{error}</p>
        <button 
          onClick={retry} 
          className="mt-2 text-sm font-medium text-red-700 hover:text-red-900"
        >
          Try again
        </button>
      </div>
    </div>
  </div>
);

export default ErrorDisplay;