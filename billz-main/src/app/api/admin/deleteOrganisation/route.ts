import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    const organisationId = Number(id);

    await prisma.$transaction(async (tx) => {
      // 1. Delete transaction-related records
      // First delete shipping records
      await tx.transactionShipping.deleteMany({
        where: {
          transaction: { organisationId }
        }
      });

      // Then delete transaction items
      await tx.transactionItem.deleteMany({
        where: {
          transaction: { organisationId }
        }
      });

      // Then delete main transaction records
      await tx.transactionRecord.deleteMany({
        where: { organisationId }
      });

      // 2. Delete inventory records
      await tx.inventory.deleteMany({
        where: { organisationId }
      });

      // 3. Delete customer-related records
      await tx.customerSubmission.deleteMany({
        where: { organisationId }
      });

      await tx.customer.deleteMany({
        where: { organisationId }
      });

      // 4. Delete product-related records
      await tx.product.deleteMany({
        where: { organisationId }
      });

      await tx.productCategory.deleteMany({
        where: { organisationId }
      });

      // 5. Delete seller records
      await tx.seller.deleteMany({
        where: { organisationId }
      });

      // 6. Delete shipping methods
      await tx.shippingMethod.deleteMany({
        where: { organisationId }
      });

      // Check for any subscription details
      await tx.subscriptionDetails.deleteMany({
        where: { organisationId }
      });

      // Finally delete the organisation
      await tx.organisation.delete({
        where: { id: organisationId }
      });
    });

    return NextResponse.json({ 
      success: true,
      message: 'Organisation and all related records deleted successfully' 
    });

  } catch (error) {
    console.error('Error in deletion process:', error);
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to delete organisation and related records',
      details: error.message 
    }, { 
      status: 500 
    });
  }
}