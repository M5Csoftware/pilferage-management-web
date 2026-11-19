/**
 * Cloudinary Direct Unsigned Upload & Client-Side Optimization Helper
 * 
 * Works with Cloudinary's free tier (no credit card required).
 * If Cloudinary keys are not yet configured in .env.local, gracefully
 * falls back to local data URLs so the app remains 100% functional for testing.
 */

export const getCloudinaryConfig = () => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() || '';
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim() || '';
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY?.trim() || '';

  return {
    cloudName,
    uploadPreset,
    apiKey,
    isConfigured: Boolean(cloudName && uploadPreset),
  };
};

export const isCloudinaryConfigured = (): boolean => {
  return getCloudinaryConfig().isConfigured;
};

/**
 * Client-side image compression to convert large camera shots (4MB-15MB)
 * into lightweight, crystal-clear WebP/JPEG images (~150KB-350KB) before uploading.
 * This guarantees instantaneous mobile uploads and maximizes free storage efficiency.
 */
export async function compressImage(
  file: File | Blob,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // If not in a browser environment, return original
    if (typeof window === 'undefined') {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved downscaled dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        // Apply smooth downsampling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP if supported, fallback to JPEG
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              resolve(blob);
            } else {
              // If compression didn't reduce size, keep original
              resolve(file);
            }
          },
          'image/webp',
          quality
        );
      };

      img.onerror = (err) => {
        console.warn('Canvas image loading failed, proceeding with original file', err);
        resolve(file);
      };
    };

    reader.onerror = (error) => {
      console.warn('FileReader failed, proceeding with original file', error);
      resolve(file);
    };
  });
}

export interface UploadResult {
  url: string;
  publicId?: string;
  isLocalFallback: boolean;
  bytes?: number;
  format?: string;
}

/**
 * Uploads an image to Cloudinary using Unsigned Upload Preset.
 * If credentials are not set, falls back to a base64 Data URL so the app
 * operates smoothly without errors.
 */
export async function uploadImageToCloudinary(
  file: File | Blob,
  options?: {
    folder?: string;
    tag?: string;
  }
): Promise<UploadResult> {
  const { cloudName, uploadPreset, isConfigured } = getCloudinaryConfig();

  // Compress image client-side before any upload
  let processedBlob: Blob = file;
  try {
    processedBlob = await compressImage(file);
  } catch (e) {
    console.warn('Image compression bypassed:', e);
  }

  // 1. If Cloudinary keys are configured, perform direct upload to Cloudinary
  if (isConfigured) {
    try {
      const formData = new FormData();
      formData.append('file', processedBlob);
      formData.append('upload_preset', uploadPreset);
      if (options?.folder) {
        formData.append('folder', options.folder);
      }
      if (options?.tag) {
        formData.append('tags', options.tag);
      }

      const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Cloudinary upload failed with HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        url: data.secure_url || data.url,
        publicId: data.public_id,
        isLocalFallback: false,
        bytes: data.bytes,
        format: data.format,
      };
    } catch (err: any) {
      console.error('Cloudinary upload error:', err.message);
      // Fallback to local DataURL if network or credentials error occurs
    }
  }

  // 2. Fallback: Convert to Data URL for instant preview & offline/staging testing
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        url: reader.result as string,
        isLocalFallback: true,
        bytes: processedBlob.size,
      });
    };
    reader.readAsDataURL(processedBlob);
  });
}

/**
 * Transforms a Cloudinary URL to deliver an optimized thumbnail/preview size.
 * e.g. injects /c_fill,w_400,h_400,q_auto,f_auto/ into Cloudinary URLs.
 */
export function getOptimizedImageUrl(
  url?: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
  }
): string {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com') || url.startsWith('data:')) {
    return url;
  }

  const { width = 600, height, crop = 'limit' } = options || {};
  const transforms = [
    'f_auto',
    'q_auto',
    `c_${crop}`,
    width ? `w_${width}` : '',
    height ? `h_${height}` : '',
  ]
    .filter(Boolean)
    .join(',');

  return url.replace('/upload/', `/upload/${transforms}/`);
}
