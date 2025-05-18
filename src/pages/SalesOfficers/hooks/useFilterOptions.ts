// useFilterOptions.ts
// Custom hook for loading and managing filter options for sales officers

import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { FilterOptions } from '../types';
import { useAuth } from '../../../context/AuthContext';

export const useFilterOptions = () => {
  const { user, isAdmin } = useAuth();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    reportingManagers: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchFilterOptions = async () => {
    setIsLoading(true);
    try {
      // Only fetch reporting managers if user is admin
      if (isAdmin) {
        const { data: managers, error: managersError } = await supabase
          .from('area_sales_managers')
          .select('asm_user_id, name')
          .eq('is_active', true)
          .order('name');
          
        if (managersError) throw new Error(`Error fetching managers: ${managersError.message}`);
        
        setFilterOptions({
          reportingManagers: managers ? managers.map(m => ({ 
            id: m.asm_user_id, 
            name: m.name 
          })) : []
        });
      }
    } catch (err) {
      console.error('Error fetching filter options:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, [isAdmin]);

  return {
    filterOptions,
    isLoading,
    fetchFilterOptions
  };
};