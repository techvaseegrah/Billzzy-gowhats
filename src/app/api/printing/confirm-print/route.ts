// app/api/printing/confirm-print/route.ts
import { authOptions } from "@/lib/auth-options";
import { sendOrderStatusSMS, splitProducts } from "@/lib/msg91";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { billIds, status } = await request.json();
    const organisationId = parseInt(session.user.id);

    if (!billIds || !Array.isArray(billIds) || billIds.length === 0) {
      return NextResponse.json({ error: 'Invalid bill IDs provided' }, { status: 400 });
    }

    if (billIds.length === 1) {
      // For a single bill, check if its current status is 'processing'
      const billId = billIds[0];
      const bill = await prisma.transactionRecord.findFirst({
        where: { id: billId, organisationId }
      });

      if (bill && bill.status === 'processing') {
        // Only update if the bill is in processing state
        await prisma.transactionRecord.update({
          where: { id: billId },
          data: { status }
        });
      } else {
        // Do not update and return an appropriate message
        return NextResponse.json({ message: 'Bill status not updated because it is not in processing state' });
      }
    } else {
      // For bulk updates, proceed as usual
      await prisma.transactionRecord.updateMany({
        where: {
          id: { in: billIds },
          organisationId
        },
        data: { status }
      });
    }

    // Send SMS notifications only if the new status is 'printed'
    if (status === 'printed') {
      const bills = await prisma.transactionRecord.findMany({
        where: {
          id: { in: billIds },
          organisationId
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          }
        }
      });

      const organisation = await prisma.organisation.findUnique({
        where: { id: organisationId },
      });

      // Send SMS notifications for each bill
      for (const bill of bills) {
        if (bill.customer?.phone) {
          const products = bill.items.map(item => item.product.name);
          const productList = products.join(', ');
          const [productsPart1, productsPart2] = splitProducts(productList);

          const smsVariables = {
            var1: organisation?.shopName || '',
            var2: productsPart1,
            var3: productsPart2,
            var4: organisation?.shopName || ''
          };

          try {
            await sendOrderStatusSMS({
              phone: bill.customer.phone,
              organisationId,
              status: 'packed',
              smsVariables
            });
          } catch (error) {
            console.error(`Failed to send SMS for bill ${bill.billNo}:`, error);
          }
        }
      }
    }

    // Revalidate relevant pages
    revalidatePath('/transactions/online');
    revalidatePath('/dashboard');

    return NextResponse.json({ 
      success: true, 
      message: status === 'printed'
        ? `${billIds.length} bills marked as printed`
        : `${billIds.length} bills returned to processing`
    });
  } catch (error: any) {
    console.error('Error confirming print status:', error.message);
    return NextResponse.json({ error: 'Failed to update bill status' }, { status: 500 });
  }
}
