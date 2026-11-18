'use client';

import React from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Scale, 
  Package, 
  AlertTriangle, 
  ArrowRight,
  PackagePlus,
  Truck
} from 'lucide-react';
import { Shipment } from '@/types/shipment';
import { SystemSettings } from '@/types/settings';
import { NavTab } from './Sidebar';

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
  const totalShipments = shipments.length;
  const weighedInCount = shipments.filter(s => s.weightInKg > 0).length;
  const pendingOutCount = shipments.filter(s => s.status === 'INBOUND_RECORDED').length;
  const pilferedList = shipments.filter(s => s.status === 'PILFERAGE_FLAGGED');
  const pilferedCount = pilferedList.length;
  const clearedCount = shipments.filter(s => s.status === 'DISPATCHED_CLEARED').length;

  const totalWeightInKg = shipments.reduce((sum, s) => sum + (s.weightInKg || 0), 0);
  const totalWeightOutKg = shipments.reduce((sum, s) => sum + (s.weightOutKg || 0), 0);

  const audited = shipments.filter(s => s.weightOutKg !== undefined && s.weightOutKg > 0);
  const totalAuditedInKg = audited.reduce((sum, s) => sum + s.weightInKg, 0);
  const totalAuditedOutKg = audited.reduce((sum, s) => sum + (s.weightOutKg || 0), 0);
  const netVarianceKg = +(totalAuditedOutKg - totalAuditedInKg).toFixed(2);

  const missingPilferedKg = pilferedList.reduce((sum, s) => {
    const diff = s.weightDiffKg || 0;
    return sum + (diff < 0 ? Math.abs(diff) : 0);
  }, 0);

  const pilferageRate = audited.length > 0 ? ((pilferedCount / audited.length) * 100).toFixed(1) : '0';
  const estimatedFinancialLoss = +(missingPilferedKg * settings.estCostPerKg).toFixed(2);

  return (
    <div className="space-y-4 sm:space-y-6 text-[#412D15]">
      {/* Critical Security Alert Widget (Optimized for Mobile & Desktop) */}
      {pilferedCount > 0 && (
        <div className="bg-white border-l-4 border-l-rose-600 border border-[#ebdcd0] rounded-2xl p-4 sm:p-6 shadow-xs">
          <div className="flex items-start sm:items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl shrink-0 border border-rose-200">
                <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-black text-[#412D15] leading-tight">
                  {pilferedCount} Critical Discrepanc{pilferedCount > 1 ? 'ies' : 'y'} Intercepted
                </h3>
                <span className="text-[10px] sm:text-xs font-bold text-rose-700">
                  Active Security Hold at Gate
                </span>
              </div>
            </div>
            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 uppercase tracking-wide border border-rose-200 shrink-0">
              Security Alert
            </span>
          </div>

          <div className="text-xs sm:text-sm text-[#412D15]/80 font-normal mb-3 sm:mb-4">
            Detected shortage: <strong className="font-mono text-rose-700 font-bold text-sm sm:text-base">-{missingPilferedKg.toFixed(2)} kg</strong> across flagged consignments. Estimated protected value: <strong className="font-mono text-[#412D15] font-bold">{settings.currencySymbol}{estimatedFinancialLoss.toLocaleString()}</strong>.
          </div>

          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('audit')}
              className="w-full sm:w-auto text-xs sm:text-sm font-bold bg-[#6E3511] hover:bg-[#582a0d] active:bg-[#412D15] text-white px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 transition min-h-[42px]"
            >
              <span>Inspect Flagged Cargo in Audit Ledger</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Mobile Quick Action Buttons: 2 large tap cards */}
      {onNavigateToTab && (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
          <button
            onClick={() => onNavigateToTab('inbound')}
            className="p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-[#faf6f2] active:bg-[#f6eee7] border border-[#ebdcd0] text-left transition shadow-xs flex items-center gap-3 group min-h-[58px]"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#6E3511]/10 text-[#6E3511] flex items-center justify-center shrink-0 group-hover:bg-[#6E3511] group-hover:text-white transition">
              <PackagePlus className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-black text-[#412D15] truncate">+ Weight In</div>
              <div className="text-[10px] sm:text-xs text-[#412D15]/60 truncate">Intake new AWB</div>
            </div>
          </button>

          <button
            onClick={() => onNavigateToTab('dispatch')}
            className="p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-[#faf6f2] active:bg-[#f6eee7] border border-[#ebdcd0] text-left transition shadow-xs flex items-center gap-3 group min-h-[58px]"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#6E3511]/10 text-[#6E3511] flex items-center justify-center shrink-0 group-hover:bg-[#6E3511] group-hover:text-white transition">
              <Truck className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-black text-[#412D15] truncate">Re-Weigh Out</div>
              <div className="text-[10px] sm:text-xs text-[#412D15]/60 truncate">Gate exit check</div>
            </div>
          </button>
        </div>
      )}

      {/* KPI Tiles (2x2 on Mobile, 4x1 on Desktop - Compact & Punchy!) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Tile 1: Consignments */}
        <div className="bg-white border border-[#ebdcd0] rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#412D15]/70 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <span>Consignments</span>
            <Package className="w-4 h-4 text-[#6E3511]" />
          </div>
          <div className="my-1 sm:my-2">
            <span className="text-2xl sm:text-3xl md:text-4xl font-black text-[#412D15] font-mono tracking-tight">{totalShipments}</span>
            <span className="text-xs text-[#412D15]/60 ml-1">AWBs</span>
          </div>
          <div className="pt-2 border-t border-[#ebdcd0] flex items-center justify-between text-[10px] sm:text-xs text-[#412D15]/75 font-medium">
            <span>In: <strong className="font-mono text-[#412D15]">{weighedInCount}</strong></span>
            <span>Pending: <strong className="font-mono text-[#6E3511]">{pendingOutCount}</strong></span>
          </div>
        </div>

        {/* Tile 2: Gross Tally */}
        <div className="bg-white border border-[#ebdcd0] rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#412D15]/70 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <span>Gross Tally</span>
            <Scale className="w-4 h-4 text-[#6E3511]" />
          </div>
          <div className="my-1 sm:my-2">
            <div className={`text-xl sm:text-2xl md:text-3xl font-black font-mono tracking-tight ${netVarianceKg < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {netVarianceKg > 0 ? `+${netVarianceKg}` : netVarianceKg} <span className="text-xs font-normal">kg</span>
            </div>
          </div>
          <div className="pt-2 border-t border-[#ebdcd0] flex items-center justify-between text-[10px] sm:text-xs text-[#412D15]/75 font-medium">
            <span>In: {totalWeightInKg.toFixed(0)}k</span>
            <span>Out: {totalWeightOutKg.toFixed(0)}k</span>
          </div>
        </div>

        {/* Tile 3: Pilferage Flags */}
        <div className="bg-white border border-[#ebdcd0] rounded-2xl p-3.5 sm:p-5 shadow-xs border-l-4 border-l-rose-600 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#412D15]/70 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <span>Pilferage Flags</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="my-1 sm:my-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl md:text-4xl font-black text-rose-600 font-mono">{pilferedCount}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
              {pilferageRate}% rate
            </span>
          </div>
          <div className="pt-2 border-t border-[#ebdcd0] flex items-center justify-between text-[10px] sm:text-xs text-[#412D15]/75 font-medium">
            <span>Lost:</span>
            <span className="font-mono font-bold text-rose-600">-{missingPilferedKg.toFixed(1)} kg</span>
          </div>
        </div>

        {/* Tile 4: Cleared Exits */}
        <div className="bg-white border border-[#ebdcd0] rounded-2xl p-3.5 sm:p-5 shadow-xs border-l-4 border-l-emerald-600 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#412D15]/70 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <span>Cleared Exits</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-1 sm:my-2">
            <span className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-700 font-mono">{clearedCount}</span>
            <span className="text-xs text-[#412D15]/60 ml-1">cleared</span>
          </div>
          <div className="pt-2 border-t border-[#ebdcd0] flex items-center justify-between text-[10px] sm:text-xs text-[#412D15]/75 font-medium">
            <span>Tally match:</span>
            <span className="font-bold text-emerald-700">100% OK</span>
          </div>
        </div>
      </div>

      {/* Main Split: Watchlist on Left, Tally Ledger on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Watchlist */}
        <div className="lg:col-span-7 bg-white border border-[#ebdcd0] rounded-2xl p-4 sm:p-6 md:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-3.5 sm:mb-5 pb-3 border-b border-[#ebdcd0]">
            <div>
              <h3 className="text-sm sm:text-base md:text-lg font-black text-[#412D15] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-[#6E3511]" />
                <span>Active Discrepancy Watchlist</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-[#412D15]/70 mt-0.5">
                Shipments with weight shortfall exceeding safety tolerance limits.
              </p>
            </div>
            <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full font-bold shrink-0">
              {pilferedList.length} Flagged
            </span>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {pilferedList.length === 0 ? (
              <div className="text-center py-8 text-[#412D15]/60 text-xs sm:text-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-90" />
                No active discrepancies. All outbound shipments match inbound weight.
              </div>
            ) : (
              pilferedList.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => onSelectShipment?.(item)}
                  className="p-3 sm:p-4 rounded-xl bg-[#faf6f2] border border-[#ebdcd0] hover:border-[#dfcebf] transition cursor-pointer flex flex-col gap-2 shadow-2xs active:bg-[#f6eee7]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-xs font-mono font-bold text-[#412D15] bg-white px-2 py-0.5 rounded border border-[#ebdcd0]">
                        {item.awbNumber}
                      </span>
                      <span className="text-[10px] text-[#412D15]/50 font-mono truncate">
                        {item.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold border border-rose-200">
                        {item.weightLossPercentage}% Loss
                      </span>
                      <span className="text-xs sm:text-sm font-mono font-black text-rose-700">
                        {item.weightDiffKg} kg
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-[#412D15] font-semibold truncate">
                    {item.senderName} → {item.recipientName}
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-lg border border-[#ebdcd0] font-mono text-center text-xs">
                    <div>
                      <span className="text-[#412D15]/60 block text-[9px] uppercase font-sans font-bold">Inbound</span>
                      <span className="text-[#412D15] font-bold text-xs">{item.weightInKg.toFixed(2)} kg</span>
                    </div>
                    <div>
                      <span className="text-[#412D15]/60 block text-[9px] uppercase font-sans font-bold">Outbound</span>
                      <span className="text-[#412D15] font-bold text-xs">
                        {item.weightOutKg ? `${item.weightOutKg.toFixed(2)} kg` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#412D15]/60 block text-[9px] uppercase font-sans font-bold">Variance</span>
                      <span className="font-black text-rose-700 text-xs">
                        {item.weightDiffKg} kg
                      </span>
                    </div>
                  </div>

                  {item.flaggedReason && (
                    <div className="text-[11px] text-rose-900 bg-rose-50/70 p-2 rounded-lg border border-rose-200">
                      <strong>Security Memo:</strong> {item.flaggedReason}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Summary Ledger */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#ebdcd0] rounded-2xl p-4 sm:p-6 md:p-8 shadow-xs">
            <h3 className="text-xs sm:text-sm font-bold text-[#412D15] uppercase tracking-wider flex items-center gap-2 mb-3.5 sm:mb-4">
              <Scale className="w-4 h-4 text-[#6E3511]" />
              Weight Tally Reconciliation
            </h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[#faf6f2] border border-[#ebdcd0]">
                <span className="text-[#412D15]/75 font-medium">Audited Consignments</span>
                <span className="font-mono font-bold text-[#412D15]">{audited.length} of {totalShipments}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[#faf6f2] border border-[#ebdcd0]">
                <span className="text-[#412D15]/75 font-medium">Total Registered Inbound</span>
                <span className="font-mono font-bold text-[#412D15]">{totalAuditedInKg.toFixed(2)} kg</span>
              </div>
              <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[#faf6f2] border border-[#ebdcd0]">
                <span className="text-[#412D15]/75 font-medium">Total Weighed Outbound</span>
                <span className="font-mono font-bold text-[#412D15]">{totalAuditedOutKg.toFixed(2)} kg</span>
              </div>
              <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[#faf6f2] border border-[#ebdcd0]">
                <span className="text-[#412D15]/75 font-medium">Net Cargo Differential</span>
                <span className={`font-mono text-xs sm:text-sm font-bold ${netVarianceKg < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {netVarianceKg > 0 ? `+${netVarianceKg}` : netVarianceKg} kg
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-rose-800 font-bold">Intercepted Pilferage</span>
                <span className="font-mono text-xs sm:text-sm font-bold text-rose-700">
                  -{missingPilferedKg.toFixed(2)} kg
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
