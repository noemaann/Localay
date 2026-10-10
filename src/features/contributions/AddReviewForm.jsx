import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { reviewService } from "../../services";
import SubmissionStatusBadge from "../../components/SubmissionStatusBadge.jsx";
import Button from "../../components/Button.jsx";
import AuthModal from "../../components/AuthModal.jsx";

export default function AddReviewForm({ placeId, placeName, onReviewAdded }) {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successReview, setSuccessReview] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!content.trim() || content.trim().length < 5) {
      setError("Review content must be at least 5 characters long.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const created = await reviewService.addReview({
        placeId,
        userId: user.uid,
        authorName: user.displayName || user.email?.split("@")[0] || "Community Contributor",
        rating,
        title: title.trim(),
        content: content.trim(),
      });

      setSuccessReview(created);
      onReviewAdded?.(created);
    } catch (err) {
      setError(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  }

  if (successReview) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-emerald-800">Review Submitted!</span>
          <SubmissionStatusBadge status={successReview.status} />
        </div>
        <p className="text-emerald-900 leading-relaxed mb-3">
          Your review for <strong>{placeName || "this spot"}</strong> has been submitted and is currently <strong>Pending Review</strong> before being published.
        </p>
        <button
          type="button"
          onClick={() => {
            setSuccessReview(null);
            setTitle("");
            setContent("");
            setRating(5);
          }}
          className="font-semibold text-emerald-700 underline hover:text-emerald-900"
        >
          Write another review
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
        Write a Community Review
      </h3>
      <p className="text-xs text-monsoon-800/70 mb-4">
        Share your experience visiting {placeName || "this spot"}.
      </p>

      {!user && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800 flex justify-between items-center">
          <span>🔒 Please sign in to write a review.</span>
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
        {/* Rating selector */}
        <div>
          <label className="block text-xs font-semibold text-monsoon-800 mb-1">
            Rating
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-xl focus:outline-none transition-transform hover:scale-110"
                aria-label={`Rate ${star} out of 5 stars`}
              >
                {star <= rating ? "⭐" : "☆"}
              </button>
            ))}
            <span className="ml-2 text-xs font-medium text-monsoon-800 self-center">
              ({rating} / 5)
            </span>
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="review-headline-input" className="block text-xs font-semibold text-monsoon-800 mb-1">
            Headline / Title (Optional)
          </label>
          <input
            id="review-headline-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Great evening vibe & easy parking"
            className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-xs focus:border-monsoon-600 focus:outline-none"
          />
        </div>

        {/* Content */}
        <div>
          <label htmlFor="review-content-area" className="block text-xs font-semibold text-monsoon-800 mb-1">
            Your Review <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="review-content-area"
            rows={3}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tell us about the access, food quality, crowds, or sunset views..."
            className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-xs focus:border-monsoon-600 focus:outline-none resize-none"
          />
        </div>

        <Button type="submit" disabled={submitting} size="sm" className="w-full">
          {submitting ? "Submitting Review…" : "Post Review"}
        </Button>
      </form>
    </div>
  );
}
