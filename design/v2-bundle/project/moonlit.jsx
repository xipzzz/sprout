// ─────────────────────────────────────────────────────────────
// Moonlit Garden — Sprout's deliberate DARK theme (not an invert).
// A soft forest-charcoal night, Pip under a moon + stars, plants with a glow,
// and a hand-tuned accent palette kept legible on dark (correct-green vs
// wrong-red stay clearly distinct). Plus the Light / Dark / System + auto-evening
// Appearance control. Presented as a designed showcase so the night skin can be
// reviewed without a risky global token swap across every screen.
// English-only. Reuses Pip + MilestonePlant + BloomFlower.
// ─────────────────────────────────────────────────────────────

// Hand-tuned night palette — charcoal surfaces, brightened/desaturated accents.
const MOON = {
  bg: '#1C2620',         // deep forest-charcoal (not pure black)
  bg2: '#243029',        // raised surface
  card: '#2B3830',       // card
  line: '#3A4940',       // hairline
  ink: '#EAF1E8',        // primary text
  mute: '#9DB0A2',       // secondary text
  green: '#7FD86A',      // brightened for contrast on charcoal
  greenDeep: '#A6E89A',  // text-green on dark
  water: '#6FC8E8',      // brightened aqua
  gem: '#7FD0EC',
  sun: '#F6CE5A',
  correct: '#86E06F',    // clearly distinct from…
  wrong: '#FF8A8A',      // …a softened-but-distinct red (accessible on dark)
  moon: '#F4EFD2',
};

// Pip under a moon + stars, with a softly-glowing plant. The night-skin hero.
function MoonlitScene({ size = 200 }) {
  return (
    <div style={{ position: 'relative', width: size, height: size * 0.86 }}>
      {/* moon */}
      <div style={{ position: 'absolute', top: 6, right: 18, width: 46, height: 46, borderRadius: '50%', background: 'radial-gradient(circle at 38% 38%, #FBF8E6, #EBE2B4)', boxShadow: `0 0 26px ${MOON.moon}88` }}/>
      {/* stars */}
      {[[20, 18, 3], [60, 10, 2], [120, 30, 2.5], [40, 50, 2], [150, 64, 3], [90, 22, 1.8]].map(([x, y, r], i) => (
        <div key={i} style={{ position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: '50%', background: '#FBF8E6', opacity: 0.85, boxShadow: '0 0 6px #FBF8E6' }}/>
      ))}
      {/* glowing plant */}
      <div style={{ position: 'absolute', left: '50%', bottom: 0, transform: 'translateX(-50%)', filter: `drop-shadow(0 0 18px ${MOON.green}66)` }}>
        <MilestonePlant tier="bush" size={size * 0.6}/>
      </div>
      {/* Pip */}
      <div style={{ position: 'absolute', left: 6, bottom: 2 }}>
        <Pip size={size * 0.34} mood="happy"/>
      </div>
    </div>
  );
}

