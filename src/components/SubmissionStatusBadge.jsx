import React from "react";

/**
 * Status definitions and styling for community contribution moderation states.
 */
const STATUS_CONFIG = {
  pending: {
    label: "Pending Review",
    className: "bg-amber-100 text-amber-800 border-amber-200",
    icon: "⏳",
  },
  community_reported: {
    label: "Community Reported",
    className: "bg-sky-100 text-sky-800 border-sky-200",
    icon: "💬",
  },
  verified: {
    label: "Verified",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: "✓",
  },
  rejected: {
    label: "Rejected",
    className: "bg-rose-100 text-rose-800 border-rose-200",
    icon: "✕",
  },
  needs_recheck: {
    label: "Needs Recheck",
    className: "bg-purple-100 text-purple-800 border-purple-200",
    icon: "⚠️",
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
