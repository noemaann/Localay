import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import LocationSelector from "../components/LocationSelector.jsx";
import AuthModal from "../components/AuthModal.jsx";
import { useLocation } from "../context/LocationContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * SiteHeader — sticky top navigation with LOCALAY branding, nav links,
 * location selector, community contribution links, and user auth control.
 */
function SiteHeader() {
  const { region } = useLocation();
  const { user, isModerator, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const navRef = useRef(null);

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
      "inline-flex items-center text-xs font-semibold tracking-wide transition-[background-color,color] duration-150 focus-visible:outline",
      "focus-visible:outline-2 focus-visible:outline-monsoon-600 rounded-lg px-3 py-1.5",
      isActive
        ? "bg-monsoon-100 text-monsoon-900 font-bold shadow-2xs"
        : "text-monsoon-800 hover:text-monsoon-900 hover:bg-monsoon-50",
    ].join(" ");

  return (
    <>
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
      <header className="sticky top-0 z-40 border-b border-monsoon-200/60 bg-white/90 backdrop-blur-md shadow-[0_1px_2px_0_rgba(15,23,42,0.02)]">

      <nav
        ref={navRef}
        aria-label="Main navigation"
        className="mx-auto flex max-w-6xl items-center justify-between px-4 h-16 sm:px-6"
      >
        {/* Brand */}
        <NavLink
          to="/"
          aria-label="LOCALAY home"
          className="shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-monsoon-600 rounded-xl group flex items-center gap-2.5 py-1"
          onClick={() => setMenuOpen(false)}
        >
          <img
            src="/favicon.png"
            alt=""
            className="h-7 w-7 rounded-lg object-contain shadow-xs transition-transform group-hover:scale-105"
          />
          <span className="font-display text-xl font-extrabold tracking-tight text-monsoon-900">
            LOCAL<span className="text-monsoon-600">AY</span>
          </span>
        </NavLink>

        {/* Desktop nav links */}
        <ul className="hidden sm:flex items-center gap-1.5" role="list">
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
            <NavLink to="/autofare" className={navLinkClass}>
              AutoFare
            </NavLink>
          </li>
          <li>
            <NavLink to="/contribute" className={navLinkClass}>
              Contribute
            </NavLink>
          </li>
          {user && (
            <li>
              <NavLink to="/my-contributions" className={navLinkClass}>
                My Contributions
              </NavLink>
            </li>
          )}
          {isModerator && (
            <li>
              <NavLink to="/moderation" className={navLinkClass}>
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-900 border border-purple-200">
                  Moderation
                </span>
              </NavLink>
            </li>
          )}
        </ul>

        {/* Right side: location + Auth + mobile toggle */}
        <div className="flex items-center gap-2">
          {/* Desktop "+ Add Place" CTA */}
          <NavLink
            to="/contribute"
            className="hidden md:inline-flex items-center gap-1.5 rounded-xl bg-monsoon-900 text-white px-3 py-1.5 text-xs font-semibold hover:bg-monsoon-800 transition-[background-color,transform] duration-150 shadow-xs active:scale-[0.97]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Place</span>
          </NavLink>

          <LocationSelector />

          {/* User Auth Pill */}
          {user ? (
            <div className="hidden sm:flex items-center gap-2.5 pl-2.5 border-l border-monsoon-200/70 h-8">
              <span className="text-xs font-semibold text-monsoon-900 max-w-[110px] truncate">
                {user.displayName || user.email?.split("@")[0]}
              </span>
              <button
                type="button"
                onClick={signOut}
                title="Sign out"
                className="text-xs font-medium text-monsoon-800/70 hover:text-rose-600 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="hidden sm:inline-flex items-center justify-center rounded-xl border border-monsoon-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-monsoon-900 hover:bg-monsoon-50 transition-[background-color,transform] duration-150 ease-spring-out shadow-2xs active:scale-[0.97] h-8.5"
            >
              Sign In
            </button>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
            className={[
              "sm:hidden rounded-xl p-2 transition-colors duration-150",
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
          className="sm:hidden border-t border-monsoon-200/60 bg-white px-4 pb-5 pt-3 animate-fade-in"
        >
          <ul className="flex flex-col gap-1.5" role="list">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `block rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                    isActive ? "bg-monsoon-900 text-white font-semibold" : "text-monsoon-800 hover:bg-monsoon-100"
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
                  `block rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                    isActive ? "bg-monsoon-900 text-white font-semibold" : "text-monsoon-800 hover:bg-monsoon-100"
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                Discover
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/autofare"
                className={({ isActive }) =>
                  `block rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                    isActive ? "bg-monsoon-900 text-white font-semibold" : "text-monsoon-800 hover:bg-monsoon-100"
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                AutoFare
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contribute"
                className={({ isActive }) =>
                  `block rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                    isActive ? "bg-monsoon-900 text-white font-semibold" : "text-monsoon-800 hover:bg-monsoon-100"
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                Contribute
              </NavLink>
            </li>
            {user && (
              <li>
                <NavLink
                  to="/my-contributions"
                  className={({ isActive }) =>
                    `block rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                      isActive ? "bg-monsoon-900 text-white font-semibold" : "text-monsoon-800 hover:bg-monsoon-100"
                    }`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  My Contributions
                </NavLink>
              </li>
            )}
            {isModerator && (
              <li>
                <NavLink
                  to="/moderation"
                  className={({ isActive }) =>
                    `block rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                      isActive ? "bg-monsoon-900 text-white font-semibold" : "text-monsoon-800 hover:bg-monsoon-100"
                    }`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  Moderation Dashboard
                </NavLink>
              </li>
            )}
            <li className="pt-2 border-t border-monsoon-200">
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left rounded-xl px-3.5 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Sign Out ({user.displayName || user.email})
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalOpen(true);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left rounded-xl px-3.5 py-2 text-sm font-semibold text-monsoon-900 hover:bg-monsoon-100"
                >
                  Sign In / Register
                </button>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
    </>
  );
}

/**
 * SiteFooter — comprehensive community-oriented footer.
 */
function SiteFooter() {
  const { region } = useLocation();
  return (
    <footer className="border-t border-monsoon-200/80 bg-white">
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-8 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-monsoon-200/60">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <img
                src="/favicon.png"
                alt=""
                className="h-6 w-6 rounded-md object-contain"
              />
              <span className="font-display text-lg font-extrabold tracking-tight text-monsoon-900">
                LOCAL<span className="text-monsoon-600">AY</span>
              </span>
            </div>
            <p className="text-xs text-monsoon-800/80 leading-relaxed">
              A community-powered guide built by and for the people who actually
              live here. Zero paid promotions, zero sponsored rankings.
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-monsoon-200 bg-monsoon-50 px-2.5 py-1 text-[11px] font-mono text-monsoon-800">
              <span>Region: <strong>{region.label}</strong></span>
            </div>
          </div>

          {/* Column 2: Discover */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-monsoon-900">
              Discover
            </h4>
            <ul className="space-y-1.5 text-xs text-monsoon-800/80">
              <li><NavLink to="/discover?category=food" className="hover:text-monsoon-900 transition-colors">Food & Chai Stalls</NavLink></li>
              <li><NavLink to="/discover?category=viewpoints" className="hover:text-monsoon-900 transition-colors">Hilltops & Viewpoints</NavLink></li>
              <li><NavLink to="/discover?category=nature" className="hover:text-monsoon-900 transition-colors">Paddy Fields & Nature</NavLink></li>
              <li><NavLink to="/discover?category=waterfalls" className="hover:text-monsoon-900 transition-colors">Waterfalls</NavLink></li>
              <li><NavLink to="/autofare" className="hover:text-monsoon-900 transition-colors">Auto Fare Finder</NavLink></li>
            </ul>
          </div>

          {/* Column 3: Community */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-monsoon-900">
              Community
            </h4>
            <ul className="space-y-1.5 text-xs text-monsoon-800/80">
              <li><NavLink to="/contribute" className="hover:text-monsoon-900 transition-colors">Add a New Place</NavLink></li>
              <li><NavLink to="/autofare" className="hover:text-monsoon-900 transition-colors">Log an Auto Fare</NavLink></li>
              <li><NavLink to="/my-contributions" className="hover:text-monsoon-900 transition-colors">My Submissions</NavLink></li>
              <li><NavLink to="/admin/login" className="hover:text-monsoon-900 transition-colors">Admin & Moderation</NavLink></li>
            </ul>
          </div>

          {/* Column 4: Local Commitment */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-monsoon-900">
              Community Guides
            </h4>
            <p className="text-xs text-monsoon-800/70 leading-relaxed">
              Designed for travelers and residents exploring authentic local food, viewpoints, and neighborhood transit rates everywhere.
            </p>
            <div className="pt-2 text-[11px] font-mono text-monsoon-800/60">
              GPS Calibrated • Open Data
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-monsoon-800/60">
          <p>
            &copy; {new Date().getFullYear()} LOCALAY • Handcrafted for neighborhood explorers.
          </p>
          <div className="flex items-center gap-4">
            <NavLink to="/discover" className="hover:text-monsoon-900 transition-colors">Directory</NavLink>
            <NavLink to="/autofare" className="hover:text-monsoon-900 transition-colors">AutoFare</NavLink>
            <NavLink to="/contribute" className="hover:text-monsoon-900 transition-colors">Contribute</NavLink>
          </div>
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
    <div className="flex min-h-screen flex-col bg-monsoon-50 text-monsoon-900 font-sans">
      <SiteHeader />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
