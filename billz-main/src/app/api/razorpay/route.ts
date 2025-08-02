// app/api/razorpay/initiate/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  console.log("trigggered");

  console.log(process.env.NEXT_PUBLIC_BASE_URL);
  
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const state = crypto.randomUUID();
  
  await prisma.organisation.update({
    where: { id: parseInt(session.user.id) },
    data: {
      razorpayState: state,
      razorpayStateExpiresAt: new Date(Date.now() + 600000)
    }
  });

  const authUrl = new URL('https://auth.razorpay.com/authorize');
  authUrl.searchParams.append('client_id', process.env.NEXT_RAZORPAY_CLIENT_ID!);
  authUrl.searchParams.append('redirect_uri', `${process.env.NEXT_PUBLIC_BASE_URL}/api/razorpay/callback`);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', 'read_write');
  authUrl.searchParams.append('state', state);
console.log(authUrl,"url");

  return NextResponse.json({ authUrl: authUrl.toString() });
}

