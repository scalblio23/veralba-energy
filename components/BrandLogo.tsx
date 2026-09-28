import { site } from "@/lib/site";

interface BrandLogoProps {
  className?: string;
}

/**
 * Wordmark rendered as inline SVG so it uses the page's Poppins font and stays crisp at any size.
 * "Solar" is white and "Check" is brand yellow, designed for the navy header and footer.
 */
export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 600 120"
      role="img"
      aria-label={site.name}
      focusable="false"
    >
      <text
        x="0"
        y="88"
        fontFamily="var(--font-sans)"
        fontWeight="700"
        fontSize="96"
        letterSpacing="-2"
        fill="#ffffff"
      >
        Solar
        <tspan fill="var(--color-accent)">Check</tspan>
      </text>
    </svg>
  );
}
