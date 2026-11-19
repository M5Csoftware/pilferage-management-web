'use client';

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Scale, 
  ShieldAlert, 
  CheckCircle2, 
  Search
} from 'lucide-react';
import { Shipment, AuthUser } from '@/types/shipment';
import { SystemSettings } from '@/types/settings';

interface MasterReportProps {
  shipments: Shipment[];
  currentUser: AuthUser;
  settings: SystemSettings;
}

export const MasterReport: React.FC<MasterReportProps> = ({ 
  shipments, 
  currentUser,
  settings 
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const reportDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const reportTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const filtered = shipments.filter(s => {
    const matchesCat = filterCategory === 'ALL' || s.category === filterCategory;
    const matchesStatus = 
      filterStatus === 'ALL' ? true :
      filterStatus === 'FLAGGED' ? s.status === 'PILFERAGE_FLAGGED' :
      filterStatus === 'CLEARED' ? s.status === 'DISPATCHED_CLEARED' :
      filterStatus === 'INBOUND' ? s.status === 'INBOUND_RECORDED' : true;

    const matchesSearch = 
      s.awbNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.recipientName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCat && matchesStatus && matchesSearch;
  });

  const totalWeightIn = filtered.reduce((acc, s) => acc + s.weightInKg, 0);
  const totalWeightOut = filtered.reduce((acc, s) => acc + (s.weightOutKg || 0), 0);
  
  const audited = filtered.filter(s => s.weightOutKg !== undefined && s.weightOutKg > 0);
  const pilferedList = filtered.filter(s => s.status === 'PILFERAGE_FLAGGED');
  const totalMissingLossKg = pilferedList.reduce((acc, s) => acc + Math.abs(s.weightDiffKg || 0), 0);
  const financialLoss = +(totalMissingLossKg * settings.estCostPerKg).toFixed(2);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'Shipment ID',
      'AWB Number',
      'Sender',
      'Recipient',
      'Origin',
      'Destination',
      'Category',
      'Pieces',
      'Weight In (kg)',
      'Weight Out (kg)',
      'Variance (kg)',
      'Loss (%)',
      'Status',
      'Inbound Operator',
      'Outbound Operator',
      'Weight In Photo URL',
      'Weight Out Photo URL',
      'Notes'
    ];

    const rows = filtered.map(s => [
      `"${s.id}"`,
      `"${s.awbNumber}"`,
      `"${s.senderName}"`,
      `"${s.recipientName}"`,
      `"${s.origin}"`,
      `"${s.destination}"`,
      `"${s.category}"`,
      s.itemsCount,
      s.weightInKg.toFixed(2),
      s.weightOutKg !== undefined ? s.weightOutKg.toFixed(2) : 'N/A',
      s.weightDiffKg !== undefined ? s.weightDiffKg.toFixed(2) : 'N/A',
      s.weightLossPercentage !== undefined ? `${s.weightLossPercentage}%` : 'N/A',
      `"${s.status}"`,
      `"${s.inboundOperator}"`,
      `"${s.outboundOperator || 'N/A'}"`,
      `"${s.weightInPhotoUrl || ''}"`,
      `"${s.weightOutPhotoUrl || ''}"`,
      `"${(s.flaggedReason || s.outboundNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PMS_Master_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-6 text-[#412D15]">
      {/* Report Controls (Responsive for Mobile) */}
      <div className="print:hidden bg-white border border-[#ebdcd0] rounded-2xl p-4 sm:p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#412D15] flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-[#6E3511] stroke-[2] shrink-0" />
            <span>Master Cargo Weight & Audit Report</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#412D15]/70 mt-0.5">
            Logistics compliance document for station records, carriers, and loss-prevention audits.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-[#faf6f2] hover:bg-[#f6eee7] active:bg-[#ebdcd0] text-[#412D15] border border-[#ebdcd0] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-2xs min-h-[42px]"
          >
            <Download className="w-4 h-4 text-[#6E3511] shrink-0" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 rounded-xl bg-[#6E3511] hover:bg-[#582a0d] active:bg-[#412D15] text-white border border-[#6E3511] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-xs min-h-[42px]"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="print:hidden bg-white border border-[#ebdcd0] rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search AWB, shipment ID, vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#faf6f2] text-[#412D15] border border-[#ebdcd0] rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm focus:border-[#6E3511] focus:bg-white focus:outline-none transition min-h-[42px]"
          />
          <Search className="w-4 h-4 text-[#6E3511]/60 absolute left-3 top-3" />
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#faf6f2] text-[#412D15] font-semibold border border-[#ebdcd0] rounded-xl px-2.5 sm:px-3 py-2 text-xs sm:text-sm focus:border-[#6E3511] focus:bg-white focus:outline-none min-h-[42px]"
          >
            <option value="ALL">All Statuses</option>
            <option value="FLAGGED">Pilferage Flagged</option>
            <option value="CLEARED">Cleared Dispatches</option>
            <option value="INBOUND">Pending Re-Weigh</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#faf6f2] text-[#412D15] font-semibold border border-[#ebdcd0] rounded-xl px-2.5 sm:px-3 py-2 text-xs sm:text-sm focus:border-[#6E3511] focus:bg-white focus:outline-none min-h-[42px]"
          >
            <option value="ALL">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="High-Value">High-Value</option>
            <option value="Pharma">Pharma</option>
            <option value="Apparel">Apparel</option>
            <option value="General Freight">General Freight</option>
          </select>
        </div>
      </div>

      {/* Document Area */}
      <div className="bg-white border border-[#ebdcd0] print:border-none rounded-2xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 shadow-xs">
        {/* Document Header */}
        <div className="border-b border-[#ebdcd0] pb-4 sm:pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 sm:p-2.5 bg-[#6E3511] rounded-xl text-white shadow-2xs shrink-0">
                <Scale className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg md:text-xl font-black text-[#412D15] uppercase tracking-tight">
                  Master Pilferage & Tally Report
                </h1>
                <p className="text-[11px] sm:text-xs md:text-sm text-[#412D15]/70">
                  {settings.hubName} ({settings.terminalCode})
                </p>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-[#412D15]/75 space-y-0.5 font-medium">
            <div><strong>Report Ref:</strong> PMS-REP-{new Date().getTime().toString().slice(-6)}</div>
            <div><strong>Generated:</strong> {reportDate} at {reportTime}</div>
            <div><strong>Auditor:</strong> {currentUser.name} ({currentUser.role.toUpperCase()})</div>
          </div>
        </div>

        {/* Master Highlights (2x2 on Mobile, 4x1 on Desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-[#faf6f2] p-3 sm:p-4 rounded-xl border border-[#ebdcd0]">
            <div className="text-[10px] sm:text-[11px] uppercase font-bold text-[#412D15]/70">
              Total Consignments
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#412D15] font-mono mt-0.5 sm:mt-1">
              {filtered.length}
            </div>
            <div className="text-[10px] sm:text-xs text-[#412D15]/60 mt-0.5">
              {audited.length} audited & verified
            </div>
          </div>

          <div className="bg-[#faf6f2] p-3 sm:p-4 rounded-xl border border-[#ebdcd0]">
            <div className="text-[10px] sm:text-[11px] uppercase font-bold text-[#412D15]/70">
              Total Inbound
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#412D15] font-mono mt-0.5 sm:mt-1 truncate">
              {totalWeightIn.toFixed(1)} <span className="text-xs text-[#412D15]/60 font-normal">kg</span>
            </div>
            <div className="text-[10px] sm:text-xs text-[#412D15]/60 mt-0.5">
              Intake baseline
            </div>
          </div>

          <div className="bg-[#faf6f2] p-3 sm:p-4 rounded-xl border border-[#ebdcd0]">
            <div className="text-[10px] sm:text-[11px] uppercase font-bold text-[#412D15]/70">
              Total Outbound
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#412D15] font-mono mt-0.5 sm:mt-1 truncate">
              {totalWeightOut.toFixed(1)} <span className="text-xs text-[#412D15]/60 font-normal">kg</span>
            </div>
            <div className="text-[10px] sm:text-xs text-[#412D15]/60 mt-0.5">
              Audited departures
            </div>
          </div>

          <div className="bg-rose-50 p-3 sm:p-4 rounded-xl border border-rose-200">
            <div className="text-[10px] sm:text-[11px] uppercase font-bold text-rose-800">
              Intercepted Theft
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-700 font-mono mt-0.5 sm:mt-1 truncate">
              -{totalMissingLossKg.toFixed(1)} <span className="text-xs text-rose-600 font-normal">kg</span>
            </div>
            <div className="text-[10px] sm:text-xs text-rose-700 mt-0.5 font-medium truncate">
              {settings.currencySymbol}{financialLoss.toLocaleString()} saved
            </div>
          </div>
        </div>

        {/* Ledger Table (Horizontally Scrollable on Mobile) */}
        <div className="overflow-x-auto rounded-xl border border-[#ebdcd0] -mx-1 sm:mx-0">
          <table className="w-full text-left text-xs sm:text-sm min-w-[600px] border-collapse">
            <thead className="bg-[#faf6f2] text-[#412D15] uppercase font-bold border-b border-[#ebdcd0] text-[11px]">
              <tr className="divide-x divide-[#ebdcd0]">
                <th className="p-3 border-r border-[#ebdcd0]">AWB & Consignment</th>
                <th className="p-3 border-r border-[#ebdcd0]">Route</th>
                <th className="p-3 border-r border-[#ebdcd0]">Category</th>
                <th className="p-3 text-right border-r border-[#ebdcd0]">Inbound (kg)</th>
                <th className="p-3 text-right border-r border-[#ebdcd0]">Outbound (kg)</th>
                <th className="p-3 text-right border-r border-[#ebdcd0]">Variance</th>
                <th className="p-3">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebdcd0]/70 text-[#412D15] bg-white font-medium">
              {filtered.map((item) => {
                const isPilfered = item.status === 'PILFERAGE_FLAGGED';
                const isCleared = item.status === 'DISPATCHED_CLEARED';

                return (
                  <tr 
                    key={item.id}
                    className={`divide-x divide-[#ebdcd0] hover:bg-[#faf6f2] ${
                      isPilfered ? 'bg-rose-50/60' : ''
                    }`}
                  >
                    <td className="p-3 border-r border-[#ebdcd0]">
                      <div className="font-mono font-bold text-[#412D15] text-xs sm:text-sm">{item.awbNumber}</div>
                      <div className="text-[10px] sm:text-xs text-[#412D15]/70 truncate max-w-[140px]">{item.senderName}</div>
                    </td>

                    <td className="p-3 text-[11px] text-[#412D15]/75 border-r border-[#ebdcd0]">
                      <div className="truncate max-w-[120px]">{item.origin}</div>
                      <div className="text-[#412D15]/50 truncate max-w-[120px]">→ {item.destination}</div>
                    </td>

                    <td className="p-3 border-r border-[#ebdcd0]">
                      <span className="px-2 py-0.5 rounded bg-[#faf6f2] text-[#412D15] text-[10px] sm:text-xs border border-[#ebdcd0] font-semibold whitespace-nowrap">
                        {item.category}
                      </span>
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-[#412D15] border-r border-[#ebdcd0]">
                      {item.weightInKg.toFixed(2)}
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-[#412D15] border-r border-[#ebdcd0]">
                      {item.weightOutKg !== undefined ? item.weightOutKg.toFixed(2) : '—'}
                    </td>

                    <td className="p-3 text-right font-mono whitespace-nowrap border-r border-[#ebdcd0]">
                      {item.weightDiffKg !== undefined ? (
                        <span className={`font-bold ${
                          isPilfered ? 'text-rose-700' : 'text-emerald-700'
                        }`}>
                          {item.weightDiffKg > 0 ? `+${item.weightDiffKg}` : item.weightDiffKg} kg ({item.weightLossPercentage}%)
                        </span>
                      ) : (
                        <span className="text-[#412D15]/50">Pending</span>
                      )}
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      {isPilfered && (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-700 text-xs">
                          <ShieldAlert className="w-3.5 h-3.5" /> PILFERAGE
                        </span>
                      )}
                      {isCleared && (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> CLEARED
                        </span>
                      )}
                      {item.status === 'INBOUND_RECORDED' && (
                        <span className="text-[#412D15]/60 text-xs font-semibold">RECORDED</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Sign-off Blocks */}
        <div className="pt-4 sm:pt-6 border-t border-[#ebdcd0] grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 text-xs text-[#412D15]/75">
          <div>
            <div className="font-bold text-[#412D15] mb-5 sm:mb-6">Scale Attendant</div>
            <div className="border-b border-dashed border-[#ebdcd0] pb-1 font-mono">Signature / Date</div>
          </div>
          <div>
            <div className="font-bold text-[#412D15] mb-5 sm:mb-6">Security Lead</div>
            <div className="border-b border-dashed border-[#ebdcd0] pb-1 font-mono">Signature / Date</div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="font-bold text-[#412D15] mb-5 sm:mb-6">Hub Supervisor</div>
            <div className="border-b border-dashed border-[#ebdcd0] pb-1 font-mono">Signature / Date</div>
          </div>
        </div>
      </div>
    </div>
  );
};
