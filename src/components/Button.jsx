/**
 * Button — primary interactive element.
 *
 * Variants:
 *   primary   — filled, brand green
 *   secondary — outlined, brand green
 *   ghost     — text-only, subtle
 *
 * Sizes: sm | md (default) | lg
 */

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold " +
  "transition-all duration-150 focus-visible:outline focus-visible:outline-2 " +
  "focus-visible:outline-offset-2 focus-visible:outline-monsoon-600 " +
  "disabled:pointer-events-none disabled:opacity-50 select-none";

const VARIANTS = {
  primary:
    "bg-monsoon-600 text-white hover:bg-monsoon-800 active:scale-[0.98] shadow-sm",
  secondary:
    "border-2 border-monsoon-600 text-monsoon-600 hover:bg-monsoon-50 active:scale-[0.98]",
  ghost:
    "text-monsoon-800 hover:bg-monsoon-100 active:scale-[0.98]",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

/**
 * @param {{
 *   variant?: 'primary' | 'secondary' | 'ghost',
 *   size?: 'sm' | 'md' | 'lg',
 *   children: React.ReactNode,
 *   className?: string,
 *   [key: string]: any,
 * }} props
 */
export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}) {
  return (
    <button
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
