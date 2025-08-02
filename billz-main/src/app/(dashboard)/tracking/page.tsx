'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-toastify';
import React from 'react';

export default function TrackingPage() {
  const router = useRouter();
  const [billId, setBillId] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [weight, setWeight] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const billIdRef = useRef<HTMLInputElement>(null);
  const trackingNumberRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Set initial focus on bill ID input when component mounts
    if (billIdRef.current) {
      billIdRef.current.focus();
    }
  }, []);

  const handleBillIdKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && billId) {
      e.preventDefault();
      trackingNumberRef.current?.focus();
    }
  };

  const handleTrackingNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && trackingNumber) {
      e.preventDefault();
      weightRef.current?.focus();
    }
  };

  const handleWeightKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && weight) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const validateInputs = () => {
    if (!billId.trim()) {
      toast.error('Please enter Bill ID');
      billIdRef.current?.focus();
      return false;
    }

    if (!trackingNumber.trim()) {
      toast.error('Please enter Tracking Number');
      trackingNumberRef.current?.focus();
      return false;
    }



    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/billing/tracking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billId: billId,
          trackingNumber,
          weight: parseFloat(weight),
          status: 'sent'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast.success('Tracking details updated successfully');
      
      // Reset form
      setBillId('');
      setTrackingNumber('');
      setWeight('');
      
      // Set focus back to bill ID for next entry
      billIdRef.current?.focus();
      
      router.push('/tracking');
    } catch (error) {
      toast.error('Failed to update tracking details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-2 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold hidden md:block mb-6">Enter Tracking Details</h1>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bill ID
                  </label>
                  <Input
                    ref={billIdRef}
                    type="text"
                    value={billId}
                    onChange={(e) => setBillId(e.target.value)}
                    onKeyDown={handleBillIdKeyDown}
                    placeholder="Enter Bill ID"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tracking Number
                  </label>
                  <Input
                    ref={trackingNumberRef}
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                    onKeyDown={handleTrackingNumberKeyDown}
                    required
                    placeholder="Enter tracking number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <Input
                    ref={weightRef}
                    type="number"
                    step="0.01"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    onKeyDown={handleWeightKeyDown}
                    placeholder="Enter weight"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.push('/billing/online')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isLoading}
                  >
                    Save Tracking Details
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}