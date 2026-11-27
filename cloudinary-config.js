/**
 * cloudinary-config.js
 *
 * Cloudinary is used only to host image FILES (Firebase Storage requires the
 * paid Blaze plan, so it's deliberately not used). Firestore's `media`
 * collection keeps a small record per upload (name, URL, dimensions) so the
 * admin panel's media library has something to list.
 *
 * cloudName / uploadPreset come from Cloudinary Console > Settings > Upload >
 * Upload presets (create one set to "Unsigned"). See SETUP-ADMIN.md.
 */

export const CLOUDINARY_CONFIG = {
  cloudName: 'YOUR_CLOUD_NAME',
  uploadPreset: 'YOUR_UNSIGNED_UPLOAD_PRESET',
  maxWidth: 1600,      // in-browser resize target before upload
  folder: 'nfta'        // Cloudinary folder new uploads are placed in
};

// True once the placeholders above have been replaced with real values.
export const IMAGES_CONFIGURED = Boolean(
  CLOUDINARY_CONFIG.cloudName &&
  CLOUDINARY_CONFIG.cloudName !== 'YOUR_CLOUD_NAME' &&
  CLOUDINARY_CONFIG.uploadPreset &&
  CLOUDINARY_CONFIG.uploadPreset !== 'YOUR_UNSIGNED_UPLOAD_PRESET'
);
