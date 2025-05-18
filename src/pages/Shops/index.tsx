// Shops/index.tsx
// Main Shops page component

import React, { useState, useCallback } from 'react';
import { Download, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Shop } from './types';
import { useShopData } from './hooks/useShopData';
import { useFilterOptions } from './hooks/useFilterOptions';

// Import components
import SearchFilters from './components/SearchFilters';
import ShopsTable from './components/ShopsTable';
import Pagination from './components/Pagination';
import ShopViewModal from './components/ShopViewModal';
import ErrorDisplay from './components/ErrorDisplay';

const Shops: React.FC = () => {
  const { user } = useAuth();
  
  // Get filter options
  const { filterOptions } = useFilterOptions();
  
  // Get shop data and operations
  const {
    filteredShops,
    totalShops,
    isLoading,
    error,
    searchTerm,
    selectedFilters,
    sortColumn,
    sortDirection,
    currentPage,
    shopsPerPage,
    handleSearch,
    handleFilterChange,
    clearFilters,
    handleSort,
    handlePageChange,
    fetchShops,
    deleteShop
  } = useShopData();
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  
  // View shop details state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  
  // Event handlers
  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);
  
  const openViewModal = useCallback((shop: Shop) => {
    setSelectedShop(shop);
    setIsViewModalOpen(true);
  }, []);
  
  const closeViewModal = useCallback(() => {
    setIsViewModalOpen(false);
    setSelectedShop(null);
  }, []);
  
  const exportToCSV = useCallback(() => {
    // Create CSV content
    const headers = ['Shop ID', 'Name', 'Address', 'Territory', 'City', 'State', 'Country', 'Owner', 'Phone', 'Created At'];
    
    const csvContent = [
      headers.join(','),
      ...filteredShops.map(shop => [
        shop.shop_id,
        `"${shop.name.replace(/"/g, '""')}"`,
        shop.address ? `"${shop.address.replace(/"/g, '""')}"` : '',
        shop.territory || '',
        shop.city || '',
        shop.state || '',
        shop.country || 'India',
        shop.owner_name ? `"${shop.owner_name.replace(/"/g, '""')}"` : '',
        shop.phone_number || '',
        new Date(shop.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `shops-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredShops]);
  
  // If there's an error loading shops
  if (error) {
    return <ErrorDisplay error={error} retry={fetchShops} />;
  }
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Shops</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={exportToCSV}
            className="btn btn-outline flex items-center"
          >
            <Download size={16} className="mr-2" />
            <span>Export</span>
          </button>
          <button 
            className="btn btn-primary flex items-center"
          >
            <Plus size={16} className="mr-2" />
            <span>Add Shop</span>
          </button>
        </div>
      </div>
      
      {/* Search and filters */}
      <SearchFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        showFilters={showFilters}
        toggleFilters={toggleFilters}
        selectedFilters={selectedFilters}
        clearFilters={clearFilters}
        filterOptions={filterOptions}
        onFilterChange={handleFilterChange}
      />
      
      {/* Shops table */}
      <div className="card overflow-hidden">
        <ShopsTable
          isLoading={isLoading}
          shops={filteredShops}
          handleSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          openViewModal={openViewModal}
          deleteShop={deleteShop}
        />
        
        {/* Pagination */}
        {!isLoading && filteredShops.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalShops={totalShops}
            shopsPerPage={shopsPerPage}
            onPageChange={handlePageChange}
            shopsLength={filteredShops.length}
          />
        )}
      </div>
      
      {/* View Shop Details Modal */}
      {isViewModalOpen && selectedShop && (
        <ShopViewModal
          shop={selectedShop}
          onClose={closeViewModal}
        />
      )}
    </div>
  );
};

export default Shops;