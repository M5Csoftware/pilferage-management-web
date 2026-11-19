'use client';

import React from 'react';
import { X, ExternalLink, Download, Scale, Calendar, User, ShieldCheck } from 'lucide-react';

interface PhotoLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  subtitle?: string;
  metadata?: {
    awbNumber?: string;
    operator?: string;
    date?: string;
    weightKg?: number;
    sealNumber?: string;
    stage?: 'Inbound Arrival' | 'Outbound Dispatch' | 'Inspection';
  };
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  subtitle,
  metadata,
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-[#ebdcd0]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#ebdcd0] bg-[#faf8f5]">
          <div>
            <h3 className="text-sm sm:text-base md:text-lg font-black text-[#412D15] truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-[#412D15]/70 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="p-2 text-[#412D15] hover:text-[#6E3511] hover:bg-[#ebdcd0]/50 rounded-xl transition"
              title="Open full size / Download"
            >
              <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-[#412D15] hover:text-[#6E3511] hover:bg-[#ebdcd0]/50 rounded-xl transition"
              aria-label="Close"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="flex-1 overflow-auto p-2 sm:p-4 bg-[#1a120b] flex items-center justify-center min-h-[250px] max-h-[60vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[58vh] max-w-full object-contain rounded-lg shadow-md"
          />
        </div>

        {/* Metadata Footer */}
        {metadata && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-[#faf8f5] border-t border-[#ebdcd0] text-xs sm:text-sm text-[#412D15]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
              {metadata.awbNumber && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#412D15]/60 block">AWB Number</span>
                  <span className="font-mono font-bold text-[#6E3511]">{metadata.awbNumber}</span>
                </div>
              )}
              {metadata.weightKg !== undefined && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#412D15]/60 block">Scale Reading</span>
                  <span className="font-mono font-bold text-[#412D15] flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-[#6E3511]" />
                    {metadata.weightKg.toFixed(2)} kg
                  </span>
                </div>
              )}
              {metadata.sealNumber && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#412D15]/60 block">Seal Barcode</span>
                  <span className="font-mono font-bold text-[#412D15] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {metadata.sealNumber}
                  </span>
                </div>
              )}
              {metadata.operator && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#412D15]/60 block">Attendant / Date</span>
                  <span className="font-semibold text-[#412D15] truncate block">
                    {metadata.operator}
                    {metadata.date ? ` • ${metadata.date}` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
