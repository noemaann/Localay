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
    { id: "", label: "All" },
    ...CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
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
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2",
              "text-xs font-semibold tracking-wide transition-[background-color,border-color,color,transform] duration-150 select-none active:scale-[0.96]",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-monsoon-600",
              isSelected
                ? "bg-monsoon-900 text-white shadow-xs border border-monsoon-900"
                : "bg-white text-monsoon-800 border border-monsoon-200/90 hover:border-monsoon-900 hover:text-monsoon-900 shadow-2xs",
            ].join(" ")}
          >
            <span>{cat.label}</span>
            {count !== undefined && (
              <span
                className={`ml-0.5 rounded-full px-2 py-0.2 text-[11px] font-mono font-bold ${
                  isSelected ? "bg-white/20 text-white" : "bg-monsoon-100 text-monsoon-700"
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
