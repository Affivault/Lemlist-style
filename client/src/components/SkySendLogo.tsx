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
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="skyGradShine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      {/* Background rounded square with indigo-to-violet gradient */}
      <rect width="40" height="40" rx="10" fill="url(#skyGrad)" />
      {/* Subtle shine overlay for depth */}
      <rect width="40" height="20" rx="10" fill="url(#skyGradShine)" />
      {/* Paper plane — main wing */}
      <path
        d="M10 28L30 12L17.5 22.5L10 28Z"
        fill="white"
        fillOpacity="0.95"
      />
      {/* Paper plane — right fold */}
      <path
        d="M17.5 22.5L30 12L22 30L17.5 22.5Z"
        fill="white"
        fillOpacity="0.75"
      />
      {/* Paper plane — bottom fold */}
      <path
        d="M17.5 22.5L22 30L15 25.5L17.5 22.5Z"
        fill="white"
        fillOpacity="0.55"
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
      {/* Paper plane — main wing */}
      <path
        d="M4 24L28 8L15.5 18.5L4 24Z"
        fill="currentColor"
        fillOpacity="0.95"
      />
      {/* Paper plane — right fold */}
      <path
        d="M15.5 18.5L28 8L20 26L15.5 18.5Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
      {/* Paper plane — bottom fold */}
      <path
        d="M15.5 18.5L20 26L13 21.5L15.5 18.5Z"
        fill="currentColor"
        fillOpacity="0.55"
      />
    </svg>
  );
}
