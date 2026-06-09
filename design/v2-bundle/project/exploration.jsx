// ─────────────────────────────────────────────────────────────
// Exploration — a VIEW-ONLY design-exploration board.
// Gallery / Screens / Play are the shipped product; Exploration is the
// testing bench: each idea shows the CURRENT Sprout screen beside a
// PROPOSED redesign, with a pain point, a why-it's-better note, and a
// source it's inspired by. No actions, no approve/reject — just looking.
// ─────────────────────────────────────────────────────────────

// One-time style block: gentle pulse for the spotlight ring + soft tick.
function ExplorationStyles() {
  return (
    <style>{`
      @keyframes expHalo {
        0%   { transform: scale(.86); opacity: .55; }
        70%  { transform: scale(1.28); opacity: 0; }
        100% { transform: scale(1.28); opacity: 0; }
      }
      @keyframes expBob {
        0%,100% { transform: translateY(0); }
        50%     { transform: translateY(-3px); }
      }
      @keyframes expFade {
        from { opacity: 0; transform: translateY(5px); }
        to   { opacity: 1; transform: none; }
      }
      @keyframes expTwinkle {
        0%,100% { opacity: .3; transform: scale(.8); }
        50%     { opacity: 1; transform: scale(1.1); }
      }
      @keyframes expCaret { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
      .exp-halo { animation: expHalo 2.4s cubic-bezier(.4,0,.3,1) infinite; }
      .exp-bob  { animation: expBob 3s ease-in-out infinite; }
      .exp-caret { animation: expCaret 1.1s step-end infinite; }
      @media (prefers-reduced-motion: reduce) {
        .exp-halo { animation: none; opacity: .4; transform: scale(1.1); }
        .exp-bob  { animation: none; }
        .exp-twinkle { animation: none; opacity: .7; }
      }
    `}</style>
  );
}

// ── A focused phone-sized card holding a proposed-redesign sketch ──
function ProposedFrame({ children, w, h, scale = 0.56 }) {
  const DEV_W = 402;
  return (
    <div style={{
      width: w, height: h, borderRadius: 30, flexShrink: 0,
      background: 'linear-gradient(180deg,#FFFDF8 0%,#F7F1E6 100%)',
      border: '1.5px solid ' + SPROUT.line,
      boxShadow: '0 18px 44px -22px rgba(42,35,32,.4)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column'
    }}>
      {/* real iOS status bar — scaled to match the left phone exactly */}
      <div style={{ width: '100%', height: Math.round(62 * scale), flexShrink: 0, overflow: 'hidden' }}>
        <div style={{ width: DEV_W, transform: 'scale(' + scale + ')', transformOrigin: 'top left', pointerEvents: 'none' }}>
          <IOSStatusBar />
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}

// ── ONE shared chrome set, reused VERBATIM on BOTH phones of EVERY card ──
// The iOS status bar lives in ProposedFrame; AppChrome adds the HUD row and the
// bottom tab bar (or the exercise progress bar / streak header). Every card —
// current AND proposed — composes its body inside this exact wrapper, so the
// chrome is byte-identical everywhere and ONLY the explored element differs.
function AppChrome({ top, nav, children }) {
  return (
    <React.Fragment>
      {top === 'hud' && <MiniHud />}
      {top === 'exercise' && <MiniExerciseTop progress={0.55} />}
      {top === 'streak' && <MiniStreakHeader />}
      {top === 'taleBar' && <MiniTaleTop />}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      {nav && <MiniBottomNav active={nav} />}
    </React.Fragment>
  );
}

// ── Proposed · Calm daily-grow reminder (onboarding reminder-priming: busy permission → single decision) ──
// Onboarding screen — NO HUD row, NO bottom tab bar. The only shared chrome is the
// iOS status bar (in ProposedFrame) plus this onboarding progress indicator, kept
// byte-for-byte identical on both phones.
function OnboardProgress() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px 4px', flexShrink: 0 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
      <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}>
        <div style={{ width: '66%', height: '100%', borderRadius: 999, background: SPROUT.green }} />
      </div>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, fontWeight: 700, letterSpacing: '.08em', color: SPROUT.mute }}>4/6</span>
    </div>
  );
}

// ── Proposed · Garden Tale dialogue — replay any line (plain bubbles → per-line speaker + translation) ──
// tale chrome — a close ✕ + thin progress ribbon, as on the Garden Tale reading screen
function MiniTaleTop() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px 9px', flexShrink: 0 }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
      <div style={{ flex: 1, height: 9, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}>
        <div style={{ width: '58%', height: '100%', borderRadius: 999, background: SPROUT.green }} />
      </div>
    </div>
  );
}

// ── Proposed · Followable Garden Tale dialogue (plain column → speaker-aligned chat bubbles) ──
function ProposedTaleFollow({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const lines = [
    { who: 'other', name: 'Bea', text: 'Good morning! Lovely day in the garden.', tr: 'A warm morning greeting.' },
    { who: 'me', text: "Yes! I'm watering my tulips.", tr: 'Sharing what you are doing.' },
    { who: 'other', name: 'Bea', text: 'They look wonderful. How often?', tr: 'Asking about frequency.' },
    { who: 'me', text: 'Every morning, before work.', tr: 'Giving your routine.', active: true },
  ];
  const Spk = ({ on }) => (
    <span style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: on ? '#EAF6E2' : '#fff', border: '1.5px solid ' + (on ? GREEN + '88' : SPROUT.line), display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill={on ? DEEP : SPROUT.mute} stroke="none"><path d="M11 5 6 9H3v6h3l5 4V5z" /></svg>
    </span>
  );
  const Avatar = () => (
    <span style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: '#FBE9C8', border: '1.5px solid #E8D6A8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' }}>
      <Icon.Leaf size={15} color="#C2871B" />
    </span>
  );
  return (
    <AppChrome top="taleBar">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 14px', minHeight: 0 }}>
          {!isNew
            // CURRENT: a plain stacked column — no speaker sides, no per-line translation.
            ? lines.map((l, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.mute }}>{l.who === 'other' ? l.name : 'You'}</span>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13, color: SPROUT.ink, lineHeight: 1.35 }}>{l.text}</span>
                </div>
              ))
            // NEW: speaker-aligned chat bubbles — NPC left + avatar, learner right; per-line replay + tap-to-reveal translation.
            : lines.map((l, i) => {
                const other = l.who === 'other';
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: other ? 'flex-start' : 'flex-end', alignItems: 'flex-end', gap: 7 }}>
                    {other && <Avatar />}
                    <div style={{ maxWidth: '76%', display: 'flex', flexDirection: 'column', gap: 4, alignItems: other ? 'flex-start' : 'flex-end' }}>
                      <div style={{
                        position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 7,
                        background: other ? '#fff' : '#EAF6E2',
                        border: '1.5px solid ' + (other ? SPROUT.line : GREEN + '88'),
                        borderRadius: 15, borderBottomLeftRadius: other ? 4 : 15, borderBottomRightRadius: other ? 15 : 4,
                        padding: '9px 11px'
                      }}>
                        {other && <Spk on={l.active} />}
                        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, color: other ? SPROUT.ink : DEEP, lineHeight: 1.3 }}>{l.text}</span>
                        {!other && <Spk on={l.active} />}
                      </div>
                      {l.active
                        ? <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 10, color: SPROUT.mute, padding: '0 3px' }}>{l.tr}</span>
                        : <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700, color: '#B7AE9F', padding: '0 3px' }}>Tap to show translation</span>}
                    </div>
                  </div>
                );
              })}
        </div>
        <div style={{ padding: '0 16px 14px', flexShrink: 0 }}>
          <div style={{ background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.04em', padding: '13px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Continue</div>
        </div>
      </div>
    </AppChrome>
  );
}

function ProposedTaleShelf({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e', GOLD = '#E5A93A';
  // 4 tales: read, next-up, fresh-new, locked
  const tales = [
    { title: 'The Morning Market', reward: 12, state: 'read', tint: '#FBE9C8' },
    { title: 'A Walk in the Park', reward: 15, state: 'next', tint: '#E5F2F8' },
    { title: 'Tea with Bea', reward: 15, state: 'new', tint: '#EAF6E2' },
    { title: 'The Lost Watering Can', reward: 18, state: 'locked', tint: '#EDE4D2' },
  ];

  if (!isNew) {
    // CURRENT: a plain vertical text stack — no art, reward, or progress.
    return (
      <AppChrome top="hud" nav="book">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 16px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Garden Tales</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {tales.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '13px 4px', borderBottom: '1px solid ' + SPROUT.line }}>
                <Icon.Book size={16} color={SPROUT.mute} />
                <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13, color: SPROUT.ink }}>{t.title}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.mute }}>Read ›</span>
              </div>
            ))}
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: a 2-up illustrated shelf grouped into a Set, with states + unlock gate.
  const Tile = ({ t }) => {
    const locked = t.state === 'locked';
    const next = t.state === 'next';
    return (
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 6, background: '#fff', border: '2px solid ' + (next ? GREEN : SPROUT.line), borderRadius: 15, padding: 7, boxShadow: next ? '0 4px 0 ' + GREEN + '55' : 'none', opacity: locked ? 0.6 : 1 }}>
        <div style={{ position: 'relative', height: 56, borderRadius: 10, background: t.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <Icon.Leaf size={26} color={locked ? '#B6A98E' : DEEP} />
          {t.state === 'new' && <span style={{ position: 'absolute', top: 5, left: 5, fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, color: '#fff', background: GREEN, borderRadius: 4, padding: '2px 5px' }}>New</span>}
          {t.state === 'read' && <span style={{ position: 'absolute', top: 5, right: 5, width: 17, height: 17, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Check size={10} color="#fff" /></span>}
          {locked && <span style={{ position: 'absolute', top: 5, right: 5, width: 17, height: 17, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Lock size={10} color="#B6A98E" /></span>}
        </div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: SPROUT.ink, lineHeight: 1.15, padding: '0 2px' }}>{t.title}</div>
        <span style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 3, background: locked ? SPROUT.bg : '#FBF1DA', borderRadius: 999, padding: '2px 8px', margin: '0 2px 2px' }}>
          <Icon.Leaf size={9} color={locked ? SPROUT.mute : GOLD} />
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 9.5, color: locked ? SPROUT.mute : '#A87C1B' }}>+{t.reward}</span>
        </span>
      </div>
    );
  };

  return (
    <AppChrome top="hud" nav="book">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: '11px 14px', minHeight: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16, color: SPROUT.ink }}>Garden Tales</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Set 1 · Sprout Basics</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, color: SPROUT.greenDark, background: '#EAF6E2', border: '1px solid ' + GREEN + '66', borderRadius: 5, padding: '2px 6px' }}>Easy</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          {tales.map((t, i) => <Tile key={i} t={t} />)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 12, padding: '8px 12px', marginTop: 'auto' }}>
          <Icon.Lock size={14} color={SPROUT.mute} />
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11, color: SPROUT.mute }}>Read 2 more to unlock the next set</span>
        </div>
      </div>
    </AppChrome>
  );
}

function ProposedTaleDialogue({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  // café tale: alternating speakers (other = left w/ critter avatar, learner = right cream)
  const lines = [
    { who: 'other', name: 'Bea', text: 'Good evening! What would you like?', tr: 'A polite evening greeting at the café.' },
    { who: 'me', text: "I'd like a cup of tea, please.", tr: 'Ordering a drink politely.' },
    { who: 'other', name: 'Bea', text: 'Of course — with honey?', tr: 'Offering a sweet addition.' },
    { who: 'me', text: 'Yes, thank you so much.', tr: 'Accepting warmly.' },
  ];
  const Speaker = () => (
    <span style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', border: '1.5px solid ' + GREEN + '88', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill={DEEP} stroke={DEEP} strokeWidth="1.5" strokeLinejoin="round"><path d="M11 5L6 9H3v6h3l5 4V5z" /><path d="M16 9a3 3 0 010 6" fill="none" strokeLinecap="round" /></svg>
    </span>
  );
  return (
    <AppChrome top="taleBar">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 14px 8px', minHeight: 0, overflow: 'hidden' }}>
          {lines.map((l, i) => {
            const other = l.who === 'other';
            return (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexDirection: other ? 'row' : 'row-reverse' }}>
                {other && <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: '#FBF1DA', border: '1.5px solid #E8D6A8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Leaf size={14} color={DEEP} /></span>}
                <div style={{
                  maxWidth: '78%', background: other ? '#fff' : '#EAF6E2', border: '1.5px solid ' + (other ? SPROUT.line : GREEN + '66'),
                  borderRadius: 15, borderBottomLeftRadius: other ? 5 : 15, borderBottomRightRadius: other ? 15 : 5, padding: '8px 11px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    {isNew && other && <Speaker />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, color: SPROUT.ink, lineHeight: 1.3 }}>{l.text}</div>
                      {isNew && <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 10, color: SPROUT.mute, marginTop: 3, lineHeight: 1.3 }}>{l.tr}</div>}
                    </div>
                    {isNew && !other && <Speaker />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding: '8px 14px 14px', flexShrink: 0 }}>
          <div style={{ background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.06em', padding: '12px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>CONTINUE</div>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · "Why are you growing?" onboarding motivation step (goal-only → why-first) ──
function ProposedWhyMotivation({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const Progress = ({ pct, step }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px 4px', flexShrink: 0 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
      <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}>
        <div style={{ width: pct, height: '100%', borderRadius: 999, background: SPROUT.green }} />
      </div>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, fontWeight: 700, letterSpacing: '.08em', color: SPROUT.mute }}>{step}</span>
    </div>
  );

  if (!isNew) {
    // CURRENT: onboarding jumps straight to the daily-goal step — no "why".
    const goals = [['5 min', 'Casual'], ['10 min', 'Regular'], ['15 min', 'Serious'], ['20 min', 'Intense']];
    return (
      <React.Fragment>
        <Progress pct="50%" step="3/6" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11, padding: '10px 18px 14px', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div className="exp-bob" style={{ flexShrink: 0 }}><Pip size={44} mood="cheer" /></div>
            <div style={{ position: 'relative', background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '10px 13px', marginTop: 3 }}>
              <span style={{ position: 'absolute', left: -6, top: 13, width: 10, height: 10, background: '#fff', borderLeft: '1.5px solid ' + SPROUT.line, borderBottom: '1.5px solid ' + SPROUT.line, transform: 'rotate(45deg)' }} />
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, color: SPROUT.ink, lineHeight: 1.3 }}>How often do you want to grow?</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {goals.map(([time, desc], i) => {
              const sel = i === 1;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 7, padding: '11px 13px', borderRadius: 14, background: sel ? '#EAF6E2' : '#fff', border: '2px solid ' + (sel ? SPROUT.green : SPROUT.line), boxShadow: sel ? '0 3px 0 ' + SPROUT.green + '55' : 'none' }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14.5, color: sel ? SPROUT.greenDark : SPROUT.ink }}>{time}</span>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 10.5, color: SPROUT.mute }}>a day</span>
                  <span style={{ marginLeft: 'auto', fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11.5, color: sel ? SPROUT.greenDark : SPROUT.mute }}>{desc}</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 'auto', background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.04em', padding: '13px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Continue</div>
        </div>
      </React.Fragment>
    );
  }

  // NEW: a calm "why" motivation step inserted before the goal.
  const reasons = [
    ['Travel', <Icon.Plant size={17} color={DEEP} />],
    ['For work', <Icon.Shield size={17} color={DEEP} />],
    ['Keep my mind sharp', <Icon.Sparkle size={17} color={DEEP} />],
    ['Family & friends', <Icon.Leaf size={17} color={DEEP} />],
    ['Just for fun', <Icon.Star size={17} color={DEEP} />],
  ];
  const SELECTED = 0;
  return (
    <React.Fragment>
      <Progress pct="40%" step="2/6" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 18px 12px', minHeight: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
          <div className="exp-bob" style={{ flexShrink: 0 }}><Pip size={36} mood="cheer" /></div>
          <div style={{ position: 'relative', background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '8px 11px', marginTop: 2 }}>
            <span style={{ position: 'absolute', left: -6, top: 11, width: 10, height: 10, background: '#fff', borderLeft: '1.5px solid ' + SPROUT.line, borderBottom: '1.5px solid ' + SPROUT.line, transform: 'rotate(45deg)' }} />
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12, color: SPROUT.ink, lineHeight: 1.3 }}>Why are you growing a new language?</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {reasons.map(([label, icon], i) => {
            const sel = i === SELECTED;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '7px 11px', borderRadius: 12,
                background: sel ? '#EAF6E2' : '#FFFDF7',
                border: '2px solid ' + (sel ? SPROUT.green : SPROUT.line),
                boxShadow: sel ? '0 3px 0 ' + SPROUT.green + '55' : 'none'
              }}>
                <span style={{ width: 27, height: 27, borderRadius: '50%', flexShrink: 0, background: sel ? '#fff' : '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, color: sel ? SPROUT.greenDark : SPROUT.ink }}>{label}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 'auto', background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.04em', padding: '12px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Continue</div>
      </div>
    </React.Fragment>
  );
}

function ProposedPlacement({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const opts = [
    ['New seedling', 'Start from the very first seed', true],
    ['I know some', 'Skip ahead past the basics', false],
    ['I know a lot', 'Take a quick check to find your level', false],
  ];
  const SELECTED = 0;
  const Progress = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px 4px', flexShrink: 0 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
      <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}>
        <div style={{ width: '40%', height: '100%', borderRadius: 999, background: SPROUT.green }} />
      </div>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, fontWeight: 700, letterSpacing: '.08em', color: SPROUT.mute }}>2/6</span>
    </div>
  );
  if (!isNew) {
    // CURRENT: straight to Unit 1 — a flat "start from scratch" confirm, no placement choice.
    return (
      <React.Fragment>
        <Progress />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 13, padding: '16px 22px', minHeight: 0, overflow: 'hidden' }}>
          <div className="exp-bob" style={{ flexShrink: 0 }}><Pip size={56} mood="cheer" /></div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink, textAlign: 'center', lineHeight: 1.25 }}>Let's start your garden!</div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 12, color: SPROUT.mute, textAlign: 'center', lineHeight: 1.4, maxWidth: 210 }}>You'll begin at Unit 1 and grow from your very first seed.</div>
          <div style={{ width: '100%', marginTop: 4, background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.04em', padding: '13px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Start at Unit 1</div>
        </div>
      </React.Fragment>
    );
  }
  // NEW: a calm placement question with three garden-themed option cards.
  return (
    <React.Fragment>
      <Progress />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: '10px 18px 14px', minHeight: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div className="exp-bob" style={{ flexShrink: 0 }}><Pip size={44} mood="cheer" /></div>
          <div style={{ position: 'relative', background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '10px 13px', marginTop: 3 }}>
            <span style={{ position: 'absolute', left: -6, top: 13, width: 10, height: 10, background: '#fff', borderLeft: '1.5px solid ' + SPROUT.line, borderBottom: '1.5px solid ' + SPROUT.line, transform: 'rotate(45deg)' }} />
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, color: SPROUT.ink, lineHeight: 1.3 }}>How much can you already grow?</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {opts.map(([title, sub, rec], i) => {
            const sel = i === SELECTED;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 11, padding: '12px 13px', borderRadius: 14,
                background: sel ? '#EAF6E2' : '#fff',
                border: '2px solid ' + (sel ? SPROUT.green : SPROUT.line),
                boxShadow: sel ? '0 3px 0 ' + SPROUT.green + '55' : 'none'
              }}>
                <Icon.Leaf size={18} color={sel ? DEEP : SPROUT.mute} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, color: sel ? SPROUT.greenDark : SPROUT.ink }}>{title}</span>
                    {rec && <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, color: SPROUT.mute }}>Recommended</span>}
                  </div>
                  <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 10.5, color: SPROUT.mute, marginTop: 1 }}>{sub}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 'auto', background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.04em', padding: '13px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Continue</div>
      </div>
    </React.Fragment>
  );
}

function ProposedNotifPrime({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';

  if (!isNew) {
    // CURRENT: cold iOS system permission prompt, no lead-in.
    return (
      <React.Fragment>
        <OnboardProgress />
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 12, color: SPROUT.mute, textAlign: 'center', maxWidth: 200, lineHeight: 1.4 }}>Setting up your garden…</div>
          {/* dimmed backdrop + OS alert */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(42,35,32,.28)' }} />
          <div style={{ position: 'relative', width: 215, background: '#F4F2F6', borderRadius: 14, overflow: 'hidden', boxShadow: '0 14px 36px -10px rgba(0,0,0,.4)', fontFamily: '-apple-system, system-ui, sans-serif' }}>
            <div style={{ padding: '17px 16px 14px', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#000', marginBottom: 3 }}>“Sprout” Would Like to Send You Notifications</div>
              <div style={{ fontSize: 10.5, color: '#3C3C43', lineHeight: 1.35 }}>Notifications may include alerts, sounds, and icon badges.</div>
            </div>
            <div style={{ display: 'flex', borderTop: '0.5px solid #C8C7CC' }}>
              <div style={{ flex: 1, textAlign: 'center', padding: '11px 0', fontSize: 13, color: '#007AFF', borderRight: '0.5px solid #C8C7CC' }}>Don't Allow</div>
              <div style={{ flex: 1, textAlign: 'center', padding: '11px 0', fontSize: 13, color: '#007AFF', fontWeight: 600 }}>Allow</div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  // NEW: warm priming screen shown before the OS prompt.
  return (
    <React.Fragment>
      <OnboardProgress />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 13, padding: '14px 22px', minHeight: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 20, color: DEEP, textAlign: 'center', lineHeight: 1.2 }}>Get one gentle daily nudge</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 12, color: SPROUT.mute, textAlign: 'center', lineHeight: 1.4, maxWidth: 220 }}>We'll send a single calm reminder a day so your garden never goes dry.</div>
        {/* Pip + watering-can/bell with a speech bubble */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, margin: '2px 0' }}>
          <div className="exp-bob" style={{ flexShrink: 0 }}><Pip size={52} mood="cheer" /></div>
          <div style={{ position: 'relative', background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '8px 12px', marginTop: 8 }}>
            <span style={{ position: 'absolute', left: -6, top: 13, width: 10, height: 10, background: '#fff', borderLeft: '1.5px solid ' + SPROUT.line, borderBottom: '1.5px solid ' + SPROUT.line, transform: 'rotate(45deg)' }} />
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11.5, color: SPROUT.ink }}>
              <Icon.Droplet size={13} color="#3E92C9" />It's how streaks grow!
            </span>
          </div>
        </div>
        <div style={{ width: '100%', marginTop: 2, background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.04em', padding: '13px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Turn on reminders</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12, color: SPROUT.mute }}>Maybe later</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 9.5, color: '#B0A89C' }}>Change this anytime in Settings.</div>
      </div>
    </React.Fragment>
  );
}

function ProposedGoalCommit({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const goals = [
    ['5 min', 'a day', 'Casual'],
    ['10 min', 'a day', 'Regular'],
    ['15 min', 'a day', 'Serious'],
    ['20 min', 'a day', 'Intense'],
  ];
  const SELECTED = 1; // Regular
  const Progress = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px 4px', flexShrink: 0 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
      <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}>
        <div style={{ width: '88%', height: '100%', borderRadius: 999, background: SPROUT.green }} />
      </div>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, fontWeight: 700, letterSpacing: '.08em', color: SPROUT.mute }}>5/6</span>
    </div>
  );
  if (!isNew) {
    return (
      <React.Fragment>
        <Progress />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11, padding: '14px 18px 14px', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16, color: SPROUT.ink }}>Daily goal</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {goals.map(([time, , desc], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 4px', borderBottom: '1px solid ' + SPROUT.line }}>
                <span style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, border: '2px solid ' + (i === SELECTED ? SPROUT.green : SPROUT.line), background: i === SELECTED ? SPROUT.green : '#fff' }} />
                <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13, color: SPROUT.ink }}>{time} / day</span>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11, color: SPROUT.mute }}>{desc}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'auto', background: '#EAE2D1', color: SPROUT.mute, textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, letterSpacing: '.04em', padding: '11px 0', borderRadius: 12 }}>Continue</div>
        </div>
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <Progress />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11, padding: '10px 18px 14px', minHeight: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div className="exp-bob" style={{ flexShrink: 0 }}><Pip size={44} mood="cheer" /></div>
          <div style={{ position: 'relative', background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '10px 13px', marginTop: 3 }}>
            <span style={{ position: 'absolute', left: -6, top: 13, width: 10, height: 10, background: '#fff', borderLeft: '1.5px solid ' + SPROUT.line, borderBottom: '1.5px solid ' + SPROUT.line, transform: 'rotate(45deg)' }} />
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, color: SPROUT.ink, lineHeight: 1.3 }}>What's your daily watering goal?</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {goals.map(([time, per, desc], i) => {
            const sel = i === SELECTED;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'baseline', gap: 7, padding: '11px 13px', borderRadius: 14,
                background: sel ? '#EAF6E2' : '#fff',
                border: '2px solid ' + (sel ? SPROUT.green : SPROUT.line),
                boxShadow: sel ? '0 3px 0 ' + SPROUT.green + '55' : 'none'
              }}>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14.5, color: sel ? SPROUT.greenDark : SPROUT.ink }}>{time}</span>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 10.5, color: SPROUT.mute }}>{per}</span>
                <span style={{ marginLeft: 'auto', fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11.5, color: sel ? SPROUT.greenDark : SPROUT.mute }}>{desc}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 'auto', background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.04em', padding: '13px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>I'm committed</div>
      </div>
    </React.Fragment>
  );
}

