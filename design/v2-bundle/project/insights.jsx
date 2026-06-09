// ─────────────────────────────────────────────────────────────
// Insights — "Your garden over time". A calm, reflective progress view
// (not a pressure-y analytics dashboard). Reachable from the Me tab.
//  • Week / Month / All-time toggle + hero highlights
//  • Garden-growth area chart (the metaphor, not a corporate bar chart)
//  • A "Year in Bloom" seasonal recap — a shareable keepsake
// English-only. Reuses BloomFlower + Pip + the Sprout palette.
// ─────────────────────────────────────────────────────────────

// Per-period data: highlights + a growth series (plants in the garden over time).
const INSIGHT_PERIODS = {
  week: {
    label: 'Week',
    highlights: [
      { k: 'Words learned', v: '38', icon: '🌱', tint: '#E3F5DB', ink: '#4D9E3F' },
      { k: 'Minutes', v: '54', icon: '⏱️', tint: '#E7F1FA', ink: '#2E8FB0' },
      { k: 'Bloom rate', v: '91%', icon: '🌸', tint: '#FBE9EC', ink: '#C25A6B' },
      { k: 'Day streak', v: '13', icon: '🍃', tint: '#FBF1D6', ink: '#9A7A1E' },
    ],
    axis: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    series: [3, 5, 6, 9, 12, 16, 20],     // cumulative plants this week
    unit: 'plants',
    caption: 'You grew 17 plants this week — your fastest yet. 🌿',
  },
  month: {
    label: 'Month',
    highlights: [
      { k: 'Words learned', v: '164', icon: '🌱', tint: '#E3F5DB', ink: '#4D9E3F' },
      { k: 'Hours', v: '6.2', icon: '⏱️', tint: '#E7F1FA', ink: '#2E8FB0' },
      { k: 'Bloom rate', v: '88%', icon: '🌸', tint: '#FBE9EC', ink: '#C25A6B' },
      { k: 'Best streak', v: '23', icon: '🍃', tint: '#FBF1D6', ink: '#9A7A1E' },
    ],
    axis: ['W1', 'W2', 'W3', 'W4'],
    series: [20, 41, 58, 84],
    unit: 'plants',
    caption: 'Your garden nearly doubled this month — lovely, steady tending. 🌳',
  },
  all: {
    label: 'All time',
    highlights: [
      { k: 'Words learned', v: '512', icon: '🌱', tint: '#E3F5DB', ink: '#4D9E3F' },
      { k: 'Hours', v: '28', icon: '⏱️', tint: '#E7F1FA', ink: '#2E8FB0' },
      { k: 'Plants grown', v: '84', icon: '🌸', tint: '#FBE9EC', ink: '#C25A6B' },
      { k: 'Longest bloom', v: '60', icon: '🍃', tint: '#FBF1D6', ink: '#9A7A1E' },
    ],
    axis: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    series: [8, 22, 41, 63, 84],
    unit: 'plants',
    caption: 'From one seed to a whole garden. Look how far you’ve grown. 🌷',
  },
};

