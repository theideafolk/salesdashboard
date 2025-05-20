// SchemesTable.tsx
// Component for displaying schemes in a table format

import React, { useState } from 'react';
import { ArrowUpDown, Eye, Trash2, Tag, Clock } from 'lucide-react';
import { Scheme } from '../types';
import { cn } from '../../../utils/cn';

interface SchemesTableProps {
  isLoading: boolean;
  schemes: Scheme[];
  handleSort: (column: string) => void;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  openViewModal: (scheme: Scheme) => void;
  deleteScheme: (schemeId: number) => Promise<void>;
  isAdmin: boolean;
}

const SchemesTable: React.FC<SchemesTableProps> = ({
  isLoading,
  schemes,
  handleSort,
  sortColumn,
  sortDirection,
  openViewModal,
  deleteScheme,
  isAdmin
}) => {
  const [deletingSchemeId, setDeletingSchemeId] = useState<number | null>(null);
  
  const handleDelete = async (schemeId: number) => {
    if (window.confirm('Are you sure you want to deactivate this scheme? This action cannot be undone.')) {
      setDeletingSchemeId(schemeId);
      try {
        await deleteScheme(schemeId);
      } finally {
        setDeletingSchemeId(null);
      }
    }
  };
  
  const getScopeColor = (scope: string) => {
    if (scope === 'product') {
      return 'bg-blue-100 text-blue-800';
    } else if (scope === 'order') {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th 
              className="px-4 py-3 text-sm font-semibold text-slate-600 cursor-pointer"
              onClick={() => handleSort('scheme_id')}
            >
              <div className="flex items-center">
                <span>ID</span>
                <ArrowUpDown size={14} className="ml-2" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-sm font-semibold text-slate-600 cursor-pointer"
              onClick={() => handleSort('scheme_text')}
            >
              <div className="flex items-center">
                <span>Scheme Text</span>
                <ArrowUpDown size={14} className="ml-2" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-sm font-semibold text-slate-600 cursor-pointer"
              onClick={() => handleSort('scheme_scope')}
            >
              <div className="flex items-center">
                <span>Scope</span>
                <ArrowUpDown size={14} className="ml-2" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-sm font-semibold text-slate-600 cursor-pointer"
              onClick={() => handleSort('scheme_min_price')}
            >
              <div className="flex items-center">
                <span>Min Price</span>
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
              <td colSpan={7} className="px-4 py-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 border-t-2 border-b-2 border-primary-600 rounded-full animate-spin"></div>
                  <p className="mt-2 text-sm text-slate-500">Loading schemes...</p>
                </div>
              </td>
            </tr>
          ) : schemes.length > 0 ? (
            schemes.map((scheme) => (
              <tr key={scheme.scheme_id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium">{scheme.scheme_id}</td>
                <td className="px-4 py-3 text-sm">{scheme.scheme_text}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    getScopeColor(scheme.scheme_scope)
                  )}>
                    {scheme.scheme_scope.charAt(0).toUpperCase() + scheme.scheme_scope.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {scheme.scheme_min_price !== null ? `₹${scheme.scheme_min_price.toFixed(2)}` : '-'}
                </td>
                <td className="px-4 py-3 text-sm">
                  {new Date(scheme.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    scheme.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  )}>
                    {scheme.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openViewModal(scheme)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                      title="View Scheme Details"
                    >
                      <Eye size={16} />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(scheme.scheme_id)}
                        disabled={deletingSchemeId === scheme.scheme_id}
                        className={cn(
                          "text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50",
                          deletingSchemeId === scheme.scheme_id && "opacity-50 cursor-not-allowed"
                        )}
                        title="Deactivate Scheme"
                      >
                        {deletingSchemeId === scheme.scheme_id ? (
                          <div className="w-4 h-4 border-t-2 border-red-600 rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center">
                <p className="text-slate-500">No schemes found</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SchemesTable;