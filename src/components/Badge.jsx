/**
 * Badge — small inline label for categories, status, or tags.
 *
 * Variants:
 *   default    — muted monsoon green
 *   accent     — turmeric yellow (attention/launch)
 *   category   — a specific accent string can be passed via className
 */

const BASE =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold leading-none tracking-tight";

const VARIANTS = {
  default: "bg-monsoon-100/80 text-monsoon-900 border border-monsoon-200/60",
  accent: "bg-turmeric-100 text-turmeric-600 border border-turmeric-200 font-semibold",
  outline: "border border-monsoon-200 text-monsoon-800 bg-white",
};

export default function Badge({ variant = "default", className = "", children }) {
  return (
    <span className={`${BASE} ${VARIANTS[variant] || VARIANTS.default} ${className}`}>
      {children}
    </span>
  );
}
