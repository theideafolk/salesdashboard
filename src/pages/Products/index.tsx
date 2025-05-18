// Products/index.tsx
// Main Products page component

import React, { useState, useCallback } from 'react';
import { Download, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Product } from './types';
import { useProductData } from './hooks/useProductData';
import { useFilterOptions } from './hooks/useFilterOptions';

// Import components
import SearchFilters from './components/SearchFilters';
import ProductsTable from './components/ProductsTable';
import Pagination from './components/Pagination';
import ProductViewModal from './components/ProductViewModal';
import ErrorDisplay from './components/ErrorDisplay';

const Products: React.FC = () => {
  const { user } = useAuth();
  
  // Get filter options
  const { filterOptions } = useFilterOptions();
  
  // Get product data and operations
  const {
    products,
    totalProducts,
    isLoading,
    error,
    searchTerm,
    selectedFilters,
    sortColumn,
    sortDirection,
    currentPage,
    productsPerPage,
    handleSearch,
    handleFilterChange,
    clearFilters,
    handleSort,
    handlePageChange,
    fetchProducts,
    deleteProduct
  } = useProductData();
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  
  // View product details state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Event handlers
  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);
  
  const openViewModal = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  }, []);
  
  const closeViewModal = useCallback(() => {
    setIsViewModalOpen(false);
    setSelectedProduct(null);
  }, []);
  
  const exportToCSV = useCallback(() => {
    // Create CSV content
    const headers = ['Product ID', 'Name', 'Category', 'MRP', 'PTS', 'PTR', 'Scheme Type', 'Scheme %', 'Status', 'Created At'];
    
    const csvContent = [
      headers.join(','),
      ...products.map(product => [
        product.product_id,
        `"${product.name.replace(/"/g, '""')}"`,
        product.category ? `"${product.category.replace(/"/g, '""')}"` : '',
        product.mrp,
        product.pts || '',
        product.ptr || '',
        product.scheme_type ? `"${product.scheme_type.replace(/"/g, '""')}"` : '',
        product.scheme_percentage || '',
        product.is_active ? 'Active' : 'Inactive',
        new Date(product.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `products-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [products]);
  
  // If there's an error loading products
  if (error) {
    return <ErrorDisplay error={error} retry={fetchProducts} />;
  }
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Products</h1>
        
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
            <span>Add Product</span>
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
      
      {/* Products table */}
      <div className="card overflow-hidden">
        <ProductsTable
          isLoading={isLoading}
          products={products}
          handleSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          openViewModal={openViewModal}
          deleteProduct={deleteProduct}
        />
        
        {/* Pagination */}
        {!isLoading && products.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalProducts={totalProducts}
            productsPerPage={productsPerPage}
            onPageChange={handlePageChange}
            productsLength={products.length}
          />
        )}
      </div>
      
      {/* View Product Details Modal */}
      {isViewModalOpen && selectedProduct && (
        <ProductViewModal
          product={selectedProduct}
          onClose={closeViewModal}
        />
      )}
    </div>
  );
};

export default Products;