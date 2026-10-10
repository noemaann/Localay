/**
 * AutoFare Service Contract & Implementation
 *
 * Tracks community-reported auto-rickshaw fare reports and calculates
 * responsible, transparent descriptive statistics and comparison ranges.
 *
 * Key Principles:
 * - Appends each submission as an individual historical record (never overwrites).
 * - Excludes stale reports (> 180 days) from comparison logic.
 * - Requires at least 2 comparable reports before returning an observed range.
 * - Displays neutral outcomes: "Within reported range", "Below reported range",
 *   "Above reported range", or "Insufficient comparable data".
 * - Transparently lists algorithm limitations and sample size.
 */

import { db, isDemoMode } from "./config";
import { MOCK_FARE_REPORTS } from "./mockData";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

let inMemoryFareReports = [...MOCK_FARE_REPORTS];

/**
 * Fetch fare reports matching region or route filters.
 * @param {Object} [filters]
 * @returns {Promise<Array<Object>>}
 */
export async function getFareReports(filters = {}) {
  if (isDemoMode || !db) {
    let result = [...inMemoryFareReports];
    if (filters.regionId) {
      result = result.filter((f) => f.regionId === filters.regionId);
    }
    if (filters.districtId) {
      result = result.filter((f) => f.districtId === filters.districtId);
    }
    if (filters.townId) {
      result = result.filter((f) => f.townId === filters.townId);
    }
    if (filters.origin) {
      result = result.filter((f) =>
        f.origin.toLowerCase().includes(filters.origin.toLowerCase())
      );
    }
    if (filters.destination) {
      result = result.filter((f) =>
        f.destination.toLowerCase().includes(filters.destination.toLowerCase())
      );
    }
    return Promise.resolve(result);
  }

  try {
    const constraints = [];
    if (filters.regionId) {
      constraints.push(where("regionId", "==", filters.regionId));
    }
    if (filters.districtId) {
      constraints.push(where("districtId", "==", filters.districtId));
    }
    if (filters.townId) {
      constraints.push(where("townId", "==", filters.townId));
    }

    const q = query(collection(db, "fareReports"), ...constraints);
    const snapshot = await getDocs(q);

    let list = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    if (filters.origin) {
      list = list.filter((f) =>
        f.origin?.toLowerCase().includes(filters.origin.toLowerCase())
      );
    }
    if (filters.destination) {
      list = list.filter((f) =>
        f.destination?.toLowerCase().includes(filters.destination.toLowerCase())
      );
    }

    return list;
  } catch (error) {
    console.error("Error fetching fare reports from Firestore:", error);
    return [];
  }
}

/**
 * Fetch fare reports submitted by a specific user.
 * @param {string} userId
 * @returns {Promise<Array<Object>>}
 */
