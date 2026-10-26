import { useState, useEffect } from "react";
import { useLocation } from "../context/LocationContext.jsx";
import { fareService } from "../services";
import SubmitFareReportForm from "../features/autofare/SubmitFareReportForm.jsx";
import SubmissionStatusBadge from "../components/SubmissionStatusBadge.jsx";
import Button from "../components/Button.jsx";

export default function AutoFarePage() {
  const { region } = useLocation();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Comparison criteria state
  const [origin, setOrigin] = useState("Kottakkal Bus Stand");
  const [destination, setDestination] = useState("Changuvetty Junction");
  const [distanceKm, setDistanceKm] = useState("2.5");
  const [timeOfDay, setTimeOfDay] = useState("day");
  const [tripType, setTripType] = useState("one_way");
  const [queryFareAmount, setQueryFareAmount] = useState("");

  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState("calculator"); // 'calculator' | 'submit' | 'history'

  async function loadReports() {
    setLoading(true);
    try {
      const list = await fareService.getFareReports({ regionId: region.id });
      setReports(list);
    } catch (err) {
      console.error("Error loading fare reports:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, [region.id]);

  // Run calculation whenever criteria or reports change
  useEffect(() => {
    if (reports.length === 0) {
      setSummary(null);
      return;
    }

    const calcRes = fareService.calculateFareSummary(reports, {
      origin,
      destination,
      distanceKm: distanceKm ? Number(distanceKm) : undefined,
      timeOfDay,
      tripType,
      queryFareAmount: queryFareAmount ? Number(queryFareAmount) : undefined,
    });

    setSummary(calcRes);
  }, [reports, origin, destination, distanceKm, timeOfDay, tripType, queryFareAmount]);

  function getOutcomeBadgeClass(outcome) {
    switch (outcome) {
      case "Within reported range":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Below reported range":
        return "bg-sky-100 text-sky-800 border-sky-300";
      case "Above reported range":
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-monsoon-100 text-monsoon-800 border-monsoon-300";
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-monsoon-900 text-white p-7 sm:p-10 shadow-md space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-monsoon-800 border border-monsoon-700/80 px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-monsoon-200 shadow-2xs">
            AutoFare • {region.name}
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-3xl">
          Community Auto-Rickshaw Fare Finder
        </h1>
        <p className="text-xs sm:text-sm text-monsoon-200/90 leading-relaxed max-w-2xl">
          A transparent, community-reported guide to local auto-rickshaw fares in <strong className="text-white">{region.label}</strong> based on actual trip entries logged by locals.
        </p>

        {/* Standard Tariff Guidelines */}
        <div className="pt-4 mt-2 border-t border-monsoon-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-monsoon-200">
          <div>
            <span className="text-[10px] uppercase font-mono text-monsoon-400 block">Min Fare (1.5 km)</span>
            <span className="font-bold text-white font-mono text-sm">₹30</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-monsoon-400 block">Per Additional km</span>
            <span className="font-bold text-white font-mono text-sm">₹15/km</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-monsoon-400 block">Night Surcharge</span>
            <span className="font-bold text-white font-mono text-sm">+50% (10pm-5am)</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-monsoon-400 block">Waiting Charge</span>
            <span className="font-bold text-white font-mono text-sm">₹10 / 15 min</span>
          </div>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-monsoon-200/70 pb-3">
        {[
          { id: "calculator", label: "Fare Calculator & Range Check" },
          { id: "submit", label: "Log a Fare Report" },
          { id: "history", label: "Community Reports Feed" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              "rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-[background-color,border-color,color,transform] duration-150 select-none active:scale-[0.97]",
              activeTab === tab.id
                ? "bg-monsoon-900 text-white shadow-xs border border-monsoon-900"
                : "bg-white border border-monsoon-200 text-monsoon-800 hover:border-monsoon-900 hover:text-monsoon-900 shadow-2xs",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CALCULATOR & RANGE CHECK TAB */}
      {activeTab === "calculator" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-4 rounded-2xl border border-monsoon-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-monsoon-900 border-b border-monsoon-100 pb-2">
              Route Criteria
            </h2>

            <div>
              <label htmlFor="calc-pickup-input" className="block text-xs font-bold text-monsoon-900 mb-1.5">
                Pickup Stand / Location
              </label>
              <input
                id="calc-pickup-input"
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Kottakkal Stand"
                className="input-control"
              />
            </div>

            <div>
              <label htmlFor="calc-dropoff-input" className="block text-xs font-bold text-monsoon-900 mb-1.5">
                Drop-off Destination
              </label>
              <input
                id="calc-dropoff-input"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Changuvetty"
                className="input-control"
              />
            </div>

            <div>
              <label htmlFor="calc-distance-input" className="block text-xs font-bold text-monsoon-900 mb-1.5">
                Distance (km)
              </label>
              <input
                id="calc-distance-input"
                type="number"
                step="0.1"
                min="0.1"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="input-control font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="calc-time-select" className="block text-xs font-bold text-monsoon-900 mb-1.5">
                  Time Period
                </label>
                <select
                  id="calc-time-select"
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value)}
                  className="input-control bg-white"
                >
                  <option value="day">Day Time</option>
                  <option value="night">Night Time</option>
                  <option value="peak">Peak Traffic</option>
                </select>
              </div>

              <div>
                <label htmlFor="calc-triptype-select" className="block text-xs font-bold text-monsoon-900 mb-1.5">
                  Trip Type
                </label>
                <select
                  id="calc-triptype-select"
                  value={tripType}
                  onChange={(e) => setTripType(e.target.value)}
                  className="input-control bg-white"
                >
                  <option value="one_way">One-Way</option>
                  <option value="round_trip">Round-Trip</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-monsoon-100">
              <label htmlFor="calc-quote-input" className="block text-xs font-bold text-monsoon-900 mb-1.5">
                Quoted / Proposed Fare (Optional ₹)
              </label>
              <input
                id="calc-quote-input"
                type="number"
                min="1"
                value={queryFareAmount}
                onChange={(e) => setQueryFareAmount(e.target.value)}
                placeholder="Check if ₹ quote is fair…"
                className="input-control font-mono"
              />
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="lg:col-span-2 space-y-6">
            {!summary || summary.status === "insufficient_data" ? (
              <div className="rounded-2xl border border-monsoon-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex rounded-full bg-monsoon-100 border border-monsoon-200 px-3 py-1 text-xs font-semibold text-monsoon-800">
                    Insufficient Comparable Data
                  </span>
                </div>
                <h3 className="text-lg font-bold text-monsoon-900 mb-2">
                  No Sufficient Match Yet for This Route
                </h3>
                <p className="text-xs text-monsoon-800/80 leading-relaxed mb-4">
                  {summary?.message || "There are currently fewer than 2 comparable recent community fare entries matching your route and distance criteria."}
                </p>

                <div className="rounded-xl bg-monsoon-50 border border-monsoon-100 p-4 text-xs space-y-2 text-monsoon-800">
                  <h4 className="font-bold">Transparent Algorithm Limitations:</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    {summary?.limitations?.map((lim, idx) => (
                      <li key={idx}>{lim}</li>
                    ))}
                  </ul>
                  <p className="pt-2 text-monsoon-800/60 border-t border-monsoon-200/60">
                    {summary?.disclaimer}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-monsoon-200 bg-white p-6 shadow-sm space-y-6">
                {/* Result Status Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-monsoon-100 pb-4">
                  <div>
                    <span className="text-xs font-semibold text-monsoon-800/70 block uppercase tracking-wide">
                      Comparison Outcome
                    </span>
                    <h3 className="text-xl font-bold text-monsoon-900 mt-0.5">
                      {summary.comparisonOutcome}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getOutcomeBadgeClass(summary.comparisonOutcome)}`}>
                      {summary.comparisonOutcome}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-monsoon-100 text-monsoon-800">
                      Sample Size: {summary.sampleSize} reports
                    </span>
                  </div>
                </div>

                {/* Key Statistics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl bg-monsoon-50 p-3 border border-monsoon-100">
                    <span className="text-xs text-monsoon-800/70 block">Lowest Reported</span>
                    <span className="text-lg font-bold text-monsoon-900">₹{summary.stats.minFare}</span>
                  </div>

                  <div className="rounded-xl bg-monsoon-50 p-3 border border-monsoon-100">
                    <span className="text-xs text-monsoon-800/70 block">Median (50th %)</span>
                    <span className="text-lg font-bold text-monsoon-600">₹{summary.stats.medianFare}</span>
                  </div>

                  <div className="rounded-xl bg-monsoon-50 p-3 border border-monsoon-100">
                    <span className="text-xs text-monsoon-800/70 block">Average Fare</span>
                    <span className="text-lg font-bold text-monsoon-900">₹{summary.stats.meanFare}</span>
                  </div>

                  <div className="rounded-xl bg-monsoon-50 p-3 border border-monsoon-100">
                    <span className="text-xs text-monsoon-800/70 block">Highest Reported</span>
                    <span className="text-lg font-bold text-monsoon-900">₹{summary.stats.maxFare}</span>
                  </div>
                </div>

                {/* Observed Range Info */}
                <div className="rounded-xl border border-monsoon-200 bg-monsoon-50/50 p-4 text-xs space-y-2">
                  <h4 className="font-bold text-monsoon-900 text-sm">
                    Observed Community Range: ₹{summary.observedRange.min} – ₹{summary.observedRange.max}
                  </h4>
                  <p className="text-monsoon-800/80 leading-relaxed">
                    Typical middle 50% of reported fares for similar distance ({distanceKm} km) fall between <strong>₹{summary.observedRange.p25}</strong> and <strong>₹{summary.observedRange.p75}</strong>.
                  </p>
                </div>

                {/* Limitations & Disclaimer */}
                <div className="rounded-xl bg-amber-50/60 border border-amber-200/60 p-4 text-xs space-y-2 text-amber-900">
                  <h4 className="font-bold">Methodology & Assumptions:</h4>
                  <ul className="list-disc pl-4 space-y-1 text-amber-800">
                    {summary.limitations.map((lim, idx) => (
                      <li key={idx}>{lim}</li>
                    ))}
                  </ul>
                  <p className="pt-2 text-amber-900/60 border-t border-amber-200/60 italic">
                    {summary.disclaimer}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LOG FARE TAB */}
      {activeTab === "submit" && (
        <div className="max-w-2xl mx-auto">
          <SubmitFareReportForm
            onReportSubmitted={() => {
              loadReports();
              setActiveTab("calculator");
            }}
          />
        </div>
      )}

      {/* FEED TAB */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-monsoon-900 flex items-center justify-between">
            <span>Recent Community Fare Entries ({reports.length})</span>
            <span className="text-xs font-normal text-monsoon-800/70">
              Preserved individual records
            </span>
          </h2>

          {reports.length === 0 ? (
            <p className="text-xs text-monsoon-800/70">No fare reports logged yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="rounded-2xl border border-monsoon-200 bg-white p-4 shadow-sm space-y-2 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-monsoon-900">
                        {rep.origin} → {rep.destination}
                      </h3>
                      <span className="text-monsoon-800/70">
                        {rep.distanceKm} km • {rep.timeOfDay || "day"} trip
                      </span>
                    </div>
                    <span className="font-display text-base font-extrabold text-monsoon-700">
                      ₹{rep.fareAmount}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-monsoon-800">
                    <span className="rounded bg-monsoon-100 px-2 py-0.5">
                      Type: {rep.fareType || "agreed"}
                    </span>
                    {rep.waitingCharges > 0 && (
                      <span className="rounded bg-monsoon-100 px-2 py-0.5">
                        Waiting: +₹{rep.waitingCharges}
                      </span>
                    )}
                    {rep.tollsAndExtras > 0 && (
                      <span className="rounded bg-monsoon-100 px-2 py-0.5">
                        Extras: +₹{rep.tollsAndExtras}
                      </span>
                    )}
                  </div>

                  {rep.notes && (
                    <p className="text-monsoon-800/80 italic pt-1 border-t border-monsoon-100">
                      "{rep.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
