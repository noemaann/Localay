/**
 * Dish Price Service Contract & Implementation
 *
 * Tracks crowd-sourced dish and snack pricing for local food spots.
 * Important: New price submissions append a new historical document;
 * historical price submissions are NEVER overwritten.
 */

import { db, isDemoMode } from "./config";
import { MOCK_DISH_PRICES } from "./mockData";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

let inMemoryDishPrices = [...MOCK_DISH_PRICES];

/**
 * Fetch reported dish prices for a given place.
 * @param {string} placeId
 * @returns {Promise<Array<Object>>}
 */
export async function getDishPricesForPlace(placeId) {
  if (!placeId) return [];

  if (isDemoMode || !db) {
    const prices = inMemoryDishPrices.filter((dp) => dp.placeId === placeId);
    return Promise.resolve(prices);
  }

  try {
    const q = query(
      collection(db, "dishPrices"),
      where("placeId", "==", placeId)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (error) {
    console.error(`Error fetching dish prices for place ${placeId}:`, error);
    return [];
  }
}

/**
 * Submit a new dish price report.
 * Appends a new historical price document. Does NOT overwrite past entries.
 * @param {Object} priceData
 * @param {string} priceData.placeId
 * @param {string} [priceData.regionId]
 * @param {string} [priceData.districtId]
 * @param {string} priceData.dishName
 * @param {number} priceData.price
 * @param {string} [priceData.currency]
 * @param {string} [priceData.category]
 * @param {string} priceData.userId
 * @returns {Promise<Object>} Created dishPrice document
 */
export async function addDishPrice(priceData) {
  if (!priceData.placeId) {
    throw new Error("placeId is required for dish price submission.");
  }
  if (!priceData.dishName || priceData.dishName.trim() === "") {
    throw new Error("dishName is required.");
  }
  if (!priceData.userId) {
    throw new Error("userId is required for dish price submission.");
  }

  const numericPrice = Number(priceData.price);
  if (isNaN(numericPrice) || numericPrice <= 0 || numericPrice > 100000) {
    throw new Error("Price must be a positive number up to 100,000.");
  }

  const newEntry = {
    placeId: priceData.placeId,
    regionId: priceData.regionId || "malappuram-kerala",
    districtId: priceData.districtId || "malappuram",
    dishName: priceData.dishName.trim(),
    price: numericPrice,
    currency: priceData.currency || "INR",
    category: priceData.category || "general",
    userId: priceData.userId,
  };

  if (isDemoMode || !db) {
    const created = {
      ...newEntry,
      id: `dish_mock_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    inMemoryDishPrices.push(created);
    return Promise.resolve(created);
  }

  try {
    const docRef = await addDoc(collection(db, "dishPrices"), {
      ...newEntry,
      createdAt: serverTimestamp(),
    });
    return {
      id: docRef.id,
      ...newEntry,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error submitting dish price to Firestore:", error);
    throw error;
  }
}
