/**
 * locationSearchService.js — Real-world geocoding & location search.
 *
 * Uses OpenStreetMap Photon & Nominatim APIs to search towns, cities,
 * and districts dynamically over the internet with zero API key required.
 */

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Searches places/towns/cities using the internet (Photon API with Nominatim fallback).
 * @param {string} query
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array<Object>>}
 */
export async function searchLocationsFromInternet(query, signal) {
  if (!query || query.trim().length < 2) return [];

  const trimmed = query.trim();

  // 1. Try Photon Geocoding API (Fast, OpenStreetMap-based, CORS-friendly)
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=6`;
    const res = await fetch(url, { signal });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.features) && data.features.length > 0) {
        return data.features.map((item) => {
          const p = item.properties || {};
          const [lng, lat] = item.geometry?.coordinates || [0, 0];
          const name = p.name || p.city || p.county || trimmed;
          const state = p.state || "";
          const country = p.country || "India";
          const district = p.district || p.county || "";
          const parts = [name, state || district, country].filter(Boolean);
          const label = parts.join(", ");
          const id = `${slugify(name)}-${slugify(state || country || "in")}`;

          return {
            id,
            name,
            state: state || district || "Kerala",
            country,
            label,
            district: district || name,
            available: true,
            isCustom: true,
            coordinates: { lat, lng },
            osmId: p.osm_id,
            type: p.type || "city",
          };
        });
      }
    }
  } catch (err) {
    if (err.name === "AbortError") throw err;
    console.warn("Photon search request failed, attempting Nominatim fallback:", err);
  }

  // 2. Fallback to OpenStreetMap Nominatim
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&addressdetails=1&limit=6`;
    const res = await fetch(nominatimUrl, {
      signal,
      headers: { "Accept-Language": "en" },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((item) => {
          const addr = item.address || {};
          const name =
            item.name ||
            addr.city ||
            addr.town ||
            addr.village ||
            addr.suburb ||
            addr.state_district ||
            trimmed;
          const state = addr.state || "";
          const country = addr.country || "India";
          const label = item.display_name
            ? item.display_name.split(",").slice(0, 3).map((s) => s.trim()).join(", ")
            : `${name}, ${state}`;
          const id = `${slugify(name)}-${slugify(state || country || "in")}`;

          return {
            id,
            name,
            state: state || "Kerala",
            country,
            label,
            district: addr.state_district || addr.county || name,
            available: true,
            isCustom: true,
            coordinates: {
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
            },
            osmId: item.osm_id,
            type: item.type || "place",
          };
        });
      }
    }
  } catch (err) {
    if (err.name === "AbortError") throw err;
    console.warn("Nominatim search request failed:", err);
  }

  return [];
}

/**
 * Reverse geocodes coordinates (e.g. from GPS) to a Location object.
 * @param {number} lat
 * @param {number} lng
 * @param {AbortSignal} [signal]
 * @returns {Promise<Object|null>}
 */
export async function reverseGeocodeFromInternet(lat, lng, signal) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const res = await fetch(url, {
      signal,
      headers: { "Accept-Language": "en" },
    });
    if (res.ok) {
      const item = await res.json();
      const addr = item.address || {};
      const name =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.suburb ||
        addr.municipality ||
        addr.state_district ||
        item.name ||
        "Detected Location";
      const state = addr.state || "Kerala";
      const country = addr.country || "India";
      const label = `${name}, ${state}`;
      const id = `${slugify(name)}-${slugify(state)}`;

      return {
        id,
        name,
        state,
        country,
        label,
        district: addr.state_district || name,
        available: true,
        isCustom: true,
        coordinates: { lat, lng },
      };
    }
  } catch (err) {
    console.error("Reverse geocoding error:", err);
  }
  return null;
}

/**
 * Parses coordinates from Google Maps URLs, share links, or raw coordinate strings.
 * Supports:
 * - Raw: "11.052, 76.074" or "11.052 76.074"
 * - Standard web URLs: /@11.052,76.074,15z
 * - Query URLs: ?q=11.052,76.074, ?ll=11.052,76.074
 * - Protobuf embedded data: !3d11.052!4d76.074
 * @param {string} input
 * @returns {{ lat: number, lng: number }|null}
 */
export function parseGoogleMapsCoordinates(input) {
  if (!input || typeof input !== "string") return null;
  const str = input.trim();

  // 1. Raw coordinates: "11.052, 76.074"
  const rawMatch = str.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
  if (rawMatch) {
    const lat = parseFloat(rawMatch[1]);
    const lng = parseFloat(rawMatch[3]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // 2. Google Maps /@lat,lng format
  const atMatch = str.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // 3. Query string ?q=lat,lng or ?ll=lat,lng or ?destination=lat,lng
  const queryMatch = str.match(
    /[?&](?:q|ll|query|destination|origin)=(?:loc:)?(-?\d+\.\d+)[,+ ](-?\d+\.\d+)/i
  );
  if (queryMatch) {
    const lat = parseFloat(queryMatch[1]);
    const lng = parseFloat(queryMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // 4. Protobuf encoded !3dlat!4dlng in Google Maps URLs
  const dataMatch = str.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (dataMatch) {
    const lat = parseFloat(dataMatch[1]);
    const lng = parseFloat(dataMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  return null;
}

/**
 * Builds a Google Maps Directions URL connecting multiple waypoint coordinates in order.
 * @param {Array<{ lat: number, lng: number }>} points
 * @returns {string}
 */
export function buildGoogleMapsDirectionsUrl(points = []) {
  if (!points || points.length === 0) {
    return "https://www.google.com/maps";
  }
  if (points.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${points[0].lat},${points[0].lng}`;
  }

  const origin = `${points[0].lat},${points[0].lng}`;
  const destination = `${points[points.length - 1].lat},${points[points.length - 1].lng}`;
  const waypoints = points
    .slice(1, points.length - 1)
    .map((p) => `${p.lat},${p.lng}`)
    .join("|");

  let url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    origin
  )}&destination=${encodeURIComponent(destination)}`;
  if (waypoints) {
    url += `&waypoints=${encodeURIComponent(waypoints)}`;
  }
  return url;
}
