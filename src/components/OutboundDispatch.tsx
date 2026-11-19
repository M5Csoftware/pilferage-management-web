'use client';

import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  Scale, 
  CheckCircle, 
  Zap,
  ListFilter
} from 'lucide-react';
import { Shipment, AuthUser } from '@/types/shipment';
import { SystemSettings } from '@/types/settings';
import { WeightComparisonCard } from './WeightComparisonCard';

interface OutboundDispatchProps {
  shipments: Shipment[];
  onUpdateShipment: (updated: Shipment) => void;
  currentUser: AuthUser;
  settings: SystemSettings;
}

export const OutboundDispatch: React.FC<OutboundDispatchProps> = ({ 
  shipments, 
  onUpdateShipment,
  currentUser,
  settings
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [scaleReading, setScaleReading] = useState<string>('');
  const [mobileTab, setMobileTab] = useState<'scale' | 'queue'>('scale');

  const pendingShipments = shipments.filter(s => s.status === 'INBOUND_RECORDED');
  const selectedShipment = shipments.find(s => s.id === selectedShipmentId) || 
    (pendingShipments.length > 0 ? pendingShipments[0] : null);

  const parsedScale = parseFloat(scaleReading) || 0;

  const handleSimulateNormalWeight = () => {
    if (!selectedShipment) return;
    const simulated = +(selectedShipment.weightInKg * 0.9985).toFixed(2);
    setScaleReading(simulated.toString());
  };

  const handleSimulatePilferageTheft = () => {
    if (!selectedShipment) return;
    const simulated = +(selectedShipment.weightInKg * 0.85).toFixed(2);
    setScaleReading(simulated.toString());
  };

  const handleClearDispatch = (weightOut: number, notes: string, outboundPhotoUrl?: string) => {
    if (!selectedShipment) return;
    const diff = +(weightOut - selectedShipment.weightInKg).toFixed(2);
    const pct = +((diff / selectedShipment.weightInKg) * 100).toFixed(2);

    const updated: Shipment = {
      ...selectedShipment,
      weightOutKg: weightOut,
      outboundDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      outboundOperator: currentUser.name,
      outboundNotes: notes || 'Verified weight consistency within permissible limits. Cleared for courier.',
      weightDiffKg: diff,
      weightLossPercentage: pct,
      weightOutPhotoUrl: outboundPhotoUrl || selectedShipment.weightOutPhotoUrl,
      status: 'DISPATCHED_CLEARED'
    };

    onUpdateShipment(updated);
    setScaleReading('');
  };

  const handleFlagPilferage = (weightOut: number, notes: string, reason: string, outboundPhotoUrl?: string) => {
    if (!selectedShipment) return;
    const diff = +(weightOut - selectedShipment.weightInKg).toFixed(2);
    const pct = +((diff / selectedShipment.weightInKg) * 100).toFixed(2);

    const updated: Shipment = {
      ...selectedShipment,
      weightOutKg: weightOut,
      outboundDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      outboundOperator: `${currentUser.name} (Security Hold)`,
      outboundNotes: notes || 'Discrepancy flagged. Security team alerted for physical carton audit.',
      weightDiffKg: diff,
      weightLossPercentage: pct,
      flaggedReason: reason,
      weightOutPhotoUrl: outboundPhotoUrl || selectedShipment.weightOutPhotoUrl,
      status: 'PILFERAGE_FLAGGED'
    };

    onUpdateShipment(updated);
    setScaleReading('');
  };

  return (
    <div className="space-y-4 sm:space-y-6 text-[#412D15]">
      {/* Top Banner Info */}
      <div className="bg-white border border-[#ebdcd0] rounded-2xl p-4 sm:p-6 md:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#412D15] flex items-center gap-2.5">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-[#6E3511] stroke-[2] shrink-0" />
              <span>Outbound Dispatch & Re-Weigh Gate</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#412D15]/70 font-normal mt-1">
              Re-weigh packages on departure scale to verify zero cargo tampering before vehicle departure.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#faf6f2] px-3.5 py-1.5 rounded-xl border border-[#ebdcd0] text-xs self-start sm:self-auto font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-[#412D15] font-mono font-bold">Port: {settings.scaleComPort}</span>
          </div>
        </div>
      </div>

      {/* Mobile-Only Fast Queue Strip: quick swipeable pills to switch AWB without leaving scale view */}
      <div className="lg:hidden bg-white border border-[#ebdcd0] rounded-2xl p-3 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold mb-2 text-[#412D15]/75">
          <span className="flex items-center gap-1.5">
            <ListFilter className="w-3.5 h-3.5 text-[#6E3511]" />
            Quick Select Pending AWB ({pendingShipments.length}):
          </span>
          <button
            onClick={() => setMobileTab(mobileTab === 'scale' ? 'queue' : 'scale')}
            className="text-[#6E3511] font-bold underline"
          >
            {mobileTab === 'scale' ? 'View All Queue' : 'Back to Scale'}
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {pendingShipments.map(s => {
            const isSelected = selectedShipment?.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedShipmentId(s.id);
                  setScaleReading('');
                  setMobileTab('scale');
                }}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap border shrink-0 transition ${
                  isSelected
                    ? 'bg-[#6E3511] text-white border-[#6E3511] shadow-2xs'
                    : 'bg-[#faf6f2] text-[#412D15] border-[#ebdcd0] hover:bg-[#f6eee7]'
                }`}
              >
                {s.awbNumber} ({s.weightInKg.toFixed(1)} kg)
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left Column: Shipment Selector Queue (Always on Desktop, Tabbed on Mobile) */}
        <div className={`
          lg:col-span-4 bg-white border border-[#ebdcd0] rounded-2xl p-4 sm:p-6 flex flex-col h-full shadow-xs
          ${mobileTab === 'scale' ? 'hidden lg:flex' : 'flex'}
        `}>
          <div className="mb-4">
            <label className="text-xs font-bold text-[#412D15] uppercase tracking-wider block mb-2">
              Select AWB to Dispatch
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search AWB, ID or sender..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#faf6f2] text-[#412D15] border border-[#ebdcd0] rounded-xl pl-9 pr-3.5 py-2.5 text-sm focus:border-[#6E3511] focus:bg-white focus:outline-none transition min-h-[42px]"
              />
              <Search className="w-4 h-4 text-[#6E3511]/60 absolute left-3 top-3" />
            </div>
          </div>

          <div className="text-xs font-bold text-[#412D15]/70 mb-3 flex items-center justify-between">
            <span>Pending Out ({pendingShipments.length})</span>
            <span className="text-[#6E3511] font-bold">Ready for scale</span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[380px] lg:max-h-[520px] pr-1">
            {pendingShipments.length === 0 ? (
              <div className="text-center py-10 text-[#412D15]/60 text-xs sm:text-sm border border-dashed border-[#ebdcd0] rounded-xl bg-[#faf6f2]">
                No shipments awaiting outbound weigh-check.
              </div>
            ) : (
              pendingShipments
                .filter(s => 
                  s.awbNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  s.senderName.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(shipment => {
                  const isSelected = selectedShipment?.id === shipment.id;
                  return (
                    <div
                      key={shipment.id}
                      onClick={() => {
                        setSelectedShipmentId(shipment.id);
                        setScaleReading('');
                        setMobileTab('scale');
                      }}
                      className={`p-3.5 sm:p-4 rounded-xl border cursor-pointer transition flex flex-col gap-1.5 text-left ${
                        isSelected 
                          ? 'bg-[#6E3511] text-white border-[#6E3511] shadow-xs' 
                          : 'bg-[#faf6f2] border-[#ebdcd0] hover:bg-[#f6eee7] hover:border-[#dfcebf]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono font-bold ${isSelected ? 'text-amber-100' : 'text-[#412D15]/70'}`}>
                          {shipment.id}
                        </span>
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          isSelected ? 'bg-black/25 text-white border border-white/20' : 'bg-white text-[#412D15] border border-[#ebdcd0]'
                        }`}>
                          {shipment.weightInKg.toFixed(2)} kg
                        </span>
                      </div>
                      <div className={`text-sm font-mono font-bold truncate ${isSelected ? 'text-white' : 'text-[#412D15]'}`}>
                        AWB: {shipment.awbNumber}
                      </div>
                      <div className={`text-xs truncate font-medium ${isSelected ? 'text-amber-100/90' : 'text-[#412D15]/75'}`}>
                        {shipment.senderName}
                      </div>
                      <div className={`flex items-center justify-between text-[11px] pt-1.5 border-t ${
                        isSelected ? 'border-white/20 text-amber-100/80' : 'border-[#ebdcd0] text-[#412D15]/60'
                      }`}>
                        <span>{shipment.category}</span>
                        <span className="font-mono">±{shipment.tolerancePercentage}% Tol</span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Right Column: Live Scale Re-Weigh Station */}
        <div className={`
          lg:col-span-8 space-y-4 sm:space-y-6
          ${mobileTab === 'queue' ? 'hidden lg:block' : 'block'}
        `}>
          {selectedShipment ? (
            <>
              {/* Active Scale Controller */}
              <div className="bg-white border border-[#ebdcd0] rounded-2xl p-4 sm:p-6 md:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5">
                  <div>
                    <span className="text-[10px] sm:text-xs font-mono font-bold uppercase bg-[#6E3511]/10 text-[#6E3511] px-2.5 py-1 rounded-md border border-[#6E3511]/25">
                      Scale Deck 02 • Active
                    </span>
                    <h3 className="text-base sm:text-lg md:text-xl font-black text-[#412D15] mt-1.5 truncate">
                      Place AWB <span className="font-mono text-[#6E3511]">{selectedShipment.awbNumber}</span> on Scale
                    </h3>
                  </div>

                  {/* Simulator / Test Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSimulateNormalWeight}
                      className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 active:bg-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition font-bold min-h-[36px]"
                      title="Simulate normal weight match"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Simulate Safe</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSimulatePilferageTheft}
                      className="text-xs bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 active:bg-rose-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition font-bold min-h-[36px]"
                      title="Simulate stolen contents"
                    >
                      <Zap className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Simulate Pilferage (-15%)</span>
                    </button>
                  </div>
                </div>

                {/* Digital Scale Terminal UI */}
                <div className="bg-[#412D15] rounded-2xl border-2 border-[#543b1c] p-4 sm:p-6 text-white shadow-sm">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#6E3511] rounded-xl border border-[#834015] shrink-0">
                        <Scale className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] uppercase tracking-widest text-amber-200/80 font-bold truncate">
                          Digital Scale (Outbound)
                        </div>
                        <div className="text-xs sm:text-sm text-amber-100/90 mt-0.5 font-medium truncate">
                          Baseline: <strong className="text-white font-mono text-sm sm:text-base font-bold">{selectedShipment.weightInKg.toFixed(2)} kg</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <div className="relative w-full sm:w-auto">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={scaleReading}
                          onChange={(e) => setScaleReading(e.target.value)}
                          className="w-full sm:w-52 bg-[#251809] text-3xl sm:text-4xl md:text-5xl font-mono font-black text-emerald-400 border-2 border-emerald-500/50 rounded-xl px-4 py-2 text-right focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                        />
                        <span className="absolute right-4 bottom-2.5 sm:bottom-3 text-xs sm:text-sm font-bold text-amber-200/60 pointer-events-none">
                          KG
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Comparison Card */}
              <WeightComparisonCard
                shipment={selectedShipment}
                testWeightOut={parsedScale > 0 ? parsedScale : undefined}
                onClearDispatch={handleClearDispatch}
                onFlagPilferage={handleFlagPilferage}
              />
            </>
          ) : (
            <div className="bg-white border border-[#ebdcd0] rounded-2xl p-8 sm:p-12 text-center text-[#412D15]/60 shadow-xs">
              <Scale className="w-10 h-10 sm:w-12 sm:h-12 text-[#6E3511] mx-auto mb-3 opacity-70" />
              <h3 className="text-base font-bold text-[#412D15]">No AWB Consignment Selected</h3>
              <p className="text-xs sm:text-sm text-[#412D15]/70 mt-1 max-w-sm mx-auto">
                Select an inbound AWB from the queue to verify weight before dispatch.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
