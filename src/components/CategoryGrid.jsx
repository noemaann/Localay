import { useNavigate } from "react-router-dom";
import Card from "./Card.jsx";
import CategoryIcon from "./CategoryIcon.jsx";
import { CATEGORIES } from "../data/categories.js";

/**
 * CategoryGrid — renders the six discovery category tiles.
 *
 * Each tile now navigates to /discover?category=<id> on activation.
 * The grid is responsive: 2 columns on mobile, 3 on tablet+.
 *
 * An optional `onSelect` callback is still supported for cases where
 * the parent wants to intercept the navigation (e.g. HomePage hero).
 *
 * @param {{
 *   onSelect?: (id: string) => void,
 *   className?: string,
 * }} props
 */
const CATEGORY_SVGS = {
  food: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  ),
  nature: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  ),
  viewpoints: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
      <path d="M4.14 15.08c2.62-1.57 5.24-1.43 7.86.42 2.74 1.94 5.49 2 8.23.19" />
    </svg>
  ),
  waterfalls: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      <path d="M12 22v-6" />
      <path d="M9 16c1.5 1 4.5 1 6 0" />
    </svg>
  ),
  treks: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2" />
      <path d="m9 20 3-6 3 2 3-5" />
      <path d="m6 17 3-5 3 1" />
      <path d="M18 10l-4-2-2 3" />
    </svg>
  ),
  experiences: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M3 5h4" />
      <path d="M19 17v4" />
      <path d="M17 19h4" />
    </svg>
  ),
};

/**
 * CategoryGrid — renders the six discovery category tiles.
 *
 * Each tile navigates to /discover?category=<id> on activation.
 * The grid is responsive: 2 columns on mobile, 3 on tablet+.
 *
 * @param {{
 *   onSelect?: (id: string) => void,
 *   className?: string,
 * }} props
 */
export default function CategoryGrid({ onSelect, className = "" }) {
  const navigate = useNavigate();

  function handleSelect(id) {
    if (onSelect) {
      onSelect(id);
    } else {
      navigate(`/discover?category=${encodeURIComponent(id)}`);
    }
  }

  return (
    <div
      className={`grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5 ${className}`}
      aria-label="Discovery categories"
    >
      {CATEGORIES.map((cat) => (
        <Card
          key={cat.id}
          interactive
          className="group relative overflow-hidden transition-[transform,box-shadow,border-color] duration-200 border border-monsoon-200/80 hover:border-monsoon-700 h-full flex flex-col justify-between rounded-2xl bg-white shadow-xs hover:shadow-card-hover active:scale-[0.98]"
          role="button"
          tabIndex={0}
          aria-label={`Explore ${cat.label}`}
          onClick={() => handleSelect(cat.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleSelect(cat.id);
            }
          }}
        >
          <div className="flex flex-col h-full justify-between p-5 sm:p-6 gap-4">
            {/* Top row: Icon tile & Arrow */}
            <div className="flex items-center justify-between">
              <span
                aria-hidden="true"
                className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-2xs ${cat.accent} transition-transform duration-200 group-hover:scale-105`}
              >
                <CategoryIcon categoryId={cat.id} className="w-5 h-5 shrink-0" />
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-monsoon-50 text-monsoon-600 group-hover:bg-monsoon-900 group-hover:text-white transition-colors duration-150 shadow-2xs">
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
                  className="transition-transform duration-150 group-hover:translate-x-0.5"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </div>

            {/* Bottom text block */}
            <div>
              <h3 className="text-sm sm:text-base font-bold text-monsoon-900 group-hover:text-monsoon-700 transition-colors duration-150">
                {cat.label}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-monsoon-800/70 line-clamp-2">
                {cat.description}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
