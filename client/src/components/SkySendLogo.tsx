export function SkySendLogo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="40" height="40" rx="10" fill="currentColor" />
      <path
        d="M10 28L30 12L17.5 22.5L10 28Z"
        fill="var(--bg-app, #fff)"
        fillOpacity="0.95"
      />
      <path
        d="M17.5 22.5L30 12L22 30L17.5 22.5Z"
        fill="var(--bg-app, #fff)"
        fillOpacity="0.7"
      />
      <path
        d="M17.5 22.5L22 30L15 25.5L17.5 22.5Z"
        fill="var(--bg-app, #fff)"
        fillOpacity="0.45"
      />
    </svg>
  );
}

export function SkySendLogoMark({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M4 24L28 8L15.5 18.5L4 24Z"
        fill="currentColor"
        fillOpacity="0.95"
      />
      <path
        d="M15.5 18.5L28 8L20 26L15.5 18.5Z"
        fill="currentColor"
        fillOpacity="0.7"
      />
      <path
        d="M15.5 18.5L20 26L13 21.5L15.5 18.5Z"
        fill="currentColor"
        fillOpacity="0.45"
      />
    </svg>
  );
}
