// app/lock/page.tsx
'use client';

import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ContactModal } from '@/components/settings/ContactModal';
import React from 'react';  // Add this import

export default function LockPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Calculate total amount
  const calculateAmount = () => {
    const baseAmount = 499;
    const smsCount = session?.user?.smsCount || 0;
    const smsRate = 0.30;
    const smsCharges = smsCount > 0 ? smsCount * smsRate : 0;
    const totalAmount = baseAmount + smsCharges;

    return {
      baseAmount,
      smsCount,
      smsCharges,
      totalAmount
    };
  };

  useEffect(() => {
    if (session?.user?.endDate) {
      const endDate = new Date(session.user.endDate);
      if (endDate > new Date()) {
        router.push('/dashboard');
      }
    }
 
  }, [session, router]);

  const amounts = calculateAmount();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Header */}
      <header className="p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-white">Billz</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full mx-4">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-red-600 mb-4">
              Account Locked
            </h2>
            <p className="text-gray-600 mb-6">
              Your subscription has expired. Please contact the administrator to renew your subscription.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Renewal Details</h3>
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Subscription:</span>
                  <span className="font-medium">₹{amounts.baseAmount.toFixed(2)}</span>
                </div>
                
                {amounts.smsCount > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SMS Usage ({amounts.smsCount} messages):</span>
                      <span className="font-medium">₹{amounts.smsCharges.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-800">Total Amount:</span>
                        <span className="text-indigo-600">₹{amounts.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Subscription expired on:{' '}
              {session?.user?.endDate && 
                new Date(session.user.endDate).toLocaleDateString()}
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => setIsContactModalOpen(true)}
                variant="outline"
                className="w-full"
              >
                Contact Support
              </Button>

              <Button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4">
        <div className="container mx-auto text-center text-white">
          <p>© 2024 Billzzy. All rights reserved.</p>
        </div>
      </footer>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
    </div>
  );
}