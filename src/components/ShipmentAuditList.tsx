'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  FileSpreadsheet,
  AlertTriangle,
  Scale,
  Eye,
  ArrowUpDown
} from 'lucide-react';
import { Shipment } from '@/types/shipment';

interface ShipmentAuditListProps {
  shipments: Shipment[];
  onSelectShipment?: (shipment: Shipment) => void;
}

export const ShipmentAuditList: React.FC<ShipmentAuditListProps> = ({ 
  shipments,
  onSelectShipment 
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
      s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.senderName.toLowerCase().includes(search.toLowerCase()) ||
      s.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-400" />
            Consolidated Weight & Pilferage Audit Log
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Complete chain-of-custody ledger comparing Inbound Weight vs Outbound Dispatch Weight.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filters */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filterStatus === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({shipments.length})
            </button>
            <button
              onClick={() => setFilterStatus('FLAGGED')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
                filterStatus === 'FLAGGED' 
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                  : 'text-slate-400 hover:text-red-400'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-red-400" />
              Pilfered ({shipments.filter(s => s.status === 'PILFERAGE_FLAGGED').length})
            </button>
            <button
              onClick={() => setFilterStatus('CLEARED')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filterStatus === 'CLEARED' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cleared ({shipments.filter(s => s.status === 'DISPATCHED_CLEARED').length})
            </button>
            <button
              onClick={() => setFilterStatus('INBOUND')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filterStatus === 'INBOUND' ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending Out ({shipments.filter(s => s.status === 'INBOUND_RECORDED').length})
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search across tracking numbers, consignors, consignees, categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
        </div>
      </div>

      {/* Responsive Data Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-4 py-3.5">Shipment & Consignor</th>
              <th className="px-4 py-3.5">Category</th>
              <th className="px-4 py-3.5">Weight In (Arrival)</th>
              <th className="px-4 py-3.5">Weight Out (Dispatch)</th>
              <th className="px-4 py-3.5">Variance (Loss/Gain)</th>
              <th className="px-4 py-3.5">Security Status</th>
              <th className="px-4 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
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
                    className={`transition hover:bg-slate-800/40 ${
                      isFlagged ? 'bg-red-950/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-bold text-white text-xs">{item.id}</div>
                      <div className="text-xs text-slate-300 font-medium">{item.senderName}</div>
                      <div className="text-[11px] text-slate-500">{item.trackingNumber}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                        {item.category}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Tol: ±{item.tolerancePercentage}%
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-bold text-sky-400 font-mono text-sm">
                        {item.weightInKg.toFixed(2)} kg
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.inboundDate.split(' ')[0]}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      {item.weightOutKg !== undefined ? (
                        <div>
                          <div className="font-bold text-indigo-400 font-mono text-sm">
                            {item.weightOutKg.toFixed(2)} kg
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {item.outboundDate?.split(' ')[0]}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Pending Re-weigh</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {item.weightDiffKg !== undefined ? (
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                            isFlagged 
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {item.weightDiffKg > 0 ? `+${item.weightDiffKg}` : item.weightDiffKg} kg
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ({item.weightLossPercentage}%)
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {isFlagged && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
                          <ShieldAlert className="w-3.5 h-3.5" /> Pilferage Flagged
                        </span>
                      )}
                      {isCleared && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched Cleared
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40">
                          <Clock className="w-3.5 h-3.5" /> Inbound Recorded
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      {onSelectShipment && (
                        <button
                          onClick={() => onSelectShipment(item)}
                          className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 inline-flex items-center gap-1 transition"
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
