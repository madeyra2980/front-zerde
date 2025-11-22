import { useState, useMemo, useRef, useEffect } from 'react';

export const useSearch = (items, searchFields) => {
  const [searchTerm, setSearchTerm] = useState('');
  const searchFieldsRef = useRef(searchFields);

  useEffect(() => {
    searchFieldsRef.current = searchFields;
  }, [searchFields]);

  const filteredItems = useMemo(() => {
    if (!searchTerm) {
      return items;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return items.filter(item => {
      return searchFieldsRef.current.some(field => {
        const value = typeof field === 'function' ? field(item) : item[field];
        return value?.toLowerCase().includes(lowerSearchTerm);
      });
    });
  }, [items, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredItems
  };
};

