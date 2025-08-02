import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-options';
import { sendOrderStatusWhatsApp, splitProducts } from '@/lib/whatsapp';

function determineShippingPartner(trackingNumber: string): string {
  if (trackingNumber.startsWith("CT")) return "INDIA POST";
  if (trackingNumber.startsWith("C1")) return "DTDC";
  if (trackingNumber.startsWith("58")) return "ST COURIER";
  if (trackingNumber.startsWith("500") || trackingNumber.startsWith("10000") || /^10(?!000)/.test(trackingNumber)) return "TRACKON";
  if (trackingNumber.startsWith("SM")) return "SINGPOST";
  if (trackingNumber.startsWith("33")) return "ECOM";
  if (trackingNumber.startsWith("SR") || trackingNumber.startsWith("EP")) return "EKART";
  if (trackingNumber.startsWith("14")) return "XPRESSBEES";
  if (trackingNumber.startsWith("S") || trackingNumber.startsWith("1")) return "SHIP ROCKET";
  if (trackingNumber.startsWith("7")) return "DELHIVERY";
  if (trackingNumber.startsWith("JT")) return "J&T";
  if (trackingNumber.startsWith("TRZ")) return "PROFESSIONAL COURIER";
  return "Unknown";
}

function getTrackingUrl(partner: string, number: string): string {
  const urls: { [key: string]: string } = {
    "INDIA POST": `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx`,
    "ST COURIER": `https://stcourier.com/track/shipment`,
    "DTDC": `https://www.dtdc.in/track`,
    "TRACKON": `https://trackon.in`,
    "SHIP ROCKET": `https://www.shiprocket.in/shipment-tracking`,
    "DELHIVERY": `https://www.delhivery.com/track/package`,
    "ECOM": `https://ecomexpress.in/tracking`,
    "EKART": `https://ekartlogistics.com/track`,
    "XPRESSBEES": `https://www.xpressbees.com/track`,
    "PROFESSIONAL COURIER": `https://www.tpcindia.com/`
  };
  return urls[partner] || `https://vaseegrahveda.com/tracking`;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { billId, trackingNumber, weight } = body;

    if (!billId || !trackingNumber) {
      return NextResponse.json({ error: 'Bill ID and tracking number are required' }, { status: 400 });
    }

    const existingBill = await prisma.transactionRecord.findFirst({
      where: {
        companyBillNo: parseInt(billId),
        organisationId: parseInt(session.user.id)
      },
      include: {
        customer: true,
        items: { include: { product: true } },
        organisation: true
      }
    });

    if (!existingBill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    if (existingBill.billingMode === 'offline') {
      return NextResponse.json({ error: 'Tracking cannot be added to offline bills.' }, { status: 400 });
    }

    const updatedBill = await prisma.transactionRecord.update({
      where: { id: existingBill.id },
      data: {
        trackingNumber,
        weight: weight ? parseFloat(weight) : null,
        status: 'shipped'
      },
      include: {
        customer: true,
        items: { include: { product: true } },
        organisation: true
      }
    });

    // ✅ WhatsApp message
    if (updatedBill.customer?.phone) {
      const organisationName = updatedBill.organisation.shopName;
      const productList = updatedBill.items.map(i => i.product.name).join(', ');
      const [productsPart1 = '', productsPart2 = ''] = splitProducts(productList);

      const shippingPartner = determineShippingPartner(trackingNumber);
      const trackingUrl = getTrackingUrl(shippingPartner, trackingNumber);

      const whatsappVariables = {
        var1: organisationName,
        var2: productsPart1,
        var3: productsPart2,
        var4: shippingPartner,
        var5: trackingNumber,
        var6: weight ? `${weight} Kg` : '',
        var7: trackingUrl,
        var8: organisationName
      };

      await sendOrderStatusWhatsApp({
        phone: updatedBill.customer.phone,
        organisationId: parseInt(session.user.id),
        status: 'shipped',
        whatsappVariables
      });
    }

    return NextResponse.json({ success: true, data: updatedBill });
  } catch (error: any) {
    console.error('POST Tracking Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const billId = new URL(request.url).searchParams.get('billId');
    if (!billId) {
      return NextResponse.json({ error: 'Bill ID is required' }, { status: 400 });
    }

    const bill = await prisma.transactionRecord.findFirst({
      where: {
        companyBillNo: parseInt(billId),
        organisationId: parseInt(session.user.id)
      },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
            flatNo: true,
            street: true,
            district: true,
            state: true,
            pincode: true
          }
        },
        items: { include: { product: true } }
      }
    });

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: bill });
  } catch (error: any) {
    console.error('GET Tracking Error:', error.message);
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch bill' }, { status: 500 });
  }
}
