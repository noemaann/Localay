import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  placeService,
  reviewService,
  dishPriceService,
  placeUpdateService,
} from "../services";
import MapPlaceholder from "../features/discovery/MapPlaceholder.jsx";
import Badge from "../components/Badge.jsx";
import LoadingState from "../components/LoadingState.jsx";
import SubmissionStatusBadge from "../components/SubmissionStatusBadge.jsx";
import { CATEGORIES } from "../data/categories.js";
import { difficultyClass, formatDifficulty, difficultyIcon } from "../utils/format.js";
import AddReviewForm from "../features/contributions/AddReviewForm.jsx";
import AddDishPriceForm from "../features/contributions/AddDishPriceForm.jsx";
import AccessUpdateForm from "../features/contributions/AccessUpdateForm.jsx";
import CorrectionRequestForm from "../features/contributions/CorrectionRequestForm.jsx";

/**
 * PlaceDetailPage — full detail view for a single place.
 *
 * Supports both discovery features (access details, tags, map stub)
 * and community-contributed features (reviews, dish prices, road updates).
 */
export default function PlaceDetailPage() {
  const { placeId } = useParams();
  const navigate = useNavigate();

  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [dishPrices, setDishPrices] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [activeActionTab, setActiveActionTab] = useState("review");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPlaceData() {
      if (!placeId) return;
      setLoading(true);
      setError(null);
      try {
        const placeData = await placeService.getPlaceById(placeId);
        if (cancelled) return;

        if (!placeData) {
          setError("not_found");
          return;
        }

        setPlace(placeData);

        // Fetch auxiliary community data in parallel safely
        const [revList, priceList, updList] = await Promise.all([
          reviewService.getReviewsForPlace(placeId).catch(() => []),
          dishPriceService.getDishPricesForPlace(placeId).catch(() => []),
          placeUpdateService.getPlaceUpdates(placeId).catch(() => []),
        ]);

        if (!cancelled) {
          setReviews(revList || []);
          setDishPrices(priceList || []);
          setUpdates(updList || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(`Error loading details for place ${placeId}:`, err);
          setError(err?.message ?? "Failed to load this place.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPlaceData();
    return () => {
      cancelled = true;
    };
  }, [placeId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <LoadingState message="Loading place details…" />
      </div>
    );
  }

  if (error === "not_found" || !place) {
    return <NotFoundState />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div role="alert" className="rounded-2xl bg-red-50 p-8 text-center border border-red-200">
          <svg aria-hidden="true" className="w-8 h-8 text-red-600 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h1 className="text-lg font-semibold text-red-900">Something went wrong</h1>
          <p className="mt-2 text-sm text-red-800/80">{error}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const category = CATEGORIES.find(
    (c) => c.id === (place.categoryId || place.category)
  );

  return (
    <article
      aria-labelledby="place-name"
      className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 space-y-8"
    >
      {/* Back link */}
      <nav aria-label="Breadcrumb">
        <Link
          to="/discover"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-monsoon-800 hover:text-monsoon-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-monsoon-600 rounded"
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Discover
        </Link>
      </nav>

      {/* Demo data banner */}
      {place._demo && (
        <div className="rounded-2xl border border-turmeric-200 bg-turmeric-100/60 px-4 py-3 text-xs text-turmeric-600 font-medium flex items-start gap-2.5">
          <svg aria-hidden="true" className="w-4 h-4 shrink-0 text-turmeric-600 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>
            This is <strong>illustrative demo content only</strong>. Details including
            directions, prices, and access information are not verified and must not be
            relied upon for planning.
          </span>
        </div>
      )}

      {/* Hero Header */}
      <header className="relative rounded-3xl overflow-hidden bg-monsoon-900 text-white p-7 sm:p-12 shadow-md">
        {place.coverImage && (
          <img
            src={place.coverImage}
            alt={place.name}
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
        )}
        <div className="relative z-10 max-w-2xl space-y-3.5">
          <div className="flex flex-wrap items-center gap-2">
            {category && (
              <Badge className={category.accent}>
                <span aria-hidden="true">{category.icon}</span>
                {category.label}
              </Badge>
            )}
            {place.status && <SubmissionStatusBadge status={place.status} />}
            {place._demo && (
              <span className="rounded-full border border-white/20 px-2.5 py-0.5 text-xs font-semibold text-white/80 select-none">
                Demo data
              </span>
            )}
          </div>

          <h1
            id="place-name"
            className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight"
          >
            {place.name}
          </h1>
          {place.tagline && (
            <p className="mt-2 text-base sm:text-lg text-monsoon-100/90 leading-relaxed">
              {place.tagline}
            </p>
          )}
          <p className="text-sm text-monsoon-200/90 leading-relaxed pt-1">
            {place.description}
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-medium text-monsoon-200/80 pt-3 border-t border-white/15">
            {place.location?.town && <span>Town: {place.location.town}</span>}
            {place.address && <span>Address: {place.address}</span>}
          </div>
        </div>
      </header>

      {/* Two-column info grid for Location & Access */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Location */}
        <InfoSection
          title="Location"
          items={[
            { label: "Town / Locality", value: place.location?.town || place.townId },
            { label: "Near / Landmark", value: place.location?.landmark },
            { label: "Directions", value: place.location?.directions },
            { label: "Address", value: place.address },
          ]}
        />

        {/* Access */}
        <InfoSection
          title="Access"
          items={[
            {
              label: "Difficulty",
              value: place.access?.difficulty
                ? formatDifficulty(place.access.difficulty)
                : null,
              valueClass: place.access?.difficulty
                ? `inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${difficultyClass(place.access.difficulty)}`
                : undefined,
            },
            { label: "Road", value: place.access?.road },
            { label: "Transport", value: place.access?.transport },
            {
              label: "Entry fee",
              value: place.access?.entryFee ?? "None / unknown",
            },
            { label: "Best time", value: place.access?.bestTime },
          ]}
        />
      </div>

      {/* Map placeholder */}
      <section aria-labelledby="map-heading">
        <h2
          id="map-heading"
          className="mb-3 text-xs font-semibold uppercase tracking-wider text-monsoon-800/50"
        >
          Location on map
        </h2>
        <MapPlaceholder
          coordinates={place.coordinates || (place.location?.latitude ? { lat: place.location.latitude, lng: place.location.longitude, accuracy: "approximate" } : null)}
          placeName={place.name}
        />
      </section>

      {/* Tags */}
      {place.tags?.length > 0 && (
        <section aria-label="Tags">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-monsoon-800/50">
            Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {place.tags.map((tag) => (
              <Link
                key={tag}
                to={`/discover?q=${encodeURIComponent(tag)}`}
                className="rounded-full border border-monsoon-100 bg-white px-3 py-1 text-xs font-medium text-monsoon-800 hover:border-monsoon-600 hover:text-monsoon-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-monsoon-600"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Main Content Grid for Community Contributions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 border-t border-monsoon-100">
        {/* Left 2 Cols: Road updates, Dish prices, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Access & Road Conditions */}
          <div className="rounded-2xl border border-monsoon-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-monsoon-900 mb-3 flex items-center gap-2">
              <span>Road Access & Terrain</span>
            </h2>
            {updates.length === 0 ? (
              <p className="text-xs text-monsoon-800/70">
                Paved road access. Help the community by reporting steep inclines or parking details below.
              </p>
            ) : (
              <div className="space-y-3">
                {updates.map((upd) => (
                  <div
                    key={upd.id}
                    className="rounded-xl bg-monsoon-50 p-3 text-xs border border-monsoon-100 space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-monsoon-900">
                        {upd.proposedChanges?.roadCondition || "Road Update"}
                      </span>
                      <SubmissionStatusBadge status={upd.status} />
                    </div>
                    {upd.proposedChanges?.parkingInfo && (
                      <p className="text-monsoon-800">
                        <strong>Parking:</strong> {upd.proposedChanges.parkingInfo}
                      </p>
                    )}
                    {upd.proposedChanges?.accessNotes && (
                      <p className="text-monsoon-800/80">
                        "{upd.proposedChanges.accessNotes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dish & Snack Prices */}
          <div className="rounded-2xl border border-monsoon-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-monsoon-900 mb-3 flex items-center gap-2">
              <span>Crowd-Sourced Food & Dish Prices</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-monsoon-100 text-monsoon-800">
                {dishPrices.length}
              </span>
            </h2>
            {dishPrices.length === 0 ? (
              <p className="text-xs text-monsoon-800/70">
                No dish prices reported yet for this spot.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dishPrices.map((dp) => (
                  <div
                    key={dp.id}
                    className="rounded-xl border border-monsoon-100 bg-monsoon-50/50 p-3 flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-monsoon-900">{dp.dishName}</h4>
                      <span className="text-xs text-monsoon-800/70 capitalize">{dp.category || "Snack"}</span>
                    </div>
                    <span className="font-display font-extrabold text-monsoon-700 text-base">
                      ₹{dp.price}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Community Reviews */}
          <div className="rounded-2xl border border-monsoon-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-monsoon-900 mb-4 flex items-center gap-2">
              <span>Reviews & Community Experiences</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-monsoon-100 text-monsoon-800">
                {reviews.length}
              </span>
            </h2>

            {reviews.length === 0 ? (
              <p className="text-xs text-monsoon-800/70">
                Be the first local to leave a review for {place.name}!
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="border-b border-monsoon-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5 text-amber-500" aria-label={`${rev.rating} out of 5 stars`}>
                            {Array.from({ length: 5 }, (_, i) => (
                              <svg
                                key={i}
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill={i < rev.rating ? "currentColor" : "none"}
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={i < rev.rating ? "text-amber-500" : "text-monsoon-200"}
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            ))}
                          </div>
                          <span className="font-bold text-monsoon-900 text-sm">
                            {rev.title || "Local Review"}
                          </span>
                        </div>
                        <span className="text-xs text-monsoon-800/60 block mt-0.5">
                          by {rev.authorName || "Community Member"}
                        </span>
                      </div>
                      <SubmissionStatusBadge status={rev.status} />
                    </div>
                    <p className="mt-2 text-xs text-monsoon-800 leading-relaxed">
                      {rev.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Contribution Actions */}
        <div className="space-y-4">
          <div className="flex rounded-xl bg-monsoon-100 p-1 text-xs font-semibold gap-1">
            {[
              { id: "review", label: "Review" },
              { id: "dish", label: "Dish Price" },
              { id: "access", label: "Road Access" },
              { id: "correct", label: "Correction" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveActionTab(tab.id)}
                className={[
                  "flex-1 rounded-lg py-2 text-center transition-[background-color,color,transform] duration-150 select-none active:scale-[0.97]",
                  activeActionTab === tab.id
                    ? "bg-white text-monsoon-900 shadow-2xs font-bold"
                    : "text-monsoon-800 hover:text-monsoon-900 hover:bg-white/50",
                ].join(" ")}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div>
            {activeActionTab === "review" && (
              <AddReviewForm
                placeId={place.id}
                placeName={place.name}
                onReviewAdded={(newRev) => setReviews((prev) => [newRev, ...prev])}
              />
            )}
            {activeActionTab === "dish" && (
              <AddDishPriceForm
                placeId={place.id}
                placeName={place.name}
                onPriceAdded={(newPrice) => setDishPrices((prev) => [newPrice, ...prev])}
              />
            )}
            {activeActionTab === "access" && (
              <AccessUpdateForm
                placeId={place.id}
                placeName={place.name}
                onSubmitted={(newUpd) => setUpdates((prev) => [newUpd, ...prev])}
              />
            )}
            {activeActionTab === "correct" && (
              <CorrectionRequestForm
                placeId={place.id}
                placeName={place.name}
                onSubmitted={(newUpd) => setUpdates((prev) => [newUpd, ...prev])}
              />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/** Reusable key-value info section for a card-style block. */
function InfoSection({ icon, title, items }) {
  const validItems = items.filter((i) => i.value != null && i.value !== "");
  if (validItems.length === 0) return null;

  return (
    <div className="h-full rounded-2xl bg-white p-5 border border-monsoon-200/80 shadow-xs flex flex-col justify-between">
      <div>
        <h2 className="mb-4 text-sm font-bold text-monsoon-900 border-b border-monsoon-100 pb-2">
          {title}
        </h2>
        <dl className="flex flex-col gap-3">
          {validItems.map((item) => (
            <div key={item.label}>
              <dt className="text-[10px] font-mono font-semibold uppercase tracking-wider text-monsoon-800/60">
                {item.label}
              </dt>
              <dd className={`mt-0.5 text-sm font-medium text-monsoon-900 ${item.valueClass ?? ""}`}>
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/** 404 state for an unknown place id. */
function NotFoundState() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 text-center">
      <h1 className="text-2xl font-bold text-monsoon-900">Place not found</h1>
      <p className="mt-3 text-sm text-monsoon-800/70 max-w-sm mx-auto">
        The requested place could not be found or has not been published yet.
      </p>
      <Link
        to="/discover"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-monsoon-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-monsoon-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-monsoon-600"
      >
        Back to Discover
      </Link>
    </div>
  );
}
