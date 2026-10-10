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

      <div className="relative z-10 flex flex-col items-center gap-2 px-6">
        {hasCoords ? (
          <>
            {/* Pin icon */}
            <span aria-hidden="true" className="text-3xl">📍</span>
            <p className="text-sm font-semibold text-monsoon-900">{placeName}</p>
            <p className="text-xs text-monsoon-800/70">{accuracyLabel}</p>
            <p className="mt-1 rounded-lg bg-turmeric-100 px-3 py-1.5 text-xs font-medium text-turmeric-600">
              Interactive map coming in Step 6
            </p>
            {coordinates && (
              <p className="text-[10px] text-monsoon-800/40 font-mono mt-1">
                {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
              </p>
            )}
          </>
        ) : (
          <>
            <span aria-hidden="true" className="text-3xl opacity-40">🗺️</span>
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
