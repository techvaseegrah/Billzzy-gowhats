import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-options';
import { sendOrderStatusSMS, splitProducts } from '@/lib/msg91';

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
  return "Unknown";
}

function getTrackingUrl(shippingPartner: string, trackingNumber: string): string {
  switch (shippingPartner) {
    case "INDIA POST":
      return `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?${trackingNumber}`;
    case "ST COURIER":
      return `https://stcourier.com/track/shipment?${trackingNumber}`;
    case "DTDC":
      return `https://www.dtdc.in/track.asp?awbno=${trackingNumber}`;
    case "TRACKON":
      return `https://trackon.in/data/SingleShipment/?tracking_number=${trackingNumber}`;
    case "SHIP ROCKET":
      return `https://www.shiprocket.in/shipment-tracking/?${trackingNumber}`;
    case "DELHIVERY":
      return `https://www.delhivery.com/?id=${trackingNumber}`;
    case "ECOM":
      return `https://ecomexpress.in/tracking/?awb=${trackingNumber}`;
    case "EKART":
      return `https://ekartlogistics.com/track?awb=${trackingNumber}`;
    case "XPRESSBEES":
      return `https://www.xpressbees.com/track?awb=${trackingNumber}`;
    default:
      return `https://vaseegrahveda.com/tracking/${trackingNumber}`;
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const { billId, status, trackingId,weight } = body;


    // Validate status
    const validStatuses = ['packed', 'dispatch', 'shipped'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Update bill status
    const bill = await prisma.transactionRecord.update({
      where: {
        billNo: billId,
        organisationId: parseInt(session.user.id)
      },
      data: {
        status,
        trackingNumber: trackingId
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
    if (bill.customer?.phone) {
      const organisationName = bill.organisation.shopName;
      const products = bill.items.map((item) => item.product.name);
      const productList = products.join(', ');
      const [productsPart1, productsPart2] = splitProducts(productList);

      let smsVariables: { [key: string]: string } = {};

      if (status === 'packed') {
        smsVariables = {
          var1: organisationName,
          var2: productList,
          var3: organisationName
        };
      } else if (status === 'dispatch') {
        smsVariables = {
          var1: organisationName,
          var2: productList,
        };
      } else if (status === 'shipped') {
        const shippingPartner = determineShippingPartner(trackingId || '');
        const trackingUrl = getTrackingUrl(shippingPartner, trackingId || '');

         smsVariables = {
          var1: organisationName,   // Organisation Name
          var2: productsPart1, 
          var3:productsPart2,       // Products list
          var4: shippingPartner,    // Courier Name
          var5: trackingId, 
          var6: `${weight} Kg`,        // Tracking URL
          // Tracking URL
          var7: trackingUrl,
          var8:organisationName    // Organisation Name
        };
      }

      await sendOrderStatusSMS({
        phone: bill.customer.phone,
        organisationId: parseInt(session.user.id),
        status,
        smsVariables
      });
    }

    return NextResponse.json(bill);
  } catch (error) {
    console.error('Status update error:', error.message);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
