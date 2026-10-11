import { useState, useEffect } from "react";
import SubmitPlaceForm from "../features/contributions/SubmitPlaceForm.jsx";
import AddReviewForm from "../features/contributions/AddReviewForm.jsx";
import AddDishPriceForm from "../features/contributions/AddDishPriceForm.jsx";
import AccessUpdateForm from "../features/contributions/AccessUpdateForm.jsx";
import CorrectionRequestForm from "../features/contributions/CorrectionRequestForm.jsx";
import { placeService } from "../services";
import { useLocation } from "../context/LocationContext.jsx";

export default function ContributePage() {
  const { region } = useLocation();
  const [activeTab, setActiveTab] = useState("new_place");
  const [places, setPlaces] = useState([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState("");

  useEffect(() => {
    async function loadPlaces() {
      let list = await placeService.getPlaces({ regionId: region.id });
      if (!list || list.length === 0) {
        // Fallback to all approved places so review & dish price tabs remain functional
        list = await placeService.getPlaces();
      }
      setPlaces(list || []);
      if (list && list.length > 0) {
        setSelectedPlaceId(list[0].id);
      } else {
        setSelectedPlaceId("");
      }
    }
    loadPlaces();
  }, [region.id]);

  const selectedPlace = places.find((p) => p.id === selectedPlaceId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-monsoon-900 sm:text-5xl">
          Community Contributions
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-monsoon-800/80 max-w-xl">
          Help build a trusted local guide for <strong>{region.label}</strong>. Propose new spots, share honest reviews, report dish prices, or update road access.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-monsoon-200/70 pb-3 mb-6">
        {[
          { id: "new_place", label: "Propose New Place" },
          { id: "review", label: "Write Review" },
          { id: "dish_price", label: "Dish Price" },
          { id: "access", label: "Road & Access Update" },
          { id: "correction", label: "Suggest Correction" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              "rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-150",
              activeTab === tab.id
                ? "bg-monsoon-900 text-white shadow-xs border border-monsoon-900"
                : "bg-white border border-monsoon-200 text-monsoon-800 hover:border-monsoon-900 hover:text-monsoon-900",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Selector for existing place when not submitting a new place */}
      {activeTab !== "new_place" && (
        <div className="mb-6 rounded-xl bg-white border border-monsoon-200 p-4 shadow-sm">
          <label className="block text-xs font-semibold text-monsoon-800 mb-1">
            Select Existing Spot in {region.name}:
          </label>
          <select
            value={selectedPlaceId}
            onChange={(e) => setSelectedPlaceId(e.target.value)}
            className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-sm focus:border-monsoon-600 focus:outline-none bg-white"
          >
            {places.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.townId || p.districtId || "Local"})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Active Form */}
      <div>
        {activeTab === "new_place" && <SubmitPlaceForm />}
        {activeTab === "review" && (
          <AddReviewForm
            placeId={selectedPlaceId}
            placeName={selectedPlace?.name}
          />
        )}
        {activeTab === "dish_price" && (
          <AddDishPriceForm
            placeId={selectedPlaceId}
            placeName={selectedPlace?.name}
          />
        )}
        {activeTab === "access" && (
          <AccessUpdateForm
            placeId={selectedPlaceId}
            placeName={selectedPlace?.name}
          />
        )}
        {activeTab === "correction" && (
          <CorrectionRequestForm
            placeId={selectedPlaceId}
            placeName={selectedPlace?.name}
          />
        )}
      </div>
    </div>
  );
}
