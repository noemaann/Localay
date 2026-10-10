import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLocation } from "../../context/LocationContext.jsx";
import { CATEGORIES } from "../../data/categories.js";
import { REGIONS } from "../../data/regions.js";
import { submissionService, storageService } from "../../services";
import SubmissionStatusBadge from "../../components/SubmissionStatusBadge.jsx";
import Button from "../../components/Button.jsx";
import AuthModal from "../../components/AuthModal.jsx";

export default function SubmitPlaceForm({ onSubmitted }) {
  const { user } = useAuth();
  const { region: activeRegion } = useLocation();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "food",
    regionId: activeRegion.id,
    districtId: activeRegion.districtId || "malappuram",
    townId: "",
    description: "",
    address: "",
    coverImage: "",
    accessInfo: "",
    roadCondition: "Paved Road",
  });

  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successSubmission, setSuccessSubmission] = useState(null);

  function validate() {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Place name is required.";
    if (!formData.category) errs.category = "Category selection is required.";
    if (!formData.regionId) errs.regionId = "Region is required.";
    if (!formData.townId.trim()) errs.townId = "Town or locality name is required.";
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      errs.description = "Description must be at least 10 characters long.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!validate()) return;

    setSubmitting(true);
    setErrors({});
    try {
      let uploadedImageUrl = formData.coverImage;
      if (imageFile) {
        const uploadRes = await storageService.uploadFile(
          `submissions/${user.uid}/${Date.now()}_${imageFile.name}`,
          imageFile
        );
        uploadedImageUrl = uploadRes.downloadUrl;
      }

      const submission = await submissionService.submitNewPlace({
        userId: user.uid,
        regionId: formData.regionId,
        districtId: formData.districtId,
        townId: formData.townId.trim(),
        placeData: {
          name: formData.name.trim(),
          category: formData.category,
          description: formData.description.trim(),
          address: formData.address.trim(),
          coverImage: uploadedImageUrl,
          accessInfo: formData.accessInfo.trim(),
          roadCondition: formData.roadCondition,
        },
      });

      setSuccessSubmission(submission);
      onSubmitted?.(submission);
    } catch (err) {
      setErrors({ general: err.message || "Failed to submit place proposal." });
    } finally {
      setSubmitting(false);
    }
  }

  if (successSubmission) {
    return (
      <div className="rounded-2xl border border-monsoon-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3 text-emerald-700">
          <span className="text-2xl">🎉</span>
          <h3 className="text-lg font-bold">Place Proposed Successfully!</h3>
        </div>
        <p className="text-sm text-monsoon-800 mb-4 leading-relaxed">
          Thank you for contributing <strong>{successSubmission.placeData.name}</strong> to the community.
        </p>

        <div className="rounded-xl bg-monsoon-50 border border-monsoon-100 p-4 mb-6 text-xs text-monsoon-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Submission ID:</span>
            <span className="font-mono text-monsoon-600">{successSubmission.id}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Current Moderation Status:</span>
            <SubmissionStatusBadge status={successSubmission.status} />
          </div>
          <p className="pt-2 text-monsoon-800/70 border-t border-monsoon-200/60">
            🔒 All new community place proposals enter <strong>Pending Review</strong> and are reviewed by moderators before full publication as verified spots.
          </p>
        </div>

        <Button
          onClick={() => {
            setSuccessSubmission(null);
            setFormData({
              name: "",
              category: "food",
              regionId: activeRegion.id,
              districtId: activeRegion.districtId || "malappuram",
              townId: "",
              description: "",
              address: "",
              coverImage: "",
              accessInfo: "",
              roadCondition: "Paved Road",
            });
          }}
        >
          Submit Another Spot
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-monsoon-200 bg-white p-6 shadow-sm">
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
        }}
      />

      <div className="mb-6 border-b border-monsoon-100 pb-4">
        <h2 className="text-xl font-bold text-monsoon-900">Propose a New Place</h2>
        <p className="mt-1 text-xs text-monsoon-800/70">
          Share a local food spot, hidden viewpoint, or nature escape with the community.
        </p>
      </div>

      {!user && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex justify-between items-center">
          <span>🔒 You must be signed in to submit community contributions.</span>
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="font-bold underline text-amber-900"
          >
            Sign In Now
          </button>
        </div>
      )}

      {errors.general && (
        <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Place Name */}
        <div>
          <label htmlFor="place-name-input" className="block text-xs font-semibold text-monsoon-800 mb-1">
            Place Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="place-name-input"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Koduvally Sunset Viewpoint"
            className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-sm focus:border-monsoon-600 focus:outline-none"
          />
          {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
        </div>

        {/* Category & Region */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="place-category-select" className="block text-xs font-semibold text-monsoon-800 mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              id="place-category-select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-sm focus:border-monsoon-600 focus:outline-none bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="place-region-select" className="block text-xs font-semibold text-monsoon-800 mb-1">
              Region <span className="text-rose-500">*</span>
            </label>
            <select
              id="place-region-select"
              value={formData.regionId}
              onChange={(e) => {
                const reg = REGIONS.find((r) => r.id === e.target.value);
                setFormData({
                  ...formData,
                  regionId: e.target.value,
                  districtId: reg?.districtId || "malappuram",
                });
              }}
              className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-sm focus:border-monsoon-600 focus:outline-none bg-white"
            >
              {REGIONS.map((reg) => (
                <option key={reg.id} value={reg.id}>
                  {reg.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Town / Locality */}
        <div>
          <label htmlFor="place-town-input" className="block text-xs font-semibold text-monsoon-800 mb-1">
            Town / Locality <span className="text-rose-500">*</span>
          </label>
          <input
            id="place-town-input"
            type="text"
            required
            value={formData.townId}
            onChange={(e) => setFormData({ ...formData, townId: e.target.value })}
            placeholder="e.g. Kottakkal, Nilambur, Tirur, Perinthalmanna"
            className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-sm focus:border-monsoon-600 focus:outline-none"
          />
          {errors.townId && <p className="mt-1 text-xs text-rose-600">{errors.townId}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="place-desc-input" className="block text-xs font-semibold text-monsoon-800 mb-1">
            Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="place-desc-input"
            rows={3}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what makes this place special, ideal times to visit, local context..."
            className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-sm focus:border-monsoon-600 focus:outline-none resize-none"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-rose-600">{errors.description}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label htmlFor="place-address-input" className="block text-xs font-semibold text-monsoon-800 mb-1">
            Address / Landmarks (Optional)
          </label>
          <input
            id="place-address-input"
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g. Near Bus Stand, Hospital Road"
            className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-sm focus:border-monsoon-600 focus:outline-none"
          />
        </div>

        {/* Road Condition & Access Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="place-road-select" className="block text-xs font-semibold text-monsoon-800 mb-1">
              Road Condition
            </label>
            <select
              id="place-road-select"
              value={formData.roadCondition}
              onChange={(e) => setFormData({ ...formData, roadCondition: e.target.value })}
              className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-sm focus:border-monsoon-600 focus:outline-none bg-white"
            >
              <option value="Paved Road">Paved Road (Easy Access)</option>
              <option value="Gravel / Dirt Road">Gravel / Dirt Road</option>
              <option value="Steep Incline">Steep Incline</option>
              <option value="Narrow Pass">Narrow Pass</option>
              <option value="4x4 Vehicle Required">4x4 Vehicle Required</option>
            </select>
          </div>

          <div>
            <label htmlFor="place-image-file" className="block text-xs font-semibold text-monsoon-800 mb-1">
              Cover Image (File Upload or URL)
            </label>
            <input
              id="place-image-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-monsoon-800 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-monsoon-100 file:text-monsoon-800 hover:file:bg-monsoon-200"
            />
          </div>
        </div>

        <Button type="submit" disabled={submitting} className="w-full mt-4">
          {submitting ? "Submitting Place…" : "Submit Proposal"}
        </Button>
      </form>
    </div>
  );
}
