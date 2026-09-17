/* PipPose — Pip mascot poses (neutral, correct/celebrate, almost/coach).
   Geometry from figma bro SoT SVGs: two separate leaves with air gap between
   them, each still attached to the stem (junction seal). */

interface PipPoseProps {
  pose?: 'neutral' | 'correct' | 'almost';
  className?: string;
}

export default function PipPose({ pose = 'neutral', className }: PipPoseProps) {
  if (pose === 'correct') {
    // Celebrate — arms-up leaves, deeper grin
    return (
      <svg
        className={className}
        width="56"
        height="56"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Pip celebrating"
      >
        <rect x="37.5" y="14" width="5" height="32" rx="2.5" fill="#3f7a2e" />
        <ellipse cx="25" cy="13" rx="12.5" ry="7.2" fill="#6FBF5E" transform="rotate(-50 36 17)" />
        <ellipse cx="55" cy="13" rx="12.5" ry="7.2" fill="#4D9E3F" transform="rotate(50 44 17)" />
        <circle cx="40" cy="18" r="2.8" fill="#3f7a2e" />
        <circle cx="40" cy="53" r="18" fill="#6FBF5E" />
        <circle cx="40" cy="53" r="18" fill="#ffffff" opacity="0.06" />
        <circle cx="34" cy="49.5" r="2.7" fill="#2f3b24" />
        <circle cx="46" cy="49.5" r="2.7" fill="#2f3b24" />
        <path d="M29.5 52.5 q10.5 15.5 21 0" stroke="#2f3b24" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="28.5" cy="56" r="2.6" fill="#ffffff" opacity="0.28" />
        <circle cx="51.5" cy="56" r="2.6" fill="#ffffff" opacity="0.28" />
      </svg>
    );
  }

  if (pose === 'almost') {
    // Coach / soft — separate leaves, gentler smile
    return (
      <svg
        className={className}
        width="56"
        height="56"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Pip coaching"
      >
        <rect x="37.5" y="20" width="5" height="26" rx="2.5" fill="#3f7a2e" />
        <ellipse cx="30" cy="22" rx="15" ry="8.5" fill="#6FBF5E" transform="rotate(-28 40 27)" />
        <ellipse cx="50" cy="22" rx="15" ry="8.5" fill="#4D9E3F" transform="rotate(22 40 27)" />
        <circle cx="40" cy="24" r="2.8" fill="#3f7a2e" />
        <circle cx="40" cy="53" r="18" fill="#6FBF5E" />
        <circle cx="40" cy="53" r="18" fill="#ffffff" opacity="0.06" />
        <circle cx="34" cy="50.5" r="2.9" fill="#2f3b24" />
        <circle cx="46" cy="50.5" r="2.9" fill="#2f3b24" />
        <path d="M32 57 q8 7 16 0" stroke="#2f3b24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="28.5" cy="56" r="2.6" fill="#ffffff" opacity="0.28" />
        <circle cx="51.5" cy="56" r="2.6" fill="#ffffff" opacity="0.28" />
      </svg>
    );
  }

  // Neutral — two distinct leaves with clear gap
  return (
    <svg
      className={className}
      width="56"
      height="56"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Pip the sprout"
    >
      <rect x="37.5" y="22" width="5" height="24" rx="2.5" fill="#3f7a2e" />
      <ellipse cx="31" cy="24" rx="15" ry="8.5" fill="#6FBF5E" transform="rotate(-32 40 28)" />
      <ellipse cx="49" cy="24" rx="15" ry="8.5" fill="#4D9E3F" transform="rotate(32 40 28)" />
      <circle cx="40" cy="26" r="2.8" fill="#3f7a2e" />
      <circle cx="40" cy="53" r="18" fill="#6FBF5E" />
      <circle cx="40" cy="53" r="18" fill="#ffffff" opacity="0.06" />
      <circle cx="34" cy="50.5" r="2.9" fill="#2f3b24" />
      <circle cx="46" cy="50.5" r="2.9" fill="#2f3b24" />
      <path d="M31.5 56.5 q8.5 9 17 0" stroke="#2f3b24" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle cx="28.5" cy="56" r="2.6" fill="#ffffff" opacity="0.28" />
      <circle cx="51.5" cy="56" r="2.6" fill="#ffffff" opacity="0.28" />
    </svg>
  );
}
