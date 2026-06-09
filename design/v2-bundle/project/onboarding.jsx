// ─────────────────────────────────────────────────────────────
// Onboarding / activation flow — garden-themed, 3 steps + welcome + ready.
// Mirrors the lesson chrome: progress bar + back chevron at top, Pip in a
// speech bubble, big tappable option cards, a committing CTA at the bottom.
// Calls onComplete() when the learner finishes (or skips).
// ─────────────────────────────────────────────────────────────

function ObProgress({ step, total }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 10.5, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 }}>Step {Math.min(step + 1, total)} of {total}</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 9, borderRadius: 5, background: SPROUT.cream2, overflow: 'hidden' }}>
            <div style={{
              width: i < step ? '100%' : i === step ? '50%' : '0%',
              height: '100%', borderRadius: 5, background: SPROUT.green, transition: 'width .35s ease',
            }}/>
          </div>
        ))}
      </div>
    </div>
  );
}

function ObBubble({ text, mood = 'happy', wave = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 22 }}>
      <div style={{ flexShrink: 0 }}><Pip size={76} mood={mood} wave={wave}/></div>
      <div style={{
        position: 'relative', background: SPROUT.paper, border: `2px solid ${SPROUT.line}`,
        borderRadius: 16, padding: '12px 15px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
        fontSize: 16, fontWeight: 800, color: SPROUT.ink, lineHeight: 1.35, flex: 1,
      }}>
        {text}
        <div style={{ position: 'absolute', left: -8, bottom: 13, width: 14, height: 14, background: SPROUT.paper, borderLeft: `2px solid ${SPROUT.line}`, borderBottom: `2px solid ${SPROUT.line}`, transform: 'rotate(45deg)' }}/>
      </div>
    </div>
  );
}

