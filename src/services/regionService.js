/**
 * regionService.js — service abstraction for region data.
 *
 * UI code must call this service, not import regions.js directly
 * (with the exception of LocationContext which is the designated owner
 * of region state).
 *
 * Currently backed by static data (src/data/regions.js).
 * To swap in Firebase, replace these implementations only.
 *
 * ─────────────────────────────────────────────────────────────────
 * SERVICE CONTRACT
 * ─────────────────────────────────────────────────────────────────
 *
 * getRegions({ availableOnly? })
 *   returns: Promise<Region[]>
 *
 * getRegionById(regionId)
 *   returns: Promise<Region | null>
 *
 * ─────────────────────────────────────────────────────────────────
 */

import { REGIONS, getRegionById as _getById } from "../data/regions.js";

/**
 * Fetch all regions, optionally filtered to only available ones.
 *
 * @param {{ availableOnly?: boolean }} [opts]
 * @returns {Promise<import('../data/regions.js').Region[]>}
 */
export async function getRegions({ availableOnly = false } = {}) {
  const list = availableOnly ? REGIONS.filter((r) => r.available) : REGIONS;
  return Promise.resolve(list);
}

/**
 * Fetch a single region by its stable id.
 * Falls back to the default region if not found (mirrors data behaviour).
 *
 * @param {string} regionId
 * @returns {Promise<import('../data/regions.js').Region | null>}
 */
export async function getRegionById(regionId) {
  return Promise.resolve(_getById(regionId) ?? null);
}
