/* Pip — Sprout's friendly mascot. Two separate leaves with a clear gap,
   each attached to the stem (matches figma bro SoT neutral).
   Idle liveliness is layered groups (body, leaves, each leaf, glance, eyes, sheen).
   See docs/PIP-IDLE.md. The standalone review page is public/pip-idle-preview.html.
   Ids are suffixed per instance because Today and the path can mount together. */

import { useId } from 'react';

interface PipProps {
  className?: string;
  /** Neutral status: layered breath, sway, and blink. Not for celebrate/coach poses. */
  idle?: boolean;
}

export default function Pip({ className, idle = false }: PipProps) {
  const uid = useId().replace(/:/g, '');
  const classes = ['pip', idle ? 'pip--idle' : '', className].filter(Boolean).join(' ');

  return (
    <svg
      className={classes}
      viewBox="0 0 80 80"
      role="img"
      aria-label="Pip the sprout"
    >
      <g id={`${uid}-pip-leaves`} className="pip__leaves">
        <rect x="37.5" y="22" width="5" height="24" rx="2.5" fill="var(--green-deep, #3f7a2e)" />
        <g className="pip__leaf pip__leaf--l">
          <ellipse cx="31" cy="24" rx="15" ry="8.5" fill="var(--green, #6FBF5E)" transform="rotate(-32 40 28)" />
        </g>
        <g className="pip__leaf pip__leaf--r">
          <ellipse cx="49" cy="24" rx="15" ry="8.5" fill="var(--green-strong, #4D9E3F)" transform="rotate(32 40 28)" />
        </g>
        <circle cx="40" cy="26" r="2.8" fill="var(--green-deep, #3f7a2e)" />
      </g>
      <g id={`${uid}-pip-body`} className="pip__body">
        <circle cx="40" cy="53" r="18" fill="var(--green, #6FBF5E)" />
        <circle className="pip__sheen" cx="40" cy="53" r="18" fill="#ffffff" opacity="0.06" />
        <g className="pip__glance">
          <g id={`${uid}-pip-eyes`} className="pip__eyes">
            <circle cx="34" cy="50.5" r="2.9" fill="#2f3b24" />
            <circle cx="46" cy="50.5" r="2.9" fill="#2f3b24" />
          </g>
        </g>
        <path d="M31.5 56.5 q8.5 9 17 0" stroke="#2f3b24" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <circle cx="28.5" cy="56" r="2.6" fill="#ffffff" opacity="0.28" />
        <circle cx="51.5" cy="56" r="2.6" fill="#ffffff" opacity="0.28" />
      </g>
    </svg>
  );
}
