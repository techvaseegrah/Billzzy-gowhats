// app/api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { addHours } from 'date-fns';

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "acupidscorner@gmail.com",
    pass: "pcsx ozej dsen krdn",
  },
});

export async function POST(request: Request) {
  try {
    const { email, phone } = await request.json();

    // Find user by email and phone
    const user = await prisma.organisation.findFirst({
      where: {
        email,
        phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email and phone number' },
        { status: 404 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = addHours(new Date(), 1); // Token expires in 1 hour

    // Save token to database
    await prisma.organisation.update({
      where: {
        id: user.id
      },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Create reset password link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    // Email template
    const mailOptions = {
      from: 'acupidscorner@gmail.com',
      to: email,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="color: #4F46E5; word-break: break-all;">${resetLink}</p>
          <p style="color: #666;">This link will expire in 1 hour.</p>
          <p style="color: #666;">If you didn't request this reset, please ignore this email.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #888; font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Password reset link has been sent to your email'
    });

  } catch (error) {
    console.error('Forgot password error:', error.message, error.stack);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}