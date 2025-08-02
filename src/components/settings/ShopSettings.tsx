// components/settings/ShopSettings.tsx
'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { OrganisationDetails } from '@/types/settings';
import React from 'react';  

export function ShopSettings({
  initialData,
  onSuccess,
}: {
  initialData: OrganisationDetails;
  onSuccess: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  console.log('Initial data in ShopSettings:', initialData);
  
  
  // Ensure all optional fields have default empty strings
  const [details, setDetails] = useState<OrganisationDetails>({
    ...initialData,
    landlineNumber: initialData.landlineNumber || '',
    websiteAddress: initialData.websiteAddress || '',
    gstNumber: initialData.gstNumber || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);


    console.log('Submitting shop details:', details);
    

    try {
      const response = await fetch('/api/settings/shop', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      });

      if (!response.ok) throw new Error('Failed to update shop details');
      
      toast.success('Shop details updated successfully');
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update shop details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Input
          label="Shop Name"
          value={details.shopName}
          onChange={(e) => setDetails({ ...details, shopName: e.target.value })}
          required
        />

        <Input
          label="Email"
          type="email"
          value={details.email}
          onChange={(e) => setDetails({ ...details, email: e.target.value })}
          required
        />

        <Input
          label="Phone"
          type="tel"
          value={details.phone}
          onChange={(e) => setDetails({ ...details, phone: e.target.value })}
          required
        />

        <Input
          label="Flat/Door No"
          value={details.flatNo}
          onChange={(e) => setDetails({ ...details, flatNo: e.target.value })}
          required
        />

        <Input
          label="Street"
          value={details.street}
          onChange={(e) => setDetails({ ...details, street: e.target.value })}
          required
        />

        <Input
          label="District"
          value={details.district}
          onChange={(e) => setDetails({ ...details, district: e.target.value })}
          required
        />

        <Input
          label="State"
          value={details.state}
          onChange={(e) => setDetails({ ...details, state: e.target.value })}
          required
        />

        <Input
          label="Country"
          value={details.country}
          onChange={(e) => setDetails({ ...details, country: e.target.value })}
          required
        />

        <Input
          label="Pincode"
          value={details.pincode}
          onChange={(e) => setDetails({ ...details, pincode: e.target.value })}
          required
        />

        <Input
          label="Mobile Number"
          type="tel"
          value={details.mobileNumber}
          onChange={(e) => setDetails({ ...details, mobileNumber: e.target.value })}
          required
        />

        <Input
          label="Landline Number (Optional)"
          type="tel"
          value={details.landlineNumber}
          onChange={(e) => setDetails({ ...details, landlineNumber: e.target.value })}
        />

        <Input
          label="Website (Optional)"
          type="url"
          value={details.websiteAddress}
          onChange={(e) => setDetails({ ...details, websiteAddress: e.target.value })}
        />

        <Input
          label="GST Number (Optional)"
          value={details.gstNumber}
          onChange={(e) => setDetails({ ...details, gstNumber: e.target.value })}
        />

        <Select
          label="Company Size"
          value={details.companySize}
          onChange={(v) => setDetails({ ...details, companySize: v })}
          options={[
            { value: '1-10', label: '1-10 employees' },
            { value: '11-50', label: '11-50 employees' },
            { value: '51-200', label: '51-200 employees' },
            { value: '201-500', label: '201-500 employees' },
            { value: '500+', label: '500+ employees' },
          ]}
          required
        />
      </div>

      <div className="flex justify-end border-t pt-6">
        <Button type="submit" isLoading={isLoading} className="w-full md:w-auto">
          Save Changes
        </Button>
      </div>
    </form>
  );
}