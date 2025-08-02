// src/app/api/admin/resetSms/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: 'Organisation ID is required' }, { status: 400 });
    }

    const organisationId = Number(id);

    // Find the organisation to ensure it exists
    const organisation = await prisma.organisation.findUnique({
      where: { id: organisationId },
    });

    if (!organisation) {
      return NextResponse.json({ message: 'Organisation not found' }, { status: 404 });
    }

    // Reset the smsCount and smsCost to 0
    await prisma.organisation.update({
      where: { id: organisationId },
      data: {
        smsCount: 0,
        smsCost: 0,
      },
    });

    return NextResponse.json({ message: 'SMS count and cost have been reset successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Error resetting SMS count:', error);
    return NextResponse.json({ message: 'An error occurred while resetting the SMS count.' }, { status: 500 });
  }
}