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
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5c6068] dark:text-[#a0a5ad] hover:text-[#1f4d36] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>
      </header>

      <div className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white dark:bg-[#1c2024] rounded-3xl border-2 border-[#e5dec9] dark:border-[#2d3239] shadow-lg p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
              Reset Your Password
            </h1>
            <p className="text-xs text-[#5c6068] dark:text-[#a0a5ad]">
              Enter your registered email address. If an account exists, we will dispatch a secure recovery link.
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
                className="inline-block font-bold text-[#1f4d36] dark:text-[#4f9d3a] underline pt-1"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="reset-email" className="block text-xs font-bold text-[#23262b] dark:text-[#f7f1e3] mb-1">
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
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs bg-white dark:bg-[#14171a] text-[#23262b] dark:text-[#f7f1e3] focus:outline-none ${
                      fieldError ? 'border-red-400' : 'border-[#e5dec9] dark:border-[#2d3239] focus:ring-2 focus:ring-[#1f4d36]'
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
                className="w-full py-3 rounded-xl bg-[#1f4d36] hover:bg-[#163827] text-white font-heading font-bold text-sm shadow-md transition-all disabled:opacity-50"
              >
                {loading ? 'Sending Instructions...' : 'Send Password Reset Link'}
              </button>
            </form>
          )}
        </div>
      </div>

      <footer className="max-w-md w-full mx-auto py-3 text-center text-xs text-[#5c6068]">
        AnnaSetu Security · Never shares account existence status
      </footer>
    </main>
  );
}
