import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { usePlaces } from "../features/discovery/usePlaces.js";
import PlaceCard from "../features/discovery/PlaceCard.jsx";
import CategoryFilter from "../features/discovery/CategoryFilter.jsx";
import SearchInput from "../components/SearchInput.jsx";
import LoadingState from "../components/LoadingState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useLocation } from "../context/LocationContext.jsx";
import { CATEGORIES } from "../data/categories.js";
import ItineraryPlanner from "../features/discovery/ItineraryPlanner.jsx";

/**
 * DiscoverPage — the main discovery screen.
 *
 * URL search params are used as the source of truth for filters so that
 * searches are shareable and the back button works correctly:
 *   ?q=biriyani&category=food
 *
 * The page composes CategoryFilter + SearchInput + PlaceCard grid, with
 * loading, empty, and error states.
 */
export default function DiscoverPage() {
  const { region } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read filters from URL
  const queryParam = searchParams.get("q") ?? "";
  const categoryParam = searchParams.get("category") ?? "";

  // Local input state (not committed to URL until user pauses or submits)
  const [inputValue, setInputValue] = useState(queryParam);
  const [showPlanner, setShowPlanner] = useState(false);

  // Sync input if URL changes externally (e.g. back/forward navigation)
  useEffect(() => {
    setInputValue(queryParam);
  }, [queryParam]);

  const updateParams = useCallback(
    (updates) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, val] of Object.entries(updates)) {
          if (val) {
            next.set(key, val);
          } else {
            next.delete(key);
          }
        }
        return next;
      });
    },
    [setSearchParams]
  );

  // Commit the search query to URL when user submits the form
  function handleSearchSubmit(e) {
    e.preventDefault();
    updateParams({ q: inputValue });
  }

  function handleCategoryChange(id) {
    updateParams({ category: id });
  }

  function handleClear() {
    setInputValue("");
    updateParams({ q: "" });
  }

  const { places, loading, error } = usePlaces({
    query: queryParam,
    categoryId: categoryParam,
    regionId: region.id,
  });

  const { places: allPlaces, loading: allLoading } = usePlaces({
    query: queryParam,
    categoryId: categoryParam,
    regionId: "",
  });

  const hasActiveFilters = !!queryParam || !!categoryParam;
  const activeCategory = CATEGORIES.find((c) => c.id === categoryParam);

  const isShowingAllRegionsFallback =
    !hasActiveFilters && places.length === 0 && allPlaces.length > 0;
  const displayPlaces = isShowingAllRegionsFallback ? allPlaces : places;

  // Compute per-category result counts for the filter badges
  const resultCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = displayPlaces.filter((p) => p.categoryId === cat.id).length;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Page header */}
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold text-monsoon-900 sm:text-4xl">
          Discover{" "}
          <span className="text-monsoon-600">{region.name}</span>
        </h1>
        <p className="mt-2 text-sm text-monsoon-800/70">
          {activeCategory
            ? `Showing ${activeCategory.label} in ${region.name}`
            : `Explore all local places in ${region.label}`}
        </p>
      </header>

      {/* Itinerary Planner Trigger Banner */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-monsoon-900 via-monsoon-800 to-monsoon-900 p-4 sm:p-5 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-monsoon-700">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              Plan Your Day: Custom Trip Itinerary
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-turmeric-400 text-turmeric-950 font-bold text-[10px] uppercase tracking-wider">
              Smart Route
            </span>
          </div>
          <p className="mt-1 text-xs text-white/80 max-w-xl">
            Select your preferred spot types, budget, and time. We calculate accurate GPS travel times and build a sequenced route with Google Maps navigation!
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowPlanner((prev) => !prev)}
          className="px-4 py-2.5 rounded-xl bg-turmeric-400 hover:bg-turmeric-300 text-monsoon-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          <span>{showPlanner ? "✕ Hide Trip Planner" : "🧭 Open Trip Planner"}</span>
        </button>
      </div>

      {/* Collapsible Itinerary Planner */}
      {showPlanner && (
        <div className="mb-8">
          <ItineraryPlanner
            places={displayPlaces}
            regionName={region.name}
            onClose={() => setShowPlanner(false)}
          />
        </div>
      )}

      {/* Search form */}
      <form
        role="search"
        aria-label="Search places"
        onSubmit={handleSearchSubmit}
        className="mb-5"
      >
        <SearchInput
          id="discover-search"
          label="Search places"
          placeholder={`Search places in ${region.name}…`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onClear={handleClear}
        />
        {/* Hidden submit lets Enter key trigger the search */}
        <button type="submit" className="sr-only">
          Search
        </button>
      </form>

      {/* Category filter */}
      <div className="mb-6">
        <CategoryFilter
          selected={categoryParam}
          onChange={handleCategoryChange}
          resultCounts={resultCounts}
        />
      </div>

      {/* Demo data notice */}
      <div className="mb-6 rounded-xl bg-turmeric-100 px-4 py-3 text-xs text-turmeric-600 font-medium flex items-start gap-2">
        <span aria-hidden="true" className="shrink-0 mt-0.5">⚠️</span>
        <span>
          All places shown are <strong>illustrative demo content only</strong> — not
          verified, not sourced from community reviews, and not guaranteed to be
          accurate. Community submissions will replace this data in a future release.
        </span>
      </div>

      {isShowingAllRegionsFallback && (
        <div className="mb-6 rounded-xl bg-purple-50 border border-purple-200 px-4 py-3 text-xs text-purple-900 font-medium flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="shrink-0 text-base">📍</span>
            <span>
              No approved spots registered in <strong>{region.name}</strong> yet. Showing verified and available spots across all regions!
            </span>
          </div>
        </div>
      )}

      {/* Results */}
      {error ? (
        <ErrorState message={error} />
      ) : loading && allLoading ? (
        <LoadingState message="Finding places…" />
      ) : displayPlaces.length === 0 ? (
        <EmptyState
          icon={hasActiveFilters ? "🔍" : "🗺️"}
          title={hasActiveFilters ? "No places match your search" : "No places yet"}
          description={
            hasActiveFilters
              ? "Try clearing the filters or searching with different terms."
              : "Be the first to add a place in this region when submissions open."
          }
          action={
            hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  setInputValue("");
                  setSearchParams({});
                }}
                className="rounded-lg border-2 border-monsoon-600 px-4 py-2 text-sm font-semibold text-monsoon-600 hover:bg-monsoon-50 transition-colors"
              >
                Clear all filters
              </button>
            ) : null
          }
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-monsoon-800/60">
            {displayPlaces.length} place{displayPlaces.length !== 1 ? "s" : ""} found
          </p>
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            aria-label={`${displayPlaces.length} place results`}
          >
            {displayPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** Inline error display used when the service rejects. */
function ErrorState({ message }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-2xl bg-red-50 px-6 py-12 text-center"
    >
      <span aria-hidden="true" className="text-4xl">⚡</span>
      <h2 className="text-base font-semibold text-red-900">Something went wrong</h2>
      <p className="text-sm text-red-800/80 max-w-sm">{message}</p>
    </div>
  );
}
