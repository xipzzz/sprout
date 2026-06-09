// ─────────────────────────────────────────────────────────────
// Practice Hub — nested inside the Words tab. Resurfaces mistakes and
// weak words for targeted review: weakest-words list, mistake review,
// listening drills, speaking drills, and a timed Match Madness practice.
// ─────────────────────────────────────────────────────────────

const WEAK_WORDS = [
  { en: 'colors',  strength: 1, missed: 3 },
  { en: 'numbers', strength: 2, missed: 2 },
  { en: 'coffee',  strength: 3, missed: 1 },
];

// Recent mistakes — gathered so errors get a second pass instead of vanishing.
// Framed as "Needs water 🥀": each is a missed answer, replayable as a set.
const MISTAKES = [
  { en: 'colors',  prompt: 'the colors', kind: 'ex-mc' },
  { en: 'station', prompt: 'Where is the station?', kind: 'ex-arrange' },
  { en: 'morning', prompt: 'Good morning', kind: 'ex-hear' },
  { en: 'please',  prompt: 'A coffee, please', kind: 'ex-fill' },
  { en: 'numbers', prompt: 'seven', kind: 'ex-mc' },
];

function PracticeHub({ tweaks, onBack, onStartLesson }) {
  const calm = tweaks && tweaks.calm;
  const [mistakesOpen, setMistakesOpen] = React.useState(false);
  // The one-tap session auto-assembles from weak words + recent mistakes.
  const tendQueue = ['ex-fill', 'ex-mc', 'ex-arrange', 'ex-hear', 'ex-match'];

  const drills = [
    { id: 'mistakes', icon: '↻', tint: '#FCEAEA', color: SPROUT.coral, title: 'Mistake review', desc: 'Replay 4 exercises you missed', queue: ['ex-mc', 'ex-fill', 'ex-arrange', 'ex-hear'] },
    { id: 'listen',   icon: '👂', tint: '#E7F1FA', color: '#5B9CB8', title: 'Listening drills', desc: 'Sharpen your ear', queue: ['ex-hear', 'ex-hear', 'ex-mc'] },
    { id: 'speak',    icon: '🎤', tint: '#EFF7EA', color: SPROUT.greenDark, title: 'Speaking drills', desc: 'Practice saying it out loud', queue: ['ex-speak', 'ex-speak'] },
    { id: 'madness',  icon: '⚡', tint: '#FBF1DC', color: SPROUT.sunShadow, title: 'Match Madness', desc: 'Beat the clock · 2× XP this week', queue: ['ex-match', 'ex-match', 'ex-match'], event: true },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: SPROUT.bg, color: SPROUT.ink, fontFamily: '"Nunito", system-ui' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 14px 12px', flexShrink: 0 }}>
        <button onClick={onBack} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex', transform: 'scaleX(-1)' }}>
          <Icon.ChevR size={24} color={SPROUT.ink}/>
        </button>
        <div style={{ fontSize: 20, fontWeight: 900 }}>Practice</div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 24px' }}>
        {/* HERO — one-tap personalized review: weak words + recent mistakes, auto-assembled */}
        <button onClick={() => onStartLesson({ title: 'Tend your garden', queue: tendQueue })} style={{
          width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          background: 'linear-gradient(135deg, #6FBF5E, #4D9E3F)', borderRadius: 20, padding: '17px 18px',
          boxShadow: '0 4px 0 #3F7F34', marginBottom: 14, color: '#fff', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: -10, bottom: -14, opacity: 0.9 }}><Pip size={78} mood="happy"/></div>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 0.6, textTransform: 'uppercase', opacity: 0.85 }}>Today’s review</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 2 }}>Tend your garden 🌱</div>
          <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.92, marginTop: 4, maxWidth: 220, lineHeight: 1.35 }}>
            A gentle session from your weak words &amp; recent slips.
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 13, background: 'rgba(255,255,255,0.95)', color: SPROUT.greenDark, borderRadius: 11, padding: '9px 16px', fontSize: 14, fontWeight: 900 }}>
            Start{calm ? '' : ' · +10 💧'}
          </div>
        </button>

        {/* Needs water — recent mistakes, counted + replayable as a set */}
        <button onClick={() => setMistakesOpen((o) => !o)} style={{
          width: '100%', textAlign: 'left', border: `1px solid #F0D3CD`, cursor: 'pointer', fontFamily: 'inherit',
          background: '#FBF1EE', borderRadius: 16, padding: '13px 14px', marginBottom: mistakesOpen ? 0 : 18,
          borderBottomLeftRadius: mistakesOpen ? 0 : 16, borderBottomRightRadius: mistakesOpen ? 0 : 16,
          display: 'flex', alignItems: 'center', gap: 13,
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: SPROUT.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>🥀</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15.5, fontWeight: 900 }}>Needs water</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: SPROUT.mute }}>Answers you missed — give them a second pass</div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 900, color: '#C25A4A', background: '#F7DAD3', borderRadius: 999, padding: '3px 10px' }}>{MISTAKES.length}</span>
          <span style={{ transform: mistakesOpen ? 'rotate(90deg)' : 'none', transition: 'transform .2s', display: 'flex' }}><Icon.ChevR size={18} color={SPROUT.mute}/></span>
        </button>
        {mistakesOpen && (
          <div style={{ border: `1px solid #F0D3CD`, borderTop: 'none', borderRadius: '0 0 16px 16px', background: SPROUT.paper, marginBottom: 18, overflow: 'hidden' }}>
            {MISTAKES.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', borderTop: i ? `1px solid ${SPROUT.line}` : 'none' }}>
                <span style={{ fontSize: 15 }}>🥀</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 900 }}>{m.en}</div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: SPROUT.mute, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.prompt}</div>
                </div>
              </div>
            ))}
            <div style={{ padding: 12 }}>
              <button onClick={() => onStartLesson({ title: 'Needs water', queue: MISTAKES.map((m) => m.kind) })} style={{
                width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: SPROUT.green, color: '#fff', fontSize: 14.5, fontWeight: 900, borderRadius: 12, padding: '12px 0', boxShadow: `0 3px 0 ${SPROUT.greenShadow}`,
              }}>Water all {MISTAKES.length} 🌱</button>
            </div>
          </div>
        )}

        {/* Weakest words */}
        <SectionTitle>Weakest words</SectionTitle>
        <div style={{ background: SPROUT.paper, borderRadius: 16, border: `1px solid ${SPROUT.line}`, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, overflow: 'hidden', marginBottom: 12 }}>
          {WEAK_WORDS.map((w, i) => (
            <div key={w.en} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              borderTop: i === 0 ? 'none' : `1px solid ${SPROUT.line}`,
            }}>
              <div style={{ flex: 1, fontSize: 16, fontWeight: 800 }}>{w.en}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: SPROUT.coral }}>missed {w.missed}×</div>
              <div style={{ display: 'flex', gap: 3 }}>
                {[1,2,3,4,5].map((n) => (
                  <div key={n} style={{ width: 7, height: 16, borderRadius: 2, background: n <= w.strength ? (w.strength <= 2 ? SPROUT.coral : SPROUT.green) : SPROUT.cream2 }}/>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => onStartLesson({ title: 'Weak words', queue: ['ex-fill', 'ex-mc', 'ex-arrange'] })} style={{
          width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          background: SPROUT.coral, color: '#fff', fontSize: 15, fontWeight: 900,
          borderRadius: 14, padding: '13px 0', marginBottom: 24, boxShadow: '0 3px 0 #C85C5C',
        }}>Strengthen these 3 words</button>

        {/* Drills */}
        <SectionTitle>Targeted practice</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {drills.map((d) => (
            <button key={d.id} onClick={() => onStartLesson({ title: d.title, queue: d.queue })} style={{
              width: '100%', textAlign: 'left', border: `1px solid ${d.event ? '#EBD9AE' : SPROUT.line}`, cursor: 'pointer', fontFamily: 'inherit',
              background: d.event ? '#FDF6E6' : '#fff', borderRadius: 16, padding: '13px 14px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
              display: 'flex', alignItems: 'center', gap: 13,
            }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: d.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>{d.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 15, fontWeight: 900 }}>{d.title}</span>
                  {d.event && <span style={{ fontSize: 9, fontWeight: 900, color: SPROUT.sunShadow, background: '#F7E6BE', padding: '2px 6px', borderRadius: 6, letterSpacing: 0.5 }}>EVENT</span>}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>{d.desc}</div>
              </div>
              <Icon.ChevR size={20} color={SPROUT.mute}/>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PracticeHub });
