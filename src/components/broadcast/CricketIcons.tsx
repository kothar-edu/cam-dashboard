type IconProps = {
  className?: string;
};

/** Classic diagonal cricket bat (+ ball) from the legacy OBS overlay. */
export function BatIcon({ className = 'h-7 w-7' }: IconProps) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 421.47 421.47"
      aria-hidden="true"
    >
      <path d="M415.276,61.627L359.829,6.18C355.841,2.195,350.532,0,344.881,0s-10.96,2.194-14.949,6.181L86.029,250.083c-8.234,8.243-8.233,21.655,0.003,29.899l10.887,10.882l-93.08,93.08c-0.93,0.84-3.664,3.645-3.831,7.678c-0.076,1.867,0.385,4.646,3.021,7.281l19.448,19.443c2.581,2.582,5.261,3.124,7.055,3.123c4.228,0,7.114-2.85,8.02-3.881l93.044-93.048l10.886,10.885c3.986,3.99,9.294,6.188,14.947,6.188c5.651,0,10.961-2.197,14.948-6.186l243.9-243.9c3.994-3.994,6.194-9.302,6.194-14.948C421.47,70.94,419.272,65.631,415.276,61.627z" />
      <path d="M344.752,247.03c-24.937,0-45.224,20.287-45.224,45.224c0,24.936,20.287,45.223,45.224,45.223s45.224-20.287,45.224-45.223C389.975,267.317,369.688,247.03,344.752,247.03z" />
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
