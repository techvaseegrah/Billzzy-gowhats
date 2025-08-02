// app/api/mandate/notification/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { IciciCrypto } from '@/lib/iciciCrypto';
import { generateRandomSixDigitNumber } from '@/lib/utils';
import { addHours, format } from 'date-fns';
import { createNotification } from '@/lib/utils/createNotification';

export async function POST() {
  try {
    const now = new Date();
    const in48Hours = addHours(now, 48);

    console.log('[Notification] Window:', { now, in48Hours });



    // Fetch pending notifications based on activeMandate and organisation conditions
    const pendingNotifications = await prisma.activeMandate.findMany({
      where: {
        organisation: {
          endDate: {
            gt: now,
            lte: in48Hours
          }
        },
        status: 'ACTIVATED',
        notified: false, // Only get unnotified mandates
        OR: [
          // Regular notification check
          {
            mandateSeqNo: { gt: 1 },
            OR: [
              { notificationRetries: 0 },
              {
                notificationRetries: { lt: 3 },
                lastNotificationAttempt: {
                  lt: new Date(now.getTime() - 3600000)
                }
              }
            ]
          },
          // Reset condition when retries reach 3
          {
            notificationRetries: 3,
            lastNotificationAttempt: {
              lt: new Date(now.getTime() - 3600000)
            }
          }
        ]
      },
      include: { organisation: true }
    });

    console.log('[Notification] Found mandates:', pendingNotifications.length);

    const results = await Promise.all(
      pendingNotifications.map(async (mandate) => {
        try {
          const notificationPayload = {
            merchantId: process.env.ICICI_MERCHANT_ID || "",
            subMerchantId: generateRandomSixDigitNumber(),
            terminalId: "4816",
            merchantName: 'Tech Vaseegrah',
            subMerchantName: mandate.organisation.name,
            payerVa: mandate.payerVA,
            amount: Number(mandate.amount).toFixed(2), // Ensure 2 decimal places
            note: "Mandate notification",
            executionDate: format(mandate.organisation.endDate, 'dd/MM/yyyy HH:mm a'), // Format should match docs
            merchantTranId: `NOTIF_${Date.now()}_${mandate.organisationId}`,
            mandateSeqNo: (mandate.mandateSeqNo).toString(),
            key: "UMN",
            value: mandate.UMN // Should be in format "<32 character>@<PSP Handle>"
          };


          // await createNotification(
          //   mandate.organisationId,
          //   'MANDATE_EXECUTION_REMINDER',
          //   `Your UPI mandate payment of ₹${mandate.amount} is scheduled for ${mandate.organisation.endDate.toLocaleDateString()}. Please ensure sufficient balance.`
          // );



          const { encryptedKey, iv, encryptedData } = IciciCrypto.encrypt(notificationPayload);

          const response = await fetch(
            `${process.env.ICICI_API_BASE_URL}/MandateNotification`,
            {
              method: 'POST',
              headers: {
                "Content-Type": "application/json",
                apikey: process.env.ICICI_API_KEY || "",
                Accept: "*/*"
              },
              body: JSON.stringify({
                requestId: notificationPayload.merchantTranId,
                service: "MandateNotification",
                encryptedKey,
                iv,
                encryptedData
              })
            }
          );

          const responseData = await response.json();
          console.log('[Notification] raw Response :', responseData);

          const decryptedResponse = responseData?.encryptedData
            ? IciciCrypto.decrypt(responseData.encryptedData, responseData.encryptedKey, responseData.iv)
            : null;

          console.log('[Notification] Response for mandate id:', mandate.id, decryptedResponse);

          // Modified success condition: response must be OK, decryptedResponse.success must be "true" AND decryptedResponse.message must be "Transaction Initiated"
          if (
            decryptedResponse?.success === "true" &&
            decryptedResponse?.message === "Transaction Successful"
          ) {
            // Reset on success
            await prisma.activeMandate.update({
              where: { id: mandate.id },
              data: {
                notified: true,
                notificationRetries: 0,
                lastNotificationAttempt: now
              }
            });
            // await createNotification(
            //   mandate.id,
            //   'MANDATE_EXECUTION_REMINDER',
            //   `Your UPI mandate payment of ₹${mandate.amount} is scheduled for ${mandate.organisation.endDate.toLocaleDateString()}. Please ensure sufficient balance.`
            // );
            return {
              id: mandate.id,
              status: 'success',
              retryCount: 0
            };
          }

          // Handle failure
          if (mandate.notificationRetries >= 3) {
            // Reset after 3 failures
            await prisma.activeMandate.update({
              where: { id: mandate.id },
              data: {
                notified: false,
                notificationRetries: 0,
                lastNotificationAttempt: now
              }
            });
            return {
              id: mandate.id,
              status: 'failed',
              retryCount: 0,
              message: 'Retries reset after 3 attempts'
            };
          } else {
            // Increment retry count
            const newRetryCount = mandate.notificationRetries + 1;
            await prisma.activeMandate.update({
              where: { id: mandate.id },
              data: {
                notified: false,
                notificationRetries: newRetryCount,
                lastNotificationAttempt: now
              }
            });
            return {
              id: mandate.id,
              status: 'failed',
              retryCount: newRetryCount
            };
          }

        } catch (error: any) {
          console.error('[Notification] Error for mandate id:', mandate.id, error);

          if (mandate.notificationRetries >= 3) {
            await prisma.activeMandate.update({
              where: { id: mandate.id },
              data: {
                notified: false,
                notificationRetries: 0,
                lastNotificationAttempt: now
              }
            });
            return {
              id: mandate.id,
              status: 'error',
              retryCount: 0,
              message: `${error.message} - Retries reset`
            };
          } else {
            const newRetryCount = mandate.notificationRetries + 1;
            await prisma.activeMandate.update({
              where: { id: mandate.id },
              data: {
                notified: false,
                notificationRetries: newRetryCount,
                lastNotificationAttempt: now
              }
            });
            return {
              id: mandate.id,
              status: 'error',
              retryCount: newRetryCount,
              message: error.message
            };
          }
        }
      })
    );

    const summary = {
      total: results.length,
      success: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      error: results.filter(r => r.status === 'error').length,
      resetCount: results.filter(r => r.retryCount === 0).length
    };

    console.log('[Notification] Summary:', summary);

    return NextResponse.json({
      success: true,
      processed: results.length,
      summary,
      results
    });

  } catch (error: any) {
    console.error('[Notification] Critical error:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
