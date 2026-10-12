import { useState, useEffect } from "react";
import { submissionService } from "../../services";

export default function AdminSubmissionsPage({ currentAdmin, onSubmissionsUpdated }) {
  const [submissions, setSubmissions] = useState([]);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [notes, setNotes] = useState({});
  const [notification, setNotification] = useState(null);

  async function loadSubmissions() {
    setLoading(true);
    try {
      const list = await submissionService.getAllSubmissions(filterStatus === "all" ? null : filterStatus);
      setSubmissions(list);
      onSubmissionsUpdated?.();
    } catch (err) {
      console.error("Error loading submissions:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubmissions();
  }, [filterStatus]);

  async function handleModerate(subId, newStatus) {
    setProcessingId(subId);
    setNotification(null);
    try {
      const note = notes[subId] || "";
      const result = await submissionService.moderateSubmission(
        subId,
        newStatus,
        currentAdmin?.username || "admin",
        note
      );

      setNotification({
        type: newStatus === "rejected" ? "error" : "success",
        message: `Submission marked as "${newStatus}" successfully!`,
      });
      loadSubmissions();
    } catch (err) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Community Content Moderation
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Validate community place proposals, dish pricing, accessibility tags, and corrections before publishing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["pending", "verified", "community_reported", "rejected", "needs_recheck", "all"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold capitalize transition-all ${
                filterStatus === st
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {notification && (
        <div
          className={`rounded-xl p-3.5 text-xs sm:text-sm flex items-center justify-between border ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <span>{notification.message}</span>
          <button type="button" onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs sm:text-sm">
          Loading submission queue...
        </div>
      ) : submissions.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center text-slate-400 text-xs sm:text-sm">
          No submissions found for status "{filterStatus}".
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {submissions.map((sub) => {
            const isPending = sub.status === "pending";
            return (
              <div
                key={sub.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg space-y-4 hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">
                        {sub.name || sub.title || `Submission #${sub.id.substring(0, 8)}`}
                      </h3>
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase font-bold text-slate-300 border border-slate-700">
                        {sub.type || "place_proposal"}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] uppercase font-bold ${
                          sub.status === "pending"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : sub.status === "verified"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 mt-1.5">
                      <span>📍 Town: <strong className="text-slate-300">{sub.town || sub.locality || "Malappuram"}</strong></span>
                      <span>Category: <strong className="text-slate-300">{sub.category || "General"}</strong></span>
                      {sub.contributorName && (
                        <span>Contributor: <strong className="text-slate-300">{sub.contributorName}</strong></span>
                      )}
                      <span>🕒 {new Date(sub.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Moderation quick buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={processingId === sub.id}
                      onClick={() => handleModerate(sub.id, "verified")}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50"
                    >
                      ✓ Verify & Publish
                    </button>
                    <button
                      type="button"
                      disabled={processingId === sub.id}
                      onClick={() => handleModerate(sub.id, "community_reported")}
                      className="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      Community Tag
                    </button>
                    <button
                      type="button"
                      disabled={processingId === sub.id}
                      onClick={() => handleModerate(sub.id, "needs_recheck")}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      Flag Recheck
                    </button>
                    <button
                      type="button"
                      disabled={processingId === sub.id}
                      onClick={() => handleModerate(sub.id, "rejected")}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {/* Details snippet */}
                {sub.description && (
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
                    "{sub.description}"
                  </p>
                )}

                {/* Moderator note input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={notes[sub.id] || ""}
                    onChange={(e) => setNotes({ ...notes, [sub.id]: e.target.value })}
                    placeholder="Add internal moderator note or verification reason..."
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                  {sub.moderatorNote && (
                    <span className="text-[11px] text-slate-400 italic">
                      Previous Note: {sub.moderatorNote}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
