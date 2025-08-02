'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState, useEffect } from 'react';
import React from 'react';

interface Product {
  id: number;
  SKU: string;
  name: string;
  quantity: number;
  verifiedQuantity: number;
  verified: boolean;
}

interface PackingBill {
  billNo: number;
  products: Product[];
  allVerified: boolean;
}

interface VerificationMessage {
  timestamp: string;
  text: string;
  type: 'progress' | 'complete';
}

export default function PackingModule() {
  const [billNo, setBillNo] = useState('');
  const [SKU, setSKU] = useState('');
  const [currentBill, setCurrentBill] = useState<PackingBill | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationHistory, setVerificationHistory] = useState<VerificationMessage[]>([]);
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedMode = localStorage.getItem('isManualMode');
      if (storedMode !== null) {
        setIsManualMode(JSON.parse(storedMode));
      }
      setIsHydrated(true);
    }
  }, []);

  const focusBillInput = () => {
    const billInput = document.getElementById('billInput');
    if (billInput) {
      (billInput as HTMLInputElement).focus();
      (billInput as HTMLInputElement).select();
    }
  };

  const focusSKUInput = () => {
    const skuInput = document.getElementById('skuInput');
    if (skuInput) {
      (skuInput as HTMLInputElement).focus();
      (skuInput as HTMLInputElement).select();
    }
  };

  useEffect(() => {
    focusBillInput();
  }, [isHydrated]);

  const handleBillNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBillNo(value);

    if (value.length >= 2 && !isManualMode) {
      fetchBillDetails(value);
    }
  };

  const fetchBillDetails = async (billNumber: string) => {
    if (!billNumber) return;

    try {
      setIsLoading(true);
      setError('');
      setVerificationHistory([]);

      const response = await fetch(`/api/packing/packingId/${billNumber}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bill details');
      }

      const data = await response.json();
      setCurrentBill({
        billNo: data.billNo,
        products: data.products.map((p: any) => ({ 
          ...p, 
          verified: false,
          verifiedQuantity: 0 
        })),
        allVerified: false
      });
      setBillNo('');
      setTimeout(focusSKUInput, 100);

    } catch (error) {
      console.error('Fetch error:', error);
      setError('Error fetching bill details. Please try again.');
      setBillNo('');
      focusBillInput();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSKUChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setSKU(value);

    if (value.length >= 2 && !isManualMode) {
      verifySKU(value);
    }
  };

  const verifySKU = async (skuValue: string) => {
    if (!currentBill || !skuValue) return;

    const product = currentBill.products.find(p => 
      p.SKU === skuValue && p.verifiedQuantity < p.quantity
    );
    
    if (!product) {
      const overVerifiedProduct = currentBill.products.find(p => p.SKU === skuValue);
      if (overVerifiedProduct) {
        setError(`All ${overVerifiedProduct.quantity} units of ${overVerifiedProduct.name} have already been verified`);
      } else {
        setError('Invalid SKU or product not found in this bill');
      }
      setSKU('');
      focusSKUInput();
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const updatedProducts = currentBill.products.map(p => {
        if (p.SKU === skuValue) {
          const newVerifiedQuantity = p.verifiedQuantity + 1;
          
          const message: VerificationMessage = {
            timestamp: new Date().toLocaleTimeString(),
            text: `Unit ${newVerifiedQuantity} of ${p.quantity} verified for ${p.name}`,
            type: newVerifiedQuantity === p.quantity ? 'complete' : 'progress'
          };

          setVerificationHistory(prev => [...prev, message]);

          return {
            ...p,
            verifiedQuantity: newVerifiedQuantity,
            verified: newVerifiedQuantity === p.quantity
          };
        }
        return p;
      });

      const allVerified = updatedProducts.every(p => p.verified);
      
      setCurrentBill({
        ...currentBill,
        products: updatedProducts,
        allVerified
      });

      setSKU('');

      if (allVerified) {
        const finalMessage: VerificationMessage = {
          timestamp: new Date().toLocaleTimeString(),
          text: 'All products have been fully verified! Completing packing...',
          type: 'complete'
        };
        setVerificationHistory(prev => [...prev, finalMessage]);

        try {
          const response = await fetch(`/api/packing/packingComplete/${currentBill.billNo}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Failed to update packing status');
          }
          
          setTimeout(() => {
            window.location.reload();
          }, 200);
          
        } catch (error) {
          console.error('Error updating packing status:', error);
          focusSKUInput();
        }
      } else {
        setTimeout(() => {
          focusSKUInput();
        }, 100);
      }

    } catch (error) {
      setError('Error verifying SKU. Please try again.');
      console.error('Verification error:', error);
      focusSKUInput();
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualModeToggle = () => {
    setIsManualMode((prev) => {
      const newMode = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('isManualMode', JSON.stringify(newMode));
      }
      setError('');
      setBillNo('');
      setSKU('');
      setCurrentBill(null);
      setVerificationHistory([]);
      focusBillInput();
      return newMode;
    });
  };

  const handleBillSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (billNo.length >= 1) {
      fetchBillDetails(billNo);
    } else {
      setError('Bill number must be at least 2 characters.');
      focusBillInput();
    }
  };

  const handleSKUSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (SKU.length >= 2) {
      verifySKU(SKU);
    } else {
      setError('SKU must be at least 2 characters.');
      focusSKUInput();
    }
  };

  if (!isHydrated) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto p-2 sm:p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-lg sm:text-xl  font-semibold mb-4 sm:mb-0">
            Packing Verification
          </h2>
          <Button
            onClick={handleManualModeToggle}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            {isManualMode ? 'Scanner Mode' : 'Manual Mode'}
          </Button>
        </div>

        {/* Bill Number Input */}
        <form
          onSubmit={isManualMode ? handleBillSubmit : undefined}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <Input
            id="billInput"
            type="text"
            placeholder={
              isManualMode ? 'Enter Bill Number' : 'Scan Bill Number'
            }
            value={billNo}
            onChange={handleBillNoChange}
            className="flex-1"
            disabled={isLoading || (!isManualMode && currentBill !== null)}
          />
          {isManualMode && (
            <Button
              type="submit"
              disabled={isLoading || !billNo}
              className="mt-2 sm:mt-0 sm:w-[150px]"
            >
              Fetch Bill
            </Button>
          )}
        </form>

        {/* SKU Input */}
        {currentBill && (
          <form
            onSubmit={isManualMode ? handleSKUSubmit : undefined}
            className="mb-6"
          >
            <Input
              id="skuInput"
              type="text"
              placeholder={isManualMode ? 'Enter SKU' : 'Scan SKU'}
              value={SKU}
              onChange={handleSKUChange}
              className="w-full"
              disabled={isLoading || currentBill.allVerified}
            />
          </form>
        )}

        {/* Current Bill Details */}
        {currentBill && (
          <div className="space-y-6">
            {/* Products to Pack */}
            <div>
              <h3 className="text-md sm:text-lg font-semibold mb-2">
                Products to Pack:
              </h3>
              <div className="space-y-2">
                {currentBill.products
                  .filter((product) => !product.verified)
                  .map((product) => (
                    <div
                      key={product.SKU}
                      className="p-3 rounded-lg border border-gray-200 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center"
                    >
                      <div className="mb-2 sm:mb-0">
                        <span className="font-medium">{product.name}</span>
                      
                      </div>
                      <div className="text-sm">
                        <span
                          className={
                            product.verifiedQuantity > 0
                              ? 'text-blue-600'
                              : ''
                          }
                        >
                          {product.verifiedQuantity} / {product.quantity} units
                          verified
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Verified Products */}
            <div>
              <h3 className="text-md sm:text-lg font-semibold mb-2">
                Verified Products:
              </h3>
              <div className="space-y-2">
                {currentBill.products
                  .filter((product) => product.verified)
                  .map((product) => (
                    <div
                      key={product.SKU}
                      className="p-3 rounded-lg border border-green-200 bg-green-50 flex flex-col sm:flex-row justify-between items-start sm:items-center"
                    >
                      <div className="mb-2 sm:mb-0">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          (SKU: {product.SKU})
                        </span>
                      </div>
                      <div className="text-sm">
                        All {product.quantity} units verified ✓
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Verification History */}
            {verificationHistory.length > 0 && (
              <div>
                <h3 className="text-md sm:text-lg font-semibold mb-2">
                  Verification History:
                </h3>
                <div className="max-h-40 overflow-y-auto space-y-2 p-2 bg-gray-50 rounded">
                  {verificationHistory.map((message, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-lg ${
                        message.type === 'complete'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {/* <span className="text-sm font-medium">{message.timestamp}</span> */}
                      <span className="ml-2 text-sm">{message.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Verified Message */}
            {currentBill.allVerified && (
              <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                <p className="font-semibold">
                  All products verified successfully!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}