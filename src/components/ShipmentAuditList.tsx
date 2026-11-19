'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Search, 
  AlertTriangle,
  Scale,
  Eye,
  Camera,
  FileImage
} from 'lucide-react';
import { Shipment, AuthUser } from '@/types/shipment';
import { getOptimizedImageUrl } from '@/lib/cloudinary';
import { PhotoLightboxModal } from './PhotoLightboxModal';

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
    <div className="bg-white border border-[#ebdcd0] rounded-2xl p-4 sm:p-6 md:p-8 shadow-xs text-[#412D15]">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 sm:mb-6 pb-4 sm:pb-5 border-b border-[#ebdcd0]">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#412D15] flex items-center gap-2.5">
            <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-[#6E3511] stroke-[2] shrink-0" />
            <span>Consolidated Weight Audit Log</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#412D15]/70 font-normal mt-0.5">
            Complete chain-of-custody ledger comparing arrival baseline vs departure weight & photo evidence.
          </p>
        </div>

        {/* Status Filter Tabs (Horizontally swipeable on mobile) */}
        <div className="flex items-center bg-[#faf6f2] p-1 rounded-xl border border-[#ebdcd0] text-xs overflow-x-auto no-scrollbar w-full md:w-auto shrink-0 gap-1">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition min-h-[34px] ${
              filterStatus === 'ALL' ? 'bg-[#6E3511] text-white shadow-xs' : 'text-[#412D15]/80 hover:text-[#412D15]'
            }`}
          >
            All ({shipments.length})
          </button>
          <button
            onClick={() => setFilterStatus('FLAGGED')}
            className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition flex items-center gap-1.5 min-h-[34px] ${
              filterStatus === 'FLAGGED' 
                ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                : 'text-[#412D15]/80 hover:text-rose-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            Pilfered ({shipments.filter(s => s.status === 'PILFERAGE_FLAGGED').length})
          </button>
          <button
            onClick={() => setFilterStatus('CLEARED')}
            className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition min-h-[34px] ${
              filterStatus === 'CLEARED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'text-[#412D15]/80 hover:text-emerald-700'
            }`}
          >
            Cleared ({shipments.filter(s => s.status === 'DISPATCHED_CLEARED').length})
          </button>
          <button
            onClick={() => setFilterStatus('INBOUND')}
            className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition min-h-[34px] ${
              filterStatus === 'INBOUND' ? 'bg-[#ebdcd0] text-[#412D15]' : 'text-[#412D15]/80 hover:text-[#412D15]'
            }`}
          >
            Pending ({shipments.filter(s => s.status === 'INBOUND_RECORDED').length})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search AWB #, tracking ID, sender, recipient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#faf6f2] text-[#412D15] border border-[#ebdcd0] rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm md:text-base focus:border-[#6E3511] focus:bg-white focus:outline-none transition min-h-[44px]"
          />
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#6E3511]/60 absolute left-3.5 top-3 sm:top-3.5" />
        </div>
      </div>

      {/* Mobile Card List (Ultra Responsive for Phones) */}
      <div className="block lg:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-[#412D15]/60 text-xs sm:text-sm border border-[#ebdcd0] rounded-xl bg-[#faf6f2]">
            No shipments found matching criteria.
          </div>
        ) : (
          filtered.map((item) => {
            const isFlagged = item.status === 'PILFERAGE_FLAGGED';
            const isCleared = item.status === 'DISPATCHED_CLEARED';
            const isPending = item.status === 'INBOUND_RECORDED';
            const hasPhotos = Boolean(item.weightInPhotoUrl || item.weightOutPhotoUrl);

            return (
              <div 
                key={item.id}
                onClick={() => onSelectShipment?.(item)}
                className={`p-4 rounded-xl border text-xs sm:text-sm space-y-2.5 cursor-pointer transition shadow-2xs active:bg-[#f6eee7] ${
                  isFlagged 
                    ? 'bg-rose-50/70 border-rose-300' 
                    : 'bg-white border-[#ebdcd0] hover:border-[#dfcebf]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono font-bold text-[#412D15] text-xs sm:text-sm truncate">
                      {item.awbNumber}
                    </span>
                    <span className="text-[10px] text-[#412D15]/50 font-mono">
                      {item.id}
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5">
                    {hasPhotos && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#faf6f2] text-[#6E3511] border border-[#ebdcd0] flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        {item.weightInPhotoUrl && item.weightOutPhotoUrl ? '2 Photos' : 'Photo'}
                      </span>
                    )}
                    {isFlagged && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                        FLAGGED
                      </span>
                    )}
                    {isCleared && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        CLEARED
                      </span>
                    )}
                    {isPending && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#faf6f2] text-[#412D15] border border-[#ebdcd0]">
                        PENDING
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[#412D15] font-semibold truncate text-xs sm:text-sm">
                  {item.senderName} → {item.recipientName}
                </div>

                <div className="grid grid-cols-3 gap-2 bg-[#faf6f2] p-2.5 rounded-lg border border-[#ebdcd0] font-mono text-center">
                  <div>
                    <span className="text-[#412D15]/60 block text-[9px] uppercase font-sans font-bold">Inbound</span>
                    <span className="text-[#412D15] font-bold text-xs">{item.weightInKg.toFixed(2)} kg</span>
                  </div>
                  <div>
                    <span className="text-[#412D15]/60 block text-[9px] uppercase font-sans font-bold">Outbound</span>
                    <span className="text-[#412D15] font-bold text-xs">
                      {item.weightOutKg !== undefined ? `${item.weightOutKg.toFixed(2)} kg` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#412D15]/60 block text-[9px] uppercase font-sans font-bold">Variance</span>
                    <span className={`font-black text-xs ${isFlagged ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {item.weightDiffKg !== undefined ? `${item.weightDiffKg > 0 ? `+${item.weightDiffKg}` : item.weightDiffKg} kg` : '—'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#412D15]/60 pt-0.5">
                  <span className="truncate">{item.category} • Tol: ±{item.tolerancePercentage}%</span>
                  <span className="text-[#6E3511] font-bold shrink-0 ml-2">Inspect Details →</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Responsive Table for Desktop */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-[#ebdcd0]">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-[#faf6f2] text-[#412D15] uppercase tracking-wider border-b border-[#ebdcd0] font-bold text-xs">
            <tr className="divide-x divide-[#ebdcd0]">
              <th className="px-5 py-4 border-r border-[#ebdcd0]">AWB & Shipment</th>
              <th className="px-5 py-4 border-r border-[#ebdcd0]">Route</th>
              <th className="px-5 py-4 border-r border-[#ebdcd0]">Category</th>
              <th className="px-5 py-4 text-right border-r border-[#ebdcd0]">Inbound (kg)</th>
              <th className="px-5 py-4 text-right border-r border-[#ebdcd0]">Outbound (kg)</th>
              <th className="px-5 py-4 text-right border-r border-[#ebdcd0]">Variance</th>
              <th className="px-5 py-4 border-r border-[#ebdcd0]">Evidence</th>
              <th className="px-5 py-4 border-r border-[#ebdcd0]">Status</th>
              <th className="px-5 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebdcd0]/70 bg-white text-[#412D15] font-medium">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-[#412D15]/60">
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
                    className={`divide-x divide-[#ebdcd0] transition hover:bg-[#faf6f2] ${
                      isFlagged ? 'bg-rose-50/50' : ''
                    }`}
                  >
                    <td className="px-5 py-4 border-r border-[#ebdcd0]">
                      <div className="font-mono font-bold text-[#412D15] text-sm">{item.awbNumber}</div>
                      <div className="text-xs text-[#412D15]/75 font-medium">{item.senderName}</div>
                      <div className="text-[11px] text-[#412D15]/50 font-mono">{item.id}</div>
                    </td>

                    <td className="px-5 py-4 text-xs text-[#412D15]/75 border-r border-[#ebdcd0]">
                      <div>{item.origin}</div>
                      <div className="text-[#412D15]/50">→ {item.destination}</div>
                    </td>

                    <td className="px-5 py-4 border-r border-[#ebdcd0]">
                      <span className="px-2.5 py-1 rounded bg-[#faf6f2] text-[#412D15] border border-[#ebdcd0] text-xs font-semibold">
                        {item.category}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right font-mono font-bold text-[#412D15] text-base border-r border-[#ebdcd0]">
                      {item.weightInKg.toFixed(2)}
                    </td>

                    <td className="px-5 py-4 text-right font-mono font-bold text-[#412D15] text-base border-r border-[#ebdcd0]">
                      {item.weightOutKg !== undefined ? item.weightOutKg.toFixed(2) : '—'}
                    </td>

                    <td className="px-5 py-4 text-right font-mono border-r border-[#ebdcd0]">
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

                    {/* Photo Evidence Column */}
                    <td className="px-5 py-4 border-r border-[#ebdcd0]">
                      <div className="flex items-center gap-1.5">
                        {item.weightInPhotoUrl ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLightboxData({
                                isOpen: true,
                                url: item.weightInPhotoUrl!,
                                title: `Arrival Scale Photo • ${item.awbNumber}`,
                                subtitle: `Weight In: ${item.weightInKg.toFixed(2)} kg`,
                                metadata: {
                                  awbNumber: item.awbNumber,
                                  weightKg: item.weightInKg,
                                  operator: item.inboundOperator,
                                  date: item.inboundDate,
                                  sealNumber: item.sealNumberIn
                                }
                              });
                            }}
                            className="p-1 rounded-lg border border-[#ebdcd0] bg-[#faf6f2] hover:bg-[#ebdcd0] transition text-[#6E3511]"
                            title="View Inbound Arrival Photo"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                        ) : null}

                        {item.weightOutPhotoUrl ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLightboxData({
                                isOpen: true,
                                url: item.weightOutPhotoUrl!,
                                title: `Dispatch Scale Photo • ${item.awbNumber}`,
                                subtitle: `Weight Out: ${item.weightOutKg?.toFixed(2)} kg`,
                                metadata: {
                                  awbNumber: item.awbNumber,
                                  weightKg: item.weightOutKg,
                                  operator: item.outboundOperator,
                                  date: item.outboundDate,
                                  sealNumber: item.sealNumberOut
                                }
                              });
                            }}
                            className="p-1 rounded-lg border border-[#ebdcd0] bg-emerald-50 hover:bg-emerald-100 transition text-emerald-800"
                            title="View Outbound Dispatch Photo"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                        ) : null}

                        {!item.weightInPhotoUrl && !item.weightOutPhotoUrl && (
                          <span className="text-xs text-[#412D15]/40 italic">None</span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 border-r border-[#ebdcd0]">
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
                          className="text-xs text-[#412D15] hover:text-white bg-[#faf6f2] hover:bg-[#6E3511] px-3.5 py-1.5 rounded-lg border border-[#ebdcd0] inline-flex items-center gap-1.5 transition font-bold min-h-[34px]"
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

      {/* Lightbox for zooming photos from audit list */}
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
