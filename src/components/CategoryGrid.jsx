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
          className="group"
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
          <div className="flex flex-col gap-3 p-4 sm:p-5">
            {/* Icon tile */}
            <span
              aria-hidden="true"
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl ${cat.accent}`}
            >
              {cat.icon}
            </span>

            <div>
              <p className="text-sm font-semibold text-monsoon-900 group-hover:text-monsoon-600 transition-colors duration-150">
                {cat.label}
              </p>
              <p className="mt-0.5 text-xs leading-snug text-monsoon-800/70 hidden sm:block">
                {cat.description}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
