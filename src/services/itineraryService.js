/**
 * itineraryService.js — Day Trip & Itinerary Planning Engine.
 *
 * Provides:
 * 1. Accurate GPS distance calculation via Haversine formula (with regional road factor).
 * 2. Realistic travel time estimation (considering local traffic/road topography).
 * 3. Category-aware dwell times and budget modeling.
 * 4. Nearest-neighbor route sequencing to minimize travel back-and-forth.
 * 5. Google Maps multi-stop navigation link generator.
 */

import { buildGoogleMapsDirectionsUrl } from "./locationSearchService.js";

/**
 * Extracts GPS coordinates from a Place object regardless of schema variant.
 * @param {Object} place
 * @returns {{ lat: number, lng: number }|null}
 */
export function getPlaceCoordinates(place) {
  if (!place) return null;

  // 1. place.location = { latitude, longitude }
  if (place.location && typeof place.location.latitude === "number") {
    return { lat: place.location.latitude, lng: place.location.longitude };
  }

  // 2. place.location = { lat, lng }
  if (place.location && typeof place.location.lat === "number") {
    return { lat: place.location.lat, lng: place.location.lng };
  }

  // 3. place.coordinates = { lat, lng }
  if (place.coordinates && typeof place.coordinates.lat === "number") {
    return { lat: place.coordinates.lat, lng: place.coordinates.lng };
  }

  // 4. Flat coordinates
  if (typeof place.lat === "number" && typeof place.lng === "number") {
    return { lat: place.lat, lng: place.lng };
  }
  if (typeof place.latitude === "number" && typeof place.longitude === "number") {
    return { lat: place.latitude, lng: place.longitude };
  }

  return null;
}

/**
 * Calculates great-circle distance between two coordinates in kilometers,
 * scaled by realistic road curvature (1.28x factor for regional roads).
 * @param {{ lat: number, lng: number }} coord1
 * @param {{ lat: number, lng: number }} coord2
 * @returns {number} Distance in km (rounded to 1 decimal place)
 */
export function calculateDistanceKm(coord1, coord2) {
  if (!coord1 || !coord2) return 0;
  const lat1 = coord1.lat ?? coord1.latitude;
  const lon1 = coord1.lng ?? coord1.longitude;
  const lat2 = coord2.lat ?? coord2.latitude;
  const lon2 = coord2.lng ?? coord2.longitude;

  if (typeof lat1 !== "number" || typeof lat2 !== "number") return 0;

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const aerialDistance = R * c;

  // Road curvature factor (Kerala/regional roads are ~1.28x aerial distance)
  const roadDistance = aerialDistance * 1.28;
  return Math.round(roadDistance * 10) / 10;
}

/**
 * Estimates driving/auto travel time in minutes based on distance.
 * Regional speed benchmark: ~32 km/h average with local traffic buffer.
 * @param {number} distanceKm
 * @returns {number} Minutes
 */
export function estimateTravelTimeMinutes(distanceKm) {
  if (!distanceKm || distanceKm <= 0.2) return 3;
  // (distance / 32 km/h) * 60 min + 2 min buffer
  const minutes = Math.round((distanceKm / 32) * 60 + 2);
  return Math.max(minutes, 4);
}

/**
 * Estimates reasonable dwell time (time spent on location) in minutes based on category.
 * @param {Object} place
 * @returns {number} Dwell time in minutes
 */
export function estimateDwellTimeMinutes(place) {
  const category = (place?.category || place?.categoryId || "").toLowerCase();

  switch (category) {
    case "food":
    case "restaurants":
      return 50; // meal & refreshments
    case "waterfalls":
      return 75; // trek down, enjoy water, trek back
    case "viewpoints":
      return 45; // sunset/views & relaxation
    case "nature":
    case "parks":
      return 60; // nature walk & photography
    case "heritage":
    case "culture":
      return 55; // exploring monuments/museums
    case "treks":
      return 90; // moderate hiking time
    case "experiences":
    case "shopping":
      return 45; // market browsing
    default:
      return 45;
  }
}

/**
 * Estimates approximate spend per person in INR at this spot.
 * @param {Object} place
 * @returns {number} INR
 */
export function estimateBudgetPerPerson(place) {
  const category = (place?.category || place?.categoryId || "").toLowerCase();

  // Check if entryFee string mentions cost
  if (place?.access?.entryFee) {
    const feeMatch = String(place.access.entryFee).match(/₹?\s*(\d+)/);
    if (feeMatch) {
      return parseInt(feeMatch[1], 10) + (category === "food" ? 150 : 20);
    }
  }

  switch (category) {
    case "food":
      return 180; // standard authentic meal/biriyani + tea
    case "waterfalls":
      return 40; // entry ticket + parking
    case "viewpoints":
      return 25; // parking / snack
    case "heritage":
      return 30; // entry pass
    case "nature":
      return 35; // park fee
    case "experiences":
      return 150; // shopping / treats
    default:
      return 50;
  }
}

