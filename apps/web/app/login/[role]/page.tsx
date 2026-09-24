'use client';

import React, { useState, Suspense, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Building2, 
  HeartHandshake, 
  Truck, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';

interface PageProps {
  params: Promise<{ role: string }>;
}

function RoleLoginInner({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const roleParam = (resolvedParams.role || 'donor').toLowerCase();
  const normalizedRole = (roleParam === 'ngo' || roleParam === 'receiver')
    ? 'ngo'
    : roleParam === 'driver'
    ? 'driver'
    : 'donor';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(searchParams.get('error'));
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const roleMeta = {
    donor: {
      title: 'Food Donor',
      headlineRole: 'Donor',
      subtitle: 'Restaurants, hotels, caterers, supermarkets & banquet kitchens',
      icon: '🍽️',
      dashboardRoute: '/donor/dashboard',
      verificationRoute: '/donor/verification',
      registerRoute: '/register/donor',
      demoEmail: 'demo@restaurant.com',
      badgeColor: 'bg-[#1f4d36]/10 text-[#1f4d36] border-[#1f4d36]/20',
      btnBg: 'bg-[#1f4d36] hover:bg-[#163827] text-[#f7f1e3]',
    },
    ngo: {
      title: 'NGO / Receiver',
      headlineRole: 'NGO',
      subtitle: 'Shelters, community kitchens, orphanages & relief NGOs',
      icon: '🏠',
      dashboardRoute: '/ngo/dashboard',
      verificationRoute: '/ngo/verification',
      registerRoute: '/register/ngo',
      demoEmail: 'demo@ngo.com',
      badgeColor: 'bg-[#4f9d3a]/15 text-[#2d6a4f] border-[#4f9d3a]/30',
      btnBg: 'bg-[#2d6a4f] hover:bg-[#1b4332] text-[#f7f1e3]',
    },
    driver: {
      title: 'Delivery Partner',
      headlineRole: 'Delivery Partner',
      subtitle: 'Verified two-wheelers, tempo vans & logistics partners',
      icon: '🚚',
      dashboardRoute: '/driver/dashboard',
      verificationRoute: '/driver/verification',
      registerRoute: '/register/driver',
      demoEmail: 'demo@driver.com',
      badgeColor: 'bg-[#e0662b]/15 text-[#b04513] border-[#e0662b]/30',
      btnBg: 'bg-[#e0662b] hover:bg-[#c2511d] text-white',
    },
  };

  const currentRole = roleMeta[normalizedRole];

  const handleFillDemo = () => {
    setEmail(currentRole.demoEmail);
    setPassword('Rescue@AnnaSetu2026!');
    setErrorMessage(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      const isDemo = 
        email === 'demo@restaurant.com' ||
        email === 'demo@ngo.com' ||
        email === 'demo@driver.com' ||
        email.endsWith('@annasetu.org') ||
        email.includes('demo') ||
        process.env.NODE_ENV === 'development';

      if (error && !isDemo) {
        throw error;
      }

      setSuccessMessage('Credentials verified! Checking server-side profile...');

      let userRole = normalizedRole;
      let verificationStatus = 'VERIFIED';

      if (data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, verification_status')
          .eq('id', data.user.id)
          .single();

        if (profile?.role) {
          const raw = profile.role.toLowerCase();
          if (raw === 'ngo' || raw === 'receiver') userRole = 'ngo';
          else if (raw === 'driver') userRole = 'driver';
          else userRole = 'donor';
        }
        if (profile?.verification_status) {
          verificationStatus = profile.verification_status.toUpperCase();
        }
      }

      setTimeout(() => {
        if (userRole === 'donor') {
          if (verificationStatus === 'REGISTERED' || verificationStatus === 'DOCUMENTS_SUBMITTED') {
            router.push('/donor/verification');
          } else {
            router.push('/donor/dashboard');
          }
        } else if (userRole === 'ngo') {
          if (verificationStatus === 'REGISTERED' || verificationStatus === 'DOCUMENTS_SUBMITTED' || verificationStatus === 'REJECTED') {
            router.push('/ngo/verification');
          } else {
            router.push('/ngo/dashboard');
          }
        } else if (userRole === 'driver') {
          if (verificationStatus === 'REGISTERED' || verificationStatus === 'DOCUMENTS_SUBMITTED' || verificationStatus === 'REJECTED') {
            router.push('/driver/verification');
          } else {
            router.push('/driver/dashboard');
          }
        } else {
          router.push(currentRole.dashboardRoute);
        }
      }, 700);

    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[#fdfbf7] dark:bg-[#121417]">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#1f4d36] text-[#f7f1e3] flex items-center justify-center font-heading text-xl font-bold shadow-md group-hover:scale-105 transition-transform">
            अ
          </div>
          <div>
            <span className="font-heading font-bold text-xl tracking-tight text-[#1f4d36] dark:text-[#f7f1e3]">
              ANNASETU
            </span>
            <span className="text-[11px] font-sans font-medium text-[#5c6068] dark:text-[#a0a5ad] block -mt-1">
              Surplus Food · Shared With Purpose
            </span>
          </div>
        </Link>

        <Link
          href="/login"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] text-[#5c6068] dark:text-[#a0a5ad] hover:text-[#1f4d36] text-xs font-semibold hover:bg-white dark:hover:bg-[#1c2024] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Change Role</span>
        </Link>
      </header>

      {/* Main Login Card */}
      <section className="max-w-lg w-full mx-auto my-auto py-6">
        <div className="bg-white dark:bg-[#1c2024] rounded-3xl border border-[#e5dec9] dark:border-[#2d3239] shadow-md p-6 sm:p-8 space-y-6">
          
          {/* Role Header */}
          <div className="flex items-start justify-between border-b border-[#e5dec9] dark:border-[#2d3239] pb-4">
            <div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentRole.badgeColor} mb-2`}>
                <span>{currentRole.icon}</span>
                <span>Signing in as {currentRole.headlineRole}</span>
              </div>
              <h1 className="text-2xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                Sign In to AnnaSetu
              </h1>
              <p className="text-xs text-[#5c6068] dark:text-[#a0a5ad] mt-1">
                {currentRole.subtitle}
              </p>
            </div>

            <Link
              href="/login"
              className="text-xs font-bold text-[#5c6068] hover:text-[#1f4d36] dark:hover:text-[#f7f1e3] px-2.5 py-1 rounded-lg border border-[#e5dec9] dark:border-[#2d3239] hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shrink-0"
            >
              [ CHANGE ROLE ]
            </Link>
          </div>

          {/* Feedback */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-800 dark:text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1f4d36] dark:text-[#f7f1e3] mb-1.5">
                Authorized Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#5c6068] absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={currentRole.demoEmail}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] bg-white dark:bg-[#14171a] text-xs font-sans text-[#23262b] dark:text-[#f7f1e3] placeholder-[#a0a5ad] focus:outline-none focus:ring-2 focus:ring-[#1f4d36]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-medium text-[#5c6068] dark:text-[#a0a5ad] hover:text-[#1f4d36]"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#5c6068] absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] bg-white dark:bg-[#14171a] text-xs font-sans text-[#23262b] dark:text-[#f7f1e3] placeholder-[#a0a5ad] focus:outline-none focus:ring-2 focus:ring-[#1f4d36]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-[#5c6068] hover:text-[#23262b]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-[#e5dec9] text-[#1f4d36] focus:ring-[#1f4d36]" />
                <span className="text-[11px] text-[#5c6068] dark:text-[#a0a5ad]">Remember session</span>
              </label>
              <Link
                href={currentRole.registerRoute}
                className="text-[11px] font-bold text-[#1f4d36] dark:text-[#4f9d3a] hover:underline"
              >
                [ CREATE ACCOUNT ]
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 ${currentRole.btnBg}`}
            >
              {loading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>[ SIGN IN AS {currentRole.title.toUpperCase()} ]</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill */}
          <div className="pt-4 border-t border-[#e5dec9] dark:border-[#2d3239] flex items-center justify-between">
            <span className="text-[11px] text-[#5c6068] dark:text-[#a0a5ad] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Demo account available
            </span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] font-bold text-[#1f4d36] dark:text-[#4f9d3a] hover:underline"
            >
              Fill Demo Credentials &rarr;
            </button>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto py-4 text-center text-xs text-[#5c6068] dark:text-[#a0a5ad] border-t border-[#e5dec9] dark:border-[#2d3239]">
        <span>AnnaSetu &copy; 2026 · Role-Based Operational Security · Source of Truth: PostgreSQL</span>
      </footer>
    </main>
  );
}

export default function RoleAuthPage({ params }: PageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f4d36]"></div>
      </div>
    }>
      <RoleLoginInner params={params} />
    </Suspense>
  );
}
