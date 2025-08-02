// app/dashboard/mandate/page.tsx

import { MandateForm } from "@/components/mandate/MandateForm";
import React from 'react';
export default function MandatePage() {
  return (
    <div className="container mx-auto px-2 py-8">
      <MandateForm />
    </div>
  );
}