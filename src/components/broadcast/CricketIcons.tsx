type IconProps = {
  className?: string;
};

export function BatIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <g transform="rotate(32 12 12)">
        {/* Handle */}
        <rect x="11.35" y="1.2" width="1.3" height="5.8" rx="0.65" fill="currentColor" />

        {/* Grip cap */}
        <rect x="11.15" y="0.8" width="1.7" height="1" rx="0.5" fill="currentColor" />

        {/* Grip rings */}
        <path
          d="M11.35 2.2H12.65M11.35 3.2H12.65M11.35 4.2H12.65M11.35 5.2H12.65M11.35 6.2H12.65"
          stroke="white"
          strokeOpacity="0.45"
          strokeWidth="0.35"
          strokeLinecap="round"
        />

        {/* Shoulder / splice */}
        <path d="M10.9 7c0 .5-.5.9-1.4 1.4H14.5C13.6 7.9 13.1 7.5 13.1 7Z" fill="currentColor" />

        {/* Blade */}
        <path
          d="M9.5 8.4
             H14.5
             V19.8
             Q14.5 21.6 12.7 21.7
             H11.3
             Q9.5 21.6 9.5 19.8
             Z"
          fill="currentColor"
        />

        {/* Edge highlight */}
        <path
          d="M10.1 9.2 9.9 21"
          stroke="white"
          strokeOpacity="0.2"
          strokeWidth="0.45"
          strokeLinecap="round"
        />

        {/* Center spine */}
        <path d="M12 8.3V21.5" stroke="white" strokeOpacity="0.12" strokeWidth="0.4" />
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
