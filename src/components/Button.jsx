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
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-spring-out " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-monsoon-600 " +
  "disabled:pointer-events-none disabled:opacity-50 select-none";

const VARIANTS = {
  primary:
    "bg-monsoon-900 text-white hover:bg-monsoon-800 active:scale-[0.97] shadow-xs border border-monsoon-900",
  secondary:
    "border border-monsoon-900 text-monsoon-900 hover:bg-monsoon-900 hover:text-white active:scale-[0.97]",
  outline:
    "border border-monsoon-200 text-monsoon-800 hover:bg-monsoon-100 hover:text-monsoon-900 active:scale-[0.97]",
  ghost:
    "text-monsoon-800 hover:bg-monsoon-100/70 hover:text-monsoon-900 active:scale-[0.97]",
};

const SIZES = {
  sm: "px-3.5 py-1.5 text-xs font-semibold rounded-lg",
  md: "px-5 py-2.5 text-sm font-semibold rounded-xl",
  lg: "px-6 py-3 text-base font-semibold rounded-xl",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}) {
  return (
    <button
      className={`${BASE} ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
