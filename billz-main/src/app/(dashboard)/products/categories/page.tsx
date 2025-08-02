// src/app/(dashboard)/products/categories/add/page.tsx
'use client';

import { useState, useEffect } from 'react';
import  CategoryForm  from '@/components/products/CategoryForm';
import { Button } from '@/components/ui/Button';
import React from 'react';  // Add this import

interface Category {
 id: number;
 name: string;
 _count?: {
   products: number;
 };
}

export default function AddCategoryPage() {
 const [categories, setCategories] = useState<Category[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [change, setChange] = useState(true)
 useEffect(() => {
   fetchCategories();
 }, [change]);

 const fetchCategories = async () => {
   try {
     const response = await fetch('/api/categories');
     const data = await response.json();
     setCategories(data);
   } finally {
     setIsLoading(false);
   }
 };

 const handleDelete = async (id: number) => {
   if (!confirm('Are you sure you want to delete this category?')) return;

   try {
     const response = await fetch(`/api/categories/${id}`, {
       method: 'DELETE',
     });
     
     if (response.ok) {
       fetchCategories();
     } else {
       const data = await response.json();
       alert(data.error || 'Failed to delete category');
     }
   } catch (error) {
     console.error('Error deleting category:', error);
     alert('Failed to delete category');
   }
 };

 if (isLoading) return <div>Loading...</div>;

 return (
   <div className="flex flex-col md:mt-12 gap-y-6 h-[100vh]  ">
     <div className="bg-white rounded-lg shadow p-6">
       <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
       <CategoryForm onSuccess={fetchCategories} change={change} setChange={setChange} />
     </div>

     <div className="bg-white rounded-lg shadow p-6">
       <h2 className="text-xl font-semibold mb-4">Categories</h2>
       <div className="divide-y">
         {categories.map((category) => (
           <div key={category.id} className="py-3 flex justify-between items-center">
             <div>
               <span className="font-medium">{category.name}</span>
               {category._count && (
                 <span className="ml-2 text-sm text-gray-500">
                   ({category._count.products} products)
                 </span>
               )}
             </div>
             <Button
               variant="destructive"
               size="sm"
               onClick={() => handleDelete(category.id)}
             >
               Delete
             </Button>
           </div>
         ))}
         {categories.length === 0 && (
           <p className="text-gray-500 text-center py-4">No categories found</p>
         )}
       </div>
     </div>
   </div>
 );
}