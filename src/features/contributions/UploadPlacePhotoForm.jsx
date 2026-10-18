import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { placeService, storageService } from "../../services";
import Button from "../../components/Button.jsx";
import AuthModal from "../../components/AuthModal.jsx";

export default function UploadPlacePhotoForm({ placeId, placeName, onPhotoUploaded }) {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  function handleFileChange(file) {
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    setImageFile(file);
    if (typeof FileReader !== "undefined") {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!imageFile && !imagePreview) {
      setError("Please select an image file to upload.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      let photoUrl = imagePreview;
      if (imageFile) {
        const uploadRes = await storageService.uploadFile(
          `places/${placeId}/${Date.now()}_${imageFile.name}`,
          imageFile
        );
        photoUrl = uploadRes.downloadUrl;
      }

      const uploaded = await placeService.uploadPlacePhoto(placeId, {
        photoUrl,
        caption: caption.trim(),
        uploaderName: user.displayName || user.email?.split("@")[0] || "Community Contributor",
        userId: user.uid,
      });

      setSuccess(uploaded);
      onPhotoUploaded?.(uploaded);
    } catch (err) {
      setError(err.message || "Failed to upload photo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-emerald-900">Photo Uploaded Successfully!</span>
          <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
            Added to Gallery
          </span>
        </div>
        <div className="flex items-center gap-3">
          <img
            src={success.photoUrl}
            alt=""
            className="h-16 w-16 object-cover rounded-xl ring-1 ring-emerald-300"
          />
          <p className="text-emerald-950 text-xs leading-relaxed">
            Thank you for sharing your photo of <strong>{placeName || "this spot"}</strong>! Your photo is now featured in the community gallery.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSuccess(null);
            setImageFile(null);
            setImagePreview(null);
            setCaption("");
          }}
          className="font-semibold text-emerald-800 underline hover:text-emerald-950 block pt-1"
        >
          Upload another photo
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-monsoon-200 bg-white p-5 shadow-sm space-y-4">
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />

      <div>
        <h3 className="text-base font-bold text-monsoon-900">
          Upload Spot Photo
        </h3>
        <p className="text-xs text-monsoon-800/70 mt-0.5">
          Share your real photo of {placeName || "this place"} taken by you.
        </p>
      </div>

      {!user && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800 flex justify-between items-center">
          <span>Sign in to contribute photos.</span>
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="font-bold underline text-amber-900"
          >
            Sign In
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Drop / Select zone */}
        <div>
          <label className="block text-xs font-semibold text-monsoon-800 mb-1">
            Photo File <span className="text-rose-500">*</span>
          </label>
          {!imagePreview ? (
            <label
              htmlFor="spot-photo-upload"
              className="flex flex-col items-center justify-center border border-dashed border-monsoon-300 hover:border-monsoon-700 rounded-xl p-4 bg-monsoon-50/50 hover:bg-monsoon-50 cursor-pointer transition-colors text-center"
            >
              <svg className="w-6 h-6 text-monsoon-600 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              <span className="text-xs font-semibold text-monsoon-900">Choose or drop photo</span>
              <span className="text-[10px] text-monsoon-700 mt-0.5">JPEG, PNG or WebP</span>
              <input
                id="spot-photo-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                className="sr-only"
              />
            </label>
          ) : (
            <div className="rounded-xl border border-monsoon-200 overflow-hidden bg-monsoon-50 p-2.5 flex items-center gap-3">
              <img
                src={imagePreview}
                alt="Selected preview"
                className="h-16 w-16 object-cover rounded-lg ring-1 ring-black/10 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-monsoon-900 block truncate">
                  {imageFile?.name || "Photo selected"}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium block">
                  ✓ Ready to upload
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleFileChange(null)}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 rounded-md hover:bg-rose-50 transition-colors"
              >
                Change
              </button>
            </div>
          )}
        </div>

        {/* Caption */}
        <div>
          <label htmlFor="photo-caption-input" className="block text-xs font-semibold text-monsoon-800 mb-1">
            Caption / Notes (Optional)
          </label>
          <input
            id="photo-caption-input"
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="e.g. Sunset view from west cliff, October 2026"
            className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-xs focus:border-monsoon-600 focus:outline-none"
          />
        </div>

        <Button type="submit" disabled={submitting || !imagePreview} size="sm" className="w-full">
          {submitting ? "Uploading Photo…" : "Upload Photo"}
        </Button>
      </form>
    </div>
  );
}
