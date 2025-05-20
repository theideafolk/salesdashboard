// AreaSalesManagerViewModal.tsx
// Component for displaying detailed manager information in a modal

import React from 'react';
import { AreaSalesManager } from '../types';
import { Phone, MapPin, User, Calendar, FileText } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface AreaSalesManagerViewModalProps {
  manager: AreaSalesManager;
  onClose: () => void;
}

const AreaSalesManagerViewModal: React.FC<AreaSalesManagerViewModalProps> = ({ manager, onClose }) => {
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
                  Area Sales Manager Details
                </h3>
                
                <div className="mt-4 border-t border-gray-200 pt-4">
                  {/* Manager photo if available */}
                  {manager.photo && (
                    <div className="mb-4">
                      <img 
                        src={manager.photo} 
                        alt={manager.name} 
                        className="w-32 h-32 object-cover rounded-full mx-auto"
                      />
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h4 className="text-xl font-semibold text-gray-800">{manager.name}</h4>
                    <p className="text-sm text-gray-500">Employee ID: {manager.employee_id}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Contact</p>
                        <p className="mt-1 text-sm text-gray-900">{manager.phone_number}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Address</p>
                        <p className="mt-1 text-sm text-gray-900">{manager.address}</p>
                      </div>
                    </div>
                    
                    {manager.dob && (
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                          <p className="mt-1 text-sm text-gray-900">
                            {new Date(manager.dob).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start">
                      <FileText className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">ID Details</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {manager.id_type}: {manager.id_no}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <p className="mt-1 text-sm">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            manager.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          )}>
                            {manager.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-500">Created</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(manager.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
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

export default AreaSalesManagerViewModal;