// api/billing/customers
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-options';



export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const customers = await prisma.customer.findMany({
      where: {
        organisationId: parseInt(session.user.id),
        ...(search && {
          OR: [
            { name: { contains: search } },
            { phone: { contains: search } },
            { email: { contains: search } }
          ]
        })
      },
      include: {
        _count: {
          select: { transactions: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
   
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Check if customer exists with same phone number
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        phone,
        organisationId: parseInt(session.user.id)
      }
    });

    // if (existingCustomer) {
    //   return NextResponse.json(
    //     { error: 'Customer with this phone number already exists' },
    //     { status: 400 }
    //   );
    // }

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email,
        flatNo,
        street,
        district,
        state,
        pincode,
        organisationId: parseInt(session.user.id)
      }
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}