'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import {Input} from './Input';
import {Button} from './Button';
import React from 'react';  // Add this import

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

interface Props {
  onSelect: (customer: Customer) => void;
  onCreate: (customer: Customer) => void;
}

export function CustomerSearch({ onSelect, onCreate }: Props) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Customer[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (debouncedSearch) {
      fetch(`/api/customers/search?q=${debouncedSearch}`)
        .then(res => res.json())
        .then(data => {
          setResults(data);
          setShowCreate(data.length === 0);
        });
    } else {
      setResults([]);
      setShowCreate(false);
    }
  }, [debouncedSearch]);

  const handleCreateCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          phone: formData.get('phone'),
          email: formData.get('email'),
          address: formData.get('address')
        })
      });
      
      const customer = await response.json();
      onCreate(customer);
      setShowCreate(false);
      setSearch('');
    } catch (error) {
      console.error('Failed to create customer:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Search customers by name or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {results.length > 0 && (
        <ul className="border rounded-md divide-y">
          {results.map(customer => (
            <li
              key={customer.id}
              className="p-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelect(customer)}
            >
              <div className="font-medium">{customer.name}</div>
              <div className="text-sm text-gray-500">{customer.phone}</div>
            </li>
          ))}
        </ul>
      )}

      {showCreate && (
        <div className="border rounded-md p-4">
          <h4 className="font-medium mb-4">Create New Customer</h4>
          <form onSubmit={handleCreateCustomer} className="space-y-4">
            <Input name="name" placeholder="Name" required />
            <Input name="phone" placeholder="Phone" required />
            <Input name="email" type="email" placeholder="Email" />
            <Input name="address" placeholder="Address" />
            <Button type="submit">Create Customer</Button>
          </form>
        </div>
      )}
    </div>
  );
}