import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { revalidatePath } from 'next/cache';
import { sendWhatsAppMessageByOrganisation } from '@/lib/whatsapp';

// --- Constants for better maintainability ---
const NEW_STATUS = 'packed';
const WHATSAPP_TEMPLATE_NAME = 'order_packed_notification';

/**
 * Handles sending the WhatsApp notification.
 * This function is separated for clarity and reusability.
 */
async function sendPackingNotification(transactionRecord: any) {
  if (!transactionRecord.customer?.phone) {
    const message = `Customer phone number not available for WhatsApp notification.`;
    console.log(`⚠️  [Org ${transactionRecord.organisationId}] ${message}`);
    return { success: false, error: message };
  }

  try {
    const customerPhone = transactionRecord.customer.phone;
    const orderId = transactionRecord.companyBillNo.toString();
    const productList = transactionRecord.itemName || 'Your items';
    const orderStatus = 'Packed and Ready for Dispatch';
    const companyName = transactionRecord.organisation?.name || 'Your Store';

    console.log(`📱 [Org ${transactionRecord.organisationId}] Preparing packing notification for ${customerPhone}`);

    const whatsappResult = await sendWhatsAppMessageByOrganisation({
      organisationId: transactionRecord.organisationId,
      phone: customerPhone,
      templateName: WHATSAPP_TEMPLATE_NAME,
      variables: [orderId, productList, orderStatus, companyName],
    });

    console.log(`✅ [Org ${transactionRecord.organisationId}] WhatsApp notification sent successfully:`, {
      messageId: whatsappResult?.messages?.[0]?.id,
    });
    return { success: true, data: whatsappResult };

  } catch (error: any) {
    console.error(`❌ [Org ${transactionRecord.organisationId}] WhatsApp notification failed:`, error.message);
    // Don't fail the entire request, just report the error
    return { success: false, error: error.message };
  }
}

// --- API Route Handler ---
export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyBillNo = parseInt(context.params.id, 10);
    if (isNaN(companyBillNo)) {
      return NextResponse.json({ error: 'Invalid bill number format' }, { status: 400 });
    }

    const organisationId = parseInt(session.user.id, 10);
    let updatedTransaction;

    // --- Using a Database Transaction for Atomicity ---
    // This ensures that we find and update the record in one safe operation.
    try {
      updatedTransaction = await prisma.$transaction(async (tx) => {
        // 1. Find the transaction record within the transaction
        const transactionRecord = await tx.transactionRecord.findFirst({
          where: {
            companyBillNo: companyBillNo,
            organisationId: organisationId,
          },
          include: {
            customer: true, // For phone number
            organisation: true, // For company name
          },
        });

        if (!transactionRecord) {
            // By throwing an error here, the transaction is automatically rolled back.
            throw new Error('NOT_FOUND');
        }
        
        // Optional: Add a check to prevent re-packing an already packed order
        if (transactionRecord.status === NEW_STATUS) {
            throw new Error('ALREADY_PACKED');
        }

        // 2. Update the record within the same transaction
        const updatedRecord = await tx.transactionRecord.update({
          where: {
            id: transactionRecord.id, // Use the primary key for updates for reliability
          },
          data: {
            status: NEW_STATUS,
          },
          include: {
            customer: true,
            organisation: true,
          }
        });

        return updatedRecord;
      });
    } catch (error: any) {
      // Catch errors from the transaction
      if (error.message === 'NOT_FOUND') {
        return NextResponse.json(
          { error: 'Bill not found or you do not have permission to access it.' },
          { status: 404 }
        );
      }
      if (error.message === 'ALREADY_PACKED') {
        return NextResponse.json(
          { error: 'This bill has already been marked as packed.' },
          { status: 409 } // 409 Conflict is a good status code here
        );
      }
      // For other unexpected database errors
      throw error;
    }

    // --- Send WhatsApp Notification (after successful DB update) ---
    const notificationResult = await sendPackingNotification(updatedTransaction);

    // --- Revalidate cache to show updated status on the frontend ---
    revalidatePath('/transactions/online');
    revalidatePath('/dashboard');

    return NextResponse.json({
      success: true,
      message: 'Bill status updated to packed.',
      whatsapp: {
        sent: notificationResult.success,
        result: notificationResult.success ? notificationResult.data : null,
        error: notificationResult.success ? null : notificationResult.error,
      },
      data: {
        organisationId: updatedTransaction.organisationId,
        billNumber: updatedTransaction.companyBillNo,
        newStatus: updatedTransaction.status,
      }
    });

  } catch (error: any) {
    console.error('Failed to update packing status:', error.message, {
        params: context.params,
    });
    return NextResponse.json(
      { error: 'An internal error occurred while updating the packing status.' },
      { status: 500 }
    );
  }
}