import { prisma } from "./prisma";
import { splitAddressIntoThreeParts } from "@/lib/utils"
import { createRazorpayPaymentLink, getValidAccessToken } from "./razorpayToken";

interface BillingSMSParams {
  phone: string;
  companyName: string;
  products: string;
  amount: number;
  address: string;
  organisationId: number;
}

interface SMSConfig {
  authkey: string;

}

const MSG91_CONFIG: SMSConfig = {
  authkey: process.env.MSG91_AUTH_KEY || ''

};

const url = 'https://control.msg91.com/api/v5/flow/';
// const url = 'https://control.msg91.com//v5//'



export function splitProducts(products: string) {
  const maxLength = 30; // Adjust based on your needs
  const middleIndex = Math.ceil(products.length / 2);
  return [
    products.slice(0, middleIndex),
    products.slice(middleIndex)
  ];
}

interface BillingSMSParams {
  phone: string;
  companyName: string;
  products: string;
  amount: number;
  address: string;
  organisationId: number;
  shippingMethod?: {
    name: string;
    type: string;
    cost: number;
  } | null;
}

interface BillingSMSParams {
  phone: string;
  companyName: string;
  products: string;
  amount: number;
  address: string;
  organisationId: number;
  shippingMethod?: {
    name: string;
    type: string;
    cost: number;
  } | null;
}

export async function sendBillingSMS({ 
  phone, 
  companyName, 
  products, 
  amount, 
  address, 
  organisationId, 
  billNo,
  shippingMethod 
}: BillingSMSParams & { billNo: number }) {
  try {
    // Check Razorpay integration and generate payment link
    const organisation = await prisma.organisation.findUnique({
      where: { id: organisationId },
      select: { razorpayAccountId: true, razorpayAccessToken: true }
    });

    let paymentLink = '';
    
    if (organisation?.razorpayAccessToken) {
      try {
        const accessToken = await getValidAccessToken(organisationId);
        const paymentLinkResponse = await createRazorpayPaymentLink(accessToken, {
          amount,
          customerPhone: phone,
          description: `Bill #${billNo} - ${products} from ${companyName}`,
          billNo
        });
        paymentLink = paymentLinkResponse.short_url;
      } catch (error) {
        console.error('Razorpay payment link creation failed:', error);
      }
    }

    // Process product and address information
    const [productsPart1, productsPart2] = splitProducts(products);
    const [addressPart1, addressPart2, addressPart3] = splitAddressIntoThreeParts(address);

    // Determine shipping details
    let shippingPartnerText = 'Courier name will be sent soon';
    let shippingCostText = 'Free';

    if (shippingMethod) {
      if (shippingMethod.type === 'FREE_SHIPPING') {
         shippingPartnerText = 'Courier name will be sent soon';

        shippingCostText = '0';
      } else {
        shippingPartnerText = shippingMethod.name;
        shippingCostText = shippingMethod.cost.toString();
      }
    }

    // Select template and prepare variables
    let template_id, variables;
    
    if (paymentLink) {
      // Template with payment link
      template_id = '67614070d6fc0550d71d63e2';
      variables = {
        var1: companyName,            // Company name
        var2: productsPart1,          // First part of products
        var3: productsPart2 || '',    // Second part of products
        var4: addressPart1,           // First part of address
        var5: addressPart2,           // Second part of address
        var6: addressPart3,           // Third part of address
        var7: shippingPartnerText,    // Shipping partner name
        var8: shippingCostText,       // Shipping cost
        var9: amount.toFixed(2),      // Total amount
        var10: paymentLink            // Payment link
      };
    } else {
      // Template without payment link
      template_id = '67613fa6d6fc054f4b52a1e6';
      variables = {
        var1: companyName,            // Company name
        var2: productsPart1,          // First part of products
        var3: productsPart2 || '',    // Second part of products
        var4: addressPart1,           // First part of address
        var5: addressPart2,           // Second part of address
        var6: addressPart3,           // Third part of address
        var7: shippingPartnerText,    // Shipping partner name
        var8: shippingCostText,       // Shipping cost
        var9: amount.toFixed(2)       // Total amount
      };
    }

    

    // Update transaction record if payment link exists
    if (paymentLink) {
      await prisma.transactionRecord.update({
        where: { billNo },
        data: { paymentMethod: 'razorpay_link' }
      });
    }

    // Send SMS
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'authkey': process.env.MSG91_AUTH_KEY as string
      },
      body: JSON.stringify({
        template_id,
        short_url: "1",
        recipients: [{
          mobiles: `91${phone}`,
          ...variables
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`SMS sending failed: ${response.statusText}`);
    }

    // Update SMS count
    await prisma.organisation.update({
      where: { id: organisationId },
      data: { smsCount: { increment: 1 } }
    });

    return { success: true };
  } catch (error) {
    console.error('SMS sending error:', error);
    throw error;
  }
}

async function updateSMSCount(organisationId: number) {
  try {
    await prisma.organisation.update({
      where: { id: organisationId },
      data: {
        smsCount: {
          increment: 1
        },
        smsCost: {
          increment: 0.25 
        }
      }
    });
  } catch (error) {
    console.error('Error updating SMS count:', error);
  }
}


export async function sendOrderStatusSMS({
  phone,
  organisationId,
  status,
  smsVariables
}: {
  phone: string;
  organisationId: number;
  status: 'packed' | 'dispatch' | 'shipped';
  smsVariables: { [key: string]: string };
}) {
  const templates = {
    packed: process.env.ORDER_PACKED_TEMPLATE_ID,
    dispatch: process.env.ORDER_DISPATCH_TEMPLATE_ID,
    shipped: process.env.ORDER_SHIPPED_TEMPLATE_ID
  };

  const templateId = templates[status];

  if (!templateId) {
    throw new Error(`Template ID not found for status: ${status}`);
  }

  try {



    const response = await fetch(url, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authkey: MSG91_CONFIG.authkey
      },
      body: JSON.stringify({
        flow_id: templateId,
        recipients: [
          {
            mobiles: `91${phone}`,
            ...smsVariables
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Status SMS sending failed: ${response.statusText}`);
    }

    await updateSMSCount(organisationId);
    return await response.json();
  } catch (error) {
    console.error('Status SMS sending error:', error);
    throw error;
  }
}
