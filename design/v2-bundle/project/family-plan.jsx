// ─────────────────────────────────────────────────────────────
// Grown-ups area — the ONLY place real money lives, behind a parent gate.
// Kids' shop spends earned gems only; this is gated by a simple arithmetic
// check (kid-app standard) and offers ONE honest, calm subscription:
// "Sprout Family". No FOMO, no countdowns, no upsell labels. English-only.
// ─────────────────────────────────────────────────────────────

// Simple parent gate — a small multiplication a young child can't easily do.
function ParentGate({ onPass, onClose }) {
  // Stable per-mount challenge.
  const challenge = React.useMemo(() => {
    const a = 6 + Math.floor(Math.random() * 6); // 6..11
    const b = 3 + Math.floor(Math.random() * 6); // 3..8
    return { a, b, answer: a * b };
  }, []);
  const [val, setVal] = React.useState('');
  const [wrong, setWrong] = React.useState(false);

  const submit = () => {
    if (parseInt(val, 10) === challenge.answer) { onPass(); }
    else { setWrong(true); setVal(''); }
  };

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(20,30,40,0.55)', fontFamily: '"Nunito", system-ui', animation: 'fpFade 200ms ease both', padding: 22,
    }}>
      <style>{`@keyframes fpFade{from{opacity:0}to{opacity:1}}@keyframes fpPop{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}@keyframes fpShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}`}</style>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: 320, background: SPROUT.bg, borderRadius: 22, padding: '22px 20px 20px',
        boxShadow: '0 12px 36px rgba(0,0,0,0.22)', animation: 'fpPop 260ms cubic-bezier(.2,.8,.2,1) both', textAlign: 'center',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Pip size={66} mood="thinking"/></div>
        <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.greenDark, textTransform: 'uppercase', letterSpacing: 0.8 }}>Grown-ups only</div>
        <div style={{ fontSize: 19, fontWeight: 900, color: SPROUT.ink, marginTop: 4, lineHeight: 1.2 }}>Ask a grown-up to continue</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: SPROUT.mute, marginTop: 6, lineHeight: 1.4 }}>
          This area has account and payment settings. Solve to confirm you're a grown-up.
        </div>

        <div style={{
          marginTop: 16, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 16,
          padding: '16px 14px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
          animation: wrong ? 'fpShake 320ms ease both' : 'none',
        }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: SPROUT.ink, letterSpacing: 0.5 }}>{challenge.a} × {challenge.b} = ?</div>
          <input
            value={val}
            onChange={(e) => { setVal(e.target.value.replace(/[^0-9]/g, '')); setWrong(false); }}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
            inputMode="numeric"
            placeholder="Type the answer"
            autoFocus
            style={{
              width: '100%', marginTop: 12, textAlign: 'center', boxSizing: 'border-box',
              border: `2px solid ${wrong ? SPROUT.coral : SPROUT.line}`, borderRadius: 12,
              padding: '11px 12px', fontFamily: 'inherit', fontSize: 18, fontWeight: 900, color: SPROUT.ink,
              outline: 'none', background: SPROUT.bg,
            }}
          />
          {wrong && <div style={{ fontSize: 12, fontWeight: 800, color: SPROUT.coral, marginTop: 8 }}>Not quite — ask a grown-up to help. 🌱</div>}
        </div>

        <button onClick={submit} disabled={!val} style={{
          width: '100%', marginTop: 14, border: 'none', cursor: val ? 'pointer' : 'default', fontFamily: 'inherit',
          background: val ? SPROUT.green : SPROUT.cream2, color: val ? '#fff' : SPROUT.mute,
          fontSize: 16, fontWeight: 900, borderRadius: 14, padding: '13px 0',
          boxShadow: val ? `0 3px 0 ${SPROUT.greenShadow}` : 'none',
        }}>Continue</button>
        <button onClick={onClose} style={{
          width: '100%', marginTop: 8, border: 'none', background: 'transparent', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 13.5, fontWeight: 800, color: SPROUT.mute, padding: '6px 0',
        }}>Back to garden</button>
      </div>
    </div>
  );
}

