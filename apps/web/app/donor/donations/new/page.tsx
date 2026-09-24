'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Utensils,
  Clock,
  Box,
  Camera,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Info,
} from 'lucide-react';

export default function PostSurplusFoodPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Data
  const [formData, setFormData] = useState({
    title: 'Surplus Dal Makhani & Jeera Rice',
    food_category: 'Prepared Meal',
    dietary_type: 'VEG',
    quantity: 25,
    unit: 'kg',
    prepared_hours_ago: 1.0,
    expiry_hours_from_now: 4.0,
    storage_condition: 'Thermal insulated hot-case (>65°C)',
    packaging_type: 'Food-grade sealed containers',
    allergens: 'Dairy (Ghee/Butter)',
    special_handling: 'Keep containers upright during transit',
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    pickup_address: 'The Oberoi Banquet Kitchen Loading Bay, Dr Zakir Hussain Marg, New Delhi',
    latitude: 28.5996,
    longitude: 77.2373,
    pickup_instructions: 'Enter via Gate 3 loading dock. Report to Chef Vikram.',
  });

  // Advisory AI state
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(
    'Assisted Vision: Detected high-volume prepared rice and lentil curries. Recommended storage: Thermal hot-case (>65°C).'
  );
  const [aiAccepted, setAiAccepted] = useState(false);

  const calculateNormalizedKg = () => {
    if (formData.unit === 'kg') return Number(formData.quantity);
    if (formData.unit === 'grams') return Number(formData.quantity) / 1000;
    if (formData.unit === 'litres') return Number(formData.quantity); // approx 1kg = 1L
    if (formData.unit === 'pieces' || formData.unit === 'boxes') return Number(formData.quantity) * 0.4;
    return Number(formData.quantity);
  };

  const normalizedKg = calculateNormalizedKg();
  const isQuantityValid = normalizedKg >= 5.0;

  const handleNext = () => {
    setError(null);
    if (currentStep === 1 && !isQuantityValid) {
      setError('Minimum publishable quantity is 5 kg per AnnaSetu safety & logistics standards.');
      return;
    }
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!isQuantityValid) {
      setError('Minimum publishable quantity is 5.0 kg.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        food_category: formData.food_category,
        dietary_type: formData.dietary_type,
        quantity_kg: normalizedKg,
        quantity_unit: formData.unit,
        prepared_hours_ago: Number(formData.prepared_hours_ago),
        expiry_hours_from_now: Number(formData.expiry_hours_from_now),
        storage_condition: formData.storage_condition,
        packaging_type: formData.packaging_type,
        allergens: formData.allergens,
        special_handling: formData.special_handling,
        pickup_address: formData.pickup_address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        image_url: formData.image_url,
      };

      const res = await fetch('http://localhost:8000/api/v1/donor/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || 'Failed to publish surplus food.');
      }

      const result = await res.json();
      router.push(`/donor/donations/${result.donation_id || 'don-201'}`);
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please check parameters.');
      setLoading(false);
    }
  };

  const triggerAiInspection = () => {
    setAiAnalyzing(true);
    setTimeout(() => {
      setAiAnalyzing(false);
      setAiSuggestion(
        'Assisted Vision: Detected prepared hot meal (Dal/Rice). Thermal packaging verified intact. Suggested category: Prepared Meal.'
      );
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Top Breadcrumb & Heading */}
      <div className="space-y-1">
        <a
          href="/donor/dashboard"
          className="text-xs font-semibold text-[#5c6068] hover:text-[#1f4d36] flex items-center gap-1 inline-flex"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </a>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
          Post Surplus Food
        </h1>
        <p className="text-xs text-[#5c6068]">
          Declare edible food for algorithmic matching with nearby verified hunger-relief centers. Complete in under 60 seconds.
        </p>
      </div>

      {/* 6-Step Visual Progress Bar */}
      <div className="flex items-center justify-between gap-1 p-2 bg-white dark:bg-[#1c2024] rounded-2xl border border-[#e5dec9] dark:border-[#2d3239] shadow-xs">
        {[
          { step: 1, label: 'Food' },
          { step: 2, label: 'Timing' },
          { step: 3, label: 'Storage' },
          { step: 4, label: 'Photo' },
          { step: 5, label: 'Pickup' },
          { step: 6, label: 'Review' },
        ].map((s) => (
          <div
            key={s.step}
            className={`flex-1 text-center py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
              currentStep === s.step
                ? 'bg-[#1f4d36] text-[#f7f1e3] shadow-xs font-bold'
                : currentStep > s.step
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                : 'text-[#5c6068] opacity-60'
            }`}
          >
            <span className="hidden sm:inline">Step {s.step}: </span>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Step Container Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] shadow-xs space-y-6">
        
        {/* STEP 1: FOOD DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
              <h2 className="text-lg font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                Step 1 — Food & Quantity
              </h2>
              <span className="text-xs text-[#5c6068]">Identify category and net weight</span>
            </div>

            <div>
              <label className="text-xs font-bold text-[#23262b] dark:text-[#f7f1e3] block mb-1">
                Food Title / Description *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#1f4d36]"
                placeholder="e.g. Surplus Dal Makhani & Jeera Rice"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#23262b] dark:text-[#f7f1e3] block mb-1">
                  Food Category *
                </label>
                <select
                  value={formData.food_category}
                  onChange={(e) => setFormData({ ...formData, food_category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#1f4d36]"
                >
                  <option value="Prepared Meal">Prepared Meal (Cooked Banquet/Restaurant)</option>
                  <option value="Rice">Grains, Rice & Pulao</option>
                  <option value="Bread/Bakery">Bread, Bakery & Buns</option>
                  <option value="Vegetables">Fresh Cut Vegetables</option>
                  <option value="Fruits">Whole / Sliced Fruits</option>
                  <option value="Packaged Food">Packaged Meal Trays</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#23262b] dark:text-[#f7f1e3] block mb-1">
                  Dietary Classification *
                </label>
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, dietary_type: 'VEG' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      formData.dietary_type === 'VEG'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-[#e5dec9] text-[#5c6068]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    Vegetarian
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, dietary_type: 'NON_VEG' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      formData.dietary_type === 'NON_VEG'
                        ? 'border-red-600 bg-red-50 text-red-800'
                        : 'border-[#e5dec9] text-[#5c6068]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    Non-Vegetarian
                  </button>
                </div>
              </div>
            </div>

            {/* Quantity and Minimum Rule */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-[#23262b] dark:text-[#f7f1e3] block mb-1">
                  Estimated Quantity * (Minimum 5 kg)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] bg-transparent text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#1f4d36]"
                  />
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-28 px-3 py-2.5 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] bg-transparent text-sm font-semibold"
                  >
                    <option value="kg">kg</option>
                    <option value="grams">grams</option>
                    <option value="litres">litres</option>
                    <option value="boxes">boxes</option>
                    <option value="pieces">pieces</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs">
                <span className="text-[11px] text-[#5c6068] block">Normalized Weight:</span>
                <span className={`font-mono font-bold text-sm ${isQuantityValid ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {normalizedKg.toFixed(1)} kg {isQuantityValid ? '✓ Valid' : '✗ Under 5 kg'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Operational standard:</strong> AnnaSetu enforces a 5 kg minimum threshold to ensure volunteer logistics viability and prevent micro-dispatch overhead.
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: FOOD TIMING */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
              <h2 className="text-lg font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                Step 2 — Timings & Rescue Window
              </h2>
              <span className="text-xs text-[#5c6068]">Food preparation age and safe consumption deadline</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#23262b] dark:text-[#f7f1e3] block mb-1">
                  When was this prepared?
                </label>
                <select
                  value={formData.prepared_hours_ago}
                  onChange={(e) => setFormData({ ...formData, prepared_hours_ago: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] bg-transparent text-sm"
                >
                  <option value={0.5}>30 minutes ago (Fresh out of service)</option>
                  <option value={1.0}>1 hour ago (Standard lunch/dinner buffer)</option>
                  <option value={2.0}>2 hours ago</option>
                  <option value={3.0}>3 hours ago</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#23262b] dark:text-[#f7f1e3] block mb-1">
                  Safe Operational Deadline
                </label>
                <select
                  value={formData.expiry_hours_from_now}
                  onChange={(e) => setFormData({ ...formData, expiry_hours_from_now: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] bg-transparent text-sm"
                >
                  <option value={2.0}>In 2 hours (High urgency)</option>
                  <option value={3.5}>In 3.5 hours</option>
                  <option value={4.0}>In 4 hours (Standard cooked food window)</option>
                  <option value={6.0}>In 6 hours</option>
                </select>
              </div>
            </div>

            {/* Real-time Rescue Window Banner */}
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider block">
                Calculated Rescue Window:
              </span>
              <div className="text-2xl font-mono font-bold text-[#1f4d36] dark:text-[#4f9d3a]">
                {String(Math.floor(formData.expiry_hours_from_now)).padStart(2, '0')}:00:00 Remaining
              </div>
              <p className="text-xs text-[#5c6068] dark:text-emerald-300/80">
                AnnaSetu algorithms will reserve a 45-minute safety buffer for transit and quality inspection prior to handoff.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: STORAGE & HANDLING */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
              <h2 className="text-lg font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                Step 3 — Storage & Packaging
              </h2>
              <span className="text-xs text-[#5c6068]">Food safety preservation parameters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#23262b] dark:text-[#f7f1e3] block mb-1">
                  Storage Condition *
                </label>
                <select
                  value={formData.storage_condition}
                  onChange={(e) => setFormData({ ...formData, storage_condition: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] bg-transparent text-sm"
                >
                  <option value="Thermal hot-case (>65°C)">Thermal hot-case (&gt;65°C maintained)</option>
                  <option value="Refrigerated (<5°C)">Refrigerated (&lt;5°C chill)</option>
                  <option value="Ambient dry packaging">Ambient dry packaging</option>
                  <option value="Deep frozen (< -18°C)">Deep frozen (&lt; -18°C)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#23262b] dark:text-[#f7f1e3] block mb-1">
                  Packaging Type *
                </label>
                <select
                  value={formData.packaging_type}
                  onChange={(e) => setFormData({ ...formData, packaging_type: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] bg-transparent text-sm"
                >
                  <option value="Food-grade sealed containers">Food-grade sealed stainless / thermal carriers</option>
                  <option value="Individual tamper-sealed CPET trays">Individual tamper-sealed CPET trays</option>
                  <option value="Sealed corrugated boxes">Sealed corrugated master boxes</option>
                  <option value="Heavy-duty food bags">Heavy-duty food bags</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#23262b] dark:text-[#f7f1e3] block mb-1">
                Known Allergens (Optional)
              </label>
              <input
                type="text"
                value={formData.allergens}
                onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] bg-transparent text-sm"
                placeholder="e.g. Peanuts, Gluten, Dairy"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#23262b] dark:text-[#f7f1e3] block mb-1">
                Special Handling Instructions
              </label>
              <input
                type="text"
                value={formData.special_handling}
                onChange={(e) => setFormData({ ...formData, special_handling: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] bg-transparent text-sm"
                placeholder="e.g. Keep upright, do not stack more than 2 boxes"
              />
            </div>
          </div>
        )}

        {/* STEP 4: IMAGE & ADVISORY AI */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
              <h2 className="text-lg font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                Step 4 — Food Image & Visual Verification
              </h2>
              <span className="text-xs text-[#5c6068]">Assists receiving shelters in meal distribution planning</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-center">
              <div className="w-full sm:w-48 h-36 rounded-2xl overflow-hidden border-2 border-dashed border-[#e5dec9] dark:border-[#2d3239] bg-gray-50 dark:bg-gray-800 flex items-center justify-center relative">
                {formData.image_url ? (
                  <img
                    src={formData.image_url}
                    alt="Food surplus"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-3 text-xs text-[#5c6068]">
                    <Camera className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                    <span>Upload photo</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 text-xs">
                <span className="font-semibold block">Attach Photo Evidence:</span>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] bg-transparent text-xs"
                  placeholder="Image URL or camera upload"
                />
                <button
                  type="button"
                  onClick={triggerAiInspection}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1f4d36] text-[#1f4d36] dark:text-[#4f9d3a] hover:bg-[#1f4d36] hover:text-white font-semibold transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{aiAnalyzing ? 'Analyzing via Groq...' : 'Re-run AI Food Inspection'}</span>
                </button>
              </div>
            </div>

            {/* Advisory AI Panel */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>ADVISORY AI SUGGESTION</span>
              </div>
              <p className="text-xs text-[#5c6068] dark:text-amber-300/90 leading-relaxed">
                "{aiSuggestion}"
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setAiAccepted(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    aiAccepted
                      ? 'bg-emerald-600 text-white'
                      : 'border border-amber-300 dark:border-amber-700 hover:bg-amber-100 text-amber-900 dark:text-amber-200'
                  }`}
                >
                  {aiAccepted ? '✓ Suggestion Adopted' : 'Adopt Suggestion'}
                </button>
                <button
                  type="button"
                  onClick={() => setAiAccepted(false)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold text-[#5c6068] hover:text-[#23262b]"
                >
                  Keep My Input (Sovereign Truth)
                </button>
              </div>
              <span className="text-[10px] text-[#5c6068] block">
                Rule: AnnaSetu AI operates in advisory mode only. Donor structured input is authoritative.
              </span>
            </div>
          </div>
        )}

        {/* STEP 5: PICKUP LOCATION */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
              <h2 className="text-lg font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                Step 5 — Pickup Coordinates & Access
              </h2>
              <span className="text-xs text-[#5c6068]">Driver dock routing and security gate clearance</span>
            </div>

            <div>
              <label className="text-xs font-bold text-[#23262b] dark:text-[#f7f1e3] block mb-1">
                Pickup Address *
              </label>
              <input
                type="text"
                value={formData.pickup_address}
                onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] bg-transparent text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#23262b] dark:text-[#f7f1e3] block mb-1">
                Specific Dock / Kitchen Instructions
              </label>
              <textarea
                rows={2}
                value={formData.pickup_instructions}
                onChange={(e) => setFormData({ ...formData, pickup_instructions: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] bg-transparent text-xs"
                placeholder="Gate code, bay number, duty chef phone"
              />
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#5c6068]">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Geofence GPS Lock: {formData.latitude}, {formData.longitude} (Delhi NCR)</span>
              </div>
              <span className="text-emerald-700 font-semibold">Active Dock Profile</span>
            </div>
          </div>
        )}

        {/* STEP 6: REVIEW & PUBLISH */}
        {currentStep === 6 && (
          <div className="space-y-5">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
              <h2 className="text-lg font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                Step 6 — Final Review & Dispatch
              </h2>
              <span className="text-xs text-[#5c6068]">Confirm food parameters before algorithmic matching</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#f7f1e3]/60 dark:bg-gray-800/40 border border-[#e5dec9] dark:border-gray-800 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                <span className="text-[#5c6068]">Food:</span>
                <span className="font-bold text-[#23262b] dark:text-[#f7f1e3]">{normalizedKg} kg {formData.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                <span className="text-[#5c6068]">Category / Diet:</span>
                <span className="font-semibold text-[#1f4d36] dark:text-[#4f9d3a]">
                  {formData.food_category} ({formData.dietary_type})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                <span className="text-[#5c6068]">Storage & Seal:</span>
                <span className="font-semibold">{formData.storage_condition} · {formData.packaging_type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                <span className="text-[#5c6068]">Pickup Location:</span>
                <span className="font-semibold text-right max-w-xs">{formData.pickup_address}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#5c6068]">Estimated Rescue Window:</span>
                <span className="font-mono font-bold text-[#e0662b]">{formData.expiry_hours_from_now} hours</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Algorithm Commitment:
              </span>
              <p className="text-[11px] opacity-90">
                Clicking Publish immediately dispatches this surplus to nearby verified shelters. When a match is accepted, a delivery mission with dual-OTP handoff will be initiated.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-5 py-2.5 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] text-xs font-semibold text-[#5c6068] hover:bg-gray-50 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : <div />}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-[#1f4d36] text-[#f7f1e3] text-xs font-bold hover:bg-[#163827] flex items-center gap-1.5 shadow-xs"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="px-8 py-3 rounded-2xl bg-[#e0662b] hover:bg-[#c9531d] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <span>{loading ? 'Publishing & Matching...' : 'POST DONATION'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
