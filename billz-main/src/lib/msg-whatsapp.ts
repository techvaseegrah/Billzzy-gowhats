// lib/msg91.ts (or msg-whatsapp.ts)

import { prisma } from './prisma';
import { splitAddressIntoThreeParts } from '@/lib/utils';
import { getValidAccessToken } from './razorpayToken';

interface BillingWhatsAppParams {
  phone: string;
  companyName: string;
  products: string;
  amount: number;
  address: string;
  organisationId: number;
  billNo: number;
  shippingMethod?: {
    name: string;
    type: string;
    cost: number;
  } | null;
}

export async function sendBillingWhatsApp({
  phone,
  companyName,
  products,
  amount,
  address,
  organisationId,
  billNo,
  shippingMethod,
}: BillingWhatsAppParams) {
  try {
    // Get GoWhatsApp access token for the organisation
    const accessToken = await getValidAccessToken(organisationId);

    if (!accessToken) {
      throw new Error('No valid access token found for organisation');
    }

    // Format address into 3 parts
    const [line1, line2, line3] = splitAddressIntoThreeParts(address);

    // Format shipping line if available
    const shippingLine = shippingMethod
      ? `\n🚚 Shipping: ${shippingMethod.name} (${shippingMethod.type}) - ₹${shippingMethod.cost}`
      : '';

    // WhatsApp message format with better formatting
    const message = `🧾 *${companyName} Bill #${billNo}*\n\n🛒 *Items:*\n${products}\n\n💰 *Total:* ₹${amount}${shippingLine}\n\n🏠 *Delivery Address:*\n${line1}\n${line2}\n${line3}\n\n🙏 Thank you for shopping with us!`;

    // Validate phone number format
    const formattedPhone = phone.replace(/[^\d]/g, '');
    if (formattedPhone.length < 10) {
      throw new Error('Invalid phone number format');
    }

    // Send message using GoWhatsApp API
    const res = await fetch('https://app.gowhatsapp.in/api/v2/message/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        phone: formattedPhone,
        type: 'text',
        message: message,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`WhatsApp API error: ${res.status} - ${errorText}`);
    }

    const responseData = await res.json();
    console.log('WhatsApp message sent successfully:', responseData);
    
    return {
      success: true,
      data: responseData,
      messageId: responseData.message_id || null
    };

  } catch (error) {
    console.error('WhatsApp message failed:', error);
    
    // Return error info for better handling
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    };
  }
}

// Alternative version with retry logic
export async function sendBillingWhatsAppWithRetry({
  phone,
  companyName,
  products,
  amount,
  address,
  organisationId,
  billNo,
  shippingMethod,
}: BillingWhatsAppParams, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`WhatsApp send attempt ${attempt}/${maxRetries}`);
      
      const result = await sendBillingWhatsApp({
        phone,
        companyName,
        products,
        amount,
        address,
        organisationId,
        billNo,
        shippingMethod,
      });
      
      if (result.success) {
        return result;
      }
      
      lastError = result.error;
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
    } catch (error) {
      lastError = error;
      console.error(`WhatsApp attempt ${attempt} failed:`, error);
    }
  }
  
  throw new Error(`WhatsApp failed after ${maxRetries} attempts. Last error: ${lastError}`);
}

// Helper function to format message for different templates
export function formatBillingMessage({
  companyName,
  billNo,
  products,
  amount,
  address,
  shippingMethod,
  template = 'default'
}: {
  companyName: string;
  billNo: string;
  products: string;
  amount: number;
  address: string;
  shippingMethod?: any;
  template?: 'default' | 'compact' | 'detailed';
}) {
  const [line1, line2, line3] = splitAddressIntoThreeParts(address);
  const shippingLine = shippingMethod
    ? `\n🚚 Shipping: ${shippingMethod.name} (${shippingMethod.type}) - ₹${shippingMethod.cost}`
    : '';

  switch (template) {
    case 'compact':
      return `🧾 ${companyName} Bill #${billNo}\n💰 Total: ₹${amount}${shippingLine}\n📍 ${line1}\nThank you! 🙏`;
    
    case 'detailed':
      return `🧾 *INVOICE FROM ${companyName.toUpperCase()}*\n\n📋 *Bill Number:* ${billNo}\n📅 *Date:* ${new Date().toLocaleDateString()}\n\n🛒 *ITEMS PURCHASED:*\n${products}\n\n💰 *TOTAL AMOUNT:* ₹${amount}${shippingLine}\n\n🏠 *DELIVERY ADDRESS:*\n${line1}\n${line2}\n${line3}\n\n✅ *Order Status:* Confirmed\n🙏 Thank you for choosing ${companyName}!`;
    
    default:
      return `🧾 *${companyName} Bill #${billNo}*\n\n🛒 *Items:*\n${products}\n\n💰 *Total:* ₹${amount}${shippingLine}\n\n🏠 *Delivery Address:*\n${line1}\n${line2}\n${line3}\n\n🙏 Thank you for shopping with us!`;
  }
}
