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
 * @property {(id: string) => void} setRegionId - Change the active region by ID
 * @property {(region: Object) => void} setRegion - Set a custom/searched region directly
 */

const LocationContext = createContext(/** @type {LocationContextValue|null} */ (null));

const STORAGE_KEY = "localay_selected_location";

/**
 * Provides a dynamic region selection context to all descendants.
 * Supports pre-defined regions as well as real-world dynamic locations searched from the internet.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function LocationProvider({ children }) {
  const [customRegion, setCustomRegion] = useState(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.id && parsed.name) {
            return parsed;
          }
        }
      }
    } catch (_) {}
    return null;
  });

  const [regionId, setRegionIdRaw] = useState(
    customRegion ? customRegion.id : DEFAULT_REGION_ID
  );

  const region = useMemo(() => {
    if (customRegion && customRegion.id === regionId) {
      return customRegion;
    }
    const predefined = REGIONS.find((r) => r.id === regionId);
    if (predefined) return predefined;
    if (customRegion) return customRegion;
    return getRegionById(DEFAULT_REGION_ID);
  }, [customRegion, regionId]);

  const setRegion = useCallback((newRegion) => {
    if (!newRegion) return;
    const formatted = {
      ...newRegion,
      available: true,
      label: newRegion.label || `${newRegion.name}, ${newRegion.state || "Kerala"}`,
    };
    setCustomRegion(formatted);
    setRegionIdRaw(formatted.id);
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formatted));
      }
    } catch (_) {}
  }, []);

  const setRegionId = useCallback((id) => {
    const match = REGIONS.find((r) => r.id === id && r.available);
    if (match) {
      setCustomRegion(null);
      setRegionIdRaw(match.id);
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (_) {}
      return;
    }
    if (customRegion && customRegion.id === id) {
      setRegionIdRaw(id);
    }
  }, [customRegion]);

  const availableRegions = useMemo(() => {
    const base = REGIONS.filter((r) => r.available);
    if (customRegion && !base.some((r) => r.id === customRegion.id)) {
      return [customRegion, ...base];
    }
    return base;
  }, [customRegion]);

  const value = useMemo(
    () => ({
      region,
      regionId: region.id,
      availableRegions,
      setRegionId,
      setRegion,
    }),
    [region, availableRegions, setRegionId, setRegion]
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
