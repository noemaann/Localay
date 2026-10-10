/**
 * Submission Service Contract & Implementation
 *
 * Handles unmoderated community submissions (e.g. proposed new spots).
 * Separates raw community submissions (`submissions` collection) from verified,
 * trusted place records (`places` collection).
 * Supports full moderation lifecycle: pending, community_reported, verified, rejected, needs_recheck.
 */

import { db, isDemoMode } from "./config";
import { MOCK_SUBMISSIONS, MOCK_PLACES } from "./mockData";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

let inMemorySubmissions = [...MOCK_SUBMISSIONS];

export const VALID_MODERATION_STATUSES = [
  "pending",
  "community_reported",
  "verified",
  "rejected",
  "needs_recheck",
];

/**
 * Submit a proposed new place.
 * @param {Object} submissionData
 * @param {string} submissionData.userId
 * @param {string} [submissionData.regionId]
 * @param {string} [submissionData.districtId]
 * @param {string} [submissionData.townId]
 * @param {Object} submissionData.placeData - Object containing name, category, description, address, etc.
 * @returns {Promise<Object>} Created submission document
 */
export async function submitNewPlace(submissionData) {
  if (!submissionData.userId) {
    throw new Error("Authentication required. Please sign in to submit a place.");
  }
  if (!submissionData.placeData || !submissionData.placeData.name?.trim()) {
    throw new Error("A valid place name is required.");
  }

  const regionId = submissionData.regionId || "malappuram-kerala";

  const newSubmission = {
    type: "new_place",
    regionId: regionId,
    districtId: submissionData.districtId || "malappuram",
    townId: submissionData.townId || "locality_general",
    placeData: {
      name: submissionData.placeData.name.trim(),
      category: submissionData.placeData.category || "general",
      description: submissionData.placeData.description?.trim() || "",
      address: submissionData.placeData.address?.trim() || "",
      coverImage: submissionData.placeData.coverImage || "",
      accessInfo: submissionData.placeData.accessInfo || "",
      roadCondition: submissionData.placeData.roadCondition || "",
    },
    userId: submissionData.userId,
    status: "pending", // New submissions enter pending moderation state
  };

  if (isDemoMode || !db) {
    const created = {
      ...newSubmission,
      id: `sub_mock_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    inMemorySubmissions.push(created);
    return Promise.resolve(created);
  }

  try {
    const docRef = await addDoc(collection(db, "submissions"), {
      ...newSubmission,
      createdAt: serverTimestamp(),
    });
    return {
      id: docRef.id,
      ...newSubmission,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error submitting new place to Firestore:", error);
    throw error;
  }
}

/**
 * Get submissions submitted by a specific user.
 * @param {string} userId
 * @returns {Promise<Array<Object>>}
 */
export async function getUserSubmissions(userId) {
  if (!userId) return [];

  if (isDemoMode || !db) {
    const list = inMemorySubmissions.filter((s) => s.userId === userId);
    return Promise.resolve(list);
  }

  try {
    const q = query(
      collection(db, "submissions"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (error) {
    console.error(`Error fetching submissions for user ${userId}:`, error);
    return [];
  }
}

/**
 * Fetch all submissions (or filter by status) for authorized moderators.
 * @param {string} [statusFilter]
 * @returns {Promise<Array<Object>>}
 */
export async function getAllSubmissions(statusFilter = null) {
  if (isDemoMode || !db) {
    let list = [...inMemorySubmissions];
    if (statusFilter) {
      list = list.filter((s) => s.status === statusFilter);
    }
    return Promise.resolve(list);
  }

  try {
    let q;
    if (statusFilter) {
      q = query(collection(db, "submissions"), where("status", "==", statusFilter));
    } else {
      q = collection(db, "submissions");
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (error) {
    console.error("Error fetching submissions from Firestore:", error);
    return [];
  }
}

/**
 * Moderate a submission (Approve / Reject / Request Recheck).
 * Restricted to authorized moderators.
 * @param {string} submissionId
 * @param {string} newStatus - One of 'pending', 'community_reported', 'verified', 'rejected', 'needs_recheck'
 * @param {string} moderatorId
 * @param {string} [notes]
 * @returns {Promise<Object>} Updated submission document
 */
export async function moderateSubmission(submissionId, newStatus, moderatorId, notes = "") {
  if (!VALID_MODERATION_STATUSES.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }
  if (!moderatorId) {
    throw new Error("moderatorId is required to perform moderation.");
  }

  if (isDemoMode || !db) {
    const sub = inMemorySubmissions.find((s) => s.id === submissionId);
    if (!sub) throw new Error("Submission not found.");

    sub.status = newStatus;
    sub.moderatedBy = moderatorId;
    sub.moderatedAt = new Date().toISOString();
    sub.moderationNotes = notes;

    // If approved, create verified place in mock places
    if (newStatus === "verified" || newStatus === "community_reported") {
      const placeAlreadyExists = MOCK_PLACES.some((p) => p.id === `place_from_${sub.id}`);
      if (!placeAlreadyExists) {
        MOCK_PLACES.push({
          id: `place_from_${sub.id}`,
          name: sub.placeData.name,
          regionId: sub.regionId,
          districtId: sub.districtId,
          townId: sub.townId,
          category: sub.placeData.category,
          description: sub.placeData.description,
          address: sub.placeData.address,
          status: newStatus === "verified" ? "approved" : "community_reported",
          createdAt: new Date().toISOString(),
          createdBy: sub.userId,
        });
      }
    }
    return Promise.resolve({ ...sub });
  }

  try {
    const subRef = doc(db, "submissions", submissionId);
    const subSnap = await getDoc(subRef);
    if (!subSnap.exists()) throw new Error("Submission not found.");

    const subData = subSnap.data();
    await updateDoc(subRef, {
      status: newStatus,
      moderatedBy: moderatorId,
      moderatedAt: serverTimestamp(),
      moderationNotes: notes,
    });

    // If approved, publish to places collection
    if (newStatus === "verified" || newStatus === "community_reported") {
      await addDoc(collection(db, "places"), {
        name: subData.placeData.name,
        regionId: subData.regionId,
        districtId: subData.districtId,
        townId: subData.townId,
        category: subData.placeData.category,
        description: subData.placeData.description || "",
        address: subData.placeData.address || "",
        coverImage: subData.placeData.coverImage || "",
        status: newStatus === "verified" ? "approved" : "community_reported",
        createdAt: serverTimestamp(),
        createdBy: subData.userId,
        sourceSubmissionId: submissionId,
      });
    }

    return {
      id: submissionId,
      ...subData,
      status: newStatus,
      moderatedBy: moderatorId,
      moderationNotes: notes,
    };
  } catch (error) {
    console.error(`Error moderating submission ${submissionId}:`, error);
    throw error;
  }
}
