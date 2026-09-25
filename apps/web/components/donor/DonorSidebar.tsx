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
  LogOut,
  ArrowLeft,
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
    { label: 'Support & Help', href: '/donor/support', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] p-4 space-y-6">
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 block mb-2">
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
              </a>
            );
          })}
        </nav>
      </div>

      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 block mb-2">
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 block mb-2">
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* Switch Portal & Sign Out Quick Links */}
      <div className="pt-4 border-t border-slate-100 space-y-1">
        <a
          href="/login"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Switch Account Role</span>
        </a>
        <a
          href="/logout"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 font-semibold transition"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-500" />
          <span>Sign Out</span>
        </a>
      </div>
    </aside>
  );
}