function ProposedReminderTime({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const Progress = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px 4px', flexShrink: 0 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
      <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}>
        <div style={{ width: '94%', height: '100%', borderRadius: 999, background: SPROUT.green }} />
      </div>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, fontWeight: 700, letterSpacing: '.08em', color: SPROUT.mute }}>6/6</span>
    </div>
  );

  if (!isNew) {
    // CURRENT: bare yes/no permission ask, no time choice.
    return (
      <React.Fragment>
        <Progress />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 13, padding: '18px 22px', minHeight: 0 }}>
          <span style={{ width: 56, height: 56, borderRadius: '50%', background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Droplet size={26} color={DEEP} /></span>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 17, color: SPROUT.ink, textAlign: 'center' }}>Turn on notifications?</div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 12, color: SPROUT.mute, textAlign: 'center', maxWidth: 210, lineHeight: 1.4 }}>We'll remind you to practice each day.</div>
          <div style={{ width: '100%', marginTop: 4, background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.04em', padding: '13px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Allow</div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12, color: SPROUT.mute }}>Not now</div>
        </div>
      </React.Fragment>
    );
  }

  // NEW: "When should we water your garden?" — hero, time chip + wheel picker, day pills, toggle, Continue, Set later.
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const hours = ['5', '6', '7', '8', '9'];
  const mins = ['00', '15', '30', '45'];
  const ampm = ['AM', 'PM'];
  const Wheel = ({ vals, sel }) => (
    <div style={{ position: 'relative', flex: 1, height: 70, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
      {vals.map((v, i) => {
        const d = Math.abs(i - sel);
        return <div key={v} style={{ fontFamily: 'Nunito, system-ui', fontWeight: i === sel ? 900 : 700, fontSize: i === sel ? 19 : 14, color: i === sel ? SPROUT.ink : SPROUT.mute, opacity: i === sel ? 1 : (d === 1 ? 0.5 : 0.25), lineHeight: 1.3 }}>{v}</div>;
      })}
    </div>
  );
  return (
    <React.Fragment>
      <Progress />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, padding: '6px 18px 10px', minHeight: 0, overflow: 'hidden' }}>
        <div className="exp-bob" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Pip size={36} mood="cheer" />
          <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#FBF1DA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Droplet size={13} color="#2E8FB0" /></span>
        </div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16.5, color: DEEP, textAlign: 'center', lineHeight: 1.2 }}>When should we water your garden?</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 10.5, color: SPROUT.mute, textAlign: 'center', lineHeight: 1.35, maxWidth: 220 }}>We'll send a gentle nudge. You can change this anytime.</div>

        {/* time chip */}
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#EAF6E2', border: '1.5px solid ' + GREEN + '88', borderRadius: 999, padding: '5px 13px' }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: SPROUT.greenDark }}>7:00 PM</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={SPROUT.greenDark} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        </span>

        {/* iOS-style wheel picker */}
        <div style={{ position: 'relative', width: '100%', background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, display: 'flex', alignItems: 'center', padding: '0 8px' }}>
          <div style={{ position: 'absolute', left: 10, right: 10, top: '50%', height: 30, transform: 'translateY(-50%)', borderRadius: 9, background: '#EAF6E2', zIndex: 0 }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', width: '100%' }}>
            <Wheel vals={hours} sel={2} />
            <Wheel vals={mins} sel={0} />
            <Wheel vals={ampm} sel={1} />
          </div>
        </div>

        {/* day pills */}
        <div style={{ display: 'flex', gap: 6 }}>
          {days.map((d, i) => (
            <span key={i} style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: GREEN, color: '#fff', fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 10.5 }}>{d}</span>
          ))}
        </div>

        {/* daily reminder toggle */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 12, padding: '9px 13px' }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, color: SPROUT.ink }}>Daily reminder</span>
          <span style={{ width: 34, height: 20, borderRadius: 999, background: GREEN, position: 'relative', flexShrink: 0 }}>
            <span style={{ position: 'absolute', top: 2, left: 16, width: 16, height: 16, borderRadius: '50%', background: '#fff' }} />
          </span>
        </div>

        <div style={{ width: '100%', marginTop: 'auto', background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.04em', padding: '12px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Continue</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11, color: SPROUT.mute }}>Set later</div>
      </div>
    </React.Fragment>
  );
}

function ProposedReminderPrime({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';

  if (!isNew) {
    // CURRENT: busy permission-priming — heavy copy + several controls.
    return (
      <React.Fragment>
        <OnboardProgress />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 18px 12px', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16, color: SPROUT.ink, lineHeight: 1.2 }}>Turn on notifications to stay on track</div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 10.5, color: SPROUT.mute, lineHeight: 1.35 }}>Sprout sends reminders, streak alerts, and progress updates so you never miss a day. Change these anytime in Settings.</div>
          {/* a stack of toggle rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 1 }}>
            {[['Daily reminders', true], ['Streak alerts', true], ['Tips & offers', false]].map(([label, on], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 11, padding: '8px 12px' }}>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12, color: SPROUT.ink }}>{label}</span>
                <span style={{ width: 30, height: 18, borderRadius: 999, background: on ? GREEN : '#D8CFBE', position: 'relative', flexShrink: 0 }}>
                  <span style={{ position: 'absolute', top: 2, left: on ? 14 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff' }} />
                </span>
              </div>
            ))}
          </div>
          {/* reminder time row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 11, padding: '8px 12px' }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12, color: SPROUT.ink }}>Reminder time</span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: SPROUT.mute }}>7:00 PM ›</span>
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, letterSpacing: '.04em', padding: '11px 0', borderRadius: 13, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Allow notifications</div>
            <div style={{ textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11, color: SPROUT.mute }}>Not now</div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  // NEW: one warm question + Pip + one big time picker + one button.
  const times = ['5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'];
  return (
    <React.Fragment>
      <OnboardProgress />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 22px 16px', minHeight: 0 }}>
        <div className="exp-bob" style={{ flexShrink: 0 }}><Pip size={56} mood="cheer" /></div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink, textAlign: 'center', lineHeight: 1.25, marginTop: 12 }}>When should I remind you to water your garden?</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 11.5, color: SPROUT.mute, textAlign: 'center', marginTop: 7 }}>A few minutes a day keeps your garden growing.</div>

        {/* big calm value-style time picker */}
        <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, margin: '6px 0' }}>
          {/* selection band */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 150, height: 44, borderRadius: 13, background: '#EAF6E2', border: '1.5px solid ' + GREEN + '66', zIndex: 0 }} />
          {times.map((t, i) => {
            const sel = i === 2;
            const dist = Math.abs(i - 2);
            return (
              <div key={t} style={{ position: 'relative', zIndex: 1, fontFamily: 'Nunito, system-ui', fontWeight: sel ? 900 : 800, fontSize: sel ? 24 : 14, color: sel ? DEEP : SPROUT.mute, opacity: sel ? 1 : (dist === 1 ? 0.55 : 0.28), lineHeight: 1.35 }}>{t}</div>
            );
          })}
        </div>

        <div style={{ width: '100%', flexShrink: 0, background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.04em', padding: '13px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Set my reminder</div>
      </div>
    </React.Fragment>
  );
}

// ── Proposed · Tidy resource HUD (loose emoji+number pairs → one grouped pill + segmented water) ──
function ProposedTidyHud({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';

  // NEW HUD: flag chip left, three resources in one pill with hairline dividers,
  // water rendered as a 5-segment fill.
  const TidyHud = () => {
    const Stat = ({ icon, val, color }) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 9px' }}>{icon}<span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color }}>{val}</span></span>
    );
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px 8px', borderBottom: '1px solid ' + SPROUT.line, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 10, padding: '3px 6px' }}>
          <span style={{ fontSize: 15 }}>🇺🇸</span>
          <Icon.ChevR size={9} color={SPROUT.mute} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 999, padding: '4px 2px', boxShadow: '0 2px 6px -3px rgba(42,35,32,.3)' }}>
          <Stat icon={<Icon.Leaf size={15} color={DEEP} />} val="34" color={DEEP} />
          <span style={{ width: 1, alignSelf: 'stretch', background: SPROUT.line, margin: '2px 0' }} />
          <Stat icon={<Icon.Gem size={14} color="#6C8AE4" />} val="420" color="#3F5FC0" />
          <span style={{ width: 1, alignSelf: 'stretch', background: SPROUT.line, margin: '2px 0' }} />
          {/* water as a 5-segment fill */}
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 9px' }}>
            <Icon.Droplet size={14} color="#2E8FB0" />
            <span style={{ display: 'flex', gap: 1.5 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} style={{ width: 3, height: 11, borderRadius: 1, background: i < 5 ? '#2E8FB0' : '#CFE6EE' }} />
              ))}
            </span>
          </span>
        </div>
      </div>
    );
  };

  // shared path body (same on both phones) — a completed disc, the active START node, a locked disc
  const PathBody = () => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 18px', minHeight: 0 }}>
      <div style={{ width: 50, height: 50, borderRadius: '50%', background: SPROUT.green, boxShadow: '0 4px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: .92 }}>
        <Icon.Check size={24} color="#fff" />
      </div>
      <div style={{ width: 0, height: 26, borderLeft: '3px dotted ' + SPROUT.cream2 }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ background: '#fff', color: SPROUT.greenDark, fontWeight: 900, fontSize: 11, letterSpacing: '.16em', padding: '5px 13px', borderRadius: 999, marginBottom: 8, boxShadow: '0 4px 12px -5px rgba(42,35,32,.3)' }}>START</div>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: SPROUT.green, boxShadow: '0 5px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.Leaf size={30} color="#fff" />
        </div>
      </div>
      <div style={{ width: 0, height: 26, borderLeft: '3px dotted ' + SPROUT.cream2 }} />
      <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#EDE4D2', boxShadow: '0 4px 0 #D9CDB5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B6A98E" strokeWidth="2.4"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round"/></svg>
      </div>
    </div>
  );

  return (
    <React.Fragment>
      {isNew ? <TidyHud /> : <MiniHud />}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}><PathBody /></div>
      <MiniBottomNav active="home" />
    </React.Fragment>
  );
}

// ── Proposed · Replay at two speeds (lone speaker → Play + Play-slowly dual buttons, full HUD chrome) ──
function ProposedListenTwoSpeed({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const tiles = ['Good', 'morning', 'garden', 'water', 'today', 'leaf'];
  const SpeakerGlyph = ({ s }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" /></svg>
  );
  return (
    <AppChrome top="hud" nav="home">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* unit header — identical on both phones */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: SPROUT.greenDark, color: '#fff', padding: '9px 14px', flexShrink: 0 }}>
          <Icon.Book size={14} color="#fff" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.14em', opacity: .85 }}>UNIT 1 · LISTEN</div>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5 }}>Sprout Basics</div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 15, padding: '12px 16px' }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink, textAlign: 'center' }}>Tap what you hear</div>

          {/* the audio control — the ONLY element that differs */}
          {isNew ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 13 }}>
              {/* primary Play */}
              <span style={{ width: 60, height: 60, borderRadius: '50%', flexShrink: 0, background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>
                <SpeakerGlyph s={26} />
              </span>
              {/* secondary Play slowly — snail glyph */}
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', border: '2px solid ' + GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 0 ' + GREEN + '55' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 17c0-2 1.5-3.5 3.5-3.5S9 15 9 17" /><circle cx="13" cy="13.5" r="5.5" /><path d="M2 17h11" /><path d="M16 9l2-3M18.5 8.5l2.5-2" /></svg>
                </span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Slowly</span>
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
              <span style={{ width: 60, height: 60, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>
                <SpeakerGlyph s={26} />
              </span>
            </div>
          )}

          {/* word tiles — identical in both modes */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center', marginTop: 2 }}>
            {tiles.map((w, i) => (
              <span key={i} style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, color: SPROUT.ink, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 11, padding: '8px 13px', boxShadow: '0 2px 0 ' + SPROUT.line }}>{w}</span>
            ))}
          </div>
          <div style={{ background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.06em', padding: '12px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow, marginTop: 4 }}>CHECK</div>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Scrubbable listen player (lone speaker → play/pause + scrub track + turtle) ──
function ProposedListenPlayer({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const tiles = ['Good', 'morning', 'garden', 'water', 'today', 'leaf'];
  const Body = (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14, padding: '12px 16px' }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink }}>What do you hear?</div>

        {/* the audio control — the ONLY element that differs */}
        {isNew ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 16, padding: '11px 13px' }}>
            <span style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 0 ' + SPROUT.greenShadow }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><rect x="5" y="4" width="4.5" height="16" rx="1.2" /><rect x="14.5" y="4" width="4.5" height="16" rx="1.2" /></svg>
            </span>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {/* scrub track — dotted waveform with deep-green fill + scrub head */}
              <div style={{ position: 'relative', height: 16, display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2.5, width: '100%', height: 16 }}>
                  {Array.from({ length: 34 }).map((_, i) => {
                    const played = i / 34 < 0.46;
                    const h = 5 + (Math.sin(i * 0.9) * 0.5 + 0.5) * 9;
                    return <span key={i} style={{ flex: 1, height: h, borderRadius: 999, background: played ? DEEP : '#D8CFBE' }} />;
                  })}
                </div>
                <span style={{ position: 'absolute', left: '46%', top: '50%', transform: 'translate(-50%,-50%)', width: 13, height: 13, borderRadius: '50%', background: '#fff', border: '2.5px solid ' + DEEP, boxShadow: '0 1px 3px rgba(42,35,32,.25)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: SPROUT.mute, fontWeight: 700 }}>0:03</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: SPROUT.mute, fontWeight: 700 }}>0:06</span>
              </div>
            </div>
            {/* slow / turtle button */}
            <span style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', border: '1.5px solid ' + GREEN + '66', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <iconify-icon icon="ph:rabbit-duotone" width="17" style={{ color: DEEP, display: 'none' }}></iconify-icon>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 14c0-3 2.5-5 6-5h3l4-3v4a4 4 0 0 1-4 4H8" /><circle cx="7" cy="17" r="2" /><circle cx="16" cy="17" r="2" /><path d="M17 9c1.5-1 3-1 3-3" /></svg>
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
            <span style={{ width: 60, height: 60, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" /></svg>
            </span>
          </div>
        )}

        {/* word tiles — identical in both modes */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center', marginTop: 2 }}>
          {tiles.map((w, i) => (
            <span key={i} style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, color: SPROUT.ink, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 11, padding: '8px 13px', boxShadow: '0 2px 0 ' + SPROUT.line }}>{w}</span>
          ))}
        </div>
      </div>

      {/* CHECK button — identical in both modes */}
      <div style={{ padding: '10px 16px 14px', flexShrink: 0 }}>
        <div style={{ background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.06em', padding: '12px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>CHECK</div>
      </div>
    </div>
  );
  return <AppChrome top="exercise">{Body}</AppChrome>;
}

// ── Proposed · Out-of-water moment (4-choice paywall modal → calm practice-first refill sheet) ──
function ProposedOutOfWater({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const DEEP = '#3fa52e', GREEN = '#6fbf5e', GOLD = '#E5A93A', GEM = '#6C8AE4';

  // shared dimmed lesson behind the sheet — IDENTICAL on both phones
  const opts = [
    { glyph: '🐕', label: 'a dog', sel: true }, { glyph: '🐈', label: 'a cat' },
    { glyph: '🐦', label: 'a bird' }, { glyph: '🐟', label: 'a fish' },
  ];
  const FILL = 0.55;
  const Lesson = () => (
    <React.Fragment>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px 9px', flexShrink: 0 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        <div style={{ flex: 1, height: 9, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}>
          <div style={{ width: (FILL * 100) + '%', height: '100%', borderRadius: 999, background: SPROUT.green }} />
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><Icon.Droplet size={13} color="#2E8FB0" /><span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: '#2E8FB0' }}>0</span></span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 15, padding: '10px 18px 18px', minHeight: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: SPROUT.ink, textAlign: 'center' }}>Which one is the dog?</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
          {opts.map((o, i) => {
            const on = o.sel;
            return (
              <div key={i} style={{ borderRadius: 16, padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: on ? '#EAF6E2' : '#fff', border: '2px solid ' + (on ? SPROUT.green : SPROUT.line), boxShadow: '0 3px 0 ' + (on ? SPROUT.greenShadow : SPROUT.cardShadow) }}>
                <div style={{ width: 50, height: 50, borderRadius: 13, background: on ? '#fff' : SPROUT.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 27 }}>{o.glyph}</div>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13, color: on ? SPROUT.greenDark : SPROUT.ink }}>{o.label}</span>
              </div>
            );
          })}
        </div>
        <div style={{ background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, padding: '12px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow, letterSpacing: '.08em' }}>CHECK</div>
      </div>
    </React.Fragment>
  );

  // CURRENT: stacked 4-choice modal with Sprout Plus pushed to the front (feels like a paywall)
  const CurrentModal = () => (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 3, background: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, boxShadow: '0 -12px 28px -18px rgba(42,35,32,.5)', padding: '15px 15px 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
      <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16, color: SPROUT.ink, textAlign: 'center' }}>You ran out of water!</div>
      {/* Sprout Plus pushed to the front, loud */}
      <div style={{ position: 'relative', background: 'linear-gradient(120deg,#6fbf5e,#3fa52e)', borderRadius: 14, padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 5px 14px -6px rgba(63,165,46,.6)' }}>
        <span style={{ position: 'absolute', top: -7, right: 12, background: GOLD, color: '#5A3D08', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 8, letterSpacing: '.08em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 999 }}>Best value</span>
        <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon.Crown size={17} color="#fff" /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: '#fff' }}>Try Sprout Plus</div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 10.5, color: 'rgba(255,255,255,.9)' }}>Unlimited water · no waiting</div>
        </div>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: '#fff' }}>›</span>
      </div>
      {[
        { icon: <Icon.Diamond size={16} color={GEM} />, t: 'Refill water', s: '350 gems', chev: true },
        { icon: <Icon.Clock size={16} color="#2E8FB0" />, t: 'Wait for refill', s: 'Next drop in 4:51', chev: false },
        { icon: <Icon.Droplet size={16} color="#2E8FB0" />, t: 'Use Watering Can', s: 'Full refill · 2 in inventory', chev: true },
      ].map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '10px 12px' }}>
          <span style={{ width: 30, height: 30, borderRadius: '50%', background: SPROUT.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{r.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>{r.t}</div>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 10, color: SPROUT.mute }}>{r.s}</div>
          </div>
          {r.chev && <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.mute }}>›</span>}
        </div>
      ))}
      <div style={{ textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11.5, color: SPROUT.mute, marginTop: 1 }}>No thanks</div>
    </div>
  );

  // NEW: calm practice-first sheet — free "Practice — earn a drop" pre-selected, upgrade demoted
  const refillOpts = [
    { key: 'practice', icon: <Icon.Leaf size={17} color={DEEP} />, t: 'Practice', s: 'Earn a drop', sel: true },
    { key: 'gems', icon: <Icon.Diamond size={16} color={GEM} />, t: 'Refill', s: '350 gems', sel: false },
    { key: 'plus', icon: <Icon.Crown size={16} color={GOLD} />, t: 'Sprout Plus', s: 'Unlimited', sel: false },
  ];
  const NewSheet = () => (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 3, background: '#FFFDF7', borderTopLeftRadius: 22, borderTopRightRadius: 22, boxShadow: '0 -12px 28px -18px rgba(42,35,32,.5)', padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 }}>
      <span style={{ width: 34, height: 4, borderRadius: 999, background: SPROUT.line, marginBottom: 1 }} />
      <div className="exp-bob" style={{ position: 'relative', flexShrink: 0 }}>
        <Pip size={48} mood="sleepy" />
        <span style={{ position: 'absolute', right: -11, bottom: 1, fontSize: 19 }} role="img" aria-label="empty watering can">🪣</span>
      </div>
      <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16.5, color: SPROUT.ink, textAlign: 'center' }}>Your garden needs water</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11.5, color: SPROUT.mute }}>
        <Icon.Clock size={12} color={SPROUT.mute} />Next drop in 4:51
      </div>
      {/* three calm equals — free practice pre-selected */}
      <div style={{ display: 'flex', gap: 8, width: '100%', marginTop: 3 }}>
        {refillOpts.map((o, i) => (
          <div key={i} style={{ flex: 1, minWidth: 0, position: 'relative', borderRadius: 14, padding: '11px 6px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center', background: o.sel ? '#EAF6E2' : '#fff', border: '2px solid ' + (o.sel ? GREEN : SPROUT.line), boxShadow: o.sel ? '0 3px 0 ' + SPROUT.greenShadow : '0 2px 0 ' + SPROUT.cream2 }}>
            {o.sel && (
              <span style={{ position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Check size={10} color="#fff" /></span>
            )}
            <span style={{ width: 30, height: 30, borderRadius: '50%', background: o.sel ? '#fff' : SPROUT.cream, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{o.icon}</span>
            <div>
              <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11.5, color: SPROUT.ink, lineHeight: 1.1 }}>{o.t}</div>
              <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 9.5, color: SPROUT.mute, marginTop: 2 }}>{o.s}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ width: '100%', marginTop: 4, background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.04em', padding: '13px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Practice to refill</div>
      <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, letterSpacing: '.04em', color: SPROUT.mute }}>Not now</div>
    </div>
  );

  return (
    <AppChrome>
      <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <Lesson />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(42,35,32,.4)', zIndex: 2 }} />
        {isNew ? <NewSheet /> : <CurrentModal />}
      </div>
    </AppChrome>
  );
}

