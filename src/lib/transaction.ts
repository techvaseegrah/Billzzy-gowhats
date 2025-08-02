// lib/processTransaction.ts
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

interface BillItem {
  productId: number;
  quantity: number;
  total: number;
}

interface CustomerDetails {
  name: string;
  phone: string;
}

interface PaymentDetails {
  method: string;
  amountPaid: number;
}

interface BillRequest {
  items: BillItem[];
  customerDetails: CustomerDetails;
  paymentDetails: PaymentDetails;
  total: number;
}

async function generateGlobalBillNumber(tx: Prisma.TransactionClient): Promise<number> {
  const lastBill = await tx.transactionRecord.findFirst({
    orderBy: { billNo: 'desc' },
  });
  return (lastBill?.billNo ?? 0) + 1;
}

export async function processTransaction(data: BillRequest, organisationId: number) {
  return await prisma.$transaction(async (tx) => {
    // 1. Find or Create Customer
    let customer = await tx.customer.findFirst({
      where: {
        phone: data.customerDetails.phone,
        organisationId,
      },
    });

     const org = await tx.organisation.update({
      where: { id: organisationId },
      data: { billCounter: { increment: 1 } },
      select: { billCounter: true }
    });
    const newCompanyBillNo = org.billCounter;

    if (!customer) {
      customer = await tx.customer.create({
        data: {
          name: data.customerDetails.name,
          phone: data.customerDetails.phone,
          organisationId,
        },
      });
    }

        const newGlobalBillNo = await generateGlobalBillNumber(tx);



    // 3. Create Transaction Record
    const transaction = await tx.transactionRecord.create({
      data: {
        billNo: newGlobalBillNo,          // Old global ID
        companyBillNo: newCompanyBillNo,  // <-- ADD THIS
        totalPrice: data.total,
        billingMode: 'offline',
        paymentMethod: data.paymentDetails.method,
        amountPaid: data.paymentDetails.amountPaid,
        balance: data.paymentDetails.amountPaid - data.total,
        organisationId,
        customerId: customer.id,
        date: new Date(data.date),
        time:new Date(`1970-01-01T${data.time}.000Z`),
        status: 'confirmed',
        notes:data.notes
      },
    });

    // 4. Batch Fetch Products
    const productIds = data.items.map((item) => item.productId);
    const products = await tx.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    const productMap = new Map<number, any>();
    products.forEach((product) => {
      productMap.set(product.id, product);
    });

    // 5. Validate Products and Stock
    for (const item of data.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
    }

    // 6. Update Product Quantities in Parallel
    await Promise.all(
      data.items.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        })
      )
    );

    // 7. Create Transaction Items in Bulk
    await tx.transactionItem.createMany({
      data: data.items.map((item) => ({
        transactionId: transaction.id,
        productId: item.productId,
        quantity: item.quantity,
        totalPrice: item.total,
      })),
    });

    return transaction.id;
  }, {
    maxWait: 5000,
    timeout: 10000,
    isolationLevel: 'Serializable',
  });
}
