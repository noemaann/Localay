import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLocation } from "../../context/LocationContext.jsx";
import { REGIONS } from "../../data/regions.js";
import { fareService } from "../../services";
import SubmissionStatusBadge from "../../components/SubmissionStatusBadge.jsx";
import Button from "../../components/Button.jsx";
import AuthModal from "../../components/AuthModal.jsx";

export default function SubmitFareReportForm({ onReportSubmitted }) {
  const { user } = useAuth();
  const { region: activeRegion } = useLocation();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    regionId: activeRegion.id,
    districtId: activeRegion.districtId || "malappuram",
    townId: "",
    distanceKm: "",
    fareAmount: "",
    fareType: "agreed", // 'metered' | 'agreed'
    tripType: "one_way", // 'one_way' | 'round_trip'
    timeOfDay: "day", // 'day' | 'night' | 'peak'
    waitingMinutes: "0",
    waitingCharges: "0",
    tollsAndExtras: "0",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  function validate() {
    const errs = {};
    if (!formData.origin.trim()) errs.origin = "Pickup location is required.";
    if (!formData.destination.trim()) errs.destination = "Drop-off location is required.";
    if (!formData.townId.trim()) errs.townId = "Town / Locality is required.";

    const dist = Number(formData.distanceKm);
    if (isNaN(dist) || dist <= 0 || dist > 500) {
      errs.distanceKm = "Valid distance in km (> 0) is required.";
    }

    const fare = Number(formData.fareAmount);
    if (isNaN(fare) || fare <= 0 || fare > 50000) {
      errs.fareAmount = "Valid total fare in INR (> 0) is required.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    try {
      const created = await fareService.submitFareReport({
        userId: user.uid,
        regionId: formData.regionId,
        districtId: formData.districtId,
        townId: formData.townId.trim(),
        origin: formData.origin.trim(),
        destination: formData.destination.trim(),
        distanceKm: Number(formData.distanceKm),
        fareAmount: Number(formData.fareAmount),
        fareType: formData.fareType,
        tripType: formData.tripType,
        timeOfDay: formData.timeOfDay,
        waitingMinutes: Number(formData.waitingMinutes || 0),
        waitingCharges: Number(formData.waitingCharges || 0),
        tollsAndExtras: Number(formData.tollsAndExtras || 0),
        notes: formData.notes.trim(),
      });

      setSuccess(created);
      onReportSubmitted?.(created);
    } catch (err) {
      setErrors({ general: err.message || "Failed to submit fare report." });
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-monsoon-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-monsoon-900 flex items-center gap-2">
            <span>Auto Fare Report Logged</span>
          </h3>
          <SubmissionStatusBadge status={success.status} />
        </div>
        <p className="text-xs text-monsoon-800 leading-relaxed mb-4">
          Reported <strong>₹{success.fareAmount}</strong> for <strong>{success.origin}</strong> to <strong>{success.destination}</strong> ({success.distanceKm} km). Your report is saved as an individual historical record building the community dataset.
        </p>

        <Button
          onClick={() => {
            setSuccess(null);
            setFormData({
              origin: "",
              destination: "",
              regionId: activeRegion.id,
              districtId: activeRegion.districtId || "malappuram",
              townId: "",
              distanceKm: "",
              fareAmount: "",
              fareType: "agreed",
              tripType: "one_way",
              timeOfDay: "day",
              waitingMinutes: "0",
              waitingCharges: "0",
              tollsAndExtras: "0",
              notes: "",
            });
          }}
        >
          Submit Another Fare Report
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-monsoon-200 bg-white p-6 shadow-sm">
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />

      <div className="mb-6 border-b border-monsoon-100 pb-4">
        <h2 className="text-xl font-bold text-monsoon-900">Log an Auto-Rickshaw Fare</h2>
        <p className="mt-1 text-xs text-monsoon-800/70">
          Help your community know realistic auto-rickshaw fares by logging your recent trip.
        </p>
      </div>

      {!user && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex justify-between items-center">
          <span>Please sign in to contribute fare reports.</span>
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="font-bold underline text-amber-900"
          >
            Sign In Now
          </button>
        </div>
      )}

      {errors.general && (
        <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Route: Pickup & Dropoff */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pickup-location-input" className="block text-xs font-semibold text-monsoon-800 mb-1">
              Pickup Stand / Landmark <span className="text-rose-500">*</span>
            </label>
            <input
              id="pickup-location-input"
              type="text"
              required
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              placeholder="e.g. Kottakkal Bus Stand"
              className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-sm focus:border-monsoon-600 focus:outline-none"
            />
            {errors.origin && <p className="mt-1 text-xs text-rose-600">{errors.origin}</p>}
          </div>

          <div>
            <label htmlFor="dropoff-location-input" className="block text-xs font-semibold text-monsoon-800 mb-1">
              Drop-off Destination <span className="text-rose-500">*</span>
            </label>
            <input
              id="dropoff-location-input"
              type="text"
              required
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder="e.g. Changuvetty Junction"
              className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-sm focus:border-monsoon-600 focus:outline-none"
            />
            {errors.destination && <p className="mt-1 text-xs text-rose-600">{errors.destination}</p>}
          </div>
        </div>

        {/* Region & Town */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fare-region-select" className="block text-xs font-semibold text-monsoon-800 mb-1">
              Region
            </label>
            <select
              id="fare-region-select"
              value={formData.regionId}
              onChange={(e) => {
                const reg = REGIONS.find((r) => r.id === e.target.value);
                setFormData({
                  ...formData,
                  regionId: e.target.value,
                  districtId: reg?.districtId || "malappuram",
                });
              }}
              className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-sm focus:border-monsoon-600 focus:outline-none bg-white"
            >
              {REGIONS.map((reg) => (
                <option key={reg.id} value={reg.id}>
                  {reg.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="fare-town-input" className="block text-xs font-semibold text-monsoon-800 mb-1">
              Town / Locality <span className="text-rose-500">*</span>
            </label>
            <input
              id="fare-town-input"
              type="text"
              required
              value={formData.townId}
              onChange={(e) => setFormData({ ...formData, townId: e.target.value })}
              placeholder="e.g. Bus Stand, Town Centre, Market Junction"
              className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-sm focus:border-monsoon-600 focus:outline-none"
            />
            {errors.townId && <p className="mt-1 text-xs text-rose-600">{errors.townId}</p>}
          </div>
        </div>

        {/* Distance & Total Fare */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fare-distance-input" className="block text-xs font-semibold text-monsoon-800 mb-1">
              Approx Distance (km) <span className="text-rose-500">*</span>
            </label>
            <input
              id="fare-distance-input"
              type="number"
              step="0.1"
              min="0.1"
              required
              value={formData.distanceKm}
              onChange={(e) => setFormData({ ...formData, distanceKm: e.target.value })}
              placeholder="e.g. 2.5"
              className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-sm focus:border-monsoon-600 focus:outline-none"
            />
            {errors.distanceKm && <p className="mt-1 text-xs text-rose-600">{errors.distanceKm}</p>}
          </div>

          <div>
            <label htmlFor="fare-total-amount-input" className="block text-xs font-semibold text-monsoon-800 mb-1">
              Total Fare Amount (₹ INR) <span className="text-rose-500">*</span>
            </label>
            <input
              id="fare-total-amount-input"
              type="number"
              min="1"
              required
              value={formData.fareAmount}
              onChange={(e) => setFormData({ ...formData, fareAmount: e.target.value })}
              placeholder="e.g. 40"
              className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-sm focus:border-monsoon-600 focus:outline-none"
            />
            {errors.fareAmount && <p className="mt-1 text-xs text-rose-600">{errors.fareAmount}</p>}
          </div>
        </div>

        {/* Meter vs Agreed, Time of Day, Trip Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="fare-type-select" className="block text-xs font-semibold text-monsoon-800 mb-1">
              Fare Type
            </label>
            <select
              id="fare-type-select"
              value={formData.fareType}
              onChange={(e) => setFormData({ ...formData, fareType: e.target.value })}
              className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-xs focus:border-monsoon-600 focus:outline-none bg-white"
            >
              <option value="agreed">Agreed / Negotiated Rate</option>
              <option value="metered">Metered Fare</option>
            </select>
          </div>

          <div>
            <label htmlFor="fare-time-select" className="block text-xs font-semibold text-monsoon-800 mb-1">
              Time Period
            </label>
            <select
              id="fare-time-select"
              value={formData.timeOfDay}
              onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })}
              className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-xs focus:border-monsoon-600 focus:outline-none bg-white"
            >
              <option value="day">Day Time (6 AM - 9 PM)</option>
              <option value="night">Night Time (9 PM - 6 AM)</option>
              <option value="peak">Peak Traffic Hours</option>
            </select>
          </div>

          <div>
            <label htmlFor="fare-trip-type-select" className="block text-xs font-semibold text-monsoon-800 mb-1">
              Trip Type
            </label>
            <select
              id="fare-trip-type-select"
              value={formData.tripType}
              onChange={(e) => setFormData({ ...formData, tripType: e.target.value })}
              className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-xs focus:border-monsoon-600 focus:outline-none bg-white"
            >
              <option value="one_way">One-Way Trip</option>
              <option value="round_trip">Round Trip</option>
            </select>
          </div>
        </div>

        {/* Extras & Waiting */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="waiting-charges-input" className="block text-xs font-semibold text-monsoon-800 mb-1">
              Waiting Charges (₹ INR)
            </label>
            <input
              id="waiting-charges-input"
              type="number"
              min="0"
              value={formData.waitingCharges}
              onChange={(e) => setFormData({ ...formData, waitingCharges: e.target.value })}
              className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-xs focus:border-monsoon-600 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="tolls-extras-input" className="block text-xs font-semibold text-monsoon-800 mb-1">
              Tolls & Additional Charges (₹ INR)
            </label>
            <input
              id="tolls-extras-input"
              type="number"
              min="0"
              value={formData.tollsAndExtras}
              onChange={(e) => setFormData({ ...formData, tollsAndExtras: e.target.value })}
              className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-xs focus:border-monsoon-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label htmlFor="fare-notes-input" className="block text-xs font-semibold text-monsoon-800 mb-1">
            Trip Notes / Context (Optional)
          </label>
          <input
            id="fare-notes-input"
            type="text"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g. Heavy rain surcharge, 3 passengers"
            className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-xs focus:border-monsoon-600 focus:outline-none"
          />
        </div>

        <Button type="submit" disabled={submitting} className="w-full mt-2">
          {submitting ? "Submitting Report…" : "Submit Fare Report"}
        </Button>
      </form>
    </div>
  );
}
