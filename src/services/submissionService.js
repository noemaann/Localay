/**
 * Submission Service Contract & Implementation
 *
 * Handles unmoderated community submissions (e.g. proposed new spots).
 * Separates raw community submissions (`submissions` collection) from verified,
 * trusted place records (`places` collection).
 * Supports full moderation lifecycle: pending, community_reported, verified, rejected, needs_recheck.
 */

import { auth, db, isDemoMode } from "./config";
import { MOCK_SUBMISSIONS, MOCK_PLACES } from "./mockData";
import { registerApprovedPlace } from "./placeService.js";
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

const STORAGE_KEY = "localay_community_submissions";

function loadCachedSubmissions() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (_) {}
  return [...MOCK_SUBMISSIONS];
}

function saveCachedSubmissions(list) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  } catch (_) {}
}

let inMemorySubmissions = loadCachedSubmissions();

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
      location: submissionData.placeData.location || null,
      googleMapsUrl: submissionData.placeData.googleMapsUrl || "",
    },
    userId: submissionData.userId,
    status: "pending", // New submissions enter pending moderation state
  };

  const created = {
    ...newSubmission,
    id: `sub_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  // Always store in memory and localStorage so it is instantly available in My Contributions and Moderation
  inMemorySubmissions.unshift(created);
  saveCachedSubmissions(inMemorySubmissions);

  if (isDemoMode || !db) {
    return Promise.resolve(created);
  }

  try {
    const docRef = await addDoc(collection(db, "submissions"), {
      ...newSubmission,
      createdAt: serverTimestamp(),
    });
    created.id = docRef.id;
    saveCachedSubmissions(inMemorySubmissions);
    return created;
  } catch (error) {
    console.warn("Could not write submission to Firestore, saved locally:", error);
    return created;
  }
}

function mergeSubmissionDoc(cloudDoc) {
  const existingIdx = inMemorySubmissions.findIndex((m) => m.id === cloudDoc.id);
  if (existingIdx >= 0) {
    const local = inMemorySubmissions[existingIdx];
    // If the local submission was already approved/rejected and cloud still says pending, preserve local moderation
    if (local && local.status !== "pending" && cloudDoc.status === "pending") {
      inMemorySubmissions[existingIdx] = {
        ...cloudDoc,
        status: local.status,
        moderatedBy: local.moderatedBy || cloudDoc.moderatedBy,
        moderatedAt: local.moderatedAt || cloudDoc.moderatedAt,
        moderationNotes: local.moderationNotes || cloudDoc.moderationNotes,
      };
    } else {
      inMemorySubmissions[existingIdx] = {
        ...local,
        ...cloudDoc,
      };
    }
  } else {
    inMemorySubmissions.unshift(cloudDoc);
  }
}

/**
 * Get submissions submitted by a specific user.
 * @param {string} userId
 * @returns {Promise<Array<Object>>}
 */
export async function getUserSubmissions(userId) {
  if (!userId) return [];

  let list = inMemorySubmissions.filter((s) => s.userId === userId);

  if (isDemoMode || !db) {
    return Promise.resolve(list);
  }

  try {
    const q = query(
      collection(db, "submissions"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const cloudList = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    // Merge cloud and local
    cloudList.forEach((c) => {
      mergeSubmissionDoc(c);
      if (!list.some((l) => l.id === c.id)) {
        list.push(inMemorySubmissions.find((m) => m.id === c.id) || c);
      }
    });
    saveCachedSubmissions(inMemorySubmissions);
    // Return updated list matching current local status
    return inMemorySubmissions.filter((s) => s.userId === userId);
  } catch (error) {
    console.warn(`Error fetching submissions for user ${userId} from Firestore:`, error);
    return list;
  }
}

/**
 * Fetch all submissions (or filter by status) for authorized moderators.
 * @param {string} [statusFilter]
 * @returns {Promise<Array<Object>>}
 */
export async function getAllSubmissions(statusFilter = null) {
  let list = [...inMemorySubmissions];
  if (statusFilter) {
    list = list.filter((s) => s.status === statusFilter);
  }

  if (isDemoMode || !db) {
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
    const cloudList = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    cloudList.forEach((c) => {
      mergeSubmissionDoc(c);
    });
    saveCachedSubmissions(inMemorySubmissions);

    let res = [...inMemorySubmissions];
    if (statusFilter) {
      res = res.filter((s) => s.status === statusFilter);
    }
    return res;
  } catch (error) {
    console.warn("Firestore submissions read restricted by security rules; attempting owner-scoped fallback:", error);
    
    // When the user is testing in Dev Mode or their Firestore user role has not yet been set to admin in Firebase Console,
    // Firestore rules prevent querying all users' submissions.
    // However, the user CAN always query their own submissions (`where("userId", "==", currentUid)`).
    const currentUid = auth?.currentUser?.uid;
    if (currentUid) {
      try {
        const userQ = query(
          collection(db, "submissions"),
          where("userId", "==", currentUid)
        );
        const userSnap = await getDocs(userQ);
        const userDocs = userSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        userDocs.forEach((doc) => {
          mergeSubmissionDoc(doc);
        });
        saveCachedSubmissions(inMemorySubmissions);
        list = [...inMemorySubmissions];
        if (statusFilter) {
          list = list.filter((s) => s.status === statusFilter);
        }
      } catch (err) {
        console.warn("Could not fetch user-scoped submissions fallback:", err);
      }
    }
    return list;
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

  // Update in local memory and cache
  let sub = inMemorySubmissions.find((s) => s.id === submissionId);
  if (!sub) {
    sub = { id: submissionId };
    inMemorySubmissions.unshift(sub);
  }

  sub.status = newStatus;
  sub.moderatedBy = moderatorId;
  sub.moderatedAt = new Date().toISOString();
  sub.moderationNotes = notes;
  saveCachedSubmissions(inMemorySubmissions);

  // If approved, create verified place in memory & register in placeService!
  if ((newStatus === "verified" || newStatus === "community_reported") && sub.placeData) {
    const verifiedPlace = {
      id: `place_from_${sub.id}`,
      sourceSubmissionId: sub.id,
      name: sub.placeData.name,
      regionId: sub.regionId || "malappuram-kerala",
      districtId: sub.districtId || "malappuram",
      townId: sub.townId || "locality_general",
      category: sub.placeData.category || "general",
      categoryId: sub.placeData.category || "general",
      description: sub.placeData.description || "",
      address: sub.placeData.address || "",
      coverImage: sub.placeData.coverImage || "",
      location: sub.placeData.location || null,
      accessInfo: sub.placeData.accessInfo || "",
      roadCondition: sub.placeData.roadCondition || "",
      googleMapsUrl: sub.placeData.googleMapsUrl || "",
      status: "approved",
      createdAt: new Date().toISOString(),
      createdBy: sub.userId,
    };
    registerApprovedPlace(verifiedPlace);
  }

  if (isDemoMode || !db) {
    return Promise.resolve({ ...sub, cloudSynced: true });
  }

  try {
    const subRef = doc(db, "submissions", submissionId);
    const subSnap = await getDoc(subRef);
    if (subSnap.exists()) {
      const subData = subSnap.data();
      if (!sub.placeData && subData.placeData) {
        sub.placeData = subData.placeData;
        sub.regionId = subData.regionId;
        sub.districtId = subData.districtId;
        sub.townId = subData.townId;
        sub.userId = subData.userId;
        saveCachedSubmissions(inMemorySubmissions);
      }
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
    }

    return {
      id: submissionId,
      ...sub,
      status: newStatus,
      moderatedBy: moderatorId,
      moderationNotes: notes,
      cloudSynced: true,
    };
  } catch (error) {
    console.warn(`Firestore updateDoc restricted, updated locally:`, error);
    return {
      id: submissionId,
      ...sub,
      status: newStatus,
      moderatedBy: moderatorId,
      moderationNotes: notes,
      cloudSynced: false,
    };
  }
}
