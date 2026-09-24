'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Clock 
} from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';

export default function DonorRegistrationWizard() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    businessName: 'The Grand Palace Hotel & Banquet',
    businessType: 'HOTEL_BANQUET',
    fssaiLicence: '10019011005891',
    gstin: '07AAAAO1234A1Z5',
    authorizedPerson: 'Vikramaditya Roy',
    phone: '9811012345',
    email: 'thegrandpalace@annasetu.org',
    address: 'Dr Zakir Hussain Marg, Delhi Golf Club Area, New Delhi',
    city: 'New Delhi',
    pincode: '110003',
    password: '',
    confirmPassword: '',
    agreeTerms: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            role: 'DONOR',
            display_name: formData.businessName,
            business_name: formData.businessName,
            phone: formData.phone,
            fssai_no: formData.fssaiLicence,
            gstin: formData.gstin,
            verification_status: 'VERIFIED'
          }
        }
      });

      router.push('/donor/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating donor account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 bg-[#fdfbf7] dark:bg-[#121417]">
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between pb-4 border-b border-[#e5dec9]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#1f4d36] text-[#f7f1e3] flex items-center justify-center font-heading text-lg font-bold">
            अ
          </div>
          <div>
            <span className="font-heading font-bold text-lg text-[#1f4d36] dark:text-[#f7f1e3]">
              ANNASETU
            </span>
            <span className="text-[10px] text-[#5c6068] block -mt-1 font-semibold">
              Food Donor Registration
            </span>
          </div>
        </Link>
        <Link href="/login?role=donor" className="text-xs font-semibold text-[#1f4d36] hover:underline">
          Sign In &rarr;
        </Link>
      </header>

      <div className="max-w-xl w-full mx-auto py-8">
        <div className="bg-white dark:bg-[#1c2024] rounded-3xl border border-[#e5dec9] dark:border-[#2d3239] shadow-md p-6 sm:p-8 space-y-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1f4d36]/10 text-[#1f4d36] text-xs font-bold mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>Food Business Onboarding</span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
              Register Your Business
            </h1>
            <p className="text-xs text-[#5c6068] dark:text-[#a0a5ad] mt-1">
              Begin scheduling temperature-verified pickups and generating tax exemption certificates.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1f4d36] mb-1">Business / Brand Name *</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-[#e5dec9] text-xs font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1f4d36] mb-1">Business Type *</label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans bg-white"
                >
                  <option value="HOTEL_BANQUET">Hotel & Banquets</option>
                  <option value="RESTAURANT">Restaurant / Cafe</option>
                  <option value="CLOUD_KITCHEN">Cloud Kitchen</option>
                  <option value="CATERER">Event Caterer</option>
                  <option value="SUPERMARKET">Supermarket / Retail</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1f4d36] mb-1">FSSAI Licence Number *</label>
                <input
                  type="text"
                  name="fssaiLicence"
                  value={formData.fssaiLicence}
                  onChange={handleChange}
                  required
                  placeholder="14-digit FSSAI"
                  className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1f4d36] mb-1">GSTIN *</label>
                <input
                  type="text"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  required
                  placeholder="15-digit GSTIN"
                  className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1f4d36] mb-1">Authorized Head Chef / Manager *</label>
                <input
                  type="text"
                  name="authorizedPerson"
                  value={formData.authorizedPerson}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1f4d36] mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1f4d36] mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1f4d36] mb-1">Pickup Dock Address *</label>
              <textarea
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1f4d36] mb-1">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Min 8 characters"
                  className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1f4d36] mb-1">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#1f4d36] hover:bg-[#163827] text-[#f7f1e3] font-bold text-xs flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Business Account...' : 'REGISTER & OPEN DONOR DASHBOARD'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
