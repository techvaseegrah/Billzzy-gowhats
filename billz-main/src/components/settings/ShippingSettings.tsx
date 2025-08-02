'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { toast } from 'react-toastify';
import React from 'react';

interface ShippingMethod {
  id?: number;
  name: string;
  type: 'FREE_SHIPPING' | 'COURIER_PARTNER' | 'CUSTOM_SHIPPING';
  minAmount?: number;
  useWeight: boolean;
  ratePerKg?: number;
  fixedRate?: number;
  customRate?: number; // For custom shipping rate
  isActive: boolean;
}

export function ShippingSettings() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);

  useEffect(() => {
    fetchShippingMethods();
  }, []);

  const fetchShippingMethods = async () => {
    try {
      const response = await fetch('/api/settings/shipping/methods');
      if (response.ok) {
        const data = await response.json();
        setMethods(data);
      }
    } catch (error) {
      toast.error('Failed to fetch shipping methods');
    }
  };

  const addNewMethod = () => {
    const newMethod: ShippingMethod = {
      name: '',
      type: 'COURIER_PARTNER',
      useWeight: false,
      isActive: true,
    };
    setMethods([...methods, newMethod]);
    setIsEditing(methods.length);
  };

  const handleMethodDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/settings/shipping/methods?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setMethods(methods.filter(m => m.id !== id));
        toast.success('Shipping method deleted');
      } else {
        toast.error('Failed to delete shipping method');
      }
    } catch (error) {
      toast.error('Failed to delete shipping method');
    }
  };

  const handleMethodSave = async (method: ShippingMethod, index: number) => {
    if (!method.name) {
      toast.error('Please enter a method name');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/shipping/methods', {
        method: method.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(method),
      });

      if (!response.ok) throw new Error('Failed to save shipping method');
      
      const savedMethod = await response.json();
      const updatedMethods = [...methods];
      updatedMethods[index] = savedMethod;
      setMethods(updatedMethods);
      setIsEditing(null);
      
      toast.success('Shipping method saved successfully');
    } catch (error) {
      toast.error('Failed to save shipping method');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 md:p-6">
      <div className="bg-white rounded-lg border">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:p-6 border-b">
          <h3 className="text-lg font-medium mb-4 md:mb-0">Current Shipping Methods</h3>
          <Button onClick={addNewMethod} className="w-full md:w-auto">
            Add New Method
          </Button>
        </div>

        <div className="divide-y">
          {methods.map((method, index) => (
            <div key={index} className="p-4 md:p-6">
              {isEditing === index ? (
                <div className="space-y-4">
                  <Input
                    label="Method Name"
                    value={method.name}
                    onChange={(e) => {
                      const updated = [...methods];
                      updated[index] = { ...method, name: e.target.value };
                      setMethods(updated);
                    }}
                  />

                  <Select
                    label="Shipping Type"
                    value={method.type}
                    onChange={(e) => {
                      const updated = [...methods];
                      updated[index] = { 
                        ...method, 
                        type: e.target.value as ShippingMethod['type'],
                        useWeight: false,
                        ratePerKg: undefined,
                        fixedRate: undefined,
                        customRate: e.target.value === 'CUSTOM_SHIPPING' ? 0 : undefined // Initialize custom rate when 'CUSTOM_SHIPPING' is selected
                      };
                      setMethods(updated);
                    }}
                    className="w-full"
                  >
                    <option value="FREE_SHIPPING">Free Shipping</option>
                    <option value="COURIER_PARTNER">Courier Partner</option>
                    <option value="CUSTOM_SHIPPING">Custom Shipping</option>
                  </Select>

                  {method.type === 'FREE_SHIPPING' && (
                    <Input
                      type="number"
                      label="Minimum Order Amount (optional)"
                      value={method.minAmount || ''}
                      onChange={(e) => {
                        const updated = [...methods];
                        updated[index] = { 
                          ...method, 
                          minAmount: e.target.value ? parseFloat(e.target.value) : undefined 
                        };
                        setMethods(updated);
                      }}
                    />
                  )}

                  {method.type === 'COURIER_PARTNER' && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={method.useWeight}
                          onChange={(checked) => {
                            const updated = [...methods];
                            updated[index] = { 
                              ...method, 
                              useWeight: checked,
                              ratePerKg: checked ? method.ratePerKg : undefined,
                              fixedRate: checked ? undefined : method.fixedRate
                            };
                            setMethods(updated);
                          }}
                        />
                        <span>Use Weight-based Pricing</span>
                      </div>

                      {method.useWeight ? (
                        <Input
                          type="number"
                          label="Rate per KG"
                          value={method.ratePerKg || ''}
                          onChange={(e) => {
                            const updated = [...methods];
                            updated[index] = { 
                              ...method, 
                              ratePerKg: e.target.value ? parseFloat(e.target.value) : undefined
                            };
                            setMethods(updated);
                          }}
                        />
                      ) : (
                        <Input
                          type="number"
                          label="Fixed Shipping Rate"
                          value={method.fixedRate || ''}
                          onChange={(e) => {
                            const updated = [...methods];
                            updated[index] = { 
                              ...method, 
                              fixedRate: e.target.value ? parseFloat(e.target.value) : undefined
                            };
                            setMethods(updated);
                          }}
                        />
                      )}
                    </>
                  )}

                  {method.type === 'CUSTOM_SHIPPING' && (
                    <Input
                      type="number"
                      label="Custom Shipping Rate"
                      value={method.customRate || ''}
                      onChange={(e) => {
                        const updated = [...methods];
                        updated[index] = { 
                          ...method, 
                          customRate: e.target.value ? parseFloat(e.target.value) : undefined 
                        };
                        setMethods(updated);
                      }}
                    />
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={method.isActive}
                      onChange={(checked) => {
                        const updated = [...methods];
                        updated[index] = { ...method, isActive: checked };
                        setMethods(updated);
                      }}
                    />
                    <span>Active</span>
                  </div>

                  <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-4 pt-4">
                    <Button
                      variant="secondary"
                      onClick={() => setIsEditing(null)}
                      className="w-full md:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleMethodSave(method, index)}
                      isLoading={isLoading}
                      className="w-full md:w-auto"
                    >
                      Save Method
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <div className="w-full md:w-auto">
                    <h4 className="font-medium">{method.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {method.type === 'FREE_SHIPPING' ? (
                        method.minAmount
                          ? `Free shipping for orders above ₹${method.minAmount}`
                          : 'Completely free shipping'
                      ) : method.type === 'CUSTOM_SHIPPING' ?
                        `Custom shipping rate: ₹${method.customRate}` :
                        method.useWeight ? 
                        `Weight-based: ₹${method.ratePerKg}/kg` : 
                        `Fixed rate: ₹${method.fixedRate}`
                      }
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
                    <div className="flex items-center space-x-2 w-full md:w-auto">
                      <Switch
                        checked={method.isActive}
                        onChange={(checked) => {
                          const updated = [...methods];
                          updated[index] = { ...method, isActive: checked };
                          setMethods(updated);
                          handleMethodSave(updated[index], index);
                        }}
                      />
                      <span>Active</span>
                    </div>
                    <div className="flex space-x-2 w-full md:w-auto">
                      <Button
                        variant="secondary"
                        onClick={() => setIsEditing(index)}
                        className="flex-1 md:flex-none"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => method.id && handleMethodDelete(method.id)}
                        className="flex-1 md:flex-none"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
