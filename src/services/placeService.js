/**
 * placeService.js — service abstraction for place data.
 *
 * This is the ONLY module that UI code imports to access place records.
 * UI components must never import mockPlaces.js or any future Firebase SDK directly.
 *
 * Currently backed by mock data (src/data/mockPlaces.js).
 * To swap in Firebase, replace the implementations of these functions only —
 * the function signatures and return shapes stay the same.
 *
 * All functions return Promises so the call-site is async-ready from day one.
 *
 * ─────────────────────────────────────────────────────────────────
 * SERVICE CONTRACT
 * ─────────────────────────────────────────────────────────────────
 *
 * getPlaces(filters?)
 *   filters: { query?, categoryId?, regionId? }
 *   returns: Promise<Place[]>
 *
 * getPlaceById(placeId)
 *   returns: Promise<Place | null>
 *
 * ─────────────────────────────────────────────────────────────────
 */

import { MOCK_PLACES } from "../data/mockPlaces.js";
import { filterPlaces } from "../utils/search.js";

/** Simulated async latency in development (ms). Set to 0 in tests. */
const MOCK_DELAY_MS = 300;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch places, optionally filtered by query, category, and region.
 *
 * @param {{ query?: string, categoryId?: string, regionId?: string }} [filters]
 * @returns {Promise<import('../data/mockPlaces.js').Place[]>}
 */
export async function getPlaces(filters = {}) {
  await delay(MOCK_DELAY_MS);
  return filterPlaces(MOCK_PLACES, filters);
}

/**
 * Fetch a single place by its stable id.
 * Returns null if not found.
 *
 * @param {string} placeId
 * @returns {Promise<import('../data/mockPlaces.js').Place | null>}
 */
export async function getPlaceById(placeId) {
  await delay(MOCK_DELAY_MS);
  return MOCK_PLACES.find((p) => p.id === placeId) ?? null;
}