// ── Proposed · Gentle leave-lesson guard (instant quit → calm confirm sheet over dimmed lesson) ──
function ProposedLeaveGuard({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const CLAY = '#ff8a80';
  const opts = [
    { glyph: '🐕', label: 'a dog' }, { glyph: '🐈', label: 'a cat', sel: true },
    { glyph: '🐦', label: 'a bird' }, { glyph: '🐟', label: 'a fish' },
  ];
  const FILL = 0.55;
  // shared exercise body + in-lesson header — identical on BOTH phones
  const Lesson = () => (
    <React.Fragment>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px 9px', flexShrink: 0 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        <div style={{ flex: 1, height: 9, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}>
          <div style={{ width: (FILL * 100) + '%', height: '100%', borderRadius: 999, background: SPROUT.green }} />
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><Icon.Droplet size={13} color="#2E8FB0" /><span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: '#2E8FB0' }}>4</span></span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 15, padding: '10px 18px 18px', minHeight: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: SPROUT.ink, textAlign: 'center' }}>Which one is the cat?</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
          {opts.map((o, i) => {
            const on = o.sel;
            return (
              <div key={i} style={{ borderRadius: 16, padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: on ? '#EAF6E2' : '#fff', border: '2px solid ' + (on ? SPROUT.green : SPROUT.line), boxShadow: '0 3px 0 ' + (on ? SPROUT.greenShadow : SPROUT.cardShadow) }}>
                <div style={{ width: 50, height: 50, borderRadius: 13, background: on ? '#fff' : SPROUT.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 27 }}>{o.glyph}</div>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13, color: on ? SPROUT.greenDark : SPROUT.ink }}>{o.label}</span>
              </div>
            );
          })}
        </div>
        <div style={{ background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, padding: '12px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow, letterSpacing: '.08em' }}>CHECK</div>
      </div>
    </React.Fragment>
  );
  return (
    <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Lesson />
      {isNew && (
        <React.Fragment>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(42,35,32,.4)', zIndex: 2 }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 3, background: '#FFFDF7', borderTopLeftRadius: 22, borderTopRightRadius: 22, boxShadow: '0 -12px 28px -18px rgba(42,35,32,.5)', padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div className="exp-bob" style={{ flexShrink: 0 }}><Pip size={52} mood="sleepy" /></div>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16.5, color: SPROUT.ink, textAlign: 'center' }}>Don't let your seedling wilt!</div>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 11.5, color: SPROUT.mute, textAlign: 'center', maxWidth: 220, lineHeight: 1.35 }}>Quit now and you'll lose this lesson's progress.</div>
            <div style={{ width: '100%', marginTop: 3, background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.06em', padding: '13px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>KEEP GROWING</div>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, letterSpacing: '.06em', color: CLAY }}>End lesson</div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

// ── Proposed · Calm in-lesson progress header (flat top → ✕ exit + growing-green bar + 💧 momentum) ──
// Same MC exercise body on BOTH phones; ONLY the top header strip differs.
function ProposedLessonHeader({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const opts = [
    { glyph: '🐕', label: 'a dog', sel: false },
    { glyph: '🐈', label: 'a cat', sel: true },
    { glyph: '🐦', label: 'a bird', sel: false },
    { glyph: '🐟', label: 'a fish', sel: false },
  ];
  const FILL = 0.55;
  const Header = () => (
    isNew ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px 9px', flexShrink: 0 }}>
        <span style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </span>
        <div style={{ position: 'relative', flex: 1, height: 11, borderRadius: 999, background: '#EAE2D1' }}>
          <div style={{ width: (FILL * 100) + '%', height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,' + GREEN + ',' + DEEP + ')' }} />
          <span style={{ position: 'absolute', top: '50%', left: 'calc(' + (FILL * 100) + '% - 9px)', transform: 'translateY(-50%)', width: 18, height: 18, borderRadius: '50%', background: '#fff', border: '1.5px solid ' + DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(42,35,32,.25)' }}>
            <Icon.Leaf size={10} color={DEEP} />
          </span>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 2, background: '#E5F2F8', borderRadius: 999, padding: '3px 8px 3px 6px', flexShrink: 0 }}>
          <Icon.Droplet size={12} color="#2E8FB0" />
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: '#2E8FB0' }}>×3</span>
        </span>
      </div>
    ) : (
      // CURRENT: a flat top — a thin short centered bar, no clear exit, no momentum.
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px 14px 11px', flexShrink: 0 }}>
        <div style={{ width: 120, height: 4, borderRadius: 999, background: '#E0D8C9', overflow: 'hidden' }}>
          <div style={{ width: (FILL * 100) + '%', height: '100%', background: SPROUT.mute }} />
        </div>
      </div>
    )
  );
  return (
    <React.Fragment>
      <Header />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, padding: '10px 18px 18px', minHeight: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: SPROUT.ink, textAlign: 'center' }}>Which one is the dog?</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
          {opts.map((o, i) => {
            const on = o.sel;
            const st = on
              ? { background: '#EAF6E2', border: '2px solid ' + SPROUT.green, boxShadow: '0 3px 0 ' + SPROUT.greenShadow, transform: 'translateY(-2px)' }
              : { background: '#fff', border: '2px solid ' + SPROUT.line, boxShadow: '0 3px 0 ' + SPROUT.cardShadow, transform: 'none' };
            return (
              <div key={i} style={{ borderRadius: 16, padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', ...st }}>
                {on && (
                  <span style={{ position: 'absolute', top: 7, right: 7, width: 20, height: 20, borderRadius: '50%', background: SPROUT.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon.Check size={12} color="#fff" />
                  </span>
                )}
                <div style={{ width: 52, height: 52, borderRadius: 13, background: on ? '#fff' : SPROUT.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{o.glyph}</div>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13.5, color: on ? SPROUT.greenDark : SPROUT.ink }}>{o.label}</span>
              </div>
            );
          })}
        </div>
        <div style={{ background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, padding: '12px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow, letterSpacing: '.08em' }}>CHECK</div>
      </div>
    </React.Fragment>
  );
}

// ── Proposed · Tale intro cover (jump straight to dialogue → full-screen scene-setting cover) ──
function ProposedTaleIntro({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';

  if (!isNew) {
    // CURRENT: tapping a tale drops straight into the dialogue, no framing.
    const lines = [
      { who: 'Bea', other: true, t: 'Welcome to the garden café!' },
      { who: 'You', other: false, t: 'A cup of tea, please.' },
      { who: 'Bea', other: true, t: 'Of course — milk or honey?' },
    ];
    return (
      <AppChrome>
        <MiniTaleTop />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11, padding: '12px 14px', minHeight: 0, justifyContent: 'center' }}>
          {lines.map((l, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexDirection: l.other ? 'row' : 'row-reverse' }}>
              {l.other && <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: '#FBF1DA', border: '1.5px solid #E8D6A8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Leaf size={14} color="#C2871B" /></span>}
              <div style={{ maxWidth: '78%', background: l.other ? '#fff' : '#EAF6E2', border: '1.5px solid ' + (l.other ? SPROUT.line : GREEN + '66'), borderRadius: 14, padding: '9px 12px', fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, color: SPROUT.ink }}>{l.t}</div>
            </div>
          ))}
        </div>
      </AppChrome>
    );
  }

  // NEW: a calm full-screen tale cover before the dialogue begins.
  const ClockGlyph = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
  const ChatGlyph = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" /></svg>);
  const chips = [
    { g: <ClockGlyph />, v: '≈3 min' }, { g: <ChatGlyph />, v: '12 lines' }, { g: <Icon.Leaf size={13} color={DEEP} />, v: '+15 seeds' },
  ];
  return (
    <AppChrome>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* eyebrow + close */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px 4px', flexShrink: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.18em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Garden Tale</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 13, padding: '8px 22px 14px', minHeight: 0 }}>
          {/* hero — Pip beside Bea */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
            <Pip size={58} mood="cheer" />
            <span style={{ width: 50, height: 50, borderRadius: '50%', background: 'radial-gradient(circle at 50% 40%, #FBE9C8, #F3D9A8)', border: '2px solid #E8D6A8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}><Icon.Leaf size={24} color="#C2871B" /></span>
          </div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 23, color: DEEP, textAlign: 'center', lineHeight: 1.15 }}>Tea with Bea</div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 12, color: SPROUT.mute, textAlign: 'center', maxWidth: 220, lineHeight: 1.4 }}>Join Bea at the garden café and order your first cup.</div>
          {/* stat chips */}
          <div style={{ display: 'flex', gap: 8 }}>
            {chips.map((c, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 999, padding: '6px 11px' }}>
                {c.g}<span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11, color: SPROUT.ink }}>{c.v}</span>
              </span>
            ))}
          </div>
        </div>
        <div style={{ padding: '0 18px 16px', flexShrink: 0 }}>
          <div style={{ background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14.5, letterSpacing: '.06em', padding: '14px 0', borderRadius: 15, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>START TALE</div>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · New-word audio prompt (static text prompt → NEW WORD eyebrow + tappable audio chip) ──
function ProposedNewWordPrompt({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const opts = [
    { glyph: '🌳', label: 'tree', sel: false }, { glyph: '🌷', label: 'tulip', sel: false },
    { glyph: '🍃', label: 'leaf', sel: false }, { glyph: '🌻', label: 'sunflower', sel: false },
  ];
  const SpeakerGlyph = ({ s, c }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /></svg>
  );
  return (
    <AppChrome top="hud" nav="home">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: SPROUT.greenDark, color: '#fff', padding: '9px 14px', flexShrink: 0 }}>
          <Icon.Book size={14} color="#fff" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.14em', opacity: .85 }}>UNIT 1 · NEW WORDS</div>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5 }}>Sprout Basics</div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14, padding: '12px 18px 16px', minHeight: 0 }}>
          {/* prompt area — the ONLY element that differs */}
          {isNew ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Icon.Leaf size={11} color={DEEP} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 700, color: DEEP }}>New word</span>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: SPROUT.ink }}>Which one is</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EAF6E2', border: '1.5px solid ' + GREEN + '88', borderRadius: 11, padding: '5px 10px' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><SpeakerGlyph s={13} c="#fff" /></span>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: SPROUT.greenDark, borderBottom: '2px dotted ' + GREEN }}>tulip</span>
                </span>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: SPROUT.ink }}>?</span>
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: SPROUT.ink, textAlign: 'center' }}>Which one is the tulip?</div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
            {opts.map((o, i) => (
              <div key={i} style={{ borderRadius: 16, padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: '#fff', border: '2px solid ' + SPROUT.line, boxShadow: '0 3px 0 ' + SPROUT.cardShadow }}>
                <div style={{ width: 52, height: 52, borderRadius: 13, background: SPROUT.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{o.glyph}</div>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13.5, color: SPROUT.ink }}>{o.label}</span>
              </div>
            ))}
          </div>
          <div style={{ background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, padding: '12px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow, letterSpacing: '.08em' }}>CHECK</div>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Matched pairs clear the grid (full static grid → matched pairs collapse + N/5 counter) ──
function ProposedMatchCollapse({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e', CLAY = '#ff8a80';
  // CURRENT: full 5-row grid, one pair just tapped but stays in place (cluttered wall of 10)
  const curLeft = [
    { t: 'Bloom', st: 'marked' }, { t: 'Sprout', st: 'idle' }, { t: 'Meadow', st: 'idle' }, { t: 'Wilt', st: 'idle' }, { t: 'Seed', st: 'idle' },
  ];
  const curRight = [
    { t: 'Field', st: 'idle' }, { t: 'Flower', st: 'marked' }, { t: 'Bud', st: 'idle' }, { t: 'Droop', st: 'idle' }, { t: 'Pip', st: 'idle' },
  ];
  // NEW: 2 pairs already cleared (gone), shorter 3-row grid; most-recent pair caught mid-fade (green fill)
  const newLeft = [
    { t: 'Meadow', st: 'fill' }, { t: 'Wilt', st: 'idle' }, { t: 'Seed', st: 'idle' },
  ];
  const newRight = [
    { t: 'Droop', st: 'idle' }, { t: 'Field', st: 'fill' }, { t: 'Pip', st: 'idle' },
  ];

  const Tile = ({ t, st }) => {
    if (!isNew) {
      const marked = st === 'marked';
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1.5px solid ' + (marked ? SPROUT.mute : SPROUT.line), borderRadius: 12, padding: '12px 8px', minHeight: 42, boxSizing: 'border-box' }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13, color: SPROUT.ink }}>{t}</span>
        </div>
      );
    }
    const fill = st === 'fill';
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 12, padding: '12px 8px', minHeight: 42, boxSizing: 'border-box',
        background: fill ? GREEN : '#fff',
        border: '2px solid ' + (fill ? DEEP : SPROUT.line),
        boxShadow: fill ? '0 3px 0 ' + DEEP + '55' : 'none'
      }}>
        {fill && <Icon.Leaf size={12} color="#fff" />}
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13, color: fill ? '#fff' : SPROUT.ink }}>{t}</span>
      </div>
    );
  };
  const L = isNew ? newLeft : curLeft, R = isNew ? newRight : curRight;
  return (
    <AppChrome top="exercise">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: '12px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 13 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: SPROUT.ink }}>Tap the matching pairs</span>
          {isNew && <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: '.1em', fontWeight: 700, color: DEEP }}>2 / 5 pairs</span>}
        </div>
        <div style={{ flex: 1, display: 'flex', gap: 10, minHeight: 0, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>{L.map((x, i) => <Tile key={i} {...x} />)}</div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>{R.map((x, i) => <Tile key={i} {...x} />)}</div>
        </div>
        <div style={{ background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.06em', padding: '12px 0', borderRadius: 13, margin: '13px 0', boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>CHECK</div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Match three-state tiles (barely-changing tiles → picked / matched / mismatch) ──
function ProposedMatchTiles({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e', CLAY = '#ff8a80';
  // left column = target words, right column = English; states shown mid-interaction
  const left = [
    { t: 'Bloom', st: 'matched' },
    { t: 'Sprout', st: 'picked' },
    { t: 'Meadow', st: 'idle' },
    { t: 'Wilt', st: 'mismatch' },
  ];
  const right = [
    { t: 'Flower', st: 'matched' },
    { t: 'Field', st: 'idle' },
    { t: 'Bud', st: 'idle' },
    { t: 'Droop', st: 'mismatch' },
  ];
  const Tile = ({ t, st }) => {
    // CURRENT: tiles barely change — only a faint border on picked, matched looks the same
    if (!isNew) {
      const faintPick = st === 'picked';
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1.5px solid ' + (faintPick ? SPROUT.mute : SPROUT.line), borderRadius: 12, padding: '13px 8px', minHeight: 44, boxSizing: 'border-box' }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13, color: SPROUT.ink }}>{t}</span>
        </div>
      );
    }
    // NEW: three unmistakable states
    const isPick = st === 'picked', isMatch = st === 'matched', isMiss = st === 'mismatch';
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 12, padding: '13px 8px', minHeight: 44, boxSizing: 'border-box',
        background: isPick ? '#eaf6e4' : (isMiss ? '#ffece9' : '#fff'),
        border: '2px solid ' + (isPick ? DEEP : (isMiss ? CLAY : (isMatch ? '#E4EFD8' : SPROUT.line))),
        boxShadow: isPick ? '0 3px 0 ' + GREEN + '66' : 'none',
        opacity: isMatch ? 0.55 : 1,
        transform: isPick ? 'translateY(-1px)' : 'none'
      }}>
        {isMatch && <Icon.Leaf size={12} color={DEEP} />}
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13, color: isPick ? DEEP : (isMiss ? '#C7584F' : (isMatch ? SPROUT.mute : SPROUT.ink)), textDecoration: isMatch ? 'line-through' : 'none' }}>{t}</span>
      </div>
    );
  };
  return (
    <AppChrome top="exercise">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: '12px 16px 0' }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: SPROUT.ink, marginBottom: 13 }}>Tap the matching pairs</div>
        <div style={{ flex: 1, display: 'flex', gap: 10, minHeight: 0 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>{left.map((x, i) => <Tile key={i} {...x} />)}</div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>{right.map((x, i) => <Tile key={i} {...x} />)}</div>
        </div>
        <div style={{ background: isNew ? GREEN : '#EAE2D1', color: isNew ? '#fff' : SPROUT.mute, textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.06em', padding: '12px 0', borderRadius: 13, margin: '13px 0', boxShadow: isNew ? '0 4px 0 ' + SPROUT.greenShadow : 'none' }}>CHECK</div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Cloze in context (faint underline gap → inline dashed slot + meaning line + seated chip) ──
function ProposedClozeContext({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  // sentence "She ___ to school every day." — answer = goes
  const bank = ['goes', 'go', 'going'];
  const PLACED = isNew; // NEW shows the chosen word seated in the slot
  const Tile = ({ label, ghost }) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13,
      padding: '9px 15px', borderRadius: 11,
      background: ghost ? 'transparent' : '#fff',
      border: ghost ? '1.5px dashed ' + SPROUT.line : '1.5px solid ' + SPROUT.line,
      color: ghost ? 'transparent' : SPROUT.ink,
      boxShadow: ghost ? 'none' : '0 2px 0 ' + SPROUT.cream2,
    }}>{label}</span>
  );
  return (
    <AppChrome top="exercise">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, padding: '14px 16px', minHeight: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink }}>{isNew ? 'Complete the sentence' : 'Fill in the blank'}</div>

        {isNew ? (
          <React.Fragment>
            {/* quiet meaning line for context */}
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.12em', textTransform: 'uppercase', color: SPROUT.mute }}>Meaning · a daily routine</div>
            {/* sentence as one line with the inline gap seated as a soft-green chip */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 7px', fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 17, color: SPROUT.ink, lineHeight: 1.5 }}>
              <span>She</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14.5, padding: '6px 15px', borderRadius: 10, background: '#EAF6E2', border: '2px solid ' + SPROUT.green, color: SPROUT.greenDark, boxShadow: '0 2px 0 ' + SPROUT.green + '55' }}>goes</span>
              <span>to school every day.</span>
            </div>
            {/* bank with a ghost slot where the seated word came from */}
            <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {bank.map((w, i) => <Tile key={i} label={w} ghost={w === 'goes'} />)}
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {/* sentence with a faint underline gap; reads as fragments, no meaning */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '6px 7px', fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 17, color: SPROUT.ink, lineHeight: 1.5 }}>
              <span>She</span>
              <span style={{ width: 54, borderBottom: '2px solid ' + SPROUT.line, height: 22 }} />
              <span>to school every day.</span>
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {bank.map((w, i) => <Tile key={i} label={w} />)}
            </div>
          </React.Fragment>
        )}

        <div style={{ flexShrink: 0, background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.06em', padding: '12px 0', borderRadius: 13, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>CHECK</div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Cloze chip-drop (detached gap + loose chips → inline slot the chip flies into, ghost + meaning line) ──
function ProposedClozeDrop({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const bank = ['water', 'juice', 'milk'];
  const ANSWER = 'water';

  // NEW is interactive: tap a chip → it seats in the blank (leaving a ghost), tap the
  // seated word → it returns. CHECK stays disabled until the blank is filled.
  const [filled, setFilled] = React.useState(ANSWER);

  // shared bank chip (resting / ghost)
  const Chip = ({ label, ghost, onTap }) => (
    <span
      onClick={onTap}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13,
        padding: '9px 16px', borderRadius: 11,
        background: ghost ? 'transparent' : '#fff',
        border: ghost ? '1.5px dashed ' + SPROUT.line : '1.5px solid ' + SPROUT.line,
        color: ghost ? 'transparent' : SPROUT.ink,
        boxShadow: ghost ? 'none' : '0 2px 0 ' + SPROUT.cream2,
        cursor: onTap ? 'pointer' : 'default', userSelect: 'none',
        transition: 'box-shadow .15s, transform .15s',
      }}
    >{label}</span>
  );

  // the inline blank — an underlined slot that the seated word drops into
  const Blank = () => {
    if (isNew && filled) {
      return (
        <span
          onClick={() => setFilled(null)}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15.5,
            padding: '5px 15px', borderRadius: 10,
            background: '#EAF6E2', border: '2px solid ' + GREEN, color: DEEP,
            boxShadow: '0 2px 0 ' + GREEN + '55', cursor: 'pointer', userSelect: 'none',
            opacity: 1, transition: 'transform .2s, box-shadow .2s',
          }}
        >{filled}</span>
      );
    }
    // empty underlined slot — sits inline in the sentence flow
    return (
      <span style={{
        display: 'inline-block', width: 70, height: 0, verticalAlign: 'middle',
        borderBottom: '2.5px solid ' + (isNew ? SPROUT.line : SPROUT.line),
        margin: '0 2px',
      }} />
    );
  };

  const checkOn = isNew ? !!filled : true;

  return (
    <AppChrome top="exercise">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, padding: '14px 16px', minHeight: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink }}>{isNew ? 'Complete the sentence' : 'Fill in the blank'}</div>

        {isNew ? (
          <React.Fragment>
            {/* sentence reads as one natural line; the blank is inline in the flow */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '7px 7px', fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 17, color: SPROUT.ink, lineHeight: 1.55 }}>
              <span>Pip wants a glass of</span>
              <Blank />
              <span>.</span>
            </div>
            {/* quiet gray meaning line, directly under the sentence, for context */}
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 12.5, color: SPROUT.mute, marginTop: -6 }}>Pip is thirsty after watering the garden.</div>
            {/* word bank — the tapped chip leaves a calm ghost slot behind */}
            <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: 9 }}>
              {bank.map((w, i) => (
                <Chip
                  key={i}
                  label={w}
                  ghost={filled === w}
                  onTap={filled === w ? undefined : () => setFilled(w)}
                />
              ))}
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {/* CURRENT: a detached underline gap; the sentence reads as fragments */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '7px 7px', fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 17, color: SPROUT.ink, lineHeight: 1.55 }}>
              <span>Pip wants a glass of</span>
              <span style={{ width: 70, borderBottom: '2.5px solid ' + SPROUT.line, height: 24 }} />
              <span>.</span>
            </div>
            {/* CURRENT: a loose, disconnected row of chips — no trace once tapped */}
            <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: 9 }}>
              {bank.map((w, i) => <Chip key={i} label={w} />)}
            </div>
          </React.Fragment>
        )}

        <div style={{
          flexShrink: 0, textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900,
          fontSize: 13.5, letterSpacing: '.06em', padding: '12px 0', borderRadius: 13,
          background: checkOn ? SPROUT.green : '#EAE2D1',
          color: checkOn ? '#fff' : '#B6A98E',
          boxShadow: checkOn ? '0 4px 0 ' + SPROUT.greenShadow : 'none',
          transition: 'background .2s, color .2s, box-shadow .2s',
          cursor: 'default', userSelect: 'none',
        }}>CHECK</div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Readable cloze (plain underline + chips → cream reading card, tinted slot + English gloss) ──
function ProposedClozeReadable({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const DEEP = '#3fa52e', GREEN = '#6fbf5e';
  const ANSWER = 'are';
  const bank = ['are', 'is', 'am'];
  // static snapshot — NEW shows the selected chip already seated in the tinted slot
  const selected = ANSWER;

  // shared bank chip (resting / seated-elsewhere ghost)
  const Chip = ({ label, used }) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 14,
      padding: '10px 18px', borderRadius: 12,
      background: used ? 'transparent' : '#fff',
      border: used ? '1.5px dashed ' + SPROUT.line : '1.5px solid ' + SPROUT.line,
      color: used ? 'transparent' : SPROUT.ink,
      boxShadow: used ? 'none' : '0 2px 0 ' + SPROUT.cream2, userSelect: 'none',
    }}>{label}</span>
  );

  return (
    <AppChrome top="exercise">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: '14px 16px', minHeight: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink }}>{isNew ? 'Complete the sentence' : 'Fill in the blank'}</div>

        {isNew ? (
          <React.Fragment>
            {/* calm cream reading card holding the sentence + a clearly tinted slot */}
            <div style={{ background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 18, padding: '18px 16px 15px', boxShadow: '0 6px 16px -12px rgba(42,35,32,.3)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 7px', fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 18, color: SPROUT.ink, lineHeight: 1.5 }}>
                <span>You</span>
                {/* the seated word — fills the soft-green tinted slot */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16.5,
                  padding: '6px 17px', borderRadius: 11,
                  background: '#EAF6E2', border: '2px solid ' + GREEN, color: DEEP,
                  boxShadow: '0 3px 0 ' + GREEN + '55', transform: 'translateY(-1px)',
                }}>{selected}</span>
                <span>watering the garden.</span>
              </div>
              {/* one muted English gloss line directly beneath the sentence */}
              <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 12.5, color: SPROUT.mute, marginTop: 11 }}>Right now, you are watering the garden.</div>
            </div>
            {/* answer chips — the selected one is seated above, shown here as a calm ghost */}
            <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: 9 }}>
              {bank.map((w, i) => <Chip key={i} label={w} used={w === selected} />)}
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {/* CURRENT: plain sentence text with a thin underline blank — no card, no meaning line */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '8px 7px', fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 18, color: SPROUT.ink, lineHeight: 1.5, padding: '4px 2px' }}>
              <span>You</span>
              <span style={{ width: 56, borderBottom: '2px solid ' + SPROUT.line, height: 22 }} />
              <span>watering the garden.</span>
            </div>
            {/* CURRENT: the answer chips below */}
            <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: 9 }}>
              {bank.map((w, i) => <Chip key={i} label={w} />)}
            </div>
          </React.Fragment>
        )}

        <div style={{
          flexShrink: 0, textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900,
          fontSize: 13.5, letterSpacing: '.06em', padding: '12px 0', borderRadius: 13,
          background: isNew ? SPROUT.green : '#EAE2D1', color: isNew ? '#fff' : '#B6A98E',
          boxShadow: isNew ? '0 4px 0 ' + SPROUT.greenShadow : 'none', userSelect: 'none',
        }}>CHECK</div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Fixable answer row (Arrange) — plain answer line → tappable tiles w/ ✕ + hint ──
