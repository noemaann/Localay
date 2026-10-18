import { useState, useMemo } from "react";
import { CATEGORIES } from "../../data/categories.js";
import { buildItinerary } from "../../services/itineraryService.js";
import Button from "../../components/Button.jsx";
import CategoryIcon from "../../components/CategoryIcon.jsx";

export default function ItineraryPlanner({ places = [], regionName = "Malappuram", onClose }) {
  // 1. Filter Preferences
  const [selectedCategories, setSelectedCategories] = useState([
    "food",
    "nature",
    "viewpoints",
  ]);
  const [budgetTier, setBudgetTier] = useState("moderate"); // 'budget', 'moderate', 'splurge'
  const [maxHours, setMaxHours] = useState(5);
  const [userLocation, setUserLocation] = useState(null);
  const [detectingGps, setDetectingGps] = useState(false);
  const [itineraryResult, setItineraryResult] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Available categories in the current pool of places
  const availableCategories = useMemo(() => {
    const set = new Set();
    places.forEach((p) => {
      const cat = p.category || p.categoryId;
      if (cat) set.add(cat);
    });
    return CATEGORIES.filter((c) => set.size === 0 || set.has(c.id));
  }, [places]);

  function toggleCategory(catId) {
    setSelectedCategories((prev) => {
      if (prev.includes(catId)) {
        // Keep at least 1 category selected
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== catId);
      } else {
        return [...prev, catId];
      }
    });
  }

  function handleDetectGps() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setDetectingGps(false);
      },
      (err) => {
        console.warn("GPS error:", err);
        setDetectingGps(false);
        alert("Could not detect GPS location. Trip will start from the first scenic spot.");
      },
      { timeout: 8000 }
    );
  }

  function handleGenerate() {
    const plan = buildItinerary({
      places,
      selectedCategories,
      budgetTier,
      maxHours,
      userCoordinates: userLocation,
    });
    setItineraryResult(plan);
    setHasGenerated(true);
  }

  // Format minutes into "Xh Ym"
  function formatMinutes(min) {
    if (!min) return "0 min";
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} hr`;
    return `${h}h ${m}m`;
  }

  return (
    <div className="rounded-2xl border border-monsoon-200 bg-white shadow-xl overflow-hidden transition-all duration-300">
      {/* Header Banner */}
      <div className="bg-monsoon-900 px-6 py-5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-monsoon-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-monsoon-800 text-monsoon-200 text-xs font-semibold mb-2 border border-monsoon-700">
            <span>Smart Trip & Day Planner</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Custom Itinerary for {regionName}
          </h2>
          <p className="text-xs text-monsoon-200/90 mt-1">
            Choose your preferred spot types, budget, and time. We calculate accurate GPS travel times and sequence the stops for you.
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="self-start sm:self-center rounded-lg px-2.5 py-1 text-xs font-medium text-monsoon-200 hover:text-white hover:bg-monsoon-800 transition-colors"
            title="Close planner"
          >
            Close
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Step 1: Select Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-monsoon-100">
          {/* 1. Types of Spots */}
          <div>
            <label className="block text-xs font-mono font-bold text-monsoon-900 uppercase tracking-wider mb-2">
              1. Types of Spots ({selectedCategories.length})
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableCategories.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-monsoon-900 text-white shadow-xs ring-1 ring-monsoon-900"
                        : "bg-monsoon-50 text-monsoon-800 hover:bg-monsoon-100 border border-monsoon-200"
                    }`}
                  >
                    <CategoryIcon categoryId={cat.id} className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-monsoon-700"}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-monsoon-800/60">
              Select what you want to experience today (at least 1).
            </p>
          </div>

          {/* 2. Budget Level */}
          <div>
            <label className="block text-xs font-mono font-bold text-monsoon-900 uppercase tracking-wider mb-2">
              2. Budget Preference
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                {
                  id: "budget",
                  title: "Budget-Friendly",
                  desc: "Under ₹300 / person (Tea, street snacks & open spots)",
                },
                {
                  id: "moderate",
                  title: "Moderate Balance",
                  desc: "₹300 – ₹800 / person (Authentic meals & entry tickets)",
                },
                {
                  id: "splurge",
                  title: "Splurge & Premium",
                  desc: "₹800+ / person (Full dining, private viewpoints & experiences)",
                },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBudgetTier(b.id)}
                  className={`text-left rounded-xl p-2.5 border transition-all duration-150 ${
                    budgetTier === b.id
                      ? "border-monsoon-900 bg-monsoon-50 ring-1 ring-monsoon-900"
                      : "border-monsoon-200 bg-white hover:bg-monsoon-50/50"
                  }`}
                >
                  <div className="text-xs font-bold text-monsoon-900">{b.title}</div>
                  <div className="text-[10px] text-monsoon-800/70">{b.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Time Allocated */}
          <div>
            <label className="block text-xs font-mono font-bold text-monsoon-900 uppercase tracking-wider mb-2">
              3. Time to Spend: {maxHours} Hours
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                {[
                  { hours: 3, label: "3h Quick" },
                  { hours: 5, label: "5h Half Day" },
                  { hours: 8, label: "8h Full Day" },
                ].map((opt) => (
                  <button
                    key={opt.hours}
                    type="button"
                    onClick={() => setMaxHours(opt.hours)}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-semibold border transition-all ${
                      maxHours === opt.hours
                        ? "bg-monsoon-900 text-white border-monsoon-900 shadow-xs"
                        : "bg-white border-monsoon-200 text-monsoon-800 hover:bg-monsoon-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Slider for precision */}
              <div>
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="0.5"
                  value={maxHours}
                  onChange={(e) => setMaxHours(parseFloat(e.target.value))}
                  className="w-full accent-monsoon-900 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-monsoon-800/60 font-medium">
                  <span>2 hours</span>
                  <span>5 hours</span>
                  <span>10 hours</span>
                </div>
              </div>

              {/* Optional Starting GPS */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleDetectGps}
                  disabled={detectingGps}
                  className={`w-full py-1.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    userLocation
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                      : "bg-monsoon-50 border-monsoon-200 text-monsoon-800 hover:bg-monsoon-100"
                  }`}
                >
                  <span>
                    {detectingGps
                      ? "Detecting location…"
                      : userLocation
                      ? `Start near my GPS (${userLocation.lat.toFixed(2)}, ${userLocation.lng.toFixed(2)})`
                      : "Use My Current GPS as Start Point"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            type="button"
            onClick={handleGenerate}
            className="px-8 py-3 text-xs font-bold shadow-xs bg-monsoon-900 hover:bg-monsoon-800 text-white flex items-center gap-2"
          >
            <span>{hasGenerated ? "Re-generate Optimized Itinerary" : "Generate Optimized Itinerary"}</span>
          </Button>
        </div>

        {/* Step 2: Itinerary Output Results */}
        {hasGenerated && itineraryResult && (
          <div className="mt-8 pt-6 border-t border-monsoon-200 space-y-6 animate-fadeIn">
            {itineraryResult.stops.length === 0 ? (
              <div className="text-center py-8 text-xs text-monsoon-800/70">
                <p className="font-bold text-monsoon-900">No matching spots found</p>
                <p className="text-xs mt-1">
                  Try selecting more spot categories or extending your time allowance.
                </p>
              </div>
            ) : (
              <>
                {/* Stats Summary Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-monsoon-50/80 rounded-xl p-4 border border-monsoon-200">
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-monsoon-800/60">
                      Total Time
                    </p>
                    <p className="text-base font-extrabold text-monsoon-900">
                      {formatMinutes(itineraryResult.totalDurationMinutes)}
                    </p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-monsoon-800/60">
                      Travel & Distance
                    </p>
                    <p className="text-base font-extrabold text-monsoon-900">
                      {formatMinutes(itineraryResult.totalTravelMinutes)} ({itineraryResult.totalDistanceKm} km)
                    </p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-monsoon-800/60">
                      Spots Planned
                    </p>
                    <p className="text-base font-extrabold text-monsoon-900">
                      {itineraryResult.stops.length} Locations
                    </p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-monsoon-800/60">
                      Est. Total Budget
                    </p>
                    <p className="text-base font-extrabold text-emerald-700">
                      ₹{itineraryResult.estimatedTotalBudget}{" "}
                      <span className="text-[10px] font-normal text-monsoon-800/60">/ person</span>
                    </p>
                  </div>
                </div>

                {/* Google Maps Master Action */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <span>Google Maps Turn-by-Turn Route</span>
                    </h4>
                    <p className="text-[11px] text-emerald-900/80 mt-0.5">
                      Open this multi-stop itinerary directly in Google Maps for live driving navigation.
                    </p>
                  </div>
                  {itineraryResult.googleMapsDirectionsUrl && (
                    <a
                      href={itineraryResult.googleMapsDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
                    >
                      <span>Open Full Route in Google Maps ↗</span>
                    </a>
                  )}
                </div>

                {/* Sequenced Timeline Stops */}
                <div className="space-y-4 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-monsoon-200 before:hidden sm:before:block">
                  {itineraryResult.stops.map((stop, idx) => {
                    const place = stop.place;
                    const catObj = CATEGORIES.find(
                      (c) => c.id === (place.category || place.categoryId)
                    );
                    const coords = stop.coordinates;

                    return (
                      <div key={place.id || idx} className="space-y-3">
                        {/* Between-Stop Transit Indicator */}
                        {idx > 0 && stop.distanceFromPrevKm > 0 && (
                          <div className="sm:pl-12 flex items-center gap-2 py-1 text-xs text-monsoon-700">
                            <span className="px-2.5 py-1 rounded-full bg-monsoon-100 font-semibold text-[11px] flex items-center gap-1.5 border border-monsoon-200">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 3C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2"/>
                                <circle cx="7" cy="17" r="2"/>
                                <circle cx="17" cy="17" r="2"/>
                              </svg>
                              <span>
                                {stop.travelTimeFromPrevMinutes} min drive ({stop.distanceFromPrevKm} km)
                              </span>
                            </span>
                            <span className="text-[10px] text-monsoon-800/50">via local roads</span>
                          </div>
                        )}

                        {/* Stop Card */}
                        <div className="relative rounded-xl border border-monsoon-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 sm:items-start sm:pl-12">
                          {/* Number Badge */}
                          <div className="sm:absolute sm:left-2 sm:top-4 w-7 h-7 rounded-full bg-monsoon-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                            {stop.order}
                          </div>

                          {/* Image Thumbnail */}
                          {place.coverImage && (
                            <img
                              src={place.coverImage}
                              alt={place.name}
                              className="w-full sm:w-28 h-24 object-cover rounded-lg shrink-0 border border-monsoon-100"
                            />
                          )}

                          {/* Stop Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-monsoon-100 text-monsoon-800 flex items-center gap-1.5">
                                  <CategoryIcon categoryId={place.category || place.categoryId} className="w-3.5 h-3.5" />
                                  <span>{catObj?.label || place.category}</span>
                                </span>
                                <h3 className="text-base font-bold text-monsoon-900 truncate">
                                  {place.name}
                                </h3>
                              </div>

                              <div className="flex items-center gap-2 text-xs">
                                <span className="px-2 py-0.5 rounded-full bg-turmeric-100 text-turmeric-800 font-semibold text-[11px]">
                                  Spend ~{formatMinutes(stop.dwellTimeMinutes)}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold text-[11px]">
                                  ₹{stop.estimatedCost} est.
                                </span>
                              </div>
                            </div>

                            <p className="mt-1 text-xs text-monsoon-800/70 line-clamp-2">
                              {place.description || place.tagline || "Scenic local discovery spot."}
                            </p>

                            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-monsoon-100 text-[11px] text-monsoon-800/60">
                              <span className="flex items-center gap-1.5 truncate">
                                <svg className="w-3 h-3 text-monsoon-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                  <circle cx="12" cy="10" r="3"/>
                                </svg>
                                <span>
                                  {place.address ||
                                    (typeof place.location === "object" ? place.location?.town : place.location) ||
                                    place.townId ||
                                    regionName}
                                </span>
                              </span>

                              <div className="flex items-center gap-3">
                                {coords && (
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-monsoon-700 hover:underline flex items-center gap-1"
                                  >
                                    <span>Google Maps ↗</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
