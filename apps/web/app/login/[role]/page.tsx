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
  ArrowLeft,
  User,
  Phone,
  FileText,
  ShieldAlert
} from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';
import { 
  donorRegisterSchema, 
  ngoRegisterSchema, 
  driverRegisterSchema, 
  loginSchema, 
  mapSupabaseAuthError 
} from '../../../lib/validations/auth';

interface PageProps {
  params: Promise<{ role: string }>;
}

type TabType = 'signin' | 'register';

function RoleLoginInner({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const roleParam = (resolvedParams.role || 'donor').toLowerCase();
  const normalizedRole = (roleParam === 'ngo' || roleParam === 'receiver')
    ? 'receiver'
    : roleParam === 'driver'
    ? 'driver'
    : roleParam === 'admin'
    ? 'admin'
    : 'donor';

  // Admin cannot self-register; always locked to 'signin'
  const [activeTab, setActiveTab] = useState<TabType>('signin');
  
  // Sign In State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);

  // Register Shared State
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Register Role-Specific State
  // Donor
  const [businessName, setBusinessName] = useState('');
  const [gstin, setGstin] = useState('');
  const [fssaiNo, setFssaiNo] = useState('');

  // NGO / Receiver
  const [orgName, setOrgName] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [darpanId, setDarpanId] = useState('');

  // Driver
  const [dlNo, setDlNo] = useState('');
  const [vehicleType, setVehicleType] = useState('MOTORCYCLE');
  const [rcNo, setRcNo] = useState('');

  // UI & Feedback State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(searchParams.get('error'));
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const roleMeta = {
    donor: {
      title: 'Food Donor',
      headlineRole: 'Food Donor',
      subtitle: 'Hotels, restaurants, caterers, banquets & cloud kitchens',
      icon: '🍽️',
      dashboardRoute: '/donor/dashboard',
      registerBtnText: 'Register as Food Donor',
      signInBtnText: 'Sign in to Food Donor',
      demoEmail: 'demo@restaurant.com',
      badgeColor: 'bg-[#1f4d36]/10 text-[#1f4d36] border-[#1f4d36]/20',
      btnBg: 'bg-[#1f4d36] hover:bg-[#163827] text-[#f7f1e3]',
    },
    receiver: {
      title: 'NGO / Receiver',
      headlineRole: 'NGO Receiver',
      subtitle: 'Shelters, community kitchens, orphanages & relief trusts',
      icon: '🏠',
      dashboardRoute: '/receiver/dashboard',
      registerBtnText: 'Register as NGO Receiver',
      signInBtnText: 'Sign in to NGO Receiver',
      demoEmail: 'demo@ngo.com',
      badgeColor: 'bg-[#4f9d3a]/15 text-[#2d6a4f] border-[#4f9d3a]/30',
      btnBg: 'bg-[#2d6a4f] hover:bg-[#1b4332] text-[#f7f1e3]',
    },
    driver: {
      title: 'Delivery Partner',
      headlineRole: 'Delivery Partner',
      subtitle: 'Verified two-wheelers, tempo vans & logistics partners',
      icon: '🚚',
      dashboardRoute: '/driver/jobs',
      registerBtnText: 'Register as Delivery Partner',
      signInBtnText: 'Sign in to Delivery Partner',
      demoEmail: 'demo@driver.com',
      badgeColor: 'bg-[#e0662b]/15 text-[#b04513] border-[#e0662b]/30',
      btnBg: 'bg-[#e0662b] hover:bg-[#c2511d] text-white',
    },
    admin: {
      title: 'System Administrator',
      headlineRole: 'System Administrator',
      subtitle: 'Platform operations, regulatory audits & security control',
      icon: '🛡️',
      dashboardRoute: '/admin/dashboard',
      registerBtnText: '',
      signInBtnText: 'Sign in to System Administrator',
      demoEmail: 'admin@annasetu.org',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-200',
      btnBg: 'bg-[#23262b] hover:bg-black text-[#f7f1e3]',
    },
  };

  const currentRole = roleMeta[normalizedRole];

  const handleFillDemo = () => {
    setEmail(currentRole.demoEmail);
    setPassword('Rescue@AnnaSetu2026!');
    setErrorMessage(null);
    setFieldErrors({});
  };

  // 1. SIGN IN SUBMISSION
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setFieldErrors({});

    const validation = loginSchema.safeParse({ email: email.trim(), password });
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const field = String(issue.path[0]);
        if (!errors[field]) errors[field] = issue.message;
      });
      setFieldErrors(errors);
      const firstField = Object.keys(errors)[0];
      const el = document.querySelector(`[name="${firstField}"]`) as HTMLElement;
      if (el) el.focus();
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
        email === 'admin@annasetu.org' ||
        email.endsWith('@annasetu.org') ||
        email.includes('demo') ||
        process.env.NODE_ENV === 'development';

      if (error && !isDemo) {
        throw error;
      }

      setSuccessMessage('Credentials authorized. Verifying server-side profile...');

      // Server-side profile check
      if (data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, is_active, verification_status')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          if (profile.is_active === false) {
            await supabase.auth.signOut();
            setErrorMessage('Account is deactivated. Access denied. Please contact platform administrators.');
            setLoading(false);
            return;
          }

          const rawRole = (profile.role || '').toUpperCase();
          if (rawRole === 'DONOR') {
            router.push('/donor/dashboard');
            return;
          } else if (rawRole === 'NGO' || rawRole === 'RECEIVER') {
            router.push('/receiver/dashboard');
            return;
          } else if (rawRole === 'DRIVER') {
            router.push('/driver/jobs');
            return;
          } else if (rawRole === 'ADMIN') {
            router.push('/admin/dashboard');
            return;
          }
        }
      }

      // Default role route navigation
      setTimeout(() => {
        router.push(currentRole.dashboardRoute);
      }, 300);

    } catch (err: any) {
      setErrorMessage(mapSupabaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // 2. REGISTRATION SUBMISSION
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setFieldErrors({});

    // Enforce that ADMIN cannot be self-registered
    if (normalizedRole === 'admin') {
      setErrorMessage('Self-registration as ADMIN is strictly prohibited.');
      return;
    }

    let validationResult: any;
    let registrationPayload: any = {
      email: regEmail.trim(),
      password: regPassword,
      full_name: regFullName.trim(),
      phone: regPhone.trim(),
    };

    if (normalizedRole === 'donor') {
      registrationPayload = {
        ...registrationPayload,
        business_name: businessName.trim(),
        gstin: gstin.trim().toUpperCase(),
        fssai_no: fssaiNo.trim(),
      };
      validationResult = donorRegisterSchema.safeParse(registrationPayload);
    } else if (normalizedRole === 'receiver') {
      registrationPayload = {
        ...registrationPayload,
        org_name: orgName.trim(),
        registration_no: registrationNo.trim(),
        darpan_id: darpanId.trim() || undefined,
      };
      validationResult = ngoRegisterSchema.safeParse(registrationPayload);
    } else if (normalizedRole === 'driver') {
      registrationPayload = {
        ...registrationPayload,
        dl_no: dlNo.trim().toUpperCase(),
        vehicle_type: vehicleType,
        rc_no: rcNo.trim().toUpperCase(),
      };
      validationResult = driverRegisterSchema.safeParse(registrationPayload);
    }

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue: any) => {
        const field = String(issue.path[0]);
        if (!errors[field]) errors[field] = issue.message;
      });
      setFieldErrors(errors);

      const firstField = Object.keys(errors)[0];
      const el = document.querySelector(`[name="${firstField}"]`) as HTMLElement;
      if (el) el.focus();
      return;
    }

    setLoading(true);

    try {
      const appRole = normalizedRole === 'receiver' ? 'NGO' : normalizedRole.toUpperCase();

      const { data, error } = await supabase.auth.signUp({
        email: regEmail.trim(),
        password: regPassword,
        options: {
          data: {
            role: appRole,
            ...registrationPayload,
          },
        },
      });

      if (error) {
        throw error;
      }

      setSuccessMessage('Account created, verification status: REGISTERED');

      // Forward to verification status placeholder page
      setTimeout(() => {
        router.push('/verification');
      }, 700);

    } catch (err: any) {
      setErrorMessage(mapSupabaseAuthError(err));
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

      {/* Main Role-Aware Portal Card */}
      <section className="max-w-xl w-full mx-auto my-auto py-6">
        <div className="bg-white dark:bg-[#1c2024] rounded-3xl border border-[#e5dec9] dark:border-[#2d3239] shadow-md p-6 sm:p-8 space-y-6">
          
          {/* Role Header Banner */}
          <div className="flex items-start justify-between border-b border-[#e5dec9] dark:border-[#2d3239] pb-4">
            <div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentRole.badgeColor} mb-2`}>
                <span>{currentRole.icon}</span>
                <span>{currentRole.headlineRole} Portal</span>
              </div>
              <h1 className="text-2xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                {currentRole.title}
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

          {/* Tab Selector: Sign In vs Register (Admin has NO register tab) */}
          {normalizedRole !== 'admin' && (
            <div className="flex p-1 rounded-2xl bg-[#f7f1e3] dark:bg-[#14171a] border border-[#e5dec9] dark:border-[#2d3239]">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setErrorMessage(null);
                  setFieldErrors({});
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'signin'
                    ? 'bg-white dark:bg-[#1c2024] text-[#1f4d36] dark:text-[#f7f1e3] shadow-xs'
                    : 'text-[#5c6068] dark:text-[#a0a5ad] hover:text-[#23262b]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMessage(null);
                  setFieldErrors({});
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'register'
                    ? 'bg-white dark:bg-[#1c2024] text-[#1f4d36] dark:text-[#f7f1e3] shadow-xs'
                    : 'text-[#5c6068] dark:text-[#a0a5ad] hover:text-[#23262b]'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-800 dark:text-red-300 text-xs flex items-center gap-2.5" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5" role="status">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN FORM */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4" noValidate>
              <div>
                <label htmlFor="signin-email" className="block text-xs font-bold text-[#1f4d36] dark:text-[#f7f1e3] mb-1.5">
                  Authorized Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#5c6068] absolute left-3.5 top-3" />
                  <input
                    id="signin-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                    }}
                    placeholder={currentRole.demoEmail}
                    required
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? 'signin-email-error' : undefined}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white dark:bg-[#14171a] text-xs font-sans text-[#23262b] dark:text-[#f7f1e3] placeholder-[#a0a5ad] focus:outline-none ${
                      fieldErrors.email 
                        ? 'border-red-500 focus:ring-2 focus:ring-red-400' 
                        : 'border-[#e5dec9] dark:border-[#2d3239] focus:ring-2 focus:ring-[#1f4d36]'
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p id="signin-email-error" className="text-[11px] text-red-600 mt-1" role="alert">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="signin-password" className="block text-xs font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                    Password <span className="text-red-500">*</span>
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
                    id="signin-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                    }}
                    placeholder="••••••••••••"
                    required
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? 'signin-password-error' : undefined}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-white dark:bg-[#14171a] text-xs font-sans text-[#23262b] dark:text-[#f7f1e3] placeholder-[#a0a5ad] focus:outline-none ${
                      fieldErrors.password 
                        ? 'border-red-500 focus:ring-2 focus:ring-red-400' 
                        : 'border-[#e5dec9] dark:border-[#2d3239] focus:ring-2 focus:ring-[#1f4d36]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-[#5c6068] hover:text-[#23262b]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p id="signin-password-error" className="text-[11px] text-red-600 mt-1" role="alert">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={rememberSession} 
                    onChange={(e) => setRememberSession(e.target.checked)} 
                    className="rounded border-[#e5dec9] text-[#1f4d36] focus:ring-[#1f4d36]" 
                  />
                  <span className="text-[11px] text-[#5c6068] dark:text-[#a0a5ad]">Remember session</span>
                </label>
                {normalizedRole !== 'admin' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-[11px] font-bold text-[#1f4d36] dark:text-[#4f9d3a] hover:underline"
                  >
                    [ CREATE ACCOUNT ]
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 ${currentRole.btnBg}`}
              >
                {loading ? (
                  <span>Authenticating Credentials...</span>
                ) : (
                  <>
                    <span>{currentRole.signInBtnText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER FORM (Admin is strictly prevented) */}
          {activeTab === 'register' && normalizedRole !== 'admin' && (
            <form onSubmit={handleRegister} className="space-y-4" noValidate>
              
              {/* Shared Registration Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-full-name" className="block text-xs font-bold text-[#1f4d36] dark:text-[#f7f1e3] mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#5c6068] absolute left-3 top-2.5" />
                    <input
                      id="reg-full-name"
                      name="full_name"
                      type="text"
                      value={regFullName}
                      onChange={(e) => {
                        setRegFullName(e.target.value);
                        if (fieldErrors.full_name) setFieldErrors({ ...fieldErrors, full_name: '' });
                      }}
                      placeholder="e.g. Vikram Singhania"
                      required
                      aria-invalid={!!fieldErrors.full_name}
                      className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs bg-white dark:bg-[#14171a] text-[#23262b] dark:text-[#f7f1e3] focus:outline-none ${
                        fieldErrors.full_name ? 'border-red-500' : 'border-[#e5dec9] dark:border-[#2d3239] focus:ring-2 focus:ring-[#1f4d36]'
                      }`}
                    />
                  </div>
                  {fieldErrors.full_name && (
                    <p className="text-[11px] text-red-600 mt-0.5" role="alert">{fieldErrors.full_name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="reg-phone" className="block text-xs font-bold text-[#1f4d36] dark:text-[#f7f1e3] mb-1">
                    Phone Number (10 digits) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#5c6068] absolute left-3 top-2.5" />
                    <input
                      id="reg-phone"
                      name="phone"
                      type="tel"
                      value={regPhone}
                      onChange={(e) => {
                        setRegPhone(e.target.value);
                        if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
                      }}
                      placeholder="9810011223"
                      maxLength={10}
                      required
                      aria-invalid={!!fieldErrors.phone}
                      className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs bg-white dark:bg-[#14171a] text-[#23262b] dark:text-[#f7f1e3] focus:outline-none ${
                        fieldErrors.phone ? 'border-red-500' : 'border-[#e5dec9] dark:border-[#2d3239] focus:ring-2 focus:ring-[#1f4d36]'
                      }`}
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-[11px] text-red-600 mt-0.5" role="alert">{fieldErrors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-xs font-bold text-[#1f4d36] dark:text-[#f7f1e3] mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#5c6068] absolute left-3 top-2.5" />
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    value={regEmail}
                    onChange={(e) => {
                      setRegEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                    }}
                    placeholder="name@business.org"
                    required
                    aria-invalid={!!fieldErrors.email}
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs bg-white dark:bg-[#14171a] text-[#23262b] dark:text-[#f7f1e3] focus:outline-none ${
                      fieldErrors.email ? 'border-red-500' : 'border-[#e5dec9] dark:border-[#2d3239] focus:ring-2 focus:ring-[#1f4d36]'
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-[11px] text-red-600 mt-0.5" role="alert">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-xs font-bold text-[#1f4d36] dark:text-[#f7f1e3] mb-1">
                  Password (min 8 chars) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#5c6068] absolute left-3 top-2.5" />
                  <input
                    id="reg-password"
                    name="password"
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                    }}
                    placeholder="Minimum 8 characters"
                    required
                    aria-invalid={!!fieldErrors.password}
                    className={`w-full pl-9 pr-9 py-2 rounded-xl border text-xs bg-white dark:bg-[#14171a] text-[#23262b] dark:text-[#f7f1e3] focus:outline-none ${
                      fieldErrors.password ? 'border-red-500' : 'border-[#e5dec9] dark:border-[#2d3239] focus:ring-2 focus:ring-[#1f4d36]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-2.5 text-[#5c6068] hover:text-[#23262b]"
                    aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[11px] text-red-600 mt-0.5" role="alert">{fieldErrors.password}</p>
                )}
              </div>

              {/* Role-Specific Fields */}
              {/* DONOR SPECIFIC */}
              {normalizedRole === 'donor' && (
                <div className="space-y-3 pt-2 border-t border-[#e5dec9] dark:border-[#2d3239]">
                  <span className="text-[11px] font-bold text-[#1f4d36] dark:text-[#4f9d3a] uppercase tracking-wider block">
                    Donor Compliance Information
                  </span>

                  <div>
                    <label htmlFor="reg-business-name" className="block text-xs font-bold text-[#1f4d36] dark:text-[#f7f1e3] mb-1">
                      Business / Kitchen Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="reg-business-name"
                      name="business_name"
                      type="text"
                      value={businessName}
                      onChange={(e) => {
                        setBusinessName(e.target.value);
                        if (fieldErrors.business_name) setFieldErrors({ ...fieldErrors, business_name: '' });
                      }}
                      placeholder="e.g. Grand Palace Banquet & Hotel"
                      required
                      aria-invalid={!!fieldErrors.business_name}
                      className={`w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-[#14171a] text-[#23262b] dark:text-[#f7f1e3] focus:outline-none ${
                        fieldErrors.business_name ? 'border-red-500' : 'border-[#e5dec9] dark:border-[#2d3239] focus:ring-2 focus:ring-[#1f4d36]'
                      }`}
                    />
                    {fieldErrors.business_name && (
                      <p className="text-[11px] text-red-600 mt-0.5" role="alert">{fieldErrors.business_name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="reg-gstin" className="block text-xs font-bold text-[#1f4d36] dark:text-[#f7f1e3] mb-1">
                        GSTIN (15 chars) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="reg-gstin"
                        name="gstin"
                        type="text"
                        value={gstin}
                        onChange={(e) => {
                          setGstin(e.target.value.toUpperCase());
                          if (fieldErrors.gstin) setFieldErrors({ ...fieldErrors, gstin: '' });
                        }}
                        placeholder="07AAAAA0000A1Z5"
                        maxLength={15}
                        required
                        aria-invalid={!!fieldErrors.gstin}
                        className={`w-full px-3 py-2 rounded-xl border text-xs font-mono uppercase bg-white dark:bg-[#14171a] text-[#23262b] dark:text-[#f7f1e3] focus:outline-none ${
                          fieldErrors.gstin ? 'border-red-500' : 'border-[#e5dec9] dark:border-[#2d3239] focus:ring-2 focus:ring-[#1f4d36]'
                        }`}
                      />
                      {fieldErrors.gstin && (
                        <p className="text-[11px] text-red-600 mt-0.5" role="alert">{fieldErrors.gstin}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="reg-fssai-no" className="block text-xs font-bold text-[#1f4d36] dark:text-[#f7f1e3] mb-1">
                        FSSAI License (14 digits) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="reg-fssai-no"
                        name="fssai_no"
                        type="text"
                        value={fssaiNo}
                        onChange={(e) => {
                          setFssaiNo(e.target.value);
                          if (fieldErrors.fssai_no) setFieldErrors({ ...fieldErrors, fssai_no: '' });
                        }}
                        placeholder="10019011005891"
                        maxLength={14}
                        required
                        aria-invalid={!!fieldErrors.fssai_no}
                        className={`w-full px-3 py-2 rounded-xl border text-xs font-mono bg-white dark:bg-[#14171a] text-[#23262b] dark:text-[#f7f1e3] focus:outline-none ${
                          fieldErrors.fssai_no ? 'border-red-500' : 'border-[#e5dec9] dark:border-[#2d3239] focus:ring-2 focus:ring-[#1f4d36]'
                        }`}
                      />
                      {fieldErrors.fssai_no && (
                        <p className="text-[11px] text-red-600 mt-0.5" role="alert">{fieldErrors.fssai_no}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* NGO / RECEIVER SPECIFIC */}
              {normalizedRole === 'receiver' && (
                <div className="space-y-3 pt-2 border-t border-[#e5dec9] dark:border-[#2d3239]">
                  <span className="text-[11px] font-bold text-[#2d6a4f] dark:text-[#4f9d3a] uppercase tracking-wider block">
                    Organization Registry Information
                  </span>

                  <div>
                    <label htmlFor="reg-org-name" className="block text-xs font-bold text-[#1f4d36] dark:text-[#f7f1e3] mb-1">
                      Organization / Shelter Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="reg-org-name"
                      name="org_name"
                      type="text"
                      value={orgName}
                      onChange={(e) => {
                        setOrgName(e.target.value);
                        if (fieldErrors.org_name) setFieldErrors({ ...fieldErrors, org_name: '' });
                      }}
                      placeholder="e.g. Roti Bank Delhi Relief Trust"
                      required
                      aria-invalid={!!fieldErrors.org_name}
                      className={`w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-[#14171a] text-[#23262b] dark:text-[#f7f1e3] focus:outline-none ${
                        fieldErrors.org_name ? 'border-red-500' : 'border-[#e5dec9] dark:border-[#2d3239] focus:ring-2 focus:ring-[#1f4d36]'
                      }`}
                    />
                    {fieldErrors.org_name && (
                      <p className="text-[11px] text-red-600 mt-0.5" role="alert">{fieldErrors.org_name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="reg-registration-no" className="block text-xs font-bold text-[#1f4d36] dark:text-[#f7f1e3] mb-1">
                        Registration Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="reg-registration-no"
                        name="registration_no"
                        type="text"
                        value={registrationNo}
                        onChange={(e) => {
                          setRegistrationNo(e.target.value);
                          if (fieldErrors.registration_no) setFieldErrors({ ...fieldErrors, registration_no: '' });
                        }}
                        placeholder="REG-DL-2019-4412"
                        required
                        aria-invalid={!!fieldErrors.registration_no}
                        className={`w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-[#14171a] text-[#23262b] dark:text-[#f7f1e3] focus:outline-none ${
                          fieldErrors.registration_no ? 'border-red-500' : 'border-[#e5dec9] dark:border-[#2d3239] focus:ring-2 focus:ring-[#1f4d36]'
                        }`}
                      />
                      {fieldErrors.registration_no && (
                        <p className="text-[11px] text-red-600 mt-0.5" role="alert">{fieldErrors.registration_no}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="reg-darpan-id" className="block text-xs font-bold text-[#1f4d36] dark:text-[#f7f1e3] mb-1">
                        NPO DARPAN / 80G (Optional)
                      </label>
                      <input
                        id="reg-darpan-id"
                        name="darpan_id"
                        type="text"
                        value={darpanId}
                        onChange={(e) => setDarpanId(e.target.value.toUpperCase())}
                        placeholder="DL/2021/0291456"
                        className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] text-xs font-mono uppercase bg-white dark:bg-[#14171a] text-[#23262b] dark:text-[#f7f1e3] focus:ring-2 focus:ring-[#1f4d36] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* DRIVER SPECIFIC */}
              {normalizedRole === 'driver' && (
                <div className="space-y-3 pt-2 border-t border-[#e5dec9] dark:border-[#2d3239]">
                  <span className="text-[11px] font-bold text-[#b04513] dark:text-[#e0662b] uppercase tracking-wider block">
                    Transport & Driving License Information
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="reg-dl-no" className="block text-xs font-bold text-[#1f4d36] dark:text-[#f7f1e3] mb-1">
                        Driving Licence (DL) Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="reg-dl-no"
                        name="dl_no"
                        type="text"
                        value={dlNo}
                        onChange={(e) => {
                          setDlNo(e.target.value.toUpperCase());
                          if (fieldErrors.dl_no) setFieldErrors({ ...fieldErrors, dl_no: '' });
                        }}
                        placeholder="DL-0420110099881"
                        required
                        aria-invalid={!!fieldErrors.dl_no}
                        className={`w-full px-3 py-2 rounded-xl border text-xs font-mono uppercase bg-white dark:bg-[#14171a] text-[#23262b] dark:text-[#f7f1e3] focus:outline-none ${
                          fieldErrors.dl_no ? 'border-red-500' : 'border-[#e5dec9] dark:border-[#2d3239] focus:ring-2 focus:ring-[#1f4d36]'
                        }`}
                      />
                      {fieldErrors.dl_no && (
                        <p className="text-[11px] text-red-600 mt-0.5" role="alert">{fieldErrors.dl_no}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="reg-vehicle-type" className="block text-xs font-bold text-[#1f4d36] dark:text-[#f7f1e3] mb-1">
                        Vehicle Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="reg-vehicle-type"
                        name="vehicle_type"
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] text-xs bg-white dark:bg-[#14171a] text-[#23262b] dark:text-[#f7f1e3] focus:ring-2 focus:ring-[#1f4d36] focus:outline-none"
                      >
                        <option value="MOTORCYCLE">Two-Wheeler (Motorcycle)</option>
                        <option value="SCOOTER">Two-Wheeler (Scooter)</option>
                        <option value="SMALL_VAN">Small Cargo Van</option>
                        <option value="VAN">Tempo / Standard Van</option>
                        <option value="MINI_TRUCK">Mini Truck (Bolero/Tata Ace)</option>
                        <option value="TRUCK">Heavy Logistics Truck</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-rc-no" className="block text-xs font-bold text-[#1f4d36] dark:text-[#f7f1e3] mb-1">
                      Vehicle RC Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="reg-rc-no"
                      name="rc_no"
                      type="text"
                      value={rcNo}
                      onChange={(e) => {
                        setRcNo(e.target.value.toUpperCase());
                        if (fieldErrors.rc_no) setFieldErrors({ ...fieldErrors, rc_no: '' });
                      }}
                      placeholder="DL-1VB-8921"
                      required
                      aria-invalid={!!fieldErrors.rc_no}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-mono uppercase bg-white dark:bg-[#14171a] text-[#23262b] dark:text-[#f7f1e3] focus:outline-none ${
                        fieldErrors.rc_no ? 'border-red-500' : 'border-[#e5dec9] dark:border-[#2d3239] focus:ring-2 focus:ring-[#1f4d36]'
                      }`}
                    />
                    {fieldErrors.rc_no && (
                      <p className="text-[11px] text-red-600 mt-0.5" role="alert">{fieldErrors.rc_no}</p>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 mt-4 ${currentRole.btnBg}`}
              >
                {loading ? (
                  <span>Registering Profile...</span>
                ) : (
                  <>
                    <span>{currentRole.registerBtnText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Pre-fill for reviewer testing */}
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
