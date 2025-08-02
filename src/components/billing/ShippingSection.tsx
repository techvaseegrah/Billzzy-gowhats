import { Select } from "../ui/Select";
import React from 'react';  // Add this import

// components/billing/ShippingSection.tsx
interface ShippingProps {
    orderTotal: number;
    orderWeight: number;
    onShippingMethodSelect: (shippingDetails: {
      methodId: number;
      cost: number;
      type: string;
    }) => void;
  }

  
  
  export function ShippingSection({ orderTotal, orderWeight, onShippingMethodSelect }: ShippingProps) {
    const calculateShippingCost = (method: ShippingMethod) => {
      if (method.type === 'FREE_SHIPPING' && orderTotal >= (method.minAmount || 0)) {
        return 0;
      }
      
      let cost = method.baseRate;
      if (method.useWeight && method.ratePerKg) {
        cost += (orderWeight * method.ratePerKg);
      }
      return cost;
    };
  
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Shipping Method
          </label>
          <Select
            value={selectedMethod?.id || ''}
            onChange={(e) => handleMethodChange(e.target.value)}
            className="mt-1"
          >
            <option value="">Choose a shipping method</option>
            {methods.map((method) => {
              const cost = calculateShippingCost(method);
              const label = method.useWeight ? 
                `${method.name} (Base: ₹${method.baseRate} + ₹${method.ratePerKg}/kg)` :
                `${method.name} (₹${method.baseRate})`;
                
              return (
                <option key={method.id} value={method.id}>
                  {method.type === 'FREE_SHIPPING' && cost === 0 ? 
                    `${method.name} - Free` : 
                    `${label} - ₹${cost.toFixed(2)}`
                  }
                </option>
              );
            })}
          </Select>
        </div>
  
        {selectedMethod && (
          <div className="text-sm text-gray-600">
            {selectedMethod.type === 'FREE_SHIPPING' ? (
              orderTotal >= (selectedMethod.minAmount || 0) ? (
                <p>Free shipping available</p>
              ) : (
                <p>Add ₹{((selectedMethod.minAmount || 0) - orderTotal).toFixed(2)} more to qualify for free shipping</p>
              )
            ) : (
              <p>
                Base rate: ₹{selectedMethod.baseRate}
                {selectedMethod.useWeight && selectedMethod.ratePerKg && 
                  ` + ₹${selectedMethod.ratePerKg}/kg`}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }