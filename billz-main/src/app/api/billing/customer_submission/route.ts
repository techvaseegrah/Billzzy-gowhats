// File: app/api/customer_submissions/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

const submissionSchema = z.object({
  token: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string().optional(),
  flatNo: z.string().optional(),
  street: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedData = submissionSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid data', errors: parsedData.error.errors },
        { status: 400 }
      );
    }

    const {
      token,
      name,
      phone,
      email,
      flatNo,
      street,
      district,
      state,
      pincode,
      notes,
    } = parsedData.data;

    // Find the submission by token
    const submission = await prisma.customerSubmission.findUnique({
      where: { token },
    });


    if (!submission) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 400 });
    }
    if (submission?.status === 'pending') {
      return NextResponse.json(
        { error: 'This form has already been submitted' },
        { status: 400 }
      );
    }


    const organisationId = submission.organisationId;

    // Find or create the customer
    let customer = await prisma.customer.findFirst({
      where: {
        phone,
        organisationId,
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name,
          phone,
          email,
          flatNo,
          street,
          district,
          state,
          pincode,
          organisationId,
        },
      });
    } else {
      // Update customer details if needed
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name,
          email,
          flatNo,
          street,
          district,
          state,
          pincode,
        },
      });
    }

    // Update the submission with the customer's data and customerId
    await prisma.customerSubmission.update({
      where: { token },
      data: {
        customerId: customer.id,
        notes,
        status: 'pending',
      },
    });

    return NextResponse.json({ success: true, message: 'Data submitted successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to submit data' }, { status: 500 });
  }
}


export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organisationId = parseInt(session.user.id, 10);

    // Parse the URL and get query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'pending';

    // Fetch customer submissions with the specified status
    const submissions = await prisma.customerSubmission.findMany({
      where: {
        organisationId,
        status,
      },
    });

    // For each submission, fetch the customer data by customerId
    const submissionsWithCustomerData = await Promise.all(
      submissions.map(async (submission) => {
        let customer = null;
        if (submission.customerId) {
          customer = await prisma.customer.findUnique({
            where: { id: submission.customerId },
          });

          // If customer not found, handle accordingly
          if (!customer) {
            console.warn(`Customer with ID ${submission.customerId} not found.`);
            // Decide how to handle this case: set customer to null or throw an error
            // For this example, we'll set customer to null
            customer = null;
          }
        }
        return {
          ...submission,
          customer,
        };
      })
    );

    return NextResponse.json({ submissions: submissionsWithCustomerData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching customer submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch customer submissions' }, { status: 500 });
  }
}

