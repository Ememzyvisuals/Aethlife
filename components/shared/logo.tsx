// ============================================================
// AethLife — Logo Component
// Pure typographic wordmark in Clash Display (system font).
// "Aeth" teal · "Life" foreground · clean · minimal · consistent
// ============================================================

interface LogoMarkProps {
  size?: number;
  className?: string;
}

interface LogoProps {
  className?: string;
  wordmarkSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showMark?: boolean;   // show the small square mark alongside text
}

/**
 * Minimal square mark — used in tight spaces (header icon, favicon fallback).
 * Rounded teal square with a clean white "A".
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
      {/* Clean geometric "A" built from straight strokes */}
      <path
        d="M16 7 L23 25 M16 7 L9 25 M11.5 19 L20.5 19"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const SIZES = {
  xs: { text: 'text-[13px]', gap: 'gap-1.5', mark: 18 },
  sm: { text: 'text-[16px]', gap: 'gap-2',   mark: 22 },
  md: { text: 'text-[20px]', gap: 'gap-2.5', mark: 26 },
  lg: { text: 'text-[26px]', gap: 'gap-3',   mark: 32 },
  xl: { text: 'text-[34px]', gap: 'gap-4',   mark: 40 },
};

/**
 * Full AethLife typographic wordmark.
 *
 * Renders "Aeth" in teal + "Life" in foreground using Clash Display.
 * This is the single source of truth for the logo — use everywhere.
 */
export function Logo({ className = '', wordmarkSize = 'md', showMark = false }: LogoProps) {
  const cfg = SIZES[wordmarkSize];

  return (
    <span
      className={`inline-flex items-center ${cfg.gap} ${className}`}
      aria-label="AethLife"
    >
      {showMark && <LogoMark size={cfg.mark} />}

      <span
        className={`font-bold ${cfg.text} leading-none select-none tracking-tight`}
        style={{
          fontFamily: "'Clash Display', 'Plus Jakarta Sans', system-ui, sans-serif",
          letterSpacing: '-0.025em',
        }}
      >
        <span style={{ color: '#14b8a6' }}>Aeth</span>
        <span className="text-foreground">Life</span>
      </span>
    </span>
  );
}

/** Inline SVG string for emails and OG images */
export const LOGO_SVG_STRING = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="8" fill="#14b8a6"/>
  <path d="M16 7 L23 25 M16 7 L9 25 M11.5 19 L20.5 19" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
