'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SettingsTabs } from '@/components/settings/Tabs';
import { ShopSettings } from '@/components/settings/ShopSettings';
import { PasswordSettings } from '@/components/settings/PasswordSettings';
import { ShippingSettings } from '@/components/settings/ShippingSettings';
import { IntegrationsSettings } from '@/components/settings/IntegrationsSettings';
import React from 'react';
import type { OrganisationDetails } from '@/types/settings';
import BillingTab from '../mandate/BillingTab';
import { WhatsAppSettings } from './WhatsappSettings';
import { TaxSettings } from '@/components/settings/TaxSettings';
import ShopifySettings from './ShopifySettings';



interface ExtendedOrganisationDetails extends OrganisationDetails {
  subscriptionType?: string;
  mandates?: any[];
  activeMandate?: any;
}

export default function SettingsForm({ organisation, initialData }: { initialData: ExtendedOrganisationDetails }) {
  const router = useRouter();

  console.log(initialData.endDate);

  const [activeTab, setActiveTab] = useState<
    'shop' | 'password' | 'shipping' | 'whatsapp' | 'integrations' | 'shopify' | 'billing' | 'tax'
  >('shop');

  return (
    <div className="min-h-screen bg-gray-50 md:p-4">
      <div className="max-w-[1280px] min-h-[90vh] mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col min-h-[100vh] md:flex-row">
          {/* Left side: Tabs */}
          <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Right side: Content Area */}
          <div className="flex-1 min-h-[90vh] p-4 md:p-4">
            {activeTab === 'shop' && (
              <ShopSettings initialData={organisation} onSuccess={() => router.refresh()} />
            )}
            {activeTab === 'password' && (
              <PasswordSettings onSuccess={() => router.refresh()} />
            )}
            {activeTab === 'shopify' && (
              <ShopifySettings
                initialDomain={organisation.shopifyDomain}
                initialToken={organisation.shopifyToken}
              />)}
            {activeTab === 'shipping' && <ShippingSettings />}
            {activeTab === 'whatsapp' && (
              <WhatsAppSettings
                initialNumber={initialData.whatsappNumber || ''}
                onSuccess={() => router.refresh()}
              />
            )}
            {activeTab === 'integrations' && (
              <IntegrationsSettings
                razorpayConnected={!!initialData.razorpayAccessToken}
                onRazorpayUpdate={() => router.refresh()}
              />
            )}
            {activeTab === 'billing' && (
              <BillingTab
                initialSubscriptionType={initialData.subscriptionType}
                mandates={initialData.mandates}
                endDate={initialData.endDate}
                activeMandate={initialData.activeMandate}
              />
            )}

            {activeTab === 'tax' && (
              <TaxSettings />
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
