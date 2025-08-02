'use client';

import { useEffect, useState } from 'react';
import { Input } from './Input';
import { LoadingSpinner } from './LoadingSpinner';
import { useDebounce } from '@/hooks/useDebounce';
import React from 'react';  // Add this import

interface Product {
  id: number;
  name: string;
  SKU: string;
  sellingPrice: number;
  quantity: number;
}

interface ProductSearchProps {
  onSelect: (product: Product) => void;
}

export function ProductSearch({ onSelect }: ProductSearchProps) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      setResults(data);
    } catch (error) {
      console.error('Product search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Use debounced search
  useEffect(() => {
    handleSearch(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <div className="relative">
      <Input
        type="search"
        placeholder="Search products by name or SKU..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading && (
        <div className="absolute right-3 top-3">
          <LoadingSpinner size="sm" />
        </div>
      )}

      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          <ul className="divide-y divide-gray-200">
            {results.map((product) => (
              <li
                key={product.id}
                className="p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  onSelect(product);
                  setSearch('');
                  setResults([]);
                }}
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">SKU: {product.SKU}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{product.sellingPrice}</p>
                    <p className="text-sm text-gray-500">Stock: {product.quantity}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}