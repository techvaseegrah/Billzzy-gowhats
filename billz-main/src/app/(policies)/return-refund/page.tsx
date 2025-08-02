import React from 'react';

export default function ReturnRefundPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Return & Refund Policy</h1>
      <p className="text-sm text-gray-600 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold">Product Return Policy</h2>
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <p className="mb-3">Our return policy lasts 30 days from the date of delivery. To be eligible for a return, your item must meet the following conditions:</p>
            <p>• The item must be unused and in its original condition</p>
            <p>• The item must be in its original packaging</p>
            <p>• You must provide proof of purchase</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">Non-Returnable Items</h2>
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <p className="mb-2">For hygiene and safety reasons, the following items cannot be returned:</p>
            <p>• Perishable goods</p>
            <p>• Personal care items</p>
            <p>• Custom-made products</p>
            <p>• Items marked as non-returnable at the time of purchase</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">Refund Process</h2>
          <div className="mt-4">
            <p className="mb-4">Once your return is received and inspected, the store owner will process your refund. The refund will be issued to your original payment method.</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium mb-2">Expected Refund Processing Times:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Credit/Debit Cards:</p>
                  <p>2-5 business days</p>
                </div>
                <div>
                  <p className="font-medium">UPI/Net Banking:</p>
                  <p>1-3 business days</p>
                </div>
                <div>
                  <p className="font-medium">Cash Refunds:</p>
                  <p>Immediate in-store refund</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">Return Shipping</h2>
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <p>To initiate a return, please contact the store where you made your purchase. Depending on the store's policy:</p>
            <p className="mt-2">• You may need to return the item to the physical store</p>
            <p>• The store may arrange pickup from your location</p>
            <p>• You may need to ship the item back at your own expense</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">Damaged or Incorrect Items</h2>
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <p className="mb-3">If you receive a damaged or incorrect item:</p>
            <p>• Contact the store immediately with photo evidence of damage</p>
            <p>• The store will bear the return shipping costs</p>
            <p>• A replacement or refund will be processed on priority</p>
          </div>
        </section>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Note: This is a general refund policy. Individual stores may have specific policies or 
            additional terms. Please check with the specific store for their complete refund policy 
            at the time of purchase.
          </p>
        </div>
      </div>
    </div>
  );
}