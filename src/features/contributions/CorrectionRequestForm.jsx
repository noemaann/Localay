import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { placeUpdateService } from "../../services";
import SubmissionStatusBadge from "../../components/SubmissionStatusBadge.jsx";
import Button from "../../components/Button.jsx";
import AuthModal from "../../components/AuthModal.jsx";

export default function CorrectionRequestForm({ placeId, placeName, onSubmitted }) {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [correctionType, setCorrectionType] = useState("Updated Timings");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!details.trim()) {
      setError("Please describe the correction or updated information.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const created = await placeUpdateService.submitPlaceUpdate({
        placeId,
        type: "correction",
        userId: user.uid,
        proposedChanges: {
          correctionType,
          details: details.trim(),
        },
      });

      setSuccess(created);
      onSubmitted?.(created);
    } catch (err) {
      setError(err.message || "Failed to submit correction request.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-amber-900">Correction Request Submitted</span>
          <SubmissionStatusBadge status={success.status} />
        </div>
        <p className="text-amber-900 leading-relaxed mb-3">
          Your correction for <strong>{placeName || "this spot"}</strong> is currently <strong>Pending Review</strong>.
        </p>
        <button
          type="button"
          onClick={() => {
            setSuccess(null);
            setDetails("");
          }}
          className="font-semibold text-amber-700 underline hover:text-amber-900"
        >
          Submit another correction
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
        Suggest a Correction
      </h3>
      <p className="text-xs text-monsoon-800/70 mb-4">
        Report incorrect hours, phone number, closed status, or wrong location for {placeName || "this spot"}.
      </p>

      {!user && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800 flex justify-between items-center">
          <span>Sign in to submit place corrections.</span>
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
        <div>
          <label htmlFor="correction-type-select" className="block text-xs font-semibold text-monsoon-800 mb-1">
            Correction Issue Type
          </label>
          <select
            id="correction-type-select"
            value={correctionType}
            onChange={(e) => setCorrectionType(e.target.value)}
            className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-xs focus:border-monsoon-600 focus:outline-none bg-white"
          >
            <option value="Updated Timings">Updated Operating Timings</option>
            <option value="Permanently Closed">Permanently Closed</option>
            <option value="Incorrect Location / Map Pin">Incorrect Location / Map Pin</option>
            <option value="Updated Contact Phone">Updated Contact Phone</option>
            <option value="Wrong Category">Wrong Category</option>
            <option value="Other Issue">Other Issue</option>
          </select>
        </div>

        <div>
          <label htmlFor="correction-details-area" className="block text-xs font-semibold text-monsoon-800 mb-1">
            Correction Explanation <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="correction-details-area"
            rows={3}
            required
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="e.g. Park now opens at 9:00 AM instead of 10:00 AM. Entry fee increased to ₹25."
            className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-xs focus:border-monsoon-600 focus:outline-none resize-none"
          />
        </div>

        <Button type="submit" disabled={submitting} size="sm" className="w-full">
          {submitting ? "Submitting…" : "Submit Correction Request"}
        </Button>
      </form>
    </div>
  );
}
