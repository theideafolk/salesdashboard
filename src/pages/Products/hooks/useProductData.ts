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
      // Build query with filters
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);
      
      // Apply category filter
      if (selectedFilters.category) {
        query = query.eq('category', selectedFilters.category);
      }
      
      // Apply search if present
      if (searchTerm.trim()) {
        query = query.or(
          `name.ilike.%${searchTerm}%,` +
          `category.ilike.%${searchTerm}%`
        );
      }
      
      const { data: allProducts, error: fetchError } = await query;
      
      if (fetchError) throw new Error(`Error fetching products: ${fetchError.message}`);
      
      if (!allProducts) {
        setProducts([]);
        setTotalProducts(0);
        return;
      }
      
      // Sort the products
      const sortedProducts = [...allProducts].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        if (sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
      });
      
      setProducts(sortedProducts);
      setTotalProducts(sortedProducts.length);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [sortColumn, sortDirection, selectedFilters, searchTerm]);

  // Filter and search products
  const filterAndSearchProducts = useCallback(() => {
    // Apply pagination after filtering
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const paginatedProducts = products.slice(start, end);
    
    setFilteredProducts(paginatedProducts);
  }, [products, currentPage, productsPerPage]);

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
    setCurrentPage(1); // Reset to first page when changing filters
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