/**
 * Place Service Contract & Implementation
 *
 * Handles fetching trusted place data, filtering by region, district, town, and category,
 * and creating new place documents.
 * UI components must call functions from this module instead of accessing Firestore directly.
 */

import { db, isDemoMode } from "./config";
import { MOCK_PLACES } from "./mockData";
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

let inMemoryPlaces = [...MOCK_PLACES];

/**
 * Get places based on filter criteria.
 * @param {Object} [filters]
 * @param {string} [filters.regionId] - Region identifier
 * @param {string} [filters.districtId] - District identifier
 * @param {string} [filters.townId] - Town identifier
 * @param {string} [filters.category] - Category slug
 * @param {string} [filters.status] - Moderation status (defaults to 'approved')
 * @returns {Promise<Array<Object>>}
 */
export async function getPlaces(filters = {}) {
  const targetStatus = filters.status || "approved";

  if (isDemoMode || !db) {
    let result = inMemoryPlaces.filter((p) => p.status === targetStatus);
    if (filters.regionId) {
      result = result.filter((p) => p.regionId === filters.regionId);
    }
    if (filters.districtId) {
      result = result.filter((p) => p.districtId === filters.districtId);
    }
    if (filters.townId) {
      result = result.filter((p) => p.townId === filters.townId);
    }
    if (filters.category) {
      result = result.filter((p) => p.category === filters.category);
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
    if (filters.category) {
      constraints.push(where("category", "==", filters.category));
    }

    const q = query(collection(db, "places"), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
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
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching place ${id} from Firestore:`, error);
    return null;
  }
}

/**
 * Create a new trusted place record.
 * Restricted to trusted/moderated callers.
 * @param {Object} placeData
 * @returns {Promise<Object>} Created place document
 */
export async function createPlace(placeData) {
  const newPlace = {
    name: placeData.name || "Untitled Place",
    regionId: placeData.regionId || "malappuram-kerala",
    districtId: placeData.districtId || "malappuram",
    townId: placeData.townId || "malappuram-town",
    category: placeData.category || "general",
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
