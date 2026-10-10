import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  placeService,
  reviewService,
  dishPriceService,
  placeUpdateService,
} from "../services";
import AddReviewForm from "../features/contributions/AddReviewForm.jsx";
import AddDishPriceForm from "../features/contributions/AddDishPriceForm.jsx";
import AccessUpdateForm from "../features/contributions/AccessUpdateForm.jsx";
import CorrectionRequestForm from "../features/contributions/CorrectionRequestForm.jsx";
import SubmissionStatusBadge from "../components/SubmissionStatusBadge.jsx";
import LoadingState from "../components/LoadingState.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function PlaceDetailPage() {
  const { placeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [dishPrices, setDishPrices] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [activeActionTab, setActiveActionTab] = useState("review");

  useEffect(() => {
    async function loadPlaceData() {
      if (!placeId) return;
      setLoading(true);
      try {
        const [placeData, revList, priceList, updList] = await Promise.all([
          placeService.getPlaceById(placeId),
          reviewService.getReviewsForPlace(placeId),
          dishPriceService.getDishPricesForPlace(placeId),
          placeUpdateService.getPlaceUpdates(placeId),
        ]);
        setPlace(placeData);
        setReviews(revList);
        setDishPrices(priceList);
        setUpdates(updList);
      } catch (err) {
        console.error(`Error loading details for place ${placeId}:`, err);
      } finally {
        setLoading(false);
      }
    }
    loadPlaceData();
  }, [placeId]);

  if (loading) {
    return (
      <div className="py-20">
        <LoadingState message="Loading place details & community content…" />
      </div>
    );
  }

  if (!place) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <EmptyState
          title="Place Not Found"
          description="The requested place could not be found or has not been published yet."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-monsoon-900 text-white p-6 sm:p-10 shadow-lg">
        {place.coverImage && (
          <img
            src={place.coverImage}
            alt={place.name}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-monsoon-700/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              {place.category}
            </span>
            <SubmissionStatusBadge status={place.status || "approved"} />
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
            {place.name}
          </h1>
          <p className="text-sm sm:text-base text-monsoon-100/90 leading-relaxed">
            {place.description}
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-monsoon-200 pt-2 border-t border-white/20">
            {place.address && <span>📍 {place.address}</span>}
            {place.townId && <span>🏘️ Locality: {place.townId}</span>}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Reviews, Dish Prices, Access Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Access & Road Conditions */}
          <div className="rounded-2xl border border-monsoon-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-monsoon-900 mb-3 flex items-center gap-2">
              <span>🛣️ Road Access & Terrain</span>
            </h2>
            {updates.length === 0 ? (
              <p className="text-xs text-monsoon-800/70">
                Paved road access. Help the community by reporting steep inclines or parking details below.
              </p>
            ) : (
              <div className="space-y-3">
                {updates.map((upd) => (
                  <div
                    key={upd.id}
                    className="rounded-xl bg-monsoon-50 p-3 text-xs border border-monsoon-100 space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-monsoon-900">
                        {upd.proposedChanges?.roadCondition || "Road Update"}
                      </span>
                      <SubmissionStatusBadge status={upd.status} />
                    </div>
                    {upd.proposedChanges?.parkingInfo && (
                      <p className="text-monsoon-800">
                        <strong>Parking:</strong> {upd.proposedChanges.parkingInfo}
                      </p>
                    )}
                    {upd.proposedChanges?.accessNotes && (
                      <p className="text-monsoon-800/80">
                        "{upd.proposedChanges.accessNotes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dish & Snack Prices */}
          <div className="rounded-2xl border border-monsoon-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-monsoon-900 mb-3 flex items-center gap-2">
              <span>🍛 Crowd-Sourced Food & Dish Prices</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-monsoon-100 text-monsoon-800">
                {dishPrices.length}
              </span>
            </h2>
            {dishPrices.length === 0 ? (
              <p className="text-xs text-monsoon-800/70">
                No dish prices reported yet for this spot.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dishPrices.map((dp) => (
                  <div
                    key={dp.id}
                    className="rounded-xl border border-monsoon-100 bg-monsoon-50/50 p-3 flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-monsoon-900">{dp.dishName}</h4>
                      <span className="text-xs text-monsoon-800/70 capitalize">{dp.category || "Snack"}</span>
                    </div>
                    <span className="font-display font-extrabold text-monsoon-700 text-base">
                      ₹{dp.price}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Community Reviews */}
          <div className="rounded-2xl border border-monsoon-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-monsoon-900 mb-4 flex items-center gap-2">
              <span>💬 Reviews & Community Experiences</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-monsoon-100 text-monsoon-800">
                {reviews.length}
              </span>
            </h2>

            {reviews.length === 0 ? (
              <p className="text-xs text-monsoon-800/70">
                Be the first local to leave a review for {place.name}!
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="border-b border-monsoon-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">{"⭐".repeat(rev.rating)}</span>
                          <span className="font-bold text-monsoon-900 text-sm">
                            {rev.title || "Local Review"}
                          </span>
                        </div>
                        <span className="text-xs text-monsoon-800/60 block mt-0.5">
                          by {rev.authorName || "Community Member"}
                        </span>
                      </div>
                      <SubmissionStatusBadge status={rev.status} />
                    </div>
                    <p className="mt-2 text-xs text-monsoon-800 leading-relaxed">
                      {rev.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Contribution Actions */}
        <div className="space-y-4">
          <div className="flex rounded-xl bg-monsoon-100 p-1 text-xs font-semibold">
            {[
              { id: "review", label: "💬 Review" },
              { id: "dish", label: "🍛 Dish Price" },
              { id: "access", label: "🛣️ Access" },
              { id: "correct", label: "🛠️ Correct" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveActionTab(tab.id)}
                className={[
                  "flex-1 rounded-lg py-1.5 text-center transition-all",
                  activeActionTab === tab.id
                    ? "bg-white text-monsoon-900 shadow-sm"
                    : "text-monsoon-800 hover:text-monsoon-900",
                ].join(" ")}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div>
            {activeActionTab === "review" && (
              <AddReviewForm
                placeId={place.id}
                placeName={place.name}
                onReviewAdded={(newRev) => setReviews((prev) => [newRev, ...prev])}
              />
            )}
            {activeActionTab === "dish" && (
              <AddDishPriceForm
                placeId={place.id}
                placeName={place.name}
                onPriceAdded={(newPrice) => setDishPrices((prev) => [newPrice, ...prev])}
              />
            )}
            {activeActionTab === "access" && (
              <AccessUpdateForm
                placeId={place.id}
                placeName={place.name}
                onSubmitted={(newUpd) => setUpdates((prev) => [newUpd, ...prev])}
              />
            )}
            {activeActionTab === "correct" && (
              <CorrectionRequestForm
                placeId={place.id}
                placeName={place.name}
                onSubmitted={(newUpd) => setUpdates((prev) => [newUpd, ...prev])}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
