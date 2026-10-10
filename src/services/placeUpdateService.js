/**
 * Place Update Service Contract & Implementation
 *
 * Captures community requests to update existing place details, road/access conditions,
 * and corrections (closed spot, wrong location, updated timings).
 * All updates land in `placeUpdates` with `status: 'pending'` for moderation.
 */

import { db, isDemoMode } from "./config";
import { MOCK_PLACE_UPDATES } from "./mockData";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

let inMemoryUpdates = [...MOCK_PLACE_UPDATES];

/**
 * Fetch updates submitted for a place.
 * @param {string} placeId
 * @returns {Promise<Array<Object>>}
 */
export async function getPlaceUpdates(placeId) {
  if (!placeId) return [];

  if (isDemoMode || !db) {
    const list = inMemoryUpdates.filter((u) => u.placeId === placeId);
    return Promise.resolve(list);
  }

  try {
    const q = query(
      collection(db, "placeUpdates"),
      where("placeId", "==", placeId)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (error) {
    console.error(`Error fetching place updates for ${placeId}:`, error);
    return [];
  }
}

/**
 * Fetch updates submitted by a specific user.
 * @param {string} userId
 * @returns {Promise<Array<Object>>}
 */
export async function getUserPlaceUpdates(userId) {
  if (!userId) return [];

  if (isDemoMode || !db) {
    const list = inMemoryUpdates.filter((u) => u.userId === userId);
    return Promise.resolve(list);
  }

  try {
    const q = query(collection(db, "placeUpdates"), where("userId", "==", userId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (error) {
    console.error(`Error fetching updates for user ${userId}:`, error);
    return [];
  }
}

/**
 * Submit a proposed edit/update or access/road condition update for a place.
 * @param {Object} updateData
 * @param {string} updateData.placeId
 * @param {string} [updateData.type='general_update'] - 'general_update' | 'access_road' | 'correction'
 * @param {string} [updateData.regionId]
 * @param {string} updateData.userId
 * @param {Object} updateData.proposedChanges - Map of updated fields or access/road details
 * @returns {Promise<Object>} Created update document
 */
export async function submitPlaceUpdate(updateData) {
  if (!updateData.placeId) {
    throw new Error("placeId is required to submit a place update.");
  }
  if (!updateData.userId) {
    throw new Error("Authentication required. Please sign in to submit updates.");
  }
  if (!updateData.proposedChanges || Object.keys(updateData.proposedChanges).length === 0) {
    throw new Error("Please provide updated details or correction information.");
  }

  const newUpdate = {
    placeId: updateData.placeId,
    type: updateData.type || "general_update",
    regionId: updateData.regionId || "malappuram-kerala",
    userId: updateData.userId,
    proposedChanges: updateData.proposedChanges,
    status: "pending", // Always pending moderation initially
  };

  if (isDemoMode || !db) {
    const created = {
      ...newUpdate,
      id: `upd_mock_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    inMemoryUpdates.push(created);
    return Promise.resolve(created);
  }

  try {
    const docRef = await addDoc(collection(db, "placeUpdates"), {
      ...newUpdate,
      createdAt: serverTimestamp(),
    });
    return {
      id: docRef.id,
      ...newUpdate,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error submitting place update to Firestore:", error);
    throw error;
  }
}

/**
 * Moderate a place update proposal.
 * @param {string} updateId
 * @param {string} newStatus - One of 'pending', 'community_reported', 'verified', 'rejected', 'needs_recheck'
 * @param {string} moderatorId
 * @param {string} [notes]
 * @returns {Promise<Object>}
 */
export async function moderatePlaceUpdate(updateId, newStatus, moderatorId, notes = "") {
  if (isDemoMode || !db) {
    const upd = inMemoryUpdates.find((u) => u.id === updateId);
    if (!upd) throw new Error("Place update not found.");
    upd.status = newStatus;
    upd.moderatedBy = moderatorId;
    upd.moderatedAt = new Date().toISOString();
    upd.moderationNotes = notes;
    return Promise.resolve({ ...upd });
  }

  try {
    const updRef = doc(db, "placeUpdates", updateId);
    await updateDoc(updRef, {
      status: newStatus,
      moderatedBy: moderatorId,
      moderatedAt: serverTimestamp(),
      moderationNotes: notes,
    });
    return { id: updateId, status: newStatus };
  } catch (error) {
    console.error(`Error moderating place update ${updateId}:`, error);
    throw error;
  }
}