// Big selectable option card (radio or checkbox behavior set by `multi`)
function ObOption({ icon, title, sub, selected, onClick, badge, multi }) {
  return (
    <button onClick={onClick}
      role={multi ? 'checkbox' : 'radio'} aria-checked={!!selected}
      aria-label={title + (sub ? '. ' + sub : '')}
      style={{
      width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
      display: 'flex', alignItems: 'center', gap: 13, padding: '14px 15px',
      borderRadius: 16, marginBottom: 10, position: 'relative',
      background: selected ? '#EFF7EA' : '#fff',
      border: `2px solid ${selected ? SPROUT.green : (badge ? SPROUT.sun : SPROUT.line)}`,
      boxShadow: selected ? `0 3px 0 ${SPROUT.greenShadow}` : `0 2px 0 ${SPROUT.cardShadow}`,
      transition: 'background .15s, border-color .15s',
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: selected ? '#fff' : SPROUT.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 24 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: SPROUT.ink }}>{title}</span>
          {badge && <span style={{ fontSize: 9.5, fontWeight: 900, color: '#C28A1C', background: '#FCEFC7', borderRadius: 6, padding: '2px 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{badge}</span>}
        </div>
        {sub && <div style={{ fontSize: 12.5, fontWeight: 700, color: SPROUT.mute }}>{sub}</div>}
      </div>
      <div style={{
        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
        border: `2px solid ${selected ? SPROUT.green : SPROUT.cream2}`,
        background: selected ? SPROUT.green : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {selected && <Icon.Check size={15} color="#fff"/>}
      </div>
    </button>
  );
}

// Small low-commitment reassurance line under goal / notification steps
function ObReassure({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 4, color: SPROUT.mute }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={SPROUT.mute} strokeWidth="2"/><path d="M12 11v5" stroke={SPROUT.mute} strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="8" r="1.2" fill={SPROUT.mute}/></svg>
      <span style={{ fontSize: 11.5, fontWeight: 700 }}>{text}</span>
    </div>
  );
}

// A tiny reassurance point with a leaf check — used on the parent screen.
function ObPoint({ title, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '12px 14px', background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14, boxShadow: `0 2px 0 ${SPROUT.cardShadow}` }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: '#EFF7EA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon.Leaf size={16} color={SPROUT.green}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: SPROUT.mute, marginTop: 1, lineHeight: 1.35 }}>{sub}</div>
      </div>
    </div>
  );
}

// Try-before-signup first run. Two questions max (who's this for · what to grow),
// one calm parent-reassurance beat on the child path, then straight into the first
// lesson. The account ask ("Save your garden") is deferred until after the first bloom.
function OnboardingFlow({ onComplete }) {
  const [step, setStep] = React.useState(0);
  const [audience, setAudience] = React.useState(null); // 'child' | 'self'
  const [grow, setGrow] = React.useState([]);            // playful goals, multi

  // The flow grows a reassurance beat only on the parent path.
  const seq = React.useMemo(
    () => ['welcome', 'audience', ...(audience === 'child' ? ['reassure'] : []), 'grow', 'ready'],
    [audience]
  );
  const key = seq[Math.min(step, seq.length - 1)] || 'ready';
  const forChild = audience === 'child';

  // Only the two real questions advance the progress bar.
  const questionKeys = ['audience', 'grow'];
  const qIndex = questionKeys.indexOf(key);

  const grows = [
    { id: 'fun',    icon: '🎈', label: 'Just for the fun of it' },
    { id: 'talk',   icon: '🗣️', label: 'Talk with new people' },
    { id: 'travel', icon: '✈️', label: 'Travel adventures' },
    { id: 'school', icon: '🎓', label: forChild ? 'Help with school' : 'Do great at school' },
    { id: 'work',   icon: '🌟', label: forChild ? 'Get a head start' : 'Feel confident at work' },
  ];
  const toggleGrow = (id) => setGrow((g) => g.includes(id) ? g.filter((x) => x !== id) : [...g, id]);

  const canContinue =
    key === 'audience' ? !!audience :
    key === 'grow' ? grow.length > 0 :
    true;

  const back = () => setStep((s) => Math.max(0, s - 1));
  const next = () => setStep((s) => Math.min(seq.length - 1, s + 1));

  // ── Welcome ──
  if (key === 'welcome') {
    return (
      <ObShell hideChrome>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 12px' }}>
          <Pip size={150} mood="cheer" wave/>
          <div style={{ fontSize: 27, fontWeight: 900, color: SPROUT.ink, marginTop: 18, lineHeight: 1.15 }}>
            Hi, I'm Pip!
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: SPROUT.mute, marginTop: 8, maxWidth: 284 }}>
            Let's grow your English together — a few gentle minutes a day. 🌱
          </div>
        </div>
        <ObFooter label="Get started" enabled onClick={next}/>
      </ObShell>
    );
  }

  // ── Parent reassurance (child path only) — one calm word for the grown-up ──
  if (key === 'reassure') {
    return (
      <ObShell hideChrome>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <Pip size={72} mood="happy"/>
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.greenDark, textTransform: 'uppercase', letterSpacing: 0.8 }}>For grown-ups</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.15, marginTop: 2 }}>A calm place to learn 🌿</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <ObPoint title="No ads, ever" sub="Nothing trying to sell to your child."/>
            <ObPoint title="No pressure" sub="Calm by design — gentle goals, never guilt."/>
            <ObPoint title="Their own pace" sub="Sprout adapts so learning always feels kind."/>
            <ObPoint title="Safe & private" sub="A quiet garden, just for growing English."/>
          </div>
        </div>
        <ObFooter label="Sounds good" enabled onClick={next}/>
      </ObShell>
    );
  }

  // ── Ready → hand straight into the first lesson ──
  if (key === 'ready') {
    return (
      <ObShell hideChrome>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 16px' }}>
          <div style={{ position: 'relative' }}>
            <Pip size={140} mood="proud"/>
            <div style={{ position: 'absolute', top: -6, right: -10, fontSize: 30 }}>🌱</div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: SPROUT.ink, marginTop: 16 }}>
            {forChild ? "Let's plant the first seed!" : "Let's plant your first seed!"}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: SPROUT.mute, marginTop: 8, maxWidth: 280, lineHeight: 1.4 }}>
            {forChild ? 'One short lesson and your garden begins to grow.' : 'One short lesson and your garden begins to grow.'}
          </div>
          <div style={{
            marginTop: 18, background: '#EFF7EA', border: `1px solid ${SPROUT.line}`,
            borderRadius: 16, padding: '12px 18px', boxShadow: '0 3px 0 #CEE2C0',
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.5 }}>Daily pace</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: SPROUT.greenDark, marginTop: 2 }}>A gentle 5 min a day</div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: SPROUT.mute, marginTop: 2 }}>Change it anytime in Settings</div>
          </div>
        </div>
        <ObFooter label="Plant first seed" enabled onClick={onComplete}/>
      </ObShell>
    );
  }

  // ── Question steps: audience · grow ──
  return (
    <ObShell step={qIndex} total={2} onBack={back}>
      {key === 'audience' && (
        <div role="radiogroup" aria-label="Who's growing a garden today?">
          <ObBubble text="First — who's growing a garden today?" mood="happy"/>
          <ObOption icon="🧒" title="My child" sub="I'm setting it up for a young learner" selected={audience === 'child'} onClick={() => setAudience('child')}/>
          <ObOption icon="🌱" title="Me" sub="I'm learning English myself" selected={audience === 'self'} onClick={() => setAudience('self')}/>
        </div>
      )}
      {key === 'grow' && (
        <div role="group" aria-label="What would you like to grow toward? Pick any that fit.">
          <ObBubble text={forChild ? 'What should we help your child grow toward?' : 'What would you like to grow toward?'} mood="thinking"/>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: SPROUT.mute, margin: '-10px 4px 12px' }}>Pick any that fit — I'll tailor the garden. 🌷</div>
          {grows.map((g) => (
            <ObOption key={g.id} icon={g.icon} title={g.label} multi selected={grow.includes(g.id)} onClick={() => toggleGrow(g.id)}/>
          ))}
        </div>
      )}
      <ObFooter label="Continue" enabled={canContinue} onClick={next}/>
    </ObShell>
  );
}

