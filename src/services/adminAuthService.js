/**
 * Admin Authentication & Credentials Service
 * Supports Super Admin (superadmin / Admin@123) and administrator account provisioning.
 */

import { adminAuditService } from "./adminAuditService.js";

const ACCOUNTS_STORAGE_KEY = "localay_admin_accounts";
const SESSION_STORAGE_KEY = "localay_active_admin_session";

// Root Super Admin seeded account
const DEFAULT_SUPER_ADMIN = {
  username: "superadmin",
  password: "Admin@123",
  name: "Master Super Admin",
  role: "super_admin",
  status: "active",
  createdAt: "2026-01-01T00:00:00.000Z",
  lastLogin: null,
};

function loadAdminAccounts() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure root superadmin is always present and active
          const hasSuper = parsed.find(
            (a) => a.username.toLowerCase() === "superadmin"
          );
          if (!hasSuper) {
            parsed.unshift(DEFAULT_SUPER_ADMIN);
            saveAdminAccounts(parsed);
          }
          return parsed;
        }
      }
    }
  } catch (_) {}
  return [DEFAULT_SUPER_ADMIN];
}

function saveAdminAccounts(accounts) {
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
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
    if (!username || !password) {
      throw new Error("Both Admin ID / Username and Password are required.");
    }

    const cleanUsername = username.trim().toLowerCase();
    const accounts = loadAdminAccounts();
    const match = accounts.find(
      (a) => a.username.toLowerCase() === cleanUsername
    );

    if (!match) {
      adminAuditService.logAction({
        action: "Failed Admin Login Attempt",
        category: "AUTH",
        performedBy: cleanUsername,
        details: "Username not recognized in admin registry.",
      });
      throw new Error("Invalid Admin ID or Password.");
    }

    if (match.status !== "active") {
      adminAuditService.logAction({
        action: "Suspended Admin Login Attempt",
        category: "AUTH",
        performedBy: cleanUsername,
        details: "Attempted login on deactivated admin account.",
      });
      throw new Error("This admin account has been deactivated. Please contact the Super Admin.");
    }

    if (match.password !== password) {
      adminAuditService.logAction({
        action: "Failed Admin Login Attempt",
        category: "AUTH",
        performedBy: cleanUsername,
        details: "Incorrect password entered.",
      });
      throw new Error("Invalid Admin ID or Password.");
    }

    // Update lastLogin
    match.lastLogin = new Date().toISOString();
    saveAdminAccounts(accounts);

    const sessionUser = {
      username: match.username,
      name: match.name,
      role: match.role,
      status: match.status,
      loginTimestamp: new Date().toISOString(),
    };

    saveActiveSession(sessionUser);

    adminAuditService.logAction({
      action: "Admin Logged In",
      category: "AUTH",
      performedBy: match.username,
      details: `Successful session started for role: ${match.role}`,
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
   * Get all registered admin accounts (excluding sensitive passwords in output if needed, but included for super admin management)
   */
  getAllAdmins() {
    return loadAdminAccounts();
  },

  /**
   * Super Admin operation: Add a new Admin account
   * @param {Object} adminData
   * @param {string} adminData.username
   * @param {string} adminData.password
   * @param {string} adminData.name
   * @param {string} adminData.role
   */
  addAdmin({ username, password, name, role = "admin" }) {
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
    const accounts = loadAdminAccounts();

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

    accounts.push(newAdmin);
    saveAdminAccounts(accounts);

    adminAuditService.logAction({
      action: "New Admin Account Created",
      category: "ADMIN_MGMT",
      performedBy: current.username,
      details: `Created admin ID "${cleanUsername}" (${newAdmin.name}) with role "${newAdmin.role}"`,
    });

    return newAdmin;
  },

  /**
   * Super Admin operation: Change password for an admin account
   */
  updateAdminPassword(targetUsername, newPassword) {
    const current = loadActiveSession();
    if (!current) throw new Error("Authentication required.");

    const isSelf = current.username.toLowerCase() === targetUsername.toLowerCase();
    if (!isSelf && current.role !== "super_admin") {
      throw new Error("Unauthorized: Only the Super Admin can change passwords for other admins.");
    }

    if (!newPassword || newPassword.trim().length < 6) {
      throw new Error("New password must be at least 6 characters long.");
    }

    const accounts = loadAdminAccounts();
    const target = accounts.find((a) => a.username.toLowerCase() === targetUsername.toLowerCase());
    if (!target) {
      throw new Error("Admin account not found.");
    }

    target.password = newPassword.trim();
    saveAdminAccounts(accounts);

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
  toggleAdminStatus(targetUsername) {
    const current = loadActiveSession();
    if (!current || current.role !== "super_admin") {
      throw new Error("Unauthorized: Only the Super Admin can change admin account status.");
    }

    if (targetUsername.toLowerCase() === "superadmin") {
      throw new Error("Cannot deactivate the primary Super Admin account.");
    }

    const accounts = loadAdminAccounts();
    const target = accounts.find((a) => a.username.toLowerCase() === targetUsername.toLowerCase());
    if (!target) throw new Error("Admin account not found.");

    target.status = target.status === "active" ? "deactivated" : "active";
    saveAdminAccounts(accounts);

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
  deleteAdmin(targetUsername) {
    const current = loadActiveSession();
    if (!current || current.role !== "super_admin") {
      throw new Error("Unauthorized: Only the Super Admin can delete admin accounts.");
    }

    if (targetUsername.toLowerCase() === "superadmin") {
      throw new Error("Cannot delete the root Super Admin account.");
    }

    let accounts = loadAdminAccounts();
    const initialLen = accounts.length;
    accounts = accounts.filter((a) => a.username.toLowerCase() !== targetUsername.toLowerCase());

    if (accounts.length === initialLen) {
      throw new Error("Admin account not found.");
    }

    saveAdminAccounts(accounts);

    adminAuditService.logAction({
      action: "Admin Account Deleted",
      category: "ADMIN_MGMT",
      performedBy: current.username,
      details: `Removed admin ID "${targetUsername}" from registry.`,
    });

    return true;
  },
};
