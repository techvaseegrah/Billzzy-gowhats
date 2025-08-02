// app/api/register/route.ts (or similar)
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

function addOneMonthClamped(date: Date): Date {
  // Create a new Date object with the same date/time
  const newDate = new Date(date.getTime());

  // Remember the original day-of-month
  const currentDay = newDate.getDate();

  // Add one month
  newDate.setMonth(newDate.getMonth() + 1);

  // If we "overflow" (e.g. Jan 31 -> Mar 3),
  // clamp to the last day of the *new* month.
  if (newDate.getDate() < currentDay) {
    // Setting .setDate(0) moves the date to the
    // *last day of the previous month*, which is
    // effectively the correct "clamped" date.
    newDate.setDate(0);
  }

  return newDate;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      name,
      phone,
      companySize,
      shopName,
      flatNo,
      street,
      district,
      state,
      country,
      pincode,
      mobileNumber,
      websiteAddress,
      gstNumber,
    } = body;

    // 1. Check if user exists
    const existingUser = await prisma.organisation.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      );
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Calculate endDate as "now + 1 month" with clamping
    const now = new Date();
    const trialEndDate = addOneMonthClamped(now);

    // 4. Create organisation with trial subscription
    const organisation = await prisma.organisation.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        companySize: '0',
        shopName,
        flatNo,
        street,
        district,
        state,
        country,
        pincode,
        mobileNumber,
        websiteAddress,
        gstNumber,
        subscriptionType: 'trial',
        endDate: trialEndDate,    // set endDate to now+1 month (clamped)
        monthlyUsage: 0,         // Start usage at 0
        smsCount: 0,
        smsCost: 0,
      },
    });

    return NextResponse.json(
      {
        message: 'Registration successful',
        organisation: {
          id: organisation.id,
          email: organisation.email,
          name: organisation.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', (error as Error).message);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
