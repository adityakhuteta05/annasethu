'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  HeartHandshake, 
  Truck, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function RegisterLandingPage() {
  return (
    <main className="min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[#fdfbf7] dark:bg-[#121417]">
      {/* Header */}
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

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#5c6068] dark:text-[#a0a5ad] hidden sm:inline">
            Already registered?
          </span>
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-xl border border-[#1f4d36] text-[#1f4d36] dark:border-[#4f9d3a] dark:text-[#4f9d3a] text-xs font-bold hover:bg-[#1f4d36]/10 transition-colors"
          >
            Sign In &rarr;
          </Link>
        </div>
      </header>

      {/* Main Role Selection Area */}
      <div className="max-w-4xl w-full mx-auto my-auto py-8 space-y-8 animate-in fade-in duration-300">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1f4d36]/10 text-[#1f4d36] dark:bg-[#4f9d3a]/15 dark:text-[#4f9d3a] text-xs font-bold tracking-wide">
            <ShieldCheck className="w-4 h-4 text-[#1f4d36] dark:text-[#4f9d3a]" />
            <span>Role-Specific Institutional Onboarding</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3] tracking-tight">
            Join the AnnaSetu Network
          </h1>
          <p className="text-sm sm:text-base font-sans font-medium text-[#5c6068] dark:text-[#a0a5ad] max-w-xl mx-auto">
            Choose your organization role to launch your guided verification onboarding.
          </p>
        </div>

        {/* 3 Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* DONOR */}
          <div className="bg-white dark:bg-[#1c2024] rounded-3xl border-2 border-[#e5dec9] dark:border-[#2d3239] hover:border-[#1f4d36] dark:hover:border-[#4f9d3a] shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1f4d36]/10 dark:bg-[#1f4d36]/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🍽️
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                  Food Donor
                </h2>
                <p className="text-xs font-semibold text-[#5c6068] dark:text-[#a0a5ad] mt-1">
                  Commercial food businesses with edible surplus.
                </p>
              </div>
              <ul className="text-xs text-[#5c6068] dark:text-[#a0a5ad] space-y-2 pt-2 border-t border-[#e5dec9]/60">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1f4d36]" />
                  <span>FSSAI compliance verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1f4d36]" />
                  <span>80G tax exemption certificates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1f4d36]" />
                  <span>Auditable CSR impact reports</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="/register/donor"
                className="w-full py-3 rounded-2xl bg-[#1f4d36] hover:bg-[#163827] text-[#f7f1e3] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>REGISTER AS DONOR</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* NGO / RECEIVER */}
          <div className="bg-white dark:bg-[#1c2024] rounded-3xl border-2 border-[#e5dec9] dark:border-[#2d3239] hover:border-[#4f9d3a] dark:hover:border-[#4f9d3a] shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#4f9d3a]/15 dark:bg-[#4f9d3a]/25 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🏠
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                  NGO / Receiver
                </h2>
                <p className="text-xs font-semibold text-[#5c6068] dark:text-[#a0a5ad] mt-1">
                  Shelters, community kitchens & relief trusts.
                </p>
              </div>
              <ul className="text-xs text-[#5c6068] dark:text-[#a0a5ad] space-y-2 pt-2 border-t border-[#e5dec9]/60">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4f9d3a]" />
                  <span>NGO-DARPAN / 80G verified</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4f9d3a]" />
                  <span>Priority dietary matching</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4f9d3a]" />
                  <span>Live sealed delivery tracking</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="/register/ngo"
                className="w-full py-3 rounded-2xl bg-[#2d6a4f] hover:bg-[#1b4332] text-[#f7f1e3] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>REGISTER AS NGO</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* DELIVERY PARTNER */}
          <div className="bg-white dark:bg-[#1c2024] rounded-3xl border-2 border-[#e5dec9] dark:border-[#2d3239] hover:border-[#e0662b] dark:hover:border-[#e0662b] shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#e0662b]/15 dark:bg-[#e0662b]/25 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🚚
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                  Delivery Partner
                </h2>
                <p className="text-xs font-semibold text-[#5c6068] dark:text-[#a0a5ad] mt-1">
                  Two-wheeler, tempo van & logistics drivers.
                </p>
              </div>
              <ul className="text-xs text-[#5c6068] dark:text-[#a0a5ad] space-y-2 pt-2 border-t border-[#e5dec9]/60">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#e0662b]" />
                  <span>Guaranteed transparent payouts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#e0662b]" />
                  <span>Instant wallet credit upon OTP</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#e0662b]" />
                  <span>Rescue milestones & achievements</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="/register/driver"
                className="w-full py-3 rounded-2xl bg-[#e0662b] hover:bg-[#c2511d] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>REGISTER AS DRIVER</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto py-4 text-center text-xs text-[#5c6068] dark:text-[#a0a5ad] border-t border-[#e5dec9] dark:border-[#2d3239]">
        <span>AnnaSetu &copy; 2026 · Purpose-Driven Food Logistics</span>
      </footer>
    </main>
  );
}
