// useSchemeData.ts
// Custom hook for managing scheme data and operations

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../utils/supabase';
import { Scheme, FilterState } from '../types';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

export const useSchemeData = (initialPage = 1, initialSortColumn = 'created_at', initialSortDirection: 'asc' | 'desc' = 'desc') => {
  const { user, isAdmin } = useAuth();
  
  // Data state
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>([]);
  const [totalSchemes, setTotalSchemes] = useState(0);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    scope: '',
    activeOnly: true
  });
  
  // Sorting and pagination states
  const [sortColumn, setSortColumn] = useState<string>(initialSortColumn);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const schemesPerPage = 10;

  // Fetch schemes
  const fetchSchemes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query with filters
      let query = supabase
        .from('schemes')
        .select('*')
        .eq('is_active', true);
      
      // Apply filters
      if (selectedFilters.scope) {
        query = query.eq('scheme_scope', selectedFilters.scope);
      }
      
      // Apply search if present
      if (searchTerm.trim()) {
        query = query.or(
          `scheme_text.ilike.%${searchTerm}%,` +
          `scheme_scope.ilike.%${searchTerm}%`
        );
      }
      
      const { data: allSchemes, error: fetchError } = await query;
      
      if (fetchError) throw new Error(`Error fetching schemes: ${fetchError.message}`);
      
      if (!allSchemes) {
        setSchemes([]);
        setTotalSchemes(0);
        return;
      }
      
      // Sort the schemes
      const sortedSchemes = [...allSchemes].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        if (sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
      });
      
      setSchemes(sortedSchemes);
      setTotalSchemes(sortedSchemes.length);
    } catch (err) {
      console.error('Error fetching schemes:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [sortColumn, sortDirection, selectedFilters, searchTerm]);

  // Filter and search schemes
  const filterAndSearchSchemes = useCallback(() => {
    // Apply pagination after filtering
    const start = (currentPage - 1) * schemesPerPage;
    const end = start + schemesPerPage;
    const paginatedSchemes = schemes.slice(start, end);
    
    setFilteredSchemes(paginatedSchemes);
  }, [schemes, currentPage, schemesPerPage]);

  // Handle search
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((filterType: keyof FilterState, value: string | boolean) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    
    // If changing active filter or scope, refetch data
    if (filterType === 'activeOnly' || filterType === 'scope') {
      setCurrentPage(1); // Reset to first page
    }
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSelectedFilters({
      scope: '',
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
    const maxPage = Math.ceil(totalSchemes / schemesPerPage);
    if (page > maxPage) return;
    
    setCurrentPage(page);
  }, [totalSchemes, schemesPerPage]);

  // Delete a scheme (soft delete by setting is_active to false)
  const deleteScheme = useCallback(async (schemeId: number) => {
    try {
      if (!isAdmin) {
        toast.error('Only administrators can deactivate schemes');
        return;
      }
      
      const { error } = await supabase
        .from('schemes')
        .update({ is_active: false })
        .eq('scheme_id', schemeId);
        
      if (error) throw error;
      
      // Refresh the data
      await fetchSchemes();
      
      // Handle if we're on a page that no longer exists after deletion
      const newMaxPage = Math.ceil((totalSchemes - 1) / schemesPerPage);
      if (currentPage > newMaxPage && newMaxPage > 0) {
        setCurrentPage(newMaxPage);
      }
      
      toast.success('Scheme deactivated successfully');
    } catch (error: any) {
      console.error('Error deactivating scheme:', error);
      toast.error(error.message || 'Failed to deactivate scheme');
    }
  }, [fetchSchemes, totalSchemes, schemesPerPage, currentPage, isAdmin]);

  // Fetch schemes when dependencies change
  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  // Apply filters and search when they change
  useEffect(() => {
    filterAndSearchSchemes();
  }, [filterAndSearchSchemes]);

  return {
    schemes: filteredSchemes,
    totalSchemes,
    isLoading,
    error,
    searchTerm,
    selectedFilters,
    sortColumn,
    sortDirection,
    currentPage,
    schemesPerPage,
    setSearchTerm,
    handleSearch,
    handleFilterChange,
    clearFilters,
    handleSort,
    handlePageChange,
    fetchSchemes,
    deleteScheme,
    isAdmin
  };
};