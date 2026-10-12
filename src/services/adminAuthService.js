/**
 * Admin Authentication & Credentials Service
 * Supports Super Admin (superadmin / Admin@123) and administrator account provisioning.
 * Fully synchronized with Firebase Firestore cloud database (`adminAccounts` collection)
 * and locally cached for instant performance and offline resiliency.
 */

import { db, isDemoMode } from "./config.js";
import { adminAuditService } from "./adminAuditService.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

const ACCOUNTS_STORAGE_KEY = "localay_admin_accounts";
const SESSION_STORAGE_KEY = "localay_active_admin_session";

// Root Super Admin default account
const DEFAULT_SUPER_ADMIN = {
  username: "superadmin",
  password: "Admin@123",
  name: "Master Super Admin",
  role: "super_admin",
  status: "active",
  createdAt: "2026-01-01T00:00:00.000Z",
  lastLogin: null,
};

function loadCachedAdminAccounts() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasSuper = parsed.find(
            (a) => a.username.toLowerCase() === "superadmin"
          );
          if (!hasSuper) {
            parsed.unshift(DEFAULT_SUPER_ADMIN);
            saveCachedAdminAccounts(parsed);
          }
          return parsed;
        }
      }
    }
  } catch (_) {}
  return [DEFAULT_SUPER_ADMIN];
}

function saveCachedAdminAccounts(accounts) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    }
  } catch (_) {}
}

function loadActiveSession() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    }
  } catch (_) {}
  return null;
}

function saveActiveSession(session) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      if (session) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
  } catch (_) {}
}

