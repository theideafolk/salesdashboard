// AreaSalesManagers/index.tsx
// Main Area Sales Managers page component

import React, { useState, useCallback } from 'react';
import { Download, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AreaSalesManager } from './types';
import { useASMData } from './hooks/useASMData';
import { useFilterOptions } from './hooks/useFilterOptions';

// Import components
import SearchFilters from './components/SearchFilters';
import AreaSalesManagersTable from './components/AreaSalesManagersTable';
import Pagination from './components/Pagination';
import AreaSalesManagerViewModal from './components/AreaSalesManagerViewModal';
import AddASMModal from './components/AddASMModal';
import ErrorDisplay from './components/ErrorDisplay';

const AreaSalesManagers: React.FC = () => {
  const { isAdmin } = useAuth();
  
  // Get area sales manager data and operations
  const {
    managers,
    totalManagers,
    isLoading,
    error,
    searchTerm,
    selectedFilters,
    sortColumn,
    sortDirection,
    currentPage,
    managersPerPage,
    handleSearch,
    handleFilterChange,
    clearFilters,
    handleSort,
    handlePageChange,
    fetchManagers,
    deactivateManager
  } = useASMData();
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // View manager details state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<AreaSalesManager | null>(null);
  
  // Event handlers
  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);
  
  const openViewModal = useCallback((manager: AreaSalesManager) => {
    setSelectedManager(manager);
    setIsViewModalOpen(true);
  }, []);
  
  const closeViewModal = useCallback(() => {
    setIsViewModalOpen(false);
    setSelectedManager(null);
  }, []);
  
  const openAddModal = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);
  
  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);
  
  const handleManagerAdded = useCallback(() => {
    fetchManagers();
  }, [fetchManagers]);
  
  const exportToCSV = useCallback(() => {
    // Create CSV content
    const headers = ['Employee ID', 'Name', 'Phone', 'Address', 'ID Type', 'ID Number', 'Status', 'Created At'];
    
    const csvContent = [
      headers.join(','),
      ...managers.map(manager => [
        manager.employee_id,
        `"${manager.name.replace(/"/g, '""')}"`,
        manager.phone_number,
        `"${manager.address.replace(/"/g, '""')}"`,
        manager.id_type,
        manager.id_no,
        manager.is_active ? 'Active' : 'Inactive',
        new Date(manager.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `area-sales-managers-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [managers]);
  
  // If there's an error loading area sales managers
  if (error) {
    return <ErrorDisplay error={error} retry={fetchManagers} />;
  }
  
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Area Sales Managers</h1>
        <div className="bg-secondary-100 text-secondary-700 text-xs px-2 py-1 rounded-md">
          Admin Only
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div></div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={exportToCSV}
            className="btn btn-outline flex items-center"
          >
            <Download size={16} className="mr-2" />
            <span>Export</span>
          </button>
          
          <button 
            onClick={openAddModal}
            className="btn btn-primary flex items-center"
          >
            <Plus size={16} className="mr-2" />
            <span>Add ASM</span>
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
        onFilterChange={handleFilterChange}
      />
      
      {/* Area sales managers table */}
      <div className="card overflow-hidden">
        <AreaSalesManagersTable
          isLoading={isLoading}
          managers={managers}
          handleSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          openViewModal={openViewModal}
          deactivateManager={deactivateManager}
        />
        
        {/* Pagination */}
        {!isLoading && managers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalManagers={totalManagers}
            managersPerPage={managersPerPage}
            onPageChange={handlePageChange}
            managersLength={managers.length}
          />
        )}
      </div>
      
      {/* View Manager Details Modal */}
      {isViewModalOpen && selectedManager && (
        <AreaSalesManagerViewModal
          manager={selectedManager}
          onClose={closeViewModal}
        />
      )}
      
      {/* Add Manager Modal */}
      <AddASMModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSuccess={handleManagerAdded}
      />
    </div>
  );
};

export default AreaSalesManagers;