// The one honest subscription, shown only after the gate. Calm, no pressure.
function FamilyPlan({ onClose }) {
  const [cycle, setCycle] = React.useState('year'); // 'month' | 'year' — honest choice, no "POPULAR"
  const price = cycle === 'year' ? { amount: '$59.99', per: '/year', note: 'Works out to $5/mo' }
                                 : { amount: '$7.99', per: '/month', note: 'Billed monthly' };
  const includes = [
    { icon: '📚', title: 'Unlimited gentle lessons', sub: 'Learn as much as you like — never gated by water.' },
    { icon: '👨‍👩‍👧‍👦', title: 'Up to 4 children', sub: 'Each child gets their own garden and progress.' },
    { icon: '📶', title: 'Offline learning', sub: 'Download lessons for car rides and flights.' },
    { icon: '🌿', title: 'No ads, no nags', sub: 'A calm, distraction-free space — always.' },
  ];

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 62, display: 'flex', alignItems: 'flex-end',
      background: 'rgba(20,30,40,0.5)', fontFamily: '"Nunito", system-ui', animation: 'fpFade 200ms ease both',
    }}>
      <style>{`@keyframes fpSlide{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxHeight: '94%', overflowY: 'auto', background: SPROUT.bg, borderRadius: '24px 24px 0 0',
        padding: '20px 18px 28px', animation: 'fpSlide 320ms cubic-bezier(.2,.8,.2,1) both',
        position: 'relative', boxShadow: '0 -10px 30px rgba(0,0,0,0.15)',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: SPROUT.line, margin: '0 auto 14px' }}/>
        <button onClick={onClose} aria-label="Close" style={{
          position: 'absolute', top: 14, right: 14, border: 'none', background: 'transparent',
          fontSize: 22, color: SPROUT.mute, cursor: 'pointer', width: 32, height: 32, lineHeight: 1,
        }}>×</button>

        {/* hero */}
        <div style={{ textAlign: 'center', padding: '4px 8px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}><Pip size={86} mood="proud"/></div>
          <div style={{ fontSize: 24, fontWeight: 900, color: SPROUT.ink, marginTop: 8 }}>Sprout Family</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: SPROUT.mute, marginTop: 6, lineHeight: 1.4, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>
            One calm plan for the whole family. No in-app purchases aimed at your child — ever.
          </div>
        </div>

        {/* what's included */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 18 }}>
          {includes.map((f) => (
            <div key={f.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14, boxShadow: `0 2px 0 ${SPROUT.cardShadow}` }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: '#EFF7EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{f.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.2 }}>{f.title}</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: SPROUT.mute, marginTop: 1, lineHeight: 1.35 }}>{f.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* billing choice — honest monthly/annual, no pressure labels */}
        <div style={{ display: 'flex', gap: 9, marginTop: 16 }}>
          {[{ id: 'month', label: 'Monthly', amt: '$7.99/mo' }, { id: 'year', label: 'Yearly', amt: '$59.99/yr' }].map((opt) => {
            const on = cycle === opt.id;
            return (
              <button key={opt.id} onClick={() => setCycle(opt.id)} style={{
                flex: 1, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                background: on ? '#EFF7EA' : SPROUT.paper,
                border: `2px solid ${on ? SPROUT.green : SPROUT.line}`, borderRadius: 14, padding: '12px 13px',
                boxShadow: on ? `0 2px 0 ${SPROUT.greenShadow}` : `0 2px 0 ${SPROUT.cardShadow}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, fontWeight: 900, color: SPROUT.ink }}>{opt.label}</span>
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${on ? SPROUT.green : SPROUT.cream2}`, background: on ? SPROUT.green : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{on && <Icon.Check size={12} color="#fff"/>}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: SPROUT.mute, marginTop: 3 }}>{opt.amt}</div>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <button style={{
          width: '100%', marginTop: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          background: SPROUT.green, color: '#fff', fontSize: 17, fontWeight: 900, letterSpacing: 0.3,
          borderRadius: 16, padding: '15px 0', boxShadow: `0 4px 0 ${SPROUT.greenShadow}`,
        }}>Start 14-day free trial</button>
        <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute, textAlign: 'center', marginTop: 8 }}>
          Then {price.amount}{price.per} · {price.note}. Cancel anytime.
        </div>
        <button style={{
          width: '100%', marginTop: 6, border: 'none', background: 'transparent', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 13, fontWeight: 800, color: SPROUT.mute, padding: '6px 0',
        }}>Restore purchase</button>

        <div style={{ marginTop: 12, padding: '11px 13px', background: '#EFF7EA', border: '1px solid #D7E9C8', borderRadius: 13, display: 'flex', alignItems: 'center', gap: 9 }}>
          <Icon.Leaf size={16} color={SPROUT.green}/>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: SPROUT.greenDark, lineHeight: 1.35 }}>
            Your child's shop only ever spends gems they earn by learning — never real money.
          </div>
        </div>
      </div>
    </div>
  );
}

// The grown-ups area: gate first, plan second. One self-contained overlay.
function GrownUpsArea({ onClose }) {
  const [passed, setPassed] = React.useState(false);
  if (!passed) return <ParentGate onPass={() => setPassed(true)} onClose={onClose} />;
  return <FamilyPlan onClose={onClose} />;
}

Object.assign(window, { GrownUpsArea, ParentGate, FamilyPlan });
