import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import LocationSelector from "../components/LocationSelector.jsx";
import { useLocation } from "../context/LocationContext.jsx";

/**
 * SiteHeader — sticky top navigation with LOCALAY branding, nav links,
 * and the location selector. Collapses into a mobile hamburger menu.
 */
function SiteHeader() {
  const { region } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  // Close mobile menu on outside click or route change
  useEffect(() => {
    function onOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const navLinkClass = ({ isActive }) =>
    [
      "text-sm font-medium transition-colors duration-150 focus-visible:outline",
      "focus-visible:outline-2 focus-visible:outline-monsoon-600 rounded",
      isActive
        ? "text-monsoon-900"
        : "text-monsoon-800 hover:text-monsoon-900",
    ].join(" ");

  return (
    <header className="sticky top-0 z-40 border-b border-monsoon-100 bg-monsoon-50/95 backdrop-blur-sm">
      <nav
        ref={navRef}
        aria-label="Main navigation"
        className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6"
      >
        {/* Brand */}
        <NavLink
          to="/"
          aria-label="LOCALAY home"
          className="shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-monsoon-600 rounded"
          onClick={() => setMenuOpen(false)}
        >
          <span className="font-display text-xl font-bold tracking-tight text-monsoon-900">
            LOCAL
            <span className="text-monsoon-600">AY</span>
          </span>
        </NavLink>

        {/* Desktop nav links */}
        <ul className="hidden sm:flex items-center gap-6" role="list">
          <li>
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/discover" className={navLinkClass}>
              Discover
            </NavLink>
          </li>
          <li>
            <span
              className="text-sm font-medium text-monsoon-800/40 cursor-not-allowed select-none"
              title="Coming later"
              aria-disabled="true"
            >
              AutoFare
            </span>
          </li>
        </ul>

        {/* Right side: location + mobile toggle */}
        <div className="flex items-center gap-2">
          <LocationSelector />

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
            className={[
              "sm:hidden rounded-lg p-2 transition-colors duration-150",
              "text-monsoon-800 hover:bg-monsoon-100",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-monsoon-600",
            ].join(" ")}
          >
            {menuOpen ? (
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="sm:hidden border-t border-monsoon-100 bg-monsoon-50 px-4 pb-4 pt-2"
        >
          <ul className="flex flex-col gap-1" role="list">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive ? "bg-monsoon-100 text-monsoon-900" : "text-monsoon-800 hover:bg-monsoon-100"
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/discover"
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive ? "bg-monsoon-100 text-monsoon-900" : "text-monsoon-800 hover:bg-monsoon-100"
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                Discover
              </NavLink>
            </li>
            <li>
              <span className="block rounded-lg px-3 py-2.5 text-sm font-medium text-monsoon-800/40 cursor-not-allowed select-none">
                AutoFare <span className="ml-1 text-xs">(coming soon)</span>
              </span>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

/**
 * SiteFooter — simple community-oriented footer.
 */
function SiteFooter() {
  const { region } = useLocation();
  return (
    <footer className="border-t border-monsoon-100 bg-monsoon-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <span className="font-display text-lg font-bold text-monsoon-900">
              LOCAL<span className="text-monsoon-600">AY</span>
            </span>
            <p className="mt-1 text-xs text-monsoon-800/70 max-w-xs leading-relaxed">
              A community-powered guide built by and for the people who actually
              live there. Currently active in{" "}
              <strong>{region.label}</strong>.
            </p>
          </div>

          <p className="text-xs text-monsoon-800/50">
            &copy; {new Date().getFullYear()} LOCALAY
          </p>
        </div>
      </div>
    </footer>
  );
}

/**
 * MainLayout — the primary page shell used by all routes.
 * Renders the sticky header, the route outlet, and the footer.
 */
export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-monsoon-50 text-monsoon-900">
      <SiteHeader />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
