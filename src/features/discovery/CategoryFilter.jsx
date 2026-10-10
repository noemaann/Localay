import { CATEGORIES } from "../../data/categories.js";

/**
 * CategoryFilter — a horizontal pill-strip filter for discovery categories.
 *
 * Renders an "All" pill plus one pill per category. The selected pill is
 * highlighted. Keyboard-accessible with arrow-key navigation between pills.
 *
 * @param {{
 *   selected: string,
 *   onChange: (categoryId: string) => void,
 *   resultCounts?: Record<string, number>,
 * }} props
 */
export default function CategoryFilter({ selected, onChange, resultCounts = {} }) {
  const all = [
    { id: "", label: "All", icon: "✦" },
    ...CATEGORIES.map((c) => ({ id: c.id, label: c.label, icon: c.icon })),
  ];

  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
    >
      {all.map((cat) => {
        const isSelected = selected === cat.id;
        const count = cat.id ? resultCounts[cat.id] : undefined;
        return (
          <button
            key={cat.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${cat.label}${count !== undefined ? `, ${count} results` : ""}`}
            onClick={() => onChange(cat.id)}
            className={[
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2",
              "text-sm font-medium transition-all duration-150 select-none",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-monsoon-600",
              isSelected
                ? "bg-monsoon-600 text-white shadow-sm"
                : "bg-white text-monsoon-800 border border-monsoon-100 hover:border-monsoon-300 hover:text-monsoon-900",
            ].join(" ")}
          >
            <span aria-hidden="true">{cat.icon}</span>
            <span>{cat.label}</span>
            {count !== undefined && (
              <span
                className={`ml-0.5 rounded-full px-1.5 text-xs font-semibold ${
                  isSelected ? "bg-white/20 text-white" : "bg-monsoon-100 text-monsoon-800"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
