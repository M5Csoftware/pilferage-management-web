'use client';

import React from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Scale, 
  Package, 
  AlertTriangle, 
  ArrowRight
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
    <div className="space-y-8 text-[#412D15]">
      {/* Alert Banner if Pilferage Flagged */}
      {pilferedCount > 0 && (
        <div className="bg-white border-l-4 border-l-rose-600 border border-[#ebdcd0] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start md:items-center gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0 border border-rose-100">
              <ShieldAlert className="w-8 h-8 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg md:text-xl font-extrabold text-[#412D15] tracking-tight">
                  {pilferedCount} Critical Weight Discrepanc{pilferedCount > 1 ? 'ies' : 'y'} Intercepted
                </h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 uppercase tracking-wide border border-rose-200">
                  Security Hold
                </span>
              </div>
              <p className="text-sm md:text-base text-[#412D15]/75 font-normal mt-1">
                Total deficit: <strong className="font-mono text-rose-700 font-bold text-base md:text-lg">{missingPilferedKg.toFixed(2)} kg</strong> across flagged AWBs (Estimated value protected: <strong className="font-mono text-[#412D15] font-bold">{settings.currencySymbol}{estimatedFinancialLoss.toLocaleString()}</strong>).
              </p>
            </div>
          </div>

          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('audit')}
              className="text-sm font-bold bg-[#6E3511] hover:bg-[#582a0d] text-white px-5 py-3 rounded-xl shrink-0 shadow-xs flex items-center justify-center gap-2 transition active:scale-95"
            >
              <span>Inspect in Audit Ledger</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Prominent KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Consignments */}
        <div className="bg-white border border-[#ebdcd0] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#412D15]/70 text-xs font-bold uppercase tracking-wider mb-3">
            <span>AWB Consignments</span>
            <Package className="w-5 h-5 text-[#6E3511]" />
          </div>
          <div className="my-2">
            <span className="text-4xl md:text-5xl font-black text-[#412D15] font-mono tracking-tight">{totalShipments}</span>
            <span className="text-sm text-[#412D15]/60 font-normal ml-2">units</span>
          </div>
          <div className="pt-3 border-t border-[#ebdcd0] flex items-center justify-between text-xs text-[#412D15]/75 font-medium">
            <span>Weighed In: <strong className="text-[#412D15] font-bold font-mono">{weighedInCount}</strong></span>
            <span>Pending Out: <strong className="text-[#6E3511] font-bold font-mono">{pendingOutCount}</strong></span>
          </div>
        </div>

        {/* Gross Weight Tally Comparison */}
        <div className="bg-white border border-[#ebdcd0] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#412D15]/70 text-xs font-bold uppercase tracking-wider mb-3">
            <span>Gross Tally Balance</span>
            <Scale className="w-5 h-5 text-[#6E3511]" />
          </div>
          <div className="my-2 flex items-baseline justify-between">
            <div>
              <div className="text-xs text-[#412D15]/60 font-medium uppercase">Inbound</div>
              <div className="text-xl md:text-2xl font-black text-[#412D15] font-mono">
                {totalWeightInKg.toFixed(2)} <span className="text-xs font-normal text-[#412D15]/60">kg</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#412D15]/60 font-medium uppercase">Outbound</div>
              <div className="text-xl md:text-2xl font-black text-[#412D15] font-mono">
                {totalWeightOutKg.toFixed(2)} <span className="text-xs font-normal text-[#412D15]/60">kg</span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-[#ebdcd0] text-xs text-[#412D15]/75 flex items-center justify-between font-medium">
            <span>Net Variance:</span>
            <span className={`font-mono text-sm font-bold ${netVarianceKg < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {netVarianceKg > 0 ? `+${netVarianceKg}` : netVarianceKg} kg
            </span>
          </div>
        </div>

        {/* Pilferage Flags */}
        <div className="bg-white border border-[#ebdcd0] rounded-2xl p-6 shadow-xs border-l-4 border-l-rose-600 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#412D15]/70 text-xs font-bold uppercase tracking-wider mb-3">
            <span>Pilferage Flags</span>
            <ShieldAlert className="w-5 h-5 text-rose-600" />
          </div>
          <div className="my-2 flex items-baseline gap-3">
            <span className="text-4xl md:text-5xl font-black text-rose-600 font-mono">{pilferedCount}</span>
            <span className="text-xs px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 font-bold border border-rose-200">
              {pilferageRate}% Audited
            </span>
          </div>
          <div className="pt-3 border-t border-[#ebdcd0] text-xs text-[#412D15]/75 flex items-center justify-between font-medium">
            <span>Prevented Loss:</span>
            <span className="font-mono text-sm font-bold text-rose-600">-{missingPilferedKg.toFixed(2)} kg</span>
          </div>
        </div>

        {/* Cleared for Dispatch */}
        <div className="bg-white border border-[#ebdcd0] rounded-2xl p-6 shadow-xs border-l-4 border-l-emerald-600 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#412D15]/70 text-xs font-bold uppercase tracking-wider mb-3">
            <span>Cleared for Courier</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="my-2">
            <span className="text-4xl md:text-5xl font-black text-emerald-700 font-mono">{clearedCount}</span>
            <span className="text-sm text-[#412D15]/60 font-normal ml-2">safe exits</span>
          </div>
          <div className="pt-3 border-t border-[#ebdcd0] text-xs text-[#412D15]/75 flex items-center justify-between font-medium">
            <span>Weight Match:</span>
            <span className="font-bold text-emerald-700">100% Within Limit</span>
          </div>
        </div>
      </div>

      {/* Main Split: Watchlist on Left, Tally Ledger on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Watchlist */}
        <div className="lg:col-span-7 bg-white border border-[#ebdcd0] rounded-2xl p-6 md:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#ebdcd0]">
            <div>
              <h3 className="text-lg md:text-xl font-extrabold text-[#412D15] flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-[#6E3511]" />
                Active Discrepancy & Pilferage Watchlist
              </h3>
              <p className="text-xs md:text-sm text-[#412D15]/70 mt-1">
                Shipments with weight shortfall exceeding safety tolerance limits.
              </p>
            </div>
            <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full font-bold">
              {pilferedList.length} Flagged
            </span>
          </div>

          <div className="space-y-4">
            {pilferedList.length === 0 ? (
              <div className="text-center py-12 text-[#412D15]/60 text-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3 opacity-90" />
                No active discrepancies. All outbound shipments match inbound weight.
              </div>
            ) : (
              pilferedList.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => onSelectShipment?.(item)}
                  className="p-5 rounded-xl bg-[#faf6f2] border border-[#ebdcd0] hover:border-[#dfcebf] transition cursor-pointer flex flex-col gap-2.5 shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-[#412D15] bg-white px-2.5 py-1 rounded border border-[#ebdcd0]">
                        {item.id}
                      </span>
                      <span className="text-sm font-mono font-bold text-[#412D15]">
                        AWB: {item.awbNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 font-bold border border-rose-200">
                        {item.weightLossPercentage}% Loss
                      </span>
                      <span className="text-sm font-mono font-black text-rose-700">
                        {item.weightDiffKg} kg
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-[#412D15]/60 block text-[11px] uppercase font-bold">Inbound</span>
                      <span className="font-mono text-[#412D15] font-bold text-sm">{item.weightInKg.toFixed(2)} kg</span>
                    </div>
                    <div>
                      <span className="text-[#412D15]/60 block text-[11px] uppercase font-bold">Outbound</span>
                      <span className="font-mono text-[#412D15] font-bold text-sm">
                        {item.weightOutKg ? `${item.weightOutKg.toFixed(2)} kg` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#412D15]/60 block text-[11px] uppercase font-bold">Category</span>
                      <span className="text-[#412D15] font-semibold">{item.category}</span>
                    </div>
                    <div>
                      <span className="text-[#412D15]/60 block text-[11px] uppercase font-bold">Tolerance</span>
                      <span className="text-[#6E3511] font-bold font-mono">±{item.tolerancePercentage}%</span>
                    </div>
                  </div>

                  {item.flaggedReason && (
                    <div className="text-xs md:text-sm text-rose-900 bg-rose-50/70 p-3 rounded-lg border border-rose-200 mt-1">
                      <strong>Security Memo:</strong> {item.flaggedReason}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Summary Ledger & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#ebdcd0] rounded-2xl p-6 md:p-8 shadow-xs">
            <h3 className="text-sm font-bold text-[#412D15] uppercase tracking-wider flex items-center gap-2 mb-5">
              <Scale className="w-5 h-5 text-[#6E3511]" />
              Weight Tally Reconciliation
            </h3>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#faf6f2] border border-[#ebdcd0]">
                <span className="text-[#412D15]/75 font-medium">Audited Consignments</span>
                <span className="font-mono font-bold text-[#412D15]">{audited.length} of {totalShipments}</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#faf6f2] border border-[#ebdcd0]">
                <span className="text-[#412D15]/75 font-medium">Total Registered Inbound</span>
                <span className="font-mono font-bold text-[#412D15]">{totalAuditedInKg.toFixed(2)} kg</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#faf6f2] border border-[#ebdcd0]">
                <span className="text-[#412D15]/75 font-medium">Total Weighed Outbound</span>
                <span className="font-mono font-bold text-[#412D15]">{totalAuditedOutKg.toFixed(2)} kg</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#faf6f2] border border-[#ebdcd0]">
                <span className="text-[#412D15]/75 font-medium">Net Cargo Differential</span>
                <span className={`font-mono text-base font-bold ${netVarianceKg < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {netVarianceKg > 0 ? `+${netVarianceKg}` : netVarianceKg} kg
                </span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-rose-800 font-bold">Total Intercepted Theft</span>
                <span className="font-mono text-base font-bold text-rose-700">
                  -{missingPilferedKg.toFixed(2)} kg
                </span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white border border-[#ebdcd0] rounded-2xl p-6 shadow-xs">
            <h4 className="text-xs uppercase font-bold text-[#412D15]/60 tracking-wider mb-4">
              Station Navigation
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {onNavigateToTab && (
                <>
                  <button
                    onClick={() => onNavigateToTab('inbound')}
                    className="p-4 rounded-xl bg-[#faf6f2] hover:bg-[#f6eee7] border border-[#ebdcd0] text-left transition group"
                  >
                    <div className="font-bold text-[#412D15] group-hover:text-[#6E3511]">+ Weight In</div>
                    <div className="text-xs text-[#412D15]/60 mt-1">Register new AWB</div>
                  </button>
                  <button
                    onClick={() => onNavigateToTab('dispatch')}
                    className="p-4 rounded-xl bg-[#faf6f2] hover:bg-[#f6eee7] border border-[#ebdcd0] text-left transition group"
                  >
                    <div className="font-bold text-[#412D15] group-hover:text-[#6E3511]">Re-Weigh Out</div>
                    <div className="text-xs text-[#412D15]/60 mt-1">Gate verification</div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
