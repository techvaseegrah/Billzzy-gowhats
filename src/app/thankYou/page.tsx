// File: app/thank_you/page.tsx

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function ThankYouPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-md text-center ">
        <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
        <p className="text-gray-700 mb-6">
          Please wait a moment while we process your order.
          <br />
          You will receive an SMS with the details shortly.
        </p>
       
      </div>
    </div>
  );
}
