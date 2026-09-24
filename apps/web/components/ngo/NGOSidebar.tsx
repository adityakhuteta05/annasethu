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
} from 'lucide-react';

export function NGOSidebar() {
  const pathname = usePathname();

  const operationsNav = [
    { label: 'Operations Dashboard', href: '/ngo/dashboard', icon: LayoutDashboard },
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
    <aside className="w-64 shrink-0 hidden lg:block border-r border-[#e5dec9] dark:border-[#2d3239] bg-[#f7f1e3]/40 dark:bg-[#14171a]/40 min-h-[calc(100vh-4rem)] p-4 space-y-6">
      {/* Group 1: Operations */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c6068] px-3 block mb-2">
          Daily Operations
        </span>
        <nav className="space-y-1">
          {operationsNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/ngo/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  item.isPrimary
                    ? 'bg-[#2d6a4f] text-[#f7f1e3] shadow-xs hover:bg-[#1b4332]'
                    : isActive
                    ? 'bg-white dark:bg-[#1c2024] text-[#2d6a4f] shadow-xs border border-[#e5dec9] dark:border-[#2d3239]'
                    : 'text-[#5c6068] dark:text-[#a0a5ad] hover:text-[#2d6a4f] hover:bg-white/60 dark:hover:bg-[#1c2024]/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${item.isPrimary ? 'text-emerald-300' : ''}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Group 2: Logistics & Finance */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c6068] px-3 block mb-2">
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-[#1c2024] text-[#2d6a4f] shadow-xs border border-[#e5dec9] dark:border-[#2d3239]'
                    : 'text-[#5c6068] dark:text-[#a0a5ad] hover:text-[#2d6a4f] hover:bg-white/60 dark:hover:bg-[#1c2024]/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Group 3: Administration */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c6068] px-3 block mb-2">
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-[#1c2024] text-[#2d6a4f] shadow-xs border border-[#e5dec9] dark:border-[#2d3239]'
                    : 'text-[#5c6068] dark:text-[#a0a5ad] hover:text-[#2d6a4f] hover:bg-white/60 dark:hover:bg-[#1c2024]/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
