import { formatCoordinateAccuracy } from "../../utils/format.js";

/**
 * MapPlaceholder — shown on the place detail page where a Leaflet map will live.
 *
 * Clearly distinguishes three states:
 *  1. Coordinates known (approximate or exact) — shows a styled placeholder
 *     with the coordinate accuracy label and a note that the map is coming.
 *  2. Coordinates unknown — communicates clearly that the location is not
 *     yet confirmed; never implies a map is available.
 *
 * This component must be replaced by a real Leaflet integration in Step 6.
 * It intentionally avoids any visual that could be mistaken for a real map.
 *
 * @param {{
 *   coordinates: import('../../data/mockPlaces.js').PlaceCoordinates | null,
 *   placeName: string,
 *   className?: string,
 * }} props
 */
export default function MapPlaceholder({ coordinates, placeName, className = "" }) {
  const hasCoords = !!coordinates;
  const accuracyLabel = formatCoordinateAccuracy(coordinates?.accuracy);

  return (
    <div
      aria-label={
        hasCoords
          ? `Map placeholder for ${placeName}. ${accuracyLabel}.`
          : `Map not available for ${placeName}. Location not confirmed.`
      }
      className={[
        "relative flex flex-col items-center justify-center gap-3",
        "rounded-2xl border-2 border-dashed text-center",
        "select-none overflow-hidden",
        hasCoords
          ? "border-monsoon-200 bg-monsoon-50 min-h-[220px]"
          : "border-monsoon-100 bg-monsoon-50/50 min-h-[160px]",
        className,
      ].join(" ")}
    >
      {/* Decorative grid lines — purely visual, aria-hidden */}
      {hasCoords && (
        <div aria-hidden="true" className="absolute inset-0 opacity-30">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full border-t border-monsoon-200"
              style={{ top: `${(i + 1) * (100 / 7)}%` }}
            />
          ))}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute h-full border-l border-monsoon-200"
              style={{ left: `${(i + 1) * (100 / 7)}%` }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center gap-2 px-6 text-center">
        {hasCoords ? (
          <>
            {/* Pin icon */}
            <div className="w-10 h-10 rounded-full bg-monsoon-900 text-white flex items-center justify-center shadow-md mb-1">
              <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-monsoon-900">{placeName}</p>
            <p className="text-xs text-monsoon-800/70">{accuracyLabel}</p>
            <p className="mt-1 rounded-md border border-turmeric-200 bg-turmeric-50 px-2.5 py-1 text-xs font-mono text-turmeric-700">
              Interactive map view
            </p>
            {coordinates && (
              <p className="text-[10px] text-monsoon-800/50 font-mono mt-0.5">
                {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
              </p>
            )}
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-monsoon-100 text-monsoon-400 flex items-center justify-center mb-1">
              <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                <line x1="8" y1="2" x2="8" y2="18" />
                <line x1="16" y1="6" x2="16" y2="22" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-monsoon-900/60">
              Location not confirmed
            </p>
            <p className="text-xs text-monsoon-800/50 max-w-[220px] leading-relaxed">
              Coordinates for this place have not been verified by the community yet.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
