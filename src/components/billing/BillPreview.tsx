'use client';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { BillItem } from '@/types/billing';
import React from 'react';  // Add this import

interface BillPreviewProps {
  items: BillItem[];
  onQuantityChange: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  readonly?: boolean;
}

export function BillPreview({ 
  items, 
  onQuantityChange, 
  onRemoveItem,
  readonly = false 
}: BillPreviewProps) {
  const total = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            {!readonly && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.productId}>
              <td className="px-6 py-4 whitespace-nowrap">
                {/* {item.productName} */}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {readonly ? (
                  item.quantity
                ) : (
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => onQuantityChange(item.productId, parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                ₹{item.price.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                ₹{item.total.toFixed(2)}
              </td>
              {!readonly && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemoveItem(item.productId)}
                  >
                    Remove
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="px-6 py-4 text-right font-medium">
              Total:
            </td>
            <td className="px-6 py-4 whitespace-nowrap font-medium">
              ₹{total.toFixed(2)}
            </td>
            {!readonly && <td />}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}