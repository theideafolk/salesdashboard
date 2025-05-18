// src/pages/Shops/components/ShopViewModal.tsx
// Component for displaying detailed shop information in a modal

import React from 'react';
import { Shop } from '../types';
import { MapPin, Phone, User, Calendar, MapIcon } from 'lucide-react';

interface ShopViewModalProps {
  shop: Shop;
  onClose: () => void;
}

const ShopViewModal: React.FC<ShopViewModalProps> = ({ shop, onClose }) => {
  const formatGpsLocation = (location: string) => {
    try {
      // Expected format is "POINT(longitude latitude)" or just "longitude,latitude"
      if (location.startsWith('POINT')) {
        // Extract coordinates from POINT(long lat) format
        const coordsStr = location.substring(6, location.length - 1);
        const [longitude, latitude] = coordsStr.split(' ').map(Number);
        return `${latitude},${longitude}`;
      } else if (location.includes(',')) {
        // If it's already in a comma-separated format, swap longitude and latitude
        const [longitude, latitude] = location.split(',').map(s => s.trim());
        return `${latitude},${longitude}`;
      }
      return location; // Fallback
    } catch (error) {
      console.error('Error parsing GPS location:', error);
      return location;
    }
  };
  
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
                  Shop Details
                </h3>
                
                <div className="mt-4 border-t border-gray-200 pt-4">
                  {/* Shop photo if available */}
                  {shop.photo && (
                    <div className="mb-4">
                      <img 
                        src={shop.photo} 
                        alt={shop.name} 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h4 className="text-xl font-semibold text-gray-800">{shop.name}</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {shop.address && (
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Address</p>
                          <p className="mt-1 text-sm text-gray-900">{shop.address}</p>
                        </div>
                      </div>
                    )}
                    
                    {shop.phone_number && (
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Contact</p>
                          <p className="mt-1 text-sm text-gray-900">{shop.phone_number}</p>
                        </div>
                      </div>
                    )}
                    
                    {shop.owner_name && (
                      <div className="flex items-start">
                        <User className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Owner</p>
                          <p className="mt-1 text-sm text-gray-900">{shop.owner_name}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Created</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(shop.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {shop.territory && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Territory</p>
                        <p className="mt-1 text-sm text-gray-900">{shop.territory}</p>
                      </div>
                    )}
                    
                    {shop.city && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">City</p>
                        <p className="mt-1 text-sm text-gray-900">{shop.city}</p>
                      </div>
                    )}
                    
                    {shop.state && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">State</p>
                        <p className="mt-1 text-sm text-gray-900">{shop.state}</p>
                      </div>
                    )}
                  </div>
                  
                  {shop.gps_location && (
                    <div className="mt-4">
                      <a 
                        href={`https://maps.google.com/?q=${formatGpsLocation(shop.gps_location)}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <MapIcon className="h-5 w-5 mr-2" />
                        View on Google Maps
                      </a>
                    </div>
                  )}
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

export default ShopViewModal;