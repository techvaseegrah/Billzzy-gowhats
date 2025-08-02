// components/layouts/DashboardLayout.tsx
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '../dashboard/Header';

// Dynamically import Sidebar to prevent SSR hydration issues
const Sidebar = dynamic(() => import('../dashboard/Sidebar'), {
  ssr: false,
  loading: () => (
    <div className="hidden md:flex md:w-64 md:flex-col bg-gray-900">
      {/* Loading placeholder for sidebar */}
      <div className="animate-pulse h-full bg-gray-800"></div>
    </div>
  )
});

interface DashboardLayoutProps {
  user?: {
    id?: string;
    name?: string;
    shopName?: string;
    image?: string;
    // other fields as needed
  };
  children: React.ReactNode;
}

export default function DashboardLayout({ user, children }: DashboardLayoutProps) {
  // Track sidebar open/close (especially for mobile)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Left Sidebar (pinned or toggled for mobile) */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Right side (Header + main content) */}
      <div className="relative flex-1 overflow-auto focus:outline-none">
        {/* The header sits at the top of the right content area */}
        <Header openSidebar={() => setIsSidebarOpen(true)} user={user} />

        <main className="md:ml-[15rem] relative z-0 md:overflow-y-auto pb-6 px-2 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}