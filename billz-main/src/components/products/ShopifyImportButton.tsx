'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'react-toastify';

interface ShopifyImportButtonProps {
  onImportComplete: () => void;
}

export default function ShopifyImportButton({ onImportComplete }: ShopifyImportButtonProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [statusText, setStatusText] = useState('Initializing import...');

  // Effect to simulate progress smoothly while the import API call is running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isImporting && totalProducts > 0 && progress < 95) {
      // Simulate progress, assuming an average time per product
      const estimatedDuration = totalProducts * 150; // ~150ms per product
      const increment = 100 / (estimatedDuration / 100);
      
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + increment;
          return newProgress >= 95 ? 95 : newProgress; // Stop at 95% until fetch completes
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isImporting, totalProducts, progress]);

  const handleConfirm = () => {
    setShowConfirmModal(false);
    startImport();
  };
  
  const startImport = async () => {
    // 1. Reset state and open progress modal
    setIsImporting(true);
    setShowProgressModal(true);
    setProgress(0);
    setImportedCount(0);
    setTotalProducts(0);
    setStatusText('Connecting to Shopify to get product count...');

    try {
      // 2. Get the total count of variants for an accurate progress bar
      const countResponse = await fetch('/api/products/import/shopify/count');
      const countData = await countResponse.json();

      if (!countResponse.ok) {
        throw new Error(countData.error || 'Failed to connect to Shopify.');
      }
      setTotalProducts(countData.totalVariants);

      if (countData.totalVariants === 0) {
        setStatusText('No products found in your Shopify store.');
        setTimeout(() => setShowProgressModal(false), 3000);
        return;
      }

      // 3. Start the actual import process
      setStatusText(`Found ${countData.totalVariants} product variants. Starting sync...`);
      const importResponse = await fetch('/api/products/import/shopify', { method: 'POST' });
      const importData = await importResponse.json();

      if (!importResponse.ok) {
        throw new Error(importData.details || 'A failure occurred during import.');
      }
      
      // 4. Finalize progress and show success
      setProgress(100);
      setImportedCount(importData.importedCount);
      setStatusText(`Import Complete!`);
      toast.success(importData.message || `${importData.importedCount} new products imported.`);
      
      // Refresh the parent component's product list
      onImportComplete(); 
      
      // Close modal after a short delay to show the success message
      setTimeout(() => {
        setShowProgressModal(false);
      }, 2500);

    } catch (error: any) {
      toast.error(error.message);
      setShowProgressModal(false); // Close modal immediately on error
    } finally {
      setIsImporting(false);
    }
  };
  
  const currentSyncedCount = Math.floor((totalProducts * progress) / 100);

  return (
    <>
      <Button
        onClick={() => setShowConfirmModal(true)} // This opens the confirmation dialog first
        isLoading={isImporting}
        disabled={isImporting}
        className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isImporting ? 'Syncing...' : 'Import from Shopify'}
      </Button>

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirm Import">
        <div className="p-4">
            <p className="text-gray-700">
                Are you sure you want to sync products from your Shopify store?
                This will add new products from Shopify to your database but will not affect existing products.
            </p>
            <div className="flex justify-end space-x-4 mt-6">
                <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleConfirm}>
                    Yes, Start Import
                </Button>
            </div>
        </div>
      </Modal>

      {/* Progress Modal */}
      <Modal isOpen={showProgressModal} onClose={() => {}} title="Shopify Product Sync" isClosable={!isImporting}>
        <div className="p-4 text-center">
          <p className="mb-4 text-gray-600 min-h-[40px]">
            {statusText}
          </p>
          
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden border border-gray-300">
            <div
              className="bg-gradient-to-r from-green-400 to-teal-500 h-4 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-lg font-semibold text-gray-800">
              {Math.round(progress)}%
            </p>
            {totalProducts > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {progress === 100 ? importedCount : currentSyncedCount} of {totalProducts} products synced
              </p>
            )}
          </div>

          {progress === 100 && (
             <p className="text-green-700 font-bold mt-4">
               Successfully imported {importedCount} new products.
             </p>
          )}
        </div>
      </Modal>
    </>
  );
}
