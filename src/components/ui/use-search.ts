import { useState, useMemo, useCallback, useEffect } from 'react';

export interface SearchableItem {
  [key: string]: any;
}

export interface UseSearchOptions {
  searchFields: string[];
  debounceMs?: number;
}

export function useSearch<T extends SearchableItem>(
  items: T[],
  options: UseSearchOptions
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, options.debounceMs ?? 300);

    return () => clearTimeout(timer);
  }, [searchTerm, options.debounceMs]);

  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return items;
    }

    const searchLower = debouncedSearchTerm.toLowerCase();
    
    return items.filter((item) => {
      return options.searchFields.some((field) => {
        const fieldValue = getNestedValue(item, field);
        if (fieldValue == null) return false;
        
        const stringValue = String(fieldValue).toLowerCase();
        return stringValue.includes(searchLower);
      });
    });
  }, [items, debouncedSearchTerm, options.searchFields]);

  const hasResults = filteredItems.length > 0;
  const isSearching = debouncedSearchTerm.trim().length > 0;

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  }, []);

  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  return {
    searchTerm,
    debouncedSearchTerm,
    filteredItems,
    hasResults,
    isSearching,
    clearSearch,
    updateSearchTerm
  };
}

// Helper function to get nested object values
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}