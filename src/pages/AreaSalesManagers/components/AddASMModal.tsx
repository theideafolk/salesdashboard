// AddASMModal.tsx
// Component for adding a new Area Sales Manager

import React, { useState } from 'react';
import { X, Loader } from 'lucide-react';
import { supabase } from '../../../utils/supabase';
import toast from 'react-hot-toast';
import { cn } from '../../../utils/cn';

interface AddASMModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddASMModal: React.FC<AddASMModalProps> = ({ 
  isOpen, 
  onClose,
  onSuccess 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    phone_number: '',
    password: '',
    address: '',
    dob: '',
    id_type: 'Aadhar',
    id_no: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Call the edge function to create area sales manager
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials are not available');
      }
      
      const apiUrl = `${supabaseUrl}/functions/v1/create-asm`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          // Map phone_number to phone for the edge function
          phone: formData.phone_number,
          password: formData.password,
          employee_id: formData.employee_id,
          name: formData.name,
          address: formData.address,
          phone_number: formData.phone_number,
          dob: formData.dob || null,
          id_type: formData.id_type,
          id_no: formData.id_no
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error creating area sales manager');
      }
      
      const result = await response.json();
      
      toast.success('Area sales manager created successfully');
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error creating area sales manager:', error);
      toast.error(error.message || 'Failed to create area sales manager');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      employee_id: '',
      name: '',
      phone_number: '',
      password: '',
      address: '',
      dob: '',
      id_type: 'Aadhar',
      id_no: ''
    });
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Add New Area Sales Manager
                </h3>
                
                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="grid grid-cols-1 gap-y-4">
                    <div className="grid grid-cols-2 gap-x-4">
                      <div>
                        <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700">
                          Employee ID *
                        </label>
                        <input
                          type="text"
                          id="employee_id"
                          name="employee_id"
                          required
                          value={formData.employee_id}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4">
                      <div>
                        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                          Phone Number *
                        </label>
                        <input
                          type="text"
                          id="phone_number"
                          name="phone_number"
                          required
                          value={formData.phone_number}
                          onChange={handleChange}
                          placeholder="e.g. 9876543210"
                          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          Password *
                        </label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          minLength={6}
                          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Address *
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        rows={2}
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4">
                      <div>
                        <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          id="dob"
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4">
                      <div>
                        <label htmlFor="id_type" className="block text-sm font-medium text-gray-700">
                          ID Type *
                        </label>
                        <select
                          id="id_type"
                          name="id_type"
                          required
                          value={formData.id_type}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                        >
                          <option value="Aadhar">Aadhar</option>
                          <option value="PAN">PAN</option>
                          <option value="Voter ID">Voter ID</option>
                          <option value="Driving License">Driving License</option>
                          <option value="Passport">Passport</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="id_no" className="block text-sm font-medium text-gray-700">
                          ID Number *
                        </label>
                        <input
                          type="text"
                          id="id_no"
                          name="id_no"
                          required
                          value={formData.id_no}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={cn(
                        "inline-flex justify-center w-full sm:w-auto rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm",
                        isLoading && "opacity-70 cursor-not-allowed"
                      )}
                    >
                      {isLoading ? (
                        <>
                          <Loader size={16} className="animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        "Add Area Sales Manager"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-3 sm:mt-0 sm:mr-3 inline-flex justify-center w-full sm:w-auto rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddASMModal;