// useSalesOfficerData.ts
// Custom hook for managing sales officer data and operations

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../utils/supabase';
import { SalesOfficer, FilterState } from '../types';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

export const useSalesOfficerData = (
  initialPage = 1, 
  initialSortColumn = 'created_at', 
  initialSortDirection: 'asc' | 'desc' = 'desc'
) => {
  const { user, isAdmin } = useAuth();
  
  // Data state
  const [salesOfficers, setSalesOfficers] = useState<SalesOfficer[]>([]);
  const [filteredOfficers, setFilteredOfficers] = useState<SalesOfficer[]>([]);
  const [totalOfficers, setTotalOfficers] = useState(0);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    reportingManager: '',
    activeOnly: true
  });
  
  // Sorting and pagination states
  const [sortColumn, setSortColumn] = useState<string>(initialSortColumn);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const officersPerPage = 10;

  // Fetch sales officers
  const fetchSalesOfficers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First get the count
      let countQuery = supabase
        .from('sales_officers')
        .select('*', { count: 'exact', head: true });
      
      // Apply active filter
      if (selectedFilters.activeOnly) {
        countQuery = countQuery.eq('is_active', true);
      }
      
      // If user is ASM, only show their sales officers
      if (!isAdmin && user?.id) {
        countQuery = countQuery.eq('reporting_manager_id', user.id);
      }
      // If admin and reporting manager filter is applied
      else if (isAdmin && selectedFilters.reportingManager) {
        countQuery = countQuery.eq('reporting_manager_id', selectedFilters.reportingManager);
      }
      
      // Get total count
      const { count, error: countError } = await countQuery;
      
      if (countError) throw new Error(`Error counting officers: ${countError.message}`);
      
      setTotalOfficers(count || 0);
      
      // Build the query for detailed data
      let query = supabase
        .from('sales_officers')
        .select('*, area_sales_managers:reporting_manager_id(name)');
      
      // Apply active filter
      if (selectedFilters.activeOnly) {
        query = query.eq('is_active', true);
      }
      
      // Apply reporting manager filter
      if (!isAdmin && user?.id) {
        // For ASM, only show their sales officers
        query = query.eq('reporting_manager_id', user.id);
      } else if (isAdmin && selectedFilters.reportingManager) {
        // For admin with filter
        query = query.eq('reporting_manager_id', selectedFilters.reportingManager);
      }
      
      // Apply pagination and sorting
      const { data, error: fetchError } = await query
        .order(sortColumn, { ascending: sortDirection === 'asc' })
        .range((currentPage - 1) * officersPerPage, currentPage * officersPerPage - 1);
      
      if (fetchError) throw new Error(`Error fetching officers: ${fetchError.message}`);
      
      // Process the data to include reporting manager name
      const processedData = data?.map(officer => ({
        ...officer,
        reporting_manager_name: officer.area_sales_managers?.name
      })) || [];
      
      setSalesOfficers(processedData);
    } catch (err) {
      console.error('Error fetching sales officers:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, sortColumn, sortDirection, selectedFilters, isAdmin, user?.id]);

  // Filter and search officers
  const filterAndSearchOfficers = useCallback(() => {
    let result = [...salesOfficers];
    
    // Apply search
    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(officer => 
        officer.name.toLowerCase().includes(lowerSearchTerm) ||
        officer.employee_id.toLowerCase().includes(lowerSearchTerm) ||
        officer.phone_number.toLowerCase().includes(lowerSearchTerm) ||
        (officer.reporting_manager_name && 
         officer.reporting_manager_name.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    setFilteredOfficers(result);
  }, [salesOfficers, searchTerm]);

  // Handle search
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((filterType: keyof FilterState, value: string | boolean) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    
    // If changing active filter, refetch data
    if (filterType === 'activeOnly' || filterType === 'reportingManager') {
      setCurrentPage(1); // Reset to first page
    }
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSelectedFilters({
      reportingManager: '',
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
    const maxPage = Math.ceil(totalOfficers / officersPerPage);
    if (page > maxPage) return;
    
    setCurrentPage(page);
  }, [totalOfficers, officersPerPage]);

  // Delete a sales officer (soft delete by setting is_active to false)
  const deleteSalesOfficer = useCallback(async (officerId: string) => {
    try {
      const { error } = await supabase
        .from('sales_officers')
        .update({ is_active: false })
        .eq('sales_officers_id', officerId);
        
      if (error) throw error;
      
      // Refresh the data
      await fetchSalesOfficers();
      
      // Handle if we're on a page that no longer exists after deletion
      const newMaxPage = Math.ceil((totalOfficers - 1) / officersPerPage);
      if (currentPage > newMaxPage && newMaxPage > 0) {
        setCurrentPage(newMaxPage);
      }
      
      toast.success('Sales officer deactivated successfully');
    } catch (error: any) {
      console.error('Error deleting sales officer:', error);
      toast.error(error.message || 'Failed to deactivate sales officer');
    }
  }, [fetchSalesOfficers, totalOfficers, officersPerPage, currentPage]);

  // Fetch officers when dependencies change
  useEffect(() => {
    fetchSalesOfficers();
  }, [fetchSalesOfficers]);

  // Apply filters and search when they change
  useEffect(() => {
    filterAndSearchOfficers();
  }, [filterAndSearchOfficers]);

  return {
    officers: filteredOfficers,
    totalOfficers,
    isLoading,
    error,
    searchTerm,
    selectedFilters,
    sortColumn,
    sortDirection,
    currentPage,
    officersPerPage,
    setSearchTerm,
    handleSearch,
    handleFilterChange,
    clearFilters,
    handleSort,
    handlePageChange,
    fetchSalesOfficers,
    deleteSalesOfficer,
    isAdmin
  };
};