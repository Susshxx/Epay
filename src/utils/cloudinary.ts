/**
 * Cloudinary upload utility for payment screenshots
 * Using signed uploads with API credentials
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || '';
const CLOUDINARY_API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET || '';

export type CloudinaryUploadResult = {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
};

/**
 * Generate SHA-256 signature for Cloudinary signed upload
 */
async function generateSignature(paramsToSign: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(paramsToSign + CLOUDINARY_API_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Upload an image file to Cloudinary using signed upload
 * @param file - The image file to upload
 * @returns Upload result with URL or error
 */
export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.warn('Cloudinary not configured. Set VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_API_KEY, and VITE_CLOUDINARY_API_SECRET in .env');
    return {
      success: false,
      error: 'Cloudinary not configured'
    };
  }

  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'epay-payment-receipts';
    
    // Parameters to sign (alphabetically sorted, excluding signature and file)
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    
    // Generate signature
    const signature = await generateSignature(paramsToSign);
    
    // Build form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Upload failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
  return !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
}
