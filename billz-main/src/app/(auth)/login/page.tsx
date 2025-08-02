import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';
import React from 'react';  // Add this import

import { FiArrowLeft } from 'react-icons/fi';

export default function LoginPage() {
  return (
    <div className="h-full place-content-center w-full bg-[#235CDF]">
      <div className="absolute top-4 left-4">
        <Link
          href="/"
          className="flex items-center text-white hover:text-gray-200 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to manage your business</p>
            </div>

            <LoginForm />

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Dont have an account?{' '}
                <Link
                  href="/register"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-4 text-center text-white">
        <p>© 2024 Billzzy. All rights reserved.</p>
      </footer>
    </div>
  );
}