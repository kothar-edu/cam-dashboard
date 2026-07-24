type IconProps = {
  className?: string;
};

export function BatIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <g transform="rotate(35 12 12)">
        <rect x="10.3" y="1.5" width="3.4" height="10.5" rx="1.7" fill="currentColor" />
        <rect x="9.1" y="11" width="5.8" height="10.5" rx="2.4" fill="currentColor" />
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
