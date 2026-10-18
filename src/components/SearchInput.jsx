/**
 * SearchInput — the primary discovery search control.
 *
 * Includes a search icon, a labelled input, and an optional clear button.
 * Exposes the same props as a standard <input> element.
 */

/**
 * @param {{
 *   label?: string,
 *   placeholder?: string,
 *   value: string,
 *   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
 *   onClear?: () => void,
 *   id?: string,
 *   className?: string,
 * }} props
 */
export default function SearchInput({
  label = "Search places",
  placeholder = "What are you looking for?",
  value,
  onChange,
  onClear,
  id = "search-places",
  className = "",
}) {
  return (
    <div className={`w-full ${className}`}>
      {/* Visually hidden label for screen readers */}
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative flex items-center">
        {/* Search icon */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-monsoon-600 flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </span>

        <input
          id={id}
          type="search"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
          className={[
            "w-full rounded-2xl border border-monsoon-200/90 bg-white py-3.5 pl-12 pr-12",
            "text-sm text-monsoon-900 placeholder:text-monsoon-800/40 font-medium",
            "shadow-[0_2px_10px_-2px_rgba(15,23,42,0.04)] transition-all duration-200",
            "focus:border-monsoon-900 focus:outline-none focus:ring-2 focus:ring-monsoon-900/10",
            "hover:border-monsoon-400",
          ].join(" ")}
        />

        {/* Clear button */}
        {value && onClear && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={onClear}
            className={[
              "absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-monsoon-800/50",
              "hover:bg-monsoon-100 hover:text-monsoon-900",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-monsoon-600",
              "transition-colors duration-150 flex items-center justify-center",
            ].join(" ")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
