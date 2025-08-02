import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { randomBytes } from 'crypto';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organisationId = parseInt(session.user.id, 10);

    // Generate a unique token
    const token = randomBytes(16).toString('hex');

    // Create a new CustomerSubmission entry with the token
    await prisma.customerSubmission.create({
      data: {
        organisationId,
        token,
        status:"created"
      },
    });

    const link = `${process.env.NEXT_PUBLIC_APP_URL}/addressForm/${token}`;

    return NextResponse.json({ link }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate link' }, { status: 500 });
  }
}
