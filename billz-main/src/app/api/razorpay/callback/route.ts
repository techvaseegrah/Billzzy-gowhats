// app/api/razorpay/callback/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://billzzy.com' 
  : 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.redirect(`${BASE_URL}/login`);
  }

  const searchParams = request.nextUrl.searchParams;
  const state = searchParams.get('state');
  const code = searchParams.get('code');

  const organisation = await prisma.organisation.findUnique({
    where: { id: parseInt(session.user.id) },
    select: {
      id: true,
      razorpayState: true,
      razorpayStateExpiresAt: true
    }
  });

  if (!organisation ||
    organisation.razorpayState !== state ||
    !organisation.razorpayStateExpiresAt ||
    new Date() > organisation.razorpayStateExpiresAt) {
    return NextResponse.redirect(`${BASE_URL}/dashboard?razorpay=invalid`);
  }

  try {
    const tokenResponse = await fetch('https://auth.razorpay.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        grant_type: 'authorization_code',
        client_id: process.env.NEXT_RAZORPAY_CLIENT_ID!,
        client_secret: process.env.NEXT_RAZORPAY_CLIENT_SECRET!,
        redirect_uri: `${BASE_URL}/api/razorpay/callback`
      })
    });

    const tokenData = await tokenResponse.json();

    const expiryDate = tokenData.expires_in ?
      new Date(Date.now() + (parseInt(tokenData.expires_in) * 1000)) :
      null;

    await prisma.organisation.update({
      where: { id: parseInt(session.user.id) },
      data: {
        razorpayAccessToken: tokenData.access_token || null,
        razorpayRefreshToken: tokenData.refresh_token || null,
        razorpayTokenExpiresAt: expiryDate,
        razorpayAccountId: tokenData.account_id || null,
        razorpayState: null,
        razorpayStateExpiresAt: null
      }
    });

    return NextResponse.redirect(`${BASE_URL}/dashboard?razorpay=connected`);
  } catch (error) {
    console.error('Razorpay OAuth error:', error.message);
    return NextResponse.redirect(`${BASE_URL}/dashboard?razorpay=error`);
  }
}