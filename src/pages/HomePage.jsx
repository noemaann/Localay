import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchInput from "../components/SearchInput.jsx";
import CategoryGrid from "../components/CategoryGrid.jsx";
import Badge from "../components/Badge.jsx";
import { useLocation } from "../context/LocationContext.jsx";

/**
 * HeroSection — the above-the-fold discovery prompt.
 * Uses the active region from context for the location-aware tagline.
 *
 * @param {{
 *   searchValue: string,
 *   onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
 *   onSearchClear: () => void,
 *   onSearchSubmit: (e: React.FormEvent) => void,
 *   onSuggestion: (term: string) => void,
 * }} props
 */
function HeroSection({ searchValue, onSearchChange, onSearchClear, onSearchSubmit, onSuggestion }) {
  const { region } = useLocation();

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative bg-white border-b border-monsoon-200/60"
    >
      <div className="mx-auto max-w-5xl px-4 pt-16 pb-16 sm:px-6 sm:pt-24 sm:pb-24">
        {/* Subtle regional label */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-monsoon-200 bg-monsoon-100/50 px-3 py-1 shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-monsoon-800">
            Now in {region.label}
          </span>
        </div>

        {/* Heading */}
        <h1
          id="hero-heading"
          className="font-display text-4xl font-extrabold leading-[1.12] tracking-tight text-monsoon-900 sm:text-6xl lg:text-7xl max-w-3xl"
        >
          Find the places locals actually love.
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-monsoon-800/80 sm:text-lg font-normal">
          LOCALAY is a community guide to local food spots, hidden places, nature
          destinations, and everyday experiences — with honest reviews and
          practical access information from people who live there.
        </p>

        {/* Search */}
        <form
          role="search"
          aria-label="Search places"
          onSubmit={onSearchSubmit}
          className="mt-8 max-w-xl"
        >
          <SearchInput
            label="Search places in your area"
            placeholder={`Search in ${region.name}…`}
            value={searchValue}
            onChange={onSearchChange}
            onClear={onSearchClear}
            id="hero-search"
          />
          <button type="submit" className="sr-only">Search</button>
        </form>

        {/* Quick suggestion pills */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-monsoon-800/60 mr-1 select-none">
            Popular:
          </span>
          {["Biriyani", "Waterfalls", "Sunset viewpoints", "Local treks"].map(
            (term) => (
              <button
                key={term}
                type="button"
                aria-label={`Search for ${term}`}
                onClick={() => onSuggestion(term)}
                className={[
                  "rounded-xl border border-monsoon-200/90 bg-white px-3 py-1.5",
                  "text-xs font-semibold text-monsoon-800 shadow-2xs",
                  "hover:border-monsoon-900 hover:text-monsoon-900 hover:bg-monsoon-50",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-monsoon-600",
                  "transition-all duration-150 active:scale-95",
                ].join(" ")}
              >
                {term}
              </button>
            )
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * CategorySection — the discovery category grid below the hero.
 */
function CategorySection() {
  const { region } = useLocation();

  return (
    <section
      aria-labelledby="categories-heading"
      className="mx-auto max-w-5xl px-4 pb-20 sm:px-6"
    >
      <div className="mb-6 flex items-end justify-between border-b border-monsoon-200/60 pb-4">
        <div>
          <h2
            id="categories-heading"
            className="font-display text-2xl font-bold tracking-tight text-monsoon-900 sm:text-3xl"
          >
            Explore {region.name}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-monsoon-800/70">
            Pick a category to start discovering
          </p>
        </div>
      </div>
      <CategoryGrid />
    </section>
  );
}

/**
 * CommunityBanner — a community-oriented call-to-action strip leading to contributions.
 */
function CommunityBanner() {
  return (
    <section
      aria-label="Community contribution"
      className="mx-auto max-w-5xl px-4 py-8 sm:px-6"
    >
      <div className="rounded-3xl border border-monsoon-200/80 bg-gradient-to-r from-monsoon-100/70 via-white to-monsoon-50 p-6 sm:p-8 shadow-xs flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-monsoon-200/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-monsoon-800 mb-2">
            Community-Powered
          </div>
          <h2 className="text-xl font-bold tracking-tight text-monsoon-900">
            Know a hidden gem?
          </h2>
          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-monsoon-800/80 max-w-lg">
            LOCALAY is built by the community. Add places, share reviews, report dish prices, and
            help others discover what makes your town special.
          </p>
        </div>
        <div className="shrink-0">
          <Link
            to="/contribute"
            className="inline-flex items-center gap-2 rounded-xl bg-monsoon-900 px-5 py-2.5 text-xs font-semibold tracking-wide text-white hover:bg-monsoon-800 transition-all shadow-xs active:scale-[0.98]"
          >
            <span>Add a place & review</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * HomePage — the root route screen.
 *
 * Composes the hero, community banner, and category grid.
 * Search submits navigate to /discover with the query in the URL.
 */
export default function HomePage() {
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate("/discover");
    }
  }

  function handleSuggestion(term) {
    navigate(`/discover?q=${encodeURIComponent(term)}`);
  }

  return (
    <>
      <HeroSection
        searchValue={searchValue}
        onSearchChange={(e) => setSearchValue(e.target.value)}
        onSearchClear={() => setSearchValue("")}
        onSearchSubmit={handleSearchSubmit}
        onSuggestion={handleSuggestion}
      />
      <CommunityBanner />
      <div className="py-12">
        <CategorySection />
      </div>
    </>
  );
}
