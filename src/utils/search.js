/**
 * search.js — pure helpers for filtering and searching place records.
 *
 * No React, no network. All functions are deterministic and testable.
 */

/**
 * Normalise a string for comparison: lowercase, trim, collapse whitespace.
 * @param {string} str
 * @returns {string}
 */
export function normalise(str) {
  return String(str ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Returns true if `haystack` contains every word in `needle`.
 * Case-insensitive, whitespace-normalised.
 *
 * @param {string} haystack
 * @param {string} needle
 * @returns {boolean}
 */
export function matchesQuery(haystack, needle) {
  if (!needle || !needle.trim()) return true;
  const words = normalise(needle).split(" ").filter(Boolean);
  const text = normalise(haystack);
  return words.every((w) => text.includes(w));
}

/**
 * Filter a list of places by search query, category, and region.
 *
 * Matching rules:
 *  - `query`      — checked against name, tagline, description, and tags
 *  - `categoryId` — exact match against place.categoryId; falsy = any
 *  - `regionId`   — exact match against place.regionId; falsy = any
 *
 * @param {import('../data/mockPlaces.js').Place[]} places
 * @param {{ query?: string, categoryId?: string, regionId?: string }} filters
 * @returns {import('../data/mockPlaces.js').Place[]}
 */
export function filterPlaces(places, { query = "", categoryId = "", regionId = "" } = {}) {
  return places.filter((place) => {
    if (regionId && place.regionId !== regionId) return false;
    if (categoryId && place.categoryId !== categoryId) return false;

    if (query) {
      const searchable = [
        place.name,
        place.tagline,
        place.description,
        ...(place.tags ?? []),
        place.location?.town ?? "",
      ].join(" ");
      if (!matchesQuery(searchable, query)) return false;
    }

    return true;
  });
}
