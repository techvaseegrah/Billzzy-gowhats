import React from 'react';  // Add this import


export default function ShippingPolicyPage() {
    return (
      <div className="prose max-w-none">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Shipping Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
  
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold">Shipping Partners & Delivery Times</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border p-4 rounded-lg">
                <h3 className="font-semibold">India Post</h3>
                <p>Delivery Time: 7-8 days</p>
              </div>
              <div className="border p-4 rounded-lg">
                <h3 className="font-semibold">ST Courier (Tamil Nadu)</h3>
                <p>Delivery Time: 2 days</p>
              </div>
              <div className="border p-4 rounded-lg">
                <h3 className="font-semibold">DTDC</h3>
                <p>Delivery Time: 3-4 days</p>
              </div>
              <div className="border p-4 rounded-lg">
                <h3 className="font-semibold">Delhivery</h3>
                <p>Delivery Time: 4-5 days</p>
              </div>
            </div>
          </section>
  
          <section>
            <h2 className="text-2xl font-semibold">Shipping Features</h2>
            <div className="mt-4 space-y-2">
              <p>• Real-time tracking with automated updates</p>
              <p>• SMS notifications for order status</p>
              <p>• Multiple weight slabs supported</p>
              <p>• Automated shipping label generation</p>
              <p>• Pin code serviceability check</p>
            </div>
          </section>
        </div>
      </div>
    );
  }