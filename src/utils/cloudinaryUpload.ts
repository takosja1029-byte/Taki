/**
 * Utility to upload images to Cloudinary using an unsigned upload preset.
 * Accepts either a File or a base64 data URL (e.g. output of compressImage)
 * and returns the permanent, publicly-accessible secure_url.
 */

const CLOUD_NAME = 'vymnefka';
const UPLOAD_PRESET = 'taki_site_images';
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/data:(.*?);base64/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export async function uploadToCloudinary(source: File | string): Promise<string> {
  const formData = new FormData();

  if (typeof source === 'string') {
    // Already a data URL (e.g. from compressImage or the cropper) — convert to a blob so
    // we get a real image upload rather than sending a giant string field.
    const blob = dataUrlToBlob(source);
    formData.append('file', blob);
  } else {
    formData.append('file', source);
  }

  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Cloudinary upload failed (${response.status}): ${errText}`);
  }

  const data = await response.json();

  if (!data.secure_url) {
    throw new Error('Cloudinary upload did not return a URL.');
  }

  return data.secure_url as string;
}

// Cloudinary treats audio files through its "video" resource type endpoint.
// Uses the same unsigned preset as images — works identically, just a different
// upload URL, and returns a permanent cross-device link.
const AUDIO_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;

export async function uploadAudioToCloudinary(source: File | string): Promise<string> {
  const formData = new FormData();

  if (typeof source === 'string') {
    const blob = dataUrlToBlob(source);
    formData.append('file', blob);
  } else {
    formData.append('file', source);
  }

  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(AUDIO_UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Cloudinary audio upload failed (${response.status}): ${errText}`);
  }

  const data = await response.json();

  if (!data.secure_url) {
    throw new Error('Cloudinary audio upload did not return a URL.');
  }

  return data.secure_url as string;
}
