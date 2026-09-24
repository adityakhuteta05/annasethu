'use client';

import React from 'react';
import { NGOHeader } from '../../components/ngo/NGOHeader';
import { NGOSidebar } from '../../components/ngo/NGOSidebar';

export default function NGOLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fbf9f4] dark:bg-[#14171a] text-[#23262b] dark:text-[#f7f1e3]">
      <NGOHeader />
      <div className="flex">
        <NGOSidebar />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
