'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Compass,
  Navigation,
  History,
  IndianRupee,
  Award,
  Bell,
  Truck,
  UserCheck,
  ShieldCheck,
  LifeBuoy,
  LogOut,
  ArrowLeft,
} from 'lucide-react';

export function DriverSidebar() {
  const pathname = usePathname();

  const primaryNav = [
    { label: 'Driver Dashboard', href: '/driver/dashboard', icon: LayoutDashboard },
    { label: 'Available Jobs', href: '/driver/jobs', icon: Compass },
    { label: 'Active Delivery', href: '/driver/active', icon: Navigation, isHighlight: true },
    { label: 'Delivery History', href: '/driver/history', icon: History },
  ];

  const financialNav = [
    { label: 'Earnings & Payouts', href: '/driver/earnings', icon: IndianRupee },
    { label: 'Rescue Milestones', href: '/driver/achievements', icon: Award },
    { label: 'Vehicle Fleet', href: '/driver/vehicles', icon: Truck },
  ];

  const supportNav = [
    { label: 'Notifications', href: '/driver/notifications', icon: Bell },
    { label: 'Driver Profile', href: '/driver/profile', icon: UserCheck },
    { label: 'Compliance & Docs', href: '/driver/verification', icon: ShieldCheck },
    { label: 'Support & Incident', href: '/driver/support', icon: LifeBuoy },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] p-4 space-y-6">
      {/* Group 1: Operations */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 block mb-2">
          Rescue Missions
        </span>
        <nav className="space-y-1">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/driver/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  item.isHighlight && isActive
                    ? 'bg-orange-600 text-white font-semibold shadow-xs'
                    : isActive
                    ? 'bg-orange-50 text-orange-800 font-semibold border border-orange-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${item.isHighlight && isActive ? 'text-white' : isActive ? 'text-orange-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Group 2: Fleet & Finance */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 block mb-2">
          Fleet & Earnings
        </span>
        <nav className="space-y-1">
          {financialNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-orange-50 text-orange-800 font-semibold border border-orange-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-orange-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Group 3: Compliance & Desk */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 block mb-2">
          Compliance & Support
        </span>
        <nav className="space-y-1">
          {supportNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-orange-50 text-orange-800 font-semibold border border-orange-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-orange-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Switch Role & Sign Out */}
      <div className="pt-3 border-t border-slate-100 space-y-1">
        <Link
          href="/login"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Switch Account Role</span>
        </Link>
        <Link
          href="/logout"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-500" />
          <span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}
