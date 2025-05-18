// SearchFilters.tsx
// Component for search and filtering controls for products

import React from 'react';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import { FilterOptions, FilterState } from '../types';
import { cn } from '../../../utils/cn';

interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showFilters: boolean;
  toggleFilters: () => void;
  selectedFilters: FilterState;
  clearFilters: () => void;
  filterOptions: FilterOptions;
  onFilterChange: (filterType: keyof FilterState, value: any) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchTerm,
  onSearchChange,
  showFilters,
  toggleFilters,
  selectedFilters,
  clearFilters,
  filterOptions,
  onFilterChange
}) => {
  return (
    <div className="card mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Search products by name, category..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        {/* Filter button */}
        <button
          onClick={toggleFilters}
          className={cn(
            "btn btn-outline flex items-center whitespace-nowrap",
            showFilters && "bg-primary-50 text-primary-700 border-primary-300"
          )}
        >
          <Filter size={16} className="mr-2" />
          <span>Filters</span>
          <ChevronDown size={16} className={`ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
        
        {(selectedFilters.category || selectedFilters.schemeType || !selectedFilters.activeOnly) ? (
          <button
            onClick={clearFilters}
            className="text-slate-600 hover:text-slate-800 text-sm flex items-center whitespace-nowrap"
          >
            <X size={14} className="mr-1" />
            Clear filters
          </button>
        ) : null}
      </div>
      
      {/* Filter options */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={selectedFilters.category}
              onChange={(e) => onFilterChange('category', e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {filterOptions.categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          {/* Active Only toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="activeOnly"
              checked={selectedFilters.activeOnly}
              onChange={(e) => onFilterChange('activeOnly', e.target.checked)}
              className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="activeOnly" className="text-sm font-medium text-slate-700">
              Show active products only
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters