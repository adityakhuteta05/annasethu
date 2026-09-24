'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  PackageCheck,
  Truck,
  Leaf,
  FileText,
  Award,
  CreditCard,
  Bell,
  Building,
  HelpCircle,
} from 'lucide-react';

export function DonorSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/donor/dashboard', icon: LayoutDashboard },
    { label: 'Post Surplus Food', href: '/donor/donations/new', icon: PlusCircle, isPrimary: true },
    { label: 'My Donations', href: '/donor/donations', icon: PackageCheck },
    { label: 'Active Rescues', href: '/donor/rescues', icon: Truck },
    { label: 'Verified Impact', href: '/donor/impact', icon: Leaf },
    { label: 'CSR Reports', href: '/donor/reports', icon: FileText },
    { label: 'Milestone Certificates', href: '/donor/certificates', icon: Award },
    { label: 'Subscription', href: '/donor/subscription', icon: CreditCard },
    { label: 'Notifications', href: '/donor/notifications', icon: Bell },
    { label: 'Profile & Locations', href: '/donor/profile', icon: Building },
    { label: 'Support & Incidents', href: '/donor/support', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block border-r border-[#e5dec9] dark:border-[#2d3239] bg-[#f7f1e3]/40 dark:bg-[#14171a]/40 min-h-[calc(100vh-4rem)] p-4 space-y-6">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c6068] px-3 block mb-2">
          Rescue Management
        </span>
        <nav className="space-y-1">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/donor/dashboard' && pathname.startsWith(item.href));
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  item.isPrimary
                    ? 'bg-[#1f4d36] text-[#f7f1e3] shadow-xs hover:bg-[#163827]'
                    : isActive
                    ? 'bg-white dark:bg-[#1c2024] text-[#1f4d36] dark:text-[#4f9d3a] shadow-xs border border-[#e5dec9] dark:border-[#2d3239]'
                    : 'text-[#5c6068] dark:text-[#a0a5ad] hover:text-[#1f4d36] dark:hover:text-[#f7f1e3] hover:bg-white/60 dark:hover:bg-[#1c2024]/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${item.isPrimary ? 'text-emerald-300' : ''}`} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c6068] px-3 block mb-2">
          Compliance & Impact
        </span>
        <nav className="space-y-1">
          {navItems.slice(4, 7).map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-[#1c2024] text-[#1f4d36] dark:text-[#4f9d3a] shadow-xs border border-[#e5dec9] dark:border-[#2d3239]'
                    : 'text-[#5c6068] dark:text-[#a0a5ad] hover:text-[#1f4d36] dark:hover:text-[#f7f1e3] hover:bg-white/60 dark:hover:bg-[#1c2024]/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c6068] px-3 block mb-2">
          Administration
        </span>
        <nav className="space-y-1">
          {navItems.slice(7).map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-[#1c2024] text-[#1f4d36] dark:text-[#4f9d3a] shadow-xs border border-[#e5dec9] dark:border-[#2d3239]'
                    : 'text-[#5c6068] dark:text-[#a0a5ad] hover:text-[#1f4d36] dark:hover:text-[#f7f1e3] hover:bg-white/60 dark:hover:bg-[#1c2024]/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* Safety & Protocol Banner */}
      <div className="p-3 rounded-2xl bg-[#1f4d36]/10 dark:bg-[#1f4d36]/20 border border-[#1f4d36]/20 text-[11px] text-[#1f4d36] dark:text-[#4f9d3a] space-y-1">
        <span className="font-bold block">Zero-Landfill Protocol</span>
        <p className="text-[10px] opacity-80 leading-relaxed">
          Surplus declared here is reserved atomically. Food thermal buffers are monitored by the matching engine.
        </p>
      </div>
    </aside>
  );
}
