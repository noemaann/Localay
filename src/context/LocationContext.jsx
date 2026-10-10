import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { DEFAULT_REGION_ID, REGIONS, getRegionById } from "../data/regions.js";

/**
 * @typedef {import('../data/regions.js').Region} Region
 */

/**
 * @typedef {Object} LocationContextValue
 * @property {Region}   region          - The currently selected region object
 * @property {string}   regionId        - The currently selected region id
 * @property {Region[]} availableRegions - Regions the user can switch to
 * @property {(id: string) => void} setRegionId - Change the active region
 */

const LocationContext = createContext(/** @type {LocationContextValue|null} */ (null));

/**
 * Provides a region selection context to all descendants.
 * The default region is driven by `DEFAULT_REGION_ID` from `src/data/regions.js`.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function LocationProvider({ children }) {
  const [regionId, setRegionIdRaw] = useState(DEFAULT_REGION_ID);

  const setRegionId = useCallback((id) => {
    const match = REGIONS.find((r) => r.id === id && r.available);
    if (match) setRegionIdRaw(match.id);
  }, []);

  const region = useMemo(() => getRegionById(regionId), [regionId]);
  const availableRegions = useMemo(() => REGIONS.filter((r) => r.available), []);

  const value = useMemo(
    () => ({ region, regionId, availableRegions, setRegionId }),
    [region, regionId, availableRegions, setRegionId]
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

/**
 * Consume the location context. Must be used inside <LocationProvider>.
 * @returns {LocationContextValue}
 */
export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocation must be used inside a <LocationProvider>");
  }
  return ctx;
}
