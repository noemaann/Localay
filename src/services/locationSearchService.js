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
