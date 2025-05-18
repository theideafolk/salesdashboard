// Orders/index.tsx
// Main Orders page component

import React, { useState, useCallback } from 'react';
import { Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Order } from './types';
import { useOrderData } from './hooks/useOrderData';
import { useFilterOptions } from './hooks/useFilterOptions';

// Import components
import SearchFilters from './components/SearchFilters';
import OrdersTable from './components/OrdersTable';
import Pagination from './components/Pagination';
import OrderViewModal from './components/OrderViewModal';
import ErrorDisplay from './components/ErrorDisplay';

const Orders: React.FC = () => {
  const { user } = useAuth();
  
  // Get filter options
  const { filterOptions } = useFilterOptions();
  
  // Get order data and operations
  const {
    filteredOrders,
    totalOrders,
    isLoading,
    error,
    searchTerm,
    selectedFilters,
    sortColumn,
    sortDirection,
    currentPage,
    ordersPerPage,
    handleSearch,
    handleFilterChange,
    clearFilters,
    handleSort,
    handlePageChange,
    fetchOrders,
    deleteOrder
  } = useOrderData();
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  
  // View order details state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Event handlers
  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);
  
  const openViewModal = useCallback((order: Order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  }, []);
  
  const closeViewModal = useCallback(() => {
    setIsViewModalOpen(false);
    setSelectedOrder(null);
  }, []);
  
  const exportToCSV = useCallback(() => {
    // Create CSV content
    const headers = ['Order ID', 'Total Amount', 'Sales Officer', 'Shop', 'Area Manager', 'Created At'];
    
    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(order => [
        order.order_id,
        `${order.total_amount} ${order.currency}`,
        `"${order.sales_officer_name.replace(/"/g, '""')}"`,
        `"${order.shop_name.replace(/"/g, '""')}"`,
        order.area_sales_manager_name ? `"${order.area_sales_manager_name.replace(/"/g, '""')}"` : '',
        new Date(order.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orders-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredOrders]);
  
  // If there's an error loading orders
  if (error) {
    return <ErrorDisplay error={error} retry={fetchOrders} />;
  }
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={exportToCSV}
            className="btn btn-outline flex items-center"
          >
            <Download size={16} className="mr-2" />
            <span>Export</span>
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
      
      {/* Orders table */}
      <div className="card overflow-hidden">
        <OrdersTable
          isLoading={isLoading}
          orders={filteredOrders}
          handleSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          openViewModal={openViewModal}
          deleteOrder={deleteOrder}
        />
        
        {/* Pagination */}
        {!isLoading && filteredOrders.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalOrders={totalOrders}
            ordersPerPage={ordersPerPage}
            onPageChange={handlePageChange}
            ordersLength={filteredOrders.length}
          />
        )}
      </div>
      
      {/* View Order Details Modal */}
      {isViewModalOpen && selectedOrder && (
        <OrderViewModal
          order={selectedOrder}
          onClose={closeViewModal}
        />
      )}
    </div>
  );
};

export default Orders;