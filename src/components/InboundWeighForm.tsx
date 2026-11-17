'use client';

import React, { useState } from 'react';
import { 
  PackagePlus, 
  Scale, 
  ShieldCheck, 
  Barcode, 
  CheckCircle,
  Truck,
  Building,
  User,
  Sliders,
  Sparkles
} from 'lucide-react';
import { Shipment } from '@/types/shipment';

interface InboundWeighFormProps {
  onShipmentRecorded: (shipment: Shipment) => void;
}

export const InboundWeighForm: React.FC<InboundWeighFormProps> = ({ onShipmentRecorded }) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [origin, setOrigin] = useState('Hub Central Alpha');
  const [destination, setDestination] = useState('');
  const [category, setCategory] = useState<Shipment['category']>('Electronics');
  const [itemsCount, setItemsCount] = useState<number>(1);
  const [weightInKg, setWeightInKg] = useState<string>('');
  const [operator, setOperator] = useState('Operator John (Station 1)');
  const [sealNumber, setSealNumber] = useState('');
  const [tolerance, setTolerance] = useState<number>(1.0);
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Quick preset demo generator for fast testing
  const handleFillDemo = () => {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    setTrackingNumber(`TRK-2026-${randomId}`);
    setSenderName('Apex High-End Electronics Depot');
    setRecipientName('Regional Logistics Center North');
    setDestination('Customer Fulfillment Hub 3');
    setCategory('Electronics');
    setItemsCount(24);
    setWeightInKg((48.75 + Math.random() * 5).toFixed(2));
    setSealNumber(`SL-${Math.floor(100000 + Math.random() * 900000)}`);
    setTolerance(1.0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber || !weightInKg || parseFloat(weightInKg) <= 0) {
      alert('Please fill out the tracking number and a valid weight in kg.');
      return;
    }

    const newShipment: Shipment = {
      id: `SHP-${Math.floor(10000 + Math.random() * 90000)}`,
      trackingNumber,
      senderName: senderName || 'Declared Vendor',
      recipientName: recipientName || 'Target Receiver',
      origin: origin || 'Local Gateway',
      destination: destination || 'Domestic Delivery',
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
      // Reset form
      setTrackingNumber('');
      setWeightInKg('');
      setSealNumber('');
      setNotes('');
    }, 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-blue-400" />
            Inbound Intake & Weight Recording (Step 1)
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Capture authentic parcel arrival weight and security seal data to establish the baseline baseline against pilferage.
          </p>
        </div>

        <button
          type="button"
          onClick={handleFillDemo}
          className="text-xs bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
        >
          <Sparkles className="w-3.5 h-3.5" /> Auto-Fill Sample Data
        </button>
      </div>

      {isSuccess && (
        <div className="mb-6 p-4 bg-emerald-950/80 border border-emerald-500 rounded-xl flex items-center gap-3 text-emerald-200 animate-fadeIn">
          <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold">Inbound Baseline Logged Successfully!</div>
            <div className="text-xs text-emerald-300">Shipment weight is secured in the ledger for dispatch cross-examination.</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
              Tracking / Consignment ID *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. TRK-2026-9041"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full bg-slate-950 text-white border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-sm"
              />
              <Barcode className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
              Security Seal Barcode #
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. SEAL-88491"
                value={sealNumber}
                onChange={(e) => setSealNumber(e.target.value)}
                className="w-full bg-slate-950 text-white border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-sm"
              />
              <ShieldCheck className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3" />
            </div>
          </div>
        </div>

        {/* Dynamic Scale Weight Input Focus Area */}
        <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-500/30 rounded-2xl p-5 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="block text-sm font-bold text-blue-200 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-blue-400" />
                Arrival Scale Reading (Weight In) *
              </label>
              <p className="text-xs text-slate-400 mt-0.5">
                Digital scale interface: ensure scale is tared at 0.00 kg before placing parcel.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.05"
                  required
                  placeholder="0.00"
                  value={weightInKg}
                  onChange={(e) => setWeightInKg(e.target.value)}
                  className="bg-slate-950 text-2xl font-black text-blue-400 border-2 border-blue-500/50 rounded-xl px-4 py-2 w-36 text-right focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-inner"
                />
                <span className="absolute right-3.5 top-3.5 text-xs text-slate-400 font-bold pointer-events-none">
                  KG
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Logistics Context */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
              Consignor (Sender)
            </label>
            <input
              type="text"
              placeholder="e.g. Apex Tech Suppliers"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
              Consignee (Destination Recipient)
            </label>
            <input
              type="text"
              placeholder="e.g. Retail Store #104"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
              Product Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Shipment['category'])}
              className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="Electronics">Electronics (Laptops/Phones/Chips)</option>
              <option value="High-Value">High-Value (Jewelry/Luxury/Perfumes)</option>
              <option value="Apparel">Apparel & Textiles</option>
              <option value="Perishables">Perishables / Cold Chain</option>
              <option value="General Freight">General Freight / Heavy Cargo</option>
            </select>
          </div>
        </div>

        {/* Tolerance & Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
              Items Count inside Box
            </label>
            <input
              type="number"
              min="1"
              value={itemsCount}
              onChange={(e) => setItemsCount(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide flex items-center justify-between">
              <span>Pilferage Margin (% Loss)</span>
              <span className="text-amber-400 font-bold">{tolerance}%</span>
            </label>
            <input
              type="range"
              min="0.2"
              max="5.0"
              step="0.1"
              value={tolerance}
              onChange={(e) => setTolerance(parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer mt-2"
            />
            <span className="text-[11px] text-slate-500 block">
              Flag if weight loss on dispatch exceeds {tolerance}%
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
              Inbound Station Attendant
            </label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
            Initial Package Condition Remarks
          </label>
          <input
            type="text"
            placeholder="e.g. Factory sealed, holographic tape intact, no tears on edges"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-950 text-slate-300 border border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition transform active:scale-[0.99]"
          >
            <Scale className="w-5 h-5" />
            Lock Inbound Weight & Register Shipment
          </button>
        </div>
      </form>
    </div>
  );
};
