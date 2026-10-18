import { useNavigate } from "react-router-dom";
import Card from "./Card.jsx";
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
      className={`grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 ${className}`}
      aria-label="Discovery categories"
    >
      {CATEGORIES.map((cat) => (
        <Card
          key={cat.id}
          interactive
          className="group relative overflow-hidden transition-all border border-monsoon-200/80 hover:border-monsoon-900 h-full flex flex-col justify-between rounded-2xl"
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
          <div className="flex flex-col h-full justify-between p-5 gap-3.5">
            {/* Top row: Icon tile & Arrow */}
            <div className="flex items-center justify-between">
              <span
                aria-hidden="true"
                className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl shadow-2xs ${cat.accent} transition-transform duration-200 group-hover:scale-105`}
              >
                {cat.icon}
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-monsoon-50 text-monsoon-400 group-hover:bg-monsoon-900 group-hover:text-white transition-all duration-150">
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </div>

            {/* Bottom text block */}
            <div>
              <p className="text-sm font-bold text-monsoon-900 group-hover:text-monsoon-600 transition-colors duration-150">
                {cat.label}
              </p>
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
