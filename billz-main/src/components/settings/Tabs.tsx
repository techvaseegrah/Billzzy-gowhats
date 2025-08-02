// components/settings/Tabs.tsx
'use client';

import { cn } from '@/lib/utils';
import React from 'react';

export function SettingsTabs({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}) {
  const tabs = [
    { name: 'Shop Information', key: 'shop' },
    { name: 'Password', key: 'password' },
    { name: 'Shipping', key: 'shipping' },
    { name: 'WhatsApp', key: 'whatsapp' },
    { name: 'Billing', key: 'billing' },
    { name: 'Shopify', key: 'shopify' },

    { name: 'Integrations', key: 'integrations' },
    { name: 'Tax', key: 'tax' }, // Added
  ];

  return (
    <div className="w-full md:w-64 lg:w-72 border-r">
      <nav 
        className="flex md:flex-col overflow-x-auto md:overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-blue-300 hover:scrollbar-thumb-gray-400 scroll-smooth"
        style={{
          scrollbarWidth: 'thin',
          msOverflowStyle: 'none',
        }}
      >
        <div className="flex md:flex-col min-w-full">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-6 py-6 text-sm font-medium text-left transition-all duration-200 whitespace-nowrap',
                'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-inset',
                activeTab === tab.key
                  ? 'bg-blue-50 text-blue-700 border-b-2 md:border-b-0 md:border-r-2 border-blue-600'
                  : 'text-gray-600'
              )}
            >
              <span className="inline-block">{tab.name}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}