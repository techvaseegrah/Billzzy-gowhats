// app/dashboard/_components/RazorpayStatus.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import RazorpayConnect from "@/components/ui/RazorpayConnect";
import React from 'react';  // Add this import

export default async function RazorpayStatus() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return null;
  }

  const organisation = await prisma.organisation.findUnique({
    where: { id: parseInt(session.user.id) },
    select: { razorpayAccountId: true }
  });

  const isConnected = !!organisation?.razorpayAccountId;

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-2">Razorpay Integration</h2>
      {isConnected ? (
        <p className="text-green-600">Connected to Razorpay</p>
      ) : (
        <div>
          <p className="mb-4 text-gray-600">Connect your Razorpay account to start accepting payments</p>
          <RazorpayConnect />
        </div>
      )}
    </div>
  );
}