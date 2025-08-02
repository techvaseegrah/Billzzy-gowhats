'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import React from 'react';  // Add this import

interface CategoryFormProps {
  initialData?: {
    id?: number;
    name: string;
  };
}

export default function CategoryForm({ initialData,setChange,change }: CategoryFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = initialData?.id
        ? `/api/categories/${initialData.id}`
        : '/api/categories';

      const response = await fetch(url, {
        method: initialData?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }
      setChange(!change)
      setSuccess("Category added successfully!")
      setName('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save category');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded">
          {success}
        </div>
      )}

      <Input
        label="Category Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
        >
          {initialData?.id ? 'Update' : 'Create'} Category
        </Button>
      </div>
    </form>
  );
}