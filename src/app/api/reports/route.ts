/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import puppeteer from 'puppeteer';
import ExcelJS from 'exceljs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';

/**
 * Handles POST requests to fetch transaction records as JSON data.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { start, end } = await req.json();

    if (!start || !end) {
      return NextResponse.json(
        { success: false, message: 'Start and end dates are required' },
        { status: 400 }
      );
    }

    const records = await prisma.transactionRecord.findMany({
      where: {
        organisationId: parseInt(session.user.id), // Filter by organisationId from session
        date: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
      select: {
        customerId: true,
        companyBillNo: true,
        date: true,
        billingMode: true,
        paymentMethod: true,
        paymentStatus: true,
        totalPrice: true,
        amountPaid: true,
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json({ success: true, data: records });
  } catch (error: any) {
    console.error('Error fetching daily report:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch daily report',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Handles GET requests to generate and download a report in PDF or XLSX format.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  const format = searchParams.get('format'); // 'pdf' or 'xlsx'

  if (!start || !end) {
    return NextResponse.json({ error: 'Missing date range' }, { status: 400 });
  }

  try {
    const transactions = await prisma.transactionRecord.findMany({
      where: {
        organisationId: parseInt(session.user.id), // Filter by organisationId from session
        date: {
          gte: new Date(start),
          lte: new Date(end),
        },
        paymentStatus: 'PAID',
      },
      orderBy: {
        date: 'asc',
      },
      include: {
        customer: true,
      },
    });

    const total = transactions.reduce((sum, tx) => sum + tx.totalPrice, 0);

    if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Report');

      worksheet.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Customer Name', key: 'customerName', width: 25 },
        { header: 'Customer Phone', key: 'customerPhone', width: 20 },
        { header: 'Bill No', key: 'billNo', width: 20 },
        { header: 'Payment Method', key: 'paymentMethod', width: 20 },
        { header: 'Total Price', key: 'totalPrice', width: 15 },
      ];

      transactions.forEach((tx) => {
        worksheet.addRow({
          date: tx.date.toISOString().split('T')[0],
          customerName: tx.customer?.name ?? 'N/A',
          customerPhone: tx.customer?.phone ?? 'N/A',
          billNo: tx.companyBillNo,
          paymentMethod: tx.paymentMethod,
          totalPrice: tx.totalPrice,
        });
      });

      worksheet.addRow([]);
      const totalRow = worksheet.addRow([null, null, null, null, 'Total', total]);
      totalRow.font = { bold: true };

      const buffer = await workbook.xlsx.writeBuffer();
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="report-${start}-to-${end}.xlsx"`,
          'Access-Control-Expose-Headers': 'Content-Disposition',
        },
      });
    }

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            h2, h3 { margin-bottom: 10px; text-align: center; }
            p { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h2>Transaction Report</h2>
          <p>From: ${start} To: ${end}</p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer Name</th>
                <th>Customer Phone</th>
                <th>Bill No</th>
                <th>Payment Method</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map((tx) => `
                <tr>
                  <td>${tx.date.toISOString().split('T')[0]}</td>
                  <td>${tx.customer?.name ?? 'N/A'}</td>
                  <td>${tx.customer?.phone ?? 'N/A'}</td>
                  <td>${tx.companyBillNo}</td>
                  <td>${tx.paymentMethod}</td>
                  <td>₹${tx.totalPrice.toFixed(2)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
          <h3>Total Sales: ₹${total.toFixed(2)}</h3>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="report-${start}-to-${end}.pdf"`,
        'Access-Control-Expose-Headers': 'Content-Disposition',
      },
    });
  } catch (error: any) {
    console.error('Excel/PDF generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}