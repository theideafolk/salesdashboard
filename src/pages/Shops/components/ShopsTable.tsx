// src/pages/Shops/components/ShopsTable.tsx
// Component for displaying the shops in a table format

import React, { useState } from 'react';
import { ArrowUpDown, Eye, Trash2, MapPin } from 'lucide-react';
import { Shop } from '../types';
import { cn } from '../../../utils/cn';
import { useNavigate } from 'react-router-dom';

interface ShopsTableProps {
  isLoading: boolean;
  shops: Shop[];
  handleSort: (column: string) => void;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  openViewModal: (shop: Shop) => void;
  deleteShop: (shopId: string) => Promise<void>;
}

const ShopsTable: React.FC<ShopsTableProps> = ({
  isLoading,
  shops,
  handleSort,
  sortColumn,
  sortDirection,
  openViewModal,
  deleteShop
}) => {
  const [deletingShopId, setDeletingShopId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const handleDelete = async (shopId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click event
    if (window.confirm('Are you sure you want to delete this shop? This action cannot be undone.')) {
      setDeletingShopId(shopId);
      try {
        await deleteShop(shopId);
      } finally {
        setDeletingShopId(null);
      }
    }
  };

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

  const handleViewDetails = (shopId: string) => {
    navigate(`/shops/${shopId}`);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click event
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th 
              className="px-4 py-3 text-sm font-semibold text-slate-600 cursor-pointer"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                <span>Shop Name</span>
                <ArrowUpDown size={14} className="ml-2" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-sm font-semibold text-slate-600 cursor-pointer"
              onClick={() => handleSort('city')}
            >
              <div className="flex items-center">
                <span>City</span>
                <ArrowUpDown size={14} className="ml-2" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-sm font-semibold text-slate-600 cursor-pointer"
              onClick={() => handleSort('territory')}
            >
              <div className="flex items-center">
                <span>Territory</span>
                <ArrowUpDown size={14} className="ml-2" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-sm font-semibold text-slate-600 cursor-pointer"
              onClick={() => handleSort('owner_name')}
            >
              <div className="flex items-center">
                <span>Owner</span>
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
              className="px-4 py-3 text-sm font-semibold text-slate-600 cursor-pointer"
              onClick={() => handleSort('created_at')}
            >
              <div className="flex items-center">
                <span>Created</span>
                <ArrowUpDown size={14} className="ml-2" />
              </div>
            </th>
            <th className="px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {isLoading ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 border-t-2 border-b-2 border-primary-600 rounded-full animate-spin"></div>
                  <p className="mt-2 text-sm text-slate-500">Loading shops...</p>
                </div>
              </td>
            </tr>
          ) : shops.length > 0 ? (
            shops.map((shop) => (
              <tr 
                key={shop.shop_id} 
                className="hover:bg-slate-50 cursor-pointer"
                onClick={() => handleViewDetails(shop.shop_id)}
              >
                <td className="px-4 py-3 text-sm font-medium">{shop.name}</td>
                <td className="px-4 py-3 text-sm">{shop.city || '-'}</td>
                <td className="px-4 py-3 text-sm">{shop.territory || '-'}</td>
                <td className="px-4 py-3 text-sm">{shop.owner_name || '-'}</td>
                <td className="px-4 py-3 text-sm">{shop.phone_number || '-'}</td>
                <td className="px-4 py-3 text-sm">
                  {new Date(shop.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center space-x-2" onClick={handleButtonClick}>
                    <button
                      onClick={() => openViewModal(shop)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                      title="View Shop Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(shop.shop_id, e)}
                      disabled={deletingShopId === shop.shop_id}
                      className={cn(
                        "text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50",
                        deletingShopId === shop.shop_id && "opacity-50 cursor-not-allowed"
                      )}
                      title="Delete Shop"
                    >
                      {deletingShopId === shop.shop_id ? (
                        <div className="w-4 h-4 border-t-2 border-red-600 rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                    {shop.gps_location && (
                      <a
                        href={`https://maps.google.com/?q=${formatGpsLocation(shop.gps_location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-50"
                        title="View on Map"
                      >
                        <MapPin size={16} />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center">
                <p className="text-slate-500">No shops found</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ShopsTable;