'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  ListOrdered,
  UtensilsCrossed,
  BookmarkCheck,
  Truck,
  Wallet,
  Gauge,
  Leaf,
  FileText,
  Bell,
  Building2,
  ShieldCheck,
  LogOut,
  ArrowLeft,
} from 'lucide-react';

export function NGOSidebar() {
  const pathname = usePathname();

  const operationsNav = [
    { label: 'Operations Dashboard', href: '/receiver/dashboard', icon: LayoutDashboard },
    { label: '+ Create Food Need', href: '/ngo/needs/create', icon: PlusCircle, isPrimary: true },
    { label: "Today's Needs", href: '/ngo/needs', icon: ListOrdered },
    { label: 'Available Surplus Food', href: '/ngo/available-food', icon: UtensilsCrossed },
    { label: 'Food Reservations', href: '/ngo/reservations', icon: BookmarkCheck },
    { label: 'Deliveries & Tracking', href: '/ngo/deliveries', icon: Truck },
  ];

  const logisticsNav = [
    { label: 'Logistics Wallet', href: '/ngo/wallet', icon: Wallet },
    { label: 'Capacity Management', href: '/ngo/capacity', icon: Gauge },
    { label: 'Community Impact', href: '/ngo/impact', icon: Leaf },
    { label: 'Compliance Reports', href: '/ngo/reports', icon: FileText },
  ];

  const adminNav = [
    { label: 'Notifications', href: '/ngo/notifications', icon: Bell },
    { label: 'Organization Profile', href: '/ngo/profile', icon: Building2 },
    { label: 'Verification Desk', href: '/ngo/verification', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] p-4 space-y-6">
      {/* Group 1: Operations */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 block mb-2">
          Daily Operations
        </span>
        <nav className="space-y-1">
          {operationsNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/receiver/dashboard' && item.href !== '/ngo/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  item.isPrimary
                    ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 font-semibold'
                    : isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${item.isPrimary ? 'text-white' : isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Group 2: Logistics & Finance */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 block mb-2">
          Logistics & Impact
        </span>
        <nav className="space-y-1">
          {logisticsNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Group 3: Administration */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 block mb-2">
          Compliance & Desk
        </span>
        <nav className="space-y-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
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
