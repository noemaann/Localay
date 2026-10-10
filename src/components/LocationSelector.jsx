import { useState, useRef, useEffect } from "react";
import { useLocation } from "../context/LocationContext.jsx";
import { REGIONS } from "../data/regions.js";
import Badge from "./Badge.jsx";

/**
 * LocationSelector — a dropdown that shows the active region and lets the
 * user switch to another available region.
 *
 * Unavailable regions are shown as "Coming soon" and are not selectable.
 * The entire selector is keyboard-navigable.
 */
export default function LocationSelector() {
  const { region, setRegionId } = useLocation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

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

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        ref={buttonRef}
        id="location-selector-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Current location: ${region.label}. Change location.`}
        onClick={() => setOpen((o) => !o)}
        className={[
          "flex items-center gap-1.5 rounded-lg px-3 py-1.5",
          "text-sm font-medium text-monsoon-800",
          "border border-transparent hover:border-monsoon-100 hover:bg-monsoon-50",
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

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="Select a location"
          className={[
            "absolute right-0 top-full z-50 mt-2 min-w-[220px]",
            "rounded-xl border border-monsoon-100 bg-white shadow-lg",
            "overflow-hidden",
          ].join(" ")}
        >
          <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-monsoon-800/60">
            Select location
          </p>
          <ul className="py-2">
            {REGIONS.map((r) => (
              <li key={r.id} role="option" aria-selected={r.id === region.id}>
                <button
                  type="button"
                  disabled={!r.available}
                  onClick={() => {
                    if (r.available) {
                      setRegionId(r.id);
                      setOpen(false);
                    }
                  }}
                  className={[
                    "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm",
                    r.id === region.id
                      ? "font-semibold text-monsoon-900 bg-monsoon-50"
                      : "text-monsoon-800",
                    r.available
                      ? "hover:bg-monsoon-50 focus-visible:bg-monsoon-50 cursor-pointer"
                      : "cursor-default opacity-50",
                    "focus-visible:outline-none",
                  ].join(" ")}
                >
                  <span>
                    {r.name}
                    <span className="block text-xs font-normal text-monsoon-800/60">
                      {r.state}
                    </span>
                  </span>
                  {r.id === region.id && (
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
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {!r.available && (
                    <Badge variant="outline" className="shrink-0">
                      Soon
                    </Badge>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