function ProposedArrangeFixable({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const placed = ['The', 'cat'];
  const bankAll = ['The', 'cat', 'drinks', 'water', 'slowly', 'now'];
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';

  const Chip = ({ label, ghost }) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13,
      padding: '8px 13px', borderRadius: 11,
      background: ghost ? 'transparent' : '#fff',
      border: ghost ? '1.5px dashed ' + SPROUT.line : '1.5px solid ' + SPROUT.line,
      color: ghost ? 'transparent' : SPROUT.ink,
      boxShadow: ghost ? 'none' : '0 2px 0 ' + SPROUT.cream2,
    }}>{label}</span>
  );

  // NEW placed tile: clearly removable — gentle lift + a faint ✕ badge
  const PlacedTile = ({ label, lifted }) => (
    <span style={{
      position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13,
      padding: '8px 13px', borderRadius: 11, background: '#fff',
      border: '1.5px solid ' + (lifted ? DEEP : SPROUT.line), color: SPROUT.ink,
      boxShadow: lifted ? '0 5px 0 ' + GREEN + '66, 0 8px 14px -6px rgba(42,35,32,.3)' : '0 2px 0 ' + SPROUT.cream2,
      transform: lifted ? 'translateY(-3px)' : 'none',
    }}>
      {label}
      <span style={{
        position: 'absolute', top: -6, right: -6, width: 16, height: 16, borderRadius: '50%',
        background: lifted ? DEEP : '#EDE4D2', color: lifted ? '#fff' : '#B6A98E',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900,
        boxShadow: '0 1px 3px rgba(42,35,32,.25)'
      }}>✕</span>
    </span>
  );

  return (
    <AppChrome top="exercise">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 13, padding: '14px 16px', minHeight: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink }}>Build the sentence</div>

        {isNew ? (
          <React.Fragment>
            {/* editable answer row: placed tiles read as removable (lift + ✕), one tapped/lifted */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 9, borderBottom: '2px solid ' + SPROUT.line, paddingBottom: 8, minHeight: 40 }}>
              <PlacedTile label="The" />
              <PlacedTile label="cat" lifted />
            </div>
            {/* one-time muted hint */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: -4 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" opacity="0"/><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 10.5, color: SPROUT.mute }}>Tap a word to send it back</span>
            </div>
            {/* bank with ghost slots for the placed words */}
            <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {bankAll.map((w, i) => placed.includes(w) && (i === 0 || i === 1)
                ? <Chip key={i} label={w} ghost />
                : <Chip key={i} label={w} />)}
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {/* CURRENT: plain answer line — placed tiles give no removal cue */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, borderBottom: '2px solid ' + SPROUT.line, paddingBottom: 6, minHeight: 40 }}>
              {placed.map((w) => <Chip key={w} label={w} />)}
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {bankAll.filter((w, i) => !(placed.includes(w) && (i === 0 || i === 1))).map((w, i) => <Chip key={i} label={w} />)}
            </div>
          </React.Fragment>
        )}

        <div style={{ flexShrink: 0, background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.06em', padding: '12px 0', borderRadius: 13, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>CHECK</div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Ghost-slot word bank (Arrange) — reflow bank+plain line → ruled staff + ghost slots ──
function ProposedArrangeGhostSlots({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  // selected (placed on the answer line) vs remaining in the bank
  const placed = ['The', 'cat'];
  const bankAll = ['The', 'cat', 'drinks', 'water', 'slowly', 'now'];
  // remaining chips = bank minus placed (preserve original order/positions)
  const Chip = ({ label, ghost }) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13,
      padding: '8px 13px', borderRadius: 11,
      background: ghost ? 'transparent' : '#fff',
      border: ghost ? '1.5px dashed ' + SPROUT.line : '1.5px solid ' + SPROUT.line,
      color: ghost ? 'transparent' : SPROUT.ink,
      boxShadow: ghost ? 'none' : '0 2px 0 ' + SPROUT.cream2,
    }}>{label}</span>
  );

  return (
    <AppChrome top="exercise">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, padding: '14px 16px', minHeight: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink }}>Build the sentence</div>

        {isNew ? (
          <React.Fragment>
            {/* ruled answer staff: two underline rows, placed tiles lifted onto them */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[0, 1].map((row) => (
                <div key={row} style={{ display: 'flex', alignItems: 'flex-end', gap: 7, borderBottom: '2px solid ' + SPROUT.line, paddingBottom: 6, minHeight: 30 }}>
                  {row === 0 && placed.map((w) => <Chip key={w} label={w} />)}
                </div>
              ))}
            </div>
            {/* ghost-slot bank: tapped tiles leave a same-size dashed placeholder, nothing reflows */}
            <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {bankAll.map((w, i) => placed.includes(w) && (i === 0 || i === 1)
                ? <Chip key={i} label={w} ghost />
                : <Chip key={i} label={w} />)}
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {/* plain single answer line */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, borderBottom: '2px solid ' + SPROUT.line, paddingBottom: 6, minHeight: 36 }}>
              {placed.map((w) => <Chip key={w} label={w} />)}
            </div>
            {/* reflowed bank: tapped tiles removed, remaining chips close the gap (jump) */}
            <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {bankAll.filter((w, i) => !(placed.includes(w) && (i === 0 || i === 1))).map((w, i) => <Chip key={i} label={w} />)}
            </div>
          </React.Fragment>
        )}

        <div style={{ flexShrink: 0, background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.06em', padding: '12px 0', borderRadius: 13, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>CHECK</div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Writing-line answer staff (Arrange) — floating cluster → two full-width baselines ──
function ProposedArrangeWritingLines({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  // a longer sentence so the answer naturally spans two lines
  const placed = ['The', 'cat', 'drinks'];
  const bankAll = ['The', 'cat', 'drinks', 'cold', 'water', 'slowly', 'every', 'morning'];
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';

  const Chip = ({ label, ghost }) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13,
      padding: '8px 13px', borderRadius: 11,
      background: ghost ? 'transparent' : '#fff',
      border: ghost ? '1.5px dashed ' + SPROUT.line : '1.5px solid ' + SPROUT.line,
      color: ghost ? 'transparent' : SPROUT.ink,
      boxShadow: ghost ? 'none' : '0 2px 0 ' + SPROUT.cream2,
    }}>{label}</span>
  );

  // a seated tile that rests on the baseline of a writing line
  const SeatedTile = ({ label }) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13,
      padding: '7px 13px', borderRadius: 11, background: '#fff',
      border: '1.5px solid ' + SPROUT.line, color: SPROUT.ink,
      boxShadow: '0 2px 0 ' + SPROUT.cream2,
    }}>{label}</span>
  );

  return (
    <AppChrome top="hud">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 13, padding: '12px 16px', minHeight: 0 }}>
        {/* in-lesson progress header — shared, identical on both phones */}
        <MiniExerciseTop progress={0.45} />
        {/* prompt + Pip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
          <Pip size={40} mood="happy" />
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14.5, color: SPROUT.ink }}>Build the sentence</div>
        </div>

        {isNew ? (
          <React.Fragment>
            {/* answer area: two calm full-width writing lines; words sit on the baseline,
                left-to-right. The remaining empty line length signals what's left to place. */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15, marginTop: 2 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap', gap: 8, width: '100%', borderBottom: '2px solid ' + SPROUT.line, paddingBottom: 7, minHeight: 34 }}>
                {placed.map((w) => <SeatedTile key={w} label={w} />)}
              </div>
              <div style={{ width: '100%', borderBottom: '2px solid ' + SPROUT.line, minHeight: 34 }} />
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {/* CURRENT: picked words pile into a free-floating cluster — no baseline, no shape */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 8, marginTop: 2, minHeight: 99, padding: '6px 2px' }}>
              <span style={{ transform: 'translateY(2px)' }}><SeatedTile label="The" /></span>
              <span style={{ transform: 'translateY(-3px)' }}><SeatedTile label="cat" /></span>
              <span style={{ transform: 'translateY(4px)' }}><SeatedTile label="drinks" /></span>
            </div>
          </React.Fragment>
        )}

        {/* word bank — identical green chip style on both phones */}
        <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {bankAll.map((w, i) => placed.includes(w) && i < 3
            ? <Chip key={i} label={w} ghost />
            : <Chip key={i} label={w} />)}
        </div>

        <div style={{ flexShrink: 0, background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.06em', padding: '12px 0', borderRadius: 13, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>CHECK</div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Low-water HUD warning (neutral water pill → calm amber low-water state + top-up) ──
// Renders its own HUD inline (copying MiniHud markup) so ONLY the water pill differs
// between CURRENT and NEW; the rest of the home screen is identical.
function ProposedLowWater({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const stat = (icon, val, color) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>{icon}<span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color }}>{val}</span></span>
  );
  const WaterPill = () => isNew ? (
    // calm amber low-water state + one-tap top-up
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FBEACB', border: '1.5px solid #E7B84F', borderRadius: 999, padding: '2px 4px 2px 7px' }}>
      <Icon.Droplet size={14} color="#C2871B" />
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: '#A8731B' }}>1</span>
      <span style={{ width: 15, height: 15, borderRadius: '50%', background: '#E7B84F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: '#fff', lineHeight: 1 }}>+</span>
    </span>
  ) : (
    // CURRENT: water at 1 looks identical to 5 — same neutral style
    stat(<Icon.Droplet size={14} color="#2E8FB0" />, '1', '#2E8FB0')
  );
  return (
    <React.Fragment>
      {/* HUD row — copied from MiniHud, only the water pill varies */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px 8px', borderBottom: '1px solid ' + SPROUT.line, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 10, padding: '3px 6px' }}>
          <span style={{ fontSize: 15 }}>🇺🇸</span>
          <Icon.ChevR size={9} color={SPROUT.mute} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {stat(<Icon.Leaf size={15} color={SPROUT.greenDark} />, '34', SPROUT.greenDark)}
          {stat(<Icon.Gem size={14} color="#6C8AE4" />, '420', '#3F5FC0')}
          <WaterPill />
        </div>
      </div>
      {/* unit header + path body — identical on both phones */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: SPROUT.greenDark, color: '#fff', padding: '10px 14px', flexShrink: 0 }}>
          <Icon.Book size={15} color="#fff" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.14em', opacity: .85 }}>UNIT 1</div>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13 }}>Sprout Basics</div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0, padding: '14px 18px', minHeight: 0 }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: SPROUT.green, boxShadow: '0 4px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: .92 }}>
            <Icon.Check size={24} color="#fff" />
          </div>
          <div style={{ width: 0, height: 22, borderLeft: '3px dotted ' + SPROUT.cream2 }} />
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: SPROUT.green, boxShadow: '0 5px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.Leaf size={30} color="#fff" />
          </div>
          <div style={{ width: 0, height: 22, borderLeft: '3px dotted ' + SPROUT.cream2 }} />
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#EDE4D2', boxShadow: '0 4px 0 #D9CDB5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.Lock size={18} color="#B6A98E" />
          </div>
        </div>
      </div>
      <MiniBottomNav active="home" />
    </React.Fragment>
  );
}

// ── Proposed · Jump back to today's lesson (peeking ahead loses your place → floating ↑ Today pill) ──
function ProposedScrollToToday({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const DEEP = '#3fa52e', GREEN = '#6fbf5e';
  // path scrolled UP to peek ahead: the active "today" node sits near the top (just
  // off the top of the viewport in spirit), locked nodes trail below.
  const nodes = [
    { x: 52, state: 'active' }, { x: 64, state: 'locked' }, { x: 56, state: 'locked' },
    { x: 40, state: 'locked' }, { x: 48, state: 'locked' }, { x: 60, state: 'locked' },
    { x: 50, state: 'locked' },
  ];
  const disc = (n) => {
    if (n.state === 'active') return { bg: GREEN, sh: '0 4px 0 ' + SPROUT.greenShadow + ', 0 0 0 5px ' + GREEN + '33', icon: <Icon.Leaf size={19} color="#fff" />, sz: 40 };
    return { bg: '#E7DFCF', sh: '0 3px 0 #CFC6B4', icon: <Icon.Lock size={14} color="#B7AD99" />, sz: 34 };
  };
  return (
    <AppChrome top="hud" nav="home">
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {/* UNIT ribbon — identical on both phones */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: SPROUT.greenDark, color: '#fff', padding: '10px 14px', flexShrink: 0 }}>
          <Icon.Book size={15} color="#fff" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.14em', opacity: .85 }}>UNIT 1</div>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13 }}>Sprout Basics</div>
          </div>
        </div>
        {/* winding path body — identical on both phones */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, padding: '14px 18px 12px', minHeight: 0, overflow: 'hidden' }}>
          {nodes.map((n, i) => {
            const d = disc(n);
            return (
              <React.Fragment key={i}>
                {i > 0 && <div style={{ width: 0, height: 18, borderLeft: '3px dotted ' + SPROUT.cream2, marginLeft: (n.x - 50) * 3.0 + 'px' }} />}
                <div style={{ position: 'relative', marginLeft: (n.x - 50) * 3.0 + 'px' }}>
                  <span style={{ width: d.sz, height: d.sz, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: d.bg, boxShadow: d.sh }}>{d.icon}</span>
                </div>
              </React.Fragment>
            );
          })}
          {/* NEW only: calm floating ↑ Today pill, lower-right, pointing back to the active node */}
          {isNew ? (
            <div style={{ position: 'absolute', right: 14, bottom: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, zIndex: 6 }}>
              <span style={{ width: 46, height: 46, borderRadius: '50%', background: GREEN, boxShadow: '0 5px 14px -4px ' + GREEN + 'cc, 0 3px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
              </span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, color: DEEP, background: '#EAF6E2', borderRadius: 999, padding: '2px 7px' }}>Today</span>
            </div>
          ) : null}
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Tap a HUD resource to learn it (static counters → calm anchored explainer popover) ──
function ProposedHudExplainer({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  // a calm winding-path body (same on both phones)
  const nodes = [
    { x: 50, active: false }, { x: 66, active: false }, { x: 58, active: false },
    { x: 40, active: true }, { x: 52, active: false }, { x: 64, active: false },
  ];
  const overlay = isNew ? (
    <React.Fragment>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(42,35,32,.28)', zIndex: 5, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 6, right: 4, zIndex: 6, width: 188 }}>
        <span style={{ position: 'absolute', top: -6, right: 14, width: 12, height: 12, background: '#FFFDF7', borderLeft: '1.5px solid ' + SPROUT.line, borderTop: '1.5px solid ' + SPROUT.line, transform: 'rotate(45deg)' }} />
        <div style={{ background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 15, padding: '12px 13px', boxShadow: '0 10px 26px -10px rgba(42,35,32,.4)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: '#E5F2F8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Droplet size={16} color="#2E8FB0" /></span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink }}>Water · 5</span>
          </div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 11, color: SPROUT.mute, lineHeight: 1.4 }}>Water lessons each day to grow your garden.</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.12em', textTransform: 'uppercase', color: '#2E8FB0', fontWeight: 700 }}>How water works ›</div>
        </div>
      </div>
    </React.Fragment>
  ) : null;

  return (
    <AppChrome top="hud" nav="home">
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '14px 0 12px', minHeight: 0, overflow: 'hidden' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute }}>Unit 1 · Sprout Basics</div>
        {nodes.map((n, i) => (
          <div key={i} style={{ position: 'relative', marginLeft: (n.x - 50) * 3.4 + 'px' }}>
            {n.active && (
              <span style={{ position: 'absolute', top: -19, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 9, padding: '2px 8px', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 8.5, color: DEEP, boxShadow: '0 2px 4px rgba(42,35,32,.12)' }}>START</span>
            )}
            <span style={{ width: n.active ? 40 : 34, height: n.active ? 40 : 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: n.active ? GREEN : '#E7DFCF', boxShadow: n.active ? '0 4px 0 ' + SPROUT.greenShadow + ', 0 0 0 5px ' + GREEN + '33' : '0 3px 0 #CFC6B4' }}>
              <Icon.Leaf size={n.active ? 19 : 15} color={n.active ? '#fff' : '#B7AD99'} />
            </span>
          </div>
        ))}
        {overlay}
      </div>
    </AppChrome>
  );
}

// ── Proposed sketch 1 — spotlight the active node ──
// PROPOSED panel: raised green disc w/ leaf glyph, soft pulsing halo,
// a floating START speech bubble above it, and Pip sitting beside it (right).
function ProposedSpotlight({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const HALO = '#A6E89A'; // lighter-green concentric halo
  return (
    <AppChrome top="hud" nav="home">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0, padding: '16px 18px', minHeight: 0 }}>
      {/* completed disc above — path context */}
      <div style={{
        width: 50, height: 50, borderRadius: '50%', background: SPROUT.green,
        boxShadow: '0 4px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: .92
      }}>
        <Icon.Check size={24} color="#fff" />
      </div>
      <div style={{ width: 0, height: 26, borderLeft: '3px dotted ' + SPROUT.cream2 }} />

      {/* ACTIVE NODE — the ONLY element that differs between current & new */}
      {isNew ? (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: 124, height: 124, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span aria-hidden style={{
              position: 'absolute', width: 104, height: 104, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(166,232,154,.55), rgba(166,232,154,0) 68%)'
            }} />
            <span className="exp-halo" aria-hidden style={{
              position: 'absolute', width: 100, height: 100, borderRadius: '50%', border: '4px solid ' + HALO
            }} />
            <span className="exp-halo" aria-hidden style={{
              position: 'absolute', width: 100, height: 100, borderRadius: '50%', border: '4px solid ' + HALO, animationDelay: '1.2s'
            }} />
            <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', zIndex: 5 }}>
              <div style={{
                position: 'relative', background: '#fff', color: SPROUT.greenDark, fontWeight: 900,
                fontSize: 12.5, letterSpacing: '.16em', padding: '7px 15px', borderRadius: 999,
                boxShadow: '0 6px 16px -5px rgba(42,35,32,.4)', whiteSpace: 'nowrap'
              }}>
                START
                <span aria-hidden style={{
                  position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%) rotate(45deg)',
                  width: 11, height: 11, background: '#fff', borderRadius: 2
                }} />
              </div>
            </div>
            <div style={{
              width: 86, height: 86, borderRadius: '50%',
              background: 'linear-gradient(180deg,#7FCC6C,' + SPROUT.green + ')',
              boxShadow: '0 12px 0 ' + SPROUT.greenShadow + ', 0 28px 36px -10px rgba(79,158,63,.62)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2
            }}>
              <Icon.Leaf size={42} color="#fff" />
            </div>
          </div>
          <div className="exp-bob" style={{ marginLeft: -4, marginTop: 16, flexShrink: 0, zIndex: 3 }}>
            <Pip size={60} mood="cheer" />
          </div>
        </div>
      ) : (
        // CURRENT: the active disc sits flat among the others — a plain green disc,
        // a START bubble above, but no halo, no extra lift, no Pip beside it.
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            background: '#fff', color: SPROUT.greenDark, fontWeight: 900, fontSize: 11,
            letterSpacing: '.16em', padding: '5px 13px', borderRadius: 999, marginBottom: 8,
            boxShadow: '0 4px 12px -5px rgba(42,35,32,.3)'
          }}>START</div>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: SPROUT.green,
            boxShadow: '0 5px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Icon.Leaf size={30} color="#fff" />
          </div>
        </div>
      )}

      <div style={{ width: 0, height: 26, borderLeft: '3px dotted ' + SPROUT.cream2 }} />
      {/* locked disc below */}
      <div style={{
        width: 50, height: 50, borderRadius: '50%', background: '#EDE4D2',
        boxShadow: '0 4px 0 #D9CDB5', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B6A98E" strokeWidth="2.4"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round"/></svg>
      </div>
    </div>
    </AppChrome>
  );
}

// ── Proposed sketch 2 — guidebook affordance on the unit banner ──
function ProposedGuidebook({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  return (
    <AppChrome top="hud" nav="home">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, padding: '18px 20px', minHeight: 0 }}>
      {/* the unit banner — its right side is the ONLY element that differs */}
      <div style={{
        background: 'linear-gradient(180deg,' + SPROUT.green + ' 0%,' + SPROUT.greenDark + ' 100%)',
        borderRadius: 18, padding: '15px 16px', boxShadow: '0 6px 0 ' + SPROUT.greenShadow,
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(255,255,255,.8)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 3 }}>Section 1 · 7 units</div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 18, fontWeight: 900, color: '#fff' }}>First Words</div>
        </div>
        {isNew ? (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <span className="exp-halo" aria-hidden style={{
              position: 'absolute', inset: -5, borderRadius: 14, border: '2.5px solid rgba(255,255,255,.9)'
            }} />
            <div style={{
              width: 42, height: 42, borderRadius: 13, background: 'rgba(255,255,255,.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1
            }}>
              <Icon.Book size={22} color="#fff" />
            </div>
          </div>
        ) : (
          // CURRENT: the right side of the banner is simply empty.
          <div aria-hidden style={{ width: 42, height: 42, flexShrink: 0 }} />
        )}
      </div>

      {isNew ? (
        // the low-pressure preview the guidebook opens
        <div style={{
          background: '#fff', borderRadius: 16, border: '1.5px solid ' + SPROUT.line,
          boxShadow: '0 14px 30px -16px rgba(42,35,32,.35)', padding: '13px 14px 15px', margin: '0 6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 11 }}>
            <Icon.Book size={15} color={SPROUT.greenDark} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: SPROUT.greenDark, letterSpacing: '.14em', textTransform: 'uppercase' }}>Guidebook · preview</span>
          </div>
          {[['Good morning', 'a warm hello'], ['Water the plants', 'a kind task'], ['Hello, friend', 'meeting someone']].map(([en, gloss], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 0', borderTop: i ? '1px solid ' + SPROUT.bg : 'none' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke={SPROUT.greenDark} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5v4h2.5L8 12V2L4.5 5H2z"/><path d="M10.5 4.5a3.4 3.4 0 0 1 0 5"/></svg>
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 13.5, fontWeight: 800, color: SPROUT.ink, lineHeight: 1.15 }}>{en}</div>
                <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 11, fontWeight: 600, color: SPROUT.mute }}>{gloss}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // CURRENT: no preview — the path nodes simply continue below the banner.
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, marginTop: 4 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: SPROUT.green, boxShadow: '0 5px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Leaf size={26} color="#fff" /></div>
          <div style={{ width: 0, height: 20, borderLeft: '3px dotted ' + SPROUT.cream2 }} />
          <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#EDE4D2', boxShadow: '0 4px 0 #D9CDB5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B6A98E" strokeWidth="2.4"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round"/></svg>
          </div>
        </div>
      )}
    </div>
    </AppChrome>
  );
}

// ── Proposed sketch 3 — daily bloom deal in the shop ──
function ProposedBloomDeal({ calm, mode = 'proposed' }) {
  const [secs, setSecs] = React.useState(6 * 3600 + 24 * 60 + 11);
  React.useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 6 * 3600)), 1000);
    return () => clearInterval(t);
  }, []);
  const hh = String(Math.floor(secs / 3600)).padStart(2, '0');
  const mm = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  const isNew = mode !== 'current';

  const ShopRow = ({ glyph, title, sub, price }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '11px 12px' }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: '#FBF1DA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{glyph}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 13.5, fontWeight: 900, color: SPROUT.ink }}>{title}</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 11, fontWeight: 600, color: SPROUT.mute }}>{sub}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Icon.Gem size={13} color="#6C8AE4" />
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: SPROUT.ink }}>{price}</span>
      </div>
    </div>
  );

  let body;
  if (!isNew) {
    // CURRENT: a plain static shop list — nothing changes day to day.
    body = (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10, padding: '18px 16px' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: SPROUT.mute, letterSpacing: '.14em', textTransform: 'uppercase', paddingLeft: 4 }}>Shop</div>
        <ShopRow glyph="🛡️" title="Streak cover" sub="Protect a missed day" price="120" />
        <ShopRow glyph="🌸" title="Rare bloom" sub="A special garden flower" price="350" />
        <ShopRow glyph="🌿" title="Plant pot" sub="A new home to grow" price="200" />
        <ShopRow glyph="🌼" title="Bloom bundle" sub="3 covers + 1 rare bloom" price="150" />
      </div>
    );
  } else if (calm) {
    // Calm mode hides the featured deal entirely — the shop stays quiet.
    body = (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '28px 26px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Pip size={42} mood="sleepy" />
        </div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 16, fontWeight: 900, color: SPROUT.ink }}>Hidden in Calm mode</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 13, fontWeight: 600, color: SPROUT.mute, lineHeight: 1.5, maxWidth: 210 }}>
          No countdowns, no deals — the shop stays a quiet, plain list. The featured deal only appears when Calm mode is off.
        </div>
        <div style={{
          marginTop: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '.14em',
          textTransform: 'uppercase', color: SPROUT.mute, border: '1px dashed ' + SPROUT.cream2,
          borderRadius: 999, padding: '5px 12px'
        }}>Calm mode · ON</div>
      </div>
    );
  } else {
    body = (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14, padding: '20px 16px' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: SPROUT.mute, letterSpacing: '.14em', textTransform: 'uppercase', paddingLeft: 4 }}>Shop · featured today</div>
        {/* featured deal card — the ONLY element that differs from the plain list */}
        <div style={{
          position: 'relative', background: '#fff', borderRadius: 20,
          border: '1.5px solid ' + SPROUT.line, boxShadow: '0 16px 34px -18px rgba(42,35,32,.4)',
          padding: '18px 16px 16px', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: 13, right: -30, transform: 'rotate(38deg)',
            background: SPROUT.sun, color: '#5A3D08', fontFamily: 'Nunito, system-ui',
            fontWeight: 900, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase',
            padding: '4px 34px', boxShadow: '0 3px 8px -3px rgba(0,0,0,.25)'
          }}>Best value</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Icon.Leaf size={15} color={SPROUT.green} />
            <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 12, fontWeight: 900, color: SPROUT.greenDark, letterSpacing: '.02em' }}>Today&rsquo;s bloom</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0, background: '#FBF1DA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 26 }} role="img" aria-label="flower">🌼</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 15, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.2 }}>Bloom Bundle</div>
              <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 12, fontWeight: 600, color: SPROUT.mute, lineHeight: 1.3 }}>3 streak covers + 1 rare bloom</div>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14,
            background: SPROUT.bg, borderRadius: 999, padding: '7px 12px', width: 'fit-content'
          }}>
            <Icon.Clock size={13} color={SPROUT.mute} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 500, color: SPROUT.ink, letterSpacing: '.02em' }}>Fresh for {hh}:{mm}:{ss}</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: SPROUT.green, borderRadius: 14, padding: '12px 0',
            boxShadow: '0 4px 0 ' + SPROUT.greenShadow
          }}>
            <Icon.Gem size={17} color="#fff" />
            <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 16, fontWeight: 900, color: '#fff' }}>120</span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.7)', textDecoration: 'line-through' }}>150</span>
          </div>
        </div>
      </div>
    );
  }

  return <AppChrome top="hud" nav="home">{body}</AppChrome>;
}

