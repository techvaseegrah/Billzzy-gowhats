// components/settings/IntegrationsSettings.tsx
'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/Button';
import React from 'react';  
import logo from "../../../public/images/razorpay.png";
import Image from 'next/image';

export function IntegrationsSettings({
  razorpayConnected,
  onRazorpayUpdate,
}: {
  razorpayConnected: boolean;
  onRazorpayUpdate: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/razorpay', { method: 'POST' });
      if (!response.ok) throw new Error('Connection failed');
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/razorpay/disconnect', { method: 'POST' });
      if (!response.ok) throw new Error('Disconnect failed');
      toast.success('Razorpay disconnected');
      onRazorpayUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Disconnect failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 border rounded-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-3 rounded-lg">
              {/* Replace with actual Razorpay logo */}
              <Image
        src={logo}
        alt="Razorpay Logo"
        width={70}
        height={0}
        className="object-cover  h-9"
      />
            </div>
            <div>
              <h3 className="font-medium">Razorpay Payments</h3>
              <p className="text-sm text-gray-600">
                {razorpayConnected ? 'Connected' : 'Enable online payments'}
              </p>
            </div>
          </div>

          {razorpayConnected ? (
            <div className="flex items-center gap-4">
              <span className="text-green-600 flex items-center">
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Connected
              </span>
              <Button
                variant="outline"
                onClick={handleDisconnect}
                isLoading={isLoading}
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleConnect}
              isLoading={isLoading}
              className="w-full md:w-auto"
            >
              Connect Razorpay
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}