// Shell: cream bg, optional top chrome (progress + back), scrollable body.
function ObShell({ children, step, total, onBack, hideChrome }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: SPROUT.bg, color: SPROUT.ink, fontFamily: '"Nunito", system-ui' }}>
      {!hideChrome && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: `${LAYOUT.safeTop}px ${LAYOUT.padX}px 8px`, flexShrink: 0 }}>
          <button onClick={onBack} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex', transform: 'scaleX(-1)' }}>
            <Icon.ChevR size={24} color={SPROUT.mute}/>
          </button>
          <ObProgress step={step} total={total}/>
        </div>
      )}
      <div style={{ flex: 1, overflow: 'auto', padding: hideChrome ? '62px 20px 0' : '14px 18px 0', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}

function ObFooter({ label, enabled, onClick }) {
  return (
    <div style={{ flexShrink: 0, padding: '14px 18px 30px' }}>
      <button onClick={enabled ? onClick : undefined} disabled={!enabled} style={{
        width: '100%', border: 'none', cursor: enabled ? 'pointer' : 'default', fontFamily: 'inherit',
        background: enabled ? SPROUT.green : SPROUT.cream2,
        color: enabled ? '#fff' : SPROUT.mute,
        fontSize: 17, fontWeight: 900, letterSpacing: 0.4, textTransform: 'uppercase',
        borderRadius: 16, padding: '15px 0',
        boxShadow: enabled ? `0 4px 0 ${SPROUT.greenShadow}` : 'none',
        transition: 'background .15s',
      }}>{label}</button>
    </div>
  );
}

Object.assign(window, { OnboardingFlow });
