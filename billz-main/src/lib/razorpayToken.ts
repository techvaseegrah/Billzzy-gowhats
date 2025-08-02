// utils/razorpayToken.ts
import { RAZORPAY_CONFIG } from '@/config/razorpay';
import { prisma } from '@/lib/prisma';

// Make refreshAccessToken exportable for potential direct use
export async function refreshAccessToken(organisationId: number) {
  try {
    const organisation = await prisma.organisation.findUnique({
      where: { id: organisationId },
      select: {
        razorpayRefreshToken: true,
        razorpayAccountId: true  // Added to verify account exists
      }
    });

    if (!organisation?.razorpayRefreshToken || !organisation?.razorpayAccountId) {
      throw new Error('Razorpay account not properly connected');
    }

    const response = await fetch('https://auth.razorpay.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: organisation.razorpayRefreshToken,
        client_id: RAZORPAY_CONFIG.client_id,
        client_secret: RAZORPAY_CONFIG.client_secret,
      })
    });

    if (!response.ok) {
      throw new Error(`Razorpay refresh token request failed: ${response.statusText}`);
    }

    const tokenData = await response.json();

    if (!tokenData.access_token || !tokenData.expires_in) {
      throw new Error('Invalid token data received from Razorpay');
    }

    // Update database with new access token
    await prisma.organisation.update({
      where: { id: organisationId },
      data: {
        razorpayAccessToken: tokenData.access_token,
        razorpayTokenExpiresAt: new Date(Date.now() + (tokenData.expires_in * 1000))
      }
    });

    return tokenData.access_token;
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    throw error;
  }
}

export async function getValidAccessToken(organisationId: number) {
  try {
    const organisation = await prisma.organisation.findUnique({
      where: { id: organisationId },
      select: {
        razorpayAccessToken: true,
        razorpayTokenExpiresAt: true
      }
    });

    if (!organisation) {
      throw new Error('Organisation not found');
    }

    // Add buffer time (5 minutes) to prevent token expiration during request
    const now = new Date();
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    if (!organisation.razorpayTokenExpiresAt || 
        now.getTime() + bufferTime > organisation.razorpayTokenExpiresAt.getTime()) {
      return refreshAccessToken(organisationId);
    }

    return organisation.razorpayAccessToken;
  } catch (error) {
    console.error('Error getting valid access token:', error);
    throw error;
  }
}

export async function createRazorpayPaymentLink(accessToken: string, {
  amount,
  customerPhone,
  description,
  billNo
}: {
  amount: number;
  customerPhone: string;
  description: string;
  billNo: number;
}) {
  const timestamp = Date.now();
  const reference_id = `PAY-${timestamp}-${Math.random().toString(36).substring(7)}`;


  const payload = {
    amount: Math.round(amount * 100),
    currency: 'INR',
    accept_partial: false,
    reference_id,
    description: description,
    notes: {
      bill_no: billNo.toString(),
      description: description
    },
    reminder_enable: true
  };

  

  const response = await fetch('https://api.razorpay.com/v1/payment_links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to create payment link: ${errorData}`);
  }

  return await response.json();
}