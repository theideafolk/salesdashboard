// useFilterOptions.ts
// Custom hook for loading and managing filter options

import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { FilterOptions } from '../types';
import { useAuth } from '../../../context/AuthContext';

export const useFilterOptions = () => {
  const { user, isAdmin } = useAuth();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    salesOfficers: [],
    areaManagers: [],
    timeRanges: [
      { value: '', label: 'All Time' },
      { value: 'today', label: 'Today' },
      { value: 'week', label: 'This Week' },
      { value: 'month', label: 'This Month' }
    ]
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchFilterOptions = async () => {
    setIsLoading(true);
    try {
      let salesOfficersQuery = supabase
        .from('sales_officers')
        .select('sales_officers_id, name')
        .eq('is_active', true);
        
      // If user is ASM, only show their sales officers
      if (!isAdmin && user?.id) {
        salesOfficersQuery = salesOfficersQuery.eq('reporting_manager_id', user.id);
      }
      
      const { data: salesOfficers, error: soError } = await salesOfficersQuery.order('name');
        
      if (soError) throw new Error(`Error fetching sales officers: ${soError.message}`);
      
      // Only fetch area managers if user is admin
      let areaManagers = [];
      if (isAdmin) {
        const { data: managers, error: asmError } = await supabase
          .from('area_sales_managers')
          .select('asm_user_id, name')
          .eq('is_active', true)
          .order('name');
        
        if (asmError) throw new Error(`Error fetching area managers: ${asmError.message}`);
        areaManagers = managers || [];
      }
      
      setFilterOptions({
        salesOfficers: salesOfficers ? salesOfficers.map(so => ({ id: so.sales_officers_id, name: so.name })) : [],
        areaManagers: areaManagers.map(asm => ({ id: asm.asm_user_id, name: asm.name })),
        timeRanges: filterOptions.timeRanges
      });
    } catch (err) {
      console.error('Error fetching filter options:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  return {
    filterOptions,
    isLoading,
    fetchFilterOptions
  };
};