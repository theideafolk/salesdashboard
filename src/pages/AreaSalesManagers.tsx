import React from 'react';
import { UserCircle } from 'lucide-react';

const AreaSalesManagers: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Area Sales Managers</h1>
        <div className="bg-secondary-100 text-secondary-700 text-xs px-2 py-1 rounded-md">
          Admin Only
        </div>
      </div>
      
      <div className="card flex flex-col items-center justify-center py-12">
        <UserCircle className="h-16 w-16 text-slate-400" />
        <h2 className="mt-4 text-xl font-semibold text-slate-700">ASM Management</h2>
        <p className="mt-2 text-slate-500 text-center max-w-md">
          This is a placeholder for the Area Sales Managers admin page. 
          In a production app, this would allow administrators to manage ASM accounts, 
          territories, and performance metrics.
        </p>
      </div>
    </div>
  );
};

export default AreaSalesManagers;