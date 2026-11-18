import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  Info
} from 'lucide-react';
import { Shipment } from '@/types/shipment';

interface WeightComparisonCardProps {
  shipment: Shipment;
  testWeightOut?: number;
  onClearDispatch?: (weightOut: number, notes: string) => void;
  onFlagPilferage?: (weightOut: number, notes: string, reason: string) => void;
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

      {/* Action buttons (Mobile Full-Width Responsive) */}
      {(onClearDispatch || onFlagPilferage) && currentWeightOut > 0 && (
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
                  `Weight shortfall of ${Math.abs(diffKg)} kg (${absLossPercent}% loss) detected on outbound scale.`
                )}
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 bg-rose-700 hover:bg-rose-800 active:bg-rose-900 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition min-h-[44px]"
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Hold for Security Audit</span>
              </button>
            ) : (
              <button
                onClick={() => onClearDispatch?.(currentWeightOut, notes)}
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition min-h-[44px]"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Clear for Dispatch</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
