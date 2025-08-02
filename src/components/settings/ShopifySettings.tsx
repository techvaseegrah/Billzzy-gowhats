'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface ShopifySettingsProps {
  initialDomain?: string | null;
  initialToken?: string | null;
}

export default function ShopifySettings({ initialDomain, initialToken }: ShopifySettingsProps) {
  const [domain, setDomain] = useState(initialDomain || '');
  const [token, setToken] = useState(initialToken || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/settings/shopify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopifyDomain: domain, shopifyToken: token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings.');
      }

      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-xl font-semibold">Shopify Integration</h3>
      <Input
        label="Shopify Domain"
        name="shopifyDomain"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        placeholder="your-store.myshopify.com"
        required
      />
      <Input
        label="Shopify Admin API Access Token"
        name="shopifyToken"
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        required
      />
      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          Save Shopify Settings
        </Button>
      </div>
    </form>
  );
}