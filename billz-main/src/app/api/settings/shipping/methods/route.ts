// app/api/settings/shipping/methods/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { ShippingMethodType } from '@prisma/client';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const methods = await prisma.shippingMethod.findMany({
      where: {
        organisationId: Number(session.user.id)
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(methods);
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipping methods' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Validate the shipping method type
    if (!Object.values(ShippingMethodType).includes(data.type)) {
      return NextResponse.json(
        { error: 'Invalid shipping method type' },
        { status: 400 }
      );
    }

    const shippingMethod = await prisma.shippingMethod.create({
      data: {
        name: data.name,
        type: data.type as ShippingMethodType,
        minAmount: data.minAmount || null,
        useWeight: data.useWeight || false,
        ratePerKg: data.useWeight ? data.ratePerKg || null : null,
        fixedRate: !data.useWeight && data.type === 'COURIER_PARTNER' ? data.fixedRate || null : null,
        isActive: data.isActive ?? true,
        organisationId: Number(session.user.id),
      }
    });

    return NextResponse.json(shippingMethod);
  } catch (error: any) {
    console.error('Creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create shipping method', details: error.message },
      { status: 500 }
    );
  }
}


export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    if (!data.id) {
      return NextResponse.json(
        { error: 'Shipping method ID is required' },
        { status: 400 }
      );
    }

    const method = await prisma.shippingMethod.update({
      where: {
        id: data.id,
        organisationId: Number(session.user.id)
      },
      data: {
        name: data.name,
        type: data.type as ShippingMethodType,
        minAmount: data.minAmount || null,
        useWeight: data.useWeight,
        ratePerKg: data.useWeight ? data.ratePerKg || null : null,
        fixedRate: !data.useWeight && data.type === 'COURIER_PARTNER' ? data.fixedRate || null : null,
        isActive: data.isActive
      }
    });

    return NextResponse.json(method);
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update shipping method', details: error.message },
      { status: 500 }
    );
  }
}

// Add DELETE endpoint if needed
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Shipping method ID is required' },
        { status: 400 }
      );
    }

    await prisma.shippingMethod.delete({
      where: {
        id: parseInt(id),
        organisationId: Number(session.user.id)
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete shipping method' },
      { status: 500 }
    );
  }
}