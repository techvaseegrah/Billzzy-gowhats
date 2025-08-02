'use client';

import React from 'react';
import { useState, useEffect } from 'react';

export default function OfflineMessage() {
  const [isOffline, setIsOffline] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after initial hydration
    setIsClient(true);

    // Set the initial online status
    setIsOffline(!navigator.onLine);

    const handleOffline = () => {
      setIsOffline(true);
    };

    const handleOnline = () => {
      setIsOffline(false);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // On the server or during initial client render, isClient is false, so we render null.
  // This ensures the server and client HTML match perfectly.
  if (!isClient) {
    return null;
  }

  // After hydration, if the client is offline, render the message.
  if (isOffline) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white text-center p-2 z-50">
        You are currently offline. Some features may not be available.
      </div>
    );
  }

  // If online, render nothing.
  return null;
}
