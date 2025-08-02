// lib/generateBillNumber.ts
import { Prisma } from '@prisma/client';

export async function generateBillNumber(
  tx: Prisma.TransactionClient,
  organisationId: number,
  billingMode: 'online' | 'offline'
): Promise<number> {
  // Special case for your legacy organization (replace 123 with the actual ID)
  const legacyOrganizationId = 10;
  
  if (organisationId === legacyOrganizationId) {
    // For the legacy organization, find the highest bill number regardless of billing mode
    const lastBill = await tx.transactionRecord.findFirst({
      where: {
        organisationId,
      },
      orderBy: {
        billNo: 'desc',
      },
    });
    
    return lastBill ? lastBill.billNo + 1 : 1001;
  } else {
    // For all other organizations, use the per-mode bill numbering
    const lastBill = await tx.transactionRecord.findFirst({
      where: {
        organisationId,
        billingMode,
      },
      orderBy: {
        billNo: 'desc',
      },
    });
    
    return lastBill ? lastBill.billNo + 1 : 1001;
  }
}