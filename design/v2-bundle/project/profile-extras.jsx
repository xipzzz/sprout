// ─────────────────────────────────────────────────────────────
// Profile extras — calm, kid-first growth views (no rank, no social race).
//  • MasteryByArea: per-topic progress bars (answers "is my child learning?")
//  • ParentDashboard: a parent-readable weekly summary + account/plan, gated
//  • ParentHub: ParentGate → ParentDashboard (reuses the gate from family-plan.jsx)
// English-only. Reuses Pip + the Sprout palette.
// ─────────────────────────────────────────────────────────────

// Shared topic mastery — the same data feeds the kid view and the parent summary.
const SPROUT_TOPICS = [
  { id: 'greet',   name: 'Greetings',    pct: 1.0,  state: 'mastered' },
  { id: 'numbers', name: 'Numbers',      pct: 0.55, state: 'growing' },
  { id: 'colors',  name: 'Colors',       pct: 0.40, state: 'growing' },
  { id: 'family',  name: 'Family',       pct: 0.18, state: 'new' },
  { id: 'food',    name: 'Food & drink', pct: 0.0,  state: 'seed' },
];
const MASTERY_LABEL = { mastered: 'Mastered', growing: 'Growing', new: 'Just started', seed: 'Coming up' };
const MASTERY_GLYPH = { mastered: '🌸', growing: '🌱', new: '🌱', seed: '🌰' };

// Per-area mastery — gentle bars + a plant stage, no XP totals or ranking.
function MasteryByArea({ compact = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 8 : 10 }}>
      {SPROUT_TOPICS.map((t) => {
        const done = t.state === 'mastered';
        return (
          <div key={t.id} style={{
            background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14,
            padding: compact ? '10px 12px' : '12px 13px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: done ? '#FBF1DC' : '#EFF7EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>
              {MASTERY_GLYPH[t.state]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 14.5, fontWeight: 900, color: SPROUT.ink }}>{t.name}</span>
                <span style={{ fontSize: 11, fontWeight: 900, color: done ? '#C28A1C' : SPROUT.greenDark }}>{MASTERY_LABEL[t.state]}</span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: SPROUT.cream2, overflow: 'hidden', marginTop: 7 }}>
                <div style={{
                  width: `${Math.max(t.pct * 100, t.state === 'seed' ? 0 : 6)}%`, height: '100%', borderRadius: 999,
                  background: done ? `linear-gradient(90deg, ${SPROUT.sun}, #E9B84A)` : `linear-gradient(90deg, ${SPROUT.green}, #8FD46F)`,
                  transition: 'width .4s',
                }}/>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// A parent-readable dashboard: weekly proof + the things only a grown-up should touch.
function ParentDashboard({ onClose, childName = 'Alex' }) {
  const [planOpen, setPlanOpen] = React.useState(false);
  const week = [true, true, false, true, true, false, false]; // M–S practice
  const daysPracticed = week.filter(Boolean).length;

  const Row = ({ icon, title, sub, onTap, accent }) => (
    <button onClick={onTap} style={{
      width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
      display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px',
      background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14,
      boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: accent || '#EFF7EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 900, color: SPROUT.ink }}>{title}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>{sub}</div>
      </div>
      <Icon.ChevR size={18} color={SPROUT.mute}/>
    </button>
  );

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 62, display: 'flex', alignItems: 'flex-end',
      background: 'rgba(20,30,40,0.5)', fontFamily: '"Nunito", system-ui', animation: 'fpFade 200ms ease both',
    }}>
      <style>{`@keyframes pdFade2{from{opacity:0}to{opacity:1}}@keyframes pdSlide2{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxHeight: '94%', overflowY: 'auto', background: SPROUT.bg, borderRadius: '24px 24px 0 0',
        padding: '20px 18px 28px', animation: 'pdSlide2 320ms cubic-bezier(.2,.8,.2,1) both',
        position: 'relative', boxShadow: '0 -10px 30px rgba(0,0,0,0.15)',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: SPROUT.line, margin: '0 auto 14px' }}/>
        <button onClick={onClose} aria-label="Close" style={{
          position: 'absolute', top: 14, right: 14, border: 'none', background: 'transparent',
          fontSize: 22, color: SPROUT.mute, cursor: 'pointer', width: 32, height: 32, lineHeight: 1,
        }}>×</button>

        <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.greenDark, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 }}>For grown-ups</div>
        <div style={{ fontSize: 23, fontWeight: 900, color: SPROUT.ink, marginBottom: 16 }}>{childName}'s progress</div>

        {/* Weekly proof — the parent's real question, answered plainly. */}
        <div style={{ background: 'linear-gradient(135deg, #EFF7EA 0%, #FBF1DC 100%)', border: `1.5px solid ${SPROUT.green}`, borderRadius: 18, padding: '15px 16px', boxShadow: `0 3px 0 ${SPROUT.greenShadow}`, marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: SPROUT.ink, lineHeight: 1.4 }}>
            This week, {childName} practiced <strong style={{ color: SPROUT.greenDark }}>{daysPracticed} days</strong> and learned <strong style={{ color: SPROUT.greenDark }}>12 new words</strong>. 🌱
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
            {['M','T','W','T','F','S','S'].map((d, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ height: 30, borderRadius: 8, background: week[i] ? SPROUT.green : '#fff', border: `1px solid ${week[i] ? SPROUT.green : SPROUT.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {week[i] && <Icon.Leaf size={14} color="#fff"/>}
                </div>
                <div style={{ fontSize: 9.5, fontWeight: 900, color: SPROUT.mute, marginTop: 3 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mastery by area — proof of actual learning */}
        <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 2px 8px' }}>What {childName} is learning</div>
        <div style={{ marginBottom: 16 }}><MasteryByArea compact/></div>

        {/* Grown-up controls */}
        <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 2px 8px' }}>Account & plan</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <Row icon="🌿" accent="#EFF7EA" title="Sprout Family plan" sub="One calm plan for the whole family" onTap={() => setPlanOpen(true)}/>
          <Row icon="👤" accent="#E7F1FA" title="Account & login" sub="Email, sign-in methods" onTap={() => {}}/>
          <Row icon="🔒" accent="#F4E7DB" title="Privacy & safety" sub="What we collect (very little) & data controls" onTap={() => {}}/>
          <Row icon="🔔" accent="#FBE6E6" title="Reminders" sub="Gentle daily nudge · quiet hours" onTap={() => {}}/>
        </div>

        <div style={{ marginTop: 14, padding: '11px 13px', background: '#EFF7EA', border: '1px solid #D7E9C8', borderRadius: 13, display: 'flex', alignItems: 'center', gap: 9 }}>
          <Icon.Leaf size={16} color={SPROUT.green}/>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: SPROUT.greenDark, lineHeight: 1.35 }}>
            No ads, no data sold, no purchases your child can make. Calm by design.
          </div>
        </div>
      </div>
      {planOpen && typeof FamilyPlan === 'function' && <FamilyPlan onClose={() => setPlanOpen(false)} />}
    </div>
  );
}

// Gate → dashboard. Reuses ParentGate from family-plan.jsx.
function ParentHub({ onClose, childName = 'Alex' }) {
  const [passed, setPassed] = React.useState(false);
  if (!passed) {
    if (typeof ParentGate !== 'function') { return null; }
    return <ParentGate onPass={() => setPassed(true)} onClose={onClose} />;
  }
  return <ParentDashboard onClose={onClose} childName={childName} />;
}

Object.assign(window, { MasteryByArea, ParentDashboard, ParentHub, SPROUT_TOPICS });
