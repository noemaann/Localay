import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLocation } from "../../context/LocationContext.jsx";
import { CATEGORIES } from "../../data/categories.js";
import { REGIONS } from "../../data/regions.js";
import {
  submissionService,
  storageService,
  locationSearchService,
} from "../../services";
import SubmissionStatusBadge from "../../components/SubmissionStatusBadge.jsx";
import Button from "../../components/Button.jsx";
import AuthModal from "../../components/AuthModal.jsx";

export default function SubmitPlaceForm({ onSubmitted }) {
  const { user } = useAuth();
  const { region: activeRegion, setRegion } = useLocation();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "food",
    regionId: activeRegion.id,
    regionName: activeRegion.name || "Malappuram",
    districtId: activeRegion.districtId || activeRegion.name || "malappuram",
    townId: "",
    description: "",
    address: "",
    coverImage: "",
    accessInfo: "",
    roadCondition: "Paved Road",
    coordinates: null,
    gmapsUrl: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successSubmission, setSuccessSubmission] = useState(null);

  // Region search state
  const [regionQuery, setRegionQuery] = useState(activeRegion.name || "");
  const [regionResults, setRegionResults] = useState([]);
  const [searchingRegion, setSearchingRegion] = useState(false);
  const [showRegionResults, setShowRegionResults] = useState(false);
  const regionRef = useRef(null);

  // Town / Locality search state
  const [townQuery, setTownQuery] = useState("");
  const [townResults, setTownResults] = useState([]);
  const [searchingTown, setSearchingTown] = useState(false);
  const [showTownResults, setShowTownResults] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const townRef = useRef(null);

  // Sync when activeRegion changes from context
  useEffect(() => {
    if (activeRegion) {
      setFormData((prev) => ({
        ...prev,
        regionId: activeRegion.id,
        regionName: activeRegion.name,
        districtId: activeRegion.districtId || activeRegion.name,
      }));
      setRegionQuery(activeRegion.name || "");
    }
  }, [activeRegion]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (regionRef.current && !regionRef.current.contains(e.target)) {
        setShowRegionResults(false);
      }
      if (townRef.current && !townRef.current.contains(e.target)) {
        setShowTownResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live Region Search from internet
  useEffect(() => {
    if (!regionQuery || regionQuery.trim().length < 2) {
      setRegionResults([]);
      setSearchingRegion(false);
      return;
    }

    const controller = new AbortController();
    setSearchingRegion(true);

    const timer = setTimeout(async () => {
      try {
        const results = await locationSearchService.searchLocationsFromInternet(
          regionQuery,
          controller.signal
        );
        setRegionResults(results);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Region search error:", err);
        }
      } finally {
        setSearchingRegion(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [regionQuery]);

  // Live Town / Locality Search from internet
  useEffect(() => {
    if (!townQuery || townQuery.trim().length < 2) {
      setTownResults([]);
      setSearchingTown(false);
      return;
    }

    const controller = new AbortController();
    setSearchingTown(true);

    const timer = setTimeout(async () => {
      try {
        // Query town with region context for precise local geocoding
        const queryWithContext = `${townQuery} ${formData.regionName || ""}`.trim();
        const results = await locationSearchService.searchLocationsFromInternet(
          queryWithContext,
          controller.signal
        );
        setTownResults(results);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Town search error:", err);
        }
      } finally {
        setSearchingTown(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [townQuery, formData.regionName]);

  function handleSelectRegion(loc) {
    setFormData((prev) => ({
      ...prev,
      regionId: loc.id,
      regionName: loc.name,
      districtId: loc.district || loc.name,
    }));
    setRegionQuery(loc.name);
    setShowRegionResults(false);
    setRegion(loc); // update global active region as well
  }

  function handleSelectTown(loc) {
    setFormData((prev) => ({
      ...prev,
      townId: loc.name,
      address: prev.address || loc.label,
      coordinates: loc.coordinates || null,
    }));
    setTownQuery(loc.name);
    setShowTownResults(false);
  }

  function handleDetectTownGps() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const detected = await locationSearchService.reverseGeocodeFromInternet(
            latitude,
            longitude
          );
          if (detected) {
            setFormData((prev) => ({
              ...prev,
              townId: detected.name,
              address: prev.address || detected.label,
              coordinates: { latitude, longitude },
            }));
            setTownQuery(detected.name);
          }
        } catch (err) {
          console.error("GPS detection error:", err);
        } finally {
          setDetectingGps(false);
        }
      },
      (err) => {
        console.warn("GPS error:", err);
        setDetectingGps(false);
      },
      { timeout: 8000 }
    );
  }

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
          location: formData.coordinates || null,
          googleMapsUrl: formData.gmapsUrl?.trim() || "",
        },
      });

      setSuccessSubmission(submission);
      onSubmitted?.(submission);
    } catch (err) {
      console.error("Submission failed:", err);
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
          <div className="flex justify-between items-center">
            <span className="font-semibold">Location / Town:</span>
            <span className="text-monsoon-900">{successSubmission.townId}, {formData.regionName}</span>
          </div>
          <p className="pt-2 text-monsoon-800/70 border-t border-monsoon-200/60">
            🔒 All new community place proposals enter <strong>Pending Review</strong> and are reviewed by moderators before publication as verified spots.
          </p>
        </div>

        <Button
          onClick={() => {
            setSuccessSubmission(null);
            setFormData({
              name: "",
              category: "food",
              regionId: activeRegion.id,
              regionName: activeRegion.name,
              districtId: activeRegion.districtId || "malappuram",
              townId: "",
              description: "",
              address: "",
              coverImage: "",
              accessInfo: "",
              roadCondition: "Paved Road",
              coordinates: null,
            });
            setTownQuery("");
            setRegionQuery(activeRegion.name || "");
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
          Share a local food spot, hidden viewpoint, or nature escape with the community using real map locations.
        </p>
      </div>

      {!user && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex justify-between items-center">
          <span>🔒 Please sign in before submitting so your contribution is credited to you.</span>
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="font-bold underline text-amber-900 ml-2 shrink-0"
          >
            Sign In with Google
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
            placeholder="e.g. Koduvally Sunset Viewpoint, Rahmaniya Biriyani"
            className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-sm focus:border-monsoon-600 focus:outline-none"
          />
          {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
        </div>

        {/* Category & Region with Internet Search */}
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

          {/* Region Search from Internet */}
          <div ref={regionRef} className="relative">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="place-region-select" className="block text-xs font-semibold text-monsoon-800">
                Region / District <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-monsoon-600 font-medium">Internet Search</span>
            </div>

            <div className="relative">
              <input
                id="place-region-select"
                type="text"
                required
                value={regionQuery}
                onFocus={() => setShowRegionResults(true)}
                onChange={(e) => {
                  setRegionQuery(e.target.value);
                  setFormData((prev) => ({
                    ...prev,
                    regionName: e.target.value,
                    regionId: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  }));
                  setShowRegionResults(true);
                }}
                placeholder="Type district or city (e.g. Malappuram, Wayanad)..."
                className="w-full rounded-lg border border-monsoon-200 pl-8 pr-3 py-2 text-sm focus:border-monsoon-600 focus:outline-none bg-white"
              />
              <span className="absolute left-2.5 top-2.5 text-xs text-monsoon-600">📍</span>
              {searchingRegion && (
                <span className="absolute right-2.5 top-2.5 text-xs animate-spin">⏳</span>
              )}
            </div>

            {/* Region Search Results Popover */}
            {showRegionResults && (
              <div className="absolute left-0 top-full z-30 mt-1 w-full rounded-xl border border-monsoon-200 bg-white shadow-xl max-h-56 overflow-y-auto divide-y divide-monsoon-50">
                {regionResults.length > 0 ? (
                  regionResults.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => handleSelectRegion(loc)}
                      className="w-full px-3 py-2 text-left hover:bg-monsoon-50 transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-monsoon-900 truncate">
                          {loc.name}
                        </div>
                        <div className="text-[10px] text-monsoon-800/60 truncate">
                          {loc.state}, {loc.country}
                        </div>
                      </div>
                      <span className="text-[10px] bg-monsoon-100 text-monsoon-800 px-1.5 py-0.5 rounded shrink-0">
                        Select
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-2 text-xs text-monsoon-800/70">
                    <p className="font-semibold text-monsoon-900 mb-1">Quick Select Region:</p>
                    <div className="flex flex-wrap gap-1">
                      {REGIONS.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => handleSelectRegion(r)}
                          className="px-2 py-1 rounded bg-monsoon-50 border border-monsoon-200 text-[11px] font-medium text-monsoon-800 hover:bg-monsoon-100"
                        >
                          {r.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {errors.regionId && <p className="mt-1 text-xs text-rose-600">{errors.regionId}</p>}
          </div>
        </div>

        {/* Town / Locality with Live Internet Search */}
        <div ref={townRef} className="relative">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="place-town-input" className="block text-xs font-semibold text-monsoon-800">
              Town / Locality <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleDetectTownGps}
              disabled={detectingGps}
              className="text-[11px] font-semibold text-monsoon-700 hover:text-monsoon-900 flex items-center gap-1"
            >
              <span>{detectingGps ? "⏳" : "🎯"}</span>
              <span>{detectingGps ? "Detecting…" : "Auto-detect via GPS"}</span>
            </button>
          </div>

          <div className="relative">
            <input
              id="place-town-input"
              type="text"
              required
              value={formData.townId}
              onFocus={() => setShowTownResults(true)}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({ ...formData, townId: val });
                setTownQuery(val);
                setShowTownResults(true);
              }}
              placeholder="Search town, junction, or village (e.g. Kottakkal, Nilambur, Tirur)..."
              className="w-full rounded-lg border border-monsoon-200 pl-8 pr-3 py-2 text-sm focus:border-monsoon-600 focus:outline-none"
            />
            <span className="absolute left-2.5 top-2.5 text-xs text-monsoon-600">🏘️</span>
            {searchingTown && (
              <span className="absolute right-2.5 top-2.5 text-xs animate-spin">⏳</span>
            )}
          </div>

          {/* Town Search Results Dropdown from OpenStreetMap */}
          {showTownResults && townResults.length > 0 && (
            <div className="absolute left-0 top-full z-30 mt-1 w-full rounded-xl border border-monsoon-200 bg-white shadow-xl max-h-56 overflow-y-auto divide-y divide-monsoon-50">
              <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-monsoon-800/60 uppercase tracking-wider">
                Locations from Map ({townResults.length})
              </p>
              {townResults.map((loc) => (
                <button
                  key={loc.id + loc.label}
                  type="button"
                  onClick={() => handleSelectTown(loc)}
                  className="w-full px-3 py-2 text-left hover:bg-monsoon-50 transition-colors flex items-center justify-between gap-2 group"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-monsoon-900 group-hover:text-monsoon-700 truncate">
                      {loc.name}
                    </div>
                    <div className="text-[10px] text-monsoon-800/60 truncate">
                      {loc.label}
                    </div>
                  </div>
                  {loc.coordinates?.lat && (
                    <span className="text-[10px] font-mono text-monsoon-800/40 bg-monsoon-100/50 px-1 py-0.5 rounded shrink-0">
                      📍 {loc.coordinates.lat.toFixed(2)}, {loc.coordinates.lng.toFixed(2)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
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
            placeholder="Describe what makes this spot special, best time to visit, signature food or view..."
            className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-sm focus:border-monsoon-600 focus:outline-none resize-none"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-rose-600">{errors.description}</p>
          )}
        </div>

        {/* Address / Landmark */}
        <div>
          <label htmlFor="place-address-input" className="block text-xs font-semibold text-monsoon-800 mb-1">
            Address / Landmark / Directions (Optional)
          </label>
          <input
            id="place-address-input"
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g. Near KSRTC Stand, opposite Juma Masjid, Hilltop road"
            className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-sm focus:border-monsoon-600 focus:outline-none"
          />
        </div>

        {/* Accurate Google Maps Location */}
        <div className="rounded-xl border border-monsoon-200 bg-monsoon-50/50 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="place-gmaps-input" className="text-xs font-bold text-monsoon-900 flex items-center gap-1.5">
              <span>🗺️ Google Maps Location</span>
              <span className="text-[10px] font-normal text-monsoon-600">(URL / Link or Coordinates)</span>
            </label>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                formData.name
                  ? `${formData.name}, ${formData.townId || formData.regionName}`
                  : formData.townId || formData.regionName || "Malappuram Kerala"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-semibold text-monsoon-700 hover:text-monsoon-900 flex items-center gap-1 underline"
              title="Open Google Maps in a new tab to find this place"
            >
              <span>📍 Pinpoint on GMaps ↗</span>
            </a>
          </div>

          <div className="relative">
            <input
              id="place-gmaps-input"
              type="text"
              value={formData.gmapsUrl}
              onChange={(e) => {
                const val = e.target.value;
                const parsed = locationSearchService.parseGoogleMapsCoordinates(val);
                setFormData((prev) => ({
                  ...prev,
                  gmapsUrl: val,
                  coordinates: parsed || prev.coordinates,
                }));
              }}
              placeholder="Paste Google Maps link (e.g. https://maps.app.goo.gl/... or 11.052, 76.074)..."
              className="w-full rounded-lg border border-monsoon-200 pl-8 pr-3 py-2 text-xs focus:border-monsoon-600 focus:outline-none bg-white font-mono"
            />
            <span className="absolute left-2.5 top-2 text-xs">🔗</span>
          </div>

          {/* Coordinate Preview & Status */}
          {formData.coordinates?.lat ? (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                <span>✓ GPS Location Acquired:</span>
                <span className="font-mono">
                  {formData.coordinates.lat.toFixed(5)}° N, {formData.coordinates.lng.toFixed(5)}° E
                </span>
              </span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${formData.coordinates.lat},${formData.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-monsoon-600 hover:underline"
              >
                Verify Pinpoint on Map ↗
              </a>
            </div>
          ) : (
            <p className="text-[11px] text-monsoon-800/60 leading-tight">
              Tip: Paste any Google Maps share link, or coordinates from Google Maps (right-click on map &rarr; copy coordinates).
            </p>
          )}
        </div>

        {/* Road Condition & Image */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="place-road-select" className="block text-xs font-semibold text-monsoon-800 mb-1">
              Road Condition & Access
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
              Cover Image (Optional)
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
          {submitting ? "Submitting Proposal…" : "Submit Proposal"}
        </Button>
      </form>
    </div>
  );
}
