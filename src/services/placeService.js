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

const PLACES_STORAGE_KEY = "localay_approved_places";

function loadLocalApprovedPlaces() {
  const result = [...inMemoryPlaces];
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      // 1. Load approved places from localay_approved_places
      const storedPlaces = localStorage.getItem(PLACES_STORAGE_KEY);
      if (storedPlaces) {
        const parsed = JSON.parse(storedPlaces);
        if (Array.isArray(parsed)) {
          parsed.forEach((p) => {
            if (!result.some((r) => r.id === p.id)) {
              result.push(p);
            }
          });
        }
      }

      // 2. Load verified submissions from localay_community_submissions
      const storedSubs = localStorage.getItem("localay_community_submissions");
      if (storedSubs) {
        const parsedSubs = JSON.parse(storedSubs);
        if (Array.isArray(parsedSubs)) {
          parsedSubs.forEach((sub) => {
            if (sub.status === "verified" || sub.status === "community_reported") {
              const placeId = sub.id
                ? sub.id.startsWith("sub_")
                  ? `place_from_${sub.id}`
                  : sub.id
                : `place_${Date.now()}`;
              if (
                !result.some(
                  (r) => r.id === placeId || r.sourceSubmissionId === sub.id
                )
              ) {
                result.unshift({
                  id: placeId,
                  sourceSubmissionId: sub.id,
                  name: sub.placeData?.name || "Verified Spot",
                  regionId: sub.regionId || "malappuram-kerala",
                  districtId: sub.districtId || "malappuram",
                  townId: sub.townId || "locality_general",
                  category: sub.placeData?.category || "general",
                  categoryId: sub.placeData?.category || "general",
                  description: sub.placeData?.description || "",
                  address: sub.placeData?.address || "",
                  coverImage: sub.placeData?.coverImage || "",
                  location: sub.placeData?.location || null,
                  accessInfo: sub.placeData?.accessInfo || "",
                  roadCondition: sub.placeData?.roadCondition || "",
                  status: "approved",
                  createdAt: sub.createdAt || new Date().toISOString(),
                  createdBy: sub.userId,
                });
              }
            }
          });
        }
      }
    }
  } catch (_) {}
  return result;
}

export function registerApprovedPlace(place) {
  const normalized = {
    ...place,
    category: place.category || place.categoryId || "general",
    categoryId: place.categoryId || place.category || "general",
    status: place.status || "approved",
  };
  const existingIdx = inMemoryPlaces.findIndex(
    (p) => p.id === normalized.id || (p.sourceSubmissionId && p.sourceSubmissionId === normalized.sourceSubmissionId)
  );
  if (existingIdx >= 0) {
    inMemoryPlaces[existingIdx] = normalized;
  } else {
    inMemoryPlaces.unshift(normalized);
  }
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = localStorage.getItem(PLACES_STORAGE_KEY);
      let list = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(list)) list = [];
      const idx = list.findIndex(
        (p) => p.id === normalized.id || (p.sourceSubmissionId && p.sourceSubmissionId === normalized.sourceSubmissionId)
      );
      if (idx >= 0) list[idx] = normalized;
      else list.unshift(normalized);
      localStorage.setItem(PLACES_STORAGE_KEY, JSON.stringify(list));
    }
  } catch (_) {}
  return normalized;
}

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

  // Gather local approved and verified places
  const localList = loadLocalApprovedPlaces();
  let combined = [...localList];

  if (!isDemoMode && db) {
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

      const cloudPlaces = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          category: data.category || data.categoryId,
          categoryId: data.categoryId || data.category,
        };
      });

      cloudPlaces.forEach((cp) => {
        const idx = combined.findIndex(
          (p) => p.id === cp.id || (p.sourceSubmissionId && p.sourceSubmissionId === cp.sourceSubmissionId)
        );
        if (idx >= 0) {
          combined[idx] = cp;
        } else {
          combined.unshift(cp);
        }
      });
    } catch (error) {
      console.warn("Error fetching places from Firestore, using local approved places:", error);
    }
  }

  let result = combined;

  if (targetStatus) {
    result = result.filter((p) => (p.status || "approved") === targetStatus);
  }
  if (filters.regionId) {
    const regionMatches = result.filter((p) => p.regionId === filters.regionId);
    if (regionMatches.length > 0) {
      result = regionMatches;
    } else {
      const fuzzyMatches = result.filter(
        (p) =>
          p.districtId === filters.regionId ||
          p.townId === filters.regionId ||
          p.regionId?.toLowerCase().includes(filters.regionId.toLowerCase()) ||
          filters.regionId.toLowerCase().includes(p.regionId?.toLowerCase() || "")
      );
      if (fuzzyMatches.length > 0) {
        result = fuzzyMatches;
      }
    }
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

  return result;
}

/**
 * Fetch a single place by its document ID.
 * @param {string} id - Place document ID
 * @returns {Promise<Object|null>}
 */
export async function getPlaceById(id) {
  if (!id) return null;

  if (!isDemoMode && db) {
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
    } catch (error) {
      console.warn(`Error fetching place ${id} from Firestore, checking local:`, error);
    }
  }

  const allLocal = loadLocalApprovedPlaces();
  const place = allLocal.find(
    (p) => p.id === id || p.sourceSubmissionId === id || p.id === `place_from_${id}`
  );
  return place || null;
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
