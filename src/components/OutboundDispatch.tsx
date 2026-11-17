'use client';

import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  Scale, 
  AlertOctagon, 
  CheckCircle, 
  ShieldAlert, 
  ArrowRight,
  RefreshCw,
  QrCode,
  Zap
} from 'lucide-react';
import { Shipment } from '@/types/shipment';
import { WeightComparisonCard } from './WeightComparisonCard';

interface OutboundDispatchProps {
  shipments: Shipment[];
  onUpdateShipment: (updated: Shipment) => void;
}

export const OutboundDispatch: React.FC<OutboundDispatchProps> = ({ 
  shipments, 
  onUpdateShipment 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [scaleReading, setScaleReading] = useState<string>('');
  const [isSimulatingTare, setIsSimulatingTare] = useState(false);

  // Filter shipments waiting for dispatch or already dispatched
  const pendingShipments = shipments.filter(s => s.status === 'INBOUND_RECORDED');
  const auditedShipments = shipments.filter(s => s.status !== 'INBOUND_RECORDED');

  const selectedShipment = shipments.find(s => s.id === selectedShipmentId) || 
    (pendingShipments.length > 0 ? pendingShipments[0] : null);

  const parsedScale = parseFloat(scaleReading) || 0;

  // Simulator buttons to test different scenarios quickly (Exact weight, Normal slight variance, Pilferage missing 20%)
  const handleSimulateNormalWeight = () => {
    if (!selectedShipment) return;
    // -0.2% variance
    const simulated = +(selectedShipment.weightInKg * 0.998).toFixed(2);
    setScaleReading(simulated.toString());
  };

  const handleSimulatePilferageTheft = () => {
    if (!selectedShipment) return;
    // Missing 12% to 25% (e.g. phones/items taken out)
    const simulated = +(selectedShipment.weightInKg * 0.82).toFixed(2);
    setScaleReading(simulated.toString());
  };

  const handleClearDispatch = (weightOut: number, notes: string) => {
    if (!selectedShipment) return;
    const diff = +(weightOut - selectedShipment.weightInKg).toFixed(2);
    const pct = +((diff / selectedShipment.weightInKg) * 100).toFixed(2);

    const updated: Shipment = {
      ...selectedShipment,
      weightOutKg: weightOut,
      outboundDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      outboundOperator: 'Dispatch Officer R. Kelly',
      outboundNotes: notes || 'Verified weight consistency within permissible limits. Cleared for courier.',
      weightDiffKg: diff,
      weightLossPercentage: pct,
      status: 'DISPATCHED_CLEARED'
    };

    onUpdateShipment(updated);
    setScaleReading('');
  };

  const handleFlagPilferage = (weightOut: number, notes: string, reason: string) => {
    if (!selectedShipment) return;
    const diff = +(weightOut - selectedShipment.weightInKg).toFixed(2);
    const pct = +((diff / selectedShipment.weightInKg) * 100).toFixed(2);

    const updated: Shipment = {
      ...selectedShipment,
      weightOutKg: weightOut,
      outboundDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      outboundOperator: 'Dispatch Officer R. Kelly (Security Hold)',
      outboundNotes: notes || 'Discrepancy flagged. Security team alerted for physical carton audit.',
      weightDiffKg: diff,
      weightLossPercentage: pct,
      flaggedReason: reason,
      status: 'PILFERAGE_FLAGGED'
    };

    onUpdateShipment(updated);
    setScaleReading('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-400" />
              Outbound Dispatch & Anti-Pilferage Gate (Step 2)
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Every package scheduled for truck/courier loading must undergo strict re-weighing. 
              The system cross-checks against the locked inbound weight to prevent en-route theft.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-300 font-medium">Digital Scale Stream: Connected</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Shipment Selector Queue */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-full">
          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Select Package to Dispatch
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search tracking, ID or sender..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="text-xs font-medium text-slate-400 mb-2 flex items-center justify-between">
            <span>Pending Weigh-Out ({pendingShipments.length})</span>
            <span className="text-indigo-400 text-[11px]">Ready for scale</span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[480px] pr-1">
            {pendingShipments.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
                No shipments awaiting outbound weight.
              </div>
            ) : (
              pendingShipments
                .filter(s => 
                  s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition flex flex-col gap-1 text-left ${
                        isSelected 
                          ? 'bg-indigo-950/40 border-indigo-500/60 shadow-md ring-1 ring-indigo-500/30' 
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-white">
                          {shipment.id}
                        </span>
                        <span className="text-xs font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/50">
                          {shipment.weightInKg.toFixed(2)} kg
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 font-medium truncate">
                        {shipment.senderName}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                        <span>{shipment.trackingNumber}</span>
                        <span>{shipment.category}</span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Right Column: Live Scale Re-Weigh Station */}
        <div className="lg:col-span-8 space-y-6">
          {selectedShipment ? (
            <>
              {/* Active Scale Controller */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <span className="text-xs font-mono uppercase bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-500/20">
                      Station 02 • Outbound Scale Deck
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2">
                      Place Package <span className="text-indigo-400 font-mono">{selectedShipment.id}</span> on Scale
                    </h3>
                  </div>

                  {/* Simulator / Test Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSimulateNormalWeight}
                      className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900/60 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                      title="Simulate normal weight match within tolerance"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      Simulate Safe Weight
                    </button>
                    <button
                      type="button"
                      onClick={handleSimulatePilferageTheft}
                      className="text-xs bg-red-950 text-red-300 border border-red-700/50 hover:bg-red-900/60 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                      title="Simulate stolen contents (missing kilograms)"
                    >
                      <Zap className="w-3.5 h-3.5 text-red-400" />
                      Simulate Pilferage (-18%)
                    </button>
                  </div>
                </div>

                {/* Digital Scale Terminal UI */}
                <div className="bg-black/80 rounded-2xl border-2 border-slate-700 p-6 shadow-2xl relative">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-600/20 rounded-xl text-indigo-400 border border-indigo-500/30">
                        <Scale className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                          Current Scale Payload (Outbound)
                        </div>
                        <div className="text-xs text-slate-500">
                          Digital loadcell ready • Expected arrival: {selectedShipment.weightInKg.toFixed(2)} kg
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={scaleReading}
                          onChange={(e) => setScaleReading(e.target.value)}
                          className="w-48 bg-slate-950 text-4xl font-mono font-black text-emerald-400 border-2 border-emerald-500/40 rounded-xl px-4 py-2 text-right focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                        />
                        <span className="absolute right-3.5 bottom-3 text-sm font-bold text-slate-400">
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <Scale className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">No Shipment Selected</h3>
              <p className="text-sm mt-1 max-w-md mx-auto">
                Select an inbound parcel from the queue on the left or use the Inbound Intake tab to log new packages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
