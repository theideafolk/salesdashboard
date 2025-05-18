import React from 'react';
import { Shield } from 'lucide-react';

const Admins: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Admin Management</h1>
        <div className="bg-secondary-100 text-secondary-700 text-xs px-2 py-1 rounded-md">
          Admin Only
        </div>
      </div>
      
      <div className="card flex flex-col items-center justify-center py-12">
        <Shield className="h-16 w-16 text-slate-400" />
        <h2 className="mt-4 text-xl font-semibold text-slate-700">Administrator Management</h2>
        <p className="mt-2 text-slate-500 text-center max-w-md">
          This is a placeholder for the Administrators management page. 
          In a production app, this would allow super-admins to manage admin accounts,
          permissions, and system access controls.
        </p>
      </div>
    </div>
  );
};

export default Admins;