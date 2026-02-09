/**
 * SkySend Logo - Clean modern wordmark. No icon, just the name.
 */
export function SkySendLogo({ className = '', inverted = false }: { className?: string; inverted?: boolean }) {
  const color = inverted ? 'white' : 'var(--text-primary)';

  return (
    <span
      className={className}
      style={{
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        fontWeight: 500,
        letterSpacing: '-0.03em',
        color,
        fontSize: 'inherit',
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      skysend
    </span>
  );
}

/**
 * Compact logo mark - just a simple "s" in a rounded square for favicon/collapsed sidebar contexts.
 */
export function SkySendLogoMark({ className = 'h-7 w-7', inverted = false }: { className?: string; inverted?: boolean }) {
  const bg = inverted ? 'white' : 'var(--text-primary)';
  const fg = inverted ? '#0A0A0B' : 'var(--bg-app)';

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill={bg} />
      <text
        x="16"
        y="22"
        textAnchor="middle"
        fill={fg}
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        fontWeight="500"
        fontSize="20"
        letterSpacing="-0.5"
      >
        s
      </text>
    </svg>
  );
}
