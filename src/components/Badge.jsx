/**
 * Badge — small inline label for categories, status, or tags.
 *
 * Variants:
 *   default    — muted monsoon green
 *   accent     — turmeric yellow (attention/launch)
 *   category   — a specific accent string can be passed via className
 */

const BASE =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold leading-none";

const VARIANTS = {
  default: "bg-monsoon-100 text-monsoon-800",
  accent: "bg-turmeric-400 text-monsoon-900",
  outline: "border border-monsoon-100 text-monsoon-800",
};

/**
 * @param {{
 *   variant?: 'default' | 'accent' | 'outline',
 *   children: React.ReactNode,
 *   className?: string,
 * }} props
 */
export default function Badge({ variant = "default", className = "", children }) {
  return (
    <span className={`${BASE} ${VARIANTS[variant]} ${className}`}>
      {children}
    </span>
  );
}
