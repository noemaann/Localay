import { useState, useEffect } from "react";
import { adminAuditService } from "../../services";

export default function AdminLogsPage({ currentAdmin }) {
  const [logs, setLogs] = useState([]);
  const [filterCategory, setFilterCategory] = useState("ALL");
  const isSuperAdmin = currentAdmin?.role === "super_admin";

  function refreshLogs() {
    setLogs(adminAuditService.getLogs());
  }

  useEffect(() => {
    refreshLogs();
  }, []);

  function handleClearLogs() {
    if (!window.confirm("Are you sure you want to clear the audit history? This action is recorded.")) return;
    adminAuditService.clearLogs(currentAdmin?.username || "superadmin");
    refreshLogs();
  }

  const filteredLogs = logs.filter(
    (l) => filterCategory === "ALL" || l.category === filterCategory
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Security & Administrative Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete immutable ledger of all administrative logins, moderator approvals, content verification, and provisioning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "AUTH", "MODERATOR", "ADMIN_MGMT", "MODERATION", "SYSTEM"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold capitalize transition-all ${
                filterCategory === cat
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}

          {isSuperAdmin && (
            <button
              type="button"
              onClick={handleClearLogs}
              className="ml-2 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-colors"
            >
              Clear Log History
            </button>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Performed By</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase font-bold text-slate-300 border border-slate-700">
                      {log.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-400 font-semibold">
                    {log.performedBy}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 text-xs max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
