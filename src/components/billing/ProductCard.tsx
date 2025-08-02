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
}

export interface BillItem {
  productId: number;
  quantity: number;
  price: number;
  total: number;
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
}

interface ProductTableProps {
  onChange: (items: BillItem[]) => void;
  maxRows?: number;
  onCreateBill?: () => void;  // Add this prop
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
  };
}

export const ProductTable = React.forwardRef<ProductTableRef, ProductTableProps>(({ onChange, maxRows = 20,onCreateBill }, ref) => {
  const [rows, setRows] = useState<ProductRow[]>([createInitialRow()]);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState<{ id: string; term: string }>({ id: '', term: '' });
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(-1);
  // const inputRefs = useRef<{ [key: string]: HTMLInputElement }>({});
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const lastCreatedRowId = useRef<string>(''); // Add this ref

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const totalAmount = useMemo(() => {
    return rows.reduce((sum, row) => sum + row.total, 0);
  }, [rows]);

  useEffect(() => {
    return () => {
      lastCreatedRowId.current = '';
    };
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm.term) {
      handleProductSearch(debouncedSearchTerm.id, debouncedSearchTerm.term);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const items = rows
      .filter((row) => row.productId && row.quantity > 0)
      .map((row) => ({
        productId: row.productId!,
        quantity: row.quantity,
        price: row.sellingPrice,
        total: row.total,
      }));
    onChange(items);
  }, [rows, onChange]);

  const handleProductSearch = async (rowId: string, query: string) => {
    if (!query || query.length < 2) return;
  
    setLoading(prev => ({ ...prev, [rowId]: true }));
  
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
  
      // Use ?search= instead of ?q=
      const response = await fetch(
        `/api/products/search?search=${encodeURIComponent(query)}`,
        { signal: controller.signal }
      );

      
  
      // clearTimeout(timeoutId);
  
      if (!response.ok) {
        throw new Error('Search failed');
      }
  
      const products = await response.json();
      console.log(products);

      setRows(prevRows =>
        prevRows.map(row =>
          row.id === rowId
            ? { ...row, productOptions: products }
            : row
        )
      );
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.error('Search request timed out. Please try again.');
      } else {
        toast.error('Failed to search products. Please try again.');
        console.error('Product search error:', error);
      }
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
            }
          : row
      );

      // Add new row if needed and store its ID
      if (!updatedRows.some(row => !row.productId)) {
        const newRow = createInitialRow();
        lastCreatedRowId.current = newRow.id;
        return updatedRows.length < maxRows ? [...updatedRows, newRow] : updatedRows;
      }

      // Find next empty row and store its ID
      const nextEmptyRow = updatedRows.find(row => !row.productId);
      if (nextEmptyRow) {
        lastCreatedRowId.current = nextEmptyRow.id;
      }

      return updatedRows;
    });

    setSelectedOptionIndex(-1);

    // Focus the input after state update
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
          // If this is the last row and it's empty, trigger submit
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
      // Don't remove if it's the last row
      if (prevRows.length === 1) return prevRows;
      return prevRows.filter((row) => row.id !== id);
    });
  }, []);

  const resetTable = useCallback(() => {
    const initialRow = createInitialRow();
    setRows([initialRow]);
    setLoading({});
    setSearchTerm({ id: '', term: '' });
    setSelectedOptionIndex(-1);
    lastCreatedRowId.current = initialRow.id;
    
    // Clear all input refs
    Object.keys(inputRefs.current).forEach(key => {
      if (inputRefs.current[key]) {
        inputRefs.current[key]!.value = '';
      }
    });
    
    // Notify parent of items change
    onChange([]);
  }, [onChange]);
  const focusFirstProductInput = useCallback(() => {
    const firstRowId = rows[0]?.id;
    if (firstRowId && inputRefs.current[firstRowId]) {
      inputRefs.current[firstRowId].focus();
    }
  }, [rows]);

  React.useImperativeHandle(ref, () => ({
    resetTable,
    focusFirstProductInput
  }));

  return (
    <div className="space-y-4">
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
  );
});

ProductTable.displayName = 'ProductTable';