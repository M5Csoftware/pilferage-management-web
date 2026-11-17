'use client';

import React from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Scale, 
  Package, 
  AlertTriangle,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { Shipment } from '@/types/shipment';

interface StatsOverviewProps {
  shipments: Shipment[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ shipments }) => {
  const total = shipments.length;
  const flagged = shipments.filter(s => s.status === 'PILFERAGE_FLAGGED').length;
  const cleared = shipments.filter(s => s.status === 'DISPATCHED_CLEARED').length;
  const pending = shipments.filter(s => s.status === 'INBOUND_RECORDED').length;

  // Calculate total kilograms lost from pilferage
  const totalLossKg = shipments
    .filter(s => s.status === 'PILFERAGE_FLAGGED' && s.weightDiffKg && s.weightDiffKg < 0)
    .reduce((sum, s) => sum + Math.abs(s.weightDiffKg || 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Tracked */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>Total Parcels</span>
          <Package className="w-4 h-4 text-blue-400" />
        </div>
        <div className="text-2xl sm:text-3xl font-black text-white">
          {total}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {pending} awaiting dispatch re-weigh
        </div>
      </div>

      {/* Dispatched Cleared */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>Safe Dispatches</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl sm:text-3xl font-black text-emerald-400">
          {cleared}
        </div>
        <div className="text-xs text-emerald-500/80 mt-1">
          100% verified weight match
        </div>
      </div>

      {/* Pilferage Incidents */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden border-l-4 border-l-red-500">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>Pilferage Flags</span>
          <ShieldAlert className="w-4 h-4 text-red-400" />
        </div>
        <div className="text-2xl sm:text-3xl font-black text-red-400">
          {flagged}
        </div>
        <div className="text-xs text-red-400/80 mt-1">
          Security breach intercepted
        </div>
      </div>

      {/* Recovered Cargo Loss */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>Suspected Loss Caught</span>
          <Scale className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl sm:text-3xl font-black text-amber-400">
          {totalLossKg.toFixed(2)} <span className="text-sm font-medium text-slate-400">kg</span>
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Prevented theft before handover
        </div>
      </div>
    </div>
  );
};
