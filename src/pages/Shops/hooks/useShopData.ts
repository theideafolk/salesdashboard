// useShopData.ts
// Custom hook for managing shop data and operations

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../utils/supabase';
import { Shop, FilterState } from '../types';
import toast from 'react-hot-toast';

export const useShopData = (initialPage = 1, initialSortColumn = 'created_at', initialSortDirection: 'asc' | 'desc' = 'desc') => {
  // Data state
  const [shops, setShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [totalShops, setTotalShops] = useState(0);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    territory: '',
    city: '',
    state: ''
  });
  
  // Sorting and pagination states
  const [sortColumn, setSortColumn] = useState<string>(initialSortColumn);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const shopsPerPage = 10;

  // Fetch shops
  const fetchShops = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query with filters
      let query = supabase
        .from('shops')
        .select('*')
        .eq('is_deleted', false);
      
      if (selectedFilters.territory) {
        query = query.eq('territory', selectedFilters.territory);
      }
      
      if (selectedFilters.city) {
        query = query.eq('city', selectedFilters.city);
      }
      
      if (selectedFilters.state) {
        query = query.eq('state', selectedFilters.state);
      }

      // Apply search if present
      if (searchTerm.trim()) {
        query = query.or(
          `name.ilike.%${searchTerm}%,` +
          `address.ilike.%${searchTerm}%,` +
          `owner_name.ilike.%${searchTerm}%,` +
          `phone_number.ilike.%${searchTerm}%,` +
          `city.ilike.%${searchTerm}%`
        );
      }
      
      const { data: allShops, error: fetchError } = await query;
      
      if (fetchError) throw new Error(`Error fetching shops: ${fetchError.message}`);
      
      if (!allShops) {
        setShops([]);
        setTotalShops(0);
        return;
      }
      
      // Sort the shops
      const sortedShops = [...allShops].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        if (sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
      });
      
      setShops(sortedShops);
      setTotalShops(sortedShops.length);
    } catch (err) {
      console.error('Error fetching shops:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [sortColumn, sortDirection, selectedFilters, searchTerm]);

  // Filter and search shops
  const filterAndSearchShops = useCallback(() => {
    // Apply pagination after filtering
    const start = (currentPage - 1) * shopsPerPage;
    const end = start + shopsPerPage;
    const paginatedShops = shops.slice(start, end);
    
    setFilteredShops(paginatedShops);
  }, [shops, searchTerm, currentPage, shopsPerPage]);

  // Handle search
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((filterType: keyof FilterState, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1); // Reset to first page when changing filters
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSelectedFilters({
      territory: '',
      city: '',
      state: ''
    });
    setSearchTerm('');
    setCurrentPage(1); // Reset to first page when clearing filters
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
    const maxPage = Math.ceil(totalShops / shopsPerPage);
    if (page > maxPage) return;
    
    setCurrentPage(page);
  }, [totalShops, shopsPerPage]);

  // Delete a shop (soft delete)
  const deleteShop = useCallback(async (shopId: string) => {
    try {
      const { error } = await supabase
        .from('shops')
        .update({ is_deleted: true })
        .eq('shop_id', shopId);
        
      if (error) throw error;
      
      // Refresh the data
      await fetchShops();
      
      // Handle if we're on a page that no longer exists after deletion
      const newMaxPage = Math.ceil((totalShops - 1) / shopsPerPage);
      if (currentPage > newMaxPage && newMaxPage > 0) {
        setCurrentPage(newMaxPage);
      }
      
      toast.success('Shop deleted successfully');
    } catch (error: any) {
      console.error('Error deleting shop:', error);
      toast.error(error.message || 'Failed to delete shop');
    }
  }, [fetchShops, totalShops, shopsPerPage, currentPage]);

  // Fetch shops when dependencies change
  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  // Apply filters and search when they change
  useEffect(() => {
    filterAndSearchShops();
  }, [filterAndSearchShops]);

  return {
    shops,
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
    setSearchTerm,
    handleSearch,
    handleFilterChange,
    clearFilters,
    handleSort,
    handlePageChange,
    fetchShops,
    deleteShop
  };
};