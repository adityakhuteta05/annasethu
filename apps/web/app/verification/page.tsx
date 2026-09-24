'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, FileUp, CheckCircle2, LogOut, ArrowRight } from 'lucide-react';
import { createClient } from '../../lib/supabase/client';

export default function VerificationPlaceholderPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <main className="min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#1f4d36] text-[#f7f1e3] flex items-center justify-center font-heading text-sm font-bold">
            अ
          </div>
          <span className="font-heading font-bold text-base text-[#1f4d36] dark:text-[#f7f1e3]">
            ANNASETU
          </span>
        </div>

        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5c6068] hover:text-red-600 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Verification Status Card */}
      <div className="max-w-xl w-full mx-auto my-auto py-8">
        <div className="bg-white dark:bg-[#1c2024] rounded-3xl border-2 border-[#e5dec9] dark:border-[#2d3239] shadow-xl p-8 text-center space-y-6">
          
          <div className="w-16 h-16 rounded-full bg-[#1f4d36]/10 dark:bg-[#4f9d3a]/15 text-[#1f4d36] dark:text-[#4f9d3a] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <span>Status: REGISTERED</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
              Account Created Successfully
            </h1>
            <p className="text-xs sm:text-sm text-[#5c6068] dark:text-[#a0a5ad] max-w-md mx-auto leading-relaxed">
              Your profile has been created with role-based governance in the AnnaSetu trust database.
            </p>
          </div>

          {/* Placeholder Notice */}
          <div className="p-4 rounded-2xl bg-[#f7f1e3] dark:bg-[#14171a] border border-[#e5dec9] dark:border-[#2d3239] text-left space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
              <FileUp className="w-4 h-4 text-[#4f9d3a]" />
              <span>Next Step: Compliance Document Verification</span>
            </div>
            <p className="text-[#5c6068] dark:text-[#a0a5ad] leading-relaxed">
              Document upload and government registry cross-checks (FSSAI/GSTIN/DARPAN/Parivahan) will be enabled in the upcoming onboarding phase. Unverified accounts can explore marketplace data while transaction capabilities are pending review.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => router.push('/donor/dashboard')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#1f4d36] text-white text-xs font-heading font-bold shadow-md hover:bg-[#163827] transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleSignOut}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] text-xs font-semibold text-[#5c6068] hover:bg-gray-50 transition-all"
            >
              Sign Out
            </button>
          </div>

        </div>
      </div>

      <footer className="max-w-2xl w-full mx-auto py-3 text-center text-xs text-[#5c6068]">
        AnnaSetu Trust & Verification Layer
      </footer>
    </main>
  );
}
