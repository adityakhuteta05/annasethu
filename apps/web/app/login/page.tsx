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
  Sparkles,
  UtensilsCrossed,
  Users
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
    <main className="min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-white via-slate-50 to-white">
      {/* Top Header */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-bold shadow-xs group-hover:scale-105 transition-transform">
            अ
          </div>
          <div>
            <span className="font-bold text-2xl tracking-tight text-slate-900 block">
              AnnaSetu
            </span>
            <span className="text-xs text-slate-500 font-medium block -mt-0.5">
              Surplus Food · Shared With Purpose · Real Impact
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-5">
          <Link
            href="/about"
            className="text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors hidden sm:inline"
          >
            How It Works
          </Link>
          <Link
            href="/contact"
            className="text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors hidden sm:inline"
          >
            Support
          </Link>
        </div>
      </header>

      {/* Main Role Selection Area */}
      <div className="max-w-5xl w-full mx-auto my-auto py-8 space-y-8 animate-in fade-in duration-300">
        {/* Headline Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Community Surplus Food Rescue Network</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Select Your Role to Get Started
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto font-normal">
            Every day, good food goes to waste while families go hungry. Choose your role below to participate in our verified rescue network.
          </p>
        </div>

        {/* Three Primary Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CARD 1: FOOD DONOR */}
          <Link
            href="/login/donor"
            className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group block hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                  Hospitality & Kitchens
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  Food Donor
                </h2>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed min-h-[40px]">
                  Hotels, restaurants, caterers, banquets and cloud kitchens donating verified surplus meals.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                  FSSAI & GST Compliant
                </span>
                <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  80G Certified
                </span>
              </div>
            </div>

            <div className="pt-6">
              <div className="w-full py-3 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors">
                <span>Continue as Donor</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* CARD 2: NGO / RECEIVER */}
          <Link
            href="/login/receiver"
            className="bg-white rounded-2xl border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group block hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
                  Relief & Communities
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  NGO / Receiver
                </h2>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed min-h-[40px]">
                  Shelters, community kitchens, orphanages and relief trusts distributing food to those in need.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="text-[11px] font-medium text-blue-800 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                  DARPAN / 80G Verified
                </span>
                <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  Priority Allocation
                </span>
              </div>
            </div>

            <div className="pt-6">
              <div className="w-full py-3 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors">
                <span>Continue as NGO</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* CARD 3: DELIVERY PARTNER */}
          <Link
            href="/login/driver"
            className="bg-white rounded-2xl border border-slate-200 hover:border-orange-500 shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group block hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="w-13 h-13 rounded-2xl bg-orange-50 text-orange-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-orange-700 uppercase tracking-wider block">
                  Logistics & Transport
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  Delivery Partner
                </h2>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed min-h-[40px]">
                  Verified drivers, bike riders and transport partners executing timely food rescue pickups.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="text-[11px] font-medium text-orange-800 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-lg">
                  Verified Vehicle & DL
                </span>
                <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  Direct Payouts
                </span>
              </div>
            </div>

            <div className="pt-6">
              <div className="w-full py-3 rounded-xl bg-orange-600 group-hover:bg-orange-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors">
                <span>Continue as Driver</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

        </div>

        {/* Quick Demo Access Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span><strong>Quick Demo Access:</strong> Explore each role with 1-click test accounts:</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleDirectDemoLogin('donor')}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
            >
              Demo Donor
            </button>
            <button
              type="button"
              onClick={() => handleDirectDemoLogin('receiver')}
              className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800 hover:bg-blue-100 transition-colors"
            >
              Demo NGO
            </button>
            <button
              type="button"
              onClick={() => handleDirectDemoLogin('driver')}
              className="px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-xs font-semibold text-orange-800 hover:bg-orange-100 transition-colors"
            >
              Demo Driver
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto py-4 text-center text-xs text-slate-400 border-t border-slate-200">
        <span>AnnaSetu · Surplus Food Rescue Network · Verified Need-Driven Allocation</span>
      </footer>
    </main>
  );
}