/**
 * Generates an optimized, sequenced trip itinerary matching the traveler's
 * spot types, budget, and time availability.
 *
 * @param {Object} options
 * @param {Array<Object>} options.places - Available places pool
 * @param {Array<string>} [options.selectedCategories] - Filter by category slugs (empty = all)
 * @param {'budget'|'moderate'|'splurge'|'all'} [options.budgetTier] - Budget preference
 * @param {number} [options.maxHours] - Total time allocated in hours (e.g. 3, 5, 8)
 * @param {{ lat: number, lng: number }|null} [options.userCoordinates] - Optional start GPS
 * @returns {Object} Generated itinerary plan
 */
export function buildItinerary({
  places = [],
  selectedCategories = [],
  budgetTier = "moderate",
  maxHours = 5,
  userCoordinates = null,
}) {
  if (!places || places.length === 0) {
    return {
      stops: [],
      totalDurationMinutes: 0,
      totalTravelMinutes: 0,
      totalDwellMinutes: 0,
      totalDistanceKm: 0,
      estimatedTotalBudget: 0,
      googleMapsDirectionsUrl: "",
      message: "No places found to build an itinerary.",
    };
  }

  // 1. Filter candidate places by selected categories
  let candidates = [...places];
  if (selectedCategories && selectedCategories.length > 0) {
    candidates = candidates.filter((p) => {
      const cat = p.category || p.categoryId;
      return selectedCategories.includes(cat);
    });
  }

  // Fallback to all places if selected categories yield too few candidates
  if (candidates.length === 0) {
    candidates = [...places];
  }

  // 2. Budget limits per person
  const budgetLimits = {
    budget: 350,
    moderate: 800,
    splurge: 2500,
  };
  const maxBudgetPerPerson = budgetLimits[budgetTier] || 1000;

  // Max duration in minutes with a 15-minute tolerance
  const maxMinutes = Math.round(maxHours * 60);

  // 3. Coordinate normalization — ensure places have valid coordinates for routing
  // Default to central Malappuram coordinates if a place has approximate or missing coords
  const fallbackCenter = { lat: 11.0722, lng: 76.074 };
  const placesWithCoords = candidates.map((p) => ({
    ...p,
    _coords: getPlaceCoordinates(p) || fallbackCenter,
    _dwell: estimateDwellTimeMinutes(p),
    _cost: estimateBudgetPerPerson(p),
  }));

  // 4. Sequence spots using Nearest Neighbor TSP algorithm
  const stops = [];
  const remaining = [...placesWithCoords];

  let currentCoord = userCoordinates || (remaining[0] ? remaining[0]._coords : fallbackCenter);
  let totalTime = 0;
  let totalDistance = 0;
  let totalCost = 0;

  // Maximum stops based on time window (at least 2, at most 6)
  const maxStops = Math.min(Math.max(Math.floor(maxHours * 0.9), 2), 6);

  while (remaining.length > 0 && stops.length < maxStops) {
    // Find closest remaining spot from current location
    let bestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = calculateDistanceKm(currentCoord, remaining[i]._coords);
      if (dist < minDistance) {
        minDistance = dist;
        bestIdx = i;
      }
    }

    const nextPlace = remaining[bestIdx];
    const travelTime = stops.length === 0 && !userCoordinates ? 0 : estimateTravelTimeMinutes(minDistance);
    const addedTime = travelTime + nextPlace._dwell;

    // Check if adding this spot exceeds our time budget (allow first 2 stops regardless)
    if (stops.length >= 2 && totalTime + addedTime > maxMinutes) {
      break;
    }

    // Check budget limit
    if (stops.length >= 2 && totalCost + nextPlace._cost > maxBudgetPerPerson * 1.3) {
      // If too expensive, skip unless no other options
      if (remaining.length > 1) {
        remaining.splice(bestIdx, 1);
        continue;
      }
    }

    stops.push({
      order: stops.length + 1,
      place: nextPlace,
      dwellTimeMinutes: nextPlace._dwell,
      estimatedCost: nextPlace._cost,
      distanceFromPrevKm: stops.length === 0 ? 0 : minDistance,
      travelTimeFromPrevMinutes: travelTime,
      coordinates: nextPlace._coords,
    });

    totalTime += addedTime;
    totalDistance += stops.length === 1 ? 0 : minDistance;
    totalCost += nextPlace._cost;
    currentCoord = nextPlace._coords;
    remaining.splice(bestIdx, 1);
  }

  // 5. Total dwell and travel calculations
  const totalDwellMinutes = stops.reduce((sum, s) => sum + s.dwellTimeMinutes, 0);
  const totalTravelMinutes = stops.reduce((sum, s) => sum + s.travelTimeFromPrevMinutes, 0);

  // Auto/transit fare buffer (estimate ₹15 per km travel between spots)
  const transitCostBuffer = Math.round(totalDistance * 15);
  const finalBudget = totalCost + transitCostBuffer;

  // 6. Generate Google Maps Route URL connecting all stops
  const stopCoords = stops.map((s) => s.coordinates);
  const googleMapsDirectionsUrl = buildGoogleMapsDirectionsUrl(stopCoords);

  return {
    stops,
    totalDurationMinutes: totalTime,
    totalTravelMinutes,
    totalDwellMinutes,
    totalDistanceKm: Math.round(totalDistance * 10) / 10,
    estimatedTotalBudget: finalBudget,
    transitCostBuffer,
    googleMapsDirectionsUrl,
  };
}
