// lib/auth-options.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        

        // Admin check
        if (
          credentials.email === 'admin@billz.com' &&
          credentials.password === 'Tech$feb14'
        ) {
          return {
            id: "admin",
            email: credentials.email,
            name: "Admin",
            role: "admin",
          };
        }

        // Regular user check
        const user = await prisma.organisation.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
            shopName: true,
            endDate: true,
            subscriptionType: true,
            smsCount: true,
          },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          shopName: user.shopName,
          endDate: user.endDate,
          subscriptionType: user.subscriptionType,
          smsCount: user.smsCount,
          role: "user",
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.shopName = user.shopName;
        token.endDate = user.endDate;
        token.subscriptionType = user.subscriptionType;
        token.smsCount = user.smsCount;
      }

      // Add Razorpay state management
      if (token.razorpayState) {
        const stateTimestamp = token.razorpayStateTimestamp as number;
        const isStateExpired = Date.now() - stateTimestamp > 600000; // 10 minutes

        if (isStateExpired) {
          delete token.razorpayState;
          delete token.razorpayStateTimestamp;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.shopName = token.shopName;
        session.user.endDate = token.endDate;
        session.user.subscriptionType = token.subscriptionType;
        session.user.smsCount = token.smsCount;

        // Include Razorpay state in session if present
        if (token.razorpayState) {
          session.razorpayState = token.razorpayState;
          session.razorpayStateTimestamp = token.razorpayStateTimestamp;
        }
      }
      return session;
    },
  },
};