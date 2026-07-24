type IconProps = {
  className?: string;
};

export function BatIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <g transform="rotate(28 12 12)">
        <path
          d="M10.9 2.6c0-.7.5-1.2 1.1-1.2.6 0 1.1.5 1.1 1.2v6.2c0 .5.3.9.7 1.3 1.5 1.3 2.3 2.8 2.4 5.3.1 2.1-.4 3.9-1.3 5.2-.4.6-1 1-1.8 1.2-.7.2-1.5.2-2.2 0-.8-.2-1.4-.6-1.8-1.2-.9-1.3-1.4-3.1-1.3-5.2.1-2.5.9-4 2.4-5.3.4-.4.7-.8.7-1.3V2.6z"
          fill="currentColor"
        />
        <path
          d="M10.9 3.6h2.2M10.9 4.8h2.2M10.9 6h2.2"
          stroke="white"
          strokeOpacity="0.55"
          strokeWidth="0.5"
          strokeLinecap="round"
        />
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
