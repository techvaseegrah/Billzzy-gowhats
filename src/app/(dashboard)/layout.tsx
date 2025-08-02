// app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options'; // Update to your path
import DashboardLayout from '@/components/layouts/DashboardLayout';
import OfflineMessage from '@/components/layouts/OfflineMessage'; // Example extra component

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1) Check session on the server
  const session = await getServerSession(authOptions);

  // 2) If not logged in, redirect
  if (!session) {
    redirect('/login');
  }

  // 3) Pass user data to the client layout
  return (
    <DashboardLayout user={session.user}>
      <OfflineMessage /> {/* optional extra component */}
      {children}
    </DashboardLayout>
  );
}
