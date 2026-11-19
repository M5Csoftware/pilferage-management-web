'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Scale, 
  Package, 
  AlertTriangle, 
  ArrowRight,
  PackagePlus,
  Truck,
  Camera,
  Eye,
  Clock,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import { Shipment } from '@/types/shipment';
import { SystemSettings } from '@/types/settings';
import { NavTab } from './Sidebar';
import { getOptimizedImageUrl } from '@/lib/cloudinary';
import { PhotoLightboxModal } from './PhotoLightboxModal';

interface DiscrepancyDashboardProps {
  shipments: Shipment[];
  settings: SystemSettings;
  onNavigateToTab?: (tab: NavTab) => void;
  onSelectShipment?: (shipment: Shipment) => void;
}

export const DiscrepancyDashboard: React.FC<DiscrepancyDashboardProps> = ({
  shipments,
  settings,
  onNavigateToTab,
  onSelectShipment
}) => {
  const [activeDashboardTab, setActiveDashboardTab] = useState<'pilferage' | 'tallied'>('pilferage');
  const [searchTerm, setSearchTerm] = useState('');
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    url: string;
    title: string;
    subtitle?: string;
    metadata?: any;
  }>({
    isOpen: false,
    url: '',
    title: '',
  });

  // 1. Pilferage Detected Group (Flagged Discrepancies)
  const pilferedList = shipments.filter(s => s.status === 'PILFERAGE_FLAGGED');
  const pilferedCount = pilferedList.length;

  // 2. Correctly Tallied Group (Cleared Matches)
  const clearedList = shipments.filter(s => s.status === 'DISPATCHED_CLEARED');
  const clearedCount = clearedList.length;

  // Ancillary metrics
  const pendingOutList = shipments.filter(s => s.status === 'INBOUND_RECORDED');
  const pendingOutCount = pendingOutList.length;

  const missingPilferedKg = pilferedList.reduce((sum, s) => {
    const diff = s.weightDiffKg || 0;
    return sum + (diff < 0 ? Math.abs(diff) : 0);
  }, 0);

  const totalClearedWeightKg = clearedList.reduce((sum, s) => sum + (s.weightOutKg || s.weightInKg || 0), 0);
  const estimatedFinancialLoss = +(missingPilferedKg * settings.estCostPerKg).toFixed(2);

  // Filtered lists based on search
  const filteredPilfered = pilferedList.filter(s => 
    s.awbNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.recipientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCleared = clearedList.filter(s => 
    s.awbNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.recipientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6 text-[#412D15]">
      {/* 2 MAIN PILLARS: Prominent Side-by-Side Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Pillar 1: Pilferage Detected (Security & Loss Risk) */}
        <div 
          onClick={() => setActiveDashboardTab('pilferage')}
          className={`cursor-pointer rounded-2xl p-5 sm:p-7 border-2 transition-all shadow-xs relative overflow-hidden flex flex-col justify-between ${
            activeDashboardTab === 'pilferage'
              ? 'bg-rose-50/70 border-rose-600 ring-2 ring-rose-600/20'
              : 'bg-white border-[#ebdcd0] hover:border-rose-300 hover:bg-rose-50/30'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                  Critical Focus
                </span>
                <h2 className="text-base sm:text-xl font-black text-[#412D15] mt-1 leading-tight">
                  Pilferage Detected
                </h2>
              </div>
            </div>

            <span className="text-3xl sm:text-4xl md:text-5xl font-black font-mono text-rose-600">
              {pilferedCount}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#412D15]/80 mt-3 font-normal">
            Consignments where weight loss exceeded permissible tolerance threshold. Held for inspection.
          </p>

          <div className="mt-4 pt-3 border-t border-rose-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#412D15]/60 block">Cargo Missing</span>
              <span className="font-mono font-bold text-rose-700 text-sm sm:text-base">
                -{missingPilferedKg.toFixed(2)} kg
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#412D15]/60 block">Est. Financial Risk</span>
              <span className="font-mono font-bold text-[#412D15] text-sm sm:text-base">
                {settings.currencySymbol}{estimatedFinancialLoss.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Correctly Tallied Shipments (Cleared & Verified Matches) */}
        <div 
          onClick={() => setActiveDashboardTab('tallied')}
          className={`cursor-pointer rounded-2xl p-5 sm:p-7 border-2 transition-all shadow-xs relative overflow-hidden flex flex-col justify-between ${
            activeDashboardTab === 'tallied'
              ? 'bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-600/20'
              : 'bg-white border-[#ebdcd0] hover:border-emerald-300 hover:bg-emerald-50/30'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified Clear
                </span>
                <h2 className="text-base sm:text-xl font-black text-[#412D15] mt-1 leading-tight">
                  Correctly Tallied Shipments
                </h2>
              </div>
            </div>

            <span className="text-3xl sm:text-4xl md:text-5xl font-black font-mono text-emerald-700">
              {clearedCount}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#412D15]/80 mt-3 font-normal">
            Arrival vs departure weights match exactly within allowable tolerance. Consignments cleared for dispatch.
          </p>

          <div className="mt-4 pt-3 border-t border-emerald-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#412D15]/60 block">Verified Cargo Out</span>
              <span className="font-mono font-bold text-emerald-800 text-sm sm:text-base">
                {totalClearedWeightKg.toFixed(2)} kg
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#412D15]/60 block">Tare Integrity</span>
              <span className="font-bold text-emerald-700 text-sm sm:text-base">
                100% Passed Gate
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white border border-[#ebdcd0] rounded-2xl p-3 sm:p-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-[#412D15]/75">
          <Clock className="w-4 h-4 text-[#6E3511] shrink-0" />
          <span>
            Pending re-weigh queue: <strong className="font-mono text-[#6E3511] font-bold">{pendingOutCount} AWBs</strong> awaiting departure scale.
          </span>
        </div>

        {onNavigateToTab && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToTab('inbound')}
              className="text-xs font-bold bg-[#faf6f2] hover:bg-[#f6eee7] active:bg-[#ebdcd0] text-[#412D15] border border-[#ebdcd0] px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition min-h-[36px]"
            >
              <PackagePlus className="w-3.5 h-3.5 text-[#6E3511]" />
              <span>+ Weight In</span>
            </button>
            <button
              onClick={() => onNavigateToTab('dispatch')}
              className="text-xs font-bold bg-[#6E3511] hover:bg-[#582a0d] active:bg-[#412D15] text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition shadow-2xs min-h-[36px]"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Re-Weigh Out</span>
            </button>
          </div>
        )}
      </div>

      {/* 2 MAIN TABS HEADER & SEARCH */}
      <div className="bg-white border border-[#ebdcd0] rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        {/* The 2 Primary Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ebdcd0]">
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
            {/* Tab 1: Pilferage Detected */}
            <button
              type="button"
              onClick={() => setActiveDashboardTab('pilferage')}
              className={`px-4 sm:px-6 py-3 rounded-xl font-black text-xs sm:text-sm md:text-base flex items-center justify-center gap-2 transition relative min-h-[48px] ${
                activeDashboardTab === 'pilferage'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-[#faf6f2] text-[#412D15]/80 hover:text-rose-700 hover:bg-rose-50 border border-[#ebdcd0]'
              }`}
            >
              <ShieldAlert className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${activeDashboardTab === 'pilferage' ? 'text-white' : 'text-rose-600'}`} />
              <span>Pilferage Detected</span>
              <span className={`text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                activeDashboardTab === 'pilferage'
                  ? 'bg-white text-rose-700'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {pilferedCount}
              </span>
            </button>

            {/* Tab 2: Correctly Tallied */}
            <button
              type="button"
              onClick={() => setActiveDashboardTab('tallied')}
              className={`px-4 sm:px-6 py-3 rounded-xl font-black text-xs sm:text-sm md:text-base flex items-center justify-center gap-2 transition relative min-h-[48px] ${
                activeDashboardTab === 'tallied'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-[#faf6f2] text-[#412D15]/80 hover:text-emerald-700 hover:bg-emerald-50 border border-[#ebdcd0]'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${activeDashboardTab === 'tallied' ? 'text-white' : 'text-emerald-600'}`} />
              <span>Correctly Tallied</span>
              <span className={`text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                activeDashboardTab === 'tallied'
                  ? 'bg-white text-emerald-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {clearedCount}
              </span>
            </button>
          </div>

          {/* Quick Search inside tabs */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search AWB or Consignee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#faf6f2] text-[#412D15] border border-[#ebdcd0] rounded-xl pl-9 pr-3 py-2 text-xs focus:border-[#6E3511] focus:bg-white focus:outline-none transition min-h-[38px]"
            />
            <Search className="w-4 h-4 text-[#6E3511]/60 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* TAB 1 CONTENT: Pilferage Detected List */}
        {activeDashboardTab === 'pilferage' && (
          <div className="space-y-3 pt-1 animate-fadeIn">
            {filteredPilfered.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl border border-dashed border-[#ebdcd0] bg-[#faf6f2]">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-90" />
                <h4 className="text-sm font-bold text-[#412D15]">Zero Pilferage Detected</h4>
                <p className="text-xs text-[#412D15]/60 mt-1 max-w-sm mx-auto">
                  {searchTerm 
                    ? 'No flagged shipments match your search filter.'
                    : 'All scanned consignments are within allowable weight tolerance. Zero cargo tampering reported.'}
                </p>
              </div>
            ) : (
              filteredPilfered.map((item) => {
                const diffKg = item.weightDiffKg || 0;
                const lossPct = item.weightLossPercentage || 0;
                const hasPhotos = Boolean(item.weightInPhotoUrl || item.weightOutPhotoUrl);

                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-rose-300/80 hover:border-rose-500 transition shadow-2xs space-y-3"
                  >
                    {/* Top Row: AWB, Status badge, Loss Pill */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm sm:text-base text-[#412D15] bg-[#faf6f2] px-2.5 py-1 rounded-lg border border-[#ebdcd0]">
                          {item.awbNumber}
                        </span>
                        <span className="text-xs font-mono text-[#412D15]/50">
                          {item.id}
                        </span>
                        <span className="text-[10px] font-bold uppercase bg-[#faf6f2] text-[#412D15] px-2 py-0.5 rounded border border-[#ebdcd0]">
                          {item.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                          Shortage: {diffKg > 0 ? `+${diffKg}` : diffKg} kg ({lossPct}%)
                        </span>
                        <span className="text-[10px] font-bold uppercase bg-rose-600 text-white px-2 py-1 rounded-lg shrink-0">
                          Security Hold
                        </span>
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="text-xs sm:text-sm font-semibold text-[#412D15]">
                      <span>{item.senderName}</span>
                      <span className="text-[#6E3511] font-bold mx-2">→</span>
                      <span>{item.recipientName}</span>
                      <span className="text-[#412D15]/50 text-xs block sm:inline sm:ml-2">
                        ({item.origin} to {item.destination})
                      </span>
                    </div>

                    {/* Weight Comparison Deck */}
                    <div className="grid grid-cols-3 gap-2.5 bg-[#faf6f2] p-3 rounded-xl border border-[#ebdcd0] font-mono text-center">
                      <div>
                        <span className="text-[10px] uppercase font-sans font-bold text-[#412D15]/60 block">Inbound (Arrival)</span>
                        <span className="text-[#412D15] font-black text-xs sm:text-sm">{item.weightInKg.toFixed(2)} kg</span>
                        <span className="text-[10px] font-sans text-[#412D15]/50 block mt-0.5 truncate">{item.inboundDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-sans font-bold text-[#412D15]/60 block">Outbound (Re-Weigh)</span>
                        <span className="text-rose-700 font-black text-xs sm:text-sm">
                          {item.weightOutKg !== undefined ? `${item.weightOutKg.toFixed(2)} kg` : 'N/A'}
                        </span>
                        <span className="text-[10px] font-sans text-[#412D15]/50 block mt-0.5 truncate">{item.outboundDate || 'Gate Check'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-sans font-bold text-[#412D15]/60 block">Discrepancy</span>
                        <span className="text-rose-700 font-black text-xs sm:text-sm">{diffKg} kg</span>
                        <span className="text-[10px] font-sans font-bold text-rose-600 block mt-0.5">Limit: ±{item.tolerancePercentage}%</span>
                      </div>
                    </div>

                    {/* Security Memo / Flagged Reason */}
                    {item.flaggedReason && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Loss Prevention Audit Memo:</strong>
                          <span>{item.flaggedReason}</span>
                          {item.outboundNotes && (
                            <div className="mt-1 text-rose-800 italic">
                              Gate Notes: &quot;{item.outboundNotes}&quot;
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Photo Evidence & Action Strip */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#ebdcd0]">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#412D15]/70 flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5 text-[#6E3511]" /> Photo Evidence:
                        </span>
                        {item.weightInPhotoUrl && (
                          <button
                            type="button"
                            onClick={() => setLightboxData({
                              isOpen: true,
                              url: item.weightInPhotoUrl!,
                              title: `Inbound Arrival Photo • ${item.awbNumber}`,
                              subtitle: `Arrival Weight: ${item.weightInKg.toFixed(2)} kg`,
                              metadata: {
                                awbNumber: item.awbNumber,
                                weightKg: item.weightInKg,
                                operator: item.inboundOperator,
                                date: item.inboundDate,
                                sealNumber: item.sealNumberIn
                              }
                            })}
                            className="text-xs font-bold text-[#6E3511] bg-[#faf6f2] hover:bg-[#ebdcd0] border border-[#ebdcd0] px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                          >
                            <Eye className="w-3 h-3" /> Arrival Photo
                          </button>
                        )}
                        {item.weightOutPhotoUrl && (
                          <button
                            type="button"
                            onClick={() => setLightboxData({
                              isOpen: true,
                              url: item.weightOutPhotoUrl!,
                              title: `Outbound Discrepancy Photo • ${item.awbNumber}`,
                              subtitle: `Departure Weight: ${item.weightOutKg?.toFixed(2)} kg (Shortage ${diffKg} kg)`,
                              metadata: {
                                awbNumber: item.awbNumber,
                                weightKg: item.weightOutKg,
                                operator: item.outboundOperator,
                                date: item.outboundDate,
                                sealNumber: item.sealNumberOut
                              }
                            })}
                            className="text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                          >
                            <Eye className="w-3 h-3" /> Re-Weigh Photo
                          </button>
                        )}
                        {!hasPhotos && (
                          <span className="text-[11px] text-[#412D15]/40 italic">None attached</span>
                        )}
                      </div>

                      {onSelectShipment && (
                        <button
                          type="button"
                          onClick={() => onSelectShipment(item)}
                          className="text-xs font-bold text-[#6E3511] hover:text-[#582a0d] flex items-center gap-1 self-end sm:self-auto"
                        >
                          <span>Full Chain-of-Custody Inspection</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2 CONTENT: Correctly Tallied Shipments List */}
        {activeDashboardTab === 'tallied' && (
          <div className="space-y-3 pt-1 animate-fadeIn">
            {filteredCleared.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl border border-dashed border-[#ebdcd0] bg-[#faf6f2]">
                <Package className="w-10 h-10 text-[#6E3511] mx-auto mb-2 opacity-70" />
                <h4 className="text-sm font-bold text-[#412D15]">No Cleared Shipments Yet</h4>
                <p className="text-xs text-[#412D15]/60 mt-1 max-w-sm mx-auto">
                  {searchTerm 
                    ? 'No cleared shipments match your search filter.'
                    : 'Shipments will appear here once verified on the outbound scale and cleared for dispatch.'}
                </p>
              </div>
            ) : (
              filteredCleared.map((item) => {
                const diffKg = item.weightDiffKg || 0;
                const lossPct = item.weightLossPercentage || 0;
                const hasPhotos = Boolean(item.weightInPhotoUrl || item.weightOutPhotoUrl);

                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-300 hover:border-emerald-500 transition shadow-2xs space-y-3"
                  >
                    {/* Top Row: AWB, Category, Cleared Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm sm:text-base text-[#412D15] bg-[#faf6f2] px-2.5 py-1 rounded-lg border border-[#ebdcd0]">
                          {item.awbNumber}
                        </span>
                        <span className="text-xs font-mono text-[#412D15]/50">
                          {item.id}
                        </span>
                        <span className="text-[10px] font-bold uppercase bg-[#faf6f2] text-[#412D15] px-2 py-0.5 rounded border border-[#ebdcd0]">
                          {item.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                          Variance: {diffKg > 0 ? `+${diffKg}` : diffKg} kg ({lossPct}%)
                        </span>
                        <span className="text-[10px] font-bold uppercase bg-emerald-700 text-white px-2 py-1 rounded-lg flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          Cleared
                        </span>
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="text-xs sm:text-sm font-semibold text-[#412D15]">
                      <span>{item.senderName}</span>
                      <span className="text-[#6E3511] font-bold mx-2">→</span>
                      <span>{item.recipientName}</span>
                      <span className="text-[#412D15]/50 text-xs block sm:inline sm:ml-2">
                        ({item.origin} to {item.destination})
                      </span>
                    </div>

                    {/* Weight Comparison Deck */}
                    <div className="grid grid-cols-3 gap-2.5 bg-[#faf6f2] p-3 rounded-xl border border-[#ebdcd0] font-mono text-center">
                      <div>
                        <span className="text-[10px] uppercase font-sans font-bold text-[#412D15]/60 block">Inbound (Arrival)</span>
                        <span className="text-[#412D15] font-black text-xs sm:text-sm">{item.weightInKg.toFixed(2)} kg</span>
                        <span className="text-[10px] font-sans text-[#412D15]/50 block mt-0.5 truncate">{item.inboundDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-sans font-bold text-[#412D15]/60 block">Outbound (Re-Weigh)</span>
                        <span className="text-emerald-700 font-black text-xs sm:text-sm">
                          {item.weightOutKg !== undefined ? `${item.weightOutKg.toFixed(2)} kg` : 'N/A'}
                        </span>
                        <span className="text-[10px] font-sans text-[#412D15]/50 block mt-0.5 truncate">{item.outboundDate || 'Cleared'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-sans font-bold text-[#412D15]/60 block">Tally Result</span>
                        <span className="text-emerald-700 font-black text-xs sm:text-sm">Verified Match</span>
                        <span className="text-[10px] font-sans text-emerald-800 block mt-0.5 font-bold">Within ±{item.tolerancePercentage}%</span>
                      </div>
                    </div>

                    {/* Clearance remarks */}
                    {item.outboundNotes && (
                      <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span><strong>Clearance Stamp:</strong> {item.outboundNotes}</span>
                      </div>
                    )}

                    {/* Photo Evidence & Action Strip */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#ebdcd0]">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#412D15]/70 flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5 text-[#6E3511]" /> Photo Evidence:
                        </span>
                        {item.weightInPhotoUrl && (
                          <button
                            type="button"
                            onClick={() => setLightboxData({
                              isOpen: true,
                              url: item.weightInPhotoUrl!,
                              title: `Arrival Photo • ${item.awbNumber}`,
                              subtitle: `Arrival Weight: ${item.weightInKg.toFixed(2)} kg`,
                              metadata: {
                                awbNumber: item.awbNumber,
                                weightKg: item.weightInKg,
                                operator: item.inboundOperator,
                                date: item.inboundDate,
                                sealNumber: item.sealNumberIn
                              }
                            })}
                            className="text-xs font-bold text-[#6E3511] bg-[#faf6f2] hover:bg-[#ebdcd0] border border-[#ebdcd0] px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                          >
                            <Eye className="w-3 h-3" /> Arrival Photo
                          </button>
                        )}
                        {item.weightOutPhotoUrl && (
                          <button
                            type="button"
                            onClick={() => setLightboxData({
                              isOpen: true,
                              url: item.weightOutPhotoUrl!,
                              title: `Dispatch Photo • ${item.awbNumber}`,
                              subtitle: `Cleared Weight: ${item.weightOutKg?.toFixed(2)} kg`,
                              metadata: {
                                awbNumber: item.awbNumber,
                                weightKg: item.weightOutKg,
                                operator: item.outboundOperator,
                                date: item.outboundDate,
                                sealNumber: item.sealNumberOut
                              }
                            })}
                            className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                          >
                            <Eye className="w-3 h-3" /> Dispatch Photo
                          </button>
                        )}
                        {!hasPhotos && (
                          <span className="text-[11px] text-[#412D15]/40 italic">None attached</span>
                        )}
                      </div>

                      {onSelectShipment && (
                        <button
                          type="button"
                          onClick={() => onSelectShipment(item)}
                          className="text-xs font-bold text-[#6E3511] hover:text-[#582a0d] flex items-center gap-1 self-end sm:self-auto"
                        >
                          <span>View Full Record</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Lightbox for zooming photos directly from the dashboard */}
      <PhotoLightboxModal
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData(prev => ({ ...prev, isOpen: false }))}
        imageUrl={lightboxData.url}
        title={lightboxData.title}
        subtitle={lightboxData.subtitle}
        metadata={lightboxData.metadata}
      />
    </div>
  );
};
