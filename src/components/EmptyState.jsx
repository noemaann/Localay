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
  icon = "🔍",
  title = "Nothing found yet",
  description = "Try a different search term or explore a category.",
  action,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-20 text-center ${className}`}
    >
      <span aria-hidden="true" className="text-5xl leading-none">
        {icon}
      </span>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-monsoon-900">{title}</h2>
        {description && (
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-monsoon-800">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
