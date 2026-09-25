'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '../../lib/supabase/client';
import { forgotPasswordSchema } from '../../lib/validations/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);

    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      setFieldError(validation.error.issues[0]?.message || 'Invalid email');
      return;
    }

    setLoading(true);
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${appUrl}/reset-password`,
      });
      // Always show generic success message to prevent user enumeration
      setSubmitted(true);
    } catch {
      // Still show success to prevent account enumeration
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <header className="max-w-md w-full mx-auto py-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>
      </header>

      <div className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white rounded-3xl border-2 border-slate-200 border-slate-200 shadow-lg p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Reset Your Password
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your registered email address to receive secure account recovery instructions.
            </p>
          </div>

          {submitted ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs space-y-3" role="status">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Recovery Instructions Sent</span>
              </div>
              <p className="leading-relaxed">
                If an account exists with <strong>{email}</strong>, you will receive a secure password reset link shortly. Please check your inbox and spam folder.
              </p>
              <Link
                href="/login"
                className="inline-block font-bold text-slate-900 dark:text-[#4f9d3a] underline pt-1"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="reset-email" className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Account Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    aria-invalid={!!fieldError}
                    placeholder="name@organization.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldError) setFieldError(null);
                    }}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs bg-white text-slate-900 dark:text-white focus:outline-none ${
                      fieldError ? 'border-red-400' : 'border-slate-200 border-slate-200 focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                </div>
                {fieldError && (
                  <p className="text-[11px] text-red-600 mt-1" role="alert">
                    {fieldError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold tracking-tight text-sm shadow-md transition-all disabled:opacity-50"
              >
                {loading ? 'Sending Instructions...' : 'Send Password Reset Link'}
              </button>
            </form>
          )}
        </div>
      </div>

      <footer className="max-w-md w-full mx-auto py-3 text-center text-xs text-slate-500">
        AnnaSetu Security · Never shares account existence status
      </footer>
    </main>
  );
}
