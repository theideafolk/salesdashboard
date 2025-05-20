// useASMData.ts
// Custom hook for managing area sales manager data and operations

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../utils/supabase';
import { AreaSalesManager, FilterState } from '../types';
import toast from 'react-hot-toast';

export const useASMData = (initialPage = 1, initialSortColumn = 'created_at', initialSortDirection: 'asc' | 'desc' = 'desc') => {
  // Data state
  const [managers, setManagers] = useState<AreaSalesManager[]>([]);
  const [filteredManagers, setFilteredManagers] = useState<AreaSalesManager[]>([]);
  const [totalManagers, setTotalManagers] = useState(0);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    activeOnly: true
  });
  
  // Sorting and pagination states
  const [sortColumn, setSortColumn] = useState<string>(initialSortColumn);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const managersPerPage = 10;

  // Fetch area sales managers
  const fetchManagers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First get the count
      let countQuery = supabase
        .from('area_sales_managers')
        .select('*', { count: 'exact', head: true });
      
      // Apply active filter
      if (selectedFilters.activeOnly) {
        countQuery = countQuery.eq('is_active', true);
      }
      
      // Get total count
      const { count, error: countError } = await countQuery;
      
      if (countError) throw new Error(`Error counting managers: ${countError.message}`);
      
      setTotalManagers(count || 0);
      
      // Build the query for detailed data
      let query = supabase
        .from('area_sales_managers')
        .select('*');
      
      // Apply active filter
      if (selectedFilters.activeOnly) {
        query = query.eq('is_active', true);
      }
      
      // Apply pagination and sorting
      const { data, error: fetchError } = await query
        .order(sortColumn, { ascending: sortDirection === 'asc' })
        .range((currentPage - 1) * managersPerPage, currentPage * managersPerPage - 1);
      
      if (fetchError) throw new Error(`Error fetching managers: ${fetchError.message}`);
      
      setManagers(data || []);
    } catch (err) {
      console.error('Error fetching area sales managers:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, sortColumn, sortDirection, selectedFilters, managersPerPage]);

  // Filter and search managers
  const filterAndSearchManagers = useCallback(() => {
    let result = [...managers];
    
    // Apply search
    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(manager => 
        manager.name.toLowerCase().includes(lowerSearchTerm) ||
        manager.employee_id.toLowerCase().includes(lowerSearchTerm) ||
        manager.phone_number.toLowerCase().includes(lowerSearchTerm) ||
        manager.address.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    setFilteredManagers(result);
  }, [managers, searchTerm]);

  // Handle search
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((filterType: keyof FilterState, value: boolean) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    
    // If changing active filter, refetch data
    if (filterType === 'activeOnly') {
      setCurrentPage(1); // Reset to first page
    }
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSelectedFilters({
      activeOnly: true
    });
    setSearchTerm('');
  }, []);

  // Handle sorting
  const handleSort = useCallback((column: string) => {
    setSortColumn(prev => {
      if (prev === column) {
        setSortDirection(prevDirection => prevDirection === 'asc' ? 'desc' : 'asc');
        return column;
      } else {
        setSortDirection('asc');
        return column;
      }
    });
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    if (page < 1) return;
    const maxPage = Math.ceil(totalManagers / managersPerPage);
    if (page > maxPage) return;
    
    setCurrentPage(page);
  }, [totalManagers, managersPerPage]);

  // Deactivate a manager (set is_active to false)
  const deactivateManager = useCallback(async (managerId: string) => {
    try {
      const { error } = await supabase
        .from('area_sales_managers')
        .update({ is_active: false })
        .eq('asm_user_id', managerId);
        
      if (error) throw error;
      
      // Refresh the data
      await fetchManagers();
      
      // Handle if we're on a page that no longer exists after deactivation
      const newMaxPage = Math.ceil((totalManagers - 1) / managersPerPage);
      if (currentPage > newMaxPage && newMaxPage > 0) {
        setCurrentPage(newMaxPage);
      }
      
      toast.success('Area sales manager deactivated successfully');
    } catch (error: any) {
      console.error('Error deactivating manager:', error);
      toast.error(error.message || 'Failed to deactivate manager');
    }
  }, [fetchManagers, totalManagers, managersPerPage, currentPage]);

  // Fetch managers when dependencies change
  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  // Apply filters and search when they change
  useEffect(() => {
    filterAndSearchManagers();
  }, [filterAndSearchManagers]);

  return {
    managers: filteredManagers,
    totalManagers,
    isLoading,
    error,
    searchTerm,
    selectedFilters,
    sortColumn,
    sortDirection,
    currentPage,
    managersPerPage,
    setSearchTerm,
    handleSearch,
    handleFilterChange,
    clearFilters,
    handleSort,
    handlePageChange,
    fetchManagers,
    deactivateManager
  };
};