export const adminAuthService = {
  /**
   * Attempt admin login
   * Reads from Firestore server when available, falling back to cached registry.
   */
  async login(username, password) {
    if (!username || !password) {
      throw new Error("Both Admin ID / Username and Password are required.");
    }

    const cleanUsername = username.trim().toLowerCase();
    let account = null;

    // 1. Check Cloud Firestore Server
    if (db && !isDemoMode) {
      try {
        const adminDocRef = doc(db, "adminAccounts", cleanUsername);
        const docSnap = await getDoc(adminDocRef);

        if (docSnap.exists()) {
          account = docSnap.data();
        } else if (cleanUsername === "superadmin") {
          // Auto-seed root superadmin into Firestore if not yet present
          account = { ...DEFAULT_SUPER_ADMIN };
          await setDoc(adminDocRef, account);
        }
      } catch (err) {
        console.warn("Could not query Firestore for admin login, checking local cache:", err);
      }
    }

    // 2. Fallback to local cache if server is offline or in demo mode
    if (!account) {
      const localAccounts = loadCachedAdminAccounts();
      account = localAccounts.find(
        (a) => a.username.toLowerCase() === cleanUsername
      );
    }

    if (!account) {
      adminAuditService.logAction({
        action: "Failed Admin Login Attempt",
        category: "AUTH",
        performedBy: cleanUsername,
        details: "Username not recognized in admin registry.",
      });
      throw new Error("Invalid Admin ID or Password.");
    }

    if (account.status !== "active") {
      adminAuditService.logAction({
        action: "Suspended Admin Login Attempt",
        category: "AUTH",
        performedBy: cleanUsername,
        details: "Attempted login on deactivated admin account.",
      });
      throw new Error("This admin account has been deactivated. Please contact the Super Admin.");
    }

    if (account.password !== password) {
      adminAuditService.logAction({
        action: "Failed Admin Login Attempt",
        category: "AUTH",
        performedBy: cleanUsername,
        details: "Incorrect password entered.",
      });
      throw new Error("Invalid Admin ID or Password.");
    }

    // Update lastLogin locally and on Cloud Server
    account.lastLogin = new Date().toISOString();
    const localAccounts = loadCachedAdminAccounts();
    const idx = localAccounts.findIndex((a) => a.username.toLowerCase() === cleanUsername);
    if (idx >= 0) localAccounts[idx] = account;
    else localAccounts.push(account);
    saveCachedAdminAccounts(localAccounts);

    if (db && !isDemoMode) {
      try {
        await updateDoc(doc(db, "adminAccounts", cleanUsername), {
          lastLogin: account.lastLogin,
        });
      } catch (_) {}
    }

    const sessionUser = {
      username: account.username,
      name: account.name,
      role: account.role,
      status: account.status,
      loginTimestamp: new Date().toISOString(),
    };

    saveActiveSession(sessionUser);

    adminAuditService.logAction({
      action: "Admin Logged In",
      category: "AUTH",
      performedBy: account.username,
      details: `Successful session started for role: ${account.role}`,
    });

    return sessionUser;
  },

  /**
   * Log out active admin
   */
  logout() {
    const current = loadActiveSession();
    if (current) {
      adminAuditService.logAction({
        action: "Admin Logged Out",
        category: "AUTH",
        performedBy: current.username,
        details: "Admin session ended.",
      });
    }
    saveActiveSession(null);
  },

  /**
   * Returns current logged in admin session
   */
  getCurrentAdmin() {
    return loadActiveSession();
  },

  /**
   * Get all registered admin accounts from Cloud Firestore & local cache
   */
  async getAllAdmins() {
    let accounts = loadCachedAdminAccounts();

    if (db && !isDemoMode) {
      try {
        const querySnapshot = await getDocs(collection(db, "adminAccounts"));
        if (!querySnapshot.empty) {
          const serverAccounts = [];
          querySnapshot.forEach((docSnap) => {
            serverAccounts.push(docSnap.data());
          });

          // Ensure superadmin is in the list
          if (!serverAccounts.some((a) => a.username.toLowerCase() === "superadmin")) {
            serverAccounts.unshift(DEFAULT_SUPER_ADMIN);
            // Save superadmin to Firestore
            setDoc(doc(db, "adminAccounts", "superadmin"), DEFAULT_SUPER_ADMIN).catch(() => {});
          }

          saveCachedAdminAccounts(serverAccounts);
          return serverAccounts;
        } else {
          // If Firestore collection is empty, upload default superadmin and cached accounts
          for (const acc of accounts) {
            setDoc(doc(db, "adminAccounts", acc.username.toLowerCase()), acc).catch(() => {});
          }
        }
      } catch (err) {
        console.warn("Error fetching admins from Firestore, using cached list:", err);
      }
    }

    return accounts;
  },

  /**
   * Super Admin operation: Add a new Admin account
   * Saves to Cloud Firestore server and updates local cache.
   */
  async addAdmin({ username, password, name, role = "admin" }) {
    const current = loadActiveSession();
    if (!current || current.role !== "super_admin") {
      throw new Error("Unauthorized: Only the Super Admin can create new admin accounts.");
    }

    if (!username || !username.trim()) {
      throw new Error("Admin ID / Username is required.");
    }
    if (!password || password.trim().length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    const cleanUsername = username.trim().toLowerCase();
    const accounts = loadCachedAdminAccounts();

    if (accounts.some((a) => a.username.toLowerCase() === cleanUsername)) {
      throw new Error(`An admin account with ID "${cleanUsername}" already exists.`);
    }

    const newAdmin = {
      username: cleanUsername,
      password: password.trim(),
      name: name?.trim() || cleanUsername,
      role: role === "super_admin" ? "super_admin" : "admin",
      status: "active",
      createdAt: new Date().toISOString(),
      createdBy: current.username,
      lastLogin: null,
    };

    // 1. Update local cache immediately
    accounts.push(newAdmin);
    saveCachedAdminAccounts(accounts);

    // 2. Upload to Cloud Firestore Server
    if (db && !isDemoMode) {
      try {
        await setDoc(doc(db, "adminAccounts", cleanUsername), newAdmin);
        // Also ensure superadmin document exists on server
        const superDoc = await getDoc(doc(db, "adminAccounts", "superadmin"));
        if (!superDoc.exists()) {
          await setDoc(doc(db, "adminAccounts", "superadmin"), DEFAULT_SUPER_ADMIN);
        }
      } catch (err) {
        console.error("Failed to sync new admin to Cloud Firestore server:", err);
        throw new Error(`Saved locally, but server sync failed: ${err.message}`);
      }
    }

    adminAuditService.logAction({
      action: "New Admin Account Created",
      category: "ADMIN_MGMT",
      performedBy: current.username,
      details: `Created admin ID "${cleanUsername}" (${newAdmin.name}) synced with server.`,
    });

    return newAdmin;
  },

  /**
   * Super Admin operation: Change password for an admin account
   */
  async updateAdminPassword(targetUsername, newPassword) {
    const current = loadActiveSession();
    if (!current) throw new Error("Authentication required.");

    const isSelf = current.username.toLowerCase() === targetUsername.toLowerCase();
    if (!isSelf && current.role !== "super_admin") {
      throw new Error("Unauthorized: Only the Super Admin can change passwords for other admins.");
    }

    if (!newPassword || newPassword.trim().length < 6) {
      throw new Error("New password must be at least 6 characters long.");
    }

    const cleanUsername = targetUsername.toLowerCase();
    const accounts = loadCachedAdminAccounts();
    const target = accounts.find((a) => a.username.toLowerCase() === cleanUsername);
    if (!target) throw new Error("Admin account not found.");

    target.password = newPassword.trim();
    saveCachedAdminAccounts(accounts);

    // Update on Cloud Firestore server
    if (db && !isDemoMode) {
      try {
        await updateDoc(doc(db, "adminAccounts", cleanUsername), {
          password: newPassword.trim(),
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Failed to update password on server:", err);
      }
    }

    adminAuditService.logAction({
      action: "Admin Password Updated",
      category: "SECURITY",
      performedBy: current.username,
      details: `Password changed for admin ID "${targetUsername}".`,
    });

    return true;
  },

  /**
   * Super Admin operation: Toggle status (active/suspended)
   */
  async toggleAdminStatus(targetUsername) {
    const current = loadActiveSession();
    if (!current || current.role !== "super_admin") {
      throw new Error("Unauthorized: Only the Super Admin can change admin account status.");
    }

    if (targetUsername.toLowerCase() === "superadmin") {
      throw new Error("Cannot deactivate the primary Super Admin account.");
    }

    const cleanUsername = targetUsername.toLowerCase();
    const accounts = loadCachedAdminAccounts();
    const target = accounts.find((a) => a.username.toLowerCase() === cleanUsername);
    if (!target) throw new Error("Admin account not found.");

    target.status = target.status === "active" ? "deactivated" : "active";
    saveCachedAdminAccounts(accounts);

    // Update on Cloud Firestore server
    if (db && !isDemoMode) {
      try {
        await updateDoc(doc(db, "adminAccounts", cleanUsername), {
          status: target.status,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Failed to update admin status on server:", err);
      }
    }

    adminAuditService.logAction({
      action: `Admin Account ${target.status === "active" ? "Reactivated" : "Deactivated"}`,
      category: "ADMIN_MGMT",
      performedBy: current.username,
      details: `Admin ID "${targetUsername}" status set to ${target.status}.`,
    });

    return target;
  },

  /**
   * Super Admin operation: Delete an admin account
   */
  async deleteAdmin(targetUsername) {
    const current = loadActiveSession();
    if (!current || current.role !== "super_admin") {
      throw new Error("Unauthorized: Only the Super Admin can delete admin accounts.");
    }

    if (targetUsername.toLowerCase() === "superadmin") {
      throw new Error("Cannot delete the root Super Admin account.");
    }

    const cleanUsername = targetUsername.toLowerCase();
    let accounts = loadCachedAdminAccounts();
    const initialLen = accounts.length;
    accounts = accounts.filter((a) => a.username.toLowerCase() !== cleanUsername);

    if (accounts.length === initialLen) {
      throw new Error("Admin account not found.");
    }

    saveCachedAdminAccounts(accounts);

    // Delete from Cloud Firestore server
    if (db && !isDemoMode) {
      try {
        await deleteDoc(doc(db, "adminAccounts", cleanUsername));
      } catch (err) {
        console.error("Failed to delete admin from server:", err);
      }
    }

    adminAuditService.logAction({
      action: "Admin Account Deleted",
      category: "ADMIN_MGMT",
      performedBy: current.username,
      details: `Removed admin ID "${targetUsername}" from server and registry.`,
    });

    return true;
  },
};
