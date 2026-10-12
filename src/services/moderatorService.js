/**
 * Moderator Management Service
 * Manages community moderator applications, approvals, permissions, and active rosters.
 */

import { adminAuditService } from "./adminAuditService.js";

const APPLICATIONS_KEY = "localay_moderator_applications";
const ACTIVE_MODERATORS_KEY = "localay_active_moderators";

const DEFAULT_APPLICATIONS = [
  {
    id: "app-101",
    name: "Arjun K. Varma",
    email: "arjun.malappuram@example.com",
    regionId: "malappuram",
    regionName: "Malappuram Central",
    experience: "Local explorer and food blogger for 4 years in Down Hill and Kottakkal.",
    motivation: "I live near Kottakunnu and know all local bus timings, heritage spots, and authentic Kozhikode/Malappuram food spots. Want to verify real spots and keep spam out.",
    status: "pending", // pending, approved, rejected
    appliedAt: "2026-03-20T10:15:00.000Z",
    reviewedBy: null,
    reviewedAt: null,
  },
  {
    id: "app-102",
    name: "Fathima Nihala",
    email: "fathima.tirur@example.com",
    regionId: "malappuram",
    regionName: "Tirur & Tanur Coastal",
    experience: "Active heritage walker and local history researcher.",
    motivation: "Tirur has Thunchan Parambu, historic beaches, and traditional textile stalls that tourists miss. I can verify accessibility, parking, and timings accurately.",
    status: "pending",
    appliedAt: "2026-03-22T14:40:00.000Z",
    reviewedBy: null,
    reviewedAt: null,
  },
  {
    id: "app-103",
    name: "Dr. Sujith Nambiar",
    email: "sujith.perinthalmanna@example.com",
    regionId: "malappuram",
    regionName: "Perinthalmanna & Angadipuram",
    experience: "Medical professional with deep knowledge of family and senior citizen friendly spots.",
    motivation: "Can verify wheelchair accessibility, clean drinking water availability, and accurate auto meter fares across Perinthalmanna junctions.",
    status: "pending",
    appliedAt: "2026-03-23T08:30:00.000Z",
    reviewedBy: null,
    reviewedAt: null,
  },
  {
    id: "app-104",
    name: "Mohammed Rashid",
    email: "rashid.nilambur@example.com",
    regionId: "malappuram",
    regionName: "Nilambur Forest Belt",
    experience: "Trek guide and eco-tourism enthusiast.",
    motivation: "Nilambur Teak Museum and Adyanpara falls need strict seasonal alerts and safety advice. I want to moderate nature and eco submissions.",
    status: "approved",
    appliedAt: "2026-03-10T11:00:00.000Z",
    reviewedBy: "superadmin",
    reviewedAt: "2026-03-12T16:20:00.000Z",
  },
];

const DEFAULT_ACTIVE_MODERATORS = [
  {
    id: "mod-1",
    name: "Mohammed Rashid",
    email: "rashid.nilambur@example.com",
    regionId: "malappuram",
    regionName: "Nilambur Forest Belt",
    role: "Area Moderator",
    status: "active",
    approvedAt: "2026-03-12T16:20:00.000Z",
    approvedBy: "superadmin",
    verifiedCount: 14,
    rejectedCount: 2,
  },
  {
    id: "mod-2",
    name: "Sreerag Menon",
    email: "sreerag.manjeri@example.com",
    regionId: "malappuram",
    regionName: "Manjeri & Kondotty",
    role: "Senior Moderator",
    status: "active",
    approvedAt: "2026-02-15T09:00:00.000Z",
    approvedBy: "superadmin",
    verifiedCount: 38,
    rejectedCount: 7,
  },
];

function loadApplications() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = localStorage.getItem(APPLICATIONS_KEY);
      if (stored) return JSON.parse(stored);
    }
  } catch (_) {}
  return DEFAULT_APPLICATIONS;
}

function saveApplications(apps) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
    }
  } catch (_) {}
}

function loadActiveModerators() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = localStorage.getItem(ACTIVE_MODERATORS_KEY);
      if (stored) return JSON.parse(stored);
    }
  } catch (_) {}
  return DEFAULT_ACTIVE_MODERATORS;
}

function saveActiveModerators(mods) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(ACTIVE_MODERATORS_KEY, JSON.stringify(mods));
    }
  } catch (_) {}
}

