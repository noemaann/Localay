import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getPlaceById } from "../services/placeService.js";
import MapPlaceholder from "../features/discovery/MapPlaceholder.jsx";
import Badge from "../components/Badge.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { CATEGORIES } from "../data/categories.js";
import { difficultyClass, formatDifficulty, difficultyIcon } from "../utils/format.js";

/**
 * PlaceDetailPage — full detail view for a single place.
 *
 * Route: /place/:placeId
 *
 * Shows:
 *  - Name, category, tagline, description
 *  - Location: town, landmark, directions
 *  - Access: difficulty, road type, transport, entry fee, best time
 *  - Coordinates / map placeholder
 *  - Tags
 *  - Clear demo-data disclaimer
 *  - Back navigation
 */
export default function PlaceDetailPage() {
  const { placeId } = useParams();
  const navigate = useNavigate();

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const result = await getPlaceById(placeId);
        if (!cancelled) {
          if (!result) {
            setError("not_found");
          } else {
            setPlace(result);
          }
        }
      } catch (err) {
        if (!cancelled)
          setError(err?.message ?? "Failed to load this place.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => {
      cancelled = true;
    };
  }, [placeId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <LoadingState message="Loading place details…" />
      </div>
    );
  }

  if (error === "not_found") {
    return <NotFoundState />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div role="alert" className="rounded-2xl bg-red-50 p-8 text-center">
          <p className="text-2xl mb-3" aria-hidden="true">⚡</p>
          <h1 className="text-lg font-semibold text-red-900">Something went wrong</h1>
          <p className="mt-2 text-sm text-red-800/80">{error}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 rounded-lg border-2 border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const category = CATEGORIES.find((c) => c.id === place.categoryId);

  return (
    <article
      aria-labelledby="place-name"
      className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12"
    >
      {/* Back link */}
      <nav aria-label="Breadcrumb" className="mb-6">
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
      <div className="mb-6 rounded-xl bg-turmeric-100 px-4 py-3 text-xs text-turmeric-600 font-medium flex items-start gap-2">
        <span aria-hidden="true" className="shrink-0 mt-0.5">⚠️</span>
        <span>
          This is <strong>illustrative demo content only</strong>. Details including
          directions, prices, and access information are not verified and must not be
          relied upon for planning.
        </span>
      </div>

      {/* Name + Category */}
      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {category && (
            <Badge className={category.accent}>
              <span aria-hidden="true">{category.icon}</span>
              {category.label}
            </Badge>
          )}
          {place._demo && (
            <span className="rounded-full border border-monsoon-100 px-2.5 py-0.5 text-xs font-medium text-monsoon-800/50 select-none">
              Demo data
            </span>
          )}
        </div>

        <h1
          id="place-name"
          className="font-display text-3xl font-bold leading-tight text-monsoon-900 sm:text-4xl"
        >
          {place.name}
        </h1>
        <p className="mt-2 text-lg text-monsoon-800/80 leading-relaxed">
          {place.tagline}
        </p>
      </header>

      {/* Description */}
      <section aria-labelledby="desc-heading" className="mb-8">
        <h2
          id="desc-heading"
          className="mb-2 text-xs font-semibold uppercase tracking-wider text-monsoon-800/50"
        >
          About
        </h2>
        <p className="text-base leading-relaxed text-monsoon-800">{place.description}</p>
      </section>

      {/* Two-column info grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-8">
        {/* Location */}
        <InfoSection
          icon="📍"
          title="Location"
          items={[
            { label: "Town", value: place.location?.town },
            { label: "Near", value: place.location?.landmark },
            { label: "Directions", value: place.location?.directions },
          ]}
        />

        {/* Access */}
        <InfoSection
          icon="🚶"
          title="Access"
          items={[
            {
              label: "Difficulty",
              value: place.access?.difficulty
                ? `${difficultyIcon(place.access.difficulty)} ${formatDifficulty(place.access.difficulty)}`
                : null,
              valueClass: place.access?.difficulty
                ? `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${difficultyClass(place.access.difficulty)}`
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
      <section aria-labelledby="map-heading" className="mb-8">
        <h2
          id="map-heading"
          className="mb-3 text-xs font-semibold uppercase tracking-wider text-monsoon-800/50"
        >
          Location on map
        </h2>
        <MapPlaceholder
          coordinates={place.coordinates}
          placeName={place.name}
        />
      </section>

      {/* Tags */}
      {place.tags?.length > 0 && (
        <section aria-label="Tags" className="mb-8">
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
    </article>
  );
}

/** Reusable key-value info section for a card-style block. */
function InfoSection({ icon, title, items }) {
  const validItems = items.filter((i) => i.value != null && i.value !== "");
  if (validItems.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-monsoon-100">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-monsoon-900">
        <span aria-hidden="true">{icon}</span>
        {title}
      </h2>
      <dl className="flex flex-col gap-3">
        {validItems.map((item) => (
          <div key={item.label}>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-monsoon-800/50">
              {item.label}
            </dt>
            <dd className={`mt-0.5 text-sm text-monsoon-900 ${item.valueClass ?? ""}`}>
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** 404 state for an unknown place id. */
function NotFoundState() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 text-center">
      <p className="text-5xl mb-4" aria-hidden="true">🗺️</p>
      <h1 className="text-2xl font-bold text-monsoon-900">Place not found</h1>
      <p className="mt-3 text-sm text-monsoon-800/70 max-w-sm mx-auto">
        This place doesn't exist or may have been removed.
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
