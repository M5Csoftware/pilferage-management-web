import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  Package, 
  ArrowRight,
  TrendingDown,
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
  const [operator, setOperator] = useState(shipment.outboundOperator || 'Current Station User');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
      {/* Background ambient indicator */}
      {exceedsTolerance && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 animate-pulse" />
      )}
      {!exceedsTolerance && currentWeightOut > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
      )}

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {shipment.id}
            </span>
            <span className="text-xs text-slate-400">Tracking: {shipment.trackingNumber}</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">
            {shipment.senderName} <span className="text-slate-500 text-sm">→</span> {shipment.recipientName}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
            {shipment.category}
          </span>
          <span className="text-xs text-slate-400">
            Max Tolerance: <strong className="text-amber-400">±{shipment.tolerancePercentage}%</strong>
          </span>
        </div>
      </div>

      {/* Side-by-side weight metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        {/* Weight In */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Inbound Weight (Arrival)</span>
            <Scale className="w-4 h-4 text-sky-400" />
          </div>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {shipment.weightInKg.toFixed(2)}
            </span>
            <span className="text-slate-400 ml-1.5 font-medium text-sm">kg</span>
          </div>
          <div className="text-xs text-slate-500">
            Operator: {shipment.inboundOperator} • {shipment.inboundDate}
          </div>
        </div>

        {/* Weight Out */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Outbound Weight (Dispatch)</span>
            <Scale className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="my-3">
            {currentWeightOut > 0 ? (
              <>
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {currentWeightOut.toFixed(2)}
                </span>
                <span className="text-slate-400 ml-1.5 font-medium text-sm">kg</span>
              </>
            ) : (
              <span className="text-2xl font-semibold text-slate-600 italic">
                Awaiting scale reading...
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500">
            {shipment.outboundDate ? `${shipment.outboundDate} • ${shipment.outboundOperator}` : 'Scale ready for verification'}
          </div>
        </div>

        {/* Pilferage Variance Calculator */}
        <div className={`rounded-xl p-4 border flex flex-col justify-between transition-all ${
          !currentWeightOut 
            ? 'bg-slate-950/40 border-slate-800' 
            : exceedsTolerance 
              ? 'bg-red-950/40 border-red-500/50 shadow-lg shadow-red-950/40' 
              : 'bg-emerald-950/30 border-emerald-500/40'
        }`}>
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider">
            <span className={exceedsTolerance ? 'text-red-400 font-bold' : 'text-slate-400'}>
              Variance Analysis
            </span>
            {exceedsTolerance ? (
              <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce" />
            ) : currentWeightOut > 0 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Info className="w-4 h-4 text-slate-500" />
            )}
          </div>

          <div className="my-3">
            {currentWeightOut > 0 ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-black ${
                    exceedsTolerance ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {diffKg > 0 ? `+${diffKg}` : diffKg} kg
                  </span>
                  <span className={`text-sm font-semibold px-2 py-0.5 rounded ${
                    exceedsTolerance 
                      ? 'bg-red-500/20 text-red-300' 
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {diffPercent > 0 ? `+${diffPercent}%` : `${diffPercent}%`}
                  </span>
                </div>
                <div className="text-xs mt-1 text-slate-400">
                  Allowed delta: ±{((shipment.weightInKg * shipment.tolerancePercentage) / 100).toFixed(2)} kg
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-sm py-2">
                Real-time loss computation will display immediately upon weighing.
              </div>
            )}
          </div>

          <div className="text-xs">
            {exceedsTolerance ? (
              <span className="text-red-400 font-semibold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> High Risk Pilferage Flagged!
              </span>
            ) : currentWeightOut > 0 ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Normal weight consistency
              </span>
            ) : (
              <span className="text-slate-500">Threshold: ±{shipment.tolerancePercentage}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Discrepancy warning banner if pilferage detected */}
      {exceedsTolerance && (
        <div className="bg-red-950/60 border border-red-500/60 rounded-xl p-4 mb-4 text-red-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-600/20 text-red-400 rounded-lg shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-red-100 flex items-center gap-2">
                SECURITY ALERT: POTENTIAL PILFERAGE DETECTED
              </h4>
              <p className="text-sm text-red-300 mt-1">
                The parcel weighs <strong>{Math.abs(diffKg)} kg less</strong> than its logged inbound weight. 
                This deficit represents a <strong>{absLossPercent}% reduction</strong>, which significantly violates 
                the specified category limit of {shipment.tolerancePercentage}%. 
                Do not allow driver departure until security unboxing & item count verification is performed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons if this is an interactive check */}
      {(onClearDispatch || onFlagPilferage) && currentWeightOut > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[200px]">
            <input 
              type="text"
              placeholder="Add inspection or security remarks (optional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 text-sm border border-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {exceedsTolerance ? (
              <button
                onClick={() => onFlagPilferage?.(
                  currentWeightOut, 
                  notes, 
                  `Critical deficit of ${Math.abs(diffKg)} kg (${absLossPercent}% loss) detected at outbound weigh-in station.`
                )}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold text-sm flex items-center gap-2 shadow-lg shadow-red-900/40 transition active:scale-95"
              >
                <ShieldAlert className="w-4 h-4" />
                Trigger Pilferage Alert & Hold
              </button>
            ) : (
              <button
                onClick={() => onClearDispatch?.(currentWeightOut, notes)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                Verify & Clear for Dispatch
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
