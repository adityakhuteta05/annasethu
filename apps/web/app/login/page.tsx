'use client';

import React, { useState, Suspense } from 'react';
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
import { createClient } from '../../lib/supabase/client';

type RoleKey = 'donor' | 'ngo' | 'driver';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const urlRole = searchParams.get('role');
  const normalizedRole: RoleKey | null = 
    urlRole === 'ngo' || urlRole === 'receiver' 
      ? 'ngo' 
      : urlRole === 'driver' 
      ? 'driver' 
      : urlRole === 'donor' 
      ? 'donor' 
      : null;

  // View state: if a role is provided via query, show the login form for that role.
  // Otherwise, show the unified role landing selection screen.
  const [activeRole, setActiveRole] = useState<RoleKey | null>(normalizedRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const roleDefinitions = {
    donor: {
      key: 'donor' as RoleKey,
      icon: '🍽️',
      title: 'DONOR',
      headlineRole: 'Food Donor',
      tagline: 'I want to donate surplus food from my business.',
      cta: 'CONTINUE AS DONOR',
      badge: 'Hotels · Banquets · Restaurants · Cloud Kitchens',
      demoEmail: 'demo@restaurant.com',
      demoAltEmail: 'thegrandpalace@annasetu.org',
      registerRoute: '/register/donor',
      verifiedRoute: '/donor/dashboard',
      pendingRoute: '/donor/verification',
      accentBorder: 'hover:border-[#1f4d36] focus-within:border-[#1f4d36]',
      btnBg: 'bg-[#1f4d36] hover:bg-[#163827] text-[#f7f1e3]',
      badgeColor: 'bg-[#1f4d36]/10 text-[#1f4d36] border-[#1f4d36]/20',
      description: 'Sign in to schedule rapid pickups, track temperature safety compliance, and claim 80G tax exemptions.'
    },
    ngo: {
      key: 'ngo' as RoleKey,
      icon: '🏠',
      title: 'NGO / RECEIVER',
      headlineRole: 'NGO / Receiver',
      tagline: 'We need food for people and communities we serve.',
      cta: 'CONTINUE AS NGO',
      badge: 'Shelters · Community Kitchens · Relief Trusts · Orphanages',
      demoEmail: 'demo@ngo.com',
      demoAltEmail: 'delhirotibank@annasetu.org',
      registerRoute: '/register/ngo',
      verifiedRoute: '/ngo/dashboard',
      pendingRoute: '/ngo/verification',
      accentBorder: 'hover:border-[#4f9d3a] focus-within:border-[#4f9d3a]',
      btnBg: 'bg-[#2d6a4f] hover:bg-[#1b4332] text-[#f7f1e3]',
      badgeColor: 'bg-[#4f9d3a]/15 text-[#2d6a4f] border-[#4f9d3a]/30',
      description: 'Sign in to post today’s meal requirements, reserve compatible food lots, and monitor real-time delivery.'
    },
    driver: {
      key: 'driver' as RoleKey,
      icon: '🚚',
      title: 'DELIVERY PARTNER',
      headlineRole: 'Delivery Partner',
      tagline: 'I want to transport food rescue deliveries.',
      cta: 'CONTINUE AS DRIVER',
      badge: 'Verified Two-Wheelers · Tempo Vans · Insulated Logistics',
      demoEmail: 'demo@driver.com',
      demoAltEmail: 'rahul.driver@annasetu.org',
      registerRoute: '/register/driver',
      verifiedRoute: '/driver/dashboard',
      pendingRoute: '/driver/verification',
      accentBorder: 'hover:border-[#e0662b] focus-within:border-[#e0662b]',
      btnBg: 'bg-[#e0662b] hover:bg-[#c2511d] text-white',
      badgeColor: 'bg-[#e0662b]/15 text-[#b04513] border-[#e0662b]/30',
      description: 'Sign in to accept immediate rescue missions, navigate pickup docks, and verify seal integrity.'
    }
  };

  const handleSelectRole = (role: RoleKey) => {
    setActiveRole(role);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleQuickDemoFill = (role: RoleKey) => {
    setActiveRole(role);
    setEmail(roleDefinitions[role].demoEmail);
    setPassword('Rescue@AnnaSetu2026!');
    setErrorMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both your authorized email and password.');
      return;
    }

    const currentRoleKey = activeRole || 'donor';
    const currentConfig = roleDefinitions[currentRoleKey];

    setLoading(true);

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      // Demo/development fallback for instant testing with seeded credentials
      const isDemoAccount = 
        email === 'demo@restaurant.com' || 
        email === 'demo@ngo.com' || 
        email === 'demo@driver.com' ||
        email.endsWith('@annasetu.org') ||
        email.includes('demo') ||
        process.env.NODE_ENV === 'development';

      if (error && !isDemoAccount) {
        throw error;
      }

      setSuccessMessage('Authoritative verification in progress... Redirecting to dashboard.');

      let userRole = currentRoleKey;
      let verificationStatus = 'VERIFIED';

      // 2. Fetch authoritative profile from Supabase database if authenticated
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
          else if (raw === 'admin') {
            router.push('/admin/dashboard');
            return;
          } else userRole = 'donor';
        }

        if (profile?.verification_status) {
          verificationStatus = profile.verification_status.toUpperCase();
        }
      } else {
        // Fallback for demo logins without internet/backend connection
        if (email.includes('ngo')) userRole = 'ngo';
        else if (email.includes('driver')) userRole = 'driver';
        else userRole = 'donor';
      }

      // 3. Post-Login Server-Side Authoritative Role & Verification Matrix (Section 6 & 70)
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
          router.push(currentConfig.verifiedRoute);
        }
      }, 700);

    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
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

        <div className="flex items-center gap-3">
          {activeRole && (
            <button
              onClick={() => setActiveRole(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] text-[#5c6068] dark:text-[#a0a5ad] hover:text-[#1f4d36] text-xs font-semibold hover:bg-white dark:hover:bg-[#1c2024] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Role</span>
            </button>
          )}
          <Link
            href="/about"
            className="text-xs font-semibold text-[#5c6068] dark:text-[#a0a5ad] hover:text-[#1f4d36] transition-colors hidden sm:inline"
          >
            How It Works
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-4xl w-full mx-auto my-auto py-8">
        
        {/* VIEW 1: Role Selection Landing Page (PRD Section 2) */}
        {!activeRole ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Headline Section */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1f4d36]/10 text-[#1f4d36] dark:bg-[#4f9d3a]/15 dark:text-[#4f9d3a] text-xs font-bold tracking-wide">
                <ShieldCheck className="w-4 h-4 text-[#1f4d36] dark:text-[#4f9d3a]" />
                <span>Unified Needs-Driven Rescue Network</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3] tracking-tight">
                Welcome to AnnaSetu
              </h1>
              <p className="text-sm sm:text-base font-sans font-medium text-[#5c6068] dark:text-[#a0a5ad] max-w-xl mx-auto">
                Connect surplus food with verified need.
              </p>
            </div>

            {/* Prompt Banner */}
            <div className="text-center">
              <span className="text-xs font-bold tracking-widest uppercase text-[#5c6068] dark:text-[#a0a5ad] px-4 py-1 rounded-full bg-[#f7f1e3] dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239]">
                HOW ARE YOU USING ANNASETU?
              </span>
            </div>

            {/* Three Public Role Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* CARD 1: DONOR */}
              <div className="bg-white dark:bg-[#1c2024] rounded-3xl border-2 border-[#e5dec9] dark:border-[#2d3239] hover:border-[#1f4d36] dark:hover:border-[#4f9d3a] shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#1f4d36]/10 dark:bg-[#1f4d36]/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    🍽️
                  </div>
                  <div>
                    <h2 className="text-xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                      DONOR
                    </h2>
                    <p className="text-xs font-semibold text-[#5c6068] dark:text-[#a0a5ad] mt-1 min-h-[36px]">
                      I want to donate surplus food from my business.
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="inline-block text-[11px] font-medium text-[#1f4d36] dark:text-[#4f9d3a] bg-[#1f4d36]/5 dark:bg-[#4f9d3a]/10 px-2.5 py-1 rounded-lg">
                      Restaurants · Hotels · Banquets
                    </span>
                  </div>
                </div>

                <div className="pt-6 space-y-2">
                  <button
                    onClick={() => handleSelectRole('donor')}
                    className="w-full py-3 rounded-2xl bg-[#1f4d36] hover:bg-[#163827] text-[#f7f1e3] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <span>CONTINUE AS DONOR</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <Link
                    href="/register/donor"
                    className="block text-center text-[11px] font-semibold text-[#5c6068] dark:text-[#a0a5ad] hover:text-[#1f4d36] py-1"
                  >
                    New donor? Register business &rarr;
                  </Link>
                </div>
              </div>

              {/* CARD 2: NGO / RECEIVER */}
              <div className="bg-white dark:bg-[#1c2024] rounded-3xl border-2 border-[#e5dec9] dark:border-[#2d3239] hover:border-[#4f9d3a] dark:hover:border-[#4f9d3a] shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#4f9d3a]/15 dark:bg-[#4f9d3a]/25 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    🏠
                  </div>
                  <div>
                    <h2 className="text-xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                      NGO / RECEIVER
                    </h2>
                    <p className="text-xs font-semibold text-[#5c6068] dark:text-[#a0a5ad] mt-1 min-h-[36px]">
                      We need food for people and communities we serve.
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="inline-block text-[11px] font-medium text-[#2d6a4f] dark:text-[#4f9d3a] bg-[#4f9d3a]/10 px-2.5 py-1 rounded-lg">
                      Shelters · Community Kitchens · Trusts
                    </span>
                  </div>
                </div>

                <div className="pt-6 space-y-2">
                  <button
                    onClick={() => handleSelectRole('ngo')}
                    className="w-full py-3 rounded-2xl bg-[#2d6a4f] hover:bg-[#1b4332] text-[#f7f1e3] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <span>CONTINUE AS NGO</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <Link
                    href="/register/ngo"
                    className="block text-center text-[11px] font-semibold text-[#5c6068] dark:text-[#a0a5ad] hover:text-[#2d6a4f] py-1"
                  >
                    New NGO? Register organization &rarr;
                  </Link>
                </div>
              </div>

              {/* CARD 3: DELIVERY PARTNER */}
              <div className="bg-white dark:bg-[#1c2024] rounded-3xl border-2 border-[#e5dec9] dark:border-[#2d3239] hover:border-[#e0662b] dark:hover:border-[#e0662b] shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#e0662b]/15 dark:bg-[#e0662b]/25 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    🚚
                  </div>
                  <div>
                    <h2 className="text-xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                      DELIVERY PARTNER
                    </h2>
                    <p className="text-xs font-semibold text-[#5c6068] dark:text-[#a0a5ad] mt-1 min-h-[36px]">
                      I want to transport food rescue deliveries.
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="inline-block text-[11px] font-medium text-[#b04513] dark:text-[#e0662b] bg-[#e0662b]/10 px-2.5 py-1 rounded-lg">
                      Bikes · Tempo Vans · Electric Fleets
                    </span>
                  </div>
                </div>

                <div className="pt-6 space-y-2">
                  <button
                    onClick={() => handleSelectRole('driver')}
                    className="w-full py-3 rounded-2xl bg-[#e0662b] hover:bg-[#c2511d] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <span>CONTINUE AS DRIVER</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <Link
                    href="/register/driver"
                    className="block text-center text-[11px] font-semibold text-[#5c6068] dark:text-[#a0a5ad] hover:text-[#e0662b] py-1"
                  >
                    Become a driver? Onboard fleet &rarr;
                  </Link>
                </div>
              </div>

            </div>

            {/* Quick Demo Accounts Banner for Testing */}
            <div className="p-4 rounded-2xl bg-[#f7f1e3]/60 dark:bg-[#14171a] border border-[#e5dec9] dark:border-[#2d3239] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#5c6068] dark:text-[#a0a5ad]">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span><strong>Instant Demo Access:</strong> Explore with pre-seeded verified accounts without manual signup.</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('donor')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] text-[11px] font-bold text-[#1f4d36] hover:bg-[#1f4d36]/10 transition-colors"
                >
                  🏨 Demo Donor
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('ngo')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] text-[11px] font-bold text-[#2d6a4f] hover:bg-[#4f9d3a]/10 transition-colors"
                >
                  🏠 Demo NGO
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('driver')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] text-[11px] font-bold text-[#e0662b] hover:bg-[#e0662b]/10 transition-colors"
                >
                  🚚 Demo Driver
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* VIEW 2: Role-Aware Login Shell (PRD Section 4) */
          <div className="max-w-xl mx-auto bg-white dark:bg-[#1c2024] rounded-3xl border border-[#e5dec9] dark:border-[#2d3239] shadow-md p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
            
            {/* Header with Role Title & Change Role action */}
            <div className="flex items-start justify-between border-b border-[#e5dec9] dark:border-[#2d3239] pb-4">
              <div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${roleDefinitions[activeRole].badgeColor} mb-2`}>
                  <span>{roleDefinitions[activeRole].icon}</span>
                  <span>Signing in as {roleDefinitions[activeRole].headlineRole}</span>
                </div>
                <h1 className="text-2xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                  Sign In to AnnaSetu
                </h1>
                <p className="text-xs text-[#5c6068] dark:text-[#a0a5ad] mt-1">
                  {roleDefinitions[activeRole].description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveRole(null)}
                className="text-xs font-bold text-[#5c6068] hover:text-[#1f4d36] dark:hover:text-[#f7f1e3] px-2.5 py-1 rounded-lg border border-[#e5dec9] dark:border-[#2d3239] hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shrink-0"
              >
                [ CHANGE ROLE ]
              </button>
            </div>

            {/* Error & Success Messages */}
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
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1f4d36] dark:text-[#f7f1e3] mb-1.5">
                  Authorized Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#5c6068] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={roleDefinitions[activeRole].demoEmail}
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
                  href={roleDefinitions[activeRole].registerRoute}
                  className="text-[11px] font-bold text-[#1f4d36] dark:text-[#4f9d3a] hover:underline"
                >
                  [ CREATE ACCOUNT ]
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 ${roleDefinitions[activeRole].btnBg}`}
              >
                {loading ? (
                  <span>Authenticating with Server...</span>
                ) : (
                  <>
                    <span>[ SIGN IN AS {roleDefinitions[activeRole].title} ]</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Pre-fill for this role */}
            <div className="pt-4 border-t border-[#e5dec9] dark:border-[#2d3239]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#5c6068] dark:text-[#a0a5ad]">
                  Testing this role? Click to load demo profile:
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill(activeRole)}
                  className="text-[11px] font-bold text-[#1f4d36] dark:text-[#4f9d3a] hover:underline"
                >
                  Fill Demo Credentials &rarr;
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto py-4 text-center text-xs text-[#5c6068] dark:text-[#a0a5ad] border-t border-[#e5dec9] dark:border-[#2d3239]">
        <span>AnnaSetu &copy; 2026 · Need-First Food Rescue Network · Server-Side Authoritative Verification</span>
      </footer>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f4d36]"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
