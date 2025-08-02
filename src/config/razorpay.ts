// config/razorpay.ts
export const RAZORPAY_CONFIG = {
    client_id: process.env.RAZORPAY_CLIENT_ID!,
    client_secret: process.env.RAZORPAY_CLIENT_SECRET!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/razorpay/callback`,
    auth_url: 'https://auth.razorpay.com/authorize',
    token_url: 'https://auth.razorpay.com/token',
  };