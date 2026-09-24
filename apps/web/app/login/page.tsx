'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  HeartHandshake, 
  Truck, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { createClient } from '../../lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleDirectDemoLogin = async (role: 'donor' | 'receiver' | 'driver') => {
    const demoConfigs = {
      donor: { email: 'demo@restaurant.com', route: '/donor/dashboard' },
      receiver: { email: 'demo@ngo.com', route: '/receiver/dashboard' },
      driver: { email: 'demo@driver.com', route: '/driver/jobs' },
    };

    const target = demoConfigs[role];
    try {
      await supabase.auth.signInWithPassword({
        email: target.email,
        password: 'Rescue@AnnaSetu2026!',
      });
    } catch {}

    router.push(target.route);
  };

  return (
    <main className="min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[#fdfbf7] dark:bg-[#121417]">
      {/* Top Header */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-[#1f4d36] text-[#f7f1e3] flex items-center justify-center font-heading text-2xl font-bold shadow-md group-hover:scale-105 transition-transform">
            अ
          </div>
          <div>
            <span className="font-heading font-bold text-2xl tracking-tight text-[#1f4d36] dark:text-[#f7f1e3]">
              ANNASETU
            </span>
            <span className="text-[11px] font-sans font-semibold text-[#5c6068] dark:text-[#a0a5ad] block -mt-1 tracking-wide">
              Surplus Food · Shared With Purpose · Real Impact
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/about"
            className="text-xs font-semibold text-[#5c6068] dark:text-[#a0a5ad] hover:text-[#1f4d36] dark:hover:text-[#4f9d3a] transition-colors hidden sm:inline"
          >
            How It Works
          </Link>
          <Link
            href="/contact"
            className="text-xs font-semibold text-[#5c6068] dark:text-[#a0a5ad] hover:text-[#1f4d36] dark:hover:text-[#4f9d3a] transition-colors hidden sm:inline"
          >
            Support
          </Link>
        </div>
      </header>

      {/* Main Role Selection Area */}
      <div className="max-w-5xl w-full mx-auto my-auto py-8 space-y-8 animate-in fade-in duration-300">
        {/* Headline Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1f4d36]/10 text-[#1f4d36] dark:bg-[#4f9d3a]/15 dark:text-[#4f9d3a] text-xs font-bold tracking-wide">
            <ShieldCheck className="w-4 h-4 text-[#1f4d36] dark:text-[#4f9d3a]" />
            <span>Unified Needs-Driven Rescue Network</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3] tracking-tight">
            Select Your Participation Role
          </h1>
          <p className="text-sm sm:text-base font-sans font-medium text-[#5c6068] dark:text-[#a0a5ad] max-w-xl mx-auto">
            Connect surplus food with verified need through secure, role-governed rescue logistics.
          </p>
        </div>

        {/* Prompt Banner */}
        <div className="text-center">
          <span className="text-xs font-bold tracking-widest uppercase text-[#5c6068] dark:text-[#a0a5ad] px-4 py-1.5 rounded-full bg-[#f7f1e3] dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239]">
            HOW ARE YOU PARTICIPATING IN THE NETWORK?
          </span>
        </div>

        {/* Three Primary Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CARD 1: FOOD DONOR */}
          <Link
            href="/login/donor"
            className="bg-white dark:bg-[#1c2024] rounded-3xl border-2 border-[#e5dec9] dark:border-[#2d3239] hover:border-[#1f4d36] dark:hover:border-[#4f9d3a] shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group block"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1f4d36]/10 dark:bg-[#1f4d36]/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🍽️
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#1f4d36] dark:text-[#4f9d3a] uppercase tracking-wider block">
                  Commercial & Hospitality
                </span>
                <h2 className="text-2xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3] mt-0.5">
                  Food Donor
                </h2>
                <p className="text-xs font-medium text-[#5c6068] dark:text-[#a0a5ad] mt-1.5 min-h-[36px]">
                  Hotels, restaurants, caterers, banquets & cloud kitchens donating surplus meals.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="text-[11px] font-semibold text-[#1f4d36] dark:text-[#4f9d3a] bg-[#1f4d36]/10 dark:bg-[#4f9d3a]/15 px-2.5 py-1 rounded-lg">
                  FSSAI & GST Compliant
                </span>
                <span className="text-[11px] font-medium text-[#5c6068] dark:text-[#a0a5ad] bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-lg">
                  80G Tax Deductible
                </span>
              </div>
            </div>

            <div className="pt-6">
              <div className="w-full py-3.5 rounded-2xl bg-[#1f4d36] hover:bg-[#163827] text-[#f7f1e3] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all group-hover:translate-x-0.5">
                <span>CONTINUE AS DONOR</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* CARD 2: NGO / RECEIVER */}
          <Link
            href="/login/receiver"
            className="bg-white dark:bg-[#1c2024] rounded-3xl border-2 border-[#e5dec9] dark:border-[#2d3239] hover:border-[#4f9d3a] dark:hover:border-[#4f9d3a] shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group block"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#4f9d3a]/15 dark:bg-[#4f9d3a]/25 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🏠
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#2d6a4f] dark:text-[#4f9d3a] uppercase tracking-wider block">
                  Relief & Communities
                </span>
                <h2 className="text-2xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3] mt-0.5">
                  NGO / Receiver
                </h2>
                <p className="text-xs font-medium text-[#5c6068] dark:text-[#a0a5ad] mt-1.5 min-h-[36px]">
                  Shelters, community kitchens, orphanages & relief trusts feeding communities.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="text-[11px] font-semibold text-[#2d6a4f] dark:text-[#4f9d3a] bg-[#4f9d3a]/15 dark:bg-[#4f9d3a]/25 px-2.5 py-1 rounded-lg">
                  NPO DARPAN / 80G
                </span>
                <span className="text-[11px] font-medium text-[#5c6068] dark:text-[#a0a5ad] bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-lg">
                  Priority Allocation
                </span>
              </div>
            </div>

            <div className="pt-6">
              <div className="w-full py-3.5 rounded-2xl bg-[#2d6a4f] hover:bg-[#1b4332] text-[#f7f1e3] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all group-hover:translate-x-0.5">
                <span>CONTINUE AS NGO</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* CARD 3: DELIVERY PARTNER */}
          <Link
            href="/login/driver"
            className="bg-white dark:bg-[#1c2024] rounded-3xl border-2 border-[#e5dec9] dark:border-[#2d3239] hover:border-[#e0662b] dark:hover:border-[#e0662b] shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group block"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#e0662b]/15 dark:bg-[#e0662b]/25 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🚚
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#b04513] dark:text-[#e0662b] uppercase tracking-wider block">
                  Logistics & Transport
                </span>
                <h2 className="text-2xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3] mt-0.5">
                  Delivery Partner
                </h2>
                <p className="text-xs font-medium text-[#5c6068] dark:text-[#a0a5ad] mt-1.5 min-h-[36px]">
                  Verified two-wheelers, tempo vans & logistics partners delivering food rescues.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="text-[11px] font-semibold text-[#b04513] dark:text-[#e0662b] bg-[#e0662b]/15 dark:bg-[#e0662b]/25 px-2.5 py-1 rounded-lg">
                  Verified Vehicle & DL
                </span>
                <span className="text-[11px] font-medium text-[#5c6068] dark:text-[#a0a5ad] bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-lg">
                  Guaranteed Fares
                </span>
              </div>
            </div>

            <div className="pt-6">
              <div className="w-full py-3.5 rounded-2xl bg-[#e0662b] hover:bg-[#c2511d] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all group-hover:translate-x-0.5">
                <span>CONTINUE AS DRIVER</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

        </div>

        {/* Instant Demo Access Controls for Evaluators & Reviewers */}
        <div className="p-4 rounded-2xl bg-[#f7f1e3]/70 dark:bg-[#14171a] border border-[#e5dec9] dark:border-[#2d3239] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#5c6068] dark:text-[#a0a5ad]">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span><strong>Instant Reviewer Testing:</strong> 1-Click login with pre-seeded verified accounts:</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleDirectDemoLogin('donor')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] text-[11px] font-bold text-[#1f4d36] hover:bg-[#1f4d36]/10 transition-colors"
            >
              🍽️ Demo Donor
            </button>
            <button
              type="button"
              onClick={() => handleDirectDemoLogin('receiver')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] text-[11px] font-bold text-[#2d6a4f] hover:bg-[#4f9d3a]/10 transition-colors"
            >
              🏠 Demo NGO
            </button>
            <button
              type="button"
              onClick={() => handleDirectDemoLogin('driver')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] text-[11px] font-bold text-[#e0662b] hover:bg-[#e0662b]/10 transition-colors"
            >
              🚚 Demo Driver
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto py-4 text-center text-xs text-[#5c6068] dark:text-[#a0a5ad] border-t border-[#e5dec9] dark:border-[#2d3239]">
        <span>Surplus Food · Shared With Purpose · Real Impact · Server-Side Authoritative Verification</span>
      </footer>
    </main>
  );
}
