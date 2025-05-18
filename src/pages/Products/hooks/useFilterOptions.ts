// useFilterOptions.ts
// Custom hook for loading and managing filter options for products

import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { FilterOptions } from '../types';

export const useFilterOptions = () => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchFilterOptions = async () => {
    setIsLoading(true);
    try {
      // Fetch unique categories
      const { data: categories, error: categoriesError } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);
        
      if (categoriesError) throw new Error(`Error fetching categories: ${categoriesError.message}`);
      
      // Extract unique values
      const uniqueCategories = [...new Set(categories?.map(c => c.category).filter(Boolean))];
      
      setFilterOptions({
        categories: uniqueCategories.sort()
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