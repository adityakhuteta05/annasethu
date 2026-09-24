import React from 'react';
import { Award, ShieldCheck, X, Printer, Download, CheckCircle2, HeartHandshake, Wind, Droplets } from 'lucide-react';

interface ImpactModalProps {
  certificate: any | null;
  onClose: () => void;
}

export const ImpactModal: React.FC<ImpactModalProps> = ({ certificate, onClose }) => {
  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#E8E1D5] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between p-6 bg-[#143D2B] text-white">
          <div className="flex items-center gap-2.5">
            <Award className="w-6 h-6 text-[#D4AF37]" />
            <div>
              <h3 className="font-serif font-bold text-lg tracking-wide">
                ANNASETU Sustainability Documentation
              </h3>
              <p className="text-[11px] text-[#A5D6A7]">
                Verified Food Rescue Certificate #{certificate.certificate_id || 'CERT-AS-8812'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CERTIFICATE BODY (PRINTABLE) */}
        <div className="p-8 space-y-6 bg-gradient-to-b from-[#FDFBF7] to-white border-b border-[#E8E1D5]">
          
          <div className="text-center space-y-2 border-b border-[#E8E1D5] pb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5E9] border border-[#A5D6A7] text-[#143D2B] text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
              <span>Chain-of-Custody Verified Rescue</span>
            </div>

            <h2 className="text-2xl font-serif font-bold text-[#143D2B] mt-2">
              ANNASETU Verified Impact Reporting & Sustainability Documentation
            </h2>
            <p className="text-xs text-[#5F6368] max-w-lg mx-auto">
              This operational document certifies the successful rescued transfer of edible surplus food to verified recipient community kitchens.
            </p>
          </div>

          {/* PARTICIPANTS */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F5F0E8] border border-[#E8E1D5] text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] block">
                Food Donor Organization
              </span>
              <strong className="text-sm font-serif text-[#143D2B] block mt-0.5">
                {certificate.donor_organization || 'The Oberoi Grand Kitchens'}
              </strong>
              <span className="text-[11px] text-[#5F6368]">FSSAI / FoSCoS Authorized</span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] block">
                Beneficiary NGO Receiver
              </span>
              <strong className="text-sm font-serif text-[#2D6A4F] block mt-0.5">
                {certificate.ngo_beneficiary || 'Delhi Roti Bank Foundation'}
              </strong>
              <span className="text-[11px] text-[#5F6368]">NITI Aayog NGO-DARPAN Verified</span>
            </div>
          </div>

          {/* IMPACT METRICS GRID */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 rounded-xl bg-white border border-[#E8E1D5] shadow-xs">
              <span className="text-[10px] font-bold uppercase text-[#5F6368] block">Rescued Payload</span>
              <span className="text-2xl font-serif font-bold text-[#143D2B] mt-1 block">
                {certificate.rescued_quantity_kg || 24} <span className="text-xs font-sans font-normal text-gray-500">kg</span>
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E8E1D5] shadow-xs">
              <span className="text-[10px] font-bold uppercase text-[#5F6368] block">Meals Supported</span>
              <span className="text-2xl font-serif font-bold text-[#D9480F] mt-1 block">
                {certificate.meals_supported || 48} <span className="text-xs font-sans font-normal text-gray-500">meals</span>
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E8E1D5] shadow-xs">
              <span className="text-[10px] font-bold uppercase text-[#5F6368] block">CO₂e Abated</span>
              <span className="text-2xl font-serif font-bold text-[#2D6A4F] mt-1 block">
                {certificate.co2e_avoided_kg || 60} <span className="text-xs font-sans font-normal text-gray-500">kg</span>
              </span>
            </div>
          </div>

          {/* HASH & AUDIT METADATA */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] font-mono text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Delivery Completed At:</span>
              <span className="font-bold">{certificate.delivery_completed_at || new Date().toUTCString()}</span>
            </div>
            <div className="flex justify-between truncate">
              <span>Verification Hash:</span>
              <span className="font-bold text-[#143D2B] truncate">{certificate.verification_hash || 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'}</span>
            </div>
          </div>

          {/* WORDING GUARDRAIL (PRD Section 28) */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
            <strong>Documentation Disclaimer:</strong> {certificate.disclaimer || (
              "ANNASETU Verified Impact Reporting & Sustainability Documentation is provided to support internal corporate sustainability documentation, CSR reporting, and ESG audits. It does not constitute a government tax-exemption certificate or certified regulatory carbon-credit instrument."
            )}
          </div>

        </div>

        {/* MODAL ACTIONS */}
        <div className="p-5 bg-white flex items-center justify-between">
          <span className="text-xs text-[#5F6368]">
            Format: Compliant with AnnaSetu PRD v1.0
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E8E1D5] text-xs font-semibold hover:bg-gray-50 transition-all text-[#1A1C1E]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#143D2B] text-white text-xs font-semibold hover:bg-[#1E523A] transition-all"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
