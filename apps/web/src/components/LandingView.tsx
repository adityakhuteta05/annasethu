import React from 'react';
import { 
  Building2, 
  HeartHandshake, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Scale,
  Award,
  Zap,
  MapPin,
  Clock,
  Droplets,
  Wind
} from 'lucide-react';

interface LandingViewProps {
  onSelectRole: (role: 'DONOR' | 'NGO' | 'DRIVER' | 'ADMIN') => void;
  onRunWalkthrough: () => void;
  impactSummary: any;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onSelectRole,
  onRunWalkthrough,
  impactSummary,
}) => {
  const totalKg = impactSummary?.total_rescued_kg || 1240;
  const totalMeals = impactSummary?.total_meals_supported || 2480;
  const totalCo2 = impactSummary?.total_co2e_prevented_kg || 3100;
  const totalWater = impactSummary?.total_water_conserved_liters || 558000;

  return (
    <div className="space-y-16 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 bg-gradient-to-b from-[#F5F0E8]/70 via-[#FDFBF7] to-[#FDFBF7] border-b border-[#E8E1D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F5E9] border border-[#A5D6A7] text-[#143D2B] text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>Need-Driven Surplus-Food Rescue & Delivery Marketplace</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#143D2B] tracking-tight max-w-4xl mx-auto leading-tight">
            Surplus Food. <br className="hidden sm:inline" />
            <span className="text-[#2D6A4F] italic">Shared With Purpose.</span> Real Impact.
          </h1>

          <p className="text-base sm:text-lg text-[#5F6368] max-w-2xl mx-auto font-normal leading-relaxed">
            <strong className="text-[#1A1C1E] font-semibold">Core Product Thesis:</strong> Food should be rescued because there is a <span className="underline decoration-[#2D6A4F] font-semibold text-[#143D2B]">verified need</span> for it, not simply because someone posted surplus food.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onRunWalkthrough}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#143D2B] to-[#2D6A4F] text-white font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              <Zap className="w-4 h-4 text-[#F59E0B]" />
              <span>Launch Live End-to-End Rescue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectRole('NGO')}
              className="px-6 py-3 rounded-xl bg-white border border-[#E8E1D5] text-[#1A1C1E] font-semibold text-sm hover:bg-[#F5F0E8] transition-all shadow-xs"
            >
              Browse Surplus Food Marketplace
            </button>
          </div>

          {/* REAL-TIME IMPACT TICKER */}
          <div className="pt-10 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D5] shadow-xs text-left">
              <div className="flex items-center justify-between text-[#5F6368] mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Rescued Food</span>
                <Scale className="w-4 h-4 text-[#2D6A4F]" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#143D2B]">
                {totalKg.toLocaleString()} <span className="text-sm font-sans font-medium text-[#5F6368]">kg</span>
              </div>
              <p className="text-[11px] text-[#5F6368] mt-1 font-medium">Verified handoffs completed</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D5] shadow-xs text-left">
              <div className="flex items-center justify-between text-[#5F6368] mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Meals Provided</span>
                <HeartHandshake className="w-4 h-4 text-[#E65100]" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#E65100]">
                {totalMeals.toLocaleString()} <span className="text-sm font-sans font-medium text-[#5F6368]">meals</span>
              </div>
              <p className="text-[11px] text-[#5F6368] mt-1 font-medium">Operational estimate (2.0/kg)</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D5] shadow-xs text-left">
              <div className="flex items-center justify-between text-[#5F6368] mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">CO₂e Abated</span>
                <Wind className="w-4 h-4 text-[#2D6A4F]" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#2D6A4F]">
                {totalCo2.toLocaleString()} <span className="text-sm font-sans font-medium text-[#5F6368]">kg</span>
              </div>
              <p className="text-[11px] text-[#5F6368] mt-1 font-medium">Landfill emission prevention</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E1D5] shadow-xs text-left">
              <div className="flex items-center justify-between text-[#5F6368] mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Water Conserved</span>
                <Droplets className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-sky-700">
                {(totalWater / 1000).toFixed(1)}k <span className="text-sm font-sans font-medium text-[#5F6368]">L</span>
              </div>
              <p className="text-[11px] text-[#5F6368] mt-1 font-medium">Embedded agricultural water</p>
            </div>
          </div>

        </div>
      </section>

      {/* CHOOSE YOUR WORKFLOW ROLE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#143D2B]">
            Four Dedicated Role Portals
          </h2>
          <p className="text-sm text-[#5F6368] mt-2">
            Experience AnnaSetu from the perspective of any verified participant in the rescue lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Donor Card */}
          <div 
            onClick={() => onSelectRole('DONOR')}
            className="group cursor-pointer bg-white rounded-2xl border border-[#E8E1D5] p-6 hover:shadow-card hover:border-[#143D2B] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] text-[#143D2B] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F5F0E8] text-[#5F6368]">
                Food Business
              </span>
              <h3 className="text-lg font-serif font-bold text-[#143D2B] mt-2">
                Food Donor Portal
              </h3>
              <p className="text-xs text-[#5F6368] mt-2 leading-relaxed">
                Post surplus food (≥5 kg min rule), record tamper seals, get AI photo checks, track pickups, and download verified impact documentation.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F5F0E8] flex items-center justify-between text-xs font-semibold text-[#143D2B]">
              <span>Enter as The Oberoi</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* NGO Card */}
          <div 
            onClick={() => onSelectRole('NGO')}
            className="group cursor-pointer bg-white rounded-2xl border border-[#E8E1D5] p-6 hover:shadow-card hover:border-[#2D6A4F] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] text-[#2D6A4F] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2D6A4F]">
                Verified Receiver
              </span>
              <h3 className="text-lg font-serif font-bold text-[#143D2B] mt-2">
                NGO Receiver Portal
              </h3>
              <p className="text-xs text-[#5F6368] mt-2 leading-relaxed">
                Publish meal period needs (breakfast/lunch/dinner), browse ranked matches with Rescue Priority Score (0-100), reserve atomically, and confirm delivery OTP.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F5F0E8] flex items-center justify-between text-xs font-semibold text-[#2D6A4F]">
              <span>Enter as Roti Bank</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Driver Card */}
          <div 
            onClick={() => onSelectRole('DRIVER')}
            className="group cursor-pointer bg-white rounded-2xl border border-[#E8E1D5] p-6 hover:shadow-card hover:border-[#D9480F] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#FFF4E6] text-[#D9480F] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFF4E6] text-[#D9480F]">
                Logistics Partner
              </span>
              <h3 className="text-lg font-serif font-bold text-[#143D2B] mt-2">
                Delivery Partner App
              </h3>
              <p className="text-xs text-[#5F6368] mt-2 leading-relaxed">
                Mobile-first jobs feed, atomic first-accept-wins, GPS geofence checks, pickup & delivery OTP handoffs, and AI seal integrity verification.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F5F0E8] flex items-center justify-between text-xs font-semibold text-[#D9480F]">
              <span>Enter as Amit Singh</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Admin Card */}
          <div 
            onClick={() => onSelectRole('ADMIN')}
            className="group cursor-pointer bg-white rounded-2xl border border-[#E8E1D5] p-6 hover:shadow-card hover:border-[#1A1C1E] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#F5F0E8] text-[#1A1C1E] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F5F0E8] text-[#1A1C1E]">
                Mission Command
              </span>
              <h3 className="text-lg font-serif font-bold text-[#143D2B] mt-2">
                Rescue Command Center
              </h3>
              <p className="text-xs text-[#5F6368] mt-2 leading-relaxed">
                Verify FSSAI/DARPAN with direct official portal lookups, monitor live fleet, resolve AI integrity flags, inspect financial ledger & configure weights.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F5F0E8] flex items-center justify-between text-xs font-semibold text-[#1A1C1E]">
              <span>Open Command Center</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* THE ANNASETU BRIDGE ARCHITECTURE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#143D2B] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-elevated">
          <div className="relative z-10 max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A5D6A7]">
              Engineered For Radical Reliability
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mt-2">
              The 4 Architectural Guarantees of AnnaSetu
            </h2>
            <p className="text-xs sm:text-sm text-[#A5D6A7]/90 mt-3 leading-relaxed">
              Designed around strict engineering boundaries: Algorithms own critical matching and money; AI assists without controlling critical decisions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              <div className="bg-white/10 backdrop-blur-xs p-5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#A5D6A7]" />
                  <span>Deterministic Matching & Scoring</span>
                </div>
                <p className="text-xs text-[#E8E1D5] mt-1.5 leading-relaxed">
                  Rescue Priority Score (0-100) computed from configured weights: Expiry Urgency 30%, ETA 25%, Distance 20%, Need Fulfillment 15%, Route 10%.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#A5D6A7]" />
                  <span>Concurrency-Safe Row Locking</span>
                </div>
                <p className="text-xs text-[#E8E1D5] mt-1.5 leading-relaxed">
                  Atomic reservations prevent over-allocation. Simultaneous 15 kg and 20 kg claims on a 30 kg batch can never both succeed.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#A5D6A7]" />
                  <span>Physical Trust Chain (Hashed OTP)</span>
                </div>
                <p className="text-xs text-[#E8E1D5] mt-1.5 leading-relaxed">
                  Single-use, attempt-limited, short-lived OTPs verified via SHA-256 hashes + GPS geofencing (&lt;300m) + Tamper-evident Seal IDs.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#A5D6A7]" />
                  <span>Transparent Append-Only Finance</span>
                </div>
                <p className="text-xs text-[#E8E1D5] mt-1.5 leading-relaxed">
                  NGO pays only delivery fare + 12% transparent service fee (food is free). Driver payout and platform split commit transactionally upon delivery OTP.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
