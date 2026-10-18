import { useState, useEffect } from "react";
import { placeService } from "../../services";

export default function AdminPlacesPage() {
  const [places, setPlaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlaces() {
      setLoading(true);
      try {
        const list = await placeService.getPlaces({ regionId: "malappuram" });
        setPlaces(list || []);
      } catch (err) {
        console.error("Error loading places:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPlaces();
  }, []);

  const filteredPlaces = places.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.town?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Places Directory & Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse and inspect active spots in the Malappuram database. Total: {places.length} places.
          </p>
        </div>

        {/* Search & filter */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or town..."
            className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none w-56"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs sm:text-sm">
          Loading places directory...
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center text-slate-400 text-xs sm:text-sm">
          No places matched your search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlaces.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-white line-clamp-1">
                    {p.name}
                  </h3>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase border border-slate-700">
                    {p.category}
                  </span>
                </div>

                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  <span>{p.town || "Malappuram"}</span>
                </div>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {p.description || "No description recorded."}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span>Rating:</span>
                  <svg className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" viewBox="0 0 24 24">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <strong className="text-amber-400">{p.rating || "4.5"}</strong>
                </span>
                <span className="text-slate-500 font-mono">
                  ID: {p.id.substring(0, 8)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
