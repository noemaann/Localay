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
        "rounded-2xl bg-white border border-monsoon-200/70 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]",
        interactive &&
          "cursor-pointer transition-[box-shadow,transform,border-color] duration-200 ease-spring-out hover:shadow-[0_10px_24px_-4px_rgba(15,23,42,0.07)] hover:-translate-y-0.5 " +
          "hover:border-monsoon-300 focus-within:ring-2 focus-within:ring-monsoon-600 focus-within:ring-offset-2",
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
