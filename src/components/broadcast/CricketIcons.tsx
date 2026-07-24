type IconProps = {
  className?: string;
};

export function BatIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="bat-icon-wood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F3D9A4" />
          <stop offset="55%" stopColor="#E3B876" />
          <stop offset="100%" stopColor="#C89654" />
        </linearGradient>
      </defs>
      <g transform="rotate(32 12 12)">
        {/* Handle grip */}
        <rect x="11.35" y="1.2" width="1.3" height="5.8" rx="0.65" fill="#F4F1EA" />

        {/* Grip cap */}
        <rect x="11.15" y="0.8" width="1.7" height="1" rx="0.5" fill="#1E293B" />

        {/* Grip rings */}
        <path
          d="M11.35 2.2H12.65M11.35 3.2H12.65M11.35 4.2H12.65M11.35 5.2H12.65M11.35 6.2H12.65"
          stroke="#B7AE9C"
          strokeWidth="0.35"
          strokeLinecap="round"
        />

        {/* Shoulder / splice */}
        <path d="M10.9 7c0 .5-.5.9-1.4 1.4H14.5C13.6 7.9 13.1 7.5 13.1 7Z" fill="#1E293B" />

        {/* Blade */}
        <path
          d="M9.5 8.4
             H14.5
             V19.8
             Q14.5 21.6 12.7 21.7
             H11.3
             Q9.5 21.6 9.5 19.8
             Z"
          fill="url(#bat-icon-wood)"
        />

        {/* Edge shading */}
        <path d="M10.1 9.2 9.9 21" stroke="#C89654" strokeOpacity="0.7" strokeWidth="0.4" strokeLinecap="round" />
        <path d="M13.9 9.2 13.7 21" stroke="#F3D9A4" strokeOpacity="0.7" strokeWidth="0.35" strokeLinecap="round" />

        {/* Brand decal */}
        <rect x="10.1" y="12.6" width="3.8" height="1.5" rx="0.3" fill="#1E293B" />
        <rect x="10.1" y="14.25" width="3.8" height="0.6" rx="0.15" fill="#DC2626" />
      </g>
    </svg>
  );
}

export function BallIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="#B91C1C" />
      <path
        d="M5 6.5C7 9 7 15 5 17.5M19 6.5C17 9 17 15 19 17.5"
        stroke="#FDE68A"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <path d="M12 3v18" stroke="#FDE68A" strokeWidth="0.9" strokeDasharray="1.2 1.4" />
    </svg>
  );
}
