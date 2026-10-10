/**
 * LoadingState — shown while a data fetch is in progress.
 *
 * Renders a spinner and an optional message. The container is aria-live
 * polite so screen readers announce it when it appears.
 *
 * @param {{ message?: string, className?: string }} props
 */
export default function LoadingState({
  message = "Loading…",
  className = "",
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 py-16 text-monsoon-800 ${className}`}
    >
      {/* Spinner */}
      <span aria-hidden="true" className="relative flex h-10 w-10">
        <span className="absolute inset-0 animate-ping rounded-full bg-monsoon-600/30" />
        <span className="relative inline-flex h-10 w-10 rounded-full border-4 border-monsoon-100 border-t-monsoon-600 animate-spin" />
      </span>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
