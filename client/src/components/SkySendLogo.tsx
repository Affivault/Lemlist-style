/**
 * SkySend Logo - Clean Uber-style wordmark
 * The logomark is a bold geometric "S" in a rounded square.
 */
export function SkySendLogo({ className = 'h-7' }: { className?: string }) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        fontWeight: 800,
        letterSpacing: '-0.04em',
        color: 'var(--text-primary)',
        fontSize: 'inherit',
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      SkySend
    </span>
  );
}

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
      {/* Bold geometric "S" letterform */}
      <path
        d="M21 11.5C21 9.567 19.433 8 17.5 8H13.5C11.567 8 10 9.567 10 11.5C10 13.433 11.567 15 13.5 15H18.5C20.433 15 22 16.567 22 18.5C22 20.433 20.433 22 18.5 22H14.5C12.567 22 11 20.433 11 18.5"
        stroke={fg}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