// ── shared bits for the Lesson-Complete explorations ──
// PropCaption is now a no-op: the proposed-view note is rendered OUTSIDE the
// phone frame, below the “PROPOSED” label (see ComparePanel `note`). Kept as a
// null component so the existing in-frame call sites stay harmless.
function PropCaption() { return null; }

// a color-coded stat card (idea 2)
function StatCardMini({ icon, label, value, tint, accent }) {
  return (
    <div style={{
      flex: 1, minWidth: 0, background: tint, borderRadius: 16, padding: '13px 6px 12px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      border: '1.5px solid ' + accent + '30'
    }}>
      <span style={{ width: 30, height: 30, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: accent, lineHeight: 1 }}>{value}</span>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.07em', textTransform: 'uppercase', color: SPROUT.mute }}>{label}</span>
    </div>
  );
}

const SvgClock = ({ c = '#fff' }) => <Icon.Clock size={15} color={c} />;
const SvgTarget = ({ c = '#fff' }) => <Icon.Target size={15} color={c} />;

// ── CURRENT lesson-complete finish — the busy screen all 5 LC cards critique ──
// One shared body, reused VERBATIM as the `current` phone of every Lesson-Complete
// exploration, so they all show the identical "before" screen.
function CurrentSessionComplete() {
  const tiles = [
    ['Seeds', '+15', '#E5A93A', <Icon.Sparkle size={15} color="#fff" />],
    ['Bloom rate', '100%', SPROUT.green, <Icon.Target size={15} color="#fff" />],
    ['Streak', '13', '#F5833E', <Icon.Flame size={15} color="#fff" />],
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '18px 18px' }}>
      <div className="exp-bob"><Pip size={56} mood="cheer" /></div>
      <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 20, color: SPROUT.greenDark }}>Lesson complete!</div>
      {/* a busy stack: XP chip + three stacked tiles + streak line + goal bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FBF1DA', borderRadius: 999, padding: '6px 13px' }}>
        <Icon.Sparkle size={15} color="#C2871B" />
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: '#C2871B' }}>+15 XP</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, width: '100%', maxWidth: 240 }}>
        {tiles.map(([lab, val, c, ic]) => (
          <div key={lab} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FFFDF8', border: '1.5px solid ' + SPROUT.line, borderRadius: 12, padding: '9px 12px' }}>
            <span style={{ width: 26, height: 26, borderRadius: '50%', background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{ic}</span>
            <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 12.5, color: SPROUT.mute }}>{lab}</span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink }}>{val}</span>
          </div>
        ))}
      </div>
      <div style={{ width: '100%', maxWidth: 240 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.mute }}>Daily goal</span>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 10, color: SPROUT.mute }}>15 / 20</span>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}><div style={{ width: '75%', height: '100%', background: SPROUT.green, borderRadius: 999 }} /></div>
      </div>
      <div style={{ width: '100%', maxWidth: 240, background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.08em', padding: '12px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>CONTINUE</div>
    </div>
  );
}

// ── Proposed sketch 4 — adaptive headline (garden-flavoured) ──
function ProposedAdaptiveHeadline({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentSessionComplete />;
  const variants = [
    { cond: '100% accuracy', head: 'Flawless bloom!', mood: 'proud', color: SPROUT.greenDark },
    { cond: 'Fast finish',   head: 'Speedy sprout!',  mood: 'cheer', color: '#C2871B' },
    { cond: 'Otherwise',     head: 'Lesson complete!', mood: 'happy', color: SPROUT.ink },
  ];
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % variants.length), 2300);
    return () => clearInterval(t);
  }, []);
  const v = variants[i];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '24px 20px' }}>
      <div className="exp-bob"><Pip size={62} mood={v.mood} /></div>
      <div key={i} style={{
        fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 23, color: v.color,
        textAlign: 'center', minHeight: 28, animation: 'expFade .45s ease'
      }}>{v.head}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, width: '100%', maxWidth: 234, marginTop: 2 }}>
        {variants.map((vr, n) => {
          const on = n === i;
          return (
            <div key={n} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 11px', borderRadius: 12,
              background: on ? '#EAF6E2' : '#FFFDF8', border: '1.5px solid ' + (on ? SPROUT.green : SPROUT.line),
              transition: 'all .3s', opacity: on ? 1 : .55
            }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 700, color: SPROUT.mute, width: 74, flexShrink: 0, letterSpacing: '.01em' }}>{vr.cond}</span>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke={on ? SPROUT.greenDark : SPROUT.mute} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7h7M7 4l3 3-3 3"/></svg>
              <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 12.5, fontWeight: 800, color: on ? SPROUT.ink : SPROUT.mute }}>{vr.head}</span>
            </div>
          );
        })}
      </div>
      <PropCaption>the headline adapts to how the lesson went — every win feels earned</PropCaption>
    </div>
  );
}

// Duolingo-style stat card: a COLORED HEADER TAB + white body (icon + big value).
function StatTabCard({ header, headerBg, icon, value, valueColor }) {
  return (
    <div style={{ flex: 1, minWidth: 0, borderRadius: 13, overflow: 'hidden', border: '2px solid ' + headerBg, background: '#fff', boxShadow: '0 3px 0 ' + headerBg + '55' }}>
      <div style={{ background: headerBg, color: '#fff', textAlign: 'center', padding: '4px 2px', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 8, letterSpacing: '.08em', textTransform: 'uppercase' }}>{header}</div>
      <div style={{ padding: '9px 4px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
        {icon}
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16, color: valueColor, lineHeight: 1 }}>{value}</span>
      </div>
    </div>
  );
}

// ── Proposed sketch 5 — clean Duolingo-style session complete ──
function ProposedStatRow({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentSessionComplete />;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '24px 18px' }}>
      {/* subtle sparkle accent + Pip hero */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
        <span className="exp-twinkle" aria-hidden style={{ position: 'absolute', top: -2, right: -10, color: SPROUT.sun, fontSize: 13 }}>✦</span>
        <span className="exp-twinkle" aria-hidden style={{ position: 'absolute', top: 14, left: -14, color: '#8FD46F', fontSize: 9, animationDelay: '.9s' }}>✦</span>
        <div className="exp-bob"><Pip size={84} mood="cheer" /></div>
      </div>

      {/* headline + subtitle */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 25, color: SPROUT.greenDark, letterSpacing: '-.01em' }}>In full bloom!</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 13, color: SPROUT.mute }}>A perfect run — take a bow.</div>
      </div>

      {/* exactly 3 Duolingo-style stat cards */}
      <div style={{ display: 'flex', gap: 9, width: '100%' }}>
        <StatTabCard header="Seeds" headerBg="#E5A93A" valueColor="#C2871B" value="+15" icon={<Icon.Leaf size={17} color="#C2871B" />} />
        <StatTabCard header="Flawless" headerBg={SPROUT.green} valueColor={SPROUT.greenDark} value="100%" icon={<SvgTarget c={SPROUT.greenDark} />} />
        <StatTabCard header="Quick" headerBg="#5B9CB8" valueColor="#3E88A8" value="3:49" icon={<SvgClock c="#3E88A8" />} />
      </div>

      {/* single full-width Continue */}
      <div style={{ width: '100%', background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.08em', padding: '13px 0', borderRadius: 15, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>CONTINUE</div>
    </div>
  );
}

// ── Proposed sketch 6 — calm hero number + secondary row ──
function ProposedHeroNumber({ calm, mode = 'proposed' }) {
  if (mode === 'current') return <CurrentSessionComplete />;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '24px 18px' }}>
      {/* hero figure beside Pip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="exp-bob"><Pip size={62} mood="cheer" /></div>
        <div style={{ position: 'relative' }}>
          {/* soft sparkles */}
          <span className="exp-twinkle" aria-hidden style={{ position: 'absolute', top: -8, right: -6, color: SPROUT.sun, fontSize: 13 }}>✦</span>
          <span className="exp-twinkle" aria-hidden style={{ position: 'absolute', bottom: 2, right: -12, color: '#8FD46F', fontSize: 9, animationDelay: '.8s' }}>✦</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 52, lineHeight: 1, color: SPROUT.greenDark, letterSpacing: '-.02em' }}>+24</span>
            <Icon.Leaf size={20} color={SPROUT.green} />
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, marginTop: 5 }}>leaves grown</div>
          {/* combo bonus chip — only when a combo lands, hidden in Calm mode */}
          {!calm && (
            <div style={{
              position: 'absolute', top: -16, left: -16, transform: 'rotate(-7deg)',
              background: SPROUT.sun, color: '#5A3D08', fontFamily: 'Nunito, system-ui', fontWeight: 900,
              fontSize: 8.5, letterSpacing: '.06em', textTransform: 'uppercase', padding: '4px 9px',
              borderRadius: 999, boxShadow: '0 4px 10px -3px rgba(0,0,0,.3)'
            }}>Combo +6</div>
          )}
        </div>
      </div>
      {/* secondary stat row — quieter pills */}
      <div style={{ display: 'flex', gap: 7, width: '100%' }}>
        {[['2:40', 'time'], ['92%', 'accuracy'], ['13', 'day streak']].map(([val, lab]) => (
          <div key={lab} style={{
            flex: 1, minWidth: 0, background: '#FFFDF8', border: '1.5px solid ' + SPROUT.line, borderRadius: 13,
            padding: '9px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2
          }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14.5, color: SPROUT.ink }}>{val}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.mute }}>{lab}</span>
          </div>
        ))}
      </div>
      {/* quiet continue pill */}
      <div style={{
        marginTop: 2, background: SPROUT.green, color: '#fff', fontFamily: 'Nunito, system-ui',
        fontWeight: 900, fontSize: 13.5, letterSpacing: '.02em', padding: '11px 34px', borderRadius: 999,
        boxShadow: '0 4px 0 ' + SPROUT.greenShadow
      }}>Continue</div>
      <PropCaption>{calm
        ? 'one calm hero number leads; the combo chip stays hidden in Calm mode'
        : 'one hero number leads, stats sit quietly below — combo chip pops when a streak lands'}</PropCaption>
    </div>
  );
}

// ── Proposed sketch 7 — unmistakable selected state (MC) ──
function ProposedSelectedState({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const opts = [
    { glyph: '🐕', label: 'a dog', sel: false },
    { glyph: '🐈', label: 'a cat', sel: true },
    { glyph: '🐦', label: 'a bird', sel: false },
    { glyph: '🐟', label: 'a fish', sel: false },
  ];
  return (
    <AppChrome top="exercise">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, padding: '10px 18px 18px', minHeight: 0 }}>
      <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: SPROUT.ink, textAlign: 'center' }}>Which one is the dog?</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
        {opts.map((o, i) => {
          const on = o.sel;
          // NEW: selected = green fill, 2px green border, lift, check-dot.
          // CURRENT: selected = a thin outline only — no fill, no lift, no dot.
          const selStyle = isNew
            ? { background: '#EAF6E2', border: '2px solid ' + SPROUT.green, boxShadow: '0 9px 18px -8px rgba(79,158,63,.5), 0 3px 0 ' + SPROUT.greenShadow, transform: 'translateY(-3px)' }
            : { background: '#fff', border: '1.5px solid ' + SPROUT.mute, boxShadow: '0 3px 0 ' + SPROUT.cardShadow, transform: 'none' };
          const base = { background: '#fff', border: '2px solid ' + SPROUT.line, boxShadow: '0 3px 0 ' + SPROUT.cardShadow, transform: 'none' };
          const st = on ? selStyle : base;
          return (
            <div key={i} style={{
              borderRadius: 16, padding: '14px 10px', transition: 'all .2s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative',
              ...st
            }}>
              {on && isNew && (
                <span style={{ position: 'absolute', top: 7, right: 7, width: 20, height: 20, borderRadius: '50%', background: SPROUT.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.Check size={12} color="#fff" />
                </span>
              )}
              <div style={{ width: 52, height: 52, borderRadius: 13, background: (on && isNew) ? '#fff' : SPROUT.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{o.glyph}</div>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13.5, color: (on && isNew) ? SPROUT.greenDark : SPROUT.ink }}>{o.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, padding: '12px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow, letterSpacing: '.08em' }}>CHECK</div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · In-a-row momentum chip (silent top bar → calm "3 IN A ROW" chip above the progress bar) ──
function ProposedInARowChip({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const DEEP = '#3fa52e', GREEN = '#6fbf5e';

  // The MCQ body — IDENTICAL on both phones (no isNew branching). One option is
  // selected with the standard Sprout look; only the chip above differs.
  const opts = [
    { glyph: '🐕', label: 'a dog', sel: true },
    { glyph: '🐈', label: 'a cat', sel: false },
    { glyph: '🐦', label: 'a bird', sel: false },
    { glyph: '🐟', label: 'a fish', sel: false },
  ];

  return (
    <AppChrome>
      {/* (NEW only) calm momentum chip — sits just above the shared progress bar */}
      {isNew ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '7px 14px 0', flexShrink: 0 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#EAF6E2', border: '1px solid ' + GREEN + '66', borderRadius: 999, padding: '4px 11px', boxShadow: '0 2px 7px -2px ' + GREEN + '88' }}>
            <Icon.Leaf size={12} color={DEEP} />
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 9.5, letterSpacing: '.16em', color: SPROUT.greenDark, whiteSpace: 'nowrap' }}>3 IN A ROW</span>
          </span>
        </div>
      ) : null}
      {/* shared in-lesson top bar — X + progress + water, byte-identical on both phones */}
      <MiniExerciseTop progress={0.55} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, padding: '6px 18px 18px', minHeight: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: SPROUT.ink, textAlign: 'center' }}>Which one is the dog?</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
          {opts.map((o, i) => {
            const on = o.sel;
            const st = on
              ? { background: '#EAF6E2', border: '2px solid ' + SPROUT.green, boxShadow: '0 9px 18px -8px rgba(79,158,63,.5), 0 3px 0 ' + SPROUT.greenShadow, transform: 'translateY(-3px)' }
              : { background: '#fff', border: '2px solid ' + SPROUT.line, boxShadow: '0 3px 0 ' + SPROUT.cardShadow, transform: 'none' };
            return (
              <div key={i} style={{
                borderRadius: 16, padding: '14px 10px', transition: 'all .2s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', ...st
              }}>
                {on && (
                  <span style={{ position: 'absolute', top: 7, right: 7, width: 20, height: 20, borderRadius: '50%', background: SPROUT.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon.Check size={12} color="#fff" />
                  </span>
                )}
                <div style={{ width: 52, height: 52, borderRadius: 13, background: on ? '#fff' : SPROUT.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{o.glyph}</div>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13.5, color: on ? SPROUT.greenDark : SPROUT.ink }}>{o.label}</span>
              </div>
            );
          })}
        </div>
        <div style={{ background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, padding: '12px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow, letterSpacing: '.08em' }}>CHECK</div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Hear-it image choice (text-only prompt → tappable audio speaker pill beside the word) ──
function ProposedHearItPrompt({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const DEEP = '#3fa52e', GREEN = '#6fbf5e';

  // 2x2 image-answer tiles — IDENTICAL on both phones; one is selected.
  const opts = [
    { glyph: '🐕', label: 'a dog', sel: true },
    { glyph: '🐈', label: 'a cat', sel: false },
    { glyph: '🐦', label: 'a bird', sel: false },
    { glyph: '🐟', label: 'a fish', sel: false },
  ];

  return (
    <AppChrome>
      <MiniExerciseTop progress={0.55} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, padding: '6px 18px 18px', minHeight: 0 }}>
        {/* the ONLY difference — prompt */}
        {isNew ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 999, padding: '8px 16px 8px 9px', boxShadow: '0 3px 0 ' + SPROUT.cream2 }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 0 ' + SPROUT.greenShadow }}>
                <Icon.Volume size={17} color="#fff" />
              </span>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 17, color: SPROUT.ink, whiteSpace: 'nowrap' }}>the dog</span>
            </span>
          </div>
        ) : (
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: SPROUT.ink, textAlign: 'center' }}>Which one is the dog?</div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
          {opts.map((o, i) => {
            const on = o.sel;
            const st = on
              ? { background: '#EAF6E2', border: '2px solid ' + SPROUT.green, boxShadow: '0 9px 18px -8px rgba(79,158,63,.5), 0 3px 0 ' + SPROUT.greenShadow, transform: 'translateY(-3px)' }
              : { background: '#fff', border: '2px solid ' + SPROUT.line, boxShadow: '0 3px 0 ' + SPROUT.cardShadow, transform: 'none' };
            return (
              <div key={i} style={{
                borderRadius: 16, padding: '14px 10px', transition: 'all .2s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', ...st
              }}>
                {on && (
                  <span style={{ position: 'absolute', top: 7, right: 7, width: 20, height: 20, borderRadius: '50%', background: SPROUT.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon.Check size={12} color="#fff" />
                  </span>
                )}
                <div style={{ width: 52, height: 52, borderRadius: 13, background: on ? '#fff' : SPROUT.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{o.glyph}</div>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13.5, color: on ? SPROUT.greenDark : SPROUT.ink }}>{o.label}</span>
              </div>
            );
          })}
        </div>
        <div style={{ background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, padding: '12px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow, letterSpacing: '.08em' }}>CHECK</div>
      </div>
    </AppChrome>
  );
}

// ── Proposed sketch 8 — explicit pick affordance for list options ──
function ProposedPickAffordance({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const rows = [
    { label: 'Good morning', sel: false },
    { label: 'Good night', sel: true },
    { label: 'See you soon', sel: false },
  ];
  return (
    <AppChrome top="exercise">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14, padding: '10px 18px 18px', minHeight: 0 }}>
      <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: SPROUT.ink, textAlign: 'center', marginBottom: 2 }}>Choose the right phrase</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map((r, i) => {
          const on = r.sel;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px', borderRadius: 14,
              background: on ? '#EAF6E2' : '#fff', border: '2px solid ' + (on ? SPROUT.green : SPROUT.line),
              boxShadow: on ? '0 3px 0 ' + SPROUT.greenShadow : '0 3px 0 ' + SPROUT.cardShadow, transition: 'all .2s'
            }}>
              <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 14.5, color: on ? SPROUT.greenDark : SPROUT.ink }}>{r.label}</span>
              {/* the right-hand pick dot is the ONLY element that differs */}
              {isNew && (
                <span style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: on ? SPROUT.green : '#fff', border: '2px solid ' + (on ? SPROUT.green : SPROUT.line),
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {on
                    ? <Icon.Check size={12} color="#fff" />
                    : <Icon.Leaf size={12} color={SPROUT.line} />}
                </span>
              )}
            </div>
          );
        })}
      </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed sketch 9 — quiet audio fallback on listen-type MC ──
function ProposedAudioFallback({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  return (
    <AppChrome top="exercise">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '10px 20px 18px', minHeight: 0 }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute }}>What do you hear?</div>
      <div className="exp-bob" style={{ width: 94, height: 94, borderRadius: 24, background: SPROUT.green, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 0 ' + SPROUT.greenShadow }}>
        <Icon.Volume size={42} color="#fff" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 999, padding: '7px 13px' }}>
        <span style={{ width: 22, height: 22, borderRadius: '50%', background: SPROUT.sky, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Volume size={11} color="#1F5F7A" /></span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, color: SPROUT.mute }}>Play slowly</span>
      </div>
      {/* the quiet fallback link is the ONLY element that differs */}
      {isNew
        ? <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13, color: SPROUT.mute, textDecoration: 'underline', textUnderlineOffset: 3, marginTop: 4, letterSpacing: '.01em' }}>Can&rsquo;t listen now</div>
        : <div aria-hidden style={{ height: 19, marginTop: 4 }} />}
      </div>
    </AppChrome>
  );
}

// ── reusable in-frame app chrome so PROPOSED reads as a COMPLETE screen ──
// Small-scale, faithful re-creations of the real TopBar (HUD) and BottomNav so
// each proposed panel shows the same chrome as the CURRENT phone, changing only
// the improved component.
function MiniHud() {
  const stat = (icon, val, color) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>{icon}<span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color }}>{val}</span></span>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px 8px', borderBottom: '1px solid ' + SPROUT.line, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 10, padding: '3px 6px' }}>
        <span style={{ fontSize: 15 }}>🇺🇸</span>
        <Icon.ChevR size={9} color={SPROUT.mute} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        {stat(<Icon.Leaf size={15} color={SPROUT.greenDark} />, '34', SPROUT.greenDark)}
        {stat(<Icon.Gem size={14} color="#6C8AE4" />, '420', '#3F5FC0')}
        {stat(<WaterGauge level={5} max={5} size={15} showNumber={false} />, '5', '#2E8FB0')}
      </div>
    </div>
  );
}

function MiniBottomNav({ active = 'home' }) {
  const items = [['home', Icon.Home, 'Learn', false], ['book', Icon.Book, 'Words', false], ['quests', Icon.Target, 'Quests', true], ['trophy', Icon.Trophy, 'League', true], ['me', Icon.User, 'Me', false]];
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '7px 4px 9px', background: '#FFFDF7', borderTop: '1px solid ' + SPROUT.line, flexShrink: 0 }}>
      {items.map(([id, Icn, label, dot]) => {
        const on = id === active;
        const showDot = dot && !on;
        return (
          <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 20, borderRadius: 999, background: on ? '#E3F5DB' : 'transparent' }}>
              <Icn size={16} color={on ? SPROUT.greenDark : SPROUT.mute} />
              {showDot && (
                <span style={{ position: 'absolute', top: 0, right: 4, width: 6, height: 6, borderRadius: '50%', background: SPROUT.coral, border: '1px solid #FFFDF7' }} />
              )}
            </span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 7, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.02em', color: on ? SPROUT.greenDark : SPROUT.mute }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// exercise chrome — a progress bar + quit chevron, as on the real lesson screen
function MiniExerciseTop({ progress = 0.7 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px 9px', flexShrink: 0 }}>
      <Icon.ArrowLeft size={15} color={SPROUT.mute} />
      <div style={{ flex: 1, height: 9, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}>
        <div style={{ width: (progress * 100) + '%', height: '100%', borderRadius: 999, background: SPROUT.green }} />
      </div>
      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <WaterGauge level={5} max={5} size={14} showNumber={false} />
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: '#2E8FB0' }}>5</span>
      </span>
    </div>
  );
}

// ── Proposed sketch 10 — slim unit ribbon above the path ──
function ProposedUnitRibbon({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  return (
    <AppChrome top="hud" nav="home">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, padding: '16px 18px', justifyContent: 'center', minHeight: 0 }}>
        {/* the unit header — the ONLY element that differs. NEW: a slim leaf ribbon;
            CURRENT: nothing above the trail, so the path starts cold. */}
        {isNew ? (
          <div style={{ width: '100%', maxWidth: 250, background: SPROUT.green, borderRadius: 16, padding: '12px 15px 13px', boxShadow: '0 5px 0 ' + SPROUT.greenShadow }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Leaf size={15} color="#fff" /></span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.8)' }}>Unit 1</span>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14.5, color: '#fff', lineHeight: 1.1 }}>Sprout Basics</span>
                </div>
              </div>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: '#fff' }}>1<span style={{ opacity: .65 }}>/8</span></span>
            </div>
            <div style={{ height: 7, borderRadius: 999, background: 'rgba(255,255,255,.3)', overflow: 'hidden' }}>
              <div style={{ width: '13%', height: '100%', borderRadius: 999, background: '#fff' }} />
            </div>
          </div>
        ) : (
          <div aria-hidden style={{ height: 8 }} />
        )}

        {/* the path below */}
        <div style={{ width: 0, height: 20, borderLeft: '3px dotted ' + SPROUT.cream2, marginTop: isNew ? 12 : 0 }} />
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: SPROUT.green, boxShadow: '0 7px 0 ' + SPROUT.greenShadow + ', 0 16px 22px -10px rgba(79,158,63,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.Leaf size={28} color="#fff" />
        </div>
        <div style={{ width: 0, height: 20, borderLeft: '3px dotted ' + SPROUT.cream2 }} />
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EDE4D2', boxShadow: '0 4px 0 #D9CDB5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.Lock size={18} color="#B6A98E" />
        </div>
        {!isNew && (
          <React.Fragment>
            <div style={{ width: 0, height: 20, borderLeft: '3px dotted ' + SPROUT.cream2 }} />
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EDE4D2', boxShadow: '0 4px 0 #D9CDB5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.Lock size={18} color="#B6A98E" />
            </div>
          </React.Fragment>
        )}
      </div>
    </AppChrome>
  );
}

