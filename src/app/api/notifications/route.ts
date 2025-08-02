/*
 * FILE: src/app/api/billing/tracking/route.ts
 *
 * CHANGES:
 * - Both POST and GET handlers now query the database using `companyBillNo`
 * instead of the old `billNo` to correctly identify transactions
 * on a per-organisation basis.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-options';
import { sendOrderStatusSMS, splitProducts } from '@/lib/msg91';

// Helper functions (determineShippingPartner, getTrackingUrl) remain the same
function determineShippingPartner(trackingNumber: string): string {
  if (trackingNumber.startsWith("CT")) return "INDIA POST";
  if (trackingNumber.startsWith("C1")) return "DTDC";
  if (trackingNumber.startsWith("58")) return "ST COURIER";
  if (trackingNumber.startsWith("500")) return "TRACKON";
  if (trackingNumber.startsWith("10000")) return "TRACKON";
  if (/^10(?!000)/.test(trackingNumber)) return "TRACKON";
  if (trackingNumber.startsWith("SM")) return "SINGPOST";
  if (trackingNumber.startsWith("33")) return "ECOM";
  if (trackingNumber.startsWith("SR") || trackingNumber.startsWith("EP")) return "EKART";
  if (trackingNumber.startsWith("14")) return "XPRESSBEES";
  if (trackingNumber.startsWith("S")) return "SHIP ROCKET";
  if (trackingNumber.startsWith("1")) return "SHIP ROCKET";
  if (trackingNumber.startsWith("7")) return "DELHIVERY";
  if (trackingNumber.startsWith("JT")) return "J&T";
  if (trackingNumber.startsWith("TRZ")) return "PROFESSIONAL COURIER";

  return "Unknown";
}

function getTrackingUrl(shippingPartner: string, trackingNumber: string): string {
  switch (shippingPartner) {
    case "INDIA POST":
      return `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx`;
    case "ST COURIER":
      return `https://stcourier.com/track/shipment`;
    case "DTDC":
      return `https://www.dtdc.in/track`;
    case "TRACKON":
      return `https://trackon.in`;
    case "SHIP ROCKET":
      return `https://www.shiprocket.in/shipment-tracking`;
    case "DELHIVERY":
      return `https://www.delhivery.com/track/package`;
    case "ECOM":
      return `https://ecomexpress.in/tracking`;
    case "EKART":
      return `https://ekartlogistics.com/track`;
    case "XPRESSBEES":
      return `https://www.xpressbees.com/track`;
    case "PROFESSIONAL COURIER":
      return `https://www.tpcindia.com/`;
    default:
      return `https://vaseegrahveda.com/tracking`;
  }
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
      return NextResponse.json(
        { error: 'Bill ID and tracking number are required' },
        { status: 400 }
      );
    }

    // --- MODIFIED LOGIC ---
    // First, check if the bill exists using companyBillNo
    const existingBill = await prisma.transactionRecord.findFirst({
      where: {
        companyBillNo: parseInt(billId), // Use companyBillNo
        organisationId: parseInt(session.user.id)
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        },
        organisation: true
      }
    });

    if (!existingBill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }

    if (existingBill.billingMode === 'offline') {
      return NextResponse.json(
        { error: 'Tracking cannot be added to offline bills through this endpoint.' },
        { status: 400 }
      );
    }

    // Update the bill with tracking details using its unique primary key
    const updatedBill = await prisma.transactionRecord.update({
      where: {
        id: existingBill.id // Use the unique id for the update
      },
      data: {
        trackingNumber,
        weight: weight ? parseFloat(weight) : null,
        status: 'shipped'
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        },
        organisation: true
      }
    });

    // Send SMS notification
    if (updatedBill.customer?.phone) {
      const organisationName = updatedBill.organisation.shopName;
      const products = updatedBill.items.map((item) => item.product.name);
      const productList = products.join(', ');
      const [productsPart1, productsPart2] = splitProducts(productList);

      const shippingPartner = determineShippingPartner(trackingNumber || '');
      const trackingUrl = getTrackingUrl(shippingPartner, trackingNumber || '');

      const smsVariables = {
        var1: organisationName,
        var2: productsPart1,
        var3: productsPart2,
        var4: shippingPartner,
        var5: trackingNumber,
        var6: `${weight} Kg`,
        var7: trackingUrl,
        var8: organisationName
      };
      await sendOrderStatusSMS({
        phone: updatedBill.customer.phone,
        organisationId: parseInt(session.user.id),
        status: 'shipped',
        smsVariables
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedBill
    });
  } catch (error: any) {
    console.error('Error details:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update tracking details',
        message: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const billId = searchParams.get('billId');

    if (!billId) {
      return NextResponse.json(
        { error: 'Bill ID is required' },
        { status: 400 }
      );
    }

    // --- MODIFIED LOGIC ---
    const bill = await prisma.transactionRecord.findFirst({
      where: {
        companyBillNo: parseInt(billId), // Use companyBillNo
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
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: bill
    });
  } catch (error: any) {
    console.error('Error fetching bill:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch bill details',
        message: error.message
      },
      { status: 500 }
    );
  }
}
