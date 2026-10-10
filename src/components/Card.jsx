/**
 * Card — a contained surface with optional hover lift for clickable cards.
 *
 * Use `interactive` to add a pointer cursor and hover/focus ring.
 * The card itself is a div; wrap in a <Link> or <button> for navigation.
 */

/**
 * @param {{
 *   interactive?: boolean,
 *   className?: string,
 *   children: React.ReactNode,
 *   [key: string]: any,
 * }} props
 */
export default function Card({ interactive = false, className = "", children, ...rest }) {
  return (
    <div
      className={[
        "rounded-2xl bg-white shadow-sm ring-1 ring-monsoon-100",
        interactive &&
          "cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 " +
          "hover:ring-monsoon-100 focus-within:ring-2 focus-within:ring-monsoon-600",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
