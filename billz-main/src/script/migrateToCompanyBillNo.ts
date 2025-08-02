import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // --- Configuration for the specific fix ---
  const TARGET_ORGANISATION_ID = 10;
  const START_COUNTING_FROM = 2637; // The last successfully assigned companyBillNo
  const START_FROM_TRANSACTION_ID = 3318; // The transaction ID to start updating from

  console.log(`Starting targeted migration for Organisation ID: ${TARGET_ORGANISATION_ID}`);
  console.log(`Resuming companyBillNo count from: ${START_COUNTING_FROM}`);
  console.log(`Applying updates to transaction IDs >= ${START_FROM_TRANSACTION_ID}`);

  // Initialize the counter with the specific number to resume from.
  let companyBillCounter = START_COUNTING_FROM;
  
  // Get all transactions for the target organisation starting from the specified transaction ID.
  const transactionsToUpdate = await prisma.transactionRecord.findMany({
    where: { 
      organisationId: TARGET_ORGANISATION_ID,
      id: {
        gte: START_FROM_TRANSACTION_ID // Only update from this transaction ID onwards
      }
    },
    // ✅ CORRECTED: orderBy now uses an array of objects for multiple sort fields.
    orderBy: [
      { date: 'asc' }, 
      { id: 'asc' }
    ], 
  });

  if (transactionsToUpdate.length === 0) {
      console.log(`No transactions found for Organisation ${TARGET_ORGANISATION_ID} starting from transaction ID ${START_FROM_TRANSACTION_ID}. No action taken.`);
      return;
  }

  console.log(`Found ${transactionsToUpdate.length} bills to update for Organisation ${TARGET_ORGANISATION_ID}.`);

  // Loop through each transaction and assign a sequential companyBillNo
  for (const transaction of transactionsToUpdate) {
    companyBillCounter++;
    await prisma.transactionRecord.update({
      where: { id: transaction.id },
      data: { companyBillNo: companyBillCounter },
    });
    console.log(`Updated transaction.id ${transaction.id} with companyBillNo: ${companyBillCounter}`);
  }

  // After numbering all remaining bills, update the organisation's main counter to the final number.
  await prisma.organisation.update({
    where: { id: TARGET_ORGANISATION_ID },
    data: { billCounter: companyBillCounter },
  });

  console.log(`Finished migration for Organisation ${TARGET_ORGANISATION_ID}.`);
  console.log(`Final billCounter for the organisation has been set to: ${companyBillCounter}.`);
}

main()
  .catch((e) => {
    console.error('An error occurred during the targeted migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });