// useProductData.ts
// Custom hook for managing product data and operations

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../utils/supabase';
import { Product, FilterState } from '../types';
import toast from 'react-hot-toast';

export const useProductData = (initialPage = 1, initialSortColumn = 'created_at', initialSortDirection: 'asc' | 'desc' = 'desc') => {
  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    category: '',
    activeOnly: true
  });
  
  // Sorting and pagination states
  const [sortColumn, setSortColumn] = useState<string>(initialSortColumn);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const productsPerPage = 10;

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });
      
      // Apply active filter
      if (selectedFilters.activeOnly) {
        query = query.eq('is_active', true);
      }
      
      // Get total count
      const { count, error: countError } = await query;
      
      if (countError) throw new Error(`Error counting products: ${countError.message}`);
      
      setTotalProducts(count || 0);
      
      // Fetch paginated data
      const { data, error: fetchError } = await query
        .order(sortColumn, { ascending: sortDirection === 'asc' })
        .range((currentPage - 1) * productsPerPage, currentPage * productsPerPage - 1);
      
      if (fetchError) throw new Error(`Error fetching products: ${fetchError.message}`);
      
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, sortColumn, sortDirection, selectedFilters.activeOnly, productsPerPage]);

  // Filter and search products
  const filterAndSearchProducts = useCallback(() => {
    let result = [...products];
    
    // Apply search
    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(lowerSearchTerm) ||
        (product.category && product.category.toLowerCase().includes(lowerSearchTerm)) ||
        (product.unit_of_measure && product.unit_of_measure.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    // Apply category filter
    if (selectedFilters.category) {
      result = result.filter(product => product.category === selectedFilters.category);
    }
    
    setFilteredProducts(result);
  }, [products, searchTerm, selectedFilters]);

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
    if (filterType === 'activeOnly') {
      setCurrentPage(1); // Reset to first page
    }
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSelectedFilters({
      category: '',
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
    const maxPage = Math.ceil(totalProducts / productsPerPage);
    if (page > maxPage) return;
    
    setCurrentPage(page);
  }, [totalProducts, productsPerPage]);

  // Delete a product (soft delete by setting is_active to false)
  const deleteProduct = useCallback(async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('product_id', productId);
        
      if (error) throw error;
      
      // Refresh the data
      await fetchProducts();
      
      // Handle if we're on a page that no longer exists after deletion
      const newMaxPage = Math.ceil((totalProducts - 1) / productsPerPage);
      if (currentPage > newMaxPage && newMaxPage > 0) {
        setCurrentPage(newMaxPage);
      }
      
      toast.success('Product deleted successfully');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Failed to delete product');
    }
  }, [fetchProducts, totalProducts, productsPerPage, currentPage]);

  // Fetch products when dependencies change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Apply filters and search when they change
  useEffect(() => {
    filterAndSearchProducts();
  }, [filterAndSearchProducts]);

  return {
    products: filteredProducts,
    totalProducts,
    isLoading,
    error,
    searchTerm,
    selectedFilters,
    sortColumn,
    sortDirection,
    currentPage,
    productsPerPage,
    setSearchTerm,
    handleSearch,
    handleFilterChange,
    clearFilters,
    handleSort,
    handlePageChange,
    fetchProducts,
    deleteProduct
  };
};