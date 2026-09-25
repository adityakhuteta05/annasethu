'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, LogOut, ShieldCheck } from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <main className="min-h-screen p-6 sm:p-10 max-w-5xl mx-auto space-y-6">
      <header className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#23262b] text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Admin Rescue Command Center
            </h1>
            <span className="text-xs text-slate-500">
              Role: ADMIN · System Authority
            </span>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-gray-100"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </header>

      <div className="p-8 rounded-3xl bg-white border border-slate-200 border-slate-200 shadow-xs text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-bold">
          <ShieldAlert className="w-4 h-4 text-purple-600" />
          <span>Authenticated as ADMIN</span>
        </div>
        <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          Platform Operations & Compliance
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Welcome to the operations command workspace. Government verification queues, AI integrity reviews, and financial ledgers are provisioned here.
        </p>

        <div className="pt-4 flex items-center justify-center gap-3">
          <a
            href="/admin/service-health"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm hover:bg-emerald-700 transition-all"
          >
            <span>Monitor Service Health & Secrets</span>
          </a>
        </div>
      </div>
    </main>
  );
}
