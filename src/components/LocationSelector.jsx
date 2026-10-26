import { useState, useRef, useEffect } from "react";
import { useLocation } from "../context/LocationContext.jsx";
import { REGIONS } from "../data/regions.js";
import {
  searchLocationsFromInternet,
  reverseGeocodeFromInternet,
} from "../services/locationSearchService.js";
import Badge from "./Badge.jsx";

/**
 * LocationSelector — allows searching any town, city, or district worldwide/across India
 * using OpenStreetMap location data from the internet, plus one-tap GPS geolocation.
 */
export default function LocationSelector() {
  const { region, setRegion, setRegionId } = useLocation();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close on outside click or Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    function onOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onOutside);
    };
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
      setSearchResults([]);
      setSearchError("");
    }
  }, [open]);

  // Debounced search from internet (OpenStreetMap / Photon)
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
      setSearchError("");
      return;
    }

    const abortController = new AbortController();
    setSearching(true);
    setSearchError("");

    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchLocationsFromInternet(
          searchQuery,
          abortController.signal
        );
        setSearchResults(results);
        if (results.length === 0) {
          setSearchError("No locations found matching your search.");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Location search error:", err);
          setSearchError("Could not connect to map search. Please try again.");
        }
      } finally {
        setSearching(false);
      }
    }, 280);

    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [searchQuery]);

  // Geolocation trigger
  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setSearchError("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    setSearchError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const detected = await reverseGeocodeFromInternet(latitude, longitude);
          if (detected) {
            setRegion(detected);
            setOpen(false);
          } else {
            setSearchError("Could not resolve location name from coordinates.");
          }
        } catch (err) {
          console.error("GPS detection error:", err);
          setSearchError("Failed to fetch location details.");
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        console.warn("Geolocation denied or error:", err);
        setSearchError("Location permission was denied or unavailable.");
        setGpsLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  function handleSelectCustomLocation(loc) {
    setRegion(loc);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        id="location-selector-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Current location: ${region.label}. Change location.`}
        onClick={() => setOpen((o) => !o)}
        className={[
          "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 h-8.5",
          "text-xs font-semibold text-monsoon-900",
          "border border-monsoon-200/80 bg-white/70 hover:bg-white hover:border-monsoon-300 shadow-2xs",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-monsoon-600",
          "transition-all duration-150 select-none",
        ].join(" ")}
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
          className="shrink-0 text-monsoon-600"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
        <span className="max-w-[140px] truncate">{region.label}</span>
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Popover Menu with Live Internet Search */}
      {open && (
        <div
          role="listbox"
          aria-label="Select a location"
          className={[
            "absolute right-0 top-full z-50 mt-2 w-80 sm:w-96",
            "rounded-2xl border border-monsoon-200 bg-white shadow-2xl",
            "overflow-hidden animate-in fade-in zoom-in-95 duration-100",
          ].join(" ")}
        >
          {/* Header & Search Bar */}
          <div className="p-3 border-b border-monsoon-100 bg-monsoon-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-monsoon-900">
                Find Location
              </span>
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={gpsLoading}
                className="text-[11px] font-semibold text-monsoon-700 hover:text-monsoon-900 flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-monsoon-200 shadow-2xs hover:bg-monsoon-50 transition-colors disabled:opacity-50"
              >
                <span>{gpsLoading ? "Locating…" : "Current location"}</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any town, city, or district…"
                className="w-full rounded-xl border border-monsoon-200 bg-white pl-9 pr-8 py-2 text-xs font-medium text-monsoon-900 placeholder:text-monsoon-800/50 focus:border-monsoon-600 focus:outline-none shadow-2xs"
              />
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
                className="absolute left-3 top-2.5 text-monsoon-800/40"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-monsoon-400 hover:text-monsoon-800"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Results Area */}
          <div className="max-h-72 overflow-y-auto divide-y divide-monsoon-50">
            {searching && (
              <div className="px-4 py-6 text-center text-xs text-monsoon-800/70 space-y-1">
                <div className="animate-spin inline-block w-4 h-4 border-2 border-monsoon-600 border-t-transparent rounded-full mb-1" />
                <p>Searching locations on map…</p>
              </div>
            )}

            {!searching && searchError && (
              <div className="px-4 py-4 text-center text-xs text-rose-600 bg-rose-50/50">
                {searchError}
              </div>
            )}

            {/* Internet Search Results */}
            {!searching && searchResults.length > 0 && (
              <div>
                <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-monsoon-800/50">
                  Search Results ({searchResults.length})
                </p>
                <ul>
                  {searchResults.map((loc) => {
                    const isSelected = region.id === loc.id;
                    return (
                      <li key={loc.id} role="option" aria-selected={isSelected}>
                        <button
                          type="button"
                          onClick={() => handleSelectCustomLocation(loc)}
                          className={[
                            "w-full px-3 py-2 text-left transition-colors flex items-center justify-between gap-2 group",
                            isSelected
                              ? "bg-monsoon-100/70 text-monsoon-900 font-semibold"
                              : "hover:bg-monsoon-50 text-monsoon-800",
                          ].join(" ")}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-monsoon-900 group-hover:text-monsoon-700 truncate">
                              {loc.name}
                            </div>
                            <div className="text-[11px] text-monsoon-800/60 truncate">
                              {loc.state ? `${loc.state}, ` : ""}{loc.country}
                            </div>
                          </div>
                          {loc.coordinates?.lat && (
                            <span className="shrink-0 text-[10px] font-mono text-monsoon-800/40 bg-monsoon-100/50 px-1.5 py-0.5 rounded">
                              {loc.coordinates.lat.toFixed(2)}, {loc.coordinates.lng.toFixed(2)}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Pre-configured & Popular Locations (shown when not searching) */}
            {!searching && searchResults.length === 0 && !searchError && (
              <div>
                <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-monsoon-800/50">
                  Popular Regions
                </p>
                <ul>
                  {REGIONS.map((r) => {
                    const isSelected = r.id === region.id;
                    return (
                      <li key={r.id} role="option" aria-selected={isSelected}>
                        <button
                          type="button"
                          onClick={() => {
                            setRegionId(r.id);
                            setOpen(false);
                          }}
                          className={[
                            "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs transition-colors",
                            isSelected
                              ? "font-semibold text-monsoon-900 bg-monsoon-50"
                              : "text-monsoon-800 hover:bg-monsoon-50/80",
                          ].join(" ")}
                        >
                          <div>
                            <span className="font-bold text-monsoon-900">{r.name}</span>
                            <span className="block text-[11px] text-monsoon-800/60">
                              {r.state}, {r.country}
                            </span>
                          </div>
                          {isSelected && (
                            <span className="text-monsoon-600 text-xs font-bold">Active</span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="px-3 py-2 bg-monsoon-50/80 border-t border-monsoon-100 flex items-center justify-between text-[10px] text-monsoon-800/60">
            <span>Powered by OpenStreetMap</span>
            <span>Worldwide Coverage</span>
          </div>
        </div>
      )}
    </div>
  );
}
