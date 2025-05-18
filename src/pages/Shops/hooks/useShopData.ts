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
      // Get total count of active shops
      const { count, error: countError } = await supabase
        .from('shops')
        .select('shop_id', { count: 'exact', head: true })
        .eq('is_deleted', false);
        
      if (countError) throw new Error(`Error counting shops: ${countError.message}`);
      
      setTotalShops(count || 0);
      
      // Fetch paginated shops data
      const { data, error: fetchError } = await supabase
        .from('shops')
        .select('*')
        .eq('is_deleted', false)
        .order(sortColumn, { ascending: sortDirection === 'asc' })
        .range((currentPage - 1) * shopsPerPage, currentPage * shopsPerPage - 1);
      
      if (fetchError) throw new Error(`Error fetching shops: ${fetchError.message}`);
      
      setShops(data || []);
    } catch (err) {
      console.error('Error fetching shops:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, sortColumn, sortDirection, shopsPerPage]);

  // Filter and search shops
  const filterAndSearchShops = useCallback(() => {
    let result = [...shops];
    
    // Apply search
    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(shop => 
        shop.name.toLowerCase().includes(lowerSearchTerm) ||
        (shop.address && shop.address.toLowerCase().includes(lowerSearchTerm)) ||
        (shop.owner_name && shop.owner_name.toLowerCase().includes(lowerSearchTerm)) ||
        (shop.phone_number && shop.phone_number.toLowerCase().includes(lowerSearchTerm)) ||
        (shop.city && shop.city.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    // Apply filters
    if (selectedFilters.territory) {
      result = result.filter(shop => shop.territory === selectedFilters.territory);
    }
    
    if (selectedFilters.city) {
      result = result.filter(shop => shop.city === selectedFilters.city);
    }
    
    if (selectedFilters.state) {
      result = result.filter(shop => shop.state === selectedFilters.state);
    }
    
    setFilteredShops(result);
  }, [shops, searchTerm, selectedFilters]);

  // Handle search
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((filterType: keyof FilterState, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSelectedFilters({
      territory: '',
      city: '',
      state: ''
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