/* Pip — Sprout's friendly mascot, drawn as a simple SVG so it stays
   crisp at any size and can be recolored with the design tokens. */

interface PipProps {
  className?: string;
}

export default function Pip({ className }: PipProps) {
  return (
    <svg
      className={className ? `pip ${className}` : 'pip'}
      viewBox="0 0 80 80"
      role="img"
      aria-label="Pip the sprout"
    >
      {/* leaves */}
      <ellipse cx="28" cy="27" rx="15" ry="8.5" fill="var(--green)" transform="rotate(-35 28 27)" />
      <ellipse cx="53" cy="27" rx="15" ry="8.5" fill="var(--green-strong)" transform="rotate(35 53 27)" />
      {/* stem */}
      <rect x="37.5" y="26" width="5" height="20" rx="2.5" fill="var(--green-deep)" />
      {/* body */}
      <circle cx="40" cy="53" r="18" fill="var(--green)" />
      <circle cx="40" cy="53" r="18" fill="#ffffff" opacity="0.06" />
      {/* face */}
      <circle cx="34" cy="51" r="2.7" fill="#2f3b24" />
      <circle cx="46" cy="51" r="2.7" fill="#2f3b24" />
      <path d="M33.5 58 q6.5 5 13 0" stroke="#2f3b24" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* cheeks */}
      <circle cx="28.5" cy="56" r="2.6" fill="#ffffff" opacity="0.28" />
      <circle cx="51.5" cy="56" r="2.6" fill="#ffffff" opacity="0.28" />
    </svg>
  );
}
