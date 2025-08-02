'use client';

import useSWR from 'swr';
import { MandateForm } from '@/components/mandate/MandateForm';
import { MandateHistory } from '@/components/mandate/MandateHistory';
import React from 'react';

interface BillingSubscriptionData {
  subscriptionType?: string;
}

interface BillingTabProps {
  initialSubscriptionType?: string;
  mandates?: any[];
  endDate?: string;
  activeMandate?: any;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BillingTab({
  initialSubscriptionType,
  mandates,
  endDate,
  activeMandate
}: BillingTabProps) {
  // Use SWR to fetch only the subscription type data.
  const { data, error } = useSWR<BillingSubscriptionData>(
    '/api/organisation',
    fetcher,
    {
      fallbackData: { subscriptionType: initialSubscriptionType },
      revalidateOnFocus: true,
      // You can remove refreshInterval if you want to update only on focus or manually.
      refreshInterval: 10000, // Uncomment to poll every 60 seconds
    }
  );

  if (error) return <div>Error loading subscription data</div>;

  const subscriptionType = data?.organisation.subscriptionType || initialSubscriptionType;
console.log(subscriptionType);

  // Render MandateForm if subscription is trial; otherwise, render MandateHistory.
  if (subscriptionType === 'trial') {
    return <MandateForm />;
  }

  return (
    <MandateHistory
      mandates={mandates}
      activeMandate={activeMandate}
      endDate={endDate}
    />
  );
}