// Light / Dark / System segmented control + an auto-evening toggle.
function AppearanceControl({ value = 'system', onChange, autoEvening = true, onAutoEvening, dark = false }) {
  const opts = [
    { id: 'light', label: 'Light', icon: '☀️' },
    { id: 'dark', label: 'Dark', icon: '🌙' },
    { id: 'system', label: 'System', icon: '⚙️' },
  ];
  const ink = dark ? MOON.ink : SPROUT.ink;
  const mute = dark ? MOON.mute : SPROUT.mute;
  const trackBg = dark ? MOON.bg2 : SPROUT.cream2;
  const cardBg = dark ? MOON.card : '#fff';
  const line = dark ? MOON.line : SPROUT.line;
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', gap: 4, background: trackBg, borderRadius: 14, padding: 4 }}>
        {opts.map((o) => {
          const on = value === o.id;
          return (
            <button key={o.id} onClick={() => onChange && onChange(o.id)} style={{
              flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 11, padding: '10px 0', minHeight: 44,
              background: on ? cardBg : 'transparent', color: on ? ink : mute,
              fontSize: 13, fontWeight: 900, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              boxShadow: on ? '0 1px 4px rgba(0,0,0,0.18)' : 'none',
            }}>
              <span style={{ fontSize: 16 }}>{o.icon}</span>{o.label}
            </button>
          );
        })}
      </div>
      {/* auto-evening shift */}
      <button onClick={() => onAutoEvening && onAutoEvening(!autoEvening)} style={{
        marginTop: 10, width: '100%', display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        background: cardBg, border: `1px solid ${line}`, borderRadius: 14, padding: '12px 13px',
      }}>
        <span style={{ fontSize: 20 }}>🌗</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 900, color: ink }}>Dim to moonlight in the evening</div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: mute }}>Softens to the night theme around your reminder time</div>
        </div>
        {/* toggle pill */}
        <div style={{ width: 42, height: 25, borderRadius: 999, background: autoEvening ? MOON.green : line, position: 'relative', flexShrink: 0, transition: 'background .2s' }}>
          <div style={{ position: 'absolute', top: 2.5, left: autoEvening ? 19 : 2.5, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}/>
        </div>
      </button>
    </div>
  );
}

// The showcase screen — the night skin rendered in context + the controls.
function MoonlitShowcase() {
  const [mode, setMode] = React.useState('dark');
  const [evening, setEvening] = React.useState(true);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'auto', fontFamily: '"Nunito", system-ui',
      background: `linear-gradient(180deg, #161E1A 0%, ${MOON.bg} 40%, #202B24 100%)`, color: MOON.ink }}>
      <div style={{ padding: '64px 18px 28px' }}>
        <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', color: MOON.green, marginBottom: 2 }}>Appearance</div>
        <div style={{ fontSize: 23, fontWeight: 900, marginBottom: 4 }}>Moonlit Garden</div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: MOON.mute, lineHeight: 1.4, marginBottom: 20 }}>
          A deliberate night skin — soft charcoal, not harsh black. Your garden, after dark. 🌙
        </div>

        {/* hero night scene */}
        <div style={{ background: MOON.bg2, border: `1px solid ${MOON.line}`, borderRadius: 22, padding: 18, marginBottom: 18, display: 'flex', justifyContent: 'center' }}>
          <MoonlitScene size={210}/>
        </div>

        {/* a HUD chip row, themed for night */}
        <div style={{ display: 'flex', justifyContent: 'space-between', background: MOON.card, border: `1px solid ${MOON.line}`, borderRadius: 16, padding: '12px 16px', marginBottom: 18 }}>
          {[['🍃', '34', MOON.greenDeep], ['💎', '420', MOON.gem], ['💧', '5', MOON.water]].map(([ic, v, c], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 17 }}>{ic}</span>
              <span style={{ fontSize: 16, fontWeight: 900, color: c }}>{v}</span>
            </div>
          ))}
        </div>

        {/* accent legibility — correct vs wrong must stay clearly distinct on dark */}
        <div style={{ fontSize: 11, fontWeight: 900, color: MOON.mute, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 9 }}>Tuned for contrast</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
          <div style={{ flex: 1, background: 'rgba(134,224,111,0.13)', border: `1.5px solid ${MOON.correct}`, borderRadius: 14, padding: '12px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', background: MOON.correct, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#163' }}>✓</span>
            <span style={{ fontSize: 13.5, fontWeight: 900, color: MOON.correct }}>Correct</span>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,138,138,0.12)', border: `1.5px solid ${MOON.wrong}`, borderRadius: 14, padding: '12px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', background: MOON.wrong, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#611' }}>✕</span>
            <span style={{ fontSize: 13.5, fontWeight: 900, color: MOON.wrong }}>Not quite</span>
          </div>
        </div>

        {/* the Appearance control itself */}
        <AppearanceControl value={mode} onChange={setMode} autoEvening={evening} onAutoEvening={setEvening} dark={true}/>
      </div>
    </div>
  );
}

Object.assign(window, { MOON, MoonlitScene, MoonlitShowcase, AppearanceControl });
