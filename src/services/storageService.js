/**
 * Cloud Storage Service Contract & Implementation
 *
 * Handles file uploads (place photos, review images, community submission attachments).
 * Enforces file size limits (< 5MB) and mime type validation (images only) client-side
 * before attempting upload to Firebase Cloud Storage.
 */

import { storage, isDemoMode } from "./config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB limit
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Upload a file to Cloud Storage or simulate in Demo Mode.
 * @param {string} destinationPath - e.g., 'submissions/user_123/photo.jpg'
 * @param {File|Blob} file - The file object to upload
 * @param {Object} [metadata] - Optional custom metadata
 * @returns {Promise<{ downloadUrl: string, fullPath: string }>}
 */
export async function uploadFile(destinationPath, file, metadata = {}) {
  if (!file) {
    throw new Error("No file provided for upload.");
  }
  if (!destinationPath) {
    throw new Error("destinationPath is required.");
  }

  // Validate size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File size (${(file.size / (1024 * 1024)).toFixed(
        2
      )} MB) exceeds maximum allowed limit of 5 MB.`
    );
  }

  // Validate mime type
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type (${file.type}). Only JPEG, PNG, and WebP images are allowed.`
    );
  }

  if (isDemoMode || !storage) {
    // Return a working demo placeholder URL
    const demoUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb";
    return Promise.resolve({
      downloadUrl: demoUrl,
      fullPath: `demo/${destinationPath}`,
    });
  }

  try {
    const storageRef = ref(storage, destinationPath);
    const customMetadata = {
      contentType: file.type || "image/jpeg",
      ...metadata,
    };

    const snapshot = await uploadBytes(storageRef, file, {
      customMetadata,
    });
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return {
      downloadUrl,
      fullPath: snapshot.ref.fullPath,
    };
  } catch (error) {
    console.error(`Error uploading file to ${destinationPath}:`, error);
    throw error;
  }
}
