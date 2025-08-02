// app/(policies)/about/page.tsx
import React from 'react';  // Add this import

export default function AboutPage() {
    return (
      <div className="prose max-w-none">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">About Billzzy</h1>
        <div className="space-y-4">
          <p>
            Billzzy is a comprehensive billing and inventory management solution designed 
            specifically for Indian businesses. We provide a powerful platform that combines 
            modern technology with practical business needs.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8">Our Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="border p-4 rounded-lg">
              <h3 className="font-semibold">Integrated Billing</h3>
              <p>Seamless online and offline billing capabilities </p>
            </div>
            <div className="border p-4 rounded-lg">
              <h3 className="font-semibold">Inventory Management</h3>
              <p>Real-time tracking and automated stock updates</p>
            </div>
            <div className="border p-4 rounded-lg">
              <h3 className="font-semibold">Payment Processing</h3>
              <p>Secure payment handling through Razorpay integration</p>
            </div>
            <div className="border p-4 rounded-lg">
              <h3 className="font-semibold">SMS Notifications</h3>
              <p>Automated updates for orders and delivery status</p>
            </div>
          </div>
        </div>
      </div>
    );
  }