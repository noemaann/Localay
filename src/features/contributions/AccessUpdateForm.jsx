import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { placeUpdateService } from "../../services";
import SubmissionStatusBadge from "../../components/SubmissionStatusBadge.jsx";
import Button from "../../components/Button.jsx";
import AuthModal from "../../components/AuthModal.jsx";

export default function AccessUpdateForm({ placeId, placeName, onSubmitted }) {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [roadCondition, setRoadCondition] = useState("Paved Road");
  const [parkingInfo, setParkingInfo] = useState("Dedicated Parking");
  const [accessNotes, setAccessNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!accessNotes.trim()) {
      setError("Please describe access details or road conditions.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const created = await placeUpdateService.submitPlaceUpdate({
        placeId,
        type: "access_road",
        userId: user.uid,
        proposedChanges: {
          roadCondition,
          parkingInfo,
          accessNotes: accessNotes.trim(),
        },
      });

      setSuccess(created);
      onSubmitted?.(created);
    } catch (err) {
      setError(err.message || "Failed to submit access update.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-amber-900">Access Update Submitted</span>
          <SubmissionStatusBadge status={success.status} />
        </div>
        <p className="text-amber-900 leading-relaxed mb-3">
          Your access and road condition update for <strong>{placeName || "this spot"}</strong> is currently <strong>Pending Review</strong>.
        </p>
        <button
          type="button"
          onClick={() => {
            setSuccess(null);
            setAccessNotes("");
          }}
          className="font-semibold text-amber-700 underline hover:text-amber-900"
        >
          Submit another update
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-monsoon-200 bg-white p-5 shadow-sm">
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />

      <h3 className="text-base font-bold text-monsoon-900 mb-1">
        Update Access & Road Conditions
      </h3>
      <p className="text-xs text-monsoon-800/70 mb-4">
        Report road terrain, 4x4 requirement, or parking details for {placeName || "this spot"}.
      </p>

      {!user && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800 flex justify-between items-center">
          <span>🔒 Sign in to submit access updates.</span>
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="font-bold underline text-amber-900"
          >
            Sign In
          </button>
        </div>
      )}

      {error && (
        <div className="mb-3 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="road-condition-select" className="block text-xs font-semibold text-monsoon-800 mb-1">
              Road Condition
            </label>
            <select
              id="road-condition-select"
              value={roadCondition}
              onChange={(e) => setRoadCondition(e.target.value)}
              className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-xs focus:border-monsoon-600 focus:outline-none bg-white"
            >
              <option value="Paved Road">Paved Road</option>
              <option value="Gravel / Dirt Road">Gravel / Dirt Road</option>
              <option value="Steep Incline">Steep Incline</option>
              <option value="Narrow Pass">Narrow Pass</option>
              <option value="4x4 Vehicle Required">4x4 Vehicle Required</option>
            </select>
          </div>

          <div>
            <label htmlFor="parking-info-select" className="block text-xs font-semibold text-monsoon-800 mb-1">
              Parking Options
            </label>
            <select
              id="parking-info-select"
              value={parkingInfo}
              onChange={(e) => setParkingInfo(e.target.value)}
              className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-xs focus:border-monsoon-600 focus:outline-none bg-white"
            >
              <option value="Dedicated Parking">Dedicated Parking Lot</option>
              <option value="Roadside Street Parking">Roadside Street Parking</option>
              <option value="No Parking Available">No Parking Available</option>
              <option value="Paid Parking Lot">Paid Parking Lot</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="access-notes-area" className="block text-xs font-semibold text-monsoon-800 mb-1">
            Access Notes <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="access-notes-area"
            rows={3}
            required
            value={accessNotes}
            onChange={(e) => setAccessNotes(e.target.value)}
            placeholder="e.g. Last 500m is narrow mud track. Avoid during heavy monsoons unless on foot."
            className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-xs focus:border-monsoon-600 focus:outline-none resize-none"
          />
        </div>

        <Button type="submit" disabled={submitting} size="sm" className="w-full">
          {submitting ? "Submitting…" : "Report Access Update"}
        </Button>
      </form>
    </div>
  );
}
