// useFilterOptions.ts
// Custom hook for loading and managing filter options for shops

import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { FilterOptions } from '../types';

export const useFilterOptions = () => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    territories: [],
    cities: [],
    states: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchFilterOptions = async () => {
    setIsLoading(true);
    try {
      // Fetch unique territories
      const { data: territories, error: territoriesError } = await supabase
        .from('shops')
        .select('territory')
        .eq('is_deleted', false)
        .not('territory', 'is', null);
        
      if (territoriesError) throw new Error(`Error fetching territories: ${territoriesError.message}`);
      
      // Fetch unique cities
      const { data: cities, error: citiesError } = await supabase
        .from('shops')
        .select('city')
        .eq('is_deleted', false)
        .not('city', 'is', null);
        
      if (citiesError) throw new Error(`Error fetching cities: ${citiesError.message}`);
      
      // Fetch unique states
      const { data: states, error: statesError } = await supabase
        .from('shops')
        .select('state')
        .eq('is_deleted', false)
        .not('state', 'is', null);
        
      if (statesError) throw new Error(`Error fetching states: ${statesError.message}`);
      
      // Extract unique values
      const uniqueTerritories = [...new Set(territories?.map(t => t.territory).filter(Boolean))];
      const uniqueCities = [...new Set(cities?.map(c => c.city).filter(Boolean))];
      const uniqueStates = [...new Set(states?.map(s => s.state).filter(Boolean))];
      
      setFilterOptions({
        territories: uniqueTerritories.sort(),
        cities: uniqueCities.sort(),
        states: uniqueStates.sort()
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