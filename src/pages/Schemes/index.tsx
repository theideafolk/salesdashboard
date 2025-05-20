// Schemes/index.tsx
// Main Schemes page component

import React, { useState, useCallback } from 'react';
import { Download, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Scheme } from './types';
import { useSchemeData } from './hooks/useSchemeData';
import { useFilterOptions } from './hooks/useFilterOptions';

// Import components
import SearchFilters from './components/SearchFilters';
import SchemesTable from './components/SchemesTable';
import Pagination from './components/Pagination';
import SchemeViewModal from './components/SchemeViewModal';
import ErrorDisplay from './components/ErrorDisplay';

const Schemes: React.FC = () => {
  const { user, isAdmin } = useAuth();
  
  // Get filter options
  const { filterOptions } = useFilterOptions();
  
  // Get scheme data and operations
  const {
    schemes,
    totalSchemes,
    isLoading,
    error,
    searchTerm,
    selectedFilters,
    sortColumn,
    sortDirection,
    currentPage,
    schemesPerPage,
    handleSearch,
    handleFilterChange,
    clearFilters,
    handleSort,
    handlePageChange,
    fetchSchemes,
    deleteScheme,
    isAdmin: hasAdminAccess
  } = useSchemeData();
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  
  // View scheme details state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  
  // Event handlers
  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);
  
  const openViewModal = useCallback((scheme: Scheme) => {
    setSelectedScheme(scheme);
    setIsViewModalOpen(true);
  }, []);
  
  const closeViewModal = useCallback(() => {
    setIsViewModalOpen(false);
    setSelectedScheme(null);
  }, []);
  
  const exportToCSV = useCallback(() => {
    // Create CSV content
    const headers = ['Scheme ID', 'Scheme Text', 'Scope', 'Min Price', 'Status', 'Created At'];
    
    const csvContent = [
      headers.join(','),
      ...schemes.map(scheme => [
        scheme.scheme_id,
        `"${scheme.scheme_text.replace(/"/g, '""')}"`,
        scheme.scheme_scope,
        scheme.scheme_min_price !== null ? scheme.scheme_min_price.toFixed(2) : '',
        scheme.is_active ? 'Active' : 'Inactive',
        new Date(scheme.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `schemes-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [schemes]);
  
  // If there's an error loading schemes
  if (error) {
    return <ErrorDisplay error={error} retry={fetchSchemes} />;
  }
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Schemes</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={exportToCSV}
            className="btn btn-outline flex items-center"
          >
            <Download size={16} className="mr-2" />
            <span>Export</span>
          </button>
          
          {hasAdminAccess && (
            <button 
              className="btn btn-primary flex items-center"
            >
              <Plus size={16} className="mr-2" />
              <span>Add Scheme</span>
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
      />
      
      {/* Schemes table */}
      <div className="card overflow-hidden">
        <SchemesTable
          isLoading={isLoading}
          schemes={schemes}
          handleSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          openViewModal={openViewModal}
          deleteScheme={deleteScheme}
          isAdmin={hasAdminAccess}
        />
        
        {/* Pagination */}
        {!isLoading && schemes.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalSchemes={totalSchemes}
            schemesPerPage={schemesPerPage}
            onPageChange={handlePageChange}
            schemesLength={schemes.length}
          />
        )}
      </div>
      
      {/* View Scheme Details Modal */}
      {isViewModalOpen && selectedScheme && (
        <SchemeViewModal
          scheme={selectedScheme}
          onClose={closeViewModal}
        />
      )}
    </div>
  );
};

export default Schemes;