import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchInput from "../components/SearchInput.jsx";
import CategoryGrid from "../components/CategoryGrid.jsx";
import CategoryIcon from "../components/CategoryIcon.jsx";
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
/**
 * HeroSection — the above-the-fold discovery prompt.
 * Uses the active region from context for the location-aware tagline.
 * Features a show-don't-tell interactive showcase bento of real local spots.
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

  const showcaseGems = [
    {
      name: "Mini Ooty (Arimbra Hills)",
      categoryId: "viewpoints",
      category: "Viewpoints",
      rating: "4.8",
      highlight: "Misty tea slopes & sunrise clouds",
      link: "/discover?category=viewpoints",
      tag: "Free Access",
    },
    {
      name: "Rahmath Biriyani & Sulaimani",
      categoryId: "food",
      category: "Food & Eats",
      rating: "4.9",
      highlight: "Small-grain Kaima dum & black tea",
      link: "/discover?category=food",
      tag: "Iconic Spot",
    },
    {
      name: "Riverbank Grove & Bamboo",
      categoryId: "nature",
      category: "Nature",
      rating: "4.7",
      highlight: "Sunset river breeze & peaceful trails",
      link: "/discover?category=nature",
      tag: "Peaceful",
    },
  ];

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-gradient-to-b from-white via-monsoon-50/40 to-monsoon-50/80 border-b border-monsoon-200/60 pt-12 pb-16 sm:pt-20 sm:pb-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Heading, Subhead, Search & Quick Pills */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Region badge (clean, non-blinking) */}
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-monsoon-200 bg-white/90 px-3 py-1 shadow-2xs">
              <svg className="w-3.5 h-3.5 text-monsoon-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              <span className="text-xs font-medium text-monsoon-800">
                Now in {region.label}
              </span>
            </div>

            {/* Main Heading */}
            <h1
              id="hero-heading"
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-monsoon-900"
            >
              Find the places locals actually love.
            </h1>

            {/* Lede paragraph */}
            <p className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-monsoon-800/80 font-normal">
              LOCALAY is a community guide to authentic food stalls, hidden sunset viewpoints,
              walking trails, and local auto fare rates, mapped by the people who live here, with zero paid placements.
            </p>

            {/* Search Input */}
            <form
              role="search"
              aria-label="Search places"
              onSubmit={onSearchSubmit}
              className="mt-7 w-full max-w-xl"
            >
              <SearchInput
                label="Search places in your area"
                placeholder={`Search spots in ${region.name}… (e.g. Biriyani, Sunset, Chai)`}
                value={searchValue}
                onChange={onSearchChange}
                onClear={onSearchClear}
                id="hero-search"
              />
              <button type="submit" className="sr-only">Search</button>
            </form>

            {/* Popular tags */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-monsoon-800/60 mr-1 select-none">
                Popular:
              </span>
              {["Biriyani", "Waterfalls", "Sunset viewpoints", "Local treks", "Sulaimani"].map(
                (term) => (
                  <button
                    key={term}
                    type="button"
                    aria-label={`Search for ${term}`}
                    onClick={() => onSuggestion(term)}
                    className="rounded-xl border border-monsoon-200/90 bg-white px-3 py-1 text-xs font-semibold text-monsoon-800 shadow-2xs hover:border-monsoon-900 hover:text-monsoon-900 hover:bg-monsoon-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-monsoon-600 transition-all duration-150 active:scale-95"
                  >
                    {term}
                  </button>
                )
              )}
            </div>

            {/* Micro Trust Indicators */}
            <div className="mt-8 pt-6 border-t border-monsoon-200/70 w-full flex flex-wrap items-center gap-5 sm:gap-8 text-xs font-medium text-monsoon-800/70">
              <div className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>100% Non-Sponsored</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Community Rate Guide</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Community Verified</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Showcase Bento */}
          <div className="lg:col-span-5 flex flex-col gap-3.5">
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-monsoon-800/60">
                Trending in {region.name}
              </span>
              <Link
                to="/discover"
                className="text-xs font-semibold text-monsoon-700 hover:text-monsoon-900 inline-flex items-center gap-1 group"
              >
                <span>View all</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>

            {showcaseGems.map((gem) => (
              <Link
                key={gem.name}
                to={gem.link}
                className="group p-3.5 sm:p-4 rounded-2xl bg-white border border-monsoon-200/80 shadow-xs hover:border-monsoon-700 hover:shadow-card-hover transition-[box-shadow,border-color,transform] duration-200 active:scale-[0.98] flex items-center justify-between gap-3.5"
              >
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl shrink-0 bg-monsoon-100/80 text-monsoon-800 border border-monsoon-200/70 shadow-2xs">
                  <CategoryIcon categoryId={gem.categoryId} className="w-5 h-5 text-monsoon-800" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-monsoon-100/80 text-monsoon-800">
                      {gem.category}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      {gem.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-monsoon-900 group-hover:text-monsoon-700 transition-colors truncate">
                    {gem.name}
                  </h3>
                  <p className="text-xs text-monsoon-800/70 truncate mt-0.5">
                    {gem.highlight}
                  </p>
                </div>

                <div className="flex flex-col items-end shrink-0 gap-1 pl-1">
                  <span className="inline-flex items-center gap-1 text-xs font-bold tabular-nums text-monsoon-900 bg-monsoon-50 px-2 py-1 rounded-lg border border-monsoon-200">
                    <span className="text-amber-500">★</span>
                    <span>{gem.rating}</span>
                  </span>
                  <span className="text-[11px] text-monsoon-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                    Explore →
                  </span>
                </div>
              </Link>
            ))}

            {/* Quick Auto Fare Teaser Box */}
            <div className="mt-1 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white border border-amber-300/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-10 w-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                  ₹
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-monsoon-900 truncate">
                    Need an Auto in {region.name}?
                  </p>
                  <p className="text-[11px] text-monsoon-800/70 truncate">
                    Estimated baseline ₹30 for first 1.5 km • Local fare index
                  </p>
                </div>
              </div>
              <Link
                to="/autofare"
                className="shrink-0 px-3.5 py-1.5 rounded-xl bg-monsoon-900 hover:bg-monsoon-800 text-white text-xs font-semibold transition-[background-color,transform] shadow-xs active:scale-95"
              >
                Estimate Fare
              </Link>
            </div>
          </div>
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
      className="mx-auto max-w-6xl px-4 pb-20 sm:px-6"
    >
      <div className="mb-8 flex items-end justify-between border-b border-monsoon-200/60 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-monsoon-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-monsoon-800 mb-2">
            Categories
          </div>
          <h2
            id="categories-heading"
            className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-monsoon-900"
          >
            Explore {region.name}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-monsoon-800/70">
            Pick a neighborhood category to start discovering authentic recommendations
          </p>
        </div>
        <Link
          to="/discover"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-monsoon-800 hover:text-monsoon-950 transition-colors"
        >
          <span>All categories</span>
          <span>→</span>
        </Link>
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
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6"
    >
      <div className="rounded-3xl border border-monsoon-200/90 bg-gradient-to-r from-monsoon-100/80 via-white to-amber-50/40 p-6 sm:p-10 shadow-xs flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-monsoon-200/70 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-monsoon-900 mb-2.5">
            Community-Powered
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-monsoon-900">
            Know a hidden tea stall or quiet sunset spot?
          </h2>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-monsoon-800/80">
            LOCALAY is built by residents, not sponsored influencers. Add places, share honest reviews,
            report current dish prices, and help your neighbors discover what makes your town special.
          </p>
        </div>
        <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            to="/contribute"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-monsoon-900 px-6 py-3 text-xs font-semibold tracking-wide text-white hover:bg-monsoon-800 transition-all shadow-xs active:scale-[0.98]"
          >
            <span>Add a place & review</span>
            <span>→</span>
          </Link>
          <Link
            to="/autofare"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-monsoon-300 bg-white px-5 py-3 text-xs font-semibold tracking-wide text-monsoon-900 hover:bg-monsoon-50 transition-all shadow-2xs active:scale-[0.98]"
          >
            <span>Report Auto Fare</span>
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
      <div className="py-10">
        <CategorySection />
      </div>
    </>
  );
}
