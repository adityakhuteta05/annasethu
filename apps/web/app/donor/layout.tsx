'use client';

import React from 'react';
import { DonorHeader } from '../../components/donor/DonorHeader';
import { DonorSidebar } from '../../components/donor/DonorSidebar';

export default function DonorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <DonorHeader />
      <div className="flex">
        <DonorSidebar />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
