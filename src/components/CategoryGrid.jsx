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
          className="group relative overflow-hidden transition-all border border-monsoon-200/70 hover:border-monsoon-900"
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
          <div className="flex flex-col gap-3 p-5">
            {/* Icon tile */}
            <div className="flex items-center justify-between">
              <span
                aria-hidden="true"
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${cat.accent} transition-transform duration-200 group-hover:scale-105`}
              >
                {cat.icon}
              </span>
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
                className="text-monsoon-800/30 group-hover:text-monsoon-900 group-hover:translate-x-0.5 transition-all"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-bold text-monsoon-900 group-hover:text-monsoon-600 transition-colors duration-150">
                {cat.label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-monsoon-800/70 hidden sm:block">
                {cat.description}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