export async function getUserFareReports(userId) {
  if (!userId) return [];

  if (isDemoMode || !db) {
    const list = inMemoryFareReports.filter((f) => f.userId === userId);
    return Promise.resolve(list);
  }

  try {
    const q = query(collection(db, "fareReports"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
  } catch (error) {
    console.error(`Error fetching fare reports for user ${userId}:`, error);
    return [];
  }
}

/**
 * Submit a community auto-rickshaw fare report.
 * Appends a new historical document. Never overwrites past reports.
 * @param {Object} fareData
 * @returns {Promise<Object>} Created fareReport document
 */
export async function submitFareReport(fareData) {
  if (!fareData.origin?.trim() || !fareData.destination?.trim()) {
    throw new Error("Pickup and drop-off locations are required.");
  }
  if (!fareData.userId) {
    throw new Error("Authentication required. Please sign in to submit a fare report.");
  }

  const distanceKm = Number(fareData.distanceKm);
  const fareAmount = Number(fareData.fareAmount);
  const waitingMinutes = Number(fareData.waitingMinutes || 0);
  const waitingCharges = Number(fareData.waitingCharges || 0);
  const tollsAndExtras = Number(fareData.tollsAndExtras || 0);

  if (isNaN(distanceKm) || distanceKm <= 0 || distanceKm > 500) {
    throw new Error("distanceKm must be a positive number up to 500 km.");
  }
  if (isNaN(fareAmount) || fareAmount <= 0 || fareAmount > 50000) {
    throw new Error("fareAmount must be a positive number up to 50,000 INR.");
  }
  if (isNaN(waitingMinutes) || waitingMinutes < 0) {
    throw new Error("waitingMinutes cannot be negative.");
  }
  if (isNaN(waitingCharges) || waitingCharges < 0) {
    throw new Error("waitingCharges cannot be negative.");
  }
  if (isNaN(tollsAndExtras) || tollsAndExtras < 0) {
    throw new Error("tollsAndExtras cannot be negative.");
  }

  const newReport = {
    regionId: fareData.regionId || "malappuram-kerala",
    districtId: fareData.districtId || "malappuram",
    townId: fareData.townId || "malappuram-town",
    origin: fareData.origin.trim(),
    destination: fareData.destination.trim(),
    distanceKm: distanceKm,
    fareAmount: fareAmount,
    currency: fareData.currency || "INR",
    fareType: fareData.fareType || "agreed", // 'metered' | 'agreed'
    tripType: fareData.tripType || "one_way", // 'one_way' | 'round_trip'
    timeOfDay: fareData.timeOfDay || "day", // 'day' | 'night' | 'peak'
    waitingMinutes: waitingMinutes,
    waitingCharges: waitingCharges,
    tollsAndExtras: tollsAndExtras,
    notes: fareData.notes?.trim() || "",
    userId: fareData.userId,
    status: "unverified", // Default moderation status for community fare entries
  };

  if (isDemoMode || !db) {
    const created = {
      ...newReport,
      id: `fare_mock_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    inMemoryFareReports.push(created);
    return Promise.resolve(created);
  }

  try {
    const docRef = await addDoc(collection(db, "fareReports"), {
      ...newReport,
      createdAt: serverTimestamp(),
    });
    return {
      id: docRef.id,
      ...newReport,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error submitting fare report to Firestore:", error);
    throw error;
  }
}

/**
 * Pure calculation function for fare comparison summary and descriptive statistics.
 *
 * @param {Array<Object>} reports - List of all candidate fare report documents
 * @param {Object} criteria
 * @param {string} [criteria.origin] - Pickup location
 * @param {string} [criteria.destination] - Dropoff location
 * @param {number} [criteria.distanceKm] - Distance in km
 * @param {number} [criteria.distanceToleranceKm] - Allowed distance window (defaults to 1.5 km or 25%)
 * @param {string} [criteria.timeOfDay] - 'day' | 'night' | 'peak'
 * @param {string} [criteria.tripType] - 'one_way' | 'round_trip'
 * @param {number} [criteria.maxAgeDays=180] - Maximum report age in days
 * @param {number} [criteria.queryFareAmount] - Quoted fare to compare against reported range
 * @returns {Object} Fare summary result object
 */
export function calculateFareSummary(reports = [], criteria = {}) {
  const maxAgeDays = criteria.maxAgeDays || 180;
  const now = new Date().getTime();

  // Step 1: Filter by Recency
  const recentReports = reports.filter((r) => {
    if (!r.createdAt) return true;
    const reportDate = new Date(r.createdAt).getTime();
    if (isNaN(reportDate)) return true;
    const ageDays = (now - reportDate) / (1000 * 60 * 60 * 24);
    return ageDays <= maxAgeDays;
  });

  // Step 2: Filter by Route or Distance proximity
  const comparableReports = recentReports.filter((r) => {
    // Check route match if origin/destination given
    if (criteria.origin && criteria.destination) {
      const matchExact =
        r.origin?.toLowerCase().includes(criteria.origin.toLowerCase()) &&
        r.destination?.toLowerCase().includes(criteria.destination.toLowerCase());
      const matchReverse =
        r.origin?.toLowerCase().includes(criteria.destination.toLowerCase()) &&
        r.destination?.toLowerCase().includes(criteria.origin.toLowerCase());
      if (matchExact || matchReverse) return true;
    }

    // Check distance proximity if distanceKm given
    if (criteria.distanceKm && r.distanceKm) {
      const tolerance =
        criteria.distanceToleranceKm || Math.max(1.5, criteria.distanceKm * 0.25);
      const diff = Math.abs(r.distanceKm - criteria.distanceKm);
      if (diff <= tolerance) {
        // Also verify tripType and timeOfDay if specified
        if (criteria.tripType && r.tripType && r.tripType !== criteria.tripType) {
          return false;
        }
        if (criteria.timeOfDay && r.timeOfDay && r.timeOfDay !== criteria.timeOfDay) {
          return false;
        }
        return true;
      }
    }

    return false;
  });

  const sampleSize = comparableReports.length;

  // Insufficient Data Threshold (< 2 reports)
  if (sampleSize < 2) {
    return {
      status: "insufficient_data",
      sampleSize,
      comparisonOutcome: "Insufficient comparable data",
      message: "Insufficient comparable community reports available for this route and criteria.",
      observedRange: null,
      stats: null,
      limitations: [
        `Fewer than 2 comparable community reports found within recent ${maxAgeDays}-day window.`,
        "Statistical estimates require multiple independent community reports.",
        "Local auto-rickshaw fares vary based on time of day, weather, and bargaining context.",
      ],
      disclaimer:
        "LOCALAY AutoFare statistics are computed exclusively from crowd-sourced community reports. LOCALAY does not claim access to live ride-hailing API quotes or official government tariff meters.",
    };
  }

  // Calculate Total Effective Fares (Base Fare + Tolls/Extras + Waiting Charges)
  const effectiveFares = comparableReports
    .map((r) => r.fareAmount + (r.tollsAndExtras || 0) + (r.waitingCharges || 0))
    .sort((a, b) => a - b);

  const minFare = effectiveFares[0];
  const maxFare = effectiveFares[effectiveFares.length - 1];
  const sum = effectiveFares.reduce((acc, v) => acc + v, 0);
  const meanFare = Math.round(sum / sampleSize);

  // Median (50th Percentile)
  const mid = Math.floor(sampleSize / 2);
  const medianFare =
    sampleSize % 2 !== 0
      ? effectiveFares[mid]
      : Math.round((effectiveFares[mid - 1] + effectiveFares[mid]) / 2);

  // 25th & 75th Percentiles
  const p25Fare = effectiveFares[Math.floor(sampleSize * 0.25)];
  const p75Fare = effectiveFares[Math.floor(sampleSize * 0.75)];

  // Comparison Outcome against user query fare
  let comparisonOutcome = "Within reported range";
  if (criteria.queryFareAmount !== undefined && criteria.queryFareAmount !== null) {
    const qFare = Number(criteria.queryFareAmount);
    if (!isNaN(qFare)) {
      if (qFare < minFare) {
        comparisonOutcome = "Below reported range";
      } else if (qFare > maxFare) {
        comparisonOutcome = "Above reported range";
      } else {
        comparisonOutcome = "Within reported range";
      }
    }
  }

  return {
    status: "success",
    sampleSize,
    comparisonOutcome,
    observedRange: {
      min: minFare,
      max: maxFare,
      p25: p25Fare,
      p75: p75Fare,
    },
    stats: {
      minFare,
      maxFare,
      meanFare,
      medianFare,
    },
    comparableReports,
    limitations: [
      `Based on ${sampleSize} community-reported entries recorded in the past ${maxAgeDays} days.`,
      "Observed range represents community experience, not fixed tariff limits.",
      "Accounts for reported waiting charges and tolls where submitted.",
    ],
    disclaimer:
      "LOCALAY AutoFare statistics are computed exclusively from crowd-sourced community reports. LOCALAY does not claim access to live ride-hailing API quotes or official government tariff meters.",
  };
}
