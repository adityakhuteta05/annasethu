'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Compass,
  Navigation,
  IndianRupee,
  UserCheck,
  ShieldAlert
} from 'lucide-react';

export function DriverBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/driver/dashboard', icon: LayoutDashboard },
    { label: 'Jobs', href: '/driver/jobs', icon: Compass },
    { label: 'Active', href: '/driver/active', icon: Navigation, isHero: true },
    { label: 'Earnings', href: '/driver/earnings', icon: IndianRupee },
    { label: 'Account', href: '/driver/profile', icon: UserCheck },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#14171a]/95 backdrop-blur-md border-t border-[#e5dec9] dark:border-[#2d3239] pb-safe px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/driver/dashboard' && pathname.startsWith(item.href));

          if (item.isHero) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-5 group"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-transform group-active:scale-95 ${
                  isActive
                    ? 'bg-orange-600 text-white ring-4 ring-orange-200 dark:ring-orange-950'
                    : 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-orange-600'
                }`}>
                  <Icon className="w-6 h-6 animate-pulse" />
                </div>
                <span className={`text-[10px] font-bold mt-1 ${isActive ? 'text-orange-600' : 'text-stone-500'}`}>
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition ${
                isActive
                  ? 'text-orange-600 dark:text-orange-400 font-bold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
