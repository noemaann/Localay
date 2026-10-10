/**
 * format.js — pure display formatting helpers.
 *
 * No React, no network. All functions are deterministic and testable.
 */

/**
 * Returns a human-readable label for a place access difficulty level.
 * @param {'easy'|'moderate'|'difficult'|'unknown'|string} difficulty
 * @returns {string}
 */
export function formatDifficulty(difficulty) {
  switch (difficulty) {
    case "easy":
      return "Easy access";
    case "moderate":
      return "Moderate access";
    case "difficult":
      return "Difficult / 4WD";
    default:
      return "Access unknown";
  }
}

/**
 * Returns an emoji indicator for difficulty, for compact display.
 * @param {'easy'|'moderate'|'difficult'|'unknown'|string} difficulty
 * @returns {string}
 */
export function difficultyIcon(difficulty) {
  switch (difficulty) {
    case "easy":
      return "🟢";
    case "moderate":
      return "🟡";
    case "difficult":
      return "🔴";
    default:
      return "⚪";
  }
}

/**
 * Returns a Tailwind colour class pair for difficulty badges.
 * @param {'easy'|'moderate'|'difficult'|'unknown'|string} difficulty
 * @returns {string}
 */
export function difficultyClass(difficulty) {
  switch (difficulty) {
    case "easy":
      return "bg-green-50 text-green-700";
    case "moderate":
      return "bg-amber-50 text-amber-700";
    case "difficult":
      return "bg-red-50 text-red-700";
    default:
      return "bg-monsoon-100 text-monsoon-800";
  }
}

/**
 * Returns a coordinate accuracy label for the map placeholder.
 * @param {'approximate'|'exact'|null|undefined} accuracy
 * @returns {string}
 */
export function formatCoordinateAccuracy(accuracy) {
  switch (accuracy) {
    case "exact":
      return "Exact location";
    case "approximate":
      return "Approximate location";
    default:
      return "Location not confirmed";
  }
}
