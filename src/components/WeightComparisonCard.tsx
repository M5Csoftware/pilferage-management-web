'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Camera,
  Eye,
  FileImage,
  ExternalLink
} from 'lucide-react';
import { Shipment } from '@/types/shipment';
import { getOptimizedImageUrl } from '@/lib/cloudinary';
import { PhotoCaptureInput } from './PhotoCaptureInput';
import { PhotoLightboxModal } from './PhotoLightboxModal';

interface WeightComparisonCardProps {
  shipment: Shipment;
  testWeightOut?: number;
  onClearDispatch?: (weightOut: number, notes: string, outboundPhotoUrl?: string) => void;
  onFlagPilferage?: (weightOut: number, notes: string, reason: string, outboundPhotoUrl?: string) => void;
}

export const WeightComparisonCard: React.FC<WeightComparisonCardProps> = ({
  shipment,
  testWeightOut,
  onClearDispatch,
  onFlagPilferage
}) => {
  const currentWeightOut = testWeightOut !== undefined ? testWeightOut : (shipment.weightOutKg ?? 0);
  const diffKg = currentWeightOut ? +(currentWeightOut - shipment.weightInKg).toFixed(2) : 0;
  const diffPercent = shipment.weightInKg > 0 && currentWeightOut > 0 
    ? +((diffKg / shipment.weightInKg) * 100).toFixed(2) 
    : 0;

  const isWeightDeficit = diffKg < 0;
  const absLossPercent = Math.abs(diffPercent);
  const exceedsTolerance = isWeightDeficit && absLossPercent > shipment.tolerancePercentage;

  const [notes, setNotes] = useState(shipment.outboundNotes || '');
  const [outboundPhoto, setOutboundPhoto] = useState(shipment.weightOutPhotoUrl || '');
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    url: string;
    title: string;
    subtitle?: string;
    stage?: 'Inbound Arrival' | 'Outbound Dispatch' | 'Inspection';
    weightKg?: number;
    operator?: string;
    seal?: string;
    date?: string;
  }>({
    isOpen: false,
    url: '',
    title: '',
  });

  const isDispatchActionable = Boolean(onClearDispatch || onFlagPilferage);

  return (
    <div className="bg-white border border-[#ebdcd0] rounded-2xl p-4 sm:p-6 md:p-8 relative overflow-hidden shadow-xs text-[#412D15]">
      {/* Top indicator bar */}
      {exceedsTolerance && (
        <div className="absolute top-0 left-0 right-0 h-1.5 sm:h-2 bg-rose-600 animate-pulse" />
      )}
      {!exceedsTolerance && currentWeightOut > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1.5 sm:h-2 bg-emerald-600" />
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-[#ebdcd0]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#faf6f2] text-[#412D15] border border-[#ebdcd0]">
              {shipment.id}
            </span>
            <span className="text-xs sm:text-sm font-mono text-[#412D15] font-bold">AWB: {shipment.awbNumber}</span>
          </div>
          <h3 className="text-sm sm:text-base md:text-xl font-extrabold text-[#412D15] mt-1.5 truncate">
            {shipment.senderName} <span className="text-[#6E3511] text-xs sm:text-sm font-bold">→</span> {shipment.recipientName}
          </h3>
          <div className="text-[11px] sm:text-xs text-[#412D15]/70 mt-0.5">
            {shipment.origin} to {shipment.destination}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs bg-[#faf6f2] text-[#412D15] px-2.5 py-1 rounded-lg border border-[#ebdcd0] font-bold">
            {shipment.category}
          </span>
          <span className="text-xs text-[#412D15]/75 font-medium">
            Tolerance: <strong className="text-[#6E3511] font-mono font-bold">±{shipment.tolerancePercentage}%</strong>
          </span>
        </div>
      </div>

      {/* Side-by-side weight metrics (Responsive Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 my-4 sm:my-6">
        {/* Weight In */}
        <div className="bg-[#faf6f2] border border-[#ebdcd0] rounded-xl p-3.5 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#412D15]/70 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <span>Inbound (Arrival)</span>
            <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-[#6E3511]" />
          </div>
          <div className="my-2 sm:my-3">
            <span className="text-2xl sm:text-3xl md:text-4xl font-black text-[#412D15] tracking-tight font-mono">
              {shipment.weightInKg.toFixed(2)}
            </span>
            <span className="text-[#412D15]/60 ml-2 text-xs sm:text-sm font-bold">kg</span>
          </div>
          <div className="text-[11px] sm:text-xs text-[#412D15]/70 truncate">
            {shipment.inboundOperator} • {shipment.inboundDate}
          </div>
        </div>

        {/* Weight Out */}
        <div className="bg-[#faf6f2] border border-[#ebdcd0] rounded-xl p-3.5 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#412D15]/70 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <span>Outbound (Dispatch)</span>
            <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-[#6E3511]" />
          </div>
          <div className="my-2 sm:my-3">
            {currentWeightOut > 0 ? (
              <>
                <span className="text-2xl sm:text-3xl md:text-4xl font-black text-[#412D15] tracking-tight font-mono">
                  {currentWeightOut.toFixed(2)}
                </span>
                <span className="text-[#412D15]/60 ml-2 text-xs sm:text-sm font-bold">kg</span>
              </>
            ) : (
              <span className="text-xs sm:text-sm font-medium text-[#412D15]/50 italic">
                Awaiting scale reading...
              </span>
            )}
          </div>
          <div className="text-[11px] sm:text-xs text-[#412D15]/70 truncate">
            {shipment.outboundDate ? `${shipment.outboundDate} • ${shipment.outboundOperator}` : 'Scale ready for verification'}
          </div>
        </div>

        {/* Pilferage Variance Calculator */}
        <div className={`rounded-xl p-3.5 sm:p-5 border flex flex-col justify-between transition-all ${
          !currentWeightOut 
            ? 'bg-[#faf6f2] border-[#ebdcd0]' 
            : exceedsTolerance 
              ? 'bg-rose-50 border-rose-300' 
              : 'bg-emerald-50 border-emerald-300'
        }`}>
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <span className={exceedsTolerance ? 'text-rose-800' : 'text-[#412D15]/70'}>
              Variance Analysis
            </span>
            {exceedsTolerance ? (
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 shrink-0" />
            ) : currentWeightOut > 0 ? (
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
            ) : (
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[#6E3511]/60 shrink-0" />
            )}
          </div>

          <div className="my-2 sm:my-3">
            {currentWeightOut > 0 ? (
              <div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className={`text-2xl sm:text-3xl md:text-4xl font-black font-mono ${
                    exceedsTolerance ? 'text-rose-700' : 'text-emerald-700'
                  }`}>
                    {diffKg > 0 ? `+${diffKg}` : diffKg} kg
                  </span>
                  <span className={`text-[11px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    exceedsTolerance 
                      ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {diffPercent > 0 ? `+${diffPercent}%` : `${diffPercent}%`}
                  </span>
                </div>
                <div className="text-[11px] text-[#412D15]/75 mt-1 font-medium">
                  Allowed delta: ±{((shipment.weightInKg * shipment.tolerancePercentage) / 100).toFixed(2)} kg
                </div>
              </div>
            ) : (
              <div className="text-[#412D15]/60 text-xs py-1">
                Real-time variance will calculate immediately upon weighing.
              </div>
            )}
          </div>

          <div className="text-[11px] sm:text-xs">
            {exceedsTolerance ? (
              <span className="text-rose-700 font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> Discrepancy Exceeds Tolerance
              </span>
            ) : currentWeightOut > 0 ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Weight match confirmed
              </span>
            ) : (
              <span className="text-[#412D15]/60 font-medium">Threshold: ±{shipment.tolerancePercentage}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Discrepancy warning banner */}
      {exceedsTolerance && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-3.5 sm:p-5 mb-4 sm:mb-5 text-[#412D15]">
          <div className="flex items-start gap-2.5 sm:gap-3.5">
            <div className="p-1.5 sm:p-2 bg-rose-600 text-white rounded-lg shrink-0 mt-0.5">
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
            </div>
            <div>
              <h4 className="font-extrabold text-rose-900 text-xs sm:text-sm md:text-base">
                SECURITY ALERT: POTENTIAL PILFERAGE DETECTED
              </h4>
              <p className="text-[11px] sm:text-xs md:text-sm text-rose-800 mt-0.5 sm:mt-1">
                Parcel weighs <strong>{Math.abs(diffKg)} kg less</strong> than inbound arrival weight ({absLossPercent}% loss, permissible limit is {shipment.tolerancePercentage}%). Do not release for loading before physical unboxing audit.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Visual Photo Evidence Deck (Inbound vs Outbound Comparison) */}
      <div className="my-5 pt-4 sm:pt-5 border-t border-[#ebdcd0]">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#412D15] flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#6E3511]" />
            <span>Photographic Evidence (Chain-of-Custody)</span>
          </h4>
          <span className="text-[11px] text-[#412D15]/60 font-medium">
            Cloudinary Image Storage
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. Inbound Arrival Photo */}
          <div className="bg-[#faf6f2] border border-[#ebdcd0] rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between text-xs font-bold text-[#412D15] mb-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Inbound Arrival Photo
              </span>
              <span className="text-[11px] font-mono text-[#412D15]/60 font-normal">
                {shipment.weightInKg.toFixed(2)} kg
              </span>
            </div>

            {shipment.weightInPhotoUrl ? (
              <div 
                onClick={() => setLightboxData({
                  isOpen: true,
                  url: shipment.weightInPhotoUrl!,
                  title: `Inbound Photo Evidence • ${shipment.awbNumber}`,
                  subtitle: `Arrival scale reading: ${shipment.weightInKg.toFixed(2)} kg • Seal: ${shipment.sealNumberIn || 'N/A'}`,
                  stage: 'Inbound Arrival',
                  weightKg: shipment.weightInKg,
                  operator: shipment.inboundOperator,
                  seal: shipment.sealNumberIn,
                  date: shipment.inboundDate
                })}
                className="relative group cursor-pointer h-40 bg-[#1a120b] rounded-lg overflow-hidden border border-[#ebdcd0] flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getOptimizedImageUrl(shipment.weightInPhotoUrl, { width: 400, height: 300, crop: 'fill' })}
                  alt="Inbound Evidence"
                  className="w-full h-full object-cover transition group-hover:scale-105 duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-white text-xs font-bold transition">
                  <Eye className="w-5 h-5" />
                  <span>Click to Inspect High-Res</span>
                </div>
                <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] px-2 py-1 rounded truncate">
                  {shipment.inboundDate} • {shipment.inboundOperator}
                </div>
              </div>
            ) : (
              <div className="h-40 rounded-lg border-2 border-dashed border-[#ebdcd0] bg-white flex flex-col items-center justify-center text-center p-3 text-[#412D15]/50">
                <FileImage className="w-7 h-7 mb-1 text-[#412D15]/40" />
                <span className="text-xs font-medium">No arrival photo attached</span>
                <span className="text-[10px] text-[#412D15]/40 mt-0.5">AWB was registered with weight-only entry</span>
              </div>
            )}
          </div>

          {/* 2. Outbound Dispatch Photo */}
          <div className="bg-[#faf6f2] border border-[#ebdcd0] rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between text-xs font-bold text-[#412D15] mb-2">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${outboundPhoto ? 'bg-emerald-600' : 'bg-amber-500'}`} />
                Outbound Dispatch Photo
              </span>
              <span className="text-[11px] font-mono text-[#412D15]/60 font-normal">
                {currentWeightOut > 0 ? `${currentWeightOut.toFixed(2)} kg` : 'Pending Scale'}
              </span>
            </div>

            {isDispatchActionable ? (
              /* When in active dispatch re-weigh station, allow taking/uploading outbound photo */
              <PhotoCaptureInput
                label="Dispatch Verification Photo"
                sublabel="Capture re-weighed box on scale & seal condition."
                value={outboundPhoto}
                onChange={setOutboundPhoto}
                folder="pms_outbound"
                tag="outbound_dispatch"
                awbNumber={shipment.awbNumber}
                stageName="Outbound Dispatch"
              />
            ) : outboundPhoto ? (
              /* When inspecting historical record */
              <div 
                onClick={() => setLightboxData({
                  isOpen: true,
                  url: outboundPhoto,
                  title: `Outbound Dispatch Photo • ${shipment.awbNumber}`,
                  subtitle: `Departure scale reading: ${currentWeightOut.toFixed(2)} kg`,
                  stage: 'Outbound Dispatch',
                  weightKg: currentWeightOut,
                  operator: shipment.outboundOperator,
                  seal: shipment.sealNumberOut,
                  date: shipment.outboundDate
                })}
                className="relative group cursor-pointer h-40 bg-[#1a120b] rounded-lg overflow-hidden border border-[#ebdcd0] flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getOptimizedImageUrl(outboundPhoto, { width: 400, height: 300, crop: 'fill' })}
                  alt="Outbound Evidence"
                  className="w-full h-full object-cover transition group-hover:scale-105 duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-white text-xs font-bold transition">
                  <Eye className="w-5 h-5" />
                  <span>Click to Inspect High-Res</span>
                </div>
                <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] px-2 py-1 rounded truncate">
                  {shipment.outboundDate || 'Dispatch recorded'} • {shipment.outboundOperator}
                </div>
              </div>
            ) : (
              <div className="h-40 rounded-lg border-2 border-dashed border-[#ebdcd0] bg-white flex flex-col items-center justify-center text-center p-3 text-[#412D15]/50">
                <FileImage className="w-7 h-7 mb-1 text-[#412D15]/40" />
                <span className="text-xs font-medium">Pending dispatch re-weigh photo</span>
                <span className="text-[10px] text-[#412D15]/40 mt-0.5">Photo captured during outbound gate check</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons (Mobile Full-Width Responsive) */}
      {isDispatchActionable && currentWeightOut > 0 && (
        <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-[#ebdcd0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1">
            <input 
              type="text"
              placeholder="Inspection or security remarks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#faf6f2] text-[#412D15] text-xs sm:text-sm border border-[#ebdcd0] rounded-xl px-3.5 py-2.5 sm:py-3 focus:outline-none focus:border-[#6E3511] focus:bg-white transition min-h-[44px]"
            />
          </div>

          <div className="flex items-center gap-2.5">
            {exceedsTolerance ? (
              <button
                onClick={() => onFlagPilferage?.(
                  currentWeightOut, 
                  notes, 
                  `Weight shortfall of ${Math.abs(diffKg)} kg (${absLossPercent}% loss) detected on outbound scale.`,
                  outboundPhoto || undefined
                )}
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 bg-rose-700 hover:bg-rose-800 active:bg-rose-900 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition min-h-[44px]"
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Hold for Security Audit</span>
              </button>
            ) : (
              <button
                onClick={() => onClearDispatch?.(currentWeightOut, notes, outboundPhoto || undefined)}
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition min-h-[44px]"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Clear for Dispatch</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lightbox for zooming photos */}
      <PhotoLightboxModal
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData(prev => ({ ...prev, isOpen: false }))}
        imageUrl={lightboxData.url}
        title={lightboxData.title}
        subtitle={lightboxData.subtitle}
        metadata={{
          awbNumber: shipment.awbNumber,
          weightKg: lightboxData.weightKg,
          operator: lightboxData.operator,
          sealNumber: lightboxData.seal,
          date: lightboxData.date,
          stage: lightboxData.stage
        }}
      />
    </div>
  );
};
