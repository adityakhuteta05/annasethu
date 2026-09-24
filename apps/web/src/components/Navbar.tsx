import React from 'react';
import { 
  Building2, 
  HeartHandshake, 
  Truck, 
  ShieldCheck, 
  Globe, 
  PlayCircle, 
  RotateCcw,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  currentRole: 'LANDING' | 'DONOR' | 'NGO' | 'DRIVER' | 'ADMIN';
  onRoleChange: (role: 'LANDING' | 'DONOR' | 'NGO' | 'DRIVER' | 'ADMIN') => void;
  onRunWalkthrough: () => void;
  onResetEnv: () => void;
  isBackendHealthy: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  onRunWalkthrough,
  onResetEnv,
  isBackendHealthy,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E8E1D5] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => onRoleChange('LANDING')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#143D2B] to-[#2D6A4F] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <span className="font-serif font-bold text-xl tracking-tight">अ</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xl tracking-wide text-[#143D2B]">
                  ANNASETU
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#143D2B] border border-[#A5D6A7]">
                  अन्नसेतु
                </span>
              </div>
              <p className="text-[11px] text-[#5F6368] font-medium tracking-tight">
                Surplus Food · Shared With Purpose · Real Impact
              </p>
            </div>
          </div>

          {/* Role Navigation Pills */}
          <nav className="hidden md:flex items-center p-1 bg-[#F5F0E8] rounded-xl border border-[#E8E1D5]">
            <button
              onClick={() => onRoleChange('LANDING')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'LANDING'
                  ? 'bg-white text-[#143D2B] shadow-xs'
                  : 'text-[#5F6368] hover:text-[#1A1C1E]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Public Overview</span>
            </button>

            <button
              onClick={() => onRoleChange('DONOR')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'DONOR'
                  ? 'bg-[#143D2B] text-white shadow-xs'
                  : 'text-[#5F6368] hover:text-[#1A1C1E]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Donor</span>
            </button>

            <button
              onClick={() => onRoleChange('NGO')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'NGO'
                  ? 'bg-[#2D6A4F] text-white shadow-xs'
                  : 'text-[#5F6368] hover:text-[#1A1C1E]'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>NGO Receiver</span>
            </button>

            <button
              onClick={() => onRoleChange('DRIVER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'DRIVER'
                  ? 'bg-[#D9480F] text-white shadow-xs'
                  : 'text-[#5F6368] hover:text-[#1A1C1E]'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Delivery Partner</span>
            </button>

            <button
              onClick={() => onRoleChange('ADMIN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'ADMIN'
                  ? 'bg-[#1A1C1E] text-white shadow-xs'
                  : 'text-[#5F6368] hover:text-[#1A1C1E]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Command Center</span>
            </button>
          </nav>

          {/* Quick Actions & Status */}
          <div className="flex items-center gap-3">
            {/* Live Walkthrough Button */}
            <button
              onClick={onRunWalkthrough}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#2D6A4F] to-[#143D2B] text-white text-xs font-semibold hover:shadow-md transition-all active:scale-95 shadow-sm"
              title="Execute full 13-step Definition of Done demo automatically"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>1-Click Demo</span>
            </button>

            {/* Reset Environment */}
            <button
              onClick={onResetEnv}
              className="p-2 rounded-lg bg-white border border-[#E8E1D5] text-[#5F6368] hover:text-[#1A1C1E] hover:bg-[#F5F0E8] transition-all"
              title="Reset data to pristine hackathon seed state"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Engine Health Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Deterministic Core</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
