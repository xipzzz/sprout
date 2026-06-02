/* WindingPath — the home "winding path": a vine of lesson nodes.
   - completed nodes show a check
   - the ONE current node shows a START bubble + Pip trailside
   - locked nodes are dimmed and not pressable
   - a golden node marks a milestone (Golden Bloom)
   Nodes gently zig-zag across a soft central vine. */

import type { PathNode } from '../data/course';
import Pip from './Pip';

/* gentle left/right offsets so the path winds (px) */
const OFFSETS = [0, 38, 0, -38];

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 19c0-7 5-12 14-13 0 9-5 14-13 14" />
      <path d="M5 19c2.5-4 5.5-6.5 9-8" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="9" rx="2.2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />
    </svg>
  );
}

function nodeIcon(node: PathNode) {
  if (node.kind === 'golden') return <StarIcon />;
  if (node.status === 'done') return <CheckIcon />;
  if (node.status === 'locked') return <LockIcon />;
  return <LeafIcon />; // current
}

function ariaLabel(node: PathNode) {
  if (node.status === 'locked') return `${node.title} — locked`;
  if (node.status === 'done') return `${node.title} — completed`;
  return `Start: ${node.title}`;
}

interface WindingPathProps {
  nodes: PathNode[];
  onSelect?: (node: PathNode) => void;
}

export default function WindingPath({ nodes, onSelect }: WindingPathProps) {
  return (
    <nav className="path" aria-label="Lesson path">
      <div className="path__nodes">
        {nodes.map((node, i) => {
          const dx = OFFSETS[i % OFFSETS.length];
          const isLocked = node.status === 'locked';
          return (
            <div className="node-row" key={node.id} style={{ transform: `translateX(${dx}px)` }}>
              <button
                type="button"
                className={`node node--${node.kind === 'golden' ? 'golden' : node.status}`}
                disabled={isLocked}
                aria-label={ariaLabel(node)}
                onClick={() => !isLocked && onSelect?.(node)}
              >
                {node.status === 'current' && <span className="start-bubble">START</span>}
                <span className="node__disc">{nodeIcon(node)}</span>
                {node.status === 'current' && (
                  <span className="node__pip"><Pip /></span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
