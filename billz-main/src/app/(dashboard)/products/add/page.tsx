// src/app/(dashboard)/products/add/page.tsx - Add Product Page
'use client';

import { useState, useEffect } from 'react';
import  ProductForm  from '@/components/products/ProductForm';
import React from 'react';  // Add this import
import { Button } from '@headlessui/react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
  const [categories, setCategories] = useState([]);
  const router = useRouter();


  const [isImporting, setIsImporting] = useState(false);
    
    const handleImport = async () => {
      setIsImporting(true);
      toast.info('Starting Shopify product import. This may take a moment...');
  
      try {
        const response = await fetch('/api/products/import/shopify', {
          method: 'POST',
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.details || 'Failed to import products.');
        }
        
        toast.success(data.message);
        router.refresh(); // Refresh the product list to show new items
  
      } catch (error: any) {
        toast.error(`Import failed: ${error.message}`);
      } finally {
        setIsImporting(false);
      }
    };

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen flex  bg-gray-100 md:p-4 p-2">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl hidden md:block sm:text-3xl font-bold text-center mb-6">
          Add New Product
        </h1>

       
         
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <ProductForm categories={categories} />
        </div>
      </div>
    </div>
  );
}