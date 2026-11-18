'use client';

import React, { useState } from 'react';
import { 
  PackagePlus, 
  Scale, 
  ShieldCheck, 
  Barcode, 
  CheckCircle,
  Truck,
  Sparkles,
  Plane
} from 'lucide-react';
import { Shipment, AuthUser } from '@/types/shipment';
import { SystemSettings } from '@/types/settings';

interface InboundWeighFormProps {
  onShipmentRecorded: (shipment: Shipment) => void;
  currentUser: AuthUser;
  settings: SystemSettings;
}

export const InboundWeighForm: React.FC<InboundWeighFormProps> = ({ 
  onShipmentRecorded, 
  currentUser,
  settings 
}) => {
  const [awbNumber, setAwbNumber] = useState('');
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [origin, setOrigin] = useState('Shenzhen Freight Port');
  const [destination, setDestination] = useState('Delhi Cargo Terminal Hub');
  const [category, setCategory] = useState<Shipment['category']>('Electronics');
  const [itemsCount, setItemsCount] = useState<number>(1);
  const [weightInKg, setWeightInKg] = useState<string>('');
  const [operator, setOperator] = useState(currentUser.name || 'Scale Operator 1');
  const [sealNumber, setSealNumber] = useState('');
  const [tolerance, setTolerance] = useState<number>(settings.defaultTolerancePercentage);
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFillDemo = () => {
    const randomAwb = Math.floor(10000000 + Math.random() * 90000000);
    setAwbNumber(`AWB-${randomAwb}`);
    setSenderName('Shenzhen Global Electronics Ltd');
    setRecipientName('Nexus Warehousing Tech Hub');
    setOrigin('Hong Kong International HKG-Air');
    setDestination(settings.hubName);
    setCategory('Electronics');
    setItemsCount(48);
    setWeightInKg((85.40 + Math.random() * 12).toFixed(2));
    setSealNumber(`SEAL-${Math.floor(100000 + Math.random() * 900000)}`);
    setTolerance(settings.defaultTolerancePercentage);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!awbNumber || !weightInKg || parseFloat(weightInKg) <= 0) {
      alert('Please fill out the Air Waybill (AWB) number and a valid weight in kg.');
      return;
    }

    const newShipment: Shipment = {
      id: `SHP-${Math.floor(10000 + Math.random() * 90000)}`,
      awbNumber: awbNumber.trim().toUpperCase(),
      senderName: senderName || 'Declared Freight Forwarder',
      recipientName: recipientName || 'Target Receiver Facility',
      origin: origin || 'Local Gateway',
      destination: destination || settings.hubName,
      category,
      itemsCount: itemsCount || 1,
      tolerancePercentage: tolerance,
      inboundDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      weightInKg: parseFloat(weightInKg),
      inboundOperator: operator,
      sealNumberIn: sealNumber || `SEAL-${Math.floor(10000 + Math.random() * 90000)}`,
      inboundNotes: notes,
      status: 'INBOUND_RECORDED'
    };

    onShipmentRecorded(newShipment);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setAwbNumber('');
      setWeightInKg('');
      setSealNumber('');
      setNotes('');
    }, 2000);
  };

  return (
    <div className="bg-white border border-[#ebdcd0] rounded-2xl p-4 sm:p-7 md:p-10 shadow-xs max-w-4xl mx-auto text-[#412D15]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-[#ebdcd0]">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#412D15] flex items-center gap-2.5">
            <PackagePlus className="w-5 h-5 sm:w-6 sm:h-6 text-[#6E3511] stroke-[2] shrink-0" />
            <span>Inbound Intake & Weight Recording</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#412D15]/70 font-normal mt-1">
            Record arrival AWB scale reading and security seal to lock baseline weight.
          </p>
        </div>

        <button
          type="button"
          onClick={handleFillDemo}
          className="w-full sm:w-auto text-xs sm:text-sm bg-[#faf6f2] hover:bg-[#f6eee7] active:bg-[#ebdcd0] text-[#412D15] border border-[#ebdcd0] px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition font-bold shadow-2xs min-h-[42px]"
        >
          <Sparkles className="w-4 h-4 text-[#6E3511] shrink-0" /> Auto-Fill Sample AWB
        </button>
      </div>

      {isSuccess && (
        <div className="mb-5 p-3.5 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs sm:text-sm animate-fadeIn">
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">Inbound weight logged successfully. Baseline is secured in audit ledger.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <label className="block text-xs font-bold text-[#412D15] mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-[#6E3511]" />
              Air Waybill (AWB) # *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. AWB-2026-9041"
                value={awbNumber}
                onChange={(e) => setAwbNumber(e.target.value)}
                className="w-full bg-[#faf6f2] text-[#412D15] font-mono font-bold border border-[#ebdcd0] focus:border-[#6E3511] focus:bg-white rounded-xl pl-10 pr-3.5 py-2.5 sm:py-3 text-sm focus:outline-none transition min-h-[44px]"
              />
              <Barcode className="w-5 h-5 text-[#6E3511]/60 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#412D15] mb-1.5 uppercase tracking-wide">
              Security Seal Barcode #
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. SEAL-88491"
                value={sealNumber}
                onChange={(e) => setSealNumber(e.target.value)}
                className="w-full bg-[#faf6f2] text-[#412D15] font-mono border border-[#ebdcd0] focus:border-[#6E3511] focus:bg-white rounded-xl pl-10 pr-3.5 py-2.5 sm:py-3 text-sm focus:outline-none transition min-h-[44px]"
              />
              <ShieldCheck className="w-5 h-5 text-[#6E3511]/60 absolute left-3 top-3" />
            </div>
          </div>
        </div>

        {/* Digital Scale Deck (Large & Prominent on Mobile) */}
        <div className="bg-[#faf6f2] border border-[#ebdcd0] rounded-2xl p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="block text-xs sm:text-sm md:text-base font-extrabold text-[#412D15] flex items-center gap-2 uppercase tracking-wider">
                <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-[#6E3511]" />
                Arrival Scale Reading (Weight In) *
              </label>
              <p className="text-[11px] sm:text-xs text-[#412D15]/70 font-normal mt-0.5">
                Ensure scale tare reads exactly 0.00 kg before placing consignment.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <input
                  type="number"
                  step="0.01"
                  min="0.05"
                  required
                  placeholder="0.00"
                  value={weightInKg}
                  onChange={(e) => setWeightInKg(e.target.value)}
                  className="bg-white text-3xl sm:text-4xl font-mono font-black text-[#412D15] border-2 border-[#ebdcd0] focus:border-[#6E3511] rounded-xl px-4 py-2.5 sm:py-3 w-full sm:w-48 text-right focus:outline-none shadow-xs"
                />
                <span className="absolute right-4 top-3.5 text-xs font-bold text-[#412D15]/50 pointer-events-none">
                  KG
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Logistics Context */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5">
          <div>
            <label className="block text-xs font-bold text-[#412D15] mb-1.5 uppercase tracking-wide">
              Consignor (Sender)
            </label>
            <input
              type="text"
              placeholder="e.g. Apex Tech Suppliers"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full bg-[#faf6f2] text-[#412D15] border border-[#ebdcd0] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#6E3511] focus:bg-white focus:outline-none transition min-h-[42px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#412D15] mb-1.5 uppercase tracking-wide">
              Consignee (Recipient)
            </label>
            <input
              type="text"
              placeholder="e.g. Retail Store #104"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full bg-[#faf6f2] text-[#412D15] border border-[#ebdcd0] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#6E3511] focus:bg-white focus:outline-none transition min-h-[42px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#412D15] mb-1.5 uppercase tracking-wide">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Shipment['category'])}
              className="w-full bg-[#faf6f2] text-[#412D15] font-semibold border border-[#ebdcd0] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#6E3511] focus:bg-white focus:outline-none transition min-h-[42px]"
            >
              <option value="Electronics">Electronics</option>
              <option value="High-Value">High-Value Cargo</option>
              <option value="Pharma">Pharma / Cold Chain</option>
              <option value="Apparel">Apparel & Textiles</option>
              <option value="Perishables">Perishables</option>
              <option value="General Freight">General Freight</option>
            </select>
          </div>
        </div>

        {/* Route Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5">
          <div>
            <label className="block text-xs font-bold text-[#412D15] mb-1.5 uppercase tracking-wide">
              Origin Port / Facility
            </label>
            <input
              type="text"
              placeholder="e.g. Shenzhen Airport Cargo"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-[#faf6f2] text-[#412D15] border border-[#ebdcd0] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#6E3511] focus:bg-white focus:outline-none transition min-h-[42px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#412D15] mb-1.5 uppercase tracking-wide">
              Destination Terminal / Hub
            </label>
            <input
              type="text"
              placeholder="e.g. Delhi Air Freight Hub Gate 4"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-[#faf6f2] text-[#412D15] border border-[#ebdcd0] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#6E3511] focus:bg-white focus:outline-none transition min-h-[42px]"
            />
          </div>
        </div>

        {/* Tolerance & Pieces */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5 pt-1">
          <div>
            <label className="block text-xs font-bold text-[#412D15] mb-1.5 uppercase tracking-wide">
              Package Count (Pieces)
            </label>
            <input
              type="number"
              min="1"
              value={itemsCount}
              onChange={(e) => setItemsCount(parseInt(e.target.value) || 1)}
              className="w-full bg-[#faf6f2] text-[#412D15] font-mono font-bold border border-[#ebdcd0] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#6E3511] focus:bg-white focus:outline-none transition min-h-[42px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#412D15] mb-1.5 uppercase tracking-wide flex items-center justify-between">
              <span>Tolerance (% Allowed)</span>
              <span className="text-[#6E3511] font-mono font-bold text-sm">±{tolerance}%</span>
            </label>
            <input
              type="range"
              min="0.2"
              max="5.0"
              step="0.1"
              value={tolerance}
              onChange={(e) => setTolerance(parseFloat(e.target.value))}
              className="w-full accent-[#6E3511] cursor-pointer mt-2"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#412D15] mb-1.5 uppercase tracking-wide">
              Attendant / Operator
            </label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full bg-[#faf6f2] text-[#412D15] font-semibold border border-[#ebdcd0] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#6E3511] focus:bg-white focus:outline-none transition min-h-[42px]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#412D15] mb-1.5 uppercase tracking-wide">
            Initial Remarks & Package Condition
          </label>
          <input
            type="text"
            placeholder="e.g. Factory sealed, outer box intact, no tape tears"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[#faf6f2] text-[#412D15] border border-[#ebdcd0] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#6E3511] focus:bg-white focus:outline-none transition min-h-[42px]"
          />
        </div>

        <div className="pt-2 sm:pt-4">
          <button
            type="submit"
            className="w-full bg-[#6E3511] hover:bg-[#582a0d] active:scale-[0.99] text-white font-bold py-3.5 sm:py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition shadow-xs text-sm sm:text-base min-h-[50px]"
          >
            <Scale className="w-5 h-5 shrink-0" />
            <span>Lock Inbound Weight & Register AWB</span>
          </button>
        </div>
      </form>
    </div>
  );
};
