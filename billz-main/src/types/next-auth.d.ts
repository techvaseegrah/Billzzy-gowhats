// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      shopName: string;
      endDate: Date;
      subscriptionType: string;
      smsCount: number;
    } & DefaultSession["user"];
    razorpayState?: string;
    razorpayStateTimestamp?: number;
  }

  interface JWT {
    id: string;
    role: string;
    shopName: string;
    endDate: Date;
    subscriptionType: string;
    smsCount: number;
    razorpayState?: string;
    razorpayStateTimestamp?: number;
  }
}