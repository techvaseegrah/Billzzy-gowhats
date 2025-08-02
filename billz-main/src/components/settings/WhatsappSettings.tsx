// components/settings/WhatsAppSettings.tsx
'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import React from 'react';  

export function WhatsAppSettings({
  initialNumber,
  onSuccess,
}: {
  initialNumber: string;
  onSuccess: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState(initialNumber);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!/^\d{10}$/.test(whatsappNumber)) {
      toast.error('Please enter a valid 10-digit number');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/settings/shop', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsappNumber }),
      });

      if (!response.ok) throw new Error('Failed to update WhatsApp number');

      toast.success('WhatsApp number updated successfully');
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="max-w-md">
        <Input
          label="WhatsApp Number"
          type="tel"
          value={whatsappNumber}
          onChange={setWhatsappNumber}
          placeholder="Enter 10-digit phone number"
          pattern="\d{10}"
          required
        />
      </div>

      <div className="flex justify-end border-t pt-6">
        <Button type="submit" isLoading={isLoading}>
          Update Number
        </Button>
      </div>
    </form>
  );
}