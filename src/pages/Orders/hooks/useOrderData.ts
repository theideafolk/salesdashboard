// useOrderData.ts
// Custom hook for managing order data and operations

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../utils/supabase';
import { Order, FilterState } from '../types';
import toast from 'react-hot-toast';

export const useOrderData = (initialPage = 1, initialSortColumn = 'created_at', initialSortDirection: 'asc' | 'desc' = 'desc') => {
  // Data state
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    salesOfficer: '',
    areaManager: ''
  });
  
  // Sorting and pagination states
  const [sortColumn, setSortColumn] = useState<string>(initialSortColumn);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const ordersPerPage = 10;

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First, get a distinct count of unique order IDs
      const { data: uniqueOrderIdQuery, error: distinctError } = await supabase
        .from('orders_view')
        .select('order_id')
        .eq('is_deleted', false);
        
      if (distinctError) throw new Error(`Error counting orders: ${distinctError.message}`);
      
      // Extract unique order IDs using a Set
      const uniqueOrderIdSet = new Set(uniqueOrderIdQuery?.map(item => item.order_id) || []);
      const uniqueOrderIds = Array.from(uniqueOrderIdSet);
      
      // Update total orders count
      setTotalOrders(uniqueOrderIds.length);
      
      // Sort the unique order IDs based on the selected sort column
      const { data: sortedOrders, error: sortError } = await supabase
        .from('orders_view')
        .select('order_id, created_at, sales_officer_name, shop_name')
        .in('order_id', uniqueOrderIds)
        .eq('is_deleted', false)
        .order(sortColumn, { ascending: sortDirection === 'asc' });
        
      if (sortError) throw new Error(`Error sorting orders: ${sortError.message}`);
      
      // Get unique sorted order IDs (removing duplicates)
      const uniqueSortedIds = [];
      const seenIds = new Set();
      
      for (const order of sortedOrders || []) {
        if (!seenIds.has(order.order_id)) {
          uniqueSortedIds.push(order.order_id);
          seenIds.add(order.order_id);
        }
      }
      
      // Apply pagination to the unique sorted order IDs
      const paginatedOrderIds = uniqueSortedIds.slice(
        (currentPage - 1) * ordersPerPage, 
        currentPage * ordersPerPage
      );
      
      if (paginatedOrderIds.length === 0) {
        setOrders([]);
        setIsLoading(false);
        return;
      }
      
      // Fetch complete order details for the paginated IDs
      const { data: orderDetails, error: orderDetailsError } = await supabase
        .from('orders_view')
        .select('*')
        .in('order_id', paginatedOrderIds)
        .eq('is_deleted', false);
        
      if (orderDetailsError) throw new Error(`Error fetching order details: ${orderDetailsError.message}`);
      
      const processedOrders = processOrdersData(orderDetails || []);
      setOrders(processedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, sortColumn, sortDirection]);

  // Process orders data
  const processOrdersData = (orderDetails: any[]): Order[] => {
    // Group by order_id to combine products for the same order
    const processedOrders: Record<string, Order> = {};
    
    orderDetails.forEach(item => {
      if (!processedOrders[item.order_id]) {
        processedOrders[item.order_id] = {
          order_id: item.order_id,
          visit_id: item.visit_id,
          created_at: item.created_at,
          currency: item.currency,
          sales_officers_id: item.sales_officers_id,
          sales_officer_name: item.sales_officer_name,
          shop_name: item.shop_name,
          area_sales_manager_id: item.area_sales_manager_id,
          area_sales_manager_name: item.area_sales_manager_name,
          total_amount: 0,
          products: []
        };
      }
      
      // Add product details
      processedOrders[item.order_id].products.push({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        amount: parseFloat(item.amount),
        free_qty: item.free_qty || 0
      });
      
      // Add to total amount
      processedOrders[item.order_id].total_amount += parseFloat(item.amount);
    });
    
    // Convert to array and return
    return Object.values(processedOrders);
  };

  // Delete an order
  const deleteOrder = useCallback(async (orderId: string) => {
    try {
      // First, soft delete by setting is_deleted to true
      const { error } = await supabase
        .from('orders')
        .update({ is_deleted: true })
        .eq('order_id', orderId);

      if (error) throw error;
      
      // Refresh the data
      await fetchOrders();
      
      // Handle if we're on a page that no longer exists after deletion
      const newMaxPage = Math.ceil((totalOrders - 1) / ordersPerPage);
      if (currentPage > newMaxPage && newMaxPage > 0) {
        setCurrentPage(newMaxPage);
      }
      
      toast.success('Order deleted successfully');
    } catch (error: any) {
      console.error('Error deleting order:', error);
      toast.error(error.message || 'Failed to delete order');
    }
  }, [fetchOrders, totalOrders, ordersPerPage, currentPage]);

  // Filter and search orders
  const filterAndSearchOrders = useCallback(() => {
    let result = [...orders];
    
    // Apply search
    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.order_id.toLowerCase().includes(lowerSearchTerm) ||
        order.sales_officer_name.toLowerCase().includes(lowerSearchTerm) ||
        order.shop_name.toLowerCase().includes(lowerSearchTerm) ||
        (order.area_sales_manager_name && order.area_sales_manager_name.toLowerCase().includes(lowerSearchTerm)) ||
        // Search in products
        order.products.some(product => 
          product.product_name.toLowerCase().includes(lowerSearchTerm)
        )
      );
    }
    
    // Apply filters
    if (selectedFilters.salesOfficer) {
      result = result.filter(order => order.sales_officers_id === selectedFilters.salesOfficer);
    }
    
    if (selectedFilters.areaManager) {
      result = result.filter(order => order.area_sales_manager_id === selectedFilters.areaManager);
    }
    
    setFilteredOrders(result);
  }, [orders, searchTerm, selectedFilters]);

  // Handle search
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((filterType: 'salesOfficer' | 'areaManager', value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSelectedFilters({
      salesOfficer: '',
      areaManager: ''
    });
    setSearchTerm('');
  }, []);

  // Handle sorting
  const handleSort = useCallback((column: string) => {
    setSortColumn(prev => {
      if (prev === column) {
        // Toggle direction if same column
        setSortDirection(prevDirection => prevDirection === 'asc' ? 'desc' : 'asc');
        return column;
      } else {
        // Set new column and default to ascending
        setSortDirection('asc');
        return column;
      }
    });
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    if (page < 1) return;
    const maxPage = Math.ceil(totalOrders / ordersPerPage);
    if (page > maxPage) return;
    
    setCurrentPage(page);
  }, [totalOrders, ordersPerPage]);

  // Fetch orders when dependencies change
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Apply filters and search when they change
  useEffect(() => {
    filterAndSearchOrders();
  }, [filterAndSearchOrders]);

  return {
    orders,
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
    setSearchTerm,
    handleSearch,
    handleFilterChange,
    clearFilters,
    handleSort,
    handlePageChange,
    fetchOrders,
    deleteOrder
  };
};