// app/api/customers/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-options';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Note the Promise wrapper
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params; // Await params first
    const customerId = parseInt(id);
    if (isNaN(customerId)) {
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
    }

    const body = await request.json();
    const {
      name,
      phone,
      email,
      flatNo,
      street,
      district,
      state,
      pincode
    } = body;

    // Check if customer exists and belongs to the organisation
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        organisationId: parseInt(session.user.id)
      }
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Check if phone number is being used by another customer
    // const phoneExists = await prisma.customer.findFirst({
    //   where: {
    //     phone,
    //     id: { not: customerId },
    //     organisationId: parseInt(session.user.id)
    //   }
    // });

    // // if (phoneExists) {
    // //   return NextResponse.json(
    // //     { error: 'Phone number is already in use by another customer' },
    // //     { status: 400 }
    // //   );
    // // }

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        name,
        phone,
        email,
        flatNo,
        street,
        district,
        state,
        pincode
      }
    });

    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params; // Await params first
    const customerId = parseInt(id);
    if (isNaN(customerId)) {
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
    }

    // First, delete related records that depend on customerId
    await prisma.transactionRecord.deleteMany({ where: { customerId: customerId } });
    await prisma.customerSubmission.deleteMany({ where: { customerId: customerId } });

    // Now delete the customer
    await prisma.customer.delete({
      where: {
        id: customerId,
        organisationId: parseInt(session.user.id),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error); // Log error to see more details
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
