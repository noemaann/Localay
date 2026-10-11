import { Link } from "react-router-dom";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import { CATEGORIES } from "../../data/categories.js";
import { difficultyClass, formatDifficulty } from "../../utils/format.js";

/**
 * PlaceCard — a summary card for a single place, used in the discovery grid.
 *
 * Wraps the card in a React Router <Link> so it is keyboard-navigable and
 * semantically correct. The _demo flag on the place data is surfaced as a
 * discreet badge so users know the data is illustrative.
 *
 * @param {{ place: import('../../data/mockPlaces.js').Place }} props
 */
export default function PlaceCard({ place }) {
  const category = CATEGORIES.find((c) => c.id === place.categoryId);

  return (
    <Link
      to={`/place/${place.id}`}
      className="group block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-monsoon-600 focus-visible:outline-offset-2"
      aria-label={`View details for ${place.name}`}
    >
      <Card
        interactive
        className="h-full flex flex-col overflow-hidden border border-monsoon-200/70 hover:border-monsoon-900 transition-all duration-200"
      >
        {/* Thin category color accent */}
        <div
          aria-hidden="true"
          className={`h-1 w-full ${category ? getCategoryBandClass(category.id) : "bg-monsoon-200"}`}
        />

        <div className="flex flex-col gap-3.5 p-5 flex-1">
          {/* Top row: category badge + demo badge */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {category && (
              <Badge className={`shrink-0 ${category.accent}`}>
                <span aria-hidden="true">{category.icon}</span>
                {category.label}
              </Badge>
            )}
            {place._demo && (
              <span className="shrink-0 rounded-full border border-monsoon-200 px-2 py-0.5 text-[10px] font-medium text-monsoon-800/50 select-none">
                Demo
              </span>
            )}
          </div>

          {/* Name + tagline */}
          <div className="flex-1">
            <h3 className="text-base font-bold leading-snug text-monsoon-900 group-hover:text-monsoon-600 transition-colors duration-150">
              {place.name}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-monsoon-800/70 line-clamp-2">
              {place.tagline}
            </p>
          </div>

          {/* Footer: location + difficulty */}
          <div className="mt-auto flex items-center justify-between gap-2 pt-3.5 border-t border-monsoon-100/80">
            <div className="flex items-center gap-1.5 min-w-0">
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-monsoon-600"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              <span className="text-xs font-medium text-monsoon-800/80 truncate">
                {place.location?.town ?? "Unknown location"}
              </span>
            </div>

            {place.access?.difficulty && (
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${difficultyClass(place.access.difficulty)}`}
              >
                {formatDifficulty(place.access.difficulty)}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

/** Map category id → thin coloured top-band class */
function getCategoryBandClass(id) {
  const map = {
    food: "bg-amber-400",
    nature: "bg-green-500",
    viewpoints: "bg-sky-400",
    waterfalls: "bg-blue-500",
    treks: "bg-orange-400",
    experiences: "bg-purple-400",
  };
  return map[id] ?? "bg-monsoon-200";
}
