'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import React from 'react';  // Add this import

const COURIER_OPTIONS = [
  { value: 'bluedart', label: 'BlueDart' },
  { value: 'delhivery', label: 'Delhivery' },
  { value: 'dtdc', label: 'DTDC' },
  { value: 'professional', label: 'Professional' },
  { value: 'other', label: 'Other' }
];

interface TrackingDetailsProps {
  billId: number;
  initialData?: {
    trackingNumber?: string;
    courier?: string;
    weight?: number;
  };
}

export function TrackingDetails({ billId, initialData }: TrackingDetailsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    trackingNumber: initialData?.trackingNumber || '',
    courier: initialData?.courier || '',
    weight: initialData?.weight || '',
  });

  const focusTrackingInput = () => {
    const trackingInput = document.getElementById('trackingInput');
    if (trackingInput) {
      (trackingInput as HTMLInputElement).focus();
      (trackingInput as HTMLInputElement).select();
    }
  };

  const focusCourierSelect = () => {
    const courierSelect = document.getElementById('courierSelect');
    if (courierSelect) {
      (courierSelect as HTMLSelectElement).focus();
    }
  };

  const focusWeightInput = () => {
    const weightInput = document.getElementById('weightInput');
    if (weightInput) {
      (weightInput as HTMLInputElement).focus();
      (weightInput as HTMLInputElement).select();
    }
  };

  useEffect(() => {
    focusTrackingInput();
  }, []);

  const handleTrackingNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && formData.trackingNumber) {
      e.preventDefault();
      focusCourierSelect();
    }
  };

  const handleCourierKeyDown = (e: React.KeyboardEvent<HTMLSelectElement>) => {
    if (e.key === 'Enter' && formData.courier) {
      e.preventDefault();
      focusWeightInput();
    }
  };

  const handleWeightKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && formData.weight) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/billing/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billId,
          ...formData,
          weight: parseFloat(formData.weight.toString())
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      router.push('/billing/online');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update tracking');
      focusTrackingInput();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="trackingInput"
        label="Tracking Number"
        value={formData.trackingNumber}
        onChange={(e) => setFormData(prev => ({ ...prev, trackingNumber: e.target.value }))}
        onKeyDown={handleTrackingNumberKeyDown}
        required
      />

      <Select
        id="courierSelect"
        label="Courier Service"
        value={formData.courier}
        onChange={(e) => setFormData(prev => ({ ...prev, courier: e.target.value }))}
        onKeyDown={handleCourierKeyDown}
        required
      >
        <option value="">Select Courier</option>
        {COURIER_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <Input
        id="weightInput"
        label="Package Weight (kg)"
        type="number"
        step="0.01"
        value={formData.weight}
        onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
        onKeyDown={handleWeightKeyDown}
        
      />

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isLoading}
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
    </form>
  );
}