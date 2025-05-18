import React from 'react';
import { Clock } from 'lucide-react';

const WorkHours: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Work Hours</h1>
      </div>
      
      <div className="card flex flex-col items-center justify-center py-12">
        <Clock className="h-16 w-16 text-slate-400" />
        <h2 className="mt-4 text-xl font-semibold text-slate-700">Work Hours Management</h2>
        <p className="mt-2 text-slate-500 text-center max-w-md">
          This is a placeholder for the Work Hours management page. 
          In a production app, this would display schedules, attendance tracking, and time management features.
        </p>
      </div>
    </div>
  );
};

export default WorkHours;