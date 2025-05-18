// SalesOfficers/index.tsx
// Main Sales Officers page component

import React, { useState, useCallback } from 'react';
import { Download, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SalesOfficer } from './types';
import { useSalesOfficerData } from './hooks/useSalesOfficerData';
import { useFilterOptions } from './hooks/useFilterOptions';

// Import components
import SearchFilters from './components/SearchFilters';
import SalesOfficersTable from './components/SalesOfficersTable';
import Pagination from './components/Pagination';
import SalesOfficerViewModal from './components/SalesOfficerViewModal';
import AddSalesOfficerModal from './components/AddSalesOfficerModal';
import ErrorDisplay from './components/ErrorDisplay';

const SalesOfficers: React.FC = () => {
  const { user, isAdmin } = useAuth();
  
  // Get filter options
  const { filterOptions } = useFilterOptions();
  
  // Get sales officer data and operations
  const {
    officers,
    totalOfficers,
    isLoading,
    error,
    searchTerm,
    selectedFilters,
    sortColumn,
    sortDirection,
    currentPage,
    officersPerPage,
    handleSearch,
    handleFilterChange,
    clearFilters,
    handleSort,
    handlePageChange,
    fetchSalesOfficers,
    deleteSalesOfficer
  } = useSalesOfficerData();
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // View sales officer details state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<SalesOfficer | null>(null);
  
  // Event handlers
  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);
  
  const openViewModal = useCallback((officer: SalesOfficer) => {
    setSelectedOfficer(officer);
    setIsViewModalOpen(true);
  }, []);
  
  const closeViewModal = useCallback(() => {
    setIsViewModalOpen(false);
    setSelectedOfficer(null);
  }, []);
  
  const openAddModal = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);
  
  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);
  
  const handleOfficerAdded = useCallback(() => {
    fetchSalesOfficers();
  }, [fetchSalesOfficers]);
  
  const exportToCSV = useCallback(() => {
    // Create CSV content
    const headers = ['Employee ID', 'Name', 'Phone', 'Address', 'ID Type', 'ID Number', 'Reporting Manager', 'Status', 'Created At'];
    
    const csvContent = [
      headers.join(','),
      ...officers.map(officer => [
        officer.employee_id,
        `"${officer.name.replace(/"/g, '""')}"`,
        officer.phone_number,
        `"${officer.address.replace(/"/g, '""')}"`,
        officer.id_type,
        officer.id_no,
        officer.reporting_manager_name ? `"${officer.reporting_manager_name.replace(/"/g, '""')}"` : '',
        officer.is_active ? 'Active' : 'Inactive',
        new Date(officer.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sales-officers-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [officers]);
  
  // If there's an error loading sales officers
  if (error) {
    return <ErrorDisplay error={error} retry={fetchSalesOfficers} />;
  }
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Sales Officers</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={exportToCSV}
            className="btn btn-outline flex items-center"
          >
            <Download size={16} className="mr-2" />
            <span>Export</span>
          </button>
          
          {isAdmin && (
            <button 
              onClick={openAddModal}
              className="btn btn-primary flex items-center"
            >
              <Plus size={16} className="mr-2" />
              <span>Add Sales Officer</span>
            </button>
          )}
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
        isAdmin={isAdmin}
      />
      
      {/* Sales officers table */}
      <div className="card overflow-hidden">
        <SalesOfficersTable
          isLoading={isLoading}
          officers={officers}
          handleSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          openViewModal={openViewModal}
          deleteSalesOfficer={deleteSalesOfficer}
        />
        
        {/* Pagination */}
        {!isLoading && officers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalOfficers={totalOfficers}
            officersPerPage={officersPerPage}
            onPageChange={handlePageChange}
            officersLength={officers.length}
          />
        )}
      </div>
      
      {/* View Sales Officer Details Modal */}
      {isViewModalOpen && selectedOfficer && (
        <SalesOfficerViewModal
          officer={selectedOfficer}
          onClose={closeViewModal}
        />
      )}
      
      {/* Add Sales Officer Modal */}
      <AddSalesOfficerModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSuccess={handleOfficerAdded}
      />
    </div>
  );
};

export default SalesOfficers;