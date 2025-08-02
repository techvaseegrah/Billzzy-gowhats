// app/admin/page.tsx
import { prisma } from '@/lib/prisma'; // Adjust if needed
import { Organisation } from '@prisma/client';
import AdminDashboard from '@/components/admin/AdminTable';
import React from 'react';

interface OrganisationWithRemainingDays extends Organisation {
  remainingDays: number;
}

const AdminPage = async () => {
  // 1) Fetch all organizations with desired fields
  const organisations = await prisma.organisation.findMany({
    select: {
      id: true,
      phone: true,
      name: true,
      companySize: true,
      shopName: true,
      district: true,
      state: true,
      smsCount: true,
      subscriptionType: true,
      monthlyUsage: true,
      endDate: true,
    },
  });

  // 2) Calculate remaining days for each
  const today = new Date();
  const orgsWithRemainingDays = organisations.map((org) => {
    const endDate = new Date(org.endDate);
    const remainingDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return { ...org, remainingDays };
  });

  return <AdminDashboard organisations={orgsWithRemainingDays} />;
};

export default AdminPage;
