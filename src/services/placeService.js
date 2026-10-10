/**
 * Place Service Contract & Implementation
 *
 * Handles fetching trusted place data, filtering by region, district, town, category,
 * search query, and creating new place documents.
 * UI components must call functions from this module instead of accessing Firestore directly.
 *
 * ─────────────────────────────────────────────────────────────────
 * SERVICE CONTRACT
 * ─────────────────────────────────────────────────────────────────
 * getPlaces(filters?)   filters: { query?, category?, categoryId?, regionId?, districtId?, townId?, status? }
 *                       returns: Promise<Place[]>
 * getPlaceById(id)      returns: Promise<Place | null>
 * createPlace(data)     returns: Promise<Place>
 * ─────────────────────────────────────────────────────────────────
 */

import { db, isDemoMode } from "./config";
import { MOCK_PLACES as SERVICE_MOCK_PLACES } from "./mockData";
import { MOCK_PLACES as DATA_MOCK_PLACES } from "../data/mockPlaces.js";
import { filterPlaces } from "../utils/search.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const combinedInitialPlaces = [
  ...SERVICE_MOCK_PLACES.map((p) => ({
    ...p,
    categoryId: p.categoryId || p.category,
    status: p.status || "approved",
  })),
  ...DATA_MOCK_PLACES.map((p) => ({
    ...p,
    category: p.category || p.categoryId,
    status: p.status || "approved",
  })),
];

const initialMap = new Map();
combinedInitialPlaces.forEach((p) => {
  if (!initialMap.has(p.id)) {
    initialMap.set(p.id, p);
  }
});

let inMemoryPlaces = Array.from(initialMap.values());

/**
 * Get places based on filter criteria.
 * @param {Object} [filters]
 * @param {string} [filters.query] - Search keyword
 * @param {string} [filters.regionId] - Region identifier
 * @param {string} [filters.districtId] - District identifier
 * @param {string} [filters.townId] - Town identifier
 * @param {string} [filters.category] - Category slug
 * @param {string} [filters.categoryId] - Category ID slug
 * @param {string} [filters.status] - Moderation status (defaults to 'approved')
 * @returns {Promise<Array<Object>>}
 */
export async function getPlaces(filters = {}) {
  const targetCategory = filters.category || filters.categoryId;
  const targetStatus = filters.status || "approved";

  if (isDemoMode || !db) {
    let result = inMemoryPlaces;
    if (targetStatus) {
      result = result.filter((p) => (p.status || "approved") === targetStatus);
    }
    if (filters.regionId) {
      result = result.filter((p) => p.regionId === filters.regionId);
    }
    if (filters.districtId) {
      result = result.filter((p) => p.districtId === filters.districtId);
    }
    if (filters.townId) {
      result = result.filter((p) => p.townId === filters.townId);
    }
    if (targetCategory && targetCategory !== "all") {
      result = result.filter(
        (p) =>
          (p.category || p.categoryId) === targetCategory ||
          p.categoryId === targetCategory
      );
    }
    if (filters.query) {
      result = filterPlaces(result, { query: filters.query });
    }
    return Promise.resolve(result);
  }

  try {
    const constraints = [where("status", "==", targetStatus)];

    if (filters.regionId) {
      constraints.push(where("regionId", "==", filters.regionId));
    }
    if (filters.districtId) {
      constraints.push(where("districtId", "==", filters.districtId));
    }
    if (filters.townId) {
      constraints.push(where("townId", "==", filters.townId));
    }
    if (targetCategory && targetCategory !== "all") {
      constraints.push(where("category", "==", targetCategory));
    }

    const q = query(collection(db, "places"), ...constraints);
    const snapshot = await getDocs(q);

    let places = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        category: data.category || data.categoryId,
        categoryId: data.categoryId || data.category,
      };
    });

    if (filters.query) {
      places = filterPlaces(places, { query: filters.query });
    }

    return places;
  } catch (error) {
    console.error("Error fetching places from Firestore:", error);
    return [];
  }
}

/**
 * Fetch a single place by its document ID.
 * @param {string} id - Place document ID
 * @returns {Promise<Object|null>}
 */
export async function getPlaceById(id) {
  if (!id) return null;

  if (isDemoMode || !db) {
    const place = inMemoryPlaces.find((p) => p.id === id);
    return Promise.resolve(place || null);
  }

  try {
    const docRef = doc(db, "places", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        category: data.category || data.categoryId,
        categoryId: data.categoryId || data.category,
      };
    }
    const fallback = inMemoryPlaces.find((p) => p.id === id);
    return fallback || null;
  } catch (error) {
    console.error(`Error fetching place ${id} from Firestore:`, error);
    return inMemoryPlaces.find((p) => p.id === id) || null;
  }
}

/**
 * Create a new trusted place record.
 * Restricted to trusted/moderated callers.
 * @param {Object} placeData
 * @returns {Promise<Object>} Created place document
 */
export async function createPlace(placeData) {
  const category =
    placeData.category || placeData.categoryId || "general";
  const newPlace = {
    name: placeData.name || "Untitled Place",
    regionId: placeData.regionId || "malappuram-kerala",
    districtId: placeData.districtId || "malappuram",
    townId: placeData.townId || "malappuram-town",
    category,
    categoryId: category,
    description: placeData.description || "",
    address: placeData.address || "",
    location: placeData.location || { latitude: 0, longitude: 0 },
    coverImage: placeData.coverImage || "",
    tags: placeData.tags || [],
    status: placeData.status || "approved",
    createdBy: placeData.createdBy || "anonymous",
  };

  if (isDemoMode || !db) {
    const created = {
      ...newPlace,
      id: `place_mock_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryPlaces.push(created);
    return Promise.resolve(created);
  }

  try {
    const docRef = await addDoc(collection(db, "places"), {
      ...newPlace,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return {
      id: docRef.id,
      ...newPlace,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error creating place in Firestore:", error);
    throw error;
  }
}
