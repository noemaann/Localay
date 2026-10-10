/**
 * Region Service Contract & Implementation
 *
 * Encapsulates data fetching for region definitions.
 * Delegates to Cloud Firestore `regions` collection when live Firebase config is present,
 * or to `MOCK_REGIONS` when in Demo Mode.
 */

import { db, isDemoMode } from "./config";
import { MOCK_REGIONS } from "./mockData";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

/**
 * Fetch all available regions.
 * @returns {Promise<Array<Object>>} List of region objects.
 */
export async function getRegions() {
  if (isDemoMode || !db) {
    return Promise.resolve([...MOCK_REGIONS]);
  }

  try {
    const regionsRef = collection(db, "regions");
    const snapshot = await getDocs(regionsRef);
    if (snapshot.empty) {
      return MOCK_REGIONS;
    }
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (error) {
    console.error("Error fetching regions from Firestore:", error);
    return MOCK_REGIONS;
  }
}

/**
 * Fetch a single region by its ID.
 * @param {string} id - Region identifier slug (e.g., 'malappuram-kerala')
 * @returns {Promise<Object|null>} Region object or null if not found.
 */
export async function getRegionById(id) {
  if (!id) return null;

  if (isDemoMode || !db) {
    const found = MOCK_REGIONS.find((r) => r.id === id);
    return Promise.resolve(found || MOCK_REGIONS[0]);
  }

  try {
    const docRef = doc(db, "regions", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    const fallback = MOCK_REGIONS.find((r) => r.id === id);
    return fallback || null;
  } catch (error) {
    console.error(`Error fetching region ${id} from Firestore:`, error);
    return MOCK_REGIONS.find((r) => r.id === id) || null;
  }
}
