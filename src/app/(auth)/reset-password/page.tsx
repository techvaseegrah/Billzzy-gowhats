// app/reset-password/page.tsx
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import React, { Suspense } from 'react';

export const dynamic = 'force-dynamic'; // Optional: Ensure the page is treated as dynamic

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}