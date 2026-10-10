import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  submissionService,
  reviewService,
  placeUpdateService,
} from "../services";
import SubmissionStatusBadge from "../components/SubmissionStatusBadge.jsx";
import LoadingState from "../components/LoadingState.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function MyContributionsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    async function loadUserData() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const [subList, revList, updList] = await Promise.all([
          submissionService.getUserSubmissions(user.uid),
          reviewService.getUserReviews(user.uid),
          placeUpdateService.getUserPlaceUpdates(user.uid),
        ]);
        setSubmissions(subList);
        setReviews(revList);
        setUpdates(updList);
      } catch (err) {
        console.error("Error loading user contributions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <EmptyState
          title="Sign in to view your contributions"
          description="Log in to track your submitted places, reviews, dish prices, and moderation status."
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-20">
        <LoadingState message="Loading your community contributions…" />
      </div>
    );
  }

  const totalContributions = submissions.length + reviews.length + updates.length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-monsoon-900">
          My Contributions
        </h1>
        <p className="mt-1 text-sm text-monsoon-800/80">
          Track moderation status for your submitted places, reviews, and updates ({totalContributions} total).
        </p>
      </div>

      {totalContributions === 0 ? (
        <EmptyState
          title="No contributions yet"
          description="You haven't submitted any places or reviews yet. Start sharing local discovery info today!"
        />
      ) : (
        <div className="space-y-8">
          {/* Submitted Places */}
          {submissions.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-monsoon-900 mb-3 flex items-center gap-2">
                <span>📍 Proposed Places</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-monsoon-100 text-monsoon-800">
                  {submissions.length}
                </span>
              </h2>
              <div className="space-y-3">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="rounded-xl border border-monsoon-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <h3 className="font-semibold text-monsoon-900 text-sm">
                        {sub.placeData.name}
                      </h3>
                      <p className="text-xs text-monsoon-800/70 mt-0.5">
                        Category: {sub.placeData.category} • Locality: {sub.townId || sub.districtId}
                      </p>
                      {sub.moderationNotes && (
                        <p className="mt-2 text-xs bg-amber-50 p-2 rounded text-amber-900">
                          <strong>Moderator Note:</strong> {sub.moderationNotes}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0">
                      <SubmissionStatusBadge status={sub.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submitted Reviews */}
          {reviews.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-monsoon-900 mb-3 flex items-center gap-2">
                <span>💬 Community Reviews</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-monsoon-100 text-monsoon-800">
                  {reviews.length}
                </span>
              </h2>
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-xl border border-monsoon-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{"⭐".repeat(rev.rating)}</span>
                        <h3 className="font-semibold text-monsoon-900 text-sm">
                          {rev.title || "Review"}
                        </h3>
                      </div>
                      <p className="text-xs text-monsoon-800 mt-1 line-clamp-2">
                        "{rev.content}"
                      </p>
                    </div>
                    <div className="shrink-0">
                      <SubmissionStatusBadge status={rev.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Place Updates */}
          {updates.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-monsoon-900 mb-3 flex items-center gap-2">
                <span>🛠️ Road Access & Corrections</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-monsoon-100 text-monsoon-800">
                  {updates.length}
                </span>
              </h2>
              <div className="space-y-3">
                {updates.map((upd) => (
                  <div
                    key={upd.id}
                    className="rounded-xl border border-monsoon-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <h3 className="font-semibold text-monsoon-900 text-sm capitalize">
                        Type: {upd.type.replace("_", " ")}
                      </h3>
                      <p className="text-xs text-monsoon-800/70 mt-0.5">
                        Place: {upd.placeId}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <SubmissionStatusBadge status={upd.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
