'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Scale, 
  PackagePlus, 
  Truck, 
  ClipboardList, 
  AlertTriangle,
  Warehouse,
  RefreshCw
} from 'lucide-react';
import { Shipment, INITIAL_SHIPMENTS } from '@/types/shipment';
import { InboundWeighForm } from '@/components/InboundWeighForm';
import { OutboundDispatch } from '@/components/OutboundDispatch';
import { ShipmentAuditList } from '@/components/ShipmentAuditList';
import { StatsOverview } from '@/components/StatsOverview';
import { WeightComparisonCard } from '@/components/WeightComparisonCard';

export default function Home() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [activeTab, setActiveTab] = useState<'inbound' | 'dispatch' | 'audit'>('dispatch');
  const [inspectShipment, setInspectShipment] = useState<Shipment | null>(null);

  // Load shipments from localStorage or initialize with defaults
  useEffect(() => {
    const saved = localStorage.getItem('PMS_SHIPMENTS');
    if (saved) {
      try {
        setShipments(JSON.parse(saved));
      } catch (e) {
        setShipments(INITIAL_SHIPMENTS);
      }
    } else {
      setShipments(INITIAL_SHIPMENTS);
      localStorage.setItem('PMS_SHIPMENTS', JSON.stringify(INITIAL_SHIPMENTS));
    }
  }, []);

  const saveShipments = (newShipments: Shipment[]) => {
    setShipments(newShipments);
    localStorage.setItem('PMS_SHIPMENTS', JSON.stringify(newShipments));
  };

  const handleShipmentRecorded = (newShipment: Shipment) => {
    const updated = [newShipment, ...shipments];
    saveShipments(updated);
    setActiveTab('dispatch');
  };

  const handleUpdateShipment = (updatedShipment: Shipment) => {
    const updated = shipments.map(s => s.id === updatedShipment.id ? updatedShipment : s);
    saveShipments(updated);
  };

  const resetToSampleData = () => {
    saveShipments(INITIAL_SHIPMENTS);
    setInspectShipment(null);
  };

  const pilferageCount = shipments.filter(s => s.status === 'PILFERAGE_FLAGGED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 text-white">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg sm:text-xl tracking-tight text-white">
                    PMS
                  </span>
                  <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Anti-Pilferage Gate
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
                  Pilferage Management System • Inbound vs Dispatch Weight Auditing
                </div>
              </div>
            </div>

            {/* Quick Actions & Live Indicator */}
            <div className="flex items-center gap-3">
              {pilferageCount > 0 && (
                <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-xl text-xs font-semibold animate-pulse">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{pilferageCount} Active Pilferage Alert{pilferageCount > 1 ? 's' : ''}</span>
                </div>
              )}

              <button
                onClick={resetToSampleData}
                title="Reset to default sample data"
                className="text-xs text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-900 border border-slate-800 flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Reset Demo</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Metric Cards Banner */}
        <StatsOverview shipments={shipments} />

        {/* Workflow Navigation Tabs */}
        <div className="bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('inbound')}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'inbound'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <PackagePlus className="w-4 h-4" />
            <span>1. Record Weight In</span>
          </button>

          <button
            onClick={() => setActiveTab('dispatch')}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition relative ${
              activeTab === 'dispatch'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>2. Outbound Dispatch & Weight Check</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'audit'
                ? 'bg-slate-800 text-white shadow-lg border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>3. Audit & Security Ledger</span>
          </button>
        </div>

        {/* Tab View Switcher */}
        {activeTab === 'inbound' && (
          <div className="animate-fadeIn">
            <InboundWeighForm onShipmentRecorded={handleShipmentRecorded} />
          </div>
        )}

        {activeTab === 'dispatch' && (
          <div className="animate-fadeIn">
            <OutboundDispatch 
              shipments={shipments} 
              onUpdateShipment={handleUpdateShipment} 
            />
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="animate-fadeIn space-y-6">
            <ShipmentAuditList 
              shipments={shipments} 
              onSelectShipment={(s) => setInspectShipment(s)}
            />

            {inspectShipment && (
              <div className="mt-6 border-t border-slate-800 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">
                    Inspecting Audit Details for: {inspectShipment.id}
                  </h3>
                  <button
                    onClick={() => setInspectShipment(null)}
                    className="text-xs text-slate-400 hover:text-white bg-slate-800 px-3 py-1 rounded-lg"
                  >
                    Close Inspection
                  </button>
                </div>
                <WeightComparisonCard 
                  shipment={inspectShipment} 
                  testWeightOut={inspectShipment.weightOutKg}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer info */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PMS (Pilferage Management System) • Multi-Device Desktop & Mobile Web</span>
          <span>Deployable on Vercel • Next.js, TypeScript & Tailwind CSS</span>
        </div>
      </footer>
    </div>
  );
}
