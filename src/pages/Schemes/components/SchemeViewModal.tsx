// SchemeViewModal.tsx
// Component for displaying detailed scheme information in a modal

import React from 'react';
import { Scheme } from '../types';
import { Tag, Calendar, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface SchemeViewModalProps {
  scheme: Scheme;
  onClose: () => void;
}

const SchemeViewModal: React.FC<SchemeViewModalProps> = ({ scheme, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Scheme Details
                </h3>
                
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="mb-4">
                    <h4 className="text-xl font-semibold text-gray-800">{scheme.scheme_text}</h4>
                    <div className="mt-1 flex items-center">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium mr-2",
                        scheme.scheme_scope === 'product' ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                      )}>
                        {scheme.scheme_scope.charAt(0).toUpperCase() + scheme.scheme_scope.slice(1)} Scheme
                      </span>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        scheme.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      )}>
                        {scheme.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-start">
                      <Tag className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Scheme ID</p>
                        <p className="mt-1 text-sm text-gray-900">{scheme.scheme_id}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Created</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(scheme.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <DollarSign className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Minimum Price</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {scheme.scheme_min_price !== null ? `₹${scheme.scheme_min_price.toFixed(2)}` : 'No minimum price'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      {scheme.is_active ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {scheme.is_active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-500">Scheme Description</p>
                    <p className="mt-2 text-sm text-gray-900">{scheme.scheme_text}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeViewModal;