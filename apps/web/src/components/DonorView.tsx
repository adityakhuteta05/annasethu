import React, { useState } from 'react';
import { 
  Building2, 
  PlusCircle, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Scale, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  KeyRound,
  ExternalLink,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';
import { AnnaSetuApi } from '../api';

interface DonorViewProps {
  donations: any[];
  onRefresh: () => void;
  onViewCertificate: (jobId: string) => void;
}

export const DonorView: React.FC<DonorViewProps> = ({
  donations,
  onRefresh,
  onViewCertificate,
}) => {
  const [showWizard, setShowWizard] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<any>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('GRAINS_RICE');
  const [dietary, setDietary] = useState('VEG');
  const [quantityKg, setQuantityKg] = useState<number>(25);
  const [expiryHours, setExpiryHours] = useState<number>(3.5);
  const [storage, setStorage] = useState('Thermal hot-case maintained (>65°C)');
  const [packaging, setPackaging] = useState('Food-grade sealed thermal carriers');
  const [sealId, setSealId] = useState(`AS-SEAL-${Math.floor(1000 + Math.random() * 9000)}`);
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAiAnalyze = async () => {
    setAiAnalyzing(true);
    try {
      const res = await AnnaSetuApi.analyzeFoodImage(photoUrl, category);
      setAiFeedback(res);
      if (res.suggested_storage && !storage) {
        setStorage(res.suggested_storage);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    // Enforce 5 kg minimum rule per PRD
    if (quantityKg < 5.0) {
      setFormError("Platform Rule Violation: Minimum standard donation quantity is 5.0 kg.");
      return;
    }

    setSubmitting(true);
    try {
      await AnnaSetuApi.createDonation({
        donor_id: 'donor-oberoi',
        title,
        food_category: category,
        dietary_type: dietary,
        quantity_kg: Number(quantityKg),
        prepared_hours_ago: 0.5,
        expiry_hours_from_now: Number(expiryHours),
        storage_condition: storage,
        packaging_type: packaging,
        seal_id: sealId,
        image_url: photoUrl,
      });

      setSuccessMsg(`Surplus food declaration published with Tamper Seal #${sealId}!`);
      setShowWizard(false);
      setTitle('');
      setSealId(`AS-SEAL-${Math.floor(1000 + Math.random() * 9000)}`);
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Failed to publish donation');
    } finally {
      setSubmitting(false);
    }
  };

  const donorDonations = donations.filter((d) => d.donor_id === 'donor-oberoi' || !d.donor_id);
  const activeDonations = donorDonations.filter((d) =>
    ['POSTED', 'MATCHED', 'ALLOCATED', 'PICKED_UP', 'IN_TRANSIT'].includes(d.status)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* DONOR HEADER & IDENTITY */}
      <div className="bg-white rounded-2xl border border-[#E8E1D5] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#143D2B] text-white flex items-center justify-center font-serif text-2xl font-bold shadow-md">
            OG
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-[#143D2B]">
                The Oberoi Grand Kitchens
              </h1>
              <span className="badge-verified">
                <ShieldCheck className="w-3.5 h-3.5 text-[#143D2B]" />
                FSSAI & GST Verified
              </span>
            </div>
            <p className="text-xs text-[#5F6368] mt-1 font-mono">
              FSSAI: 10019011005891 · GSTIN: 07AAAAO1234A1Z5 · Dr Zakir Hussain Marg, New Delhi
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowWizard(!showWizard)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#143D2B] text-white font-semibold text-xs shadow-md hover:bg-[#1E523A] transition-all self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Surplus Food</span>
        </button>
      </div>

      {/* SUCCESS BANNER */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 underline">Dismiss</button>
        </div>
      )}

      {/* METRICS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D5] shadow-xs">
          <div className="flex items-center justify-between text-[#5F6368] text-xs font-semibold uppercase">
            <span>Food Rescued This Month</span>
            <Scale className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <div className="text-3xl font-serif font-bold text-[#143D2B] mt-2">
            1,240 <span className="text-sm font-sans font-medium text-[#5F6368]">kg</span>
          </div>
          <p className="text-[11px] text-[#2D6A4F] font-medium mt-1">↑ 18% from last month</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D5] shadow-xs">
          <div className="flex items-center justify-between text-[#5F6368] text-xs font-semibold uppercase">
            <span>Active Rescues</span>
            <Clock className="w-4 h-4 text-[#E65100]" />
          </div>
          <div className="text-3xl font-serif font-bold text-[#E65100] mt-2">
            {activeDonations.length} <span className="text-sm font-sans font-medium text-[#5F6368]">in progress</span>
          </div>
          <p className="text-[11px] text-[#5F6368] font-medium mt-1">Real-time tracking active</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D5] shadow-xs">
          <div className="flex items-center justify-between text-[#5F6368] text-xs font-semibold uppercase">
            <span>Meals Supported</span>
            <Award className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-3xl font-serif font-bold text-[#143D2B] mt-2">
            2,480 <span className="text-sm font-sans font-medium text-[#5F6368]">meals</span>
          </div>
          <p className="text-[11px] text-[#5F6368] font-medium mt-1">Verified CSR documentation ready</p>
        </div>
      </div>

      {/* POST SURPLUS FOOD WIZARD MODAL */}
      {showWizard && (
        <div className="bg-white rounded-2xl border-2 border-[#143D2B] p-6 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8E1D5] pb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#143D2B]">
                Publish Surplus Food Rescue Declaration
              </h2>
              <p className="text-xs text-[#5F6368]">
                Deterministic server-side validation applies. Minimum donation threshold is 5 kg.
              </p>
            </div>
            <button
              onClick={() => setShowWizard(false)}
              className="text-[#5F6368] hover:text-[#1A1C1E] text-xs font-bold"
            >
              Cancel
            </button>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitDonation} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-1">
                  Surplus Food Description / Menu Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dal Makhani, Steamed Basmati Rice & Naan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8E1D5] text-xs focus:ring-2 focus:ring-[#143D2B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-1">
                  Food Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8E1D5] text-xs focus:ring-2 focus:ring-[#143D2B] focus:outline-none bg-white"
                >
                  <option value="GRAINS_RICE">Grains, Pulao & Rice Dishes</option>
                  <option value="CURRIES_GRAVIES">Curries, Dals & Gravies</option>
                  <option value="BREADS_ROTI">Rotis, Parathas & Breads</option>
                  <option value="PACKAGED_MEALS">Packaged Bento / Combo Meals</option>
                  <option value="DAIRY_SWEETS">Dairy, Desserts & Sweets</option>
                  <option value="SNACKS_SAVORIES">Snacks & Savories</option>
                  <option value="FRESH_PRODUCE">Fresh Cut Fruits & Vegetables</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-1">
                  Dietary Classification *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDietary('VEG')}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      dietary === 'VEG'
                        ? 'bg-[#E8F5E9] text-[#143D2B] border-[#2D6A4F]'
                        : 'bg-white text-[#5F6368] border-[#E8E1D5]'
                    }`}
                  >
                    🟢 Vegetarian
                  </button>
                  <button
                    type="button"
                    onClick={() => setDietary('NON_VEG')}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      dietary === 'NON_VEG'
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-white text-[#5F6368] border-[#E8E1D5]'
                    }`}
                  >
                    🔴 Non-Vegetarian
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-1">
                  Quantity (kg) * <span className="text-[#D9480F] font-bold">[Min 5 kg]</span>
                </label>
                <input
                  type="number"
                  min="5"
                  step="0.5"
                  required
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none ${
                    quantityKg < 5 ? 'border-red-400 bg-red-50' : 'border-[#E8E1D5] focus:ring-2 focus:ring-[#143D2B]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-1">
                  Rescue Window / Deadline (Hours) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  step="0.5"
                  required
                  value={expiryHours}
                  onChange={(e) => setExpiryHours(parseFloat(e.target.value) || 1)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8E1D5] text-xs focus:ring-2 focus:ring-[#143D2B] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-1">
                  Storage Condition
                </label>
                <input
                  type="text"
                  value={storage}
                  onChange={(e) => setStorage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8E1D5] text-xs focus:ring-2 focus:ring-[#143D2B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-1">
                  Packaging Type
                </label>
                <input
                  type="text"
                  value={packaging}
                  onChange={(e) => setPackaging(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8E1D5] text-xs focus:ring-2 focus:ring-[#143D2B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-1">
                  Tamper Seal ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sealId}
                    onChange={(e) => setSealId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E8E1D5] font-mono text-xs focus:ring-2 focus:ring-[#143D2B] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setSealId(`AS-SEAL-${Math.floor(1000 + Math.random() * 9000)}`)}
                    className="px-2.5 py-2 rounded-xl bg-[#F5F0E8] text-[#5F6368] text-xs hover:text-[#1A1C1E]"
                  >
                    Gen
                  </button>
                </div>
              </div>
            </div>

            {/* AI PHOTO ASSISTANT */}
            <div className="p-4 rounded-xl bg-[#F5F0E8]/70 border border-[#E8E1D5] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
                  <span className="text-xs font-semibold text-[#143D2B]">
                    ✦ Assistive Food Vision & Integrity AI (Groq)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAiAnalyze}
                  disabled={aiAnalyzing}
                  className="px-3 py-1 rounded-lg bg-white border border-[#E8E1D5] text-[#2D6A4F] text-xs font-semibold hover:bg-emerald-50 transition-all disabled:opacity-50"
                >
                  {aiAnalyzing ? 'Analyzing Photo...' : 'Analyze Photo'}
                </button>
              </div>

              <input
                type="text"
                placeholder="Food image URL for visual verification"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full px-3.5 py-1.5 rounded-lg border border-[#E8E1D5] text-xs font-mono bg-white focus:outline-none"
              />

              {aiFeedback && (
                <div className="text-xs bg-white p-3 rounded-lg border border-[#E8E1D5] space-y-1">
                  <p className="text-[#143D2B] font-semibold">AI Assistant Assessment:</p>
                  <p className="text-[#5F6368]">{aiFeedback.description}</p>
                  <p className="text-[#2D6A4F] font-medium">Packaging check: {aiFeedback.packaging_check}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowWizard(false)}
                className="px-4 py-2 rounded-xl border border-[#E8E1D5] text-xs font-semibold text-[#5F6368]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-[#143D2B] text-white text-xs font-semibold shadow-md hover:bg-[#1E523A] transition-all disabled:opacity-50"
              >
                {submitting ? 'Committing...' : 'Publish Surplus Declaration'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ACTIVE RESCUES & TRUST CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold text-[#143D2B]">
            Active Surplus Declarations & Rescues
          </h2>
          <span className="text-xs text-[#5F6368]">
            Showing {donorDonations.length} records
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {donorDonations.map((don) => (
            <div
              key={don.id}
              className="bg-white rounded-2xl border border-[#E8E1D5] p-5 shadow-xs hover:border-[#143D2B] transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      don.dietary_type === 'VEG' ? 'bg-[#E8F5E9] text-[#143D2B]' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {don.dietary_type}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F5F0E8] text-[#5F6368]">
                      {don.food_category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                      Seal #{don.seal_id || 'AS-SEAL-8891'}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-[#143D2B] mt-2">
                    {don.title}
                  </h3>
                </div>

                <span className="text-xs font-bold text-[#143D2B] bg-[#F5F0E8] px-2.5 py-1 rounded-full">
                  {don.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-[#5F6368] py-2 border-y border-[#F5F0E8]">
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-[#5F6368]">Declared Quantity</span>
                  <span className="font-semibold text-[#1A1C1E]">{don.quantity_kg} kg</span>
                  <span className="text-[10px] text-[#5F6368]"> ({don.remaining_kg} kg remaining)</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-[#5F6368]">Storage</span>
                  <span className="font-semibold text-[#1A1C1E]">{don.storage_condition || 'Thermal Insulated'}</span>
                </div>
              </div>

              {/* DONOR PICKUP OTP INSTRUCTION CARD */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-amber-900">
                  <KeyRound className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <span className="font-bold">Donor Pickup OTP:</span>
                    <span className="text-[11px] block text-amber-800">
                      Provide to driver only after verifying seal #{don.seal_id || 'AS-SEAL-8891'}.
                    </span>
                  </div>
                </div>
                <div className="px-3 py-1 bg-white rounded-lg border border-amber-300 font-mono font-bold text-amber-900 text-sm tracking-widest shadow-2xs">
                  {/* Pseudo OTP for donor view */}
                  {don.id === 'don-201' ? '482910' : '772914'}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#5F6368] pt-1">
                <span>Created {new Date(don.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {don.status === 'DELIVERED' && (
                  <button
                    onClick={() => onViewCertificate('JOB-HIST-8812')}
                    className="flex items-center gap-1 text-[#2D6A4F] font-semibold hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Sustainability Cert</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
