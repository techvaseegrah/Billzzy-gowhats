import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { MandateForm } from '../mandate/MandateForm';
import { MandateHistory } from '../mandate/MandateHistory';
import React from 'react';


export default async function BillingPage() {
  // 1. Check session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return <div>Please login to view this page.</div>;
  }

  // 2. Get organisation record (we assume session.user.id = organisation.id)
  const organisationId = parseInt(session.user.id, 10);
  const organisation = await prisma.organisation.findUnique({
    where: { id: organisationId },
    select: {
      subscriptionType: true,
    },
  });

  if (!organisation) {
    return <div>Organisation not found.</div>;
  }

  // 3. Check subscriptionType
  if (organisation.subscriptionType === 'trial') {
    // Render the MandateForm
    return <MandateForm />;
  } else {
    // 4. If pro (or anything else), fetch Mandate history & ActiveMandate
    const [mandates, activeMandate] = await Promise.all([
      prisma.mandate.findMany({
        where: { organisationId },
        orderBy: { id: 'desc' },
      }),
      prisma.activeMandate.findUnique({
        where: { organisationId },
      }),
    ]);

    // 5. Render MandateHistory
    return <MandateHistory mandates={mandates} activeMandate={activeMandate} />;
  }
}
