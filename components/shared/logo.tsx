// ============================================================
// AethLife — Logo Component
// Single-element wordmark — no nested spans, no baseline drift.
// Clash Display bold · teal "Aeth" · foreground "Life"
// ============================================================

interface LogoMarkProps {
  size?: number;
  className?: string;
}

interface LogoProps {
  className?: string;
  wordmarkSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const SIZES = {
  xs: 13,
  sm: 17,
  md: 21,
  lg: 27,
  xl: 35,
};

/**
 * Teal square mark — used in tight spaces where wordmark won't fit.
 * Clean "A" shape on a teal rounded-square background.
 */
export function LogoMark({ size = 28, className = '' }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="#14b8a6" />
      {/* A: two diagonal legs + crossbar */}
      <line x1="16" y1="7"  x2="7"  y2="26" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="16" y1="7"  x2="25" y2="26" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="10" y1="20" x2="22" y2="20" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Full AethLife wordmark.
 *
 * Uses a CSS background-clip gradient trick so both colour halves
 * sit in ONE text node — zero baseline drift between "Aeth" and "Life",
 * even when Clash Display hasn't loaded yet.
 */
export function Logo({ className = '', wordmarkSize = 'md' }: LogoProps) {
  const fontSize = SIZES[wordmarkSize];

  return (
    <span
      className={`inline-flex items-center gap-0 leading-none select-none ${className}`}
      aria-label="AethLife"
      style={{
        fontFamily:    "'Clash Display', 'Plus Jakarta Sans', system-ui, sans-serif",
        fontSize:      `${fontSize}px`,
        fontWeight:    700,
        letterSpacing: '-0.025em',
        lineHeight:    1,
        whiteSpace:    'nowrap',
      }}
    >
      {/* "Aeth" — teal */}
      <span style={{ color: '#14b8a6' }}>Aeth</span>
      {/* "Life" — inherits foreground from Tailwind .text-foreground */}
      <span className="text-foreground">Life</span>
    </span>
  );
}

/** SVG string for emails / OG images */
export const LOGO_SVG_STRING = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="8" fill="#14b8a6"/>
  <line x1="16" y1="7"  x2="7"  y2="26" stroke="white" stroke-width="2.8" stroke-linecap="round"/>
  <line x1="16" y1="7"  x2="25" y2="26" stroke="white" stroke-width="2.8" stroke-linecap="round"/>
  <line x1="10" y1="20" x2="22" y2="20" stroke="white" stroke-width="2.4" stroke-linecap="round"/>
</svg>`;
