'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PencilIcon, 
  TrashIcon,
  PlusIcon 
} from '@heroicons/react/24/outline';
import {Button} from '../ui/Button';
import {Modal} from '../ui/Modal';
import { toast } from 'react-toastify';
import React from 'react';  // Add this import

interface Product {
  id: number;
  name: string;
  SKU: string;
  netPrice: number;
  sellingPrice: number;
  quantity: number;
  category?: {
    id: number;
    name: string;
  };
}

interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products: initialProducts }: ProductListProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/products/${products.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(products),
      });

      alert('triggered')

      if (response) {
        toast.success('Product updated successfully');
        router.push('/products'); // Redirect to the products list
      } else {
        toast.error(response.data.message);

        // throw new Error('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
  
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/${deleteId}`, {
        method: 'DELETE',
      });
  
      if (response) {
        toast.success('Product deleted successfully');
        setProducts(products.filter(p => p.id !== deleteId));
        router.refresh();
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setIsLoading(false);
      setDeleteId(null);
    }
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Produ</h2>
         <div className="flex space-x-2">
            <Button
              onClick={handleImport}
              isLoading={isImporting}
              disabled={isImporting}
            >
              {isImporting ? 'Importing...' : 'Import from Shopify'}
            </Button>
            {/* Your existing Add Product button */}
            <Button onClick={() => router.push('/products/add')}>
              Add Product
            </Button>
        </div>
        <Link href="/products/add">
          <Button>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Product
          </Button>
        </Link>

      </div>

      <div className="bg-white shadow-md rounded-lg ">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Net Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Selling Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.SKU}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.category?.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ₹{product.netPrice}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ₹{product.sellingPrice}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
                    {/* <Link href={`/products/${product.id}/edit`}> */}
                      <Button  onClick={handleUpdate} size="sm" variant="secondary">
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    {/* </Link> */}
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => setDeleteId(product.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Product"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this product? This action cannot be undone.
          </p>
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={() => setDeleteId(null)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            isLoading={isLoading}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}