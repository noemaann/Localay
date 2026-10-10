/**
 * Region reference data.
 *
 * A region represents an administrative or geographic area that LOCALAY
 * supports. The default region is Malappuram, Kerala (the launch region).
 *
 * Adding a new region here makes it available to the location selector
 * without any code changes elsewhere.
 */

/** @type {string} */
export const DEFAULT_REGION_ID = "malappuram-kerala";

/**
 * @typedef {Object} Region
 * @property {string} id         - Unique slug
 * @property {string} name       - Display name of the town or district
 * @property {string} state      - State name
 * @property {string} country    - Country name
 * @property {string} label      - Short display label used in UI chips
 * @property {boolean} available - Whether this region is live/selectable
 */

/** @type {Region[]} */
export const REGIONS = [
  {
    id: "malappuram-kerala",
    name: "Malappuram",
    state: "Kerala",
    country: "India",
    label: "Malappuram, Kerala",
    available: true,
  },
  {
    id: "kozhikode-kerala",
    name: "Kozhikode",
    state: "Kerala",
    country: "India",
    label: "Kozhikode, Kerala",
    available: false,
  },
  {
    id: "thrissur-kerala",
    name: "Thrissur",
    state: "Kerala",
    country: "India",
    label: "Thrissur, Kerala",
    available: false,
  },
];

/**
 * Returns the region object for a given id, or the default region.
 * @param {string} id
 * @returns {Region}
 */
export function getRegionById(id) {
  return (
    REGIONS.find((r) => r.id === id) ||
    REGIONS.find((r) => r.id === DEFAULT_REGION_ID)
  );
}
