import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-card p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
            <AlertTriangle size={32} />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-800 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Page not found</h2>
        
        <p className="text-slate-600 mb-6">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </p>
        
        <Link 
          to="/dashboard"
          className="btn-primary w-full"
        >
          Go to Dashboard
        </Link>
        
        <Link 
          to="/login"
          className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
        >
          Return to Login
        </Link>
      </div>
    </div>
  );
};

export default NotFound;