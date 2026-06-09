// ─────────────────────────────────────────────────────────────
// Launch splash — a signature "sprouting" cold-start moment.
// A seed drops, a stem unfurls, leaves spring out and Pip pops up beside
// the Sprout wordmark + tagline on the cream (or moonlit) bg. Fast (~1.6s),
// then fades into a warm personalized greeting before handing off to the app.
// English-only. Reuses Pip + the Sprout palette.
// ─────────────────────────────────────────────────────────────

// The animated sprouting mark — seed → stem → leaves, drawn in SVG.
function SproutingMark({ size = 132, dark = false }) {
  const stem = dark ? '#7FD86A' : SPROUT.greenDark;
  const leaf = dark ? '#A6E89A' : SPROUT.green;
  const seed = dark ? '#3A4940' : '#C9A86B';
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: 'block', overflow: 'visible' }}>
      <style>{`
        @keyframes spSeed { 0% { transform: translateY(-46px) scale(.6); opacity: 0; } 55% { opacity: 1; } 70% { transform: translateY(2px) scale(1.1); } 100% { transform: translateY(0) scale(1); opacity: 1; } }
        @keyframes spStem { to { stroke-dashoffset: 0; } }
        @keyframes spLeaf { 0% { transform: scale(0) rotate(var(--r0)); opacity: 0; } 100% { transform: scale(1) rotate(0); opacity: 1; } }
        @keyframes spSoil { 0% { transform: scaleX(0); opacity: 0; } 100% { transform: scaleX(1); opacity: 1; } }
        .sp-seed { animation: spSeed .5s cubic-bezier(.2,1.4,.4,1) both; transform-origin: 60px 30px; }
        .sp-soil { animation: spSoil .4s ease .15s both; transform-origin: 60px 100px; }
        .sp-stem { stroke-dasharray: 80; stroke-dashoffset: 80; animation: spStem .6s ease .5s both; }
        .sp-leafL { animation: spLeaf .45s cubic-bezier(.2,1.5,.4,1) .85s both; transform-origin: 60px 64px; --r0: -40deg; }
        .sp-leafR { animation: spLeaf .45s cubic-bezier(.2,1.5,.4,1) 1.0s both; transform-origin: 60px 56px; --r0: 40deg; }
      `}</style>
      {/* soil mound */}
      <ellipse className="sp-soil" cx="60" cy="100" rx="34" ry="9" fill={dark ? '#2B3830' : '#E3D6BC'}/>
      {/* seed that drops in first, becomes the base */}
      <circle className="sp-seed" cx="60" cy="92" r="7" fill={seed}/>
      {/* stem unfurling up */}
      <path className="sp-stem" d="M60 95 Q60 75 60 52" stroke={stem} strokeWidth="5" fill="none" strokeLinecap="round"/>
      {/* two leaves springing out */}
      <path className="sp-leafL" d="M60 66 Q40 64 30 74 Q46 78 60 68 Z" fill={leaf}/>
      <path className="sp-leafR" d="M60 56 Q82 52 92 62 Q74 68 60 60 Z" fill={dark ? '#7CD168' : '#7CD168'}/>
    </svg>
  );
}

// hour → time-of-day word for the returning greeting
function greetWord(h) {
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  if (h < 21) return 'Evening';
  return 'Night';
}

// Full splash → greeting → onehandoff. `returning` controls the handoff copy.
// onDone fires after the sequence; the host decides where to route.
function LaunchSplash({ dark = false, returning = true, name = 'Alex', streak = 13, onDone }) {
  const [phase, setPhase] = React.useState('grow'); // 'grow' → 'greet' → done
  React.useEffect(() => {
    const t1 = setTimeout(() => setPhase('greet'), 1650);
    const t2 = setTimeout(() => { setPhase('done'); if (onDone) onDone(); }, 3050);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const bg = dark
    ? 'linear-gradient(180deg, #161E1A 0%, #1C2620 55%, #202B24 100%)'
    : `linear-gradient(180deg, #FFF6E4 0%, ${SPROUT.bg} 55%, #F4ECD8 100%)`;
  const ink = dark ? '#EAF1E8' : SPROUT.ink;
  const mute = dark ? '#9DB0A2' : SPROUT.mute;

  const hour = new Date().getHours();
  const greeting = returning
    ? `${greetWord(hour)}, ${name}`
    : `Welcome, friend`;
  const sub = returning
    ? (hour >= 17 ? `Your garden missed you 🌱` : `Let’s grow a little today 🌱`)
    : `Let’s grow your first plant 🌱`;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 90, background: bg,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Nunito", system-ui', color: ink, overflow: 'hidden',
      transition: 'opacity .4s', opacity: phase === 'done' ? 0 : 1,
    }}>
      {phase === 'grow' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <SproutingMark size={140} dark={dark}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 10, opacity: 0, animation: 'spWord .5s ease 1.15s both' }}>
            <span style={{ fontSize: 40, fontWeight: 900, letterSpacing: -1.2, color: dark ? '#EAF1E8' : SPROUT.ink }}>Sprout</span>
          </div>
          <div style={{ fontSize: 14.5, fontWeight: 800, color: mute, marginTop: 4, opacity: 0, animation: 'spWord .5s ease 1.35s both' }}>Grow a little every day 🌱</div>
          <style>{`@keyframes spWord { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
      )}

      {phase === 'greet' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 32px', animation: 'spWord .45s ease both' }}>
          <div style={{ animation: 'spPipUp .5s cubic-bezier(.2,1.4,.4,1) both' }}>
            <Pip size={104} mood="wave" wave={true}/>
          </div>
          {/* Sprout wordmark — the screen's identity (Pip already carries the leaf motif) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
            <span style={{ fontSize: 38, fontWeight: 900, letterSpacing: -1.2, color: dark ? '#EAF1E8' : SPROUT.ink }}>Sprout</span>
          </div>
          <div style={{ fontSize: 15.5, fontWeight: 700, color: mute, marginTop: 8 }}>{sub}</div>
          <style>{`@keyframes spPipUp { from { opacity: 0; transform: translateY(18px) scale(.85); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { LaunchSplash, SproutingMark });
