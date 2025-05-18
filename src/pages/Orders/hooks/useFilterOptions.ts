// useFilterOptions.ts
// Custom hook for loading and managing filter options

import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { FilterOptions } from '../types';

export const useFilterOptions = () => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    salesOfficers: [],
    areaManagers: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchFilterOptions = async () => {
    setIsLoading(true);
    try {
      // Fetch sales officers for filter
      const { data: salesOfficers, error: soError } = await supabase
        .from('sales_officers')
        .select('sales_officers_id, name')
        .eq('is_active', true)
        .order('name');
        
      if (soError) throw new Error(`Error fetching sales officers: ${soError.message}`);
      
      // Fetch area sales managers for filter
      const { data: areaManagers, error: asmError } = await supabase
        .from('area_sales_managers')
        .select('asm_user_id, name')
        .eq('is_active', true)
        .order('name');
        
      if (asmError) throw new Error(`Error fetching area managers: ${asmError.message}`);
      
      setFilterOptions({
        salesOfficers: salesOfficers ? salesOfficers.map(so => ({ id: so.sales_officers_id, name: so.name })) : [],
        areaManagers: areaManagers ? areaManagers.map(asm => ({ id: asm.asm_user_id, name: asm.name })) : [],
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