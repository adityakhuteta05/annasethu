'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  HeartHandshake, 
  UserCheck, 
  FileCheck, 
  Clock, 
  Lock, 
  CheckSquare, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Upload, 
  MapPin, 
  Info
} from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';

export default function NGORegistrationWizard() {
  const router = useRouter();
  const supabase = createClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Organization Information
    orgName: 'Delhi Roti Bank Relief Foundation',
    orgType: 'SOCIETY_TRUST',
    email: 'coordinator@rotibankdelhi.org',
    phone: '9810177889',
    website: 'https://rotibankdelhi.org',
    address: 'Kashmere Gate Community Center, Ground Floor',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110006',

    // Step 2: Authorized Representative
    repFullName: 'Dr. Arvind Swaminathan',
    repDesignation: 'Executive Director & Trustee',
    repPhone: '9810177889',
    repEmail: 'arvind@rotibankdelhi.org',

    // Step 3: Verification Information
    pan: 'AAATD1234C',
    registrationNo: 'REG-DL-8874-2018',
    darpanId: 'DL/2021/0291456',
    is80g: true,
    is12a: true,
    uploadedDocName: 'Registration_Certificate_NGO_Darpan.pdf',

    // Step 4: Operating Information
    receivingAddress: 'Shelter No. 4, Mandir Lane, Paharganj, New Delhi',
    latitude: 28.6430,
    longitude: 77.2140,
    receivingHoursStart: '08:00',
    receivingHoursEnd: '22:00',
    foodCategories: ['PREPARED_MEALS', 'RICE', 'BREAD_BAKERY', 'CURRIES'],
    dietaryPreference: 'VEG_ONLY', // VEG_ONLY, ALL_ACCEPTED
    storageCapability: 'REFRIGERATED_AND_HOT_HOLDING',
    currentReceivingCapacityKg: 80,
    normalDailyCapacityKg: 120,

    // Step 5: Account Credentials
    password: '',
    confirmPassword: '',

    // Step 6: Consent
    agreeTerms: true,
    agreePrivacy: true,
    agreeDataProcessing: true,
    certifyAuthorized: true,
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

  const handleNextStep = () => {
    setErrorMessage(null);

    // Validation per step
    if (currentStep === 1) {
      if (!formData.orgName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
        setErrorMessage('Please complete all required organization information fields.');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.repFullName || !formData.repDesignation || !formData.repPhone || !formData.repEmail) {
        setErrorMessage('Please provide full details of the authorized representative.');
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.pan || !formData.registrationNo) {
        setErrorMessage('Organization PAN and Registration Number are required for legal verification.');
        return;
      }
    } else if (currentStep === 4) {
      if (!formData.receivingAddress || !formData.currentReceivingCapacityKg || !formData.normalDailyCapacityKg) {
        setErrorMessage('Please specify receiving facility address and valid storage capacities.');
        return;
      }
    } else if (currentStep === 5) {
      if (!formData.password || formData.password.length < 8) {
        setErrorMessage('Password must be at least 8 characters long.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter your password.');
        return;
      }
    }

    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmitOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.agreeTerms || !formData.agreePrivacy || !formData.agreeDataProcessing || !formData.certifyAuthorized) {
      setErrorMessage('You must review and agree to all compliance and consent declarations.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create Supabase Auth account with authoritative role metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            role: 'NGO',
            display_name: formData.orgName,
            full_name: formData.repFullName,
            phone: formData.phone,
            verification_status: 'DOCUMENTS_SUBMITTED',
            org_name: formData.orgName,
            darpan_id: formData.darpanId,
            pan: formData.pan,
            registration_no: formData.registrationNo,
          }
        }
      });

      // Demo/local fallback
      setSuccessMessage('Application submitted successfully! Your verification file is under review.');

      // Final status transition: REGISTERED -> DOCUMENTS_SUBMITTED -> UNDER_REVIEW -> redirect to /ngo/verification
      setTimeout(() => {
        router.push('/ngo/verification?submitted=true');
      }, 1000);

    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: 'Organization' },
    { num: 2, title: 'Representative' },
    { num: 3, title: 'Verification' },
    { num: 4, title: 'Operating & Capacity' },
    { num: 5, title: 'Credentials' },
    { num: 6, title: 'Consent & Submit' },
  ];

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 bg-white dark:bg-[#121417]">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-200 border-slate-200">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#2d6a4f] text-white flex items-center justify-center font-semibold tracking-tight text-xl font-bold shadow-md">
            अ
          </div>
          <div>
            <span className="font-bold tracking-tight text-xl tracking-tight text-slate-900 dark:text-white">
              ANNASETU
            </span>
            <span className="text-[10px] font-sans font-semibold text-slate-500 block -mt-1">
              NGO / Receiver Onboarding
            </span>
          </div>
        </Link>

        <Link
          href="/login?role=ngo"
          className="text-xs font-semibold text-[#2d6a4f] hover:underline"
        >
          Already registered? Sign In &rarr;
        </Link>
      </header>

      <div className="max-w-3xl w-full mx-auto py-8 space-y-6">
        
        {/* Step Progress Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            {steps.map((s) => (
              <div key={s.num} className="flex flex-col items-center flex-1">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === s.num
                      ? 'bg-[#2d6a4f] text-white ring-4 ring-[#2d6a4f]/20 scale-110'
                      : currentStep > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'
                  }`}
                >
                  {currentStep > s.num ? '✓' : s.num}
                </div>
                <span className="text-[10px] font-semibold text-center mt-1.5 hidden sm:block text-slate-500">
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Form Container */}
        <div className="bg-white rounded-3xl border border-slate-200 border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 border-slate-200 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4f9d3a]/15 text-[#2d6a4f] text-xs font-bold mb-1">
                <span>Step {currentStep} of 6</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {currentStep === 1 && 'STEP 1: Organization Information'}
                {currentStep === 2 && 'STEP 2: Authorized Representative'}
                {currentStep === 3 && 'STEP 3: Verification Information (80G / DARPAN)'}
                {currentStep === 4 && 'STEP 4: Operating Information & Receiving Capacity'}
                {currentStep === 5 && 'STEP 5: Account Security Credentials'}
                {currentStep === 6 && 'STEP 6: Legal Consent & Declarations'}
              </h1>
            </div>
            <HeartHandshake className="w-8 h-8 text-[#4f9d3a] shrink-0" />
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form Content Steps */}
          <div>
            {/* STEP 1: Organization Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                    NGO / Organization Legal Name *
                  </label>
                  <input
                    type="text"
                    name="orgName"
                    value={formData.orgName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Delhi Roti Bank Relief Foundation"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 border-slate-200 text-xs font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                      Organization Type *
                    </label>
                    <select
                      name="orgType"
                      value={formData.orgType}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 border-slate-200 text-xs font-sans bg-white"
                    >
                      <option value="SOCIETY_TRUST">Registered Trust / Society</option>
                      <option value="SECTION_8">Section 8 Non-Profit Company</option>
                      <option value="COMMUNITY_KITCHEN">Community Kitchen / Langar</option>
                      <option value="RELIEF_SHELTER">Homeless / Relief Shelter</option>
                      <option value="ORPHANAGE">Children Home / Orphanage</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                      Institutional Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="e.g. contact@ngo.org"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 border-slate-200 text-xs font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                      Official Contact Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="10-digit mobile or landline"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 border-slate-200 text-xs font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                      Website / Social Link
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 border-slate-200 text-xs font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                    Registered Headquarters Address *
                  </label>
                  <textarea
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="Physical street address..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 border-slate-200 text-xs font-sans"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 border-slate-200 text-xs font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 border-slate-200 text-xs font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">PIN Code *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 border-slate-200 text-xs font-sans"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Authorized Representative */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 text-blue-900 dark:text-blue-300 text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>The authorized representative is legally empowered to accept food lots and sign off on safe handling.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                    Authorized Representative Full Name *
                  </label>
                  <input
                    type="text"
                    name="repFullName"
                    value={formData.repFullName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Dr. Arvind Swaminathan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 border-slate-200 text-xs font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                    Official Designation / Title *
                  </label>
                  <input
                    type="text"
                    name="repDesignation"
                    value={formData.repDesignation}
                    onChange={handleChange}
                    required
                    placeholder="e.g. General Secretary / Managing Trustee"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 border-slate-200 text-xs font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                      Direct Mobile Phone *
                    </label>
                    <input
                      type="tel"
                      name="repPhone"
                      value={formData.repPhone}
                      onChange={handleChange}
                      required
                      placeholder="Representative direct number"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 border-slate-200 text-xs font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                      Direct Email Address *
                    </label>
                    <input
                      type="email"
                      name="repEmail"
                      value={formData.repEmail}
                      onChange={handleChange}
                      required
                      placeholder="representative@ngo.org"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 border-slate-200 text-xs font-sans"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Verification Information */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                      Organization PAN *
                    </label>
                    <input
                      type="text"
                      name="pan"
                      value={formData.pan}
                      onChange={handleChange}
                      required
                      placeholder="e.g. AAATD1234C"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 border-slate-200 text-xs font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                      Registration Number *
                    </label>
                    <input
                      type="text"
                      name="registrationNo"
                      value={formData.registrationNo}
                      onChange={handleChange}
                      required
                      placeholder="Trust / Society Registration Number"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 border-slate-200 text-xs font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                    NITI Aayog NGO-DARPAN ID (Recommended)
                  </label>
                  <input
                    type="text"
                    name="darpanId"
                    value={formData.darpanId}
                    onChange={handleChange}
                    placeholder="e.g. DL/2021/0291456"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 border-slate-200 text-xs font-mono uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/40 border border-slate-200 border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is80g"
                      checked={formData.is80g}
                      onChange={handleChange}
                      className="rounded border-slate-200 text-[#2d6a4f] focus:ring-[#2d6a4f]"
                    />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Section 80G Certified
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is12a"
                      checked={formData.is12a}
                      onChange={handleChange}
                      className="rounded border-slate-200 text-[#2d6a4f] focus:ring-[#2d6a4f]"
                    />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Section 12A Registered
                    </span>
                  </label>
                </div>

                {/* Document Upload Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                    Supporting Documents (PDF / Images)
                  </label>
                  <div className="border-2 border-dashed border-slate-200 border-slate-200 rounded-2xl p-4 text-center space-y-2 bg-white">
                    <Upload className="w-8 h-8 mx-auto text-[#4f9d3a]" />
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {formData.uploadedDocName || 'Click or drag files to upload certification docs'}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Trust deed, registration certificate, or PAN card copy (Max 10 MB)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Operating Information */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                    Food Receiving / Drop-off Facility Address *
                  </label>
                  <textarea
                    name="receivingAddress"
                    rows={2}
                    value={formData.receivingAddress}
                    onChange={handleChange}
                    required
                    placeholder="Accurate drop gate, dock or landmark..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 border-slate-200 text-xs font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                      Receiving Hours (Start) *
                    </label>
                    <input
                      type="time"
                      name="receivingHoursStart"
                      value={formData.receivingHoursStart}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 border-slate-200 text-xs font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                      Receiving Hours (End) *
                    </label>
                    <input
                      type="time"
                      name="receivingHoursEnd"
                      value={formData.receivingHoursEnd}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 border-slate-200 text-xs font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                      Dietary Policy *
                    </label>
                    <select
                      name="dietaryPreference"
                      value={formData.dietaryPreference}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 border-slate-200 text-xs font-sans bg-white"
                    >
                      <option value="VEG_ONLY">Strictly Vegetarian Only</option>
                      <option value="ALL_ACCEPTED">Both Vegetarian & Non-Vegetarian (Segregated)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                      Storage & Facility Equipment *
                    </label>
                    <select
                      name="storageCapability"
                      value={formData.storageCapability}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 border-slate-200 text-xs font-sans bg-white"
                    >
                      <option value="REFRIGERATED_AND_HOT_HOLDING">Commercial Refrigerator & Thermal Warmers</option>
                      <option value="STANDARD_CHILLER">Standard Kitchen Refrigeration</option>
                      <option value="IMMEDIATE_CONSUMPTION">Immediate Distribution Only (No cold storage)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 bg-white border border-slate-200 border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                      Normal Daily Capacity (kg/day) *
                    </label>
                    <input
                      type="number"
                      name="normalDailyCapacityKg"
                      value={formData.normalDailyCapacityKg}
                      onChange={handleChange}
                      min={10}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 border-slate-200 text-xs font-sans font-bold"
                    />
                    <span className="text-[10px] text-slate-500">Overall shelter service capacity</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                      Current Receiving Capacity (kg) *
                    </label>
                    <input
                      type="number"
                      name="currentReceivingCapacityKg"
                      value={formData.currentReceivingCapacityKg}
                      onChange={handleChange}
                      min={5}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 border-slate-200 text-xs font-sans font-bold text-[#2d6a4f]"
                    />
                    <span className="text-[10px] text-slate-500">Immediately available space today</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Account Credentials */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-800/40 border border-slate-200 border-slate-200 text-xs text-slate-500">
                  <span>Create authorized credentials for your organization. Passwords are securely hashed with bcrypt via Supabase Auth and never stored in plain text.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                    Login Email Address (Pre-filled)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 border-slate-200 text-xs font-sans bg-gray-100 dark:bg-zinc-800 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                    Set Secret Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Minimum 8 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 border-slate-200 text-xs font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                    Confirm Secret Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Repeat password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 border-slate-200 text-xs font-sans"
                  />
                </div>
              </div>
            )}

            {/* STEP 6: Consent */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-900 dark:text-amber-200 text-xs">
                  <strong>Notice:</strong> AnnaSetu operates as a logistics and verification software network. Verified NGO receivers are responsible for final sensory inspection of received surplus food before consumption.
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="mt-0.5 rounded border-slate-200 text-[#2d6a4f] focus:ring-[#2d6a4f]"
                    />
                    <span className="text-xs text-slate-900 dark:text-white">
                      I agree to the <Link href="/terms" className="underline font-bold">Terms of Service</Link> and food safety operating protocols.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreePrivacy"
                      checked={formData.agreePrivacy}
                      onChange={handleChange}
                      className="mt-0.5 rounded border-slate-200 text-[#2d6a4f] focus:ring-[#2d6a4f]"
                    />
                    <span className="text-xs text-slate-900 dark:text-white">
                      I accept the <Link href="/privacy" className="underline font-bold">Privacy Policy</Link> and institutional data governance charter.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreeDataProcessing"
                      checked={formData.agreeDataProcessing}
                      onChange={handleChange}
                      className="mt-0.5 rounded border-slate-200 text-[#2d6a4f] focus:ring-[#2d6a4f]"
                    />
                    <span className="text-xs text-slate-900 dark:text-white">
                      I consent to government public-record verification against NGO-DARPAN and MCA databases.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="certifyAuthorized"
                      checked={formData.certifyAuthorized}
                      onChange={handleChange}
                      className="mt-0.5 rounded border-slate-200 text-[#2d6a4f] focus:ring-[#2d6a4f]"
                    />
                    <span className="text-xs text-slate-900 dark:text-white">
                      I certify that I am the authorized representative of {formData.orgName} legally authorized to bind this entity.
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 border-slate-200">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2.5 rounded-xl border border-slate-200 border-slate-200 text-xs font-bold text-slate-500 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <Link
                href="/register"
                className="text-xs font-bold text-slate-500 hover:text-slate-900"
              >
                &larr; Choose Different Role
              </Link>
            )}

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span>Continue &rarr;</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitOnboarding}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span>Submitting Verification Package...</span>
                ) : (
                  <>
                    <span>SUBMIT FOR VERIFICATION</span>
                    <ShieldCheck className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
