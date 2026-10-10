/**
 * usePlaces.js — custom hook for fetching and filtering places.
 *
 * Encapsulates all async state for the discovery feature.
 * Components receive data, loading, and error — they never call the
 * service directly.
 *
 * @param {{ query?: string, categoryId?: string, regionId?: string }} filters
 */

import { useState, useEffect } from "react";
import { getPlaces } from "../../services/placeService.js";

/**
 * @typedef {Object} UsePlacesResult
 * @property {import('../../data/mockPlaces.js').Place[]} places
 * @property {boolean}  loading
 * @property {string|null} error
 */

/**
 * @param {{ query?: string, categoryId?: string, regionId?: string }} filters
 * @returns {UsePlacesResult}
 */
export function usePlaces({ query = "", categoryId = "", regionId = "" } = {}) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const result = await getPlaces({ query, categoryId, regionId });
        if (!cancelled) setPlaces(result);
      } catch (err) {
        if (!cancelled)
          setError(err?.message ?? "Failed to load places. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => {
      cancelled = true;
    };
  }, [query, categoryId, regionId]);

  return { places, loading, error };
}