// ── Proposed · Today card daily-goal driver (static preview → progress ring + lessons-left + Continue) ──
function ProposedTodayDriver({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  // progress ring: 2 of 3 lessons watered (~66%)
  const pct = 2 / 3, R = 22, C = 2 * Math.PI * R;
  return (
    <AppChrome top="hud" nav="home">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '18px 18px', minHeight: 0 }}>
        <div style={{ width: '100%', maxWidth: 256, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 20, padding: '16px 16px 17px', boxShadow: '0 4px 0 ' + SPROUT.line }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, marginBottom: 10 }}>Today</div>
          {isNew ? (
            <React.Fragment>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                {/* (a) progress ring 2/3 with a leaf at center */}
                <span style={{ position: 'relative', width: 54, height: 54, flexShrink: 0 }}>
                  <svg width="54" height="54" viewBox="0 0 54 54" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="27" cy="27" r={R} fill="none" stroke="#EAE2D1" strokeWidth="5" />
                    <circle cx="27" cy="27" r={R} fill="none" stroke={DEEP} strokeWidth="5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} />
                  </svg>
                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Leaf size={18} color={DEEP} /></span>
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16, color: SPROUT.ink, lineHeight: 1.15 }}>Getting started</div>
                  {/* (b) one quiet line */}
                  <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11.5, color: SPROUT.mute, marginTop: 2 }}>1 lesson left to bloom today's goal</div>
                </div>
              </div>
              {/* (c) full-width Continue */}
              <div style={{ marginTop: 14, background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.08em', padding: '12px 0', borderRadius: 13, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>CONTINUE</div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink, lineHeight: 1.15 }}>Getting started</div>
              <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 12, color: SPROUT.mute, marginTop: 5 }}>Lesson 3 · Greetings</div>
            </React.Fragment>
          )}
        </div>
        <div style={{ width: 0, height: 18, borderLeft: '3px dotted ' + SPROUT.cream2 }} />
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#EDE4D2', boxShadow: '0 4px 0 #D9CDB5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.Lock size={18} color="#B6A98E" />
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Today card names the next lesson (generic goal → named lesson hero + CTA + goal bar) ──
function ProposedTodayNamer({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  return (
    <AppChrome top="hud" nav="home">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '18px 18px', minHeight: 0 }}>
        <div style={{ width: '100%', maxWidth: 256, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 20, padding: '15px 15px 16px', boxShadow: '0 4px 0 ' + SPROUT.line }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, marginBottom: 10 }}>Today</div>
          {isNew ? (
            <React.Fragment>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 46, height: 46, borderRadius: 13, flexShrink: 0, background: '#EAF6E2', border: '1.5px solid ' + GREEN + '66', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.Leaf size={23} color={DEEP} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Unit 1 · Lesson 3</div>
                  <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15.5, color: SPROUT.ink, lineHeight: 1.15, marginTop: 1 }}>Market Greetings</div>
                  <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 10.5, color: SPROUT.mute, lineHeight: 1.25, marginTop: 2 }}>Greet a vendor and ask a price</div>
                </div>
              </div>
              <div style={{ marginTop: 13, background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.06em', padding: '12px 0', borderRadius: 13, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>WATER THIS LESSON</div>
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 9.5, color: SPROUT.mute }}>1 of 2 lessons watered today</span>
                  <Icon.Droplet size={11} color="#3E92C9" />
                </div>
                <div style={{ height: 6, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}>
                  <div style={{ width: '50%', height: '100%', borderRadius: 999, background: GREEN }} />
                </div>
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16, color: SPROUT.ink }}>Daily goal</div>
              <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 12, color: SPROUT.mute, marginTop: 5 }}>Water 2 lessons today</div>
              <div style={{ marginTop: 11, height: 6, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}>
                <div style={{ width: '50%', height: '100%', borderRadius: 999, background: GREEN }} />
              </div>
            </React.Fragment>
          )}
        </div>
        <div style={{ width: 0, height: 18, borderLeft: '3px dotted ' + SPROUT.cream2 }} />
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#EDE4D2', boxShadow: '0 4px 0 #D9CDB5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.Lock size={18} color="#B6A98E" />
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed sketch 11 — Today card "here you'll learn" preview line ──
function ProposedTodayPreview({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  return (
    <AppChrome top="hud" nav="home">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '18px 18px', minHeight: 0 }}>
        <div style={{ width: '100%', maxWidth: 256, background: SPROUT.green, borderRadius: 20, padding: '17px 17px 18px', boxShadow: '0 6px 0 ' + SPROUT.greenShadow }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,.82)', marginBottom: 6 }}>Today</div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 19, color: '#fff', lineHeight: 1.15 }}>Getting started</div>
          {/* the preview subline is the ONLY element that differs */}
          {isNew && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 9, background: 'rgba(255,255,255,.18)', borderRadius: 11, padding: '8px 11px' }}>
              <Icon.Leaf size={14} color="#fff" />
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 12.5, color: '#fff', lineHeight: 1.35 }}>3 garden words + a quick review</span>
            </div>
          )}
          <div style={{ marginTop: 13, background: '#fff', color: SPROUT.greenDark, textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.1em', padding: '11px 0', borderRadius: 13, boxShadow: '0 3px 0 rgba(0,0,0,.08)' }}>START</div>
        </div>
        <div style={{ width: 0, height: 18, borderLeft: '3px dotted ' + SPROUT.cream2 }} />
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#EDE4D2', boxShadow: '0 4px 0 #D9CDB5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.Lock size={18} color="#B6A98E" />
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed sketch 12 — daily-goal leaf toast off the HUD chip ──
function ProposedGoalToast({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  return (
    <AppChrome top="hud" nav="home">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, padding: '10px 18px 18px', minHeight: 0 }}>
        {/* the calm leaf-toast off the HUD chip is the ONLY element that differs */}
        {isNew && (
          <div style={{ position: 'relative', width: '100%', maxWidth: 244, marginTop: 4, alignSelf: 'flex-start' }}>
            <span aria-hidden style={{ position: 'absolute', top: -7, right: 70, width: 14, height: 14, background: '#fff', borderLeft: '1.5px solid ' + SPROUT.line, borderTop: '1.5px solid ' + SPROUT.line, transform: 'rotate(45deg)', borderRadius: 3 }} />
            <div className="exp-bob" style={{ background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 16, padding: '13px 15px', boxShadow: '0 12px 26px -12px rgba(42,35,32,.4)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: '50%', background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Plant size={22} color={SPROUT.greenDark} /></span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, color: SPROUT.greenDark }}>Today&rsquo;s goal grown</span>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11.5, color: SPROUT.mute }}>next bloom in 6h</span>
              </div>
            </div>
          </div>
        )}
        {/* the path continues below */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: SPROUT.green, boxShadow: '0 6px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Leaf size={26} color="#fff" /></div>
          <div style={{ width: 0, height: 18, borderLeft: '3px dotted ' + SPROUT.cream2 }} />
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EDE4D2', boxShadow: '0 4px 0 #D9CDB5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.Lock size={17} color="#B6A98E" />
          </div>
        </div>
      </div>
    </AppChrome>
  );
}
function HudChip({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 999, padding: '5px 11px', fontSize: 13 }}>{children}</div>
  );
}

// ── Proposed sketch 13 — XP math ledger above the total ──
function ProposedXpLedger({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentSessionComplete />;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '24px 20px' }}>
      <div className="exp-bob"><Pip size={50} mood="proud" /></div>
      <div style={{ width: '100%', maxWidth: 244, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 18, padding: '15px 16px', boxShadow: '0 6px 16px -10px rgba(42,35,32,.35)' }}>
        {/* the two-line ledger */}
        {[['Base XP', '+80'], ['Perfect-lesson bonus', '+20'], ['7-day streak bonus', '+10']].map(([k, v], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0' }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 12.5, color: SPROUT.mute }}>{k}</span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, color: SPROUT.greenDark }}>{v}</span>
          </div>
        ))}
        <div style={{ height: 1.5, background: SPROUT.line, margin: '8px 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: '.12em', textTransform: 'uppercase', color: SPROUT.mute }}>Earned</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 26, color: SPROUT.greenDark, lineHeight: 1 }}>110</span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: SPROUT.green }}>XP</span>
          </div>
        </div>
      </div>
      <PropCaption>base + bonuses = total, so a strong run visibly pays off instead of reading as one flat number</PropCaption>
    </div>
  );
}

// ── Proposed sketch 14 — quiet secondary action under Continue ──
function ProposedSecondaryAction({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentSessionComplete />;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '26px 20px' }}>
      <div className="exp-bob"><Pip size={58} mood="cheer" /></div>
      <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 19, color: SPROUT.greenDark }}>Lesson complete!</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, width: '100%', maxWidth: 244, marginTop: 4 }}>
        {/* primary */}
        <div style={{ background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, letterSpacing: '.06em', padding: '13px 0', borderRadius: 15, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>CONTINUE</div>
        {/* quiet ghost secondary */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: SPROUT.greenDark, fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13.5, padding: '10px 0', borderRadius: 14, border: '1.5px solid ' + SPROUT.line, background: '#fff' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={SPROUT.greenDark} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>
          Share your bloom
        </div>
      </div>
      <PropCaption>a low-emphasis &ldquo;Share your bloom&rdquo; sits under Continue \u2014 a path for proud learners that never competes with the main CTA</PropCaption>
    </div>
  );
}

// ── Proposed sketch 15 — "so far today" momentum row ──
function ProposedMomentumRow({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  return (
    <AppChrome top="hud" nav="home">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '18px 18px', minHeight: 0 }}>
      <div style={{ width: '100%', maxWidth: 256, background: SPROUT.green, borderRadius: 20, padding: '16px 16px 17px', boxShadow: '0 6px 0 ' + SPROUT.greenShadow }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,.82)', marginBottom: 5 }}>Today · Numbers 2/5</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: '#fff', lineHeight: 1.15 }}>Getting started</div>
        <div style={{ marginTop: 12, background: '#fff', color: SPROUT.greenDark, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.08em', padding: '11px 0', borderRadius: 13, boxShadow: '0 3px 0 rgba(0,0,0,.08)' }}>START +10 <Icon.Plant size={16} color={SPROUT.greenDark} /></div>
      </div>
      {/* the muted momentum row beneath the CTA is the ONLY element that differs */}
      {isNew && (
        <div style={{ width: '100%', maxWidth: 256, display: 'flex', alignItems: 'stretch', gap: 0, background: '#FFFDF8', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, overflow: 'hidden' }}>
          {[[<Icon.Plant size={15} color={SPROUT.greenDark} />, '12', 'grown today'], [<Icon.Droplet size={15} color="#2E8FB0" />, '2', 'lessons'], [<Icon.Clock size={15} color={SPROUT.mute} />, '8', 'minutes']].map(([ic, val, lab], i) => (
            <div key={lab} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '10px 4px', borderLeft: i ? '1.5px solid ' + SPROUT.line : 'none' }}>
              <span style={{ display: 'flex' }}>{ic}</span>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink, lineHeight: 1 }}>{val}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.05em', textTransform: 'uppercase', color: SPROUT.mute }}>{lab}</span>
            </div>
          ))}
        </div>
      )}
      </div>
    </AppChrome>
  );
}