export const moderatorService = {
  /**
   * Get all moderator applications
   */
  getApplications(filterStatus = null) {
    const apps = loadApplications();
    if (!filterStatus || filterStatus === "all") return apps;
    return apps.filter((a) => a.status === filterStatus);
  },

  /**
   * Accept / Approve a moderator application
   */
  approveApplication(applicationId, reviewerAdmin = "admin") {
    const apps = loadApplications();
    const app = apps.find((a) => a.id === applicationId);
    if (!app) throw new Error("Application not found.");

    app.status = "approved";
    app.reviewedBy = reviewerAdmin;
    app.reviewedAt = new Date().toISOString();
    saveApplications(apps);

    // Add to active moderators if not already present
    const activeMods = loadActiveModerators();
    const alreadyExists = activeMods.some(
      (m) => m.email.toLowerCase() === app.email.toLowerCase()
    );

    if (!alreadyExists) {
      const newMod = {
        id: `mod-${Date.now()}`,
        name: app.name,
        email: app.email,
        regionId: app.regionId,
        regionName: app.regionName,
        role: "Area Moderator",
        status: "active",
        approvedAt: new Date().toISOString(),
        approvedBy: reviewerAdmin,
        verifiedCount: 0,
        rejectedCount: 0,
      };
      activeMods.push(newMod);
      saveActiveModerators(activeMods);
    }

    adminAuditService.logAction({
      action: "Moderator Application Approved",
      category: "MODERATOR",
      performedBy: reviewerAdmin,
      details: `Approved ${app.name} (${app.email}) for ${app.regionName}`,
    });

    return app;
  },

  /**
   * Reject a moderator application
   */
  rejectApplication(applicationId, reviewerAdmin = "admin", reason = "") {
    const apps = loadApplications();
    const app = apps.find((a) => a.id === applicationId);
    if (!app) throw new Error("Application not found.");

    app.status = "rejected";
    app.reviewedBy = reviewerAdmin;
    app.reviewedAt = new Date().toISOString();
    app.rejectReason = reason;
    saveApplications(apps);

    adminAuditService.logAction({
      action: "Moderator Application Rejected",
      category: "MODERATOR",
      performedBy: reviewerAdmin,
      details: `Rejected applicant ${app.name} (${app.email}). Reason: ${reason || "Not specified"}`,
    });

    return app;
  },

  /**
   * Get all active moderators
   */
  getActiveModerators() {
    return loadActiveModerators();
  },

  /**
   * Add a moderator directly
   */
  addModeratorDirectly({ name, email, regionId = "malappuram", regionName = "Malappuram", role = "Area Moderator" }, addedBy = "admin") {
    if (!name || !email) throw new Error("Name and Email are required.");

    const activeMods = loadActiveModerators();
    if (activeMods.some((m) => m.email.toLowerCase() === email.toLowerCase())) {
      throw new Error(`A moderator with email "${email}" is already registered.`);
    }

    const newMod = {
      id: `mod-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      regionId,
      regionName,
      role,
      status: "active",
      approvedAt: new Date().toISOString(),
      approvedBy: addedBy,
      verifiedCount: 0,
      rejectedCount: 0,
    };

    activeMods.push(newMod);
    saveActiveModerators(activeMods);

    adminAuditService.logAction({
      action: "Direct Moderator Added",
      category: "MODERATOR",
      performedBy: addedBy,
      details: `Added moderator ${newMod.name} (${newMod.email}) with role "${role}"`,
    });

    return newMod;
  },

  /**
   * Toggle moderator status (active/suspended)
   */
  toggleModeratorStatus(moderatorId, changedBy = "admin") {
    const activeMods = loadActiveModerators();
    const mod = activeMods.find((m) => m.id === moderatorId);
    if (!mod) throw new Error("Moderator not found.");

    mod.status = mod.status === "active" ? "suspended" : "active";
    saveActiveModerators(activeMods);

    adminAuditService.logAction({
      action: `Moderator ${mod.status === "active" ? "Reactivated" : "Suspended"}`,
      category: "MODERATOR",
      performedBy: changedBy,
      details: `Moderator ${mod.name} status updated to ${mod.status}.`,
    });

    return mod;
  },

  /**
   * Remove moderator
   */
  removeModerator(moderatorId, removedBy = "admin") {
    let activeMods = loadActiveModerators();
    const target = activeMods.find((m) => m.id === moderatorId);
    if (!target) throw new Error("Moderator not found.");

    activeMods = activeMods.filter((m) => m.id !== moderatorId);
    saveActiveModerators(activeMods);

    adminAuditService.logAction({
      action: "Moderator Permissions Revoked",
      category: "MODERATOR",
      performedBy: removedBy,
      details: `Removed moderator ${target.name} (${target.email}).`,
    });

    return true;
  },
};
