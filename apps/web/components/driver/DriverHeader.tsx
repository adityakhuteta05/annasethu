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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand & Partner Identity */}
        <div className="flex items-center gap-3">
          <Link href="/driver/dashboard" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-slate-900">
                Anna<span className="text-orange-600">Setu</span>
              </span>
              <span className="text-[11px] font-semibold text-orange-600 tracking-wide uppercase">
                Delivery Partner
              </span>
            </div>
          </Link>

          {/* Driver Name & Verification Badge */}
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
            <span className="text-xs font-semibold text-slate-800">
              Rahul Sharma
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Verified Driver
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
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition shadow-xs ${
              isAvailable
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isAvailable ? 'Available' : 'Off Duty'}</span>
          </button>

          {/* Notifications */}
          <Link
            href="/driver/notifications"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition border border-slate-200 relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-600 ring-2 ring-white" />
          </Link>

          {/* Driver Profile Link */}
          <Link
            href="/driver/profile"
            className="hidden sm:inline-flex p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 transition"
            title="Driver Profile"
          >
            <User className="w-4 h-4" />
          </Link>

          {/* Sign Out */}
          <Link
            href="/logout"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition"
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
