/* OnboardingSplash — v2 garden-themed onboarding flow.
   5 segments (welcome → audience → [reassure if child] → grow → ready), only
   the 2 real questions count toward the progress bar. Selections persist to
   sprout.onboard so downstream features can tailor the experience. Mirrors
   design/v2-bundle/project/onboarding.jsx. */

import { useMemo, useState } from 'react';
import Pip from '../components/Pip';

interface OnboardingSplashProps {
  onStart: () => void;
}

type Audience = 'child' | 'self';
type GrowId = 'fun' | 'talk' | 'travel' | 'school' | 'work';

const GROWS_BASE: { id: GrowId; icon: string; childLabel: string; selfLabel: string }[] = [
  { id: 'fun', icon: '🎈', childLabel: 'Just for the fun of it', selfLabel: 'Just for the fun of it' },
  { id: 'talk', icon: '🗣️', childLabel: 'Talk with new people', selfLabel: 'Talk with new people' },
  { id: 'travel', icon: '✈️', childLabel: 'Travel adventures', selfLabel: 'Travel adventures' },
  { id: 'school', icon: '🎓', childLabel: 'Help with school', selfLabel: 'Do great at school' },
  { id: 'work', icon: '🌟', childLabel: 'Get a head start', selfLabel: 'Feel confident at work' },
];

