import React from 'react';
import { Banknote } from 'lucide-react';

const Schemes: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Schemes</h1>
      </div>
      
      <div className="card flex flex-col items-center justify-center py-12">
        <Banknote className="h-16 w-16 text-slate-400" />
        <h2 className="mt-4 text-xl font-semibold text-slate-700">Scheme Management</h2>
        <p className="mt-2 text-slate-500 text-center max-w-md">
          This is a placeholder for the Schemes management page. 
          In a production app, this would display promotional schemes, incentive programs, and related features.
        </p>
      </div>
    </div>
  );
};

export default Schemes;