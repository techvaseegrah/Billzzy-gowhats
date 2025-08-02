
import React from 'react';  // Add this import

export default function TermsConditionsPage() {
    return (
      <div className="prose max-w-none">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Terms & Conditions</h1>
        <p className="text-sm text-gray-600 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
  
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold">Service Description</h2>
            <p>
              Billzzy provides billing and inventory management services including online/offline 
              billing, inventory tracking, customer management, SMS notifications, and secure payment 
              processing through Razorpay.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-semibold">Payment Terms</h2>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <p>• All payments are processed securely through Razorpay</p>
              <p>• Subscription fees are charged according to selected plan</p>
              <p>• SMS credits are charged at ₹0.30  per message</p>
              <p>• Failed payments may result in service interruption</p>
            </div>
          </section>
  
          <section>
            <h2 className="text-2xl font-semibold">Legal Compliance</h2>
            <p>
              This platform complies with the Information Technology Act 2000, Consumer Protection 
              Act 2019, Indian Contract Act 1872, and all applicable RBI guidelines for payment processing.
            </p>
          </section>
        </div>
      </div>
    );
  }