export default function OnboardingSplash({ onStart }: OnboardingSplashProps) {
  const [step, setStep] = useState(0);
  const [audience, setAudience] = useState<Audience | null>(null);
  const [grow, setGrow] = useState<GrowId[]>([]);

  // The flow grows a "reassure" beat only on the child path.
  const seq = useMemo<string[]>(
    () => ['welcome', 'audience', ...(audience === 'child' ? ['reassure'] : []), 'grow', 'ready'],
    [audience]
  );
  const key = seq[Math.min(step, seq.length - 1)] || 'ready';
  const forChild = audience === 'child';

  // Only the two real questions advance the progress bar.
  const questionKeys = ['audience', 'grow'];
  const qIndex = questionKeys.indexOf(key);
  const showChrome = qIndex >= 0;

  const grows = GROWS_BASE.map((g) => ({ id: g.id, icon: g.icon, label: forChild ? g.childLabel : g.selfLabel }));
  function toggleGrow(id: GrowId) {
    setGrow((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));
  }

  const canContinue = key === 'audience' ? !!audience : key === 'grow' ? grow.length > 0 : true;
  const back = () => setStep((s) => Math.max(0, s - 1));
  const next = () => setStep((s) => Math.min(seq.length - 1, s + 1));

  function finish() {
    try { localStorage.setItem('sprout.onboard', JSON.stringify({ audience, grow })); } catch { /* ignore */ }
    onStart();
  }

  return (
    <div className="screen ob">
      {showChrome && (
        <header className="ob__chrome">
          <button type="button" className="ob__back" onClick={back} aria-label="Back">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <div className="ob__progress">
            <p className="ob__step">Step {Math.min(qIndex + 1, 2)} of 2</p>
            <div className="ob__bars" aria-hidden="true">
              {Array.from({ length: 2 }).map((_, i) => {
                const w = i < qIndex ? 100 : i === qIndex ? 50 : 0;
                return (
                  <span key={i} className="ob__bar"><span className="ob__bar-fill" style={{ width: `${w}%` }} /></span>
                );
              })}
            </div>
          </div>
        </header>
      )}

      <main className="ob__body">
        {key === 'welcome' && (
          <div className="ob__welcome">
            <Pip className="ob__pip-xl" />
            <h1 className="ob__title-big">Hi, I'm Pip!</h1>
            <p className="ob__lead">Let's grow your English together — a few gentle minutes a day. 🌱</p>
          </div>
        )}

        {key === 'audience' && (
          <div role="radiogroup" aria-label="Who's growing a garden today?">
            <Bubble text="First — who's growing a garden today?" />
            <Option icon="🧒" title="My child" sub="I'm setting it up for a young learner" selected={audience === 'child'} onClick={() => setAudience('child')} />
            <Option icon="🌱" title="Me" sub="I'm learning English myself" selected={audience === 'self'} onClick={() => setAudience('self')} />
          </div>
        )}

        {key === 'reassure' && (
          <div className="ob__reassure">
            <div className="ob__reassure-head">
              <Pip className="ob__pip-md" />
              <div>
                <p className="ob__eyebrow">For grown-ups</p>
                <h2 className="ob__title">A calm place to learn 🌿</h2>
              </div>
            </div>
            <Point title="No ads, ever" sub="Nothing trying to sell to your child." />
            <Point title="No pressure" sub="Calm by design — gentle goals, never guilt." />
            <Point title="Their own pace" sub="Sprout adapts so learning always feels kind." />
            <Point title="Safe & private" sub="A quiet garden, just for growing English." />
          </div>
        )}

        {key === 'grow' && (
          <div role="group" aria-label="What would you like to grow toward? Pick any that fit.">
            <Bubble text={forChild ? 'What should we help your child grow toward?' : 'What would you like to grow toward?'} />
            <p className="ob__hint">Pick any that fit — I'll tailor the garden. 🌷</p>
            {grows.map((g) => (
              <Option key={g.id} icon={g.icon} title={g.label} multi selected={grow.includes(g.id)} onClick={() => toggleGrow(g.id)} />
            ))}
          </div>
        )}

        {key === 'ready' && (
          <div className="ob__welcome">
            <div className="ob__pip-wrap">
              <Pip className="ob__pip-xl" />
              <span className="ob__pip-spark" aria-hidden="true">🌱</span>
            </div>
            <h1 className="ob__title-big">{forChild ? "Let's plant the first seed!" : "Let's plant your first seed!"}</h1>
            <p className="ob__lead">One short lesson and your garden begins to grow.</p>
            <div className="ob__pace">
              <p className="ob__pace-lbl">Daily pace</p>
              <p className="ob__pace-val">A gentle 5 min a day</p>
              <p className="ob__pace-hint">Change it anytime in Settings</p>
            </div>
          </div>
        )}
      </main>

      <footer className="ob__foot">
        <button
          type="button"
          className="ob__cta"
          disabled={!canContinue}
          onClick={
            key === 'welcome' ? next :
            key === 'reassure' ? next :
            key === 'ready' ? finish :
            next
          }
        >
          {key === 'welcome' ? 'Get started' :
            key === 'reassure' ? 'Sounds good' :
            key === 'ready' ? 'Plant first seed' :
            'Continue'}
        </button>
      </footer>
    </div>
  );
}

/* ---- shared little parts ---- */

function Bubble({ text }: { text: string }) {
  return (
    <div className="ob-bubble">
      <Pip className="ob-bubble__pip" />
      <div className="ob-bubble__msg">{text}</div>
    </div>
  );
}

interface OptionProps { icon: string; title: string; sub?: string; selected: boolean; onClick: () => void; multi?: boolean }
function Option({ icon, title, sub, selected, onClick, multi }: OptionProps) {
  return (
    <button
      type="button"
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      className={`ob-opt${selected ? ' ob-opt--on' : ''}`}
      onClick={onClick}
    >
      <span className="ob-opt__icon" aria-hidden="true">{icon}</span>
      <span className="ob-opt__text">
        <span className="ob-opt__title">{title}</span>
        {sub && <span className="ob-opt__sub">{sub}</span>}
      </span>
      <span className="ob-opt__dot" aria-hidden="true">{selected && '✓'}</span>
    </button>
  );
}

function Point({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="ob-point">
      <span className="ob-point__leaf" aria-hidden="true">🌿</span>
      <span className="ob-point__text">
        <span className="ob-point__title">{title}</span>
        <span className="ob-point__sub">{sub}</span>
      </span>
    </div>
  );
}
