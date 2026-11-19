'use client';

import React, { useRef, useState } from 'react';
import { 
  Camera, 
  UploadCloud, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Sparkles,
  Cloud,
  FileImage
} from 'lucide-react';
import { 
  uploadImageToCloudinary, 
  isCloudinaryConfigured, 
  getOptimizedImageUrl 
} from '@/lib/cloudinary';
import { PhotoLightboxModal } from './PhotoLightboxModal';

interface PhotoCaptureInputProps {
  label: string;
  sublabel?: string;
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  tag?: string;
  required?: boolean;
  awbNumber?: string;
  stageName?: 'Inbound Arrival' | 'Outbound Dispatch';
}

export const PhotoCaptureInput: React.FC<PhotoCaptureInputProps> = ({
  label,
  sublabel = 'Take a live photo of the digital scale readout and carton seal.',
  value = '',
  onChange,
  folder = 'pms_shipments',
  tag,
  required = false,
  awbNumber,
  stageName = 'Inbound Arrival',
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLocalFallback, setIsLocalFallback] = useState(false);
  const [fileDetails, setFileDetails] = useState<{ sizeKb?: number; format?: string } | null>(null);

  const cloudinaryReady = isCloudinaryConfigured();

  const handleProcessFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await uploadImageToCloudinary(file, {
        folder,
        tag,
      });

      onChange(result.url);
      setIsLocalFallback(result.isLocalFallback);
      setFileDetails({
        sizeKb: result.bytes ? Math.round(result.bytes / 1024) : Math.round(file.size / 1024),
        format: result.format || file.type.replace('image/', '').toUpperCase(),
      });
    } catch (err: any) {
      console.error('Photo processing error:', err);
      setUploadError(err.message || 'Failed to process photo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    // Reset input value so same file can be re-selected if retried
    e.target.value = '';
  };

  const handleClearPhoto = () => {
    onChange('');
    setUploadError(null);
    setFileDetails(null);
    setIsLocalFallback(false);
  };

  return (
    <div className="bg-[#faf6f2] border border-[#ebdcd0] rounded-2xl p-4 sm:p-5 text-[#412D15] transition-all">
      {/* Hidden file inputs */}
      {/* 1. Camera-targeted on mobile devices */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraChange}
        className="hidden"
      />
      {/* 2. Standard file picker for desktop/gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleCameraChange}
        className="hidden"
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#6E3511] stroke-[2.2] shrink-0" />
            <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-[#412D15]">
              {label} {required && <span className="text-rose-600">*</span>}
            </h4>
          </div>
          {sublabel && (
            <p className="text-[11px] sm:text-xs text-[#412D15]/70 mt-0.5">
              {sublabel}
            </p>
          )}
        </div>

        {/* Storage status badge */}
        <div className="self-start sm:self-auto flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-lg border bg-white">
          <Cloud className="w-3 h-3 text-[#6E3511]" />
          <span>Storage: </span>
          {cloudinaryReady ? (
            <span className="text-emerald-700 font-bold">Cloudinary Live</span>
          ) : (
            <span className="text-amber-700 font-mono font-medium">Staging (Add keys to .env)</span>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Uploading State */}
      {isUploading ? (
        <div className="py-8 px-4 bg-white border-2 border-dashed border-[#ebdcd0] rounded-xl flex flex-col items-center justify-center gap-2 text-center">
          <RefreshCw className="w-6 h-6 text-[#6E3511] animate-spin" />
          <div className="text-xs sm:text-sm font-bold text-[#412D15]">
            Compressing & Uploading Evidence Photo...
          </div>
          <p className="text-[11px] text-[#412D15]/60 max-w-xs">
            Optimizing image dimensions and reducing file size for lightning fast transfer.
          </p>
        </div>
      ) : value ? (
        /* Photo Preview Deck */
        <div className="bg-white border border-[#ebdcd0] rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center gap-4 shadow-2xs">
          {/* Thumbnail */}
          <div className="relative group shrink-0 w-full sm:w-36 h-36 bg-[#1a120b] rounded-lg overflow-hidden border border-[#ebdcd0] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getOptimizedImageUrl(value, { width: 300, height: 300, crop: 'fill' })}
              alt="Weight Evidence"
              className="w-full h-full object-cover transition group-hover:scale-105 duration-300"
            />
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-white transition text-xs font-bold"
            >
              <Eye className="w-5 h-5" />
              <span>Click to Zoom</span>
            </button>
            <span className="absolute bottom-1 right-1 bg-black/75 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">
              Verified
            </span>
          </div>

          {/* Details & Actions */}
          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Photo Captured
              </span>
              {fileDetails?.sizeKb && (
                <span className="text-[11px] font-mono text-[#412D15]/60">
                  {fileDetails.sizeKb} KB • {fileDetails.format}
                </span>
              )}
            </div>

            <p className="text-xs text-[#412D15]/80">
              Attached to shipment audit record. Click preview to inspect full scale reading.
            </p>

            {isLocalFallback && (
              <div className="text-[10px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                Staged locally. To upload directly to your Cloudinary cloud, add keys in <code className="font-mono font-bold">.env.local</code>.
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="text-xs font-bold text-[#412D15] hover:text-[#6E3511] bg-[#faf6f2] hover:bg-[#f6eee7] border border-[#ebdcd0] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
              >
                <Eye className="w-3.5 h-3.5 text-[#6E3511]" /> View Large
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="text-xs font-bold text-[#412D15] hover:text-[#6E3511] bg-[#faf6f2] hover:bg-[#f6eee7] border border-[#ebdcd0] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
              >
                <Camera className="w-3.5 h-3.5 text-[#6E3511]" /> Retake
              </button>

              <button
                type="button"
                onClick={handleClearPhoto}
                className="text-xs font-bold text-rose-700 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Action Deck: Camera or Device File Upload */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* 1. Mobile Camera Tap */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="w-full bg-white hover:bg-[#faf6f2] active:bg-[#f6eee7] border-2 border-dashed border-[#ebdcd0] hover:border-[#6E3511] rounded-xl p-3 sm:p-4 flex items-center justify-center gap-2.5 transition text-left group min-h-[56px]"
          >
            <div className="p-2 rounded-lg bg-[#faf6f2] group-hover:bg-[#ebdcd0] text-[#6E3511] transition shrink-0">
              <Camera className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-[#412D15] flex items-center gap-1">
                <span>Take Camera Photo</span>
                <Sparkles className="w-3 h-3 text-[#6E3511]" />
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#412D15]/65">
                Opens camera directly on mobile
              </div>
            </div>
          </button>

          {/* 2. Device Gallery / File Picker */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-white hover:bg-[#faf6f2] active:bg-[#f6eee7] border border-[#ebdcd0] hover:border-[#6E3511] rounded-xl p-3 sm:p-4 flex items-center justify-center gap-2.5 transition text-left group min-h-[56px]"
          >
            <div className="p-2 rounded-lg bg-[#faf6f2] group-hover:bg-[#ebdcd0] text-[#6E3511] transition shrink-0">
              <UploadCloud className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-[#412D15]">
                Upload from Gallery
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#412D15]/65">
                Select saved photo or document
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Lightbox Modal */}
      <PhotoLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        imageUrl={value}
        title={`${stageName} Photo Evidence`}
        subtitle={awbNumber ? `Air Waybill: ${awbNumber}` : undefined}
        metadata={{
          awbNumber,
          stage: stageName,
        }}
      />
    </div>
  );
};
