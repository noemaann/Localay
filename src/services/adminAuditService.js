/**
 * Admin Audit Logging Service
 * Tracks all administrative and moderation actions in Localay.
 */

const STORAGE_KEY = "localay_admin_audit_logs";

const DEFAULT_LOGS = [
  {
    id: "log-1",
    action: "System Initialized",
    category: "SYSTEM",
    performedBy: "system",
    details: "Localay administrative subsystem configured with default Super Admin credentials.",
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "log-2",
    action: "Moderation Queue Synced",
    category: "MODERATION",
    performedBy: "superadmin",
    details: "Checked incoming community submissions for Malappuram district.",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

function loadLogs() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch (_) {}
  return DEFAULT_LOGS;
}

function saveLogs(logs) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    }
  } catch (_) {}
}

let logsCache = loadLogs();

export const adminAuditService = {
  getLogs() {
    logsCache = loadLogs();
    return [...logsCache].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  logAction({ action, category = "GENERAL", performedBy = "admin", details = "" }) {
    logsCache = loadLogs();
    const newEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      action,
      category,
      performedBy,
      details,
      timestamp: new Date().toISOString(),
    };
    logsCache.unshift(newEntry);
    if (logsCache.length > 200) logsCache = logsCache.slice(0, 200);
    saveLogs(logsCache);
    return newEntry;
  },

  clearLogs(performedBy = "superadmin") {
    logsCache = [];
    saveLogs(logsCache);
    this.logAction({
      action: "Audit Logs Cleared",
      category: "SYSTEM",
      performedBy,
      details: "Audit history cleared by Super Admin.",
    });
    return logsCache;
  },
};
