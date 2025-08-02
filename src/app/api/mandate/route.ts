import { NextResponse } from 'next/server';
import { format, addYears, addMinutes, addMonths, addDays } from 'date-fns';
import { IciciCrypto } from '@/lib/iciciCrypto';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { generateRandomSixDigitNumber } from '@/lib/utils';


import { toZonedTime } from 'date-fns-tz';


interface MandateRequestBody {
  payerVa: string;
}

interface MandateRequest {
  merchantId: string;
  subMerchantId: string;
  terminalId: string;
  merchantName: string;
  subMerchantName: string;
  payerVa: string;
  amount: string;
  note: string;
  collectByDate: string;
  merchantTranId: string;
  billNumber: string;
  requestType: string;
  validityStartDate: string;
  validityEndDate: string;
  amountLimit: string;
  frequency: string;
  remark: string;
  autoExecute: string;
  debitDay: string;
  debitRule: string;
  revokable: string;
  blockfund: string;
  purpose: string;
  validatePayerAccFlag?: string;
}

export async function POST(request: Request) {
  try {
    const timeZone = 'Asia/Kolkata';
    const today = toZonedTime(new Date(), timeZone);

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const merchantName = session?.user?.name;
    if (!merchantName) {
      return NextResponse.json(
        { error: 'Merchant name not found in session' },
        { status: 400 }
      );
    }

    const body = (await request.json()) as MandateRequestBody;
    const { payerVa } = body;
    if (!payerVa) {
      return NextResponse.json(
        { error: 'Payer Virtual Address is required' },
        { status: 400 }
      );
    }

    const organisationId = session?.user?.id;
    if (!organisationId) {
      return NextResponse.json(
        { error: 'Organisation ID not found in session' },
        { status: 400 }
      );
    }

    const collectByDate = addMinutes(today, 180);
    const validityEndDate = addYears(today, 12);
    const nextMandateDate = addMonths(today, 1);
    // const nextMandateDate = addDays(today, 2);





    // Generate unique IDs with formatted timestamps
    const timestamp = format(today, 'yyyyMMddHHmmss');
    const merchantTranId = `MANDATE_${timestamp}`;
    const billNumber = `BILL_${timestamp}`;





    const mandateRequest: MandateRequest = {
      merchantId: process.env.ICICI_MERCHANT_ID || "",
      subMerchantId: generateRandomSixDigitNumber(),
      terminalId: "4816",
      merchantName: 'Tech Vaseegrah',
      subMerchantName: merchantName,
      payerVa,
      amount: "499.00",
      note: "mandaterequest",
      collectByDate: format(collectByDate, 'dd/MM/yyyy hh:mm a'), // Format correct
      merchantTranId, // Must be unique
      billNumber,
      requestType: "C", // Correct for Create
      validityStartDate: format(today, 'dd/MM/yyyy'),
      validityEndDate: format(validityEndDate, 'dd/MM/yyyy'),
      amountLimit: "M", // "F" for fixed, "M" for maximum
      remark: "Mandate Request",
      autoExecute: "N", // Should be "N" per docs
      frequency: "AS", // Correct value
      debitDay: "NA", // Required for AS frequency
      debitRule: "NA", // Should be "NA" for AS frequency
      revokable: "Y",
      blockfund: "N",
      purpose: "RECURRING",
      validatePayerAccFlag: "N"
    };

    console.log("request payload for create mandate", mandateRequest);


    const { encryptedKey, iv, encryptedData } = IciciCrypto.encrypt(mandateRequest);

    const encryptedPayload = {
      requestId: merchantTranId,
      service: "CreateMandate",
      encryptedKey,
      oaepHashingAlgorithm: "NONE",
      iv,
      encryptedData,
      clientInfo: "",
      optionalParam: ""
    };

    console.log("encrypted payload", encryptedPayload);
    
console.log("ICICI_API_BASE_URL", process.env.ICICI_API_BASE_URL," ICICI_API_KEY", process.env.ICICI_API_KEY);

    const response = await fetch(
      `${process.env.ICICI_API_BASE_URL}/CreateMandate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.ICICI_API_KEY || "",
          Accept: "*/*"
        },
        body: JSON.stringify(encryptedPayload)
      }
    );

   


    if (!response.ok) {
      console.log("response", response);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to create mandate",
          details: await response.text()
        },
        { status: response.status }
      );
    }

    const apiResponse = await response.json();

    console.log("apiResponse", apiResponse);


    let decryptedResponse;
    if (apiResponse?.encryptedData && apiResponse?.encryptedKey) {
      try {
        decryptedResponse = IciciCrypto.decrypt(
          apiResponse.encryptedData,
          apiResponse.encryptedKey,
          apiResponse.iv
        );

        console.log("response from create mandate", decryptedResponse);


        if (!decryptedResponse.success) {

          // Send error response based on ICICI error codes
          const errorCode = decryptedResponse.response;


          return NextResponse.json({
            success: false,
            error: decryptedResponse.message,
            code: errorCode,
            details: decryptedResponse.RespCodeDescription || decryptedResponse.respCodeDescription
          }, { status: 400 });
        }

        const mandateRecord = await prisma.mandate.create({
          data: {
            organisationId: parseInt(organisationId.toString(), 10),
            merchantTranId: decryptedResponse.merchantTranId || merchantTranId,
            bankRRN: decryptedResponse.BankRRN || null,
            UMN: null,
            amount: parseFloat(mandateRequest.amount),
            status: 'INITIATED',
            payerVA: mandateRequest.payerVa,
            payerName: null,
            payerMobile: null,
            txnInitDate: null,
            txnCompletionDate: null,
            responseCode: decryptedResponse.response || null,
            respCodeDescription: decryptedResponse.message || null,
          }
        });

        await prisma.organisation.update({
          where: { id: parseInt(organisationId.toString(), 10) },
          data: { endDate: nextMandateDate }
        });

        return NextResponse.json({
          success: true,
          message: "Mandate creation initiated",
          data: {
            merchantTranId: decryptedResponse.merchantTranId || merchantTranId,
            BankRRN: decryptedResponse.BankRRN,
            status: "INITIATED"
          }
        });

      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to decrypt mandate response",
            details: error instanceof Error ? error.message : "Unknown error"
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: false,
      error: "Invalid response from bank",
      details: "Missing encrypted data in response"
    }, { status: 500 });

  } catch (error) {
    console.log("error", error);

    return NextResponse.json(

      {
        success: false,
        error: "Internal server error while creating mandate",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
