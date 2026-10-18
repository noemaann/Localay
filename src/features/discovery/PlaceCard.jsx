import { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/Card.jsx";
import Badge from "../../components/Badge.jsx";
import CategoryIcon from "../../components/CategoryIcon.jsx";
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const category = CATEGORIES.find((c) => c.id === (place.categoryId || place.category));

  return (
    <Link
      to={`/place/${place.id}`}
      className="group flex flex-col h-full rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-monsoon-600 focus-visible:outline-offset-2"
      aria-label={`View details for ${place.name}`}
    >
      <Card
        interactive
        className="h-full flex flex-col justify-between overflow-hidden border border-monsoon-200/80 hover:border-monsoon-700 transition-[box-shadow,border-color,transform] duration-200 rounded-2xl bg-white shadow-xs hover:shadow-card-hover active:scale-[0.98]"
      >
        {/* Image header or Category accent band */}
        {place.coverImage ? (
          <div className="relative h-36 w-full overflow-hidden bg-monsoon-100 ring-1 ring-black/5">
            {/* Image Skeleton while loading */}
            {!imageLoaded && (
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-monsoon-200/70 animate-pulse flex items-center justify-center text-monsoon-400"
              >
                <svg
                  className="w-8 h-8 opacity-40"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
              </div>
            )}
            <img
              src={place.coverImage}
              alt=""
              onLoad={() => setImageLoaded(true)}
              className={`h-full w-full object-cover transition-[transform,opacity] duration-300 ease-spring-out group-hover:scale-105 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-2 pointer-events-none">
              <span className="text-[10px] font-medium bg-black/60 text-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md">
                Contributor Photo
              </span>
            </div>
            <div
              aria-hidden="true"
              className={`absolute top-0 inset-x-0 h-1.5 ${category ? getCategoryBandClass(category.id) : "bg-monsoon-200"}`}
            />
          </div>
        ) : (
          <div
            aria-hidden="true"
            className={`h-1.5 w-full ${category ? getCategoryBandClass(category.id) : "bg-monsoon-200"}`}
          />
        )}

        <div className="flex flex-col gap-3.5 p-5 sm:p-5.5 flex-1 justify-between">
          <div>
            {/* Top row: category badge + demo badge */}
            <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
              {category && (
                <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${category.accent} shadow-2xs`}>
                  <CategoryIcon categoryId={category.id} className="w-3.5 h-3.5 shrink-0" />
                  <span>{category.label}</span>
                </span>
              )}
              {place._demo && (
                <span className="shrink-0 rounded-md border border-monsoon-200/90 bg-monsoon-100/60 px-2 py-0.5 text-[10px] font-mono font-bold text-monsoon-800/70 select-none uppercase tracking-wider">
                  Demo
                </span>
              )}
            </div>

            {/* Name + tagline */}
            <h3 className="text-base font-bold leading-snug text-monsoon-900 group-hover:text-monsoon-700 transition-colors duration-150 line-clamp-1">
              {place.name}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-monsoon-800/70 line-clamp-2 min-h-[2.25rem]">
              {place.tagline || place.description}
            </p>

            {/* Tags preview if present */}
            {place.tags && place.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {place.tags.slice(0, 2).map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-medium text-monsoon-700 bg-monsoon-50 px-2 py-0.5 rounded-md border border-monsoon-200/60"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer: location + difficulty + details arrow */}
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
              <span className="text-xs font-semibold text-monsoon-800 truncate">
                {place.location?.town ?? "Unknown location"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {place.access?.difficulty && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${difficultyClass(place.access.difficulty)}`}
                >
                  {formatDifficulty(place.access.difficulty)}
                </span>
              )}
              <span className="text-monsoon-400 group-hover:text-monsoon-900 group-hover:translate-x-0.5 transition-all text-xs">
                →
              </span>
            </div>
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
    nature: "bg-emerald-500",
    viewpoints: "bg-sky-400",
    waterfalls: "bg-teal-500",
    treks: "bg-orange-400",
    experiences: "bg-purple-400",
  };
  return map[id] ?? "bg-monsoon-200";
}
