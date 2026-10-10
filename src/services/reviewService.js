/**
 * Review Service Contract & Implementation
 *
 * Handles fetching approved reviews and submitting new community reviews.
 * Enforces rating bounds and moderation defaults (`status: 'pending'`).
 * Supports full moderation lifecycle.
 */

import { db, isDemoMode } from "./config";
import { MOCK_REVIEWS } from "./mockData";
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

let inMemoryReviews = [...MOCK_REVIEWS];

/**
 * Fetch reviews for a specific place.
 * @param {string} placeId
 * @param {boolean} [includePending=false]
 * @returns {Promise<Array<Object>>}
 */
export async function getReviewsForPlace(placeId, includePending = false) {
  if (!placeId) return [];

  if (isDemoMode || !db) {
    let reviews = inMemoryReviews.filter((r) => r.placeId === placeId);
    if (!includePending) {
      reviews = reviews.filter((r) => r.status === "approved" || r.status === "verified" || r.status === "community_reported");
    }
    return Promise.resolve(reviews);
  }

  try {
    const constraints = [where("placeId", "==", placeId)];
    if (!includePending) {
      constraints.push(where("status", "in", ["approved", "verified", "community_reported"]));
    }

    const q = query(collection(db, "reviews"), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (error) {
    console.error(`Error fetching reviews for place ${placeId}:`, error);
    return [];
  }
}

/**
 * Fetch reviews submitted by a specific user.
 * @param {string} userId
 * @returns {Promise<Array<Object>>}
 */
export async function getUserReviews(userId) {
  if (!userId) return [];

  if (isDemoMode || !db) {
    const list = inMemoryReviews.filter((r) => r.userId === userId);
    return Promise.resolve(list);
  }

  try {
    const q = query(collection(db, "reviews"), where("userId", "==", userId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (error) {
    console.error(`Error fetching reviews for user ${userId}:`, error);
    return [];
  }
}

/**
 * Submit a community review for a place.
 * @param {Object} reviewData
 * @param {string} reviewData.placeId
 * @param {string} [reviewData.regionId]
 * @param {string} [reviewData.districtId]
 * @param {number} reviewData.rating - Rating from 1 to 5
 * @param {string} [reviewData.title]
 * @param {string} reviewData.content
 * @param {string} reviewData.userId
 * @param {string} [reviewData.authorName]
 * @returns {Promise<Object>} Created review document
 */
export async function addReview(reviewData) {
  if (!reviewData.placeId) {
    throw new Error("placeId is required to submit a review.");
  }
  if (!reviewData.userId) {
    throw new Error("Authentication required. Please sign in to write a review.");
  }
  if (!reviewData.content || reviewData.content.trim().length < 5) {
    throw new Error("Review content must be at least 5 characters long.");
  }

  const rating = Number(reviewData.rating);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be a number between 1 and 5.");
  }

  const newReview = {
    placeId: reviewData.placeId,
    regionId: reviewData.regionId || "malappuram-kerala",
    districtId: reviewData.districtId || "malappuram",
    userId: reviewData.userId,
    authorName: reviewData.authorName || "Community Contributor",
    rating: rating,
    title: reviewData.title?.trim() || "",
    content: reviewData.content.trim(),
    status: "pending", // Unmoderated community review enters pending state
  };

  if (isDemoMode || !db) {
    const created = {
      ...newReview,
      id: `rev_mock_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    inMemoryReviews.push(created);
    return Promise.resolve(created);
  }

  try {
    const docRef = await addDoc(collection(db, "reviews"), {
      ...newReview,
      createdAt: serverTimestamp(),
    });
    return {
      id: docRef.id,
      ...newReview,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error submitting review to Firestore:", error);
    throw error;
  }
}

/**
 * Moderate a review.
 * @param {string} reviewId
 * @param {string} newStatus - One of 'pending', 'community_reported', 'verified', 'rejected', 'needs_recheck'
 * @param {string} moderatorId
 * @param {string} [notes]
 * @returns {Promise<Object>}
 */
export async function moderateReview(reviewId, newStatus, moderatorId, notes = "") {
  if (isDemoMode || !db) {
    const rev = inMemoryReviews.find((r) => r.id === reviewId);
    if (!rev) throw new Error("Review not found.");
    rev.status = newStatus;
    rev.moderatedBy = moderatorId;
    rev.moderatedAt = new Date().toISOString();
    rev.moderationNotes = notes;
    return Promise.resolve({ ...rev });
  }

  try {
    const revRef = doc(db, "reviews", reviewId);
    await updateDoc(revRef, {
      status: newStatus,
      moderatedBy: moderatorId,
      moderatedAt: serverTimestamp(),
      moderationNotes: notes,
    });
    return { id: reviewId, status: newStatus };
  } catch (error) {
    console.error(`Error moderating review ${reviewId}:`, error);
    throw error;
  }
}
