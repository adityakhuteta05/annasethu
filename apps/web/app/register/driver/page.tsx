'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Truck, 
  User, 
  CreditCard, 
  FileText, 
  ShieldCheck, 
  MapPin, 
  Lock, 
  CheckSquare, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Upload, 
  Navigation
} from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';

export default function DriverRegistrationWizard() {
  const router = useRouter();
  const supabase = createClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    fullName: 'Rahul Sharma',
    email: 'rahul.driver@annasetu.org',
    phone: '9811044219',
    dob: '1994-06-15',
    emergencyContactName: 'Ramesh Sharma',
    emergencyContactPhone: '9811033499',

    // Step 2: Identity
    idDocType: 'AADHAAR',
    idNumber: '8841 9920 1145',
    address: 'B-42, Pandav Nagar, New Delhi',
    city: 'New Delhi',
    pincode: '110092',

    // Step 3: Driving Information
    dlNumber: 'DL-1420110098412',
    dlExpiry: '2031-10-18',
    hasCommercialBadge: true,

    // Step 4: Vehicle
    vehicleType: 'VAN', // MOTORCYCLE, SCOOTER, SMALL_VAN, VAN, MINI_TRUCK, TRUCK
    vehicleRegistration: 'DL 1V AC 8412',
    payloadCapacityKg: 250,
    vehicleOwnership: 'OWNED', // OWNED, LEASED, COMPANY_AUTHORIZED

    // Step 5: Compliance
    insurancePolicyNo: 'HDFC-ERGO-COMM-881923',
    insuranceExpiry: '2027-04-15',
    pucNumber: 'PUC-DL-99120',
    pucExpiry: '2026-11-20',
    fitnessExpiry: '2027-08-10',
    permitType: 'COMMERCIAL_NCT_DELHI',

    // Step 6: Preferences
    operatingArea: 'CENTRAL_DELHI',
    preferredShift: 'FLEXIBLE_DAY_NIGHT',
    maxOperationalRangeKm: 20,

    // Step 7: Account
    password: '',
    confirmPassword: '',

    // Step 8: Consent
    agreeCodeOfConduct: true,
    agreeTerms: true,
    agreeBackgroundCheck: true,
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

  const handleNext = () => {
    setErrorMessage(null);

    if (currentStep === 1) {
      if (!formData.fullName || !formData.email || !formData.phone || !formData.emergencyContactPhone) {
        setErrorMessage('Please fill all required personal and emergency contact fields.');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.idNumber || !formData.address || !formData.pincode) {
        setErrorMessage('Please provide identity document and address information.');
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.dlNumber || !formData.dlExpiry) {
        setErrorMessage('Valid driving licence number and expiry date are required.');
        return;
      }
    } else if (currentStep === 4) {
      if (!formData.vehicleRegistration || !formData.payloadCapacityKg) {
        setErrorMessage('Please provide vehicle registration number and payload capacity.');
        return;
      }
    } else if (currentStep === 5) {
      if (!formData.insurancePolicyNo || !formData.pucNumber) {
        setErrorMessage('Vehicle insurance and emission compliance (PUC) are mandatory for food transport.');
        return;
      }
    } else if (currentStep === 7) {
      if (!formData.password || formData.password.length < 8) {
        setErrorMessage('Password must be at least 8 characters long.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
    }

    setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setErrorMessage(null);
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.agreeCodeOfConduct || !formData.agreeTerms || !formData.agreeBackgroundCheck) {
      setErrorMessage('You must review and accept all compliance and safety declarations.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            role: 'DRIVER',
            display_name: formData.fullName,
            full_name: formData.fullName,
            phone: formData.phone,
            verification_status: 'DOCUMENTS_SUBMITTED',
            dl_no: formData.dlNumber,
            vehicle_type: formData.vehicleType,
            rc_no: formData.vehicleRegistration,
          }
        }
      });

      setSuccessMessage('Registration submitted! Redirecting to your compliance status dashboard...');

      setTimeout(() => {
        router.push('/driver/verification?submitted=true');
      }, 1000);

    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating account. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    'Personal',
    'Identity',
    'Licence',
    'Vehicle',
    'Compliance',
    'Zones',
    'Security',
    'Consent'
  ];

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 bg-[#fdfbf7] dark:bg-[#121417]">
      {/* Top Header */}
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between pb-4 border-b border-[#e5dec9] dark:border-[#2d3239]">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-[#e0662b] text-white flex items-center justify-center font-heading text-lg font-bold shadow-sm">
            अ
          </div>
          <div>
            <span className="font-heading font-bold text-lg text-[#1f4d36] dark:text-[#f7f1e3]">
              ANNASETU
            </span>
            <span className="text-[10px] text-[#5c6068] block -mt-1 font-semibold">
              Delivery Partner Onboarding
            </span>
          </div>
        </Link>

        <Link
          href="/login?role=driver"
          className="text-xs font-semibold text-[#e0662b] hover:underline"
        >
          Driver Sign In &rarr;
        </Link>
      </header>

      <div className="max-w-2xl w-full mx-auto py-6 space-y-6">
        
        {/* Step Indicator */}
        <div className="bg-white dark:bg-[#1c2024] p-3.5 rounded-2xl border border-[#e5dec9] dark:border-[#2d3239] shadow-xs">
          <div className="flex items-center justify-between overflow-x-auto pb-1 gap-1">
            {steps.map((title, i) => {
              const num = i + 1;
              const isActive = currentStep === num;
              const isDone = currentStep > num;
              return (
                <div key={title} className="flex flex-col items-center shrink-0 min-w-[50px]">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isActive ? 'bg-[#e0662b] text-white ring-4 ring-[#e0662b]/20 scale-105' :
                    isDone ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'
                  }`}>
                    {isDone ? '✓' : num}
                  </div>
                  <span className="text-[9px] font-semibold text-[#5c6068] mt-1 truncate max-w-[56px] text-center">
                    {title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Card */}
        <div className="bg-white dark:bg-[#1c2024] rounded-3xl border border-[#e5dec9] dark:border-[#2d3239] shadow-md p-6 sm:p-8 space-y-5">
          
          <div className="flex items-center justify-between border-b border-[#e5dec9] dark:border-[#2d3239] pb-3">
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e0662b]/15 text-[#b04513] text-xs font-bold mb-1">
                <span>Step {currentStep} of 8</span>
              </div>
              <h1 className="text-lg font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                {currentStep === 1 && 'STEP 1: Personal & Emergency Contact'}
                {currentStep === 2 && 'STEP 2: Identity & Residence'}
                {currentStep === 3 && 'STEP 3: Driving Licence Information'}
                {currentStep === 4 && 'STEP 4: Transport Vehicle & Capacity'}
                {currentStep === 5 && 'STEP 5: Vehicle Compliance (Insurance & PUC)'}
                {currentStep === 6 && 'STEP 6: Operating Area & Availability'}
                {currentStep === 7 && 'STEP 7: Account Security Credentials'}
                {currentStep === 8 && 'STEP 8: Code of Conduct & Background Consent'}
              </h1>
            </div>
            <Truck className="w-7 h-7 text-[#e0662b] shrink-0" />
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Steps */}
          <div>
            {/* Step 1 */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1f4d36] mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="As shown on Driving Licence"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5dec9] text-xs font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1f4d36] mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="driver@example.com"
                      className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1f4d36] mb-1">Mobile Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="10-digit number"
                      className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1f4d36] mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1f4d36] mb-1">Emergency Contact Phone *</label>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                      required
                      placeholder="Family / Friend contact"
                      className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1f4d36] mb-1">Identity Document Type *</label>
                    <select
                      name="idDocType"
                      value={formData.idDocType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans bg-white"
                    >
                      <option value="AADHAAR">Aadhaar Card</option>
                      <option value="VOTER_ID">Voter ID Card</option>
                      <option value="PASSPORT">Passport</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1f4d36] mb-1">Document Number *</label>
                    <input
                      type="text"
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 8841 9920 1145"
                      className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1f4d36] mb-1">Current Residential Address *</label>
                  <textarea
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="Full street address..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1f4d36] mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1f4d36] mb-1">PIN Code *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1f4d36] mb-1">Driving Licence Number (DL) *</label>
                  <input
                    type="text"
                    name="dlNumber"
                    value={formData.dlNumber}
                    onChange={handleChange}
                    required
                    placeholder="e.g. DL-1420110098412"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5dec9] text-xs font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1f4d36] mb-1">Licence Expiry Date *</label>
                  <input
                    type="date"
                    name="dlExpiry"
                    value={formData.dlExpiry}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans"
                  />
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-[#e5dec9] text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasCommercialBadge"
                      checked={formData.hasCommercialBadge}
                      onChange={handleChange}
                      className="rounded border-[#e5dec9] text-[#e0662b] focus:ring-[#e0662b]"
                    />
                    <span className="font-bold text-[#1f4d36]">Commercial Transport Endorsement / Badge Present</span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 4 */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1f4d36] mb-1">Vehicle Classification *</label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5dec9] text-xs font-sans bg-white font-bold"
                  >
                    <option value="MOTORCYCLE">Motorcycle with Delivery Bag (Up to 15 kg)</option>
                    <option value="SCOOTER">Electric / Petrol Scooter (Up to 25 kg)</option>
                    <option value="SMALL_VAN">Small Commercial Van / E-Rickshaw (Up to 100 kg)</option>
                    <option value="VAN">Cargo Van / Maruti Eeco (Up to 250 kg)</option>
                    <option value="MINI_TRUCK">Mini Truck / Tata Ace (Up to 600 kg)</option>
                    <option value="TRUCK">Insulated Closed Truck (600 kg+)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1f4d36] mb-1">Vehicle Registration (RC) *</label>
                    <input
                      type="text"
                      name="vehicleRegistration"
                      value={formData.vehicleRegistration}
                      onChange={handleChange}
                      required
                      placeholder="e.g. DL 1V AC 8412"
                      className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-mono uppercase font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1f4d36] mb-1">Rated Payload Capacity (kg) *</label>
                    <input
                      type="number"
                      name="payloadCapacityKg"
                      value={formData.payloadCapacityKg}
                      onChange={handleChange}
                      min={10}
                      className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1f4d36] mb-1">Vehicle Ownership Status *</label>
                  <select
                    name="vehicleOwnership"
                    value={formData.vehicleOwnership}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans bg-white"
                  >
                    <option value="OWNED">Directly Owned by Driver</option>
                    <option value="COMPANY_AUTHORIZED">Authorized by Fleet Company / Lease</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 5 */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1f4d36] mb-1">Insurance Policy Number *</label>
                    <input
                      type="text"
                      name="insurancePolicyNo"
                      value={formData.insurancePolicyNo}
                      onChange={handleChange}
                      required
                      placeholder="Commercial vehicle policy"
                      className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1f4d36] mb-1">Insurance Expiry Date *</label>
                    <input
                      type="date"
                      name="insuranceExpiry"
                      value={formData.insuranceExpiry}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1f4d36] mb-1">Pollution (PUC) Number *</label>
                    <input
                      type="text"
                      name="pucNumber"
                      value={formData.pucNumber}
                      onChange={handleChange}
                      required
                      placeholder="PUC certificate number"
                      className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1f4d36] mb-1">PUC Valid Until *</label>
                    <input
                      type="date"
                      name="pucExpiry"
                      value={formData.pucExpiry}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1f4d36] mb-1">Vehicle Fitness Expiry Date</label>
                  <input
                    type="date"
                    name="fitnessExpiry"
                    value={formData.fitnessExpiry}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans"
                  />
                </div>
              </div>
            )}

            {/* Step 6 */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1f4d36] mb-1">Preferred Operating Zone *</label>
                  <select
                    name="operatingArea"
                    value={formData.operatingArea}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5dec9] text-xs font-sans bg-white font-bold"
                  >
                    <option value="CENTRAL_DELHI">Central Delhi (CP, Barakhamba, Paharganj)</option>
                    <option value="SOUTH_DELHI">South Delhi (Lajpat Nagar, Saket, Okhla)</option>
                    <option value="NORTH_DELHI">North Delhi (Kashmere Gate, Civil Lines)</option>
                    <option value="ALL_NCR">All Delhi NCR Radius</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1f4d36] mb-1">Max Operational Radius (km)</label>
                    <input
                      type="number"
                      name="maxOperationalRangeKm"
                      value={formData.maxOperationalRangeKm}
                      onChange={handleChange}
                      min={5}
                      max={50}
                      className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1f4d36] mb-1">Preferred Duty Shift</label>
                    <select
                      name="preferredShift"
                      value={formData.preferredShift}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans bg-white"
                    >
                      <option value="FLEXIBLE_DAY_NIGHT">Any Time (High Surge Offers)</option>
                      <option value="DAY_ONLY">Day Only (08:00 AM – 06:00 PM)</option>
                      <option value="EVENING_ONLY">Evening & Banquets (06:00 PM – 02:00 AM)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 7 */}
            {currentStep === 7 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1f4d36] mb-1">Driver Login Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3.5 py-2 rounded-xl border border-[#e5dec9] text-xs font-sans bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1f4d36] mb-1">Create Secret Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Minimum 8 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5dec9] text-xs font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1f4d36] mb-1">Confirm Secret Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Repeat password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5dec9] text-xs font-sans"
                  />
                </div>
              </div>
            )}

            {/* Step 8 */}
            {currentStep === 8 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 text-xs">
                  <strong>Driver Responsibility:</strong> Delivery partners are critical custodians in the cold and thermal food chain. Handoffs require photographic proof, tamper seal inspection, and recipient OTP verification.
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreeCodeOfConduct"
                      checked={formData.agreeCodeOfConduct}
                      onChange={handleChange}
                      className="mt-0.5 rounded border-[#e5dec9] text-[#e0662b] focus:ring-[#e0662b]"
                    />
                    <span className="text-xs text-[#23262b]">
                      I agree to the AnnaSetu Driver Code of Conduct, including thermal insulation standards and zero-tampering integrity.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="mt-0.5 rounded border-[#e5dec9] text-[#e0662b] focus:ring-[#e0662b]"
                    />
                    <span className="text-xs text-[#23262b]">
                      I agree to the Terms of Logistics Partnership and transparent fare structure rules.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreeBackgroundCheck"
                      checked={formData.agreeBackgroundCheck}
                      onChange={handleChange}
                      className="mt-0.5 rounded border-[#e5dec9] text-[#e0662b] focus:ring-[#e0662b]"
                    />
                    <span className="text-xs text-[#23262b]">
                      I consent to identity, licence, and Parivahan vehicle registration checks by platform administrators.
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-5 border-t border-[#e5dec9]">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 rounded-xl border border-[#e5dec9] text-xs font-bold text-[#5c6068] hover:bg-gray-50 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <Link href="/register" className="text-xs font-bold text-[#5c6068] hover:text-[#1f4d36]">
                &larr; Roles
              </Link>
            )}

            {currentStep < 8 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-[#e0662b] hover:bg-[#c2511d] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <span>Continue &rarr;</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-[#e0662b] hover:bg-[#c2511d] text-white text-xs font-bold flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {loading ? 'Submitting Driver File...' : 'SUBMIT DRIVER APPLICATION'}
              </button>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