// ── Proposed sketch 16 — thin daily-goal rhythm bar atop the card ──
function ProposedGoalRhythm({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  return (
    <AppChrome top="hud" nav="home">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 13, padding: '18px 18px', minHeight: 0 }}>
      <div style={{ width: '100%', maxWidth: 256, background: SPROUT.green, borderRadius: 20, padding: '14px 16px 17px', boxShadow: '0 6px 0 ' + SPROUT.greenShadow }}>
        {/* thin segmented rhythm bar at the very top is the ONLY element that differs */}
        {isNew && (
          <React.Fragment>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.82)' }}>Today&rsquo;s goal</span>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: '#fff' }}>1 of 3</span>
            </div>
            <div style={{ display: 'flex', gap: 5, marginBottom: 13 }}>
              {[true, false, false].map((on, i) => (
                <div key={i} style={{ flex: 1, height: 6, borderRadius: 999, background: on ? '#fff' : 'rgba(255,255,255,.32)' }} />
              ))}
            </div>
          </React.Fragment>
        )}
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,.82)', marginBottom: 5 }}>Numbers 2/5</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: '#fff', lineHeight: 1.15 }}>Getting started</div>
        <div style={{ marginTop: 12, background: '#fff', color: SPROUT.greenDark, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.08em', padding: '11px 0', borderRadius: 13, boxShadow: '0 3px 0 rgba(0,0,0,.08)' }}>START +10 <Icon.Plant size={16} color={SPROUT.greenDark} /></div>
      </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed sketch · streak vine — join watered days into one calm vine ──
function ProposedStreakVine({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const COLS = 7, ROWS = 5, C = 25, G = 5, PX = 8, PY = 6;
  const VINE = '#6fbf5e';            // calm soft-green fill
  const VINE_STROKE = '#4D9E3F';     // gentle deeper-green trail
  const dayLetters = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  // A run of watered days with ONE freeze gap, calendar order (reading L→R, T→B).
  const START = 8, TODAY = 25;       // inclusive run; TODAY is the highlighted node
  const FREEZE = 18;                 // a skipped/freeze day — faded gap in the ribbon
  const MILE = 28;                   // upcoming milestone target day
  const cx = (c) => PX + c * (C + G) + C / 2;
  const cy = (r) => PY + r * (C + G) + C / 2;
  const gridW = PX * 2 + COLS * C + (COLS - 1) * G;
  const gridH = PY * 2 + ROWS * C + (ROWS - 1) * G;

  // Build a swooping vine path through a contiguous list of cell indices.
  const buildPath = (lo, hi) => {
    const pts = [];
    for (let i = lo; i <= hi; i++) pts.push({ x: cx(i % COLS), y: cy(Math.floor(i / COLS)) });
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1], p1 = pts[i];
      if (Math.abs(p1.y - p0.y) < 2) { d += ` L ${p1.x} ${p1.y}`; }
      else {
        const dy = p1.y - p0.y;
        d += ` C ${gridW + 4} ${(p0.y + dy * 0.45).toFixed(1)}, ${-4} ${(p1.y - dy * 0.45).toFixed(1)}, ${p1.x} ${p1.y}`;
      }
    }
    return d;
  };
  // Two solid segments split by the freeze day, plus a faded dashed bridge across it.
  const segA = buildPath(START, FREEZE - 1);
  const segB = buildPath(FREEZE + 1, TODAY);
  const bridge = `M ${cx((FREEZE - 1) % COLS)} ${cy(Math.floor((FREEZE - 1) / COLS))} L ${cx((FREEZE + 1) % COLS)} ${cy(Math.floor((FREEZE + 1) / COLS))}`;

  const firstDayNum = 4; // so the grid reads like a real month
  return (
    <React.Fragment>
    <MiniStreakHeader />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5, padding: '6px 16px', minHeight: 0 }}>
      {/* quiet streak-freeze card — a slip pauses the vine instead of snapping it */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 12, padding: '5px 11px' }}>
        <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#E5F2F8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5BA9C9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M4 6l16 12M20 6L4 18"/></svg>
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11.5, color: SPROUT.ink, lineHeight: 1.1 }}>1 Freeze available</div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 9.5, color: SPROUT.mute }}>Auto-applied if you miss a day</div>
        </div>
      </div>


      {/* two glanceable stat tiles — days watered · waters used */}
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 9 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#EAF6E2', border: '1.5px solid ' + VINE + '66', borderRadius: 13, padding: '8px 11px' }}>
          <Icon.Leaf size={16} color="#3fa52e" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: '#3fa52e', lineHeight: 1 }}>12</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.08em', textTransform: 'uppercase', color: '#3fa52e', background: '#D8EFCB', borderRadius: 999, padding: '1px 6px' }}>Great</span>
            </span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.06em', textTransform: 'uppercase', color: '#5a7a4e', marginTop: 3 }}>Days grown</span>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '8px 11px' }}>
          <Icon.Droplet size={16} color="#2E8FB0" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink, lineHeight: 1 }}>0</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.mute, marginTop: 3 }}>Water freezes used</span>
          </div>
        </div>
      </div>

      {/* muted eyebrow above the calendar */}
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, textAlign: 'center' }}>June 2026 · Perfect</div>

      {/* month label with < > navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 22, height: 22, borderRadius: 8, background: '#fff', border: '1.5px solid ' + SPROUT.line, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.ChevL size={13} color={SPROUT.mute} /></span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: SPROUT.ink }}>June 2026</span>
          {/* days-grown count chip + muted praise word */}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#EAF6E2', borderRadius: 999, padding: '2px 8px' }}>
            <Icon.Leaf size={11} color="#3fa52e" />
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: '#3fa52e' }}>22</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.08em', textTransform: 'uppercase', color: '#5a7a4e' }}>grown</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* muted freezes-used counter */}
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Icon.Droplet size={11} color={SPROUT.mute} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.04em', textTransform: 'uppercase', color: SPROUT.mute }}>1 freeze used</span>
          </span>
          <span style={{ width: 22, height: 22, borderRadius: 8, background: '#fff', border: '1.5px solid ' + SPROUT.line, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.ChevR size={13} color={SPROUT.mute} /></span>
        </div>
      </div>

      {/* weekday header */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: G, margin: '0 ' + PX + 'px -4px' }}>
        {dayLetters.map((l, i) => (
          <div key={i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>
        ))}
      </div>

      {/* grid + continuous vine overlay */}
      <div style={{ position: 'relative', width: gridW, alignSelf: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, ${C}px)`, gap: G, padding: PX + 'px ' + PX + 'px' }}>
          {Array.from({ length: COLS * ROWS }).map((_, i) => {
            const isFreeze = i === FREEZE;
            const watered = i >= START && i <= TODAY && !isFreeze;
            const isToday = i === TODAY;
            const isMile = i === MILE;
            const isFuture = i > TODAY;
            const dayNum = ((firstDayNum + i - 1) % 31) + 1;
            return (
              <div key={i} style={{
                width: C, height: C, borderRadius: isToday ? '50%' : 8, position: 'relative',
                background: isToday ? 'transparent' : (watered ? VINE : (isFreeze ? '#EAF2EE' : 'transparent')),
                border: isToday ? 'none' : (isMile ? '1.5px dashed ' + VINE_STROKE : (isFreeze ? '1.5px dashed ' + SPROUT.cream2 : (isFuture ? '1px dashed ' + SPROUT.cream2 : 'none'))),
                boxShadow: isMile ? '0 0 0 3px rgba(111,191,94,.18)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: isFreeze ? 0.6 : (isFuture && !isMile ? 0.55 : 1), zIndex: isToday ? 3 : (isMile ? 2 : 1)
              }}>
                {isToday
                  ? <span style={{ width: C, height: C, borderRadius: '50%', background: '#3fa52e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Leaf size={14} color="#fff" /></span>
                  : isMile
                    ? <React.Fragment>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={VINE_STROKE} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></svg>
                        <span style={{ position: 'absolute', bottom: 'calc(100% + 5px)', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', background: '#fff', border: '1px solid ' + VINE + '66', color: '#3fa52e', fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 8, letterSpacing: '.02em', padding: '3px 7px', borderRadius: 999, boxShadow: '0 4px 10px -4px rgba(42,35,32,.35)' }}>next bloom</span>
                      </React.Fragment>
                    : isFreeze
                      ? <Icon.Droplet size={12} color="#8FB8C9" />
                      : watered
                        ? <span style={{ position: 'absolute', top: 2, left: 4, fontFamily: 'Nunito, system-ui', fontSize: 8, fontWeight: 800, color: 'rgba(255,255,255,.85)' }}>{dayNum}</span>
                        : (!isFuture && <span style={{ width: 5, height: 5, borderRadius: '50%', background: SPROUT.cream2 }} />)}
              </div>
            );
          })}
        </div>
        {/* the vine: two solid soft-green trails with a faded dashed bridge across the freeze day */}
        <svg width={gridW} height={gridH} viewBox={`0 0 ${gridW} ${gridH}`} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible', zIndex: 2 }}>
          <path d={bridge} fill="none" stroke={VINE_STROKE} strokeWidth="3" strokeLinecap="round" strokeDasharray="2 5" opacity="0.4" />
          <path d={segA} fill="none" stroke={VINE_STROKE} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={segB} fill="none" stroke={VINE_STROKE} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={segA} fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d={segB} fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* slim streak-goal progress bar (12 → 30 days) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.mute }}>Streak goal</span>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 9.5, color: SPROUT.mute }}>12 / 30 days</span>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}>
          <div style={{ width: '40%', height: '100%', borderRadius: 999, background: VINE }} />
        </div>
      </div>
    </div>
    <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── CURRENT (bare) streak surface — the naive baseline for the month-calendar card ──
function CurrentStreakBare() {
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const week = [true, true, true, true, false, false, false];
  return (
    <React.Fragment>
    <MiniStreakHeader />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '24px 18px', minHeight: 0 }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: '.18em', textTransform: 'uppercase', color: SPROUT.mute }}>Streak</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 66, lineHeight: 1, color: '#3fa52e', letterSpacing: '-.02em' }}>13</span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 16, color: SPROUT.mute }}>days</span>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {letters.map((l, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</span>
            <span style={{ width: 16, height: 16, borderRadius: '50%', background: week[i] ? '#6fbf5e' : 'transparent', border: week[i] ? 'none' : '1.5px solid ' + SPROUT.cream2 }} />
          </div>
        ))}
      </div>
      <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 12.5, fontWeight: 700, color: SPROUT.mute }}>Keep it going!</div>
    </div>
    <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · calm watered-days month calendar ──
function ProposedMonthCalendar({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakBare />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const COLS = 7, ROWS = 5, C = 24, G = 5, PX = 6;
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const TODAY = 25;
  const practiced = new Set([3, 5, 6, 8, 9, 10, 11, 12, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25]);
  const firstDayNum = 4;
  const gridW = PX * 2 + COLS * C + (COLS - 1) * G;
  return (
    <React.Fragment>
    <MiniStreakHeader />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, padding: '12px 16px', minHeight: 0 }}>
      {/* summary band: current streak beside longest */}
      <div style={{ display: 'flex', gap: 9 }}>
        <div style={{ flex: 1, background: '#EAF6E2', border: '1.5px solid ' + GREEN + '66', borderRadius: 14, padding: '9px 11px', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 19, color: DEEP, lineHeight: 1 }}>13</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.06em', textTransform: 'uppercase', color: '#5a7a4e' }}>Day streak</span>
        </div>
        <div style={{ flex: 1, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '9px 11px', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 19, color: SPROUT.ink, lineHeight: 1 }}>23</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.mute }}>Longest</span>
        </div>
      </div>

      <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: SPROUT.ink }}>May 2026</div>

      {/* weekday header */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, ${C}px)`, gap: G, alignSelf: 'center', width: gridW, padding: '0 ' + PX + 'px', boxSizing: 'border-box' }}>
        {letters.map((l, i) => (
          <div key={i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>
        ))}
      </div>

      {/* month grid — watered days carry a green dot; today a soft ring; future faint */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, ${C}px)`, gap: G, alignSelf: 'center', padding: '0 ' + PX + 'px' }}>
        {Array.from({ length: COLS * ROWS }).map((_, i) => {
          const isToday = i === TODAY;
          const isFuture = i > TODAY;
          const watered = practiced.has(i);
          return (
            <div key={i} style={{
              width: C, height: C, borderRadius: 8, position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isToday ? '#EAF6E2' : 'transparent',
              border: isToday ? '2px solid ' + DEEP : 'none',
              boxShadow: isToday ? '0 0 0 3px ' + GREEN + '33' : 'none',
              opacity: isFuture ? 0.4 : 1
            }}>
              <span style={{ position: 'absolute', top: 1, left: 3, fontFamily: 'Nunito, system-ui', fontSize: 7.5, fontWeight: 800, color: SPROUT.mute }}>{((firstDayNum + i - 1) % 31) + 1}</span>
              {watered ? (
                <span style={{ width: 13, height: 13, borderRadius: '50%', background: GREEN, boxShadow: 'inset 0 -2px 0 rgba(0,0,0,.08)' }} />
              ) : (
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: isFuture ? SPROUT.cream2 : '#E4DBC8' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* calm rest-day freeze chip — pause & preserve, never a broken streak */}
      <div style={{ alignSelf: 'center', display: 'flex', alignItems: 'center', gap: 9, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 999, padding: '7px 9px 7px 11px', marginTop: 2 }}>
        <svg width="15" height="16" viewBox="0 0 24 26"><path d="M12 1 3 5v7c0 6 4 9 9 12 5-3 9-6 9-12V5z" fill="#EAF6E2" stroke={DEEP} strokeWidth="2" strokeLinejoin="round" /><path d="M8.5 12.5 11 15l5-5.5" fill="none" stroke={DEEP} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12, color: DEEP }}>Rest day</span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: '#fff', background: GREEN, borderRadius: 999, padding: '2px 8px' }}>2 left</span>
      </div>
    </div>
    <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── CURRENT (bare) league surface — a flat ranking, no ladder/cutoff ──
function CurrentLeagueFlat() {
  const rows = [
    ['Cedar', 480], ['Iris', 412], ['Mossy', 390], ['You', 354],
    ['Fern', 348], ['Aster', 305], ['Bramble', 282], ['Clover', 248],
  ];
  return (
    <AppChrome top="hud" nav="trophy">
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0, padding: '16px 16px', justifyContent: 'center', minHeight: 0 }}>
      <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 17, color: SPROUT.ink, marginBottom: 12 }}>League</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {rows.map(([name, seeds], i) => (
          <div key={name} style={{
            display: 'flex', alignItems: 'center', gap: 9, padding: '9px 2px',
            borderTop: i ? '1px solid ' + SPROUT.line : 'none'
          }}>
            <span style={{ width: 14, fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: SPROUT.mute, textAlign: 'center' }}>{i + 1}</span>
            <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: SPROUT.cream2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: SPROUT.mute }}>{name[0]}</span>
            <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13, color: SPROUT.ink }}>{name}</span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.mute }}>{seeds}</span>
          </div>
        ))}
      </div>
    </div>
    </AppChrome>
  );
}

// ── Proposed · League rank & promotion cutline (header subtitle + Top-8 cutline + highlighted self) ──
function ProposedLeagueRankCutline({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentLeagueFlat />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const rows = [
    ['Cedar', 612], ['Iris', 540], ['Mossy', 498], ['Fern', 455], ['Rowan', 430],
    ['Aspen', 408], ['Heath', 382], ['Briar', 360], ['You', 338, true],
    ['Aster', 312], ['Clover', 286],
  ];
  const PROMO_AFTER = 8; // top 8 advance — cutline between rank 8 and 9
  return (
    <AppChrome top="hud" nav="trophy">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '11px 16px', justifyContent: 'center', minHeight: 0 }}>
        {/* league header band + subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
          <span style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', border: '2px solid ' + DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Trophy size={15} color={DEEP} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14.5, color: SPROUT.ink, lineHeight: 1.1 }}>Sprout League</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700, marginTop: 2 }}>Top 8 advance · 2 days left</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {rows.map(([name, seeds, isYou], i) => {
            const rank = i + 1;
            return (
              <React.Fragment key={name}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '5px 8px',
                  borderRadius: isYou ? 8 : 0,
                  borderLeft: isYou ? '2px solid ' + GREEN : '2px solid transparent',
                  background: isYou ? 'rgba(111,191,94,0.14)' : 'transparent'
                }}>
                  <span style={{ width: 13, fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: rank <= PROMO_AFTER ? DEEP : SPROUT.mute, textAlign: 'center' }}>{rank}</span>
                  <span style={{ width: 23, height: 23, borderRadius: '50%', flexShrink: 0, background: isYou ? '#fff' : SPROUT.cream2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10, color: isYou ? DEEP : SPROUT.mute }}>{name[0]}</span>
                  <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: isYou ? 900 : 800, fontSize: 12.5, color: SPROUT.ink }}>{name}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Icon.Leaf size={10} color={GREEN} />
                    <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: isYou ? DEEP : SPROUT.mute }}>{seeds}</span>
                  </span>
                </div>
                {rank === PROMO_AFTER && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 2px' }}>
                    <span style={{ flex: 1, height: 1, background: GREEN + '55' }} />
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 700, color: DEEP }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 15 6-6 6 6" /></svg>
                      Promotion zone
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 15 6-6 6 6" /></svg>
                    </span>
                    <span style={{ flex: 1, height: 1, background: GREEN + '55' }} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · League week-in-review moment (no closure → full-screen results celebration) ──
function ProposedLeagueResults({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e', GOLD = '#E5A93A';
  if (!isNew) {
    return <CurrentLeagueFlat />;
  }
  const rows = [['2', 'Mossy', 390], ['3', 'You', 354, true], ['4', 'Fern', 332]];
  return (
    <AppChrome>
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '18px 24px', minHeight: 0, overflow: 'hidden' }}>
        {/* bloomed trophy-flower hero in a pot */}
        <span style={{ position: 'relative', width: 96, height: 96, flexShrink: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <span aria-hidden style={{ position: 'absolute', top: 6, left: 14, width: 7, height: 7, borderRadius: '50%', background: '#F6D278', opacity: .8 }} />
          <span aria-hidden style={{ position: 'absolute', top: 16, right: 12, width: 5, height: 5, borderRadius: '50%', background: '#9CD389', opacity: .8 }} />
          {/* bloom */}
          <span style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(160deg,#F6D278,' + GOLD + ')', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 13px -3px ' + GOLD + 'aa' }}>
            <Icon.Leaf size={24} color="#fff" />
          </span>
          {/* stem + pot */}
          <span style={{ position: 'absolute', top: 48, left: '50%', transform: 'translateX(-50%)', width: 4, height: 22, background: DEEP, borderRadius: 2 }} />
          <span style={{ width: 46, height: 30, background: '#EAD9BE', borderRadius: '5px 5px 12px 12px', border: '2px solid #D9C49E' }} />
        </span>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 22, color: DEEP, textAlign: 'center', position: 'relative' }}>You finished 3rd</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 12, color: SPROUT.mute, textAlign: 'center', position: 'relative' }}>Promoted to the Sunflower League</div>
        {/* 3-row final standings snippet */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
          {rows.map(([rank, name, val, you], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 11px', borderRadius: 11, background: you ? 'rgba(111,191,94,0.16)' : '#FFFDF7', border: '1.5px solid ' + (you ? GREEN : SPROUT.line) }}>
              <span style={{ width: 14, fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: you ? DEEP : SPROUT.mute, textAlign: 'center' }}>{rank}</span>
              <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: you ? 900 : 800, fontSize: 12.5, color: SPROUT.ink }}>{name}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon.Leaf size={11} color={GREEN} /><span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: you ? DEEP : SPROUT.mute }}>{val}</span></span>
            </div>
          ))}
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EAF6E2', border: '1.5px solid ' + GREEN + '66', borderRadius: 999, padding: '6px 13px', position: 'relative' }}>
          <Icon.Leaf size={13} color={DEEP} />
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: DEEP }}>+50 seeds</span>
        </span>
        <div style={{ width: '100%', marginTop: 2, background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14.5, letterSpacing: '.06em', padding: '13px 0', borderRadius: 15, boxShadow: '0 4px 0 ' + SPROUT.greenShadow, position: 'relative' }}>CONTINUE</div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Promotion-zone cut line (flat list → single promo divider + highlighted self row) ──
function ProposedLeagueCutLine({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentLeagueFlat />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const rows = [
    ['Cedar', 480], ['Iris', 412], ['Mossy', 390], ['Fern', 354],
    ['You', 332, true], ['Aster', 305], ['Bramble', 282], ['Clover', 248],
  ];
  const PROMO_AFTER = 4; // top 4 promote — cut line after rank 4
  return (
    <AppChrome top="hud" nav="trophy">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0, padding: '14px 16px', justifyContent: 'center', minHeight: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16, color: SPROUT.ink, marginBottom: 11 }}>Sprout League · weekly</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {rows.map(([name, seeds, isYou], i) => {
            const rank = i + 1;
            return (
              <React.Fragment key={name}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '7px 8px',
                  borderRadius: isYou ? 9 : 0,
                  borderLeft: isYou ? '2px solid ' + GREEN : '2px solid transparent',
                  background: isYou ? 'rgba(111,191,94,0.14)' : 'transparent',
                  borderTop: (i && !isYou && !(rows[i - 1] && rows[i - 1][2]) && i !== PROMO_AFTER) ? '1px solid ' + SPROUT.line : 'none'
                }}>
                  <span style={{ width: 14, fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: rank <= PROMO_AFTER ? DEEP : SPROUT.mute, textAlign: 'center' }}>{rank}</span>
                  <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: isYou ? '#fff' : SPROUT.cream2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: isYou ? DEEP : SPROUT.mute }}>{name[0]}</span>
                  <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: isYou ? 900 : 800, fontSize: 13, color: SPROUT.ink }}>{name}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Icon.Leaf size={11} color={GREEN} />
                    <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: isYou ? DEEP : SPROUT.mute }}>{seeds}</span>
                  </span>
                </div>
                {rank === PROMO_AFTER && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 2px' }}>
                    <span style={{ flex: 1, height: 1, background: GREEN + '55' }} />
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 700, color: DEEP }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                      Promotion zone
                    </span>
                    <span style={{ flex: 1, height: 1, background: GREEN + '55' }} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · League standing zones (Top-10 header + promo/demo bands + highlighted self) ──
function ProposedLeagueStandingZones({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentLeagueFlat />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e', CLAY = '#ff8a80';
  const rows = [
    ['Cedar', 612], ['Iris', 590], ['Mossy', 548], ['Rowan', 521], ['Briar', 498],
    ['Fern', 470], ['Aster', 441], ['You', 420, true], ['Sage', 402], ['Clover', 388],
    ['Bramble', 351], ['Thistle', 318],
  ];
  const PROMO_AFTER = 10; // top 10 advance
  const DEMO_BEFORE = 10; // bottom 2 at risk (ranks 11-12)
  const Band = ({ label, color, up }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '2px 4px', background: color + '14', borderRadius: 8, margin: '1px 0' }}>
      <span style={{ flex: 1, height: 1, background: color + '44' }} />
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, color }}>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: up ? 'none' : 'rotate(180deg)' }}><path d="M12 19V5M5 12l7-7 7 7" /></svg>
        {label}
      </span>
      <span style={{ flex: 1, height: 1, background: color + '44' }} />
    </div>
  );
  return (
    <AppChrome top="hud" nav="trophy">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, padding: '9px 14px', justifyContent: 'center', minHeight: 0 }}>
        {/* league name + quiet header line */}
        <div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: SPROUT.ink, lineHeight: 1.1 }}>Sprout League</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700, marginTop: 2 }}>Top 10 bloom up · ends in 3d 6h</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {rows.map(([name, seeds, isYou], i) => {
            const rank = i + 1;
            return (
              <React.Fragment key={name}>
                {i === DEMO_BEFORE && <Band label="Demotion zone" color={CLAY} />}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '3.5px 8px', borderRadius: 9,
                  background: isYou ? '#EAF6E2' : 'transparent',
                  boxShadow: isYou ? 'inset 0 0 0 2px ' + GREEN : 'none',
                  borderTop: (i && i !== DEMO_BEFORE && !isYou && !rows[i - 1][2]) ? '1px solid ' + SPROUT.line : 'none'
                }}>
                  <span style={{ width: 14, fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: rank <= PROMO_AFTER ? DEEP : SPROUT.mute, textAlign: 'center' }}>{rank}</span>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: isYou ? '#fff' : SPROUT.cream2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: isYou ? DEEP : SPROUT.mute }}>{name[0]}</span>
                  <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: isYou ? 900 : 800, fontSize: 12.5, color: SPROUT.ink }}>{name}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Icon.Leaf size={11} color={GREEN} />
                    <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: isYou ? DEEP : SPROUT.mute }}>{seeds}</span>
                  </span>
                </div>
                {i === PROMO_AFTER - 1 && <Band label="Promotion zone" color={DEEP} up />}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · League promotion zone + pinned you-row (top-5 tint + promo divider + highlighted self) ──
function ProposedLeaguePinnedYou({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentLeagueFlat />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const rows = [
    ['Cedar', 480], ['Iris', 412], ['Mossy', 390], ['You', 354, true],
    ['Fern', 348], ['Aster', 305], ['Bramble', 282], ['Clover', 248],
  ];
  const PROMO = 5; // top 5 advance
  return (
    <AppChrome top="hud" nav="trophy">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '14px 16px', justifyContent: 'center', minHeight: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 17, color: SPROUT.ink, marginBottom: 10 }}>League</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {rows.map(([name, seeds, isYou], i) => {
            const rank = i + 1;
            const advancing = rank <= PROMO;
            return (
              <React.Fragment key={name}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '8px 8px', borderRadius: 10,
                  background: isYou ? '#EAF6E2' : (advancing ? 'rgba(111,191,94,0.07)' : 'transparent'),
                  boxShadow: isYou ? 'inset 0 0 0 2px ' + GREEN : 'none'
                }}>
                  <span style={{ width: 14, fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: advancing ? DEEP : SPROUT.mute, textAlign: 'center' }}>{rank}</span>
                  <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: isYou ? '#fff' : SPROUT.cream2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: isYou ? DEEP : SPROUT.mute }}>{name[0]}</span>
                  <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: isYou ? 900 : 800, fontSize: 13, color: SPROUT.ink }}>{name}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Icon.Leaf size={11} color={GREEN} />
                    <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: isYou ? DEEP : SPROUT.mute }}>{seeds}</span>
                  </span>
                </div>
                {rank === PROMO && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 2px' }}>
                    <span style={{ flex: 1, height: 1, background: GREEN + '66' }} />
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, color: DEEP }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                      Promotion zone
                    </span>
                    <span style={{ flex: 1, height: 1, background: GREEN + '66' }} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · League promotion zone (flat list → "Top 8 bloom" rule + countdown + promo divider) ──
function ProposedLeaguePromoZone({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentLeagueFlat />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  // 10 rows; "You" at rank 6 (inside the top-8 promo zone)
  const rows = [
    ['Cedar', 520], ['Iris', 486], ['Mossy', 451], ['Bramble', 430],
    ['Aster', 408], ['You', 372, true], ['Fern', 350], ['Clover', 331],
    ['Sage', 298], ['Reed', 274],
  ];
  const PROMO_AFTER = 8; // top 8 bloom up
  return (
    <React.Fragment>
      <MiniHud />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, padding: '11px 14px', justifyContent: 'center', minHeight: 0 }}>
        {/* (1) rule line + countdown chip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11.5, color: '#5a7a4e' }}>Top 8 bloom to the next garden</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 999, padding: '3px 9px', flexShrink: 0 }}>
            <Icon.Clock size={11} color={SPROUT.mute} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 700, color: SPROUT.mute }}>Ends in 6d</span>
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {rows.map(([name, seeds, isYou], i) => {
            const rank = i + 1;
            return (
              <React.Fragment key={name}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 10,
                  background: isYou ? '#EAF6E2' : 'transparent',
                  boxShadow: isYou ? 'inset 0 0 0 2px ' + GREEN : 'none'
                }}>
                  <span style={{ width: 13, fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: DEEP, textAlign: 'center' }}>{rank}</span>
                  <span style={{ width: 25, height: 25, borderRadius: '50%', flexShrink: 0, background: isYou ? '#fff' : SPROUT.cream2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: isYou ? DEEP : SPROUT.mute }}>{name[0]}</span>
                  <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: isYou ? 900 : 800, fontSize: 12.5, color: SPROUT.ink }}>{name}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Icon.Leaf size={11} color={GREEN} />
                    <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: isYou ? DEEP : SPROUT.mute }}>{seeds}</span>
                  </span>
                </div>
                {/* (2) promotion-zone divider after rank 8 */}
                {rank === PROMO_AFTER && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '3px 4px' }}>
                    <span style={{ flex: 1, height: 1, background: GREEN + '66' }} />
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, color: DEEP }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                      Promotion zone
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                    </span>
                    <span style={{ flex: 1, height: 1, background: GREEN + '66' }} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <MiniBottomNav active="trophy" />
    </React.Fragment>
  );
}

// ── Proposed · Read the league at a glance (flat list → tier strip + countdown + promo/demo zones + self) ──
function ProposedLeagueGlance({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentLeagueFlat />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e', CLAY = '#ff8a80';
  const rows = [
    ['Cedar', 480], ['Iris', 412], ['Mossy', 390], ['You', 354, true],
    ['Fern', 348], ['Aster', 305], ['Bramble', 282], ['Clover', 248],
  ];
  const PROMO_AFTER = 3;   // top 3 promote
  const DEMO_BEFORE = 6;   // bottom 2 (ranks 7–8) at risk
  const tiers = [
    { c: DEEP, on: true }, { c: '#C9A24B', on: false }, { c: '#9AB6D8', on: false },
    { c: '#B58FD0', on: false }, { c: '#D98F8F', on: false },
  ];
  const Divider = ({ label, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 2px' }}>
      <span style={{ flex: 1, borderTop: '1.5px dashed ' + color + '88' }} />
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, color }}>{label}</span>
      <span style={{ flex: 1, borderTop: '1.5px dashed ' + color + '88' }} />
    </div>
  );
  return (
    <AppChrome top="hud" nav="trophy">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, padding: '9px 14px', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16, color: SPROUT.ink }}>League</span>
        </div>
        {/* (1) tier strip + countdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 12, padding: '6px 11px' }}>
          {tiers.map((t, i) => (
            <span key={i} style={{ width: t.on ? 26 : 20, height: t.on ? 26 : 20, borderRadius: '50%', flexShrink: 0, background: t.on ? '#EAF6E2' : '#EFEADF', border: '2px solid ' + (t.on ? DEEP : '#DDD4C4'), display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: t.on ? 1 : 0.55 }}>
              {t.on ? <Icon.Trophy size={13} color={DEEP} /> : <Icon.Lock size={10} color="#B6A98E" />}
            </span>
          ))}
          <span style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.mute }}>Ends in</span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11.5, color: DEEP }}>2d 14h</span>
          </span>
        </div>
        {/* (2)+(3) standings with promo/demo dividers + highlighted self */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {rows.map(([name, seeds, isYou], i) => {
            const rank = i + 1;
            const promoting = rank <= PROMO_AFTER;
            return (
              <React.Fragment key={name}>
                {i === 0 && <Divider label="↑ Promotion zone ↑" color={DEEP} />}
                {i === DEMO_BEFORE && <Divider label="Demotion zone" color={CLAY} />}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '5px 8px',
                  borderRadius: isYou ? 9 : 0,
                  borderLeft: isYou ? '2px solid ' + GREEN : '2px solid transparent',
                  background: isYou ? 'rgba(111,191,94,0.15)' : 'transparent'
                }}>
                  <span style={{ width: 14, fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: promoting ? DEEP : SPROUT.mute, textAlign: 'center' }}>{rank}</span>
                  <span style={{ width: 25, height: 25, borderRadius: '50%', flexShrink: 0, background: isYou ? '#fff' : SPROUT.cream2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: isYou ? DEEP : SPROUT.mute }}>{name[0]}</span>
                  <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: isYou ? 900 : 800, fontSize: 13, color: SPROUT.ink }}>{name}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Icon.Leaf size={11} color={GREEN} />
                    <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: isYou ? DEEP : SPROUT.mute }}>{seeds}</span>
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · League promotion & demotion zones (flat list → header band + promo/demo dividers) ──
function ProposedLeagueZones({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentLeagueFlat />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e', CLAY = '#ff8a80';
  const rows = [
    ['Cedar', 480], ['Iris', 412], ['Mossy', 390], ['You', 354, true],
    ['Fern', 348], ['Aster', 305], ['Bramble', 282], ['Clover', 248],
  ];
  const PROMO_AFTER = 3; // top 3 advance
  const DEMO_BEFORE = 6; // bottom 2 at risk (ranks 7-8)
  const Divider = ({ label, color, up }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '3px 4px' }}>
      <span style={{ flex: 1, height: 1, background: color + '55' }} />
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, color }}>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: up ? 'none' : 'rotate(180deg)' }}><path d="M12 19V5M5 12l7-7 7 7" /></svg>
        {label}
      </span>
      <span style={{ flex: 1, height: 1, background: color + '55' }} />
    </div>
  );
  return (
    <React.Fragment>
      <MiniHud />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: '11px 14px', justifyContent: 'center', minHeight: 0 }}>
        {/* (1) league header band — trophy/badge + reset countdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#EAF6E2', border: '1.5px solid ' + GREEN + '55', borderRadius: 14, padding: '9px 12px' }}>
          <span style={{ width: 30, height: 30, borderRadius: '50%', background: '#fff', border: '2px solid ' + DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon.Trophy size={15} color={DEEP} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, color: SPROUT.ink, lineHeight: 1.1 }}>Sprout League</div>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 9.5, color: '#5a7a4e' }}>Top 3 grow · bottom 2 wilt</div>
          </div>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.mute }}>Resets in</span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: DEEP }}>2d 14h</span>
          </span>
        </div>

        {/* ranked rows with promotion & demotion zone dividers + highlighted self row */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {rows.map(([name, seeds, isYou], i) => {
            const rank = i + 1;
            return (
              <React.Fragment key={name}>
                {i === PROMO_AFTER && <Divider label="Promotion zone" color={DEEP} up />}
                {i === DEMO_BEFORE && <Divider label="Demotion zone" color={CLAY} />}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 10,
                  background: isYou ? '#EAF6E2' : 'transparent',
                  boxShadow: isYou ? 'inset 0 0 0 2px ' + GREEN : 'none'
                }}>
                  <span style={{ width: 13, fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: DEEP, textAlign: 'center' }}>{rank}</span>
                  <span style={{ width: 25, height: 25, borderRadius: '50%', flexShrink: 0, background: isYou ? '#fff' : SPROUT.cream2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: isYou ? DEEP : SPROUT.mute }}>{name[0]}</span>
                  <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: isYou ? 900 : 800, fontSize: 12.5, color: SPROUT.ink }}>{name}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Icon.Leaf size={11} color={GREEN} />
                    <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: isYou ? DEEP : SPROUT.mute }}>{seeds}</span>
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <MiniBottomNav active="trophy" />
    </React.Fragment>
  );
}

// ── Proposed · calm “Bloom League” with legible progression ──
function ProposedBloomLeague({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentLeagueFlat />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const tiers = [
    { name: 'Seedling', glyph: '🌱' },
    { name: 'Sprout', glyph: '🌿', active: true },
    { name: 'Bloom', glyph: '🌸' },
    { name: 'Garden', glyph: '🌳' },
  ];
  const rows = [
    ['Cedar', 480], ['Iris', 412], ['Mossy', 390], ['You', 354, true],
    ['Fern', 348], ['Aster', 305], ['Bramble', 282],
  ];
  return (
    <React.Fragment>
      <MiniHud />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: '11px 14px', justifyContent: 'center', minHeight: 0 }}>
      {/* (1) slim tier header — name + emblem, "top 5 advance" subline, reset countdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ width: 30, height: 30, borderRadius: '50%', background: '#EAF6E2', border: '2px solid ' + DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>🌿</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink, lineHeight: 1.1 }}>Sprout League</div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 9.5, color: '#5a7a4e' }}>Top 5 advance to the next tier</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.mute }}>Resets in</span>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: DEEP }}>3d 22h</span>
        </div>
      </div>

      {/* (c) ranked rows, (d) promo divider after rank 5, (e) self row highlighted */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {rows.map(([name, seeds, isYou], i) => {
          const rank = i + 1;
          return (
            <React.Fragment key={name}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 10,
                background: isYou ? '#EAF6E2' : 'transparent',
                boxShadow: isYou ? 'inset 0 0 0 2px ' + GREEN : 'none'
              }}>
                <span style={{ width: 13, fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: isYou ? DEEP : SPROUT.mute, textAlign: 'center' }}>{rank}</span>
                <span style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: isYou ? GREEN : SPROUT.cream2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: isYou ? '#fff' : SPROUT.mute }}>{name[0]}</span>
                <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, color: SPROUT.ink }}>{name}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Icon.Leaf size={11} color={DEEP} />
                  <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11.5, color: SPROUT.ink }}>{seeds}</span>
                </span>
              </div>
              {rank === 5 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '1px 4px' }}>
                  <span style={{ flex: 1, height: 0, borderTop: '1.5px dashed ' + GREEN }} />
                  <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 8.5, color: DEEP, whiteSpace: 'nowrap' }}>🌱 Top 5 grow to the next league 🌱</span>
                  <span style={{ flex: 1, height: 0, borderTop: '1.5px dashed ' + GREEN }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
      <MiniBottomNav active="trophy" />
    </React.Fragment>
  );
}


const PROPOSED_VIEWS = {
  spotlight: ProposedSpotlight,
  lessonPreview: ProposedLessonPreview,
  gardenPlan: ProposedGardenPlan,
  outOfWater: ProposedOutOfWater,
  resumeCard: ProposedResumeCard,
  wordsMastery: ProposedWordsMastery,
  wordStrength: ProposedWordStrength,
  wordDetail: ProposedWordDetail,
  goldenBloomGate: ProposedGoldenBloomGate,
  goldenBloomTracker: ProposedGoldenBloomTracker,
  goldenBloomBenefits: ProposedGoldenBloomBenefits,
  profileIdentity: ProposedProfileIdentity,
  settingsGrouped: ProposedSettingsGrouped,
  reminderSettings: ProposedReminderSettings,
  flagSwitcher: ProposedFlagSwitcher,
  lessonMissed: ProposedLessonMissed,
  friendsEmpty: ProposedFriendsEmpty,
  achievementShelf: ProposedAchievementShelf,
  bloomDetail: ProposedBloomDetail,
  bloomTiers: ProposedBloomTiers,
  planCompare: ProposedPlanCompare,
  journeySheet: ProposedJourneySheet,
  trialTimeline: ProposedTrialTimeline,
  planPicker: ProposedPlanPicker,
  harvestNode: ProposedHarvestNode,
  dictation: ProposedDictation,
  nearMiss: ProposedNearMiss,
  wordHint: ProposedWordHint,
  wordSearch: ProposedWordSearch,
  badgeBloom: ProposedBadgeBloom,
  taleComplete: ProposedTaleComplete,
  achievementProgress: ProposedAchievementProgress,
  shareGarden: ProposedShareGarden,
  meWeekChart: ProposedMeWeekChart,
  arrangeGhostSlots: ProposedArrangeGhostSlots,
  arrangeWritingLines: ProposedArrangeWritingLines,
  arrangeFixable: ProposedArrangeFixable,
  typeIt: ProposedTypeIt,
  typeItHints: ProposedTypeItHints,
  clozeContext: ProposedClozeContext,
  clozeDrop: ProposedClozeDrop,
  clozeReadable: ProposedClozeReadable,
  wordsNeedsWater: ProposedWordsNeedsWater,
  goldenBloomComplete: ProposedGoldenBloomComplete,
  dailyGoalRing: ProposedDailyGoalRing,
  inARowChip: ProposedInARowChip,
  hearItPrompt: ProposedHearItPrompt,
  pictureGridMcq: ProposedPictureGridMcq,
  gardenFriends: ProposedGardenFriends,
  friendsFeed: ProposedFriendsFeed,
  gardenBuddy: ProposedGardenBuddy,
  scrollToToday: ProposedScrollToToday,
  matchTiles: ProposedMatchTiles,
  matchCollapse: ProposedMatchCollapse,
  lessonHeader: ProposedLessonHeader,
  leaveGuard: ProposedLeaveGuard,
  hudExplainer: ProposedHudExplainer,
  lowWater: ProposedLowWater,
  listenPlayer: ProposedListenPlayer,
  listenTwoSpeed: ProposedListenTwoSpeed,
  taleDialogue: ProposedTaleDialogue,
  taleShelf: ProposedTaleShelf,
  taleFollow: ProposedTaleFollow,
  reminderPrime: ProposedReminderPrime,
  notifPrime: ProposedNotifPrime,
  reminderTime: ProposedReminderTime,
  goalCommit: ProposedGoalCommit,
  placement: ProposedPlacement,
  whyMotivation: ProposedWhyMotivation,
  tidyHud: ProposedTidyHud,
  guidebook: ProposedGuidebook,
  bloomDeal: ProposedBloomDeal,
  adaptiveHeadline: ProposedAdaptiveHeadline,
  statRow: ProposedStatRow,
  heroNumber: ProposedHeroNumber,
  selectedState: ProposedSelectedState,
  newWordPrompt: ProposedNewWordPrompt,
  taleIntro: ProposedTaleIntro,
  pickAffordance: ProposedPickAffordance,
  audioFallback: ProposedAudioFallback,
  speakIt: ProposedSpeakIt,
  speakFeedback: ProposedSpeakFeedback,
  speakLive: ProposedSpeakLive,
  wrongDrawer: ProposedWrongDrawer,
  explainMistake: ProposedExplainMistake,
  teachableWrong: ProposedTeachableWrong,
  calmFeedbackDrawer: ProposedCalmFeedbackDrawer,
  weekStripRun: ProposedWeekStripRun,
  unitRibbon: ProposedUnitRibbon,
  todayPreview: ProposedTodayPreview,
  todayDriver: ProposedTodayDriver,
  todayNamer: ProposedTodayNamer,
  todayTime: ProposedTodayTime,
  goalToast: ProposedGoalToast,
  xpLedger: ProposedXpLedger,
  secondaryAction: ProposedSecondaryAction,
  momentumRow: ProposedMomentumRow,
  goalRhythm: ProposedGoalRhythm,
  streakVine: ProposedStreakVine,
  bloomLeague: ProposedBloomLeague,
  leagueZones: ProposedLeagueZones,
  leagueGlance: ProposedLeagueGlance,
  leagueStandingZones: ProposedLeagueStandingZones,
  leagueCutLine: ProposedLeagueCutLine,
  leagueResults: ProposedLeagueResults,
  leagueRankCutline: ProposedLeagueRankCutline,
  leaguePromoZone: ProposedLeaguePromoZone,
  leaguePinnedYou: ProposedLeaguePinnedYou,
  sectionedShop: ProposedSectionedShop,
  scannableShop: ProposedScannableShop,
  milestoneRail: ProposedMilestoneRail,
  meStatsGrid: ProposedMeStatsGrid,
  weekStreakRow: ProposedWeekStreakRow,
  gardenSummary: ProposedGardenSummary,
  gardenPlantDetail: ProposedGardenPlantDetail,
  gardenNextPlot: ProposedGardenNextPlot,
  gardenBloomBand: ProposedGardenBloomBand,
  wateringCalendar: ProposedWateringCalendar,
  streakMilestone: ProposedStreakMilestone,
  streakGarden: ProposedStreakGarden,
  streakMilestoneRailAbove: ProposedMilestoneRailAbove,
  streakMilestoneRailTiles: ProposedMilestoneRailTiles,
  streakGardenModal: ProposedStreakGardenModal,
  streakWeekYouCanSee: ProposedStreakWeekYouCanSee,
  streakUnbrokenRibbon: ProposedUnbrokenRibbon,
  streakGrowthVine: ProposedGrowthVine,
  streakConnectedVine: ProposedConnectedVine,
  streakRibbonFreezeJar: ProposedRibbonFreezeJar,
  streakRibbonNextMilestone: ({ mode }) => <ProposedConnectedVine mode={mode} current="12 days" nextLabel="Next milestone" nextValue="14 days" />,
  streakWateredRibbon: ProposedWateredRibbon,
  streakGardenCal2: ProposedGardenStreakCal2,
  streakWateredRibbonDrop: ProposedWateredRibbonDrop,
  streakMonthOfGrowth: ProposedMonthOfGrowth,
  streakWeeklyRow: ProposedWeeklyStreakRow,
  streakGlanceMonthGrid: ProposedGlanceMonthGrid,
  streakCalFull: ProposedStreakCalFull,
  streakWeekStrip: ProposedStreakWeekStrip,
  streakWeekMilestoneBar: ProposedWeekMilestoneBar,
  streakWeekDrops: ProposedStreakWeekDrops,
  streakRibbonGoalNudge: ProposedRibbonGoalNudge,
  shopSuperGems: ProposedShopSuperGems,
  shopGroupedHero: ProposedShopGroupedHero,
  shopMyShed: ProposedShopMyShed,
  shopShelves: ProposedShopShelves,
  streakConnectedRun: (props) => <ProposedConnectedVine {...props} current="13 days" nextLabel="Next milestone" nextValue="2 days" />,
  streakVinePerfectWeek: ProposedVinePerfectWeek,
  streakRibbonPerfectTag: ProposedRibbonPerfectTag,
  streakRibbonFreezeTiles: ProposedRibbonFreezeTiles,
  streakRibbonRecords: ProposedRibbonRecords,
  streakRibbonWateredRing: ProposedRibbonWateredRing,
  streakTrail: ProposedStreakTrail,
  streakRunConnected: ProposedStreakRunConnected,
  streakGrowingVineTip: ProposedGrowingVineTip,
  streakWeekStripRibbons: ProposedWeekStripRibbons,
  questsScannable: ProposedQuestsScannable,
  questsRewards: ProposedQuestsRewards,
  questsClaimable: ProposedQuestsClaimable,
  streakVineFilledRing: ProposedVineFilledRing,
  shopOwnedState: ProposedShopOwnedState,
  shopOwnedRow: ProposedShopOwnedRow,
  streakRibbonBloomChip: ProposedRibbonBloomChip,
  streakBandBloom: ProposedStreakBandBloom,
  shopGroupedSections: ProposedShopGroupedSections,
  shopBoostsRefills: ProposedShopBoostsRefills,
  shopSaversBoostsGems: ProposedShopSaversBoostsGems,
  shopByPurpose: ProposedShopByPurpose,
  shopWhatItDoes: ProposedShopWhatItDoes,
  shopWagerSections: ProposedShopWagerSections,
  shopSelfExplain: ProposedShopSelfExplain,
  matchFeedback: ProposedMatchFeedback,
  streakWeekRingSaver: ProposedWeekRingSaver,
  shopPopularSections: ProposedShopPopular,
  shopStreakLeague: ProposedShopStreakLeague,
  streakUnbrokenRibbon: ProposedUnbrokenRibbon,
  streakCalmMonth: ProposedCalmMonthCal,
  streakRibbonStats: ProposedRibbonStats,
  streakMilestoneTrack: ProposedMilestoneTrack,
  streakMilestoneTrackLeaf: ProposedMilestoneTrackLeaf,
  streakGardenCal: ProposedGardenStreakCalV2,
  shopScannableRows: ProposedShopRows,
  shopCalmSectioned: ProposedCalmShop,
  streakGrowingVine: ProposedGrowingVine,
  weeklyQuest: ProposedWeeklyQuest,
};

// custom CURRENT mockups — used only when an exploration's real “before” screen
// doesn't exist as a shipped screen (rendered in the same clean phone frame).
const CURRENT_VIEWS = {
  streakBare: CurrentStreakBare,
  leagueFlat: CurrentLeagueFlat,
  streakDots: CurrentStreakDots,
};

// ── The exploration data ── (moved to exploration-data.jsx, loaded before this file)


// ── small status chip ──
function StatusChip({ status, size }) {
  const shipped = status === 'shipped';
  const sm = size === 'sm';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: 'Nunito, system-ui', fontWeight: 900,
      fontSize: sm ? 9 : 12, letterSpacing: '.06em', textTransform: 'uppercase',
      padding: sm ? '3px 7px' : '5px 11px', borderRadius: 999,
      background: shipped ? SPROUT.green : '#FBF1DA',
      color: shipped ? '#fff' : '#8A6516',
      border: shipped ? 'none' : '1px solid #E8D6A8',
    }}>
      {shipped ? <>Shipped <svg width={sm ? 9 : 11} height={sm ? 9 : 11} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7.5 6 11l6-8"/></svg></> : 'Testing'}
    </span>
  );
}

// ── reference thumbnail — the actual Mobbin reference screenshot ──
function RefThumb({ label, src }) {
  const [ok, setOk] = React.useState(true);
  return (
    <div style={{
      width: 56, height: 80, borderRadius: 11, flexShrink: 0,
      border: '1.5px solid ' + SPROUT.line, overflow: 'hidden', position: 'relative',
      background: 'repeating-linear-gradient(135deg, #F4EEE1 0 7px, #EFE8D8 7px 14px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      boxShadow: '0 6px 16px -8px rgba(42,35,32,.4)'
    }}>
      {src && ok ? (
        <img
          src={src} alt={label + ' reference screen'} loading="lazy"
          onError={() => setOk(false)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span style={{
          width: '100%', textAlign: 'center', padding: '3px 2px',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.06em',
          color: SPROUT.mute, background: 'rgba(255,253,247,.85)', textTransform: 'uppercase',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>{label}</span>
      )}
    </div>
  );
}

function SourceChip({ name, href }) {
  const inner = (
    <>
      {name}
      <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9 9.5 4.5M5.5 4.5h4v4"/></svg>
    </>
  );
  const style = {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    background: '#EAF6E2', color: SPROUT.greenDark, textDecoration: 'none',
    fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5,
    padding: '5px 11px', borderRadius: 999,
    cursor: href ? 'pointer' : 'default', transition: 'background .12s'
  };
  if (!href) {
    return <span style={style}>{inner}</span>;
  }
  return (
    <a
      href={href} target="_blank" rel="noopener noreferrer" title={'Open ' + name + ' reference on Mobbin'}
      style={style}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#DCF0CF'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = '#EAF6E2'; }}
    >{inner}</a>
  );
}

// ── note card (pain point / why it's better) ──
function NoteCard({ tone, title, body }) {
  const pos = tone === 'positive';
  return (
    <div style={{
      flex: 1, minWidth: 240,
      background: pos ? '#EAF6E2' : '#FBE9E7',
      borderRadius: 16, padding: '16px 18px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {pos ? (
          <Icon.Leaf size={16} color={SPROUT.greenDark} />
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#C0564B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2.5 14.5 13.5H1.5L8 2.5z"/><path d="M8 6.5v3.2M8 11.7v.1"/></svg>
        )}
        <span style={{
          fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14,
          color: pos ? SPROUT.greenDark : '#B5453B'
        }}>{title}</span>
      </div>
      <div style={{
        fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 13.5, lineHeight: 1.5,
        color: pos ? '#41663A' : '#9A4339', textWrap: 'pretty'
      }}>{body}</div>
    </div>
  );
}

// ── ticket IDs ── stable Hermes Kanban ticket per exploration, derived from its
// 1-based position so every row has a scannable SE-00x id (SE-001, SE-002, …).
function ticketFor(idx) { return 'SE-' + String(idx + 1).padStart(3, '0'); }

// quiet six-dot drag handle (visual affordance, mirrors the Gallery grip)
function GripDots({ on }) {
  const c = on ? '#7FB36B' : '#CFC6BB';
  return (
    <span aria-hidden style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4, cursor: 'grab' }}>
      {[0, 1, 2].map((r) => (
        <span key={r} style={{ display: 'flex', gap: 2 }}>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: c }} />
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: c }} />
        </span>
      ))}
    </span>
  );
}

// ── left Exploration Index ── grouped by phase (Testing / Shipped), with a stable
// numeric column, title, and an aligned mono ticket id under each title.
function ExplorationIndex({ items, sel, onSelect, isMobile }) {
  // keep original (stable) index with each item, then split into the two phases
  const withIdx = items.map((ex, i) => ({ ex, i }));
  const groups = [
    { key: 'testing', label: 'Testing phase', rows: withIdx.filter((r) => r.ex.status !== 'shipped') },
    { key: 'shipped', label: 'Ship phase', rows: withIdx.filter((r) => r.ex.status === 'shipped') },
  ];

  if (isMobile) {
    return (
      <div className="no-scrollbar" style={{
        flexShrink: 0, display: 'flex', gap: 8, overflowX: 'auto',
        padding: '12px 16px', borderBottom: '1px solid rgba(42,35,32,.08)', background: '#F5F0E7'
      }}>
        {items.map((ex, i) => {
          const on = i === sel;
          return (
            <button key={ex.id} onClick={() => onSelect(i)} style={{
              appearance: 'none', cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 7, padding: '8px 13px', borderRadius: 999,
              border: '1px solid ' + (on ? 'transparent' : 'rgba(42,35,32,.14)'),
              background: on ? '#2A2320' : '#FFFDF7',
              color: on ? '#F5F0E7' : '#2A2320',
              fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap'
            }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, opacity: .7, color: on ? '#9FD08C' : '#7FB36B' }}>{ticketFor(i)}</span>
              {ex.title}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{
      width: 256, flexShrink: 0, height: '100%', overflowY: 'auto',
      borderRight: '1px solid rgba(42,35,32,.08)', background: '#F5F0E7'
    }}>
      <div style={{ padding: '18px 16px 4px' }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: '#2A2320', letterSpacing: '-.01em' }}>Exploration Index</div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', color: '#B0A89C', marginTop: 3 }}>{items.length} tickets · {ticketFor(0)}…{ticketFor(items.length - 1)}</div>
      </div>

      {groups.map((g) => g.rows.length > 0 && (
        <div key={g.key} style={{ padding: '0 8px' }}>
          {/* phase / group header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '14px 9px 7px',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase'
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: g.key === 'shipped' ? '#4D9E3F' : '#E0A92E', flexShrink: 0 }} />
            <span style={{ color: '#8A8076' }}>{g.label}</span>
            <span style={{ marginLeft: 'auto', color: '#BEB5AB' }}>{g.rows.length}</span>
          </div>

          {g.rows.map(({ ex, i }) => {
            const on = i === sel;
            return (
              <div key={ex.id} onClick={() => onSelect(i)} style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                padding: '11px 9px 10px', borderRadius: 10, cursor: 'pointer', marginBottom: 2,
                position: 'relative',
                background: on ? 'rgba(79,158,63,.14)' : 'transparent',
                boxShadow: on ? 'inset 3px 0 0 #4D9E3F' : 'none',
                transition: 'background .1s'
              }}
              onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = 'rgba(42,35,32,.045)'; }}
              onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
                <GripDots on={on} />
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 11, flexShrink: 0, marginTop: 1, width: 20, textAlign: 'right',
                  color: on ? '#4D9E3F' : '#BEB5AB', letterSpacing: '.04em'
                }}>{String(i + 1).padStart(2, '0')}</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13.5, lineHeight: 1.25,
                    color: on ? '#2A2320' : '#5A524A', marginBottom: 4,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>{ex.title}</div>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '.08em',
                    color: on ? '#4D9E3F' : '#A89F94', fontWeight: 700
                  }}>{ticketFor(i)}</div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div style={{ height: 16 }} />
    </div>
  );
}

// ── right Exploration tracking panel ── replaces generic Tweaks as the primary
// side panel for Exploration: selected ticket, phase/status, screen metadata, notes.
function ExplorationTrackPanel({ ex, idx, total, embedded, onClose }) {
  const ticket = ticketFor(idx);
  const shipped = ex.status === 'shipped';
  const Row = ({ label, value, mono }) => (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: '9px 0', borderBottom: '1px solid rgba(42,35,32,.07)' }}>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: '.12em', textTransform: 'uppercase', color: '#A89F94', flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: mono ? 'JetBrains Mono, monospace' : 'Nunito, system-ui', fontWeight: mono ? 700 : 800, fontSize: mono ? 12 : 13, color: '#2A2320', textAlign: 'right', minWidth: 0 }}>{value}</span>
    </div>
  );
  return (
    <div style={{
      width: embedded ? '100%' : 272, flexShrink: 0, height: '100%', overflowY: 'auto',
      borderLeft: embedded ? 'none' : '1px solid rgba(42,35,32,.08)', background: '#FFFDF7'
    }}>
      <div style={{ padding: '16px 16px 10px', borderBottom: '1px solid rgba(42,35,32,.08)', display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: '#2A2320', letterSpacing: '-.01em' }}>Exploration</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, fontWeight: 700, color: '#4D9E3F', background: 'rgba(79,158,63,.12)', borderRadius: 6, padding: '3px 8px' }}>{ticket}</span>
        {embedded && onClose && (
          <button onClick={onClose} aria-label="Close panel" style={{ appearance: 'none', border: 0, cursor: 'pointer', background: 'transparent', width: 28, height: 28, marginRight: -6, borderRadius: 8, color: '#9A8F85', fontSize: 18, lineHeight: 1 }}>×</button>
        )}
      </div>

      <div style={{ padding: '14px 16px 6px' }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16, color: '#2A2320', lineHeight: 1.25, marginBottom: 8 }}>{ex.title}</div>
        <StatusChip status={ex.status} size="sm" />
      </div>

      <div style={{ padding: '6px 16px 4px' }}>
        <Row label="Ticket" value={ticket} mono />
        <Row label="Phase" value={shipped ? 'Shipped' : 'Testing'} />
        <Row label="Status" value={shipped ? 'Shipped ✓' : 'In testing'} />
        <Row label="Index" value={String(idx + 1).padStart(2, '0') + ' / ' + total} mono />
        <Row label="Section" value={ex.context || '—'} />
        <Row label="Surface" value={(ex.currentCaption || 'Sprout').replace(/^Sprout · /, '') || '—'} />
      </div>

      <div style={{ padding: '14px 16px 6px' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: '.12em', textTransform: 'uppercase', color: '#A89F94', marginBottom: 7 }}>Quick notes</div>
        <textarea
          key={ticket}
          defaultValue={''}
          placeholder={'Notes for ' + ticket + '…'}
          style={{
            width: '100%', minHeight: 96, resize: 'vertical', boxSizing: 'border-box',
            border: '1.5px solid rgba(42,35,32,.14)', borderRadius: 12, padding: '10px 12px',
            fontFamily: 'Nunito, system-ui', fontSize: 13, fontWeight: 600, color: '#2A2320',
            background: '#F5F0E7', outline: 'none', lineHeight: 1.5
          }} />
      </div>

      <div style={{ padding: '4px 16px 20px' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: '.12em', textTransform: 'uppercase', color: '#A89F94', marginBottom: 7 }}>Inspired by</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {(ex.inspired && ex.inspired.sources || []).map((s, i) => (
            <SourceChip key={s} name={s} href={(ex.inspired.links && ex.inspired.links[i]) || ex.inspired.link} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── one phone-sized panel (current OR proposed) with a quiet caption ──
// View-only board: phones show ONLY the clean app screen; all explanation
// lives in the cards below (Pain point / Why it's better / Inspired by).
function ComparePanel({ caption, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative' }}>
        {children}
      </div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '.16em',
        textTransform: 'uppercase', color: '#B0A89C'
      }}>{caption}</div>
    </div>
  );
}

// ── the detail view for one exploration ──
function ExplorationDetail({ ex, idx, total, tweaks, ScreenContent, isMobile }) {
  const DEV_W = 402, DEV_H = 874;
  const scale = isMobile ? 0.46 : 0.56;
  const w = Math.round(DEV_W * scale), h = Math.round(DEV_H * scale);
  const View = PROPOSED_VIEWS[ex.proposed];

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: isMobile ? '24px 18px 80px' : '40px 44px 90px' }}>
      {/* header */}
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '.14em',
        textTransform: 'uppercase', color: SPROUT.greenDark, marginBottom: 14
      }}>
        EXPLORATION {String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')} · {ticketFor(idx)} · {(ex.title || '').toUpperCase()}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 8 }}>
        <h1 style={{
          margin: 0, fontFamily: 'Nunito, system-ui', fontWeight: 900,
          fontSize: isMobile ? 26 : 32, color: SPROUT.ink, letterSpacing: '-.01em'
        }}>{ex.title}</h1>
        <StatusChip status={ex.status} />
      </div>
      <div style={{
        fontFamily: 'Nunito, system-ui', fontSize: isMobile ? 15 : 17, fontWeight: 600,
        color: SPROUT.mute, marginBottom: isMobile ? 28 : 40
      }}>{ex.tagline}</div>

      {/* current vs proposed */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: isMobile ? 28 : 56,
        justifyContent: 'center', alignItems: 'flex-start', marginBottom: isMobile ? 32 : 48
      }}>
        <ComparePanel caption="Current">
          <ProposedFrame w={w} h={h} scale={scale}>
            <View calm={tweaks.calm} mode="current" />
          </ProposedFrame>
        </ComparePanel>

        <ComparePanel caption="New">
          <ProposedFrame w={w} h={h} scale={scale}>
            <View calm={tweaks.calm} mode="proposed" />
          </ProposedFrame>
        </ComparePanel>
      </div>

      {/* inspired by */}
      <div style={{
        background: 'linear-gradient(180deg,#FFFDF8,#FBF6EC)', border: '1.5px solid ' + SPROUT.line,
        borderRadius: 18, padding: isMobile ? '18px' : '20px 24px', marginBottom: 18,
        display: 'flex', gap: isMobile ? 16 : 28, alignItems: 'center', flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: '#B0A89C', maxWidth: 64, lineHeight: 1.4 }}>Inspired by</div>
          <RefThumb label={ex.inspired.sources[0]} src={ex.inspired.image} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, alignItems: 'flex-start' }}>
            {ex.inspired.sources.map((s, i) => (
              <SourceChip key={s} name={s} href={(ex.inspired.links && ex.inspired.links[i]) || ex.inspired.link} />
            ))}
          </div>
        </div>
        <div style={{
          flex: 1, minWidth: 220,
          fontFamily: 'Nunito, system-ui', fontSize: 14, fontWeight: 600, lineHeight: 1.55,
          color: '#6B6258', textWrap: 'pretty'
        }}>{ex.inspired.note}</div>
      </div>

      {/* pain + better */}
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        <NoteCard tone="negative" title="Pain point" body={ex.pain} />
        <NoteCard tone="positive" title="Why it's better" body={ex.better} />
      </div>
    </div>
  );
}

// ── board shell ──
function ExplorationBoard({ tweaks, ScreenContent, isMobile, sel: selProp, onSel }) {
  const [selState, setSelState] = React.useState(0);
  const sel = selProp != null ? selProp : selState;
  const setSel = onSel || setSelState;
  const ex = EXPLORATIONS[sel];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: 0, overflow: 'hidden' }}>
      <ExplorationStyles />
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <ExplorationDetail
          ex={ex} idx={sel} total={EXPLORATIONS.length}
          tweaks={tweaks} ScreenContent={ScreenContent} isMobile={isMobile} />
      </div>
    </div>
  );
}