// Garden-growth area chart — a gentle filling area in the garden palette.
function GrowthChart({ data }) {
  const { axis, series } = data;
  const [sel, setSel] = React.useState(series.length - 1);
  const W = 300, H = 130, padX = 16, padTop = 14, padBot = 24;
  const max = Math.max(...series);
  const stepX = (W - padX * 2) / (series.length - 1);
  const pt = (i) => ({ x: padX + i * stepX, y: padTop + (1 - series[i] / max) * (H - padTop - padBot) });
  const line = series.map((_, i) => { const p = pt(i); return `${p.x},${p.y}`; }).join(' ');

  return (
    <div style={{ background: SPROUT.paper, borderRadius: 18, border: `1px solid ${SPROUT.line}`, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, padding: '14px 14px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: SPROUT.ink }}>
          {axis[sel]}: <span style={{ color: SPROUT.greenDark }}>{series[sel]} {data.unit}</span>
        </div>
        <div style={{ fontSize: 11, fontWeight: 800, color: SPROUT.mute }}>Garden growth</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SPROUT.green} stopOpacity="0.34"/>
            <stop offset="100%" stopColor={SPROUT.green} stopOpacity="0.03"/>
          </linearGradient>
        </defs>
        <polygon points={`${padX},${H - padBot} ${line} ${W - padX},${H - padBot}`} fill="url(#growthFill)"/>
        <polyline points={line} fill="none" stroke={SPROUT.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        {series.map((val, i) => {
          const p = pt(i);
          const isSel = i === sel;
          const isLast = i === series.length - 1;
          return (
            <g key={i} onClick={() => setSel(i)} style={{ cursor: 'pointer' }}>
              <rect x={p.x - stepX / 2} y={0} width={stepX} height={H} fill="transparent"/>
              {isSel && <line x1={p.x} y1={padTop - 4} x2={p.x} y2={H - padBot} stroke={SPROUT.cream2} strokeWidth="2"/>}
              <circle cx={p.x} cy={p.y} r={isSel ? 6 : 4.5} fill={isLast ? SPROUT.green : '#fff'} stroke={SPROUT.green} strokeWidth="3"/>
              <text x={p.x} y={H - 6} textAnchor="middle" fontSize="10" fontWeight={isLast ? 800 : 600} fill={isLast ? SPROUT.greenDark : SPROUT.mute} fontFamily="Nunito, system-ui">{axis[i]}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function InsightsScreen({ tweaks = {}, onBack, onYearInBloom }) {
  const [period, setPeriod] = React.useState('week');
  const data = INSIGHT_PERIODS[period];
  const periods = ['week', 'month', 'all'];
  const calm = !!tweaks.calm;
  // In Calm mode, soften streak-framed labels to gentle growth language (brand rule).
  const calmLabel = (k) => calm ? ({ 'Day streak': 'Days grown', 'Best streak': 'Longest run' }[k] || k) : k;

  return (
    <ScreenScaffold tweaks={tweaks} tab="me" onTab={() => {}}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 4px' }}>
        {onBack && (
          <button onClick={onBack} aria-label="Back to profile" style={{ width: 44, height: 44, marginLeft: -8, borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.ChevL size={24} color={SPROUT.ink}/>
          </button>
        )}
        <div>
          <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.1 }}>Your garden over time</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: SPROUT.mute }}>Look how you’ve grown 🌿</div>
        </div>
      </div>

      {/* period toggle */}
      <div style={{ display: 'flex', gap: 4, background: SPROUT.cream2, borderRadius: 13, padding: 4, margin: '16px 0 18px' }}>
        {periods.map((p) => {
          const on = period === p;
          return (
            <button key={p} onClick={() => setPeriod(p)} style={{
              flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 10, padding: '9px 0', minHeight: 40,
              background: on ? '#fff' : 'transparent', color: on ? SPROUT.ink : SPROUT.mute,
              fontSize: 13.5, fontWeight: 900, boxShadow: on ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}>{INSIGHT_PERIODS[p].label}</button>
          );
        })}
      </div>

      {/* hero highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
        {data.highlights.map((h) => (
          <div key={h.k} style={{ background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 16, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: h.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{h.icon}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: h.ink, lineHeight: 1 }}>{h.v}</div>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: SPROUT.mute, marginTop: 2 }}>{calmLabel(h.k)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* garden-growth chart */}
      <GrowthChart data={data}/>

      {/* reflective caption */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, margin: '16px 0 20px', padding: '13px 14px', background: 'linear-gradient(100deg, #EFF7EA, #E7F1FA)', border: `1px solid ${SPROUT.line}`, borderRadius: 16 }}>
        <div style={{ flexShrink: 0 }}><PipMini size={34}/></div>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: SPROUT.ink, lineHeight: 1.35 }}>{data.caption}</div>
      </div>

      {/* Year in Bloom entry */}
      <button onClick={onYearInBloom} style={{
        width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        background: 'linear-gradient(135deg, #F6D88A, #EFA76E)', borderRadius: 18, padding: 16,
        display: 'flex', alignItems: 'center', gap: 13, boxShadow: '0 3px 0 #D59428', marginBottom: 8,
      }}>
        <div style={{ width: 48, height: 48, borderRadius: 13, background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <BloomFlower level={4} color="#E0820F" size={38}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#5B3E07' }}>Your Year in Bloom 🌸</div>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: '#7A551A' }}>A keepsake recap of your garden — tap to view</div>
        </div>
        <Icon.ChevR size={20} color="#7A551A"/>
      </button>
    </ScreenScaffold>
  );
}

// "Year in Bloom" — a few gentle full-bleed recap cards with a Share. A calm,
// on-brand equivalent of Year-in-Review (reflection, not bragging).
const YIB_CARDS = [
  { bg: 'linear-gradient(160deg, #2E6E4E, #3E8B5A)', emoji: '🌱', big: '512', label: 'words grown this year', sub: 'Every one a seed you planted.' },
  { bg: 'linear-gradient(160deg, #2E4B63, #3E6B8B)', emoji: '🍃', big: '60', label: 'days, your longest bloom', sub: 'Tended through rain and shine.' },
  { bg: 'linear-gradient(160deg, #6B3E63, #9B5A7E)', emoji: '🌸', big: '84', label: 'plants in your garden', sub: 'From a single sprout to all this.' },
  { bg: 'linear-gradient(160deg, #8A5A1E, #C2873A)', emoji: '🌳', big: '28', label: 'hours of quiet growing', sub: 'A little each day adds up.' },
];

function YearInBloom({ onClose }) {
  const [i, setI] = React.useState(0);
  const [shared, setShared] = React.useState(false);
  const card = YIB_CARDS[i];
  const last = i === YIB_CARDS.length - 1;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, fontFamily: '"Nunito", system-ui', background: card.bg, transition: 'background .5s', display: 'flex', flexDirection: 'column', color: '#fff' }}>
      {/* progress segments */}
      <div style={{ display: 'flex', gap: 5, padding: '54px 16px 0' }}>
        {YIB_CARDS.map((_, k) => (
          <div key={k} style={{ flex: 1, height: 4, borderRadius: 2, background: k <= i ? '#fff' : 'rgba(255,255,255,0.3)', transition: 'background .3s' }}/>
        ))}
      </div>
      {/* close */}
      <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 50, right: 14, width: 40, height: 40, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.18)', color: '#fff', fontSize: 20, fontWeight: 900, cursor: 'pointer' }}>×</button>

      {/* tap zones to advance/back */}
      <div style={{ position: 'absolute', inset: 0, top: 70, display: 'flex', zIndex: 1 }}>
        <div onClick={() => setI(Math.max(0, i - 1))} style={{ flex: 1, cursor: 'pointer' }}/>
        <div onClick={() => !last && setI(i + 1)} style={{ flex: 2, cursor: last ? 'default' : 'pointer' }}/>
      </div>

      {/* content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 32px', position: 'relative', zIndex: 0 }}>
        <div style={{ fontSize: 64, marginBottom: 10, animation: 'yibPop 500ms cubic-bezier(.3,1.5,.5,1) both' }} key={`e${i}`}>{card.emoji}</div>
        <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1, letterSpacing: -2, animation: 'yibPop 500ms cubic-bezier(.3,1.5,.5,1) 60ms both' }} key={`b${i}`}>{card.big}</div>
        <div style={{ fontSize: 19, fontWeight: 800, marginTop: 8, opacity: 0.95 }}>{card.label}</div>
        <div style={{ fontSize: 14, fontWeight: 700, marginTop: 12, opacity: 0.8, maxWidth: 280 }}>{card.sub}</div>
      </div>

      <style>{`@keyframes yibPop { 0% { transform: scale(.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }`}</style>

      {/* footer */}
      <div style={{ padding: '0 22px 34px', position: 'relative', zIndex: 2 }}>
        {last ? (
          <button onClick={() => setShared(true)} disabled={shared} style={{
            width: '100%', border: 'none', cursor: shared ? 'default' : 'pointer', fontFamily: 'inherit',
            background: shared ? 'rgba(255,255,255,0.25)' : '#fff', color: shared ? '#fff' : card.bg.match(/#[0-9A-F]{6}/i)[0],
            fontSize: 16, fontWeight: 900, borderRadius: 16, padding: '15px 0',
          }}>{shared ? 'Shared — thanks for growing with us 🌱' : 'Share your Year in Bloom 🌸'}</button>
        ) : (
          <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 800, opacity: 0.7 }}>Tap to continue ›</div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { InsightsScreen, YearInBloom, GrowthChart, INSIGHT_PERIODS });
