import { useState, useEffect } from "react";
import {
  submissionService,
  moderatorService,
  adminAuthService,
  adminAuditService,
  placeService,
  fareService,
} from "../../services";

export default function AdminDashboard({ onNavigateTab, currentAdmin }) {
  const [stats, setStats] = useState({
    pendingSubmissions: 0,
    verifiedSubmissions: 0,
    totalPlaces: 0,
    activeModerators: 0,
    pendingApplications: 0,
    totalAdmins: 0,
    fareReportsCount: 0,
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const [pendingSubs, verifiedSubs, places, apps, mods, admins, fareReports, logs] =
          await Promise.all([
            submissionService.getAllSubmissions("pending"),
            submissionService.getAllSubmissions("verified"),
            placeService.getPlaces({ regionId: "malappuram" }),
            moderatorService.getApplications("pending"),
            moderatorService.getActiveModerators(),
            adminAuthService.getAllAdmins(),
            fareService.getFareReports ? fareService.getFareReports() : [],
            adminAuditService.getLogs().slice(0, 5),
          ]);

        setStats({
          pendingSubmissions: pendingSubs?.length || 0,
          verifiedSubmissions: verifiedSubs?.length || 0,
          totalPlaces: places?.length || 0,
          activeModerators: mods?.length || 0,
          pendingApplications: apps?.length || 0,
          totalAdmins: admins?.length || 0,
          fareReportsCount: fareReports?.length || 0,
        });
        setRecentLogs(logs);
      } catch (err) {
        console.error("Error loading dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 mb-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Administrative Operational Control
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {currentAdmin?.name || currentAdmin?.username}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Localay Kerala Discovery Platform. Currently governing region:{" "}
              <strong className="text-slate-200">Malappuram District (Kerala)</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              type="button"
              onClick={() => onNavigateTab("moderators")}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
            >
              Moderator Queue
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab("submissions")}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              Review Submissions
            </button>
          </div>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Pending Submissions */}
        <div
          onClick={() => onNavigateTab("submissions")}
          className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-md hover:border-amber-500/40 cursor-pointer transition-all"
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Pending Submissions
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-400">
            {stats.pendingSubmissions}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">Needs moderation</div>
        </div>

        {/* Pending Moderator Applications */}
        <div
          onClick={() => onNavigateTab("moderators")}
          className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-md hover:border-emerald-500/40 cursor-pointer transition-all"
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Mod Applications
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-400">
            {stats.pendingApplications}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">Candidates waiting</div>
        </div>

        {/* Active Moderators */}
        <div
          onClick={() => onNavigateTab("moderators")}
          className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-md hover:border-slate-700 cursor-pointer transition-all"
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Moderators
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-white">
            {stats.activeModerators}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">Field reviewers</div>
        </div>

        {/* Total Places in DB */}
        <div
          onClick={() => onNavigateTab("places")}
          className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-md hover:border-slate-700 cursor-pointer transition-all"
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Live Places
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-white">
            {stats.totalPlaces}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">Verified & reported</div>
        </div>

        {/* Admin Accounts */}
        <div
          onClick={() => onNavigateTab("admins")}
          className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-md hover:border-amber-500/40 cursor-pointer transition-all"
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Admin Accounts
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-300">
            {stats.totalAdmins}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">Super + Admins</div>
        </div>

        {/* AutoFare Reports */}
        <div
          onClick={() => onNavigateTab("autofare")}
          className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-md hover:border-slate-700 cursor-pointer transition-all"
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            AutoFare Reports
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-white">
            {stats.fareReportsCount}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">Crowdsourced fares</div>
        </div>
      </div>

      {/* Action Required Banner for Moderator Applications */}
      {stats.pendingApplications > 0 && (
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {stats.pendingApplications} Community Member{stats.pendingApplications > 1 ? "s" : ""} Applied for Moderator Access
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Local volunteers in Malappuram, Tirur, and Perinthalmanna are waiting for your approval to verify spots.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab("moderators")}
            className="rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 text-xs shadow-md transition-all self-start sm:self-auto"
          >
            Review Candidates Now
          </button>
        </div>
      )}

      {/* Two Column Section: System Status & Recent Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System & Governance Overview */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>System Architecture & Regional Governance</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Primary Domain / Subdomain:</span>
              <span className="font-mono text-emerald-400 font-semibold">admin.localay / /admin</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Primary Region Coverage:</span>
              <span className="text-slate-200 font-semibold">Malappuram District (12+ Municipalities)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Super Admin Authentication:</span>
              <span className="text-emerald-400 font-semibold">Enabled (ID: superadmin)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Admin Account Provisioning:</span>
              <span className="text-amber-300 font-semibold">Active (Super Admin Privileged)</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400">Database Layer:</span>
              <span className="text-slate-200 font-semibold">Firestore Cloud + Offline Local Persistence</span>
            </div>
          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>Recent Administrative Audit Trail</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab("logs")}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              View Full Logs →
            </button>
          </div>

          <div className="space-y-2.5">
            {recentLogs.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center">No recent audit logs</div>
            ) : (
              recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{log.action}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px]">{log.details}</div>
                  <div className="text-[10px] text-emerald-400 font-mono">
                    by: {log.performedBy}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
