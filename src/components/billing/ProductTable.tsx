// components/billing/ProductTable.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'react-toastify';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export interface Product {
  id: number;
  name: string;
  SKU: string;
  sellingPrice: number;
  quantity: number;
  availableQuantity?: number;
}

export interface BillItem {
  productId: number;
  name?: string;
  quantity: number;
  price: number;
  total: number;
  SKU?: string;
  availableQuantity?: number;
}

interface ProductRow {
  id: string;
  productId: number | null;
  productName: string;
  availableQuantity: number;
  sellingPrice: number;
  quantity: number;
  total: number;
  productOptions: Product[];
  SKU?: string;
}

interface ProductTableProps {
  onChange: (items: BillItem[]) => void;
  maxRows?: number;
  onCreateBill?: () => void;
  initialItems?: BillItem[];
}

export interface ProductTableRef {
  resetTable: () => void;
  focusFirstProductInput: () => void;
}

function createInitialRow(): ProductRow {
  return {
    id: Math.random().toString(36).substring(2, 9),
    productId: null,
    productName: '',
    availableQuantity: 0,
    sellingPrice: 0,
    quantity: 1,
    total: 0,
    productOptions: [],
    SKU: '',
  };
}

export const ProductTable = React.forwardRef<ProductTableRef, ProductTableProps>(
  ({ onChange, maxRows = 20, onCreateBill, initialItems }, ref) => {
    const [rows, setRows] = useState<ProductRow[]>([createInitialRow()]);
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
    const [searchTerm, setSearchTerm] = useState<{ id: string; term: string }>({ id: '', term: '' });
    const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(-1);
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const lastCreatedRowId = useRef<string>('');

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const totalAmount = useMemo(() => {
      return rows.reduce((sum, row) => sum + row.total, 0);
    }, [rows]);

    // Initialize with initialItems
  // At the beginning of the ProductTable component

  console.log(initialItems, 'initialItems');
  
useEffect(() => {
  if (initialItems?.length && !rows.some(row => row.productId)) {
    const initialRows = initialItems.map((item) => ({
      id: Math.random().toString(36).substring(2, 9),
      productId: item.productId,
      productName: item.name || '',
      availableQuantity: item.availableQuantity || 0,
      sellingPrice: item.price,
      quantity: item.quantity,
      total: item.total,
      productOptions: [],
      SKU: item.SKU || '',
    }));

    if (initialRows.length < maxRows) {
      initialRows.push(createInitialRow());
    }

    setRows(initialRows);
  }
}, [initialItems, maxRows]); // Only run when initialItems or maxRows changes

    useEffect(() => {
      if (debouncedSearchTerm.term) {
        handleProductSearch(debouncedSearchTerm.id, debouncedSearchTerm.term);
      }
    }, [debouncedSearchTerm]);

    const handleProductSearch = async (rowId: string, query: string) => {
      if (!query || query.length < 2) return;

      setLoading(prev => ({ ...prev, [rowId]: true }));

      try {
        const response = await fetch(
          `/api/products/search?search=${encodeURIComponent(query)}`,
          { 
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const products = await response.json();
        
        setRows(prevRows =>
          prevRows.map(row =>
            row.id === rowId
              ? { 
                  ...row, 
                  productOptions: products.map((p: Product) => ({
                    ...p,
                    name: p.name || p.productName,
                    SKU: p.SKU || p.sku,
                    sellingPrice: p.sellingPrice || p.price
                  }))
                }
              : row
          )
        );
      } catch (error: any) {
        toast.error('Failed to search products');
        console.error('Product search error:', error);
      } finally {
        setLoading(prev => ({ ...prev, [rowId]: false }));
      }
    };

    const handleInputChange = useCallback((rowId: string, value: string) => {
      setRows(prevRows =>
        prevRows.map(row =>
          row.id === rowId ? { ...row, productName: value } : row
        )
      );
      
      setSearchTerm({ id: rowId, term: value });
      setSelectedOptionIndex(-1);
    }, []);

    const handleProductSelect = useCallback((rowId: string, product: Product) => {
      setRows((prevRows) => {
        const updatedRows = prevRows.map((row) =>
          row.id === rowId
            ? {
                ...row,
                productId: product.id,
                productName: product.name,
                availableQuantity: product.quantity,
                sellingPrice: product.sellingPrice,
                quantity: 1,
                total: product.sellingPrice,
                productOptions: [],
                SKU: product.SKU,
              }
            : row
        );

        if (!updatedRows.some(row => !row.productId)) {
          const newRow = createInitialRow();
          lastCreatedRowId.current = newRow.id;
          return updatedRows.length < maxRows ? [...updatedRows, newRow] : updatedRows;
        }

        const nextEmptyRow = updatedRows.find(row => !row.productId);
        if (nextEmptyRow) {
          lastCreatedRowId.current = nextEmptyRow.id;
        }

        return updatedRows;
      });

      setSelectedOptionIndex(-1);

      setTimeout(() => {
        const newInput = inputRefs.current[lastCreatedRowId.current];
        if (newInput) {
          newInput.focus();
        }
      }, 0);
    }, [maxRows]);

    const handleQuantityChange = useCallback((rowId: string, quantityStr: string) => {
      const quantity = parseInt(quantityStr, 10);
      if (isNaN(quantity) || quantity < 0) return;

      setRows((prevRows) =>
        prevRows.map((row) => {
          if (row.id !== rowId) return row;
          
          const finalQuantity = quantity > row.availableQuantity ? row.availableQuantity : quantity;
          
          if (finalQuantity !== quantity) {
            toast.error(`Only ${row.availableQuantity} units available`);
          }

          return {
            ...row,
            quantity: finalQuantity,
            total: row.sellingPrice * finalQuantity,
          };
        })
      );
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent, rowId: string) => {
      const options = rows.find(r => r.id === rowId)?.productOptions || [];
      const currentRow = rows.find(r => r.id === rowId);
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedOptionIndex(prev => 
            prev < options.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedOptionIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (options.length > 0) {
            if (selectedOptionIndex >= 0 && options[selectedOptionIndex]) {
              handleProductSelect(rowId, options[selectedOptionIndex]);
            } else if (options.length === 1) {
              handleProductSelect(rowId, options[0]);
            }
          } else {
            const isLastRow = rowId === rows[rows.length - 1].id;
            const isEmpty = !currentRow?.productName;
            if (isLastRow && isEmpty && onCreateBill) {
              onCreateBill();
            }
          }
          break;
        case 'Escape':
          setRows(prevRows =>
            prevRows.map(row =>
              row.id === rowId ? { ...row, productOptions: [] } : row
            )
          );
          setSelectedOptionIndex(-1);
          break;
      }
    }, [rows, selectedOptionIndex, handleProductSelect, onCreateBill]);

    const removeRow = useCallback((id: string) => {
      setRows((prevRows) => {
        if (prevRows.length === 1) return prevRows;
        return prevRows.filter((row) => row.id !== id);
      });
    }, []);

    useEffect(() => {
      const items = rows
        .filter((row) => row.productId && row.quantity > 0)
        .map((row) => ({
          productId: row.productId!,
          name: row.productName,
          quantity: row.quantity,
          price: row.sellingPrice,
          total: row.total,
          SKU: row.SKU,
          availableQuantity: row.availableQuantity
        }));
      onChange(items);
    }, [rows, onChange]);

    const resetTable = useCallback(() => {
      const initialRow = createInitialRow();
      setRows([initialRow]);
      setLoading({});
      setSearchTerm({ id: '', term: '' });
      setSelectedOptionIndex(-1);
      lastCreatedRowId.current = initialRow.id;
      onChange([]);
    }, [onChange]);

    const focusFirstProductInput = useCallback(() => {
      const firstRowId = rows[0]?.id;
      if (firstRowId && inputRefs.current[firstRowId]) {
        inputRefs.current[firstRowId]?.focus();
      }
    }, [rows]);

    React.useImperativeHandle(ref, () => ({
      resetTable,
      focusFirstProductInput
    }));


  return (
    <div className="space-y-4">
      <div className="hidden md:block">
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Product</th>
            <th className="px-4 py-2 border">Available</th>
            <th className="px-4 py-2 border">Quantity</th>
            <th className="px-4 py-2 border">Price</th>
            <th className="px-4 py-2 border">Total</th>
            <th className="px-4 py-2 border"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-2 border relative">
              <input
      ref={(el) => {
        inputRefs.current[row.id] = el;
      }}
      type="text"
      className='outline rounded outline-gray-200 w-[100%] p-2'
      placeholder="Search product..."
      value={row.productName}
      onChange={(e) => handleInputChange(row.id, e.target.value.toUpperCase())}
      onKeyDown={(e) => handleKeyDown(e, row.id)}
    />
                {loading[row.id] && (
                  <div className="absolute right-3 top-3">
                    <LoadingSpinner />
                  </div>
                )}
                {row.productOptions.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {row.productOptions.map((product, index) => (
                      <li
                        key={product.id}
                        className={`p-2 cursor-pointer ${
                          index === selectedOptionIndex ? 'bg-gray-100' : 'hover:bg-gray-100'
                        }`}
                        onClick={() => handleProductSelect(row.id, product)}
                      >
                        <div className="flex justify-between">
                          <span>{product.name}</span>
                          <span>₹{product.sellingPrice.toFixed(2)}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          SKU: {product.SKU} | Stock: {product.quantity}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </td>
              <td className="px-4 py-2 border text-center">
                {row.availableQuantity}
              </td>
              <td className="px-4 py-2 border">
                <Input
                  type="number"
                  min="1"
                  max={row.availableQuantity}
                  value={row.quantity}
                  onChange={(e) => handleQuantityChange(row.id, e.target.value)}
                  disabled={!row.productId}
                />
              </td>
              <td className="px-4 py-2 border text-right">
                ₹{row.sellingPrice.toFixed(2)}
              </td>
              <td className="px-4 py-2 border text-right">
                ₹{row.total.toFixed(2)}
              </td>
              <td className="px-4 py-2 border text-center">
                {rows.length > 1 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeRow(row.id)}
                  >
                    Remove
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} className="px-4 py-2 border text-right font-bold">
              Total Amount:
            </td>
            <td className="px-4 py-2 border text-right font-bold">
              ₹{totalAmount.toFixed(2)}
            </td>
            <td className="px-4 py-2 border"></td>
          </tr>
        </tfoot>
      </table>
   </div>
      {/* Mobile View */}
<div className="md:hidden">
  <div className="space-y-4">
    {rows.map((row) => (
      <div key={row.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Search Input Section */}
        <div className="p-4 relative">
          <input
            ref={(el) => {
              inputRefs.current[row.id] = el;
            }}
            type="text"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search product..."
            value={row.productName}
            onChange={(e) => handleInputChange(row.id, e.target.value.toUpperCase())}
            onKeyDown={(e) => handleKeyDown(e, row.id)}
          />
          
          {/* Loading Spinner */}
          {loading[row.id] && (
            <div className="absolute right-6 top-6">
              <LoadingSpinner />
            </div>
          )}

          {/* Search Results Dropdown */}
          {row.productOptions.length > 0 && (
            <ul className="absolute z-10 left-4 right-4 mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
              {row.productOptions.map((product, index) => (
                <li
                  key={product.id}
                  className={`p-3 border-b last:border-b-0 ${
                    index === selectedOptionIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleProductSelect(row.id, product)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-blue-600">₹{product.sellingPrice.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    SKU: {product.SKU} • Stock: {product.quantity}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Product Details Section */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Available Quantity */}
            <div className="bg-gray-50 p-3 rounded-md">
              <label className="text-sm text-gray-500 block mb-1">Available</label>
              <span className="font-medium">{row.availableQuantity}</span>
            </div>

            {/* Quantity Input */}
            <div className="bg-gray-50 p-3 rounded-md">
              <label className="text-sm text-gray-500 block mb-1">Quantity</label>
              <Input
                type="number"
                min="1"
                max={row.availableQuantity}
                value={row.quantity}
                onChange={(e) => handleQuantityChange(row.id, e.target.value)}
                disabled={!row.productId}
                className="w-full"
              />
            </div>

            {/* Price */}
            <div className="bg-gray-50 p-3 rounded-md">
              <label className="text-sm text-gray-500 block mb-1">Price</label>
              <span className="font-medium">₹{row.sellingPrice.toFixed(2)}</span>
            </div>

            {/* Total */}
            <div className="bg-gray-50 p-3 rounded-md">
              <label className="text-sm text-gray-500 block mb-1">Total</label>
              <span className="font-medium">₹{row.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Remove Button */}
          {rows.length > 1 && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeRow(row.id)}
                className="w-full sm:w-auto"
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      </div>
    ))}

    {/* Total Amount Card */}
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-700">Total Amount</span>
        <span className="text-lg font-bold text-blue-600">₹{totalAmount.toFixed(2)}</span>
      </div>
    </div>
  </div>
</div>
    </div>
  );
});

ProductTable.displayName = 'ProductTable';