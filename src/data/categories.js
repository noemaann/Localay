/**
 * Discovery category configuration.
 *
 * Each category has an id, display name, icon (emoji fallback), a short
 * description, and an accent colour from the Tailwind theme. The route field
 * is a future navigation hook (no pages exist yet for Step 3).
 */

/**
 * @typedef {Object} Category
 * @property {string} id          - Unique slug
 * @property {string} label       - Display name
 * @property {string} icon        - Emoji icon (accessible via aria-hidden)
 * @property {string} description - One-line description shown in the card
 * @property {string} accent      - Tailwind background class for the icon tile
 * @property {string} route       - Future route path
 */

/** @type {Category[]} */
export const CATEGORIES = [
  {
    id: "food",
    label: "Food & Eats",
    icon: "🍛",
    description: "Local restaurants, street food, and hidden eateries",
    accent: "bg-amber-50 text-amber-700",
    route: "/discover/food",
  },
  {
    id: "nature",
    label: "Nature",
    icon: "🌿",
    description: "Forests, paddy fields, rivers, and green escapes",
    accent: "bg-green-50 text-green-700",
    route: "/discover/nature",
  },
  {
    id: "viewpoints",
    label: "Viewpoints",
    icon: "🏔️",
    description: "Hills, rooftops, and panoramic spots worth the climb",
    accent: "bg-sky-50 text-sky-700",
    route: "/discover/viewpoints",
  },
  {
    id: "waterfalls",
    label: "Waterfalls",
    icon: "💧",
    description: "Seasonal and year-round waterfalls in the region",
    accent: "bg-blue-50 text-blue-700",
    route: "/discover/waterfalls",
  },
  {
    id: "treks",
    label: "Treks",
    icon: "🥾",
    description: "Walking trails and trekking routes for all fitness levels",
    accent: "bg-orange-50 text-orange-700",
    route: "/discover/treks",
  },
  {
    id: "experiences",
    label: "Experiences",
    icon: "✨",
    description: "Cultural events, local crafts, and community activities",
    accent: "bg-purple-50 text-purple-700",
    route: "/discover/experiences",
  },
];
