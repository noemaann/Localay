/**
 * EmptyState — shown when a list or search returns no results.
 *
 * @param {{
 *   icon?: string,
 *   title?: string,
 *   description?: string,
 *   action?: React.ReactNode,
 *   className?: string,
 * }} props
 */
export default function EmptyState({
  icon,
  title = "Nothing found yet",
  description = "Try a different search term or explore a category.",
  action,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-20 text-center ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-monsoon-100/70 border border-monsoon-200/60 text-monsoon-700">
        {icon && typeof icon !== "string" ? (
          icon
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        )}
      </div>
      <div className="space-y-1">
        <h2 className="text-base font-bold text-monsoon-900">{title}</h2>
        {description && (
          <p className="mx-auto max-w-sm text-xs leading-relaxed text-monsoon-800/70">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
