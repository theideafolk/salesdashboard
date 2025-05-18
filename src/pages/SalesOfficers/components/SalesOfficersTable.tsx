// SalesOfficersTable.tsx
// Component for displaying the sales officers in a table format

import React, { useState } from 'react';
import { ArrowUpDown, Eye, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { SalesOfficer } from '../types';
import { cn } from '../../../utils/cn';

interface SalesOfficersTableProps {
  isLoading: boolean;
  officers: SalesOfficer[];
  handleSort: (column: string) => void;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  openViewModal: (officer: SalesOfficer) => void;
  deleteSalesOfficer: (officerId: string) => Promise<void>;
}

const SalesOfficersTable: React.FC<SalesOfficersTableProps> = ({
  isLoading,
  officers,
  handleSort,
  sortColumn,
  sortDirection,
  openViewModal,
  deleteSalesOfficer
}) => {
  const [deletingOfficerId, setDeletingOfficerId] = useState<string | null>(null);
  
  const handleDelete = async (officerId: string) => {
    if (window.confirm('Are you sure you want to deactivate this sales officer?')) {
      setDeletingOfficerId(officerId);
      try {
        await deleteSalesOfficer(officerId);
      } finally {
        setDeletingOfficerId(null);
      }
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th 
              className="px-4 py-3 text-sm font-semibold text-slate-600 cursor-pointer"
              onClick={() => handleSort('employee_id')}
            >
              <div className="flex items-center">
                <span>Employee ID</span>
                <ArrowUpDown size={14} className="ml-2" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-sm font-semibold text-slate-600 cursor-pointer"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                <span>Name</span>
                <ArrowUpDown size={14} className="ml-2" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-sm font-semibold text-slate-600 cursor-pointer"
              onClick={() => handleSort('phone_number')}
            >
              <div className="flex items-center">
                <span>Contact</span>
                <ArrowUpDown size={14} className="ml-2" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-sm font-semibold text-slate-600"
            >
              ID Details
            </th>
            <th 
              className="px-4 py-3 text-sm font-semibold text-slate-600 cursor-pointer"
              onClick={() => handleSort('reporting_manager_name')}
            >
              <div className="flex items-center">
                <span>Reporting Manager</span>
                <ArrowUpDown size={14} className="ml-2" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-sm font-semibold text-slate-600 cursor-pointer"
              onClick={() => handleSort('created_at')}
            >
              <div className="flex items-center">
                <span>Created</span>
                <ArrowUpDown size={14} className="ml-2" />
              </div>
            </th>
            <th className="px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
            <th className="px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {isLoading ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 border-t-2 border-b-2 border-primary-600 rounded-full animate-spin"></div>
                  <p className="mt-2 text-sm text-slate-500">Loading sales officers...</p>
                </div>
              </td>
            </tr>
          ) : officers.length > 0 ? (
            officers.map((officer) => (
              <tr key={officer.sales_officers_id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium">{officer.employee_id}</td>
                <td className="px-4 py-3 text-sm">{officer.name}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center">
                    <Phone size={14} className="text-slate-400 mr-1" />
                    {officer.phone_number}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="text-slate-600">{officer.id_type}:</span>{' '}
                  <span className="font-medium">{officer.id_no}</span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {officer.reporting_manager_name || '-'}
                </td>
                <td className="px-4 py-3 text-sm">
                  {new Date(officer.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    officer.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  )}>
                    {officer.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openViewModal(officer)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                      title="View Officer Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(officer.sales_officers_id)}
                      disabled={deletingOfficerId === officer.sales_officers_id}
                      className={cn(
                        "text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50",
                        deletingOfficerId === officer.sales_officers_id && "opacity-50 cursor-not-allowed"
                      )}
                      title="Deactivate Officer"
                    >
                      {deletingOfficerId === officer.sales_officers_id ? (
                        <div className="w-4 h-4 border-t-2 border-red-600 rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center">
                <p className="text-slate-500">No sales officers found</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SalesOfficersTable;