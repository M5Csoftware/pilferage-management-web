'use client';

import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Scale, 
  Package, 
  AlertTriangle, 
  ArrowRight,
  Camera, 
  Eye, 
  ShieldCheck, 
  Search, 
  SlidersHorizontal,
  RotateCcw,
  ArrowUpDown,
  FileImage,
  MapPin,
  Calendar,
  User
} from 'lucide-react';
import { Shipment } from '@/types/shipment';
import { SystemSettings } from '@/types/settings';
import { NavTab } from './Sidebar';
import { getOptimizedImageUrl } from '@/lib/cloudinary';
import { PhotoLightboxModal } from './PhotoLightboxModal';

interface DiscrepancyDashboardProps {
  shipments: Shipment[];
  settings: SystemSettings;
  onNavigateToTab?: (tab: NavTab) => void;
  onSelectShipment?: (shipment: Shipment) => void;
}

export const DiscrepancyDashboard: React.FC<DiscrepancyDashboardProps> = ({
  shipments,
  settings,
  onNavigateToTab,
  onSelectShipment
}) => {
  // 2 Core Tabs
  const [activeDashboardTab, setActiveDashboardTab] = useState<'pilferage' | 'tallied'>('pilferage');

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [destinationFilter, setDestinationFilter] = useState('ALL');
  const [photoFilter, setPhotoFilter] = useState<'ALL' | 'WITH_PHOTOS' | 'NO_PHOTOS'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'HIGH_LOSS' | 'HEAVY_SHORTFALL'>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'HIGHEST_SHORTAGE' | 'HIGHEST_WEIGHT' | 'AWB_ASC'>('NEWEST');

  // Lightbox State
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

  // Base cohorts
  const pilferedList = useMemo(() => shipments.filter(s => s.status === 'PILFERAGE_FLAGGED'), [shipments]);
  const clearedList = useMemo(() => shipments.filter(s => s.status === 'DISPATCHED_CLEARED'), [shipments]);

  // Dynamic unique destination hubs for filter
  const uniqueDestinations = useMemo(() => {
    const set = new Set<string>();
    shipments.forEach(s => {
      if (s.destination) set.add(s.destination);
    });
    return Array.from(set);
  }, [shipments]);

  // Current active cohort based on selected tab
  const currentCohort = activeDashboardTab === 'pilferage' ? pilferedList : clearedList;

  // Filter & sort logic
  const filteredShipments = useMemo(() => {
    return currentCohort
      .filter((s) => {
        // 1. Text search
        const q = searchTerm.toLowerCase().trim();
        const matchesSearch = !q || (
          s.awbNumber.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.senderName.toLowerCase().includes(q) ||
          s.recipientName.toLowerCase().includes(q) ||
          s.origin.toLowerCase().includes(q) ||
          s.destination.toLowerCase().includes(q) ||
          (s.flaggedReason && s.flaggedReason.toLowerCase().includes(q)) ||
          (s.outboundNotes && s.outboundNotes.toLowerCase().includes(q))
        );

        // 2. Category filter
        const matchesCat = categoryFilter === 'ALL' || s.category === categoryFilter;

        // 3. Destination filter
        const matchesDest = destinationFilter === 'ALL' || s.destination === destinationFilter;

        // 4. Photo Evidence filter
        const hasPhotos = Boolean(s.weightInPhotoUrl || s.weightOutPhotoUrl);
        const matchesPhoto = 
          photoFilter === 'ALL' ? true :
          photoFilter === 'WITH_PHOTOS' ? hasPhotos :
          !hasPhotos;

        // 5. Severity filter (only applies to pilferage tab)
        let matchesSeverity = true;
        if (activeDashboardTab === 'pilferage') {
          const absLossPct = Math.abs(s.weightLossPercentage || 0);
          const absDiffKg = Math.abs(s.weightDiffKg || 0);
          if (severityFilter === 'HIGH_LOSS') {
            matchesSeverity = absLossPct >= 5.0;
          } else if (severityFilter === 'HEAVY_SHORTFALL') {
            matchesSeverity = absDiffKg >= 3.0;
          }
        }

        return matchesSearch && matchesCat && matchesDest && matchesPhoto && matchesSeverity;
      })
      .sort((a, b) => {
        if (sortBy === 'NEWEST') {
          const dateA = a.outboundDate || a.inboundDate;
          const dateB = b.outboundDate || b.inboundDate;
          return dateB.localeCompare(dateA);
        }
        if (sortBy === 'OLDEST') {
          const dateA = a.outboundDate || a.inboundDate;
          const dateB = b.outboundDate || b.inboundDate;
          return dateA.localeCompare(dateB);
        }
        if (sortBy === 'HIGHEST_SHORTAGE') {
          const lossA = Math.abs(a.weightDiffKg || 0);
          const lossB = Math.abs(b.weightDiffKg || 0);
          return lossB - lossA;
        }
        if (sortBy === 'HIGHEST_WEIGHT') {
          return b.weightInKg - a.weightInKg;
        }
        if (sortBy === 'AWB_ASC') {
          return a.awbNumber.localeCompare(b.awbNumber);
        }
        return 0;
      });
  }, [currentCohort, activeDashboardTab, searchTerm, categoryFilter, destinationFilter, photoFilter, severityFilter, sortBy]);

  // Aggregate metrics for currently filtered data
  const totalFilteredMissingKg = useMemo(() => {
    return filteredShipments.reduce((sum, s) => {
      const diff = s.weightDiffKg || 0;
      return sum + (diff < 0 ? Math.abs(diff) : 0);
    }, 0);
  }, [filteredShipments]);

  const totalFilteredVerifiedKg = useMemo(() => {
    return filteredShipments.reduce((sum, s) => sum + (s.weightOutKg || s.weightInKg || 0), 0);
  }, [filteredShipments]);

  const hasActiveFilters = Boolean(
    searchTerm || 
    categoryFilter !== 'ALL' || 
    destinationFilter !== 'ALL' || 
    photoFilter !== 'ALL' || 
    severityFilter !== 'ALL' || 
    sortBy !== 'NEWEST'
  );

  const resetAllFilters = () => {
    setSearchTerm('');
    setCategoryFilter('ALL');
    setDestinationFilter('ALL');
    setPhotoFilter('ALL');
    setSeverityFilter('ALL');
    setSortBy('NEWEST');
  };

  return (
    <div className="space-y-4 sm:space-y-6 text-[#412D15]">
      {/* 2 MAIN PRIMARY TABS */}
      <div className="bg-white border border-[#ebdcd0] rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        {/* Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ebdcd0]">
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
            {/* Tab 1: Pilferage Detected */}
            <button
              type="button"
              onClick={() => {
                setActiveDashboardTab('pilferage');
                setSeverityFilter('ALL');
              }}
              className={`px-4 sm:px-6 py-3 rounded-xl font-black text-xs sm:text-sm md:text-base flex items-center justify-center gap-2 transition relative min-h-[50px] ${
                activeDashboardTab === 'pilferage'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-[#faf6f2] text-[#412D15]/80 hover:text-rose-700 hover:bg-rose-50 border border-[#ebdcd0]'
              }`}
            >
              <ShieldAlert className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${activeDashboardTab === 'pilferage' ? 'text-white' : 'text-rose-600'}`} />
              <span>Pilferage Detected</span>
              <span className={`text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                activeDashboardTab === 'pilferage'
                  ? 'bg-white text-rose-700'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {pilferedList.length}
              </span>
            </button>

            {/* Tab 2: Correctly Tallied */}
            <button
              type="button"
              onClick={() => {
                setActiveDashboardTab('tallied');
                setSeverityFilter('ALL');
              }}
              className={`px-4 sm:px-6 py-3 rounded-xl font-black text-xs sm:text-sm md:text-base flex items-center justify-center gap-2 transition relative min-h-[50px] ${
                activeDashboardTab === 'tallied'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-[#faf6f2] text-[#412D15]/80 hover:text-emerald-700 hover:bg-emerald-50 border border-[#ebdcd0]'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${activeDashboardTab === 'tallied' ? 'text-white' : 'text-emerald-600'}`} />
              <span>Correctly Tallied</span>
              <span className={`text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                activeDashboardTab === 'tallied'
                  ? 'bg-white text-emerald-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {clearedList.length}
              </span>
            </button>
          </div>

          {/* Quick Tab Summary Metric */}
          <div className="flex items-center gap-2 text-xs font-medium self-end sm:self-auto">
            {activeDashboardTab === 'pilferage' ? (
              <span className="bg-rose-50 border border-rose-200 text-rose-800 px-3 py-1.5 rounded-xl font-mono font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Total Cargo Shortage: -{totalFilteredMissingKg.toFixed(2)} kg
              </span>
            ) : (
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl font-mono font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Total Verified Cargo: {totalFilteredVerifiedKg.toFixed(2)} kg
              </span>
            )}
          </div>
        </div>

        {/* COMPREHENSIVE FILTER CONTROLS BAR */}
        <div className="bg-[#faf6f2] border border-[#ebdcd0] rounded-xl p-3 sm:p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#412D15]">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-[#6E3511]" />
              <span>Table Filters & Sorting</span>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs text-rose-700 hover:text-rose-900 font-bold flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {/* 1. Universal Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search AWB, Sender, Notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-[#412D15] border border-[#ebdcd0] rounded-xl pl-8 pr-3 py-2 text-xs focus:border-[#6E3511] focus:outline-none transition min-h-[38px]"
              />
              <Search className="w-3.5 h-3.5 text-[#6E3511]/60 absolute left-2.5 top-3" />
            </div>

            {/* 2. Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-white text-[#412D15] font-medium border border-[#ebdcd0] rounded-xl px-2.5 py-2 text-xs focus:border-[#6E3511] focus:outline-none transition min-h-[38px]"
              >
                <option value="ALL">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="High-Value">High-Value Cargo</option>
                <option value="Pharma">Pharma / Cold Chain</option>
                <option value="Apparel">Apparel & Textiles</option>
                <option value="Perishables">Perishables</option>
                <option value="General Freight">General Freight</option>
              </select>
            </div>

            {/* 3. Destination Hub Filter */}
            <div>
              <select
                value={destinationFilter}
                onChange={(e) => setDestinationFilter(e.target.value)}
                className="w-full bg-white text-[#412D15] font-medium border border-[#ebdcd0] rounded-xl px-2.5 py-2 text-xs focus:border-[#6E3511] focus:outline-none transition min-h-[38px] truncate"
              >
                <option value="ALL">All Destinations</option>
                {uniqueDestinations.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* 4. Photo Evidence Filter */}
            <div>
              <select
                value={photoFilter}
                onChange={(e) => setPhotoFilter(e.target.value as any)}
                className="w-full bg-white text-[#412D15] font-medium border border-[#ebdcd0] rounded-xl px-2.5 py-2 text-xs focus:border-[#6E3511] focus:outline-none transition min-h-[38px]"
              >
                <option value="ALL">All Evidence States</option>
                <option value="WITH_PHOTOS">📷 With Photos Attached</option>
                <option value="NO_PHOTOS">No Photo Uploaded</option>
              </select>
            </div>

            {/* 5. Tab-Specific Severity or Sort By */}
            {activeDashboardTab === 'pilferage' ? (
              <div>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value as any)}
                  className="w-full bg-white text-rose-800 font-bold border border-rose-200 rounded-xl px-2.5 py-2 text-xs focus:border-rose-500 focus:outline-none transition min-h-[38px]"
                >
                  <option value="ALL">All Severity Levels</option>
                  <option value="HIGH_LOSS">High Loss (≥ 5% Shortfall)</option>
                  <option value="HEAVY_SHORTFALL">Heavy Deficit (≥ 3.0 kg)</option>
                </select>
              </div>
            ) : (
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-white text-[#412D15] font-medium border border-[#ebdcd0] rounded-xl px-2.5 py-2 text-xs focus:border-[#6E3511] focus:outline-none transition min-h-[38px]"
                >
                  <option value="NEWEST">Sort: Newest First</option>
                  <option value="OLDEST">Sort: Oldest First</option>
                  <option value="HIGHEST_WEIGHT">Sort: Heaviest Consignment</option>
                  <option value="AWB_ASC">Sort: AWB (A-Z)</option>
                </select>
              </div>
            )}
          </div>

          {/* Quick status bar */}
          <div className="flex items-center justify-between text-[11px] text-[#412D15]/70 pt-1 border-t border-[#ebdcd0]/60">
            <span>
              Showing <strong className="text-[#412D15] font-bold">{filteredShipments.length}</strong> of{' '}
              <strong className="text-[#412D15] font-bold">{currentCohort.length}</strong> records
            </span>
            <span className="font-mono text-[10px] text-[#412D15]/50">
              {activeDashboardTab === 'pilferage' ? 'Filter: Security Watchlist' : 'Filter: Dispatch Tally Ledger'}
            </span>
          </div>
        </div>

        {/* DETAILED DATA TABLE */}
        <div className="overflow-x-auto rounded-xl border border-[#ebdcd0] shadow-2xs">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-[#faf6f2] text-[#412D15] uppercase tracking-wider border-b border-[#ebdcd0] font-black text-[11px]">
              <tr className="divide-x divide-[#ebdcd0]">
                <th className="px-4 py-3.5 whitespace-nowrap border-r border-[#ebdcd0]">AWB & Parcel ID</th>
                <th className="px-4 py-3.5 whitespace-nowrap border-r border-[#ebdcd0]">Route (From → To)</th>
                <th className="px-4 py-3.5 whitespace-nowrap border-r border-[#ebdcd0]">Category</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap border-r border-[#ebdcd0]">Weight In</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap border-r border-[#ebdcd0]">Weight Out</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap border-r border-[#ebdcd0]">Variance (Delta)</th>
                <th className="px-4 py-3.5 text-center whitespace-nowrap border-r border-[#ebdcd0]">Photo Evidence</th>
                <th className="px-4 py-3.5 whitespace-nowrap border-r border-[#ebdcd0]">
                  {activeDashboardTab === 'pilferage' ? 'Security Audit Memo' : 'Clearance Remarks'}
                </th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#ebdcd0]/80 bg-white text-[#412D15] font-medium">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[#412D15]/60 bg-[#faf6f2]/30">
                    <Package className="w-8 h-8 text-[#6E3511] mx-auto mb-2 opacity-60" />
                    <div className="font-bold text-sm text-[#412D15]">No Shipments Found Matching Filters</div>
                    <p className="text-xs text-[#412D15]/60 mt-1">
                      {hasActiveFilters ? 'Try resetting or loosening your search filters above.' : 'No records exist in this cohort.'}
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={resetAllFilters}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#6E3511] bg-white border border-[#ebdcd0] px-3 py-1.5 rounded-lg shadow-2xs"
                      >
                        <RotateCcw className="w-3 h-3" /> Reset All Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredShipments.map((item) => {
                  const isFlagged = item.status === 'PILFERAGE_FLAGGED';
                  const diffKg = item.weightDiffKg || 0;
                  const lossPct = item.weightLossPercentage || 0;

                  return (
                    <tr 
                      key={item.id}
                      className={`divide-x divide-[#ebdcd0] transition hover:bg-[#faf6f2]/80 ${
                        isFlagged ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* 1. AWB & ID */}
                      <td className="px-4 py-3.5 border-r border-[#ebdcd0]">
                        <div className="font-mono font-black text-sm text-[#412D15]">{item.awbNumber}</div>
                        <div className="text-[10px] text-[#412D15]/50 font-mono mt-0.5">{item.id}</div>
                      </td>

                      {/* 2. Route & Parties */}
                      <td className="px-4 py-3.5 border-r border-[#ebdcd0]">
                        <div className="font-bold text-xs text-[#412D15] truncate max-w-[190px]">
                          {item.senderName} <span className="text-[#6E3511]">→</span> {item.recipientName}
                        </div>
                        <div className="text-[11px] text-[#412D15]/60 flex items-center gap-1 mt-0.5 truncate max-w-[190px]">
                          <MapPin className="w-3 h-3 text-[#6E3511] shrink-0" />
                          <span>{item.origin} → {item.destination}</span>
                        </div>
                      </td>

                      {/* 3. Category */}
                      <td className="px-4 py-3.5 whitespace-nowrap border-r border-[#ebdcd0]">
                        <span className="px-2.5 py-1 rounded-md bg-[#faf6f2] text-[#412D15] border border-[#ebdcd0] text-[11px] font-bold">
                          {item.category}
                        </span>
                        <div className="text-[10px] text-[#412D15]/50 mt-0.5">
                          Tol: ±{item.tolerancePercentage}%
                        </div>
                      </td>

                      {/* 4. Weight In */}
                      <td className="px-4 py-3.5 text-right font-mono border-r border-[#ebdcd0]">
                        <div className="font-black text-sm text-[#412D15]">
                          {item.weightInKg.toFixed(2)} <span className="text-[10px] font-sans font-normal text-[#412D15]/60">kg</span>
                        </div>
                        <div className="text-[10px] text-[#412D15]/50 truncate max-w-[120px] ml-auto">
                          {item.inboundDate ? item.inboundDate.slice(5) : ''}
                        </div>
                      </td>

                      {/* 5. Weight Out */}
                      <td className="px-4 py-3.5 text-right font-mono border-r border-[#ebdcd0]">
                        {item.weightOutKg !== undefined ? (
                          <>
                            <div className="font-black text-sm text-[#412D15]">
                              {item.weightOutKg.toFixed(2)} <span className="text-[10px] font-sans font-normal text-[#412D15]/60">kg</span>
                            </div>
                            <div className="text-[10px] text-[#412D15]/50 truncate max-w-[120px] ml-auto">
                              {item.outboundDate ? item.outboundDate.slice(5) : ''}
                            </div>
                          </>
                        ) : (
                          <span className="text-[#412D15]/40 italic text-xs">Pending</span>
                        )}
                      </td>

                      {/* 6. Variance (Delta) */}
                      <td className="px-4 py-3.5 text-right font-mono whitespace-nowrap border-r border-[#ebdcd0]">
                        {item.weightDiffKg !== undefined ? (
                          <div>
                            <div className={`font-black text-xs sm:text-sm ${
                              isFlagged ? 'text-rose-600' : 'text-emerald-700'
                            }`}>
                              {diffKg > 0 ? `+${diffKg}` : diffKg} kg
                            </div>
                            <div className={`text-[10px] font-bold ${
                              isFlagged ? 'text-rose-700' : 'text-emerald-800'
                            }`}>
                              {lossPct > 0 ? `+${lossPct}%` : `${lossPct}%`}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#412D15]/40 text-xs">—</span>
                        )}
                      </td>

                      {/* 7. Photo Evidence Thumbnails */}
                      <td className="px-4 py-3.5 text-center border-r border-[#ebdcd0]">
                        <div className="inline-flex items-center gap-1.5 justify-center">
                          {/* Inbound Photo */}
                          {item.weightInPhotoUrl ? (
                            <button
                              type="button"
                              onClick={() => setLightboxData({
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
                              })}
                              className="group relative w-8 h-8 rounded-lg overflow-hidden border border-[#ebdcd0] hover:border-[#6E3511] shrink-0"
                              title="Click to view Arrival Scale Photo"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={getOptimizedImageUrl(item.weightInPhotoUrl, { width: 80, height: 80, crop: 'fill' })}
                                alt="Inbound"
                                className="w-full h-full object-cover transition group-hover:scale-110"
                              />
                            </button>
                          ) : (
                            <span className="w-8 h-8 rounded-lg border border-dashed border-[#ebdcd0] flex items-center justify-center text-[#412D15]/30" title="No arrival photo">
                              <Camera className="w-3.5 h-3.5" />
                            </span>
                          )}

                          {/* Outbound Photo */}
                          {item.weightOutPhotoUrl ? (
                            <button
                              type="button"
                              onClick={() => setLightboxData({
                                isOpen: true,
                                url: item.weightOutPhotoUrl!,
                                title: `Departure Scale Photo • ${item.awbNumber}`,
                                subtitle: `Weight Out: ${item.weightOutKg?.toFixed(2)} kg`,
                                metadata: {
                                  awbNumber: item.awbNumber,
                                  weightKg: item.weightOutKg,
                                  operator: item.outboundOperator,
                                  date: item.outboundDate,
                                  sealNumber: item.sealNumberOut
                                }
                              })}
                              className="group relative w-8 h-8 rounded-lg overflow-hidden border border-emerald-300 hover:border-emerald-600 shrink-0"
                              title="Click to view Outbound Photo"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={getOptimizedImageUrl(item.weightOutPhotoUrl, { width: 80, height: 80, crop: 'fill' })}
                                alt="Outbound"
                                className="w-full h-full object-cover transition group-hover:scale-110"
                              />
                            </button>
                          ) : (
                            <span className="w-8 h-8 rounded-lg border border-dashed border-[#ebdcd0] flex items-center justify-center text-[#412D15]/30" title="No departure photo">
                              <Camera className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 8. Audit Memo / Clearance Remarks */}
                      <td className="px-4 py-3.5 max-w-[240px] border-r border-[#ebdcd0]">
                        {isFlagged ? (
                          <div className="text-[11px] text-rose-900 bg-rose-50/70 p-2 rounded-lg border border-rose-200">
                            <strong className="block font-bold truncate">Security Memo:</strong>
                            <p className="line-clamp-2 leading-tight mt-0.5">
                              {item.flaggedReason || item.outboundNotes || 'Weight shortfall logged.'}
                            </p>
                          </div>
                        ) : (
                          <div className="text-[11px] text-emerald-900 bg-emerald-50/60 p-2 rounded-lg border border-emerald-200">
                            <strong className="block font-bold text-emerald-800">Clearance Stamp:</strong>
                            <p className="line-clamp-2 leading-tight mt-0.5">
                              {item.outboundNotes || 'Verified tare match within allowable tolerance. Released.'}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* 9. Action Button */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {onSelectShipment && (
                          <button
                            type="button"
                            onClick={() => onSelectShipment(item)}
                            className="text-xs text-[#412D15] hover:text-white bg-[#faf6f2] hover:bg-[#6E3511] border border-[#ebdcd0] px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition font-bold shadow-2xs min-h-[34px]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
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

      {/* Lightbox for zooming photos directly from table */}
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
