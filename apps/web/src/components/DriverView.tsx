import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  KeyRound, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  DollarSign, 
  ArrowRight,
  Sparkles,
  Navigation,
  Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnnaSetuApi } from '../api';

interface DriverViewProps {
  jobs: any[];
  onRefresh: () => void;
  onViewCertificate: (jobId: string) => void;
}

export const DriverView: React.FC<DriverViewProps> = ({
  jobs,
  onRefresh,
  onViewCertificate,
}) => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeJob, setActiveJob] = useState<any | null>(null);
  const [step, setStep] = useState<number>(1); // 1: Accepted/Navigate, 2: Pickup OTP & Photo, 3: In Transit, 4: Delivery OTP & AI Check, 5: Delivered

  // Form Inputs
  const [pickupOtpInput, setPickupOtpInput] = useState('');
  const [deliveryOtpInput, setDeliveryOtpInput] = useState('');
  const [pickupSealInput, setPickupSealInput] = useState('AS-SEAL-8891');
  const [pickupPhotoUrl, setPickupPhotoUrl] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c');
  const [deliveryPhotoUrl, setDeliveryPhotoUrl] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [aiVerdict, setAiVerdict] = useState<any | null>(null);

  // Available jobs for pickup
  const availableJobs = jobs.filter((j) => j.status === 'AVAILABLE');
  const inProgressJob = jobs.find((j) => j.driver_id === 'drv-amit' && j.status !== 'DELIVERED') || activeJob;

  const handleAcceptJob = async (jobId: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await AnnaSetuApi.acceptJob(jobId, 'drv-amit');
      setActiveJob(res.job);
      setStep(1);
      setSuccessMsg(`Rescue job ${jobId} claimed atomically! Proceed to pickup location.`);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to accept job. It may have been claimed by another driver.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPickup = async () => {
    if (!inProgressJob) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await AnnaSetuApi.pickupHandoff(inProgressJob.id, {
        driver_id: 'drv-amit',
        driver_lat: 28.5996,
        driver_lon: 77.2373,
        entered_otp: pickupOtpInput || '482910',
        seal_id: pickupSealInput,
        photo_url: pickupPhotoUrl,
      });

      setActiveJob(res.job);
      setStep(3); // In Transit
      setSuccessMsg("Pickup handoff verified! Goods are secured with tamper seal and in transit.");
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Pickup OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!inProgressJob) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await AnnaSetuApi.deliveryHandoff(inProgressJob.id, {
        driver_id: 'drv-amit',
        driver_lat: 28.6679,
        driver_lon: 77.2285,
        entered_otp: deliveryOtpInput || '918204',
        seal_id: pickupSealInput,
        photo_url: deliveryPhotoUrl,
      });

      setActiveJob(res.job);
      setAiVerdict(res.ai_integrity);
      setStep(5); // Delivered
      setSuccessMsg("Delivery handoff completed! Financial payout and impact record committed.");
      
      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Delivery OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* DRIVER IDENTITY & AVAILABILITY TOGGLE */}
      <div className="bg-white rounded-2xl border border-[#E8E1D5] p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#D9480F] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            AS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#143D2B]">
                Amit Singh
              </h1>
              <span className="badge-verified">
                <ShieldCheck className="w-3 h-3 text-[#143D2B]" />
                DL & RC Verified
              </span>
            </div>
            <p className="text-xs text-[#5F6368] font-mono">
              Vehicle: Commercial Van (DL-1VB-8921) · 98 Deliveries
            </p>
          </div>
        </div>

        {/* Online / Offline switch */}
        <button
          onClick={() => setIsAvailable(!isAvailable)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            isAvailable
              ? 'bg-[#E8F5E9] text-[#143D2B] border-[#A5D6A7]'
              : 'bg-gray-100 text-gray-500 border-gray-300'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
          <span>{isAvailable ? 'Online & Available' : 'Offline'}</span>
        </button>
      </div>

      {/* MILESTONE REWARD TRACKER */}
      <div className="bg-gradient-to-r from-[#143D2B] to-[#2D6A4F] rounded-2xl p-5 text-white shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#F59E0B]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#A5D6A7]">
              Delivery Achievement Milestones
            </span>
          </div>
          <span className="text-xs font-semibold text-[#FEF9E7]">
            98 / 100 Deliveries
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] h-full rounded-full" style={{ width: '98%' }}></div>
        </div>

        <p className="text-xs text-[#E8E1D5]">
          🎯 Complete <strong>2 more rescue deliveries</strong> to unlock the <strong>100th Milestone Bonus (₹1,500 + Certificate)</strong>!
        </p>
      </div>

      {/* STATUS BANNERS */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 underline text-[11px]">Dismiss</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-700 underline text-[11px]">Dismiss</button>
        </div>
      )}

      {/* ACTIVE JOB EXECUTION CARD */}
      {inProgressJob && inProgressJob.status !== 'DELIVERED' ? (
        <div className="bg-white rounded-2xl border-2 border-[#D9480F] p-6 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8E1D5] pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9480F]">
                Active Rescue In Progress
              </span>
              <h2 className="text-base font-bold text-[#143D2B]">
                Rescue Job #{inProgressJob.id}
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFF4E6] text-[#D9480F] border border-[#FFD8A8]">
              {inProgressJob.status}
            </span>
          </div>

          {/* Stepper Progress */}
          <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-semibold">
            <div className={`p-2 rounded-lg border ${step >= 1 ? 'bg-[#143D2B] text-white border-[#143D2B]' : 'bg-gray-100 text-gray-500'}`}>
              1. Claimed
            </div>
            <div className={`p-2 rounded-lg border ${step >= 2 ? 'bg-[#143D2B] text-white border-[#143D2B]' : 'bg-gray-100 text-gray-500'}`}>
              2. Pickup OTP
            </div>
            <div className={`p-2 rounded-lg border ${step >= 3 ? 'bg-[#143D2B] text-white border-[#143D2B]' : 'bg-gray-100 text-gray-500'}`}>
              3. In Transit
            </div>
            <div className={`p-2 rounded-lg border ${step >= 4 ? 'bg-[#143D2B] text-white border-[#143D2B]' : 'bg-gray-100 text-gray-500'}`}>
              4. Deliver OTP
            </div>
          </div>

          {/* ROUTE SUMMARY */}
          <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E8E1D5] space-y-3 text-xs">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#143D2B] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#143D2B]">Pickup: </span>
                <span>{inProgressJob.donor_name} — {inProgressJob.pickup_location.address}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#2D6A4F]">Drop: </span>
                <span>{inProgressJob.stops[0]?.ngo_name} — {inProgressJob.stops[0]?.location.address}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#E8E1D5] font-semibold text-[#5F6368]">
              <span>Payload: {inProgressJob.total_quantity_kg} kg</span>
              <span className="text-[#D9480F]">Guaranteed Earnings: ₹{inProgressJob.fare_quote.driver_payout}</span>
            </div>
          </div>

          {/* STEP 1 & 2: PICKUP HANDOFF */}
          {['ACCEPTED', 'ARRIVING_PICKUP'].includes(inProgressJob.status) && (
            <div className="space-y-4 pt-2">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-600" />
                <span>GPS Geofence: Arrived at donor loading dock (within 120m proximity).</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-1">
                  Enter Donor Pickup OTP * (Ask Donor)
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP (e.g. 482910)"
                  value={pickupOtpInput}
                  onChange={(e) => setPickupOtpInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E1D5] text-center font-mono text-base font-bold tracking-widest focus:ring-2 focus:ring-[#143D2B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1C1E] mb-1">
                    Tamper Seal ID
                  </label>
                  <input
                    type="text"
                    value={pickupSealInput}
                    onChange={(e) => setPickupSealInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E1D5] font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A1C1E] mb-1">
                    Pickup Photo Evidence
                  </label>
                  <input
                    type="text"
                    value={pickupPhotoUrl}
                    onChange={(e) => setPickupPhotoUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E1D5] text-xs font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleConfirmPickup}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#143D2B] text-white font-bold text-xs shadow-md hover:bg-[#1E523A] transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying OTP & Seal...' : 'Verify Pickup & Start Transit'}
              </button>
            </div>
          )}

          {/* STEP 3 & 4: DELIVERY HANDOFF */}
          {inProgressJob.status === 'IN_TRANSIT' && (
            <div className="space-y-4 pt-2">
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-sky-600" />
                <span>GPS Geofence: Arrived at NGO receiving shelter (within 85m proximity).</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-1">
                  Enter NGO Receiving Delivery OTP * (Ask NGO Coordinator)
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP (e.g. 918204)"
                  value={deliveryOtpInput}
                  onChange={(e) => setDeliveryOtpInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E1D5] text-center font-mono text-base font-bold tracking-widest focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-1">
                  Delivery Photo Evidence (Food & Seal)
                </label>
                <input
                  type="text"
                  value={deliveryPhotoUrl}
                  onChange={(e) => setDeliveryPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E1D5] text-xs font-mono"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Groq AI will perform automated visual cross-check with pickup photo for seal integrity.</span>
              </div>

              <button
                onClick={handleConfirmDelivery}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#2D6A4F] text-white font-bold text-xs shadow-md hover:bg-[#1E523A] transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying Delivery & Settling...' : 'Complete Delivery & Collect Earnings'}
              </button>
            </div>
          )}

        </div>
      ) : null}

      {/* COMPLETED DELIVERY CELEBRATION */}
      {step === 5 && (
        <div className="bg-white rounded-2xl border-2 border-emerald-500 p-6 shadow-card text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-[#143D2B]">
            Rescue Delivery Completed!
          </h2>
          <p className="text-xs text-[#5F6368] max-w-md mx-auto">
            Payout has been credited to your driver wallet. Chain-of-custody sealed and verified.
          </p>

          {aiVerdict && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 max-w-md mx-auto text-left">
              <span className="font-bold">Groq AI Visual Integrity Check:</span>
              <p className="text-[11px] text-emerald-800 mt-0.5">{aiVerdict.verdict}: {aiVerdict.reason}</p>
            </div>
          )}

          <button
            onClick={() => {
              setActiveJob(null);
              setStep(1);
            }}
            className="px-6 py-2.5 rounded-xl bg-[#143D2B] text-white text-xs font-semibold"
          >
            Ready for Next Delivery
          </button>
        </div>
      )}

      {/* AVAILABLE JOBS FEED */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#143D2B]">
            Nearby Available Rescue Requests
          </h2>
          <span className="text-xs text-[#5F6368]">
            {availableJobs.length} jobs available
          </span>
        </div>

        {availableJobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E1D5] p-8 text-center text-[#5F6368]">
            <Truck className="w-8 h-8 mx-auto text-[#D9480F] opacity-40 mb-2" />
            <p className="font-semibold text-xs">No pending jobs in your current radius.</p>
            <p className="text-[11px]">New rescue allocations will appear here in real time.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-[#E8E1D5] p-5 shadow-xs hover:border-[#D9480F] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFF4E6] text-[#D9480F]">
                      {job.required_vehicle_class}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F5F0E8] text-[#5F6368]">
                      {job.total_quantity_kg} kg Payload
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800">
                      ~{job.fare_quote.duration_minutes}m Duration
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-[#143D2B]">
                      Pickup: {job.donor_name}
                    </p>
                    <p className="text-[#5F6368]">
                      Drop: {job.stops[0]?.ngo_name} ({job.fare_quote.distance_km} km)
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#F5F0E8]">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-[#5F6368] block">Guaranteed Payout</span>
                    <span className="text-xl font-bold font-mono text-[#D9480F]">
                      ₹{job.fare_quote.driver_payout}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAcceptJob(job.id)}
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-[#D9480F] text-white font-bold text-xs shadow-md hover:bg-[#B83E0D] transition-all disabled:opacity-50"
                  >
                    Accept Job
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
