import React from 'react';  // Add this import


export default function PrivacyPolicyPage() {
    return (
      <div className="prose max-w-none">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
  
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold">Information We Collect</h2>
            <p>
              When you use Billzzy, we collect information that you provide directly to us, including:
            </p>
            <div className="ml-4 mt-2 space-y-2">
              <p>• Business information such as company name, GST number, and address</p>
              <p>• Contact information including email address and phone number</p>
              <p>• Payment information processed through our payment partner Razorpay</p>
              <p>• Transaction records and billing details</p>
              <p>• Inventory and product information</p>
            </div>
          </section>
  
          <section>
            <h2 className="text-2xl font-semibold">Payment Processing</h2>
            <p>
              Our platform uses Razorpay for payment processing. All payment data is handled securely through 
              Razorpay's PCI-DSS compliant infrastructure. We do not store complete credit card information 
              on our servers.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-semibold">Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data, including encryption, 
              access controls, regular security assessments, and secure backup procedures.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-semibold">Data Usage</h2>
            <p>
              We use your information to provide and improve our services, process transactions, 
              send notifications, and maintain your account. We do not sell your personal information 
              to third parties.
            </p>
          </section>
        </div>
      </div>
    );
  }