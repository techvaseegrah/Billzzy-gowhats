// hooks/useRazorpayConnect.ts
import { useState, useCallback } from 'react';
import { RAZORPAY_CONFIG } from '@/config/razorpay';

export function useRazorpayConnect() {
  const [isConnected, setIsConnected] = useState(false);

  const initiateConnect = useCallback(() => {
    const state = crypto.randomUUID();
    sessionStorage.setItem('razorpay_state', state);

    const authUrl = new URL(RAZORPAY_CONFIG.auth_url);
    authUrl.searchParams.append('client_id', RAZORPAY_CONFIG.client_id);
    authUrl.searchParams.append('redirect_uri', RAZORPAY_CONFIG.redirect_uri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('state', state);
    
    window.location.href = authUrl.toString();
  }, []);

  return { initiateConnect, isConnected };
}