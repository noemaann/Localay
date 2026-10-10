/**
 * Firebase Configuration & Demo Mode Initialization
 *
 * Reads environment variables (`VITE_FIREBASE_*`) and initializes Firebase SDK services.
 * Automatically enables Demo Mode when configuration parameters are missing or invalid,
 * or when `VITE_USE_DEMO_MODE=true` is set.
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const env = import.meta.env || {};

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: env.VITE_FIREBASE_APP_ID || "",
};

const isTestEnv = env.MODE === "test";
const forceDemoMode = String(env.VITE_USE_DEMO_MODE).toLowerCase() === "true" || isTestEnv;

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
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);
  } catch (error) {
    console.warn("Firebase initialization failed. Falling back to Demo Mode.", error);
    initializedDemoMode = true;
    firebaseApp = null;
    auth = null;
    db = null;
    storage = null;
  }
}

export const isDemoMode = initializedDemoMode;
export { firebaseApp, auth, db, storage };
