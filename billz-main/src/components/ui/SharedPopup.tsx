// components/ui/SharePopup.tsx
'use client';

import React from 'react';
import { toast } from 'react-toastify';
import { ShareIcon, ClipboardIcon } from '@heroicons/react/24/outline';

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SharePopup({ isOpen, onClose }: SharePopupProps) {
  const [link, setLink] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const generateAndShareLink = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/billing/generateLink', {
        method: 'POST',
      });
      const data = await response.json();
      setLink(data.link);
    } catch (error) {
      toast.error('Failed to generate link');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link);
    toast.success('Link copied!');
  };

  const shareToWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(link)}`;
    window.open(whatsappUrl, '_blank');
  };

  React.useEffect(() => {
    if (isOpen) {
      generateAndShareLink();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-80 space-y-4 transform transition-all duration-300 ease-in-out animate-fadeIn">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Share Link</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            ×
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={copyToClipboard}
              className="w-full flex items-center justify-center space-x-2 p-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ClipboardIcon className="h-5 w-5" />
              <span>Copy Link</span>
            </button>
            
            <button
              onClick={shareToWhatsApp}
              className="w-full flex items-center justify-center space-x-2 p-2 rounded bg-green-500 text-white hover:bg-green-600 transition-colors"
            >
              <ShareIcon className="h-5 w-5" />
              <span>Share on WhatsApp</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}