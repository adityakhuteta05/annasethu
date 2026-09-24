import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  PlusCircle, 
  Sparkles, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Scale, 
  CheckCircle2, 
  AlertCircle,
  Wallet,
  ArrowRight,
  HelpCircle,
  Info,
  KeyRound,
  FileCheck2
} from 'lucide-react';
import { AnnaSetuApi } from '../api';

interface NGOViewProps {
  needs: any[];
  donations: any[];
  onRefresh: () => void;
  onViewCertificate: (jobId: string) => void;
}

export const NGOView: React.FC<NGOViewProps> = ({
  needs,
  donations,
  onRefresh,
  onViewCertificate,
}) => {
  const [showNeedWizard, setShowNeedWizard] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [proposals, setProposals] = useState<any[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<any | null>(null);
  const [reserving, setReserving] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // New Need Form State
  const [needTitle, setNeedTitle] = useState('');
  const [mealPeriod, setMealPeriod] = useState('DINNER');
  const [dietaryReq, setDietaryReq] = useState('VEG');
  const [requiredKg, setRequiredKg] = useState<number>(20);
  const [minAcceptableKg, setMinAcceptableKg] = useState<number>(5);
  const [hoursFromNow, setHoursFromNow] = useState<number>(3.5);

  const fetchProposals = async () => {
    try {
      const res = await AnnaSetuApi.getMatchProposals();
      setProposals(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [donations, needs]);

  const handleCreateNeed = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      await AnnaSetuApi.createNeed({
        ngo_id: 'ngo-rotibank',
        title: needTitle,
        meal_period: mealPeriod,
        dietary_requirement: dietaryReq,
        required_quantity_kg: Number(requiredKg),
        minimum_acceptable_kg: Number(minAcceptableKg),
        required_by_hours_from_now: Number(hoursFromNow),
        available_capacity_kg: 80.0,
      });

      setActionMsg(`Published structured need: ${needTitle}`);
      setShowNeedWizard(false);
      setNeedTitle('');
      onRefresh();
      fetchProposals();
    } catch (err: any) {
      setActionError(err.message || 'Failed to create need');
    }
  };

  const handleReserveAndAllocate = async (prop: any) => {
    setReserving(true);
    setActionError(null);
    setActionMsg(null);
    try {
      // 1. Concurrency-Safe Atomic Hold
      const resHold = await AnnaSetuApi.reserveFood(
        prop.donation_id,
        prop.need_id,
        prop.allocatable_quantity_kg
      );
      const resId = resHold.reservation.id;

      // 2. Confirm Allocation & Automatically Create Delivery Job
      const resAlloc = await AnnaSetuApi.confirmAllocation(
        prop.donation_id,
        prop.need_id,
        resId
      );

      setActionMsg(
        `Successfully allocated ${prop.allocatable_quantity_kg} kg! Delivery Job ${resAlloc.delivery_job.id} created.`
      );
      setSelectedProposal(null);
      onRefresh();
      fetchProposals();
    } catch (err: any) {
      setActionError(err.message || 'Failed to reserve food');
    } finally {
      setReserving(false);
    }
  };

  const myNeeds = needs.filter((n) => n.ngo_id === 'ngo-rotibank' || !n.ngo_id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* NGO HEADER */}
      <div className="bg-white rounded-2xl border border-[#E8E1D5] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#2D6A4F] text-white flex items-center justify-center font-serif text-2xl font-bold shadow-md">
            RB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-[#143D2B]">
                Delhi Roti Bank Foundation
              </h1>
              <span className="badge-verified">
                <ShieldCheck className="w-3.5 h-3.5 text-[#143D2B]" />
                NGO-DARPAN Verified
              </span>
            </div>
            <p className="text-xs text-[#5F6368] mt-1 font-mono">
              Darpan ID: DL/2021/0291456 · 80G Certified · Kashmere Gate, Delhi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWalletModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F5F0E8] border border-[#E8E1D5] text-[#143D2B] text-xs font-semibold hover:bg-[#E8E1D5] transition-all"
          >
            <Wallet className="w-4 h-4 text-[#2D6A4F]" />
            <span>Wallet: ₹8,500</span>
          </button>

          <button
            onClick={() => setShowNeedWizard(!showNeedWizard)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D6A4F] text-white font-semibold text-xs shadow-md hover:bg-[#1E523A] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish Food Need</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNERS */}
      {actionMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMsg}</span>
          </div>
          <button onClick={() => setActionMsg(null)} className="text-emerald-700 underline">Dismiss</button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-700 underline">Dismiss</button>
        </div>
      )}

      {/* PUBLISH NEED WIZARD MODAL */}
      {showNeedWizard && (
        <div className="bg-white rounded-2xl border-2 border-[#2D6A4F] p-6 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8E1D5] pb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#143D2B]">
                Create Structured Meal Period Requirement
              </h2>
              <p className="text-xs text-[#5F6368]">
                Matched automatically with compatible surplus donors using deterministic rules.
              </p>
            </div>
            <button
              onClick={() => setShowNeedWizard(false)}
              className="text-[#5F6368] hover:text-[#1A1C1E] text-xs font-bold"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateNeed} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-1">
                  Need Title / Target Beneficiaries *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Evening Dinner Meals for 50 Shelter Inmates"
                  value={needTitle}
                  onChange={(e) => setNeedTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8E1D5] text-xs focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-1">
                  Meal Period *
                </label>
                <select
                  value={mealPeriod}
                  onChange={(e) => setMealPeriod(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8E1D5] text-xs focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none bg-white"
                >
                  <option value="BREAKFAST">Breakfast (07:00 - 10:30)</option>
                  <option value="LUNCH">Lunch (11:30 - 15:30)</option>
                  <option value="DINNER">Dinner (18:00 - 22:30)</option>
                  <option value="OTHER">Emergency / Any Time</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-1">
                  Dietary Requirement *
                </label>
                <select
                  value={dietaryReq}
                  onChange={(e) => setDietaryReq(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8E1D5] text-xs focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none bg-white"
                >
                  <option value="VEG">Strict Vegetarian Only</option>
                  <option value="NON_VEG">Non-Vegetarian</option>
                  <option value="ANY">Any (Veg or Non-Veg accepted)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-1">
                  Required Quantity (kg) *
                </label>
                <input
                  type="number"
                  min="5"
                  step="1"
                  required
                  value={requiredKg}
                  onChange={(e) => setRequiredKg(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8E1D5] text-xs focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-1">
                  Required By (Hours from now) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  step="0.5"
                  required
                  value={hoursFromNow}
                  onChange={(e) => setHoursFromNow(parseFloat(e.target.value) || 1)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8E1D5] text-xs focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNeedWizard(false)}
                className="px-4 py-2 rounded-xl border border-[#E8E1D5] text-xs font-semibold text-[#5F6368]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-xs font-semibold shadow-md hover:bg-[#1E523A] transition-all"
              >
                Publish Structured Need
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SURPLUS FOOD MARKETPLACE & DETERMINISTIC RANKING */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#143D2B]">
              Surplus Food Rescue Marketplace
            </h2>
            <p className="text-xs text-[#5F6368]">
              Matches ranked by deterministic <strong>Rescue Priority Score (0-100)</strong>. Food is free; receiver covers logistics fare + 12% service fee.
            </p>
          </div>
          <button
            onClick={fetchProposals}
            className="text-xs font-semibold text-[#2D6A4F] hover:underline"
          >
            Refresh Ranked Matches
          </button>
        </div>

        {proposals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E1D5] p-10 text-center text-[#5F6368] space-y-2">
            <HeartHandshake className="w-10 h-10 mx-auto text-[#2D6A4F] opacity-50" />
            <p className="font-semibold text-sm">No active proposals currently match your criteria.</p>
            <p className="text-xs">Publish a new meal need or check back as donors post surplus batches.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proposals.map((prop, idx) => {
              const score = prop.score || 0;
              const isEligible = prop.eligible;

              return (
                <div
                  key={`${prop.donation_id}-${prop.need_id}-${idx}`}
                  className={`bg-white rounded-2xl border p-5 shadow-xs transition-all space-y-4 ${
                    isEligible
                      ? 'border-[#E8E1D5] hover:border-[#2D6A4F]'
                      : 'border-gray-200 bg-gray-50/50 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E8F5E9] text-[#143D2B]">
                          Donor: {prop.donor_name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F5F0E8] text-[#5F6368]">
                          {prop.distance_km} km away
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700">
                          ETA ~{prop.estimated_eta_minutes}m
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-[#143D2B] mt-2">
                        Allocatable Surplus: {prop.allocatable_quantity_kg} kg
                      </h3>
                    </div>

                    {/* SCORE PILL */}
                    {isEligible ? (
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-gradient-to-r from-[#143D2B] to-[#2D6A4F] text-white shadow-2xs">
                          <span className="text-xs font-semibold uppercase">Score</span>
                          <span className="text-base font-serif font-bold">{score}</span>
                        </div>
                        <span className="text-[10px] text-[#2D6A4F] block mt-0.5 font-bold">
                          {score >= 85 ? '⭐ High Match' : 'Feasible Match'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                        Ineligible
                      </span>
                    )}
                  </div>

                  {/* EXPLAINABLE "WHY THIS MATCH?" SECTION */}
                  {isEligible && prop.breakdown && (
                    <div className="p-3 rounded-xl bg-[#FDFBF7] border border-[#E8E1D5] space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#143D2B] font-bold">
                        <div className="flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-[#2D6A4F]" />
                          <span>Why this match? (Explainable Breakdown)</span>
                        </div>
                        <span className="text-[10px] text-[#5F6368] font-normal">Deterministic factors</span>
                      </div>

                      {/* Factor Curves */}
                      <div className="grid grid-cols-3 gap-2 text-[10px] text-[#5F6368]">
                        <div>
                          <span>Expiry Urgency:</span> <strong className="text-[#1A1C1E]">{prop.breakdown.expiry_urgency}/100</strong>
                        </div>
                        <div>
                          <span>ETA Speed:</span> <strong className="text-[#1A1C1E]">{prop.breakdown.eta_efficiency}/100</strong>
                        </div>
                        <div>
                          <span>Distance:</span> <strong className="text-[#1A1C1E]">{prop.breakdown.distance_efficiency}/100</strong>
                        </div>
                      </div>

                      {/* Reason Bullets */}
                      <ul className="text-[11px] text-[#5F6368] space-y-0.5 list-disc list-inside">
                        {prop.breakdown.reasons.map((r: string, i: number) => (
                          <li key={i} className="text-[#143D2B] font-medium">{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* INELIGIBILITY REASONS */}
                  {!isEligible && prop.rejection_reasons.length > 0 && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 space-y-1">
                      <span className="font-bold block">Eligibility Rejection Reasons:</span>
                      <ul className="list-disc list-inside text-[11px] space-y-0.5">
                        {prop.rejection_reasons.map((rr: string, i: number) => (
                          <li key={i}>{rr}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* LOGISTICS PRICING ESTIMATE */}
                  {isEligible && (
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F5F0E8]">
                      <div>
                        <span className="text-[11px] text-[#5F6368]">Logistics + 12% platform fee: </span>
                        <strong className="text-[#143D2B] font-mono text-sm">~₹380</strong>
                      </div>

                      <button
                        onClick={() => handleReserveAndAllocate(prop)}
                        disabled={reserving}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D6A4F] text-white font-semibold text-xs shadow-xs hover:bg-[#1E523A] transition-all disabled:opacity-50"
                      >
                        <span>Reserve & Dispatch</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RECEIVING CONFIRMATION & NGO DELIVERY OTP CARD */}
      <div className="bg-white rounded-2xl border border-[#E8E1D5] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#143D2B]">
              Active Inbound Rescues & Delivery Confirmation
            </h2>
            <p className="text-xs text-[#5F6368]">
              Verify driver identity and physical tamper seal before sharing receiving OTP.
            </p>
          </div>
          <span className="badge-verified">
            Chain-of-Custody Protected
          </span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <KeyRound className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-emerald-900 block">
                NGO Delivery Confirmation OTP:
              </span>
              <p className="text-[11px] text-emerald-800">
                Share with arriving driver ONLY after inspecting intact container and matching Seal #.
              </p>
            </div>
          </div>
          <div className="px-4 py-2 bg-white rounded-xl border border-emerald-300 font-mono font-bold text-emerald-900 text-lg tracking-widest text-center shadow-xs">
            918204
          </div>
        </div>
      </div>

    </div>
  );
};
