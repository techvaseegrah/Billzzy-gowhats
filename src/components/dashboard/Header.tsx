'use client';

import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  XMarkIcon, // Import the close (X) icon
} from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import useSWR from 'swr';

interface HeaderProps {
  isSidebarOpen: boolean;        // NEW: sidebar state
  openSidebar: () => void;       // NEW: function to open
  closeSidebar: () => void;      // NEW: function to close
  user?: {
    id?: string;
    shopName?: string;
    name?: string;
    image?: string;
  };
}

// Optional helper to map pathnames -> friendly titles
function getPageTitle(pathname: string): string {
  switch (pathname) {
    case '/dashboard':
      return 'Dashboard';
    case '/billing/online':
      return 'Online Bills';
    case '/billing/offline':
      return 'Offline Bills';
    case '/transactions/online':
      return 'Online Transactions';
    case '/transactions/offline':
      return 'Offline Transactions';
    case '/products/add':
      return 'Add Product';
    case '/products/categories':
      return 'Add Category';
    case '/products/view':
      return 'View Products';
    case '/printing':
      return 'Printing';
    case '/packing':
      return 'Packing';
    case '/tracking':
      return 'Tracking';
    case '/customers':
      return 'Customers';
    case '/settings':
      return 'Settings';
    default:
      return 'Billzzy';
  }
}

interface CustomerSubmission {
  id: number;
  notes: string;
  createdAt: string;
  customer: {
    id: number;
    name: string;
    phone: string;
    email: string;
  };
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  });

export default function Header({ 
  isSidebarOpen, 
  openSidebar, 
  closeSidebar, 
  user 
}: HeaderProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const router = useRouter();

  // Optional: fetch pending bills count
  const { data: submissionsData } = useSWR<{ submissions: CustomerSubmission[] }>(
    '/api/billing/customer_submission?status=pending',
    fetcher,
    { refreshInterval: 30000 }
  );
  const pendingCount = submissionsData?.submissions?.length || 0;

  return (
    <header className="sticky top-0 md:mb-0 mb-4 z-10  flex h-16 bg-white shadow items-center md:hidden">
      {/** 
       * If the sidebar is CLOSED, show the hamburger. 
       * If the sidebar is OPEN, show the close (X) icon. 
       */}
      {!isSidebarOpen ? (
        <button
          type="button"
          className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none 
                     focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          onClick={openSidebar}
          aria-label="Open sidebar"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      ) : (
        <button
          type="button"
          className="px-4 border-r absolute right-0 border-gray-200 z-50 text-gray-500 focus:outline-none 
                     focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      )}

      {/* Page Title */}
      <div className="flex-1 px-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">
          {pageTitle}
        </h1>

        {/* Right side icons */}
        <div className="ml-4 flex items-center space-x-4">
          {/* Notifications (pending bills) */}
          <button
            className="relative text-gray-600 focus:outline-none"
            onClick={() => {
              router.push('/billing/pendingBills');
              // Optionally close sidebar if desired:
              closeSidebar();
            }}
          >
            <BellIcon className="h-6 w-6" />
            {pendingCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center 
                               justify-center px-1 py-0.5 text-xs font-bold 
                               leading-none text-white transform 
                               translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full"
              >
                {pendingCount}
              </span>
            )}
          </button>

          {/* User Menu */}
          <Menu as="div" className="relative">
            <div>
              <Menu.Button className="bg-white flex items-center text-sm rounded-full 
                                      focus:outline-none focus:ring-2 focus:ring-offset-2 
                                      focus:ring-indigo-500">
                <span className="sr-only">Open user menu</span>
                {user?.image ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.image}
                    alt={user.name || 'User Avatar'}
                  />
                ) : (
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                )}
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items
                className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg 
                           py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => router.push('/settings')}
                      className={`${active ? 'bg-gray-100' : ''} 
                                 block w-full text-left px-4 py-2 text-sm text-gray-700`}
                    >
                      Profile
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => signOut()}
                      className={`${active ? 'bg-gray-100' : ''} 
                                 block w-full text-left px-4 py-2 text-sm text-gray-700`}
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
}
