export function SkySendLogo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#skyGrad)" />
      {/* Paper plane */}
      <path
        d="M10 28L30 12L18 22L10 28Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M18 22L30 12L22 30L18 22Z"
        fill="white"
        fillOpacity="0.7"
      />
      <path
        d="M18 22L22 30L16 26L18 22Z"
        fill="white"
        fillOpacity="0.5"
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
        d="M4 24L28 8L16 18L4 24Z"
        fill="currentColor"
        fillOpacity="0.95"
      />
      <path
        d="M16 18L28 8L20 26L16 18Z"
        fill="currentColor"
        fillOpacity="0.7"
      />
      <path
        d="M16 18L20 26L12 22L16 18Z"
        fill="currentColor"
        fillOpacity="0.5"
      />
    </svg>
  );
}
