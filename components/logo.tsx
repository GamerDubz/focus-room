type LogoProps = {
  className?: string
  size?: number
}

/**
 * The Focus Room mark: a still point surrounded by two breathing rings,
 * evoking a single held breath. Renders with `currentColor` so it inherits
 * whatever text color it's placed in (works in headers, footers, dark or
 * light contexts) and stays crisp from 16px up to 512px since it's pure
 * vector geometry with no fine detail to lose.
 */
export function Logo({ className, size = 24 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="16" cy="16" r="14.5" stroke="currentColor" strokeWidth="1.4" opacity="0.32" />
      <circle cx="16" cy="16" r="9.5" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
      <circle cx="16" cy="16" r="4" fill="currentColor" />
    </svg>
  )
}
