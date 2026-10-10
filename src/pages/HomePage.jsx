import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      className="relative overflow-hidden"
    >
      {/* Decorative gradient backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-br from-monsoon-600/8 via-transparent to-turmeric-400/10"
      />
      <div
        aria-hidden="true"
        className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-turmeric-400/10 blur-3xl -z-10"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-monsoon-600/8 blur-3xl -z-10"
      />

      <div className="mx-auto max-w-5xl px-4 pt-14 pb-16 sm:px-6 sm:pt-20 sm:pb-24">
        {/* Launch badge */}
        <div className="mb-6">
          <Badge variant="accent" className="text-xs">
            🌿 Now in {region.label}
          </Badge>
        </div>

        {/* Heading */}
        <h1
          id="hero-heading"
          className="font-display text-4xl font-bold leading-tight tracking-tight text-monsoon-900 sm:text-5xl lg:text-6xl max-w-2xl"
        >
          Find the places{" "}
          <span className="text-monsoon-600">locals actually love.</span>
        </h1>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-monsoon-800 sm:text-lg">
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
        <div className="mt-4 flex flex-wrap gap-2">
          <p className="w-full text-xs text-monsoon-800/60 mb-0.5">
            Popular searches
          </p>
          {["Biriyani", "Waterfalls", "Sunset viewpoints", "Local treks"].map(
            (term) => (
              <button
                key={term}
                type="button"
                aria-label={`Search for ${term}`}
                onClick={() => onSuggestion(term)}
                className={[
                  "rounded-full border border-monsoon-100 bg-white px-3 py-1",
                  "text-xs font-medium text-monsoon-800",
                  "hover:border-monsoon-600 hover:text-monsoon-600",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-monsoon-600",
                  "transition-all duration-150 shadow-sm",
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
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2
            id="categories-heading"
            className="text-xl font-bold text-monsoon-900 sm:text-2xl"
          >
            Explore {region.name}
          </h2>
          <p className="mt-1 text-sm text-monsoon-800/70">
            Pick a category to start discovering
          </p>
        </div>
      </div>
      <CategoryGrid />
    </section>
  );
}

/**
 * CommunityBanner — a simple community-oriented call-to-action strip.
 * Placeholder content only — no real data or links yet.
 */
function CommunityBanner() {
  return (
    <section
      aria-label="Community contribution"
      className="border-y border-monsoon-100 bg-white"
    >
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-monsoon-900">
              Know a hidden gem?
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-monsoon-800/80 max-w-md">
              LOCALAY is built by the community. Add places, share reviews, and
              help others discover what makes your town special.
            </p>
          </div>
          <div className="shrink-0">
            {/* This will link to the submit-place page in a later step */}
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Place submission opens in a later release"
              className={[
                "rounded-xl bg-monsoon-600 px-5 py-2.5 text-sm font-semibold text-white",
                "opacity-60 cursor-not-allowed select-none",
              ].join(" ")}
            >
              Add a place <span className="ml-1 text-xs font-normal opacity-80">(coming soon)</span>
            </button>
          </div>
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
