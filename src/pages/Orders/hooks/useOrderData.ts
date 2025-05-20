// useOrderData.ts
// Custom hook for managing order data and operations

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../utils/supabase';
import { Order, FilterState } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';

export const useOrderData = (initialPage = 1, initialSortColumn = 'created_at', initialSortDirection: 'asc' | 'desc' = 'desc') => {
  const { user, isAdmin } = useAuth();
  
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
    areaManager: '',
    timeRange: ''
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
      // Fetch all orders for the current filters
      let query = supabase
        .from('orders_view')
        .select('*')
        .eq('is_deleted', false);
      
      // If user is ASM, only show orders from their team
      if (!isAdmin && user?.id) {
        query = query.eq('area_sales_manager_id', user.id);
      }
      
      // Apply filters
      if (selectedFilters.salesOfficer) {
        query = query.eq('sales_officers_id', selectedFilters.salesOfficer);
      }
      
      // Only apply area manager filter if user is admin
      if (isAdmin && selectedFilters.areaManager) {
        query = query.eq('area_sales_manager_id', selectedFilters.areaManager);
      }
      
      // Apply time range filter
      if (selectedFilters.timeRange) {
        const now = new Date();
        let startDate: Date;
        let endDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        
        switch (selectedFilters.timeRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            break;
            
          case 'week':
            // Get current week's Monday and Sunday
            const currentDay = now.getDay();
            const diff = currentDay === 0 ? 6 : currentDay - 1; // Adjust when Sunday
            startDate = new Date(now);
            startDate.setDate(now.getDate() - diff);
            startDate.setHours(0, 0, 0, 0);
            
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
            break;
            
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            break;
            
          default:
            return;
        }
        
        query = query
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());
      }
      
      const { data: allOrders, error: fetchError } = await query;
      
      if (fetchError) throw new Error(`Error fetching orders: ${fetchError.message}`);
      
      if (!allOrders) {
        setOrders([]);
        setTotalOrders(0);
        return;
      }
      
      // Process the orders data to combine items for the same order
      const processedOrders = processOrdersData(allOrders);
      
      // Sort the processed orders
      const sortedOrders = [...processedOrders].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        if (sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
      });
      
      setOrders(sortedOrders);
      setTotalOrders(sortedOrders.length);
      
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, sortColumn, sortDirection, selectedFilters]);

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
    
    // Apply pagination after filtering
    const start = (currentPage - 1) * ordersPerPage;
    const end = start + ordersPerPage;
    result = result.slice(start, end);
    
    setFilteredOrders(result);
  }, [orders, searchTerm, currentPage, ordersPerPage]);

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
      areaManager: '',
      timeRange: ''
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