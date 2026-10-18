import { useState, useEffect } from "react";
import { moderatorService } from "../../services";

export default function AdminModeratorsPage({ currentAdmin, onModeratorsUpdated }) {
  const [activeSubTab, setActiveSubTab] = useState("applications"); // 'applications' | 'active'
  const [applications, setApplications] = useState([]);
  const [activeModerators, setActiveModerators] = useState([]);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // Direct add form state
  const [directName, setDirectName] = useState("");
  const [directEmail, setDirectEmail] = useState("");
  const [directRegionName, setDirectRegionName] = useState("Malappuram Central");
  const [directRole, setDirectRole] = useState("Area Moderator");

  function refreshData() {
    try {
      const apps = moderatorService.getApplications(filterStatus);
      const mods = moderatorService.getActiveModerators();
      setApplications(apps);
      setActiveModerators(mods);
      onModeratorsUpdated?.();
    } catch (err) {
      console.error("Error loading moderator data:", err);
    }
  }

  useEffect(() => {
    refreshData();
  }, [filterStatus]);

  function handleApprove(applicationId, applicantName) {
    try {
      moderatorService.approveApplication(applicationId, currentAdmin?.username || "admin");
      setNotification({
        type: "success",
        message: `Accepted and approved "${applicantName}" as community moderator!`,
      });
      refreshData();
    } catch (err) {
      setNotification({ type: "error", message: err.message });
    }
  }

  function handleReject(applicationId, applicantName) {
    const reason = window.prompt(`Provide an optional rejection reason for ${applicantName}:`, "Application does not meet current regional coverage needs.");
    if (reason === null) return; // User cancelled prompt

    try {
      moderatorService.rejectApplication(applicationId, currentAdmin?.username || "admin", reason);
      setNotification({
        type: "info",
        message: `Application for "${applicantName}" was rejected.`,
      });
      refreshData();
    } catch (err) {
      setNotification({ type: "error", message: err.message });
    }
  }

  function handleDirectAdd(e) {
    e.preventDefault();
    try {
      moderatorService.addModeratorDirectly(
        {
          name: directName,
          email: directEmail,
          regionName: directRegionName,
          role: directRole,
        },
        currentAdmin?.username || "admin"
      );
      setNotification({
        type: "success",
        message: `Moderator "${directName}" successfully enrolled!`,
      });
      setDirectName("");
      setDirectEmail("");
      setShowAddModal(false);
      refreshData();
    } catch (err) {
      setNotification({ type: "error", message: err.message });
    }
  }

  function handleToggleStatus(modId) {
    try {
      const updated = moderatorService.toggleModeratorStatus(modId, currentAdmin?.username || "admin");
      setNotification({
        type: "info",
        message: `Moderator "${updated.name}" is now ${updated.status}.`,
      });
      refreshData();
    } catch (err) {
      setNotification({ type: "error", message: err.message });
    }
  }

  function handleRemove(modId, name) {
    if (!window.confirm(`Revoke moderator privileges for "${name}"?`)) return;
    try {
      moderatorService.removeModerator(modId, currentAdmin?.username || "admin");
      setNotification({
        type: "info",
        message: `Revoked privileges for "${name}".`,
      });
      refreshData();
    } catch (err) {
      setNotification({ type: "error", message: err.message });
    }
  }

  const pendingCount = applications.filter((a) => a.status === "pending").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Community Moderator Management
            </h1>
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold">
                {pendingCount} Pending Review
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review incoming moderator applications, accept candidates for local regions, and oversee the active moderator team.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Direct Enroll Moderator
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`rounded-xl p-3.5 text-xs sm:text-sm flex items-center justify-between border ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : notification.type === "error"
              ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
              : "bg-slate-800 border-slate-700 text-slate-200"
          }`}
        >
          <span>{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sub tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800">
        <button
          type="button"
          onClick={() => setActiveSubTab("applications")}
          className={`pb-3 text-xs sm:text-sm font-bold transition-colors relative ${
            activeSubTab === "applications"
              ? "text-emerald-400"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>Candidate Applications</span>
          {activeSubTab === "applications" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("active")}
          className={`pb-3 text-xs sm:text-sm font-bold transition-colors relative ${
            activeSubTab === "active"
              ? "text-emerald-400"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>Active Moderators ({activeModerators.length})</span>
          {activeSubTab === "active" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
          )}
        </button>
      </div>

      {/* VIEW 1: Candidate Applications */}
      {activeSubTab === "applications" && (
        <div className="space-y-4">
          {/* Status filters */}
          <div className="flex items-center gap-2">
            {["pending", "approved", "rejected", "all"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                  filterStatus === status
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {applications.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center text-slate-400 text-xs sm:text-sm">
              No moderator applications found under the "{filterStatus}" filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {applications.map((app) => {
                const isPending = app.status === "pending";
                return (
                  <div
                    key={app.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg space-y-4 hover:border-slate-700 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-white">
                            {app.name}
                          </h3>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                              app.status === "pending"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : app.status === "approved"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 mt-1">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect width="20" height="16" x="2" y="4" rx="2" />
                              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                            <span>{app.email}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                              <circle cx="12" cy="9" r="2.5" />
                            </svg>
                            <strong className="text-slate-300">{app.regionName}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      {isPending && (
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => handleApprove(app.id, app.name)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-1.5 text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Accept & Appoint
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(app.id, app.name)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold px-3 py-1.5 text-xs border border-rose-500/30 transition-all"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                        <span className="font-semibold text-slate-300 block mb-1">
                          Local Background & Knowledge:
                        </span>
                        <p className="text-slate-400 leading-relaxed">
                          {app.experience}
                        </p>
                      </div>

                      <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                        <span className="font-semibold text-slate-300 block mb-1">
                          Motivation to Moderate:
                        </span>
                        <p className="text-slate-400 leading-relaxed">
                          {app.motivation}
                        </p>
                      </div>
                    </div>

                    {app.reviewedBy && (
                      <div className="text-[11px] text-slate-400 bg-slate-950/30 px-3 py-1.5 rounded-lg border border-slate-800">
                        Reviewed by <strong className="text-slate-300">{app.reviewedBy}</strong> on{" "}
                        {new Date(app.reviewedAt).toLocaleString()}
                        {app.rejectReason && (
                          <span className="block mt-0.5 text-rose-400">
                            Reason: {app.rejectReason}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: Active Moderators Roster */}
      {activeSubTab === "active" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Moderator Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Assigned Area</th>
                  <th className="py-3 px-4">Role Title</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Activity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {activeModerators.map((mod) => (
                  <tr key={mod.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {mod.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-xs">
                      {mod.email}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-300">
                      {mod.regionName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[11px] font-semibold text-slate-300">
                        {mod.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          mod.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {mod.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      <span className="text-emerald-400 font-semibold">{mod.verifiedCount || 0}</span> verified /{" "}
                      <span className="text-rose-400 font-semibold">{mod.rejectedCount || 0}</span> rejected
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(mod.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          mod.status === "active"
                            ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300"
                            : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {mod.status === "active" ? "Suspend" : "Reactivate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(mod.id, mod.name)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 transition-colors"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Direct Add Moderator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                Direct Enroll Moderator
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDirectAdd} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={directName}
                  onChange={(e) => setDirectName(e.target.value)}
                  placeholder="e.g. Anand K. Nair"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={directEmail}
                  onChange={(e) => setDirectEmail(e.target.value)}
                  placeholder="anand@example.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Assigned Region
                </label>
                <input
                  type="text"
                  value={directRegionName}
                  onChange={(e) => setDirectRegionName(e.target.value)}
                  placeholder="e.g. Malappuram Town & Kottakkal"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Role Title
                </label>
                <select
                  value={directRole}
                  onChange={(e) => setDirectRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Area Moderator">Area Moderator</option>
                  <option value="Senior Moderator">Senior Moderator</option>
                  <option value="Regional Lead Moderator">Regional Lead Moderator</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
                >
                  Enrol Moderator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
