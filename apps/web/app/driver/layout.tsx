import React from 'react';
import { DriverHeader } from '../../components/driver/DriverHeader';
import { DriverSidebar } from '../../components/driver/DriverSidebar';
import { DriverBottomNav } from '../../components/driver/DriverBottomNav';

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fbf9f4] dark:bg-[#101214] text-[#23262b] dark:text-[#f7f1e3] transition-colors">
      <DriverHeader />
      <div className="flex">
        <DriverSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-12">
          {children}
        </main>
      </div>
      <DriverBottomNav />
    </div>
  );
}
