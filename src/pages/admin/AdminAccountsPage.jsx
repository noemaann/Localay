import { useState, useEffect } from "react";
import { adminAuthService } from "../../services";

export default function AdminAccountsPage({ currentAdmin }) {
  const [admins, setAdmins] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("admin");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedAdminForPassword, setSelectedAdminForPassword] = useState(null);
  const [changedPassword, setChangedPassword] = useState("");

  const isSuperAdmin = currentAdmin?.role === "super_admin";

  function refreshAdmins() {
    try {
      const list = adminAuthService.getAllAdmins();
      setAdmins(list);
    } catch (err) {
      console.error("Error loading admins:", err);
    }
  }

  useEffect(() => {
    refreshAdmins();
  }, []);

  function handleCreateAdmin(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      adminAuthService.addAdmin({
        username: newUsername,
        password: newPassword,
        name: newName,
        role: newRole,
      });

      setSuccess(`Admin account "${newUsername}" created successfully!`);
      setNewUsername("");
      setNewPassword("");
      setNewName("");
      setNewRole("admin");
      setShowAddModal(false);
      refreshAdmins();
    } catch (err) {
      setError(err.message || "Failed to create admin account.");
    }
  }

  function handleToggleStatus(username) {
    setError("");
    setSuccess("");
    try {
      const updated = adminAuthService.toggleAdminStatus(username);
      setSuccess(`Admin "${username}" is now ${updated.status}.`);
      refreshAdmins();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleDelete(username) {
    if (!window.confirm(`Are you sure you want to delete admin "${username}"? This action cannot be undone.`)) {
      return;
    }
    setError("");
    setSuccess("");
    try {
      adminAuthService.deleteAdmin(username);
      setSuccess(`Admin "${username}" has been removed.`);
      refreshAdmins();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleUpdatePassword(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      adminAuthService.updateAdminPassword(selectedAdminForPassword.username, changedPassword);
      setSuccess(`Password updated for admin "${selectedAdminForPassword.username}".`);
      setSelectedAdminForPassword(null);
      setChangedPassword("");
      refreshAdmins();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!isSuperAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="h-16 w-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl mb-4">
          🔒
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Super Admin Access Required</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Only the master Super Admin can provision new admin IDs, reset credentials, or manage administrative privileges.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Admin Provisioning & Credentials
            </h1>
            <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
              Super Admin Only
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create and manage administrative IDs and passwords that control Localay operations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setSuccess("");
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Admin ID
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs sm:text-sm text-rose-300 flex items-center gap-2">
          <span>⚠️ {error}</span>
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-xs sm:text-sm text-emerald-300 flex items-center gap-2">
          <span>✓ {success}</span>
        </div>
      )}

      {/* Admin Accounts Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <span>Registered Admin Accounts</span>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300 font-mono">
              {admins.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Admin ID / Username</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Password</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {admins.map((adm) => {
                const isRoot = adm.username.toLowerCase() === "superadmin";
                return (
                  <tr key={adm.username} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white flex items-center gap-2">
                      {adm.username}
                      {isRoot && (
                        <span title="Master Super Admin" className="text-amber-400 text-xs">👑</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium">{adm.name}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          adm.role === "super_admin"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                        }`}
                      >
                        {adm.role === "super_admin" ? "Super Admin" : "Admin"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-300">
                        ••••••••
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          adm.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {adm.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">
                      {adm.createdAt ? new Date(adm.createdAt).toLocaleDateString() : "Initial"}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedAdminForPassword(adm)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                      >
                        Change Pass
                      </button>

                      {!isRoot && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(adm.username)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              adm.status === "active"
                                ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300"
                                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300"
                            }`}
                          >
                            {adm.status === "active" ? "Deactivate" : "Activate"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(adm.username)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 transition-colors"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Add New Admin Credentials</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Admin ID / Username *
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. malappuram_admin"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Unique identifier used by this admin to sign in.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Initial Password *
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Full Name / Alias
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Rahul C. (Operations)"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="admin">Administrator (Moderation & Content)</option>
                  <option value="super_admin">Super Administrator (Full Provisioning)</option>
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
                  Save & Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {selectedAdminForPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Reset Password for {selectedAdminForPassword.username}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter a new secure password for this admin.
            </p>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={changedPassword}
                  onChange={(e) => setChangedPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAdminForPassword(null);
                    setChangedPassword("");
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
