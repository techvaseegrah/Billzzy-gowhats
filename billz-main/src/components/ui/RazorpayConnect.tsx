// components/RazorpayConnect.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import React from 'react';  // Add this import
import logo from "../../../public/images/razorpay.png";
import { toast } from 'react-toastify';

export default function RazorpayConnect() {
  const [isLoading, setIsLoading] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkRazorpayConnection() {
      try {
        const response = await fetch('/api/razorpay/check-connection');
        const data = await response.json();
        setShowButton(!data.isConnected);
      } catch (error) {
        console.error('Failed to check Razorpay connection:', error);
        setShowButton(true);
      }
    }

    checkRazorpayConnection();
  }, []);

const handleConnect = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/razorpay', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to initiate Razorpay connection');
      }
      
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      toast.success("Failed")

      console.error('Failed to initiate Razorpay connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showButton) {
    return null;
  }

  return (
 <main className=' '>
    <button
    onClick={handleConnect}
    disabled={isLoading}
    className="group relative mt-[2rem]  place-content-center ml-4  px-3 border border-[#02042B] rounded-md bg-white hover:bg-gray-50 transition-all duration-200"
  >
    <div className="flex items-center  space-x-3">
    
      <span className="text-[#02042B] font-medium text-[12px]  border-gray-300 pl-3">
        {isLoading ? 'Connecting With...' : 'Connect With'}
     
      </span>
      <Image
        src={logo}
        alt="Razorpay Logo"
        width={70}
        height={0}
        className="object-cover  h-9"
      />
    </div>
    {/* <div className="absolute inset-0 w-1 bg-[#02042B] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-l-md" /> */}
  </button>
 </main>
  );
}