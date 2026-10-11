import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { submissionService } from "../services";
import SubmissionStatusBadge from "../components/SubmissionStatusBadge.jsx";
import LoadingState from "../components/LoadingState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Button from "../components/Button.jsx";

export default function ModerationPage() {
  const { user, isModerator, toggleDevRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [modifyingId, setModifyingId] = useState(null);
  const [notes, setNotes] = useState({});
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    async function loadSubmissions() {
      setLoading(true);
      try {
        const list = await submissionService.getAllSubmissions(filterStatus || null);
        setSubmissions(list);
      } catch (err) {
        console.error("Error loading submissions for moderation:", err);
      } finally {
        setLoading(false);
      }
    }
    if (isModerator) {
      loadSubmissions();
    } else {
      setLoading(false);
    }
  }, [isModerator, filterStatus]);

  async function handleModerate(submissionId, newStatus) {
    if (!user) return;
    setModifyingId(submissionId);
    setNotification(null);
    try {
      const noteText = notes[submissionId] || "";
      const result = await submissionService.moderateSubmission(
        submissionId,
        newStatus,
        user.uid,
        noteText
      );
      // Refresh list
      const updatedList = await submissionService.getAllSubmissions(filterStatus || null);
      setSubmissions(updatedList);

      const statusLabels = {
        verified: "approved & verified",
        rejected: "rejected",
        needs_recheck: "flagged for recheck",
        community_reported: "marked as community reported",
      };
      setNotification({
        type: newStatus === "rejected" ? "error" : "success",
        message: `Contribution successfully ${statusLabels[newStatus] || newStatus}! It is now in the "${newStatus === 'verified' ? 'Verified' : newStatus}" tab.`,
        cloudSynced: result?.cloudSynced,
      });
    } catch (err) {
      alert(`Moderation failed: ${err.message}`);
    } finally {
      setModifyingId(null);
    }
  }

  if (!isModerator) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <EmptyState
          title="Access Restricted"
          description="Only authorized moderators can access the moderation panel."
        />
        <div className="mt-6 max-w-md mx-auto p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 text-left space-y-2">
          <p className="font-bold">How to get Moderator Access:</p>
          <p>
            In production, set <code>role: "admin"</code> or <code>role: "moderator"</code> on your user document in the Firestore <code>users</code> collection.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => toggleDevRole("admin")}
              className="px-4 py-2 rounded-lg bg-purple-700 text-white font-bold hover:bg-purple-800 transition-colors shadow-sm"
            >
              Enable Moderator Role (Dev Mode)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-monsoon-900">
          Moderation Dashboard
        </h1>
        <p className="mt-1 text-sm text-monsoon-800/80">
          Review community submissions, publish verified places, or flag for rechecking.
        </p>
      </div>

      {notification && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-center justify-between ${
            notification.type === "error"
              ? "bg-red-50 border-red-200 text-red-900"
              : "bg-emerald-50 border-emerald-200 text-emerald-900"
          }`}
        >
          <div>
            <p className="font-semibold">{notification.message}</p>
            {notification.cloudSynced === false && (
              <p className="mt-1 text-xs text-monsoon-700 font-normal">
                <span className="font-semibold">Dev Mode:</span> Moderated locally. To persist moderation directly in your cloud Firebase database, set <code>role: &quot;admin&quot;</code> on your user document in the Firebase Console Firestore <code>users</code> collection.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="ml-4 p-1 text-monsoon-500 hover:text-monsoon-900 transition-colors"
            aria-label="Dismiss message"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-monsoon-200 pb-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "pending", label: "Pending Review" },
            { id: "community_reported", label: "Community Reported" },
            { id: "verified", label: "Verified" },
            { id: "needs_recheck", label: "Needs Recheck" },
            { id: "rejected", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={[
                "rounded-xl px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-150",
                filterStatus === tab.id
                  ? "bg-monsoon-900 text-white shadow-xs border border-monsoon-900"
                  : "bg-white border border-monsoon-200 text-monsoon-800 hover:border-monsoon-900 hover:text-monsoon-900",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={async () => {
            setLoading(true);
            try {
              const list = await submissionService.getAllSubmissions(filterStatus || null);
              setSubmissions(list);
            } finally {
              setLoading(false);
            }
          }}
          className="text-xs px-3.5 py-1.5 rounded-xl border border-monsoon-200 bg-white text-monsoon-800 hover:bg-monsoon-100 font-semibold transition-colors"
        >
          Refresh Queue
        </button>
      </div>

      {loading ? (
        <div className="py-12">
          <LoadingState message="Fetching moderation queue…" />
        </div>
      ) : submissions.length === 0 ? (
        <EmptyState
          title="No submissions in queue"
          description={`There are currently no submissions with status "${filterStatus}".`}
        />
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="rounded-2xl border border-monsoon-200 bg-white p-5 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-monsoon-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-monsoon-900">
                    {sub.placeData.name}
                  </h3>
                  <p className="text-xs text-monsoon-800/70">
                    Category: <strong>{sub.placeData.category}</strong> • Locality:{" "}
                    <strong>{sub.townId || sub.districtId}</strong> • Contributor:{" "}
                    <span className="font-mono text-monsoon-600">{sub.userId}</span>
                  </p>
                </div>
                <SubmissionStatusBadge status={sub.status} />
              </div>

              <div className="text-xs text-monsoon-800 space-y-1">
                <p><strong>Description:</strong> {sub.placeData.description || "N/A"}</p>
                {sub.placeData.address && <p><strong>Address:</strong> {sub.placeData.address}</p>}
                {sub.placeData.roadCondition && (
                  <p><strong>Road Access:</strong> {sub.placeData.roadCondition}</p>
                )}
              </div>

              {/* Moderation Notes Input */}
              <div>
                <label className="block text-xs font-semibold text-monsoon-800 mb-1">
                  Moderator Notes / Feedback:
                </label>
                <input
                  type="text"
                  value={notes[sub.id] || ""}
                  onChange={(e) => setNotes({ ...notes, [sub.id]: e.target.value })}
                  placeholder="e.g. Verified road conditions & location via local scout"
                  className="w-full rounded-lg border border-monsoon-200 px-3 py-1.5 text-xs focus:border-monsoon-600 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-2 justify-end">
                <Button
                  size="sm"
                  variant="primary"
                  disabled={modifyingId === sub.id}
                  onClick={() => handleModerate(sub.id, "verified")}
                >
                  Approve & Verify
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={modifyingId === sub.id}
                  onClick={() => handleModerate(sub.id, "community_reported")}
                >
                  Publish as Community Reported
                </Button>

                <button
                  type="button"
                  disabled={modifyingId === sub.id}
                  onClick={() => handleModerate(sub.id, "needs_recheck")}
                  className="rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-800 hover:bg-purple-100"
                >
                  Needs Recheck
                </button>

                <button
                  type="button"
                  disabled={modifyingId === sub.id}
                  onClick={() => handleModerate(sub.id, "rejected")}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
