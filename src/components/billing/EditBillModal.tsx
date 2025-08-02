// components/billing/EditBillModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ProductTable, ProductTableRef, BillItem } from './ProductTable';
import { toast } from 'react-toastify';

interface EditBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: any;
  onSave: (items: BillItem[]) => Promise<void>;
}

export function EditBillModal({ isOpen, onClose, bill, onSave }: EditBillModalProps) {
  const [items, setItems] = useState<BillItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const productTableRef = useRef<ProductTableRef>(null);

  
console.log(bill, 'bill');

  useEffect(() => {
    if (isOpen && bill && bill.items) {
      const initialItems = bill.items.map((item: any) => ({
        productId: item.productId,
        name: item.productName,
        quantity: item.quantity,
        price: item.price || item.totalPrice / item.quantity,
        total: item.totalPrice,
        SKU: item.SKU || '',
        availableQuantity: item.availableQuantity || 0
      }));
      setItems(initialItems);
    }
  }, [isOpen, bill]);

  const handleSave = async () => {
    if (items.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(items);
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Edit Bill" 
      className="max-w-3xl w-full mx-4 md:mx-auto"
    >
      <div className="space-y-4 p-4">
        {bill && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium text-gray-700">Bill No:</p>
                <p className="text-gray-900">{bill.billNo}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium text-gray-700">Customer:</p>
                <p className="text-gray-900">{bill.customer?.name}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium text-gray-700">Total Amount:</p>
                <p className="text-gray-900">₹{bill.totalPrice}</p>
              </div>
            </div>

            <div className="mt-6">
              <ProductTable
                ref={productTableRef}
                onChange={setItems}
                initialItems={items}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
              <Button 
                variant="outline" 
                onClick={onClose} 
                disabled={isLoading}
                className="px-6"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isLoading}
                className="px-6"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}