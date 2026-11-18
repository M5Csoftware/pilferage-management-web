'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Search, 
  AlertTriangle,
  Scale,
  Eye
} from 'lucide-react';
import { Shipment, AuthUser } from '@/types/shipment';

interface ShipmentAuditListProps {
  shipments: Shipment[];
  onSelectShipment?: (shipment: Shipment) => void;
  currentUser: AuthUser;
}

export const ShipmentAuditList: React.FC<ShipmentAuditListProps> = ({ 
  shipments,
  onSelectShipment,
  currentUser
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const filtered = shipments.filter(s => {
    const matchesFilter = 
      filterStatus === 'ALL' ? true :
      filterStatus === 'FLAGGED' ? s.status === 'PILFERAGE_FLAGGED' :
      filterStatus === 'CLEARED' ? s.status === 'DISPATCHED_CLEARED' :
      filterStatus === 'INBOUND' ? s.status === 'INBOUND_RECORDED' : true;

    const matchesSearch = 
      s.awbNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.senderName.toLowerCase().includes(search.toLowerCase()) ||
      s.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      s.origin.toLowerCase().includes(search.toLowerCase()) ||
      s.destination.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-white border border-[#ebdcd0] rounded-2xl p-6 md:p-8 shadow-xs text-[#412D15]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-[#ebdcd0]">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#412D15] flex items-center gap-3">
            <Scale className="w-6 h-6 text-[#6E3511] stroke-[2]" />
            Consolidated Weight & Pilferage Audit Log
          </h2>
          <p className="text-sm md:text-base text-[#412D15]/70 font-normal mt-1">
            Complete chain-of-custody ledger comparing arrival baseline vs departure weight.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filters */}
          <div className="flex items-center bg-[#faf6f2] p-1.5 rounded-xl border border-[#ebdcd0] text-xs md:text-sm overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3.5 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                filterStatus === 'ALL' ? 'bg-[#6E3511] text-white shadow-xs' : 'text-[#412D15]/80 hover:text-[#412D15]'
              }`}
            >
              All ({shipments.length})
            </button>
            <button
              onClick={() => setFilterStatus('FLAGGED')}
              className={`px-3.5 py-1.5 rounded-lg font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                filterStatus === 'FLAGGED' 
                  ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                  : 'text-[#412D15]/80 hover:text-rose-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Pilfered ({shipments.filter(s => s.status === 'PILFERAGE_FLAGGED').length})
            </button>
            <button
              onClick={() => setFilterStatus('CLEARED')}
              className={`px-3.5 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                filterStatus === 'CLEARED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'text-[#412D15]/80 hover:text-emerald-700'
              }`}
            >
              Cleared ({shipments.filter(s => s.status === 'DISPATCHED_CLEARED').length})
            </button>
            <button
              onClick={() => setFilterStatus('INBOUND')}
              className={`px-3.5 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                filterStatus === 'INBOUND' ? 'bg-[#ebdcd0] text-[#412D15]' : 'text-[#412D15]/80 hover:text-[#412D15]'
              }`}
            >
              Pending Out ({shipments.filter(s => s.status === 'INBOUND_RECORDED').length})
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search across AWB #, tracking numbers, consignors, cities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#faf6f2] text-[#412D15] border border-[#ebdcd0] rounded-xl pl-11 pr-4 py-3 text-sm md:text-base focus:border-[#6E3511] focus:bg-white focus:outline-none transition"
          />
          <Search className="w-5 h-5 text-[#6E3511]/60 absolute left-3.5 top-3.5" />
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="block lg:hidden space-y-4">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-[#412D15]/60 text-sm border border-[#ebdcd0] rounded-xl bg-[#faf6f2]">
            No shipments found matching criteria.
          </div>
        ) : (
          filtered.map((item) => {
            const isFlagged = item.status === 'PILFERAGE_FLAGGED';
            const isCleared = item.status === 'DISPATCHED_CLEARED';
            const isPending = item.status === 'INBOUND_RECORDED';

            return (
              <div 
                key={item.id}
                onClick={() => onSelectShipment?.(item)}
                className={`p-5 rounded-xl border text-sm space-y-3 cursor-pointer transition shadow-2xs ${
                  isFlagged 
                    ? 'bg-rose-50/70 border-rose-300' 
                    : 'bg-white border-[#ebdcd0] hover:border-[#dfcebf]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#412D15] text-sm">
                    {item.awbNumber}
                  </span>
                  <div>
                    {isFlagged && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                        FLAGGED
                      </span>
                    )}
                    {isCleared && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        CLEARED
                      </span>
                    )}
                    {isPending && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#faf6f2] text-[#412D15] border border-[#ebdcd0]">
                        PENDING
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[#412D15] font-semibold truncate">
                  {item.senderName} → {item.recipientName}
                </div>

                <div className="grid grid-cols-3 gap-3 bg-[#faf6f2] p-3 rounded-lg border border-[#ebdcd0] font-mono text-center">
                  <div>
                    <span className="text-[#412D15]/60 block text-[10px] uppercase font-sans font-bold">Inbound</span>
                    <span className="text-[#412D15] font-bold">{item.weightInKg.toFixed(2)} kg</span>
                  </div>
                  <div>
                    <span className="text-[#412D15]/60 block text-[10px] uppercase font-sans font-bold">Outbound</span>
                    <span className="text-[#412D15] font-bold">
                      {item.weightOutKg !== undefined ? `${item.weightOutKg.toFixed(2)} kg` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#412D15]/60 block text-[10px] uppercase font-sans font-bold">Variance</span>
                    <span className={`font-black ${isFlagged ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {item.weightDiffKg !== undefined ? `${item.weightDiffKg > 0 ? `+${item.weightDiffKg}` : item.weightDiffKg} kg` : '—'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#412D15]/60 pt-1">
                  <span>{item.category} • Tol: ±{item.tolerancePercentage}%</span>
                  <span className="text-[#6E3511] font-bold">Inspect Details →</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Responsive Table for Desktop */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-[#ebdcd0]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#faf6f2] text-[#412D15] uppercase tracking-wider border-b border-[#ebdcd0] font-bold text-xs">
            <tr>
              <th className="px-5 py-4">AWB & Shipment</th>
              <th className="px-5 py-4">Route</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4 text-right">Inbound (kg)</th>
              <th className="px-5 py-4 text-right">Outbound (kg)</th>
              <th className="px-5 py-4 text-right">Variance</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebdcd0]/70 bg-white text-[#412D15] font-medium">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-[#412D15]/60">
                  No shipments found matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isFlagged = item.status === 'PILFERAGE_FLAGGED';
                const isCleared = item.status === 'DISPATCHED_CLEARED';
                const isPending = item.status === 'INBOUND_RECORDED';

                return (
                  <tr 
                    key={item.id}
                    className={`transition hover:bg-[#faf6f2] ${
                      isFlagged ? 'bg-rose-50/50' : ''
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="font-mono font-bold text-[#412D15] text-sm">{item.awbNumber}</div>
                      <div className="text-xs text-[#412D15]/75 font-medium">{item.senderName}</div>
                      <div className="text-[11px] text-[#412D15]/50 font-mono">{item.id}</div>
                    </td>

                    <td className="px-5 py-4 text-xs text-[#412D15]/75">
                      <div>{item.origin}</div>
                      <div className="text-[#412D15]/50">→ {item.destination}</div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded bg-[#faf6f2] text-[#412D15] border border-[#ebdcd0] text-xs font-semibold">
                        {item.category}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right font-mono font-bold text-[#412D15] text-base">
                      {item.weightInKg.toFixed(2)}
                    </td>

                    <td className="px-5 py-4 text-right font-mono font-bold text-[#412D15] text-base">
                      {item.weightOutKg !== undefined ? item.weightOutKg.toFixed(2) : '—'}
                    </td>

                    <td className="px-5 py-4 text-right font-mono">
                      {item.weightDiffKg !== undefined ? (
                        <span className={`font-black text-sm ${
                          isFlagged ? 'text-rose-600' : 'text-emerald-700'
                        }`}>
                          {item.weightDiffKg > 0 ? `+${item.weightDiffKg}` : item.weightDiffKg} kg ({item.weightLossPercentage}%)
                        </span>
                      ) : (
                        <span className="text-[#412D15]/50">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {isFlagged && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                          <ShieldAlert className="w-3.5 h-3.5" /> Flagged
                        </span>
                      )}
                      {isCleared && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#faf6f2] text-[#412D15] border border-[#ebdcd0]">
                          <Clock className="w-3.5 h-3.5 text-[#6E3511]" /> Intake Logged
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {onSelectShipment && (
                        <button
                          onClick={() => onSelectShipment(item)}
                          className="text-xs text-[#412D15] hover:text-white bg-[#faf6f2] hover:bg-[#6E3511] px-3.5 py-1.5 rounded-lg border border-[#ebdcd0] inline-flex items-center gap-1.5 transition font-bold"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
