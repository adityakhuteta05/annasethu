'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Truck,
  CheckCircle2,
  Bell,
  Power,
  LogOut,
  User,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { createClient } from '../../lib/supabase/client';

export function DriverHeader() {
  const router = useRouter();
  const supabase = createClient();
  const [isAvailable, setIsAvailable] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleAvailability = async () => {
    setIsUpdatingStatus(true);
    const newStatus = !isAvailable;
    try {
      await fetch('http://localhost:8000/api/v1/driver/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duty_status: newStatus ? 'AVAILABLE' : 'OFF_DUTY' })
      });
      setIsAvailable(newStatus);
    } catch {
      setIsAvailable(newStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#14171a]/95 backdrop-blur-md border-b border-[#e5dec9] dark:border-[#2d3239] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand & Partner Identity */}
        <div className="flex items-center gap-3">
          <Link href="/driver/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-black text-lg tracking-tight text-[#1f4d36] dark:text-[#f7f1e3]">
                Anna<span className="text-orange-600">Setu</span>
              </span>
              <span className="text-[10px] font-bold text-orange-700 dark:text-orange-400 tracking-wider uppercase">
                Delivery Partner
              </span>
            </div>
          </Link>

          {/* Driver Name & Verification Badge */}
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-stone-200 dark:border-stone-800">
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
              Rahul Sharma
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Verified
            </span>
          </div>
        </div>

        {/* Right side controls: Duty Status Toggle, Notifications, Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Duty Toggle Button (Mobile First) */}
          <button
            onClick={toggleAvailability}
            disabled={isUpdatingStatus}
            title={isAvailable ? 'Click to go Off Duty' : 'Click to go Available'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-xs ${
              isAvailable
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                : 'bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-600 dark:text-stone-400'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isAvailable ? 'AVAILABLE' : 'OFF DUTY'}</span>
          </button>

          {/* Notifications */}
          <Link
            href="/driver/notifications"
            className="p-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-600 ring-2 ring-white dark:ring-stone-900" />
          </Link>

          {/* Driver Profile Link */}
          <Link
            href="/driver/profile"
            className="hidden sm:inline-flex p-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            title="Driver Profile"
          >
            <User className="w-5 h-5" />
          </Link>

          {/* Sign Out */}
          <Link
            href="/logout"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-300/60 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold transition shadow-xs"
            title="Sign out of Driver Dashboard"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </Link>

        </div>
      </div>
    </header>
  );
}
