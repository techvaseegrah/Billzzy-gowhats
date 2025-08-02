// types/razorpay.ts
export interface RazorpayCredentials {
    access_token: string;
    refresh_token: string;
    expires_at: Date;
    razorpay_account_id: string;
  }
  
  export interface RazorpayTokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    account_id: string;
  }