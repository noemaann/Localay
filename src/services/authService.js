/**
 * Authentication Service Contract & Implementation
 *
 * Provides authentication methods (Google Sign-In, Email/Password, Sign Out, User Profile).
 * UI components must call authService functions instead of importing Firebase Auth SDK.
 * Supports full authentication simulation in Demo Mode.
 */

import { auth, db, isDemoMode } from "./config";
import { MOCK_USERS } from "./mockData";
import {
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

function loadStoredUserSession() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = localStorage.getItem("localay_user_session");
      if (stored) return JSON.parse(stored);
    }
  } catch (_) {}
  return null;
}

let demoCurrentUser = loadStoredUserSession();

const authListeners = new Set();

function notifyDemoListeners() {
  authListeners.forEach((callback) => callback(demoCurrentUser));
}

/**
 * Get current authenticated user object synchronously or null.
 * @returns {Object|null}
 */
export function getCurrentUser() {
  if (isDemoMode || !auth) {
    return demoCurrentUser;
  }
  const user = auth.currentUser;
  if (!user) return null;
  return {
    uid: user.uid,
    displayName: user.displayName || user.email?.split("@")[0] || "User",
    email: user.email,
    photoURL: user.photoURL || "",
    isDemo: false,
  };
}

/**
 * Register auth state listener.
 * @param {Function} callback - Function receiving (user | null)
 * @returns {Function} Unsubscribe function
 */
export function onAuthStateChanged(callback) {
  if (isDemoMode || !auth) {
    authListeners.add(callback);
    callback(demoCurrentUser);
    return () => authListeners.delete(callback);
  }

  return firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }
    let role = "community_member";
    try {
      const profile = await getUserProfile(firebaseUser.uid);
      if (profile?.role) {
        role = profile.role;
      }
    } catch (_) {}

    const formattedUser = {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL || "",
      role,
      isDemo: false,
    };
    callback(formattedUser);
  });
}

/**
 * Sign in using Google OAuth popup provider.
 * @returns {Promise<Object>}
 */
export async function signInWithGoogle() {
  if (import.meta.env?.MODE === "test" && !auth) {
    demoCurrentUser = {
      uid: "user_demo_google",
      displayName: "Google Demo User",
      email: "google.user@localay.demo",
      photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
      role: "community_member",
      isDemo: true,
    };
    notifyDemoListeners();
    return Promise.resolve(demoCurrentUser);
  }

  if (!auth) {
    throw new Error("Firebase Authentication is not available. Please verify your connection or try again.");
  }

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    await syncUserProfileDoc(user);
    return {
      uid: user.uid,
      displayName: user.displayName || user.email?.split("@")[0] || "User",
      email: user.email,
      photoURL: user.photoURL || "",
      isDemo: false,
    };
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
}

/**
 * Sign in with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
export async function signInWithEmail(email, password) {
  if (import.meta.env?.MODE === "test" && !auth) {
    demoCurrentUser = {
      uid: `user_demo_${Date.now()}`,
      displayName: email.split("@")[0] || "Community Member",
      email: email,
      photoURL: "",
      role: "community_member",
      isDemo: true,
    };
    notifyDemoListeners();
    return Promise.resolve(demoCurrentUser);
  }

  if (!auth) {
    throw new Error("Firebase Authentication is not available. Please verify your connection.");
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    return {
      uid: user.uid,
      displayName: user.displayName || user.email?.split("@")[0],
      email: user.email,
      photoURL: user.photoURL || "",
      isDemo: false,
    };
  } catch (error) {
    console.error("Error signing in with Email:", error);
    throw error;
  }
}

/**
 * Sign up a new user with email and password.
 * @param {string} email
 * @param {string} password
 * @param {string} [displayName]
 * @returns {Promise<Object>}
 */
export async function signUpWithEmail(email, password, displayName = "") {
  if (import.meta.env?.MODE === "test" && !auth) {
    demoCurrentUser = {
      uid: `user_demo_${Date.now()}`,
      displayName: displayName || email.split("@")[0],
      email: email,
      photoURL: "",
      role: "community_member",
      isDemo: true,
    };
    notifyDemoListeners();
    return Promise.resolve(demoCurrentUser);
  }

  if (!auth) {
    throw new Error("Firebase Authentication is not available. Please verify your connection.");
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    await syncUserProfileDoc({ ...user, displayName: displayName || user.displayName });
    return {
      uid: user.uid,
      displayName: displayName || user.email?.split("@")[0],
      email: user.email,
      photoURL: user.photoURL || "",
      isDemo: false,
    };
  } catch (error) {
    console.error("Error registering user with Email:", error);
    throw error;
  }
}

/**
 * Sign out current user.
 * @returns {Promise<void>}
 */
export async function signOutUser() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem("localay_user_session");
      localStorage.removeItem("localay_dev_role");
    }
  } catch (_) {}

  if (isDemoMode || !auth) {
    demoCurrentUser = null;
    notifyDemoListeners();
    return Promise.resolve();
  }

  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

/**
 * Fetch user profile metadata from `users` Firestore collection.
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
export async function getUserProfile(userId) {
  if (!userId) return null;

  if (isDemoMode || !db) {
    const user = MOCK_USERS.find((u) => u.id === userId);
    return Promise.resolve(user || demoCurrentUser);
  }

  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching user profile ${userId}:`, error);
    return null;
  }
}

/**
 * Private helper to sync user profile document to Firestore `users` collection upon sign in.
 * Note: Never allows writing privileged fields like `role: 'admin'` directly.
 */
async function syncUserProfileDoc(user) {
  if (!db || !user?.uid) return;
  try {
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      await setDoc(userRef, {
        displayName: user.displayName || user.email?.split("@")[0] || "User",
        email: user.email || "",
        photoURL: user.photoURL || "",
        role: "community_member", // Default unprivileged role
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(
        userRef,
        {
          displayName: user.displayName || docSnap.data().displayName,
          photoURL: user.photoURL || docSnap.data().photoURL,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (error) {
    console.warn("Failed to sync user profile doc in Firestore:", error);
  }
}
