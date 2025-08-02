// app/(policies)/layout.tsx
import React from 'react';  // Add this import


export default function PolicyLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white shadow-sm rounded-lg p-6">
            {children}
          </div>
        </div>
      </div>
    );
  }