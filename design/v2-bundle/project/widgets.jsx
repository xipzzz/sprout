// ─────────────────────────────────────────────────────────────
// iOS widgets — home-screen & lock-screen glances. The garden is uniquely
// suited to a widget: a living plant + Pip, calm anti-guilt copy, one tap to
// practice. Shown on a faux iOS home/lock backdrop so the gallery can review them.
// English-only. Reuses Pip + BloomFlower.
// ─────────────────────────────────────────────────────────────

// week dots — which days practiced this week
function WeekDots({ done = [1, 1, 1, 1, 0, 0, 0], size = 9, gap = 5, calm = true }) {
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <div style={{ display: 'flex', gap }}>
      {done.map((d, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div style={{ width: size, height: size, borderRadius: '50%', background: d ? SPROUT.green : 'rgba(120,130,110,0.22)' }}/>
          <span style={{ fontSize: 7.5, fontWeight: 800, color: 'rgba(70,80,60,0.5)' }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

// SMALL home-screen garden widget — living plant + leaf count.
function GardenWidgetSmall({ calm = true }) {
  return (
    <div style={{
      width: 150, height: 150, borderRadius: 22, padding: 13, boxSizing: 'border-box',
      background: 'linear-gradient(165deg, #EAF4FB 0%, #EAF6E2 60%, #E2F0D6 100%)',
      boxShadow: '0 10px 24px rgba(40,60,40,0.18)', position: 'relative', overflow: 'hidden',
      fontFamily: '"Nunito", system-ui', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon.Leaf size={14} color={SPROUT.greenDark}/>
          <span style={{ fontSize: 15, fontWeight: 900, color: SPROUT.greenDark }}>34</span>
        </div>
        <div style={{ width: 20, height: 20, borderRadius: 6, background: SPROUT.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.Leaf size={11} color="#fff"/>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <MilestonePlant tier="bush" size={70}/>
        <div style={{ position: 'absolute', right: 2, bottom: -2 }}><Pip size={34} mood="happy"/></div>
      </div>
      <div style={{ fontSize: 10.5, fontWeight: 800, color: '#5C7152', textAlign: 'center' }}>Ready when you are 🌱</div>
    </div>
  );
}

// MEDIUM home-screen garden widget — garden + week dots + tap-to-practice.
function GardenWidgetMedium({ calm = true }) {
  return (
    <div style={{
      width: 320, height: 150, borderRadius: 22, padding: 15, boxSizing: 'border-box',
      background: 'linear-gradient(150deg, #EAF4FB 0%, #EAF6E2 55%, #E0EFD2 100%)',
      boxShadow: '0 10px 24px rgba(40,60,40,0.18)', position: 'relative', overflow: 'hidden',
      fontFamily: '"Nunito", system-ui', display: 'flex', gap: 14,
    }}>
      {/* left: living garden scene */}
      <div style={{ width: 110, borderRadius: 16, background: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
        <MilestonePlant tier="tree" size={92}/>
        <div style={{ position: 'absolute', left: 4, bottom: 2 }}><Pip size={36} mood="happy"/></div>
      </div>
      {/* right: stats + cta */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icon.Leaf size={16} color={SPROUT.greenDark}/>
            <span style={{ fontSize: 19, fontWeight: 900, color: SPROUT.greenDark }}>34</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#5C7152' }}>growing</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#5C7152', marginTop: 2 }}>Your garden's coming along nicely</div>
        </div>
        <WeekDots done={[1, 1, 1, 1, 0, 0, 0]}/>
        <div style={{
          background: SPROUT.green, color: '#fff', borderRadius: 11, padding: '8px 0', textAlign: 'center',
          fontSize: 12.5, fontWeight: 900, boxShadow: '0 2px 0 ' + SPROUT.greenShadow,
        }}>Tap to practice</div>
      </div>
    </div>
  );
}

// iOS LOCK-SCREEN widgets — a circular plant glance + an inline next-lesson glance.
function LockWidgets() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: '"Nunito", system-ui' }}>
      {/* circular gauge: leaf ring + plant */}
      <div style={{ position: 'relative', width: 58, height: 58 }}>
        <svg width="58" height="58" viewBox="0 0 58 58" style={{ position: 'absolute', inset: 0 }}>
          <circle cx="29" cy="29" r="25" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="5"/>
          <circle cx="29" cy="29" r="25" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 25 * 0.7} ${2 * Math.PI * 25}`} transform="rotate(-90 29 29)"/>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 22 }}>🌱</span>
        </div>
      </div>
      {/* inline glance */}
      <div style={{ color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 16 }}>🍃</span>
          <span style={{ fontSize: 17, fontWeight: 900 }}>34 day garden</span>
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 700, opacity: 0.85 }}>Next lesson: Around town · 4 min</div>
      </div>
    </div>
  );
}

// A faux iOS home/lock backdrop so the widgets read in context.
function WidgetShowcase({ calm = true }) {
  const [mode, setMode] = React.useState('home'); // 'home' | 'lock'
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: '"Nunito", system-ui', overflow: 'hidden',
      background: mode === 'lock'
        ? 'linear-gradient(180deg, #2E4B63 0%, #3E6B5A 60%, #4E7B4A 100%)'
        : 'linear-gradient(180deg, #BFE0F2 0%, #CFE9DC 50%, #DCEFC9 100%)' }}>

      {/* toggle */}
      <div style={{ position: 'absolute', top: 56, left: '50%', transform: 'translateX(-50%)', zIndex: 5, display: 'flex', gap: 4, background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(8px)', borderRadius: 999, padding: 3 }}>
        {['home', 'lock'].map((m) => (
          <button key={m} onClick={() => setMode(m)} style={{
            border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 999, padding: '6px 16px',
            fontSize: 12.5, fontWeight: 900, textTransform: 'capitalize',
            background: mode === m ? '#fff' : 'transparent', color: mode === m ? SPROUT.ink : '#4A5A52',
          }}>{m} screen</button>
        ))}
      </div>

      {mode === 'home' ? (
        <div style={{ position: 'absolute', inset: 0, paddingTop: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GardenWidgetSmall calm={calm}/>
          </div>
          <GardenWidgetMedium calm={calm}/>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: '#5C7152', background: 'rgba(255,255,255,0.5)', padding: '5px 12px', borderRadius: 999 }}>
            Small + Medium · tap deep-links into today's lesson
          </div>
        </div>
      ) : (
        <div style={{ position: 'absolute', inset: 0, paddingTop: 120, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ color: '#fff', textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 17, fontWeight: 700, opacity: 0.9 }}>Friday, May 30</div>
            <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1, letterSpacing: -1 }}>9:41</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(10px)', borderRadius: 18, padding: '14px 18px' }}>
            <LockWidgets/>
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginTop: 18 }}>
            A calm glance — no guilt, no red alarms
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { WidgetShowcase, GardenWidgetSmall, GardenWidgetMedium, LockWidgets });
