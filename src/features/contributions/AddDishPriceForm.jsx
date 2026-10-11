import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { dishPriceService } from "../../services";
import SubmissionStatusBadge from "../../components/SubmissionStatusBadge.jsx";
import Button from "../../components/Button.jsx";
import AuthModal from "../../components/AuthModal.jsx";

export default function AddDishPriceForm({ placeId, placeName, onPriceAdded }) {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [dishName, setDishName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("snacks");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    const numPrice = Number(price);
    if (!dishName.trim()) {
      setError("Dish/snack name is required.");
      return;
    }
    if (isNaN(numPrice) || numPrice <= 0) {
      setError("Please enter a valid price greater than 0 INR.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const created = await dishPriceService.addDishPrice({
        placeId,
        dishName: dishName.trim(),
        price: numPrice,
        currency: "INR",
        category,
        userId: user.uid,
      });

      setSuccess(created);
      onPriceAdded?.(created);
    } catch (err) {
      setError(err.message || "Failed to submit dish price.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-sky-800">Dish Price Recorded!</span>
          <SubmissionStatusBadge status="community_reported" />
        </div>
        <p className="text-sky-900 leading-relaxed mb-3">
          Reported <strong>{success.dishName}</strong> at <strong>₹{success.price}</strong> for {placeName || "this spot"}. This entry builds the community price history series.
        </p>
        <button
          type="button"
          onClick={() => {
            setSuccess(null);
            setDishName("");
            setPrice("");
          }}
          className="font-semibold text-sky-700 underline hover:text-sky-900"
        >
          Submit another dish price
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
        Report Dish / Snack Price
      </h3>
      <p className="text-xs text-monsoon-800/70 mb-4">
        Help locals know expected food prices at {placeName || "this spot"}.
      </p>

      {!user && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800 flex justify-between items-center">
          <span>Sign in to contribute dish prices.</span>
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
          <label htmlFor="dish-name-input" className="block text-xs font-semibold text-monsoon-800 mb-1">
            Dish / Snack Item Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="dish-name-input"
            type="text"
            required
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
            placeholder="e.g. Malabar Chicken Biryani, Pazham Pori"
            className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-xs focus:border-monsoon-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="dish-price-input" className="block text-xs font-semibold text-monsoon-800 mb-1">
              Price (₹ INR) <span className="text-rose-500">*</span>
            </label>
            <input
              id="dish-price-input"
              type="number"
              min="1"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 180"
              className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-xs focus:border-monsoon-600 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="dish-category-select" className="block text-xs font-semibold text-monsoon-800 mb-1">
              Category
            </label>
            <select
              id="dish-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-monsoon-200 px-3 py-2 text-xs focus:border-monsoon-600 focus:outline-none bg-white"
            >
              <option value="snacks">Snacks</option>
              <option value="main_course">Main Course</option>
              <option value="beverages">Beverages & Tea</option>
              <option value="desserts">Desserts</option>
            </select>
          </div>
        </div>

        <Button type="submit" disabled={submitting} size="sm" className="w-full">
          {submitting ? "Submitting…" : "Report Price"}
        </Button>
      </form>
    </div>
  );
}
