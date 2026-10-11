import React from "react";

/**
 * Status definitions and styling for community contribution moderation states.
 */
const STATUS_CONFIG = {
  pending: {
    label: "Pending Review",
    className: "bg-amber-50 text-amber-800 border-amber-200",
    icon: (
      <svg className="w-3 h-3 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  community_reported: {
    label: "Community Reported",
    className: "bg-sky-50 text-sky-800 border-sky-200",
    icon: (
      <svg className="w-3 h-3 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  verified: {
    label: "Verified",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: (
      <svg className="w-3 h-3 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
  },
  rejected: {
    label: "Rejected",
    className: "bg-rose-50 text-rose-800 border-rose-200",
    icon: (
      <svg className="w-3 h-3 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    ),
  },
  needs_recheck: {
    label: "Needs Recheck",
    className: "bg-purple-50 text-purple-800 border-purple-200",
    icon: (
      <svg className="w-3 h-3 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
};

/**
 * Renders a standardized badge for contribution moderation states.
 * @param {{ status: string, className?: string, showIcon?: boolean }} props
 */
export default function SubmissionStatusBadge({
  status,
  className = "",
  showIcon = true,
}) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        config.className,
        className,
      ].join(" ")}
      title={`Status: ${config.label}`}
    >
      {showIcon && <span aria-hidden="true">{config.icon}</span>}
      {config.label}
    </span>
  );
}
