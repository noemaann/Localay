/**
 * Firebase Configuration & Demo Mode Initialization
 *
 * Reads environment variables (`VITE_FIREBASE_*`) and initializes Firebase SDK services.
 * Automatically enables Demo Mode when configuration parameters are missing or invalid,
 * or when `VITE_USE_DEMO_MODE=true` is set.
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAYMKDI7yyHQUQ_kznCphL0MjYGzTOLHus",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "localay-8ae28.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "localay-8ae28",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "localay-8ae28.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "97075736091",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:97075736091:web:643cbf207a3eaa37ddd2be",
};

const isTestEnv = import.meta.env?.MODE === "test";
const forceDemoMode = String(import.meta.env?.VITE_USE_DEMO_MODE).toLowerCase() === "true" || isTestEnv;

const isConfigMissing =
  !firebaseConfig.apiKey ||
  !firebaseConfig.projectId ||
  firebaseConfig.apiKey.trim() === "" ||
  firebaseConfig.projectId.trim() === "";

let firebaseApp = null;
let auth = null;
let db = null;
let storage = null;
let initializedDemoMode = forceDemoMode || isConfigMissing;

if (!initializedDemoMode) {
  try {
    firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  } catch (appErr) {
    console.warn("Firebase App initialization warning:", appErr);
    if (getApps().length > 0) {
      firebaseApp = getApp();
    }
  }

  if (firebaseApp) {
    try {
      auth = getAuth(firebaseApp);
    } catch (authErr) {
      console.warn("Firebase Auth initialization failed:", authErr);
    }

    try {
      db = getFirestore(firebaseApp);
    } catch (dbErr) {
      console.warn("Firestore initialization failed:", dbErr);
    }

    try {
      storage = getStorage(firebaseApp);
    } catch (storageErr) {
      console.warn("Firebase Storage initialization failed:", storageErr);
    }
  }

  if (!auth) {
    console.warn("Firebase Auth could not be loaded. Falling back to Demo Mode.");
    initializedDemoMode = true;
  }
}

export const isDemoMode = initializedDemoMode;
export { firebaseApp, auth, db, storage };
