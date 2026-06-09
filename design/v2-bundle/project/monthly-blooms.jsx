// ─────────────────────────────────────────────────────────────
// Monthly seasonal Blooms — a Duolingo-style yearly grid of collectibles.
// Each calendar month earns a unique seasonal flower, unlocked by a gentle
// monthly goal (practise on N days). Earned = vivid, current = in-progress,
// future = faint silhouette. Past years stack below. Lives in the Blooms area.
// English-only. Calm, pressure-free framing.
// ─────────────────────────────────────────────────────────────

// Seasonal flower per month — distinct shape + palette so the year tells a story.
const MONTH_BLOOMS = [
  { m: 'Jan', name: 'Snowdrop',       petal: '#EAF1F7', center: '#CFE0EC', leaf: '#7FA98C', kind: 'drop' },
  { m: 'Feb', name: 'Crocus',         petal: '#B79BE0', center: '#F2C94C', leaf: '#7CB07F', kind: 'cup' },
  { m: 'Mar', name: 'Daffodil',       petal: '#F6D34B', center: '#F2994A', leaf: '#6FA86A', kind: 'trumpet' },
  { m: 'Apr', name: 'Cherry blossom', petal: '#F6B8CE', center: '#E27DA3', leaf: '#8AB87E', kind: 'blossom' },
  { m: 'May', name: 'Tulip',          petal: '#EE6F7E', center: '#D64C5E', leaf: '#5FA85C', kind: 'tulip' },
  { m: 'Jun', name: 'Sunflower',      petal: '#F6C534', center: '#8A5A1E', leaf: '#5FA85C', kind: 'sun' },
  { m: 'Jul', name: 'Lavender',       petal: '#9D86D6', center: '#7A66B8', leaf: '#6FA86A', kind: 'spike' },
  { m: 'Aug', name: 'Poppy',          petal: '#F0604A', center: '#2A2320', leaf: '#6FA86A', kind: 'blossom' },
  { m: 'Sep', name: 'Aster',          petal: '#B98FD9', center: '#F2C94C', leaf: '#6FA86A', kind: 'sun' },
  { m: 'Oct', name: 'Marigold',       petal: '#F2922E', center: '#C2671A', leaf: '#5E9A57', kind: 'sun' },
  { m: 'Nov', name: 'Chrysanthemum',  petal: '#E0A33C', center: '#B5791E', leaf: '#5E8A52', kind: 'mum' },
  { m: 'Dec', name: 'Poinsettia',     petal: '#E24C4C', center: '#F2C94C', leaf: '#3F8A4A', kind: 'star' },
];

// A compact seasonal flower SVG. `lit` → vivid; else faint silhouette.
function SeasonBloom({ data, size = 52, lit = true }) {
  const s = size;
  const petal = lit ? data.petal : '#D8D0C0';
  const center = lit ? data.center : '#C2B8A6';
  const leaf = lit ? data.leaf : '#CDc4b2';
  const op = lit ? 1 : 0.5;
  const k = data.kind;
  const petals = [];
  const n = k === 'sun' || k === 'mum' ? 12 : k === 'blossom' ? 5 : k === 'star' ? 6 : 6;
  if (k === 'tulip' || k === 'cup') {
    petals.push(<path key="c" d="M32 40 Q22 40 24 20 Q32 26 32 26 Q32 26 40 20 Q42 40 32 40 Z" fill={petal}/>);
    petals.push(<path key="c2" d="M32 40 Q32 24 32 20" stroke={center} strokeWidth="2" fill="none" opacity="0.5"/>);
  } else if (k === 'trumpet') {
    for (let i = 0; i < 6; i++) petals.push(<ellipse key={i} cx="32" cy="14" rx="4.5" ry="9" fill={petal} transform={`rotate(${i * 60} 32 24)`}/>);
    petals.push(<circle key="tc" cx="32" cy="24" r="6" fill={center}/>);
  } else if (k === 'spike') {
    for (let i = 0; i < 5; i++) petals.push(<ellipse key={i} cx="32" cy={12 + i * 5} rx={5 - i * 0.4} ry="3.5" fill={petal} opacity={1 - i * 0.12}/>);
  } else if (k === 'drop') {
    for (let i = 0; i < 3; i++) petals.push(<path key={i} d="M32 14 Q28 24 32 30 Q36 24 32 14 Z" fill={petal} transform={`rotate(${(i - 1) * 32} 32 24)`}/>);
    petals.push(<circle key="dc" cx="32" cy="26" r="3" fill={center}/>);
  } else if (k === 'star') {
    for (let i = 0; i < 6; i++) petals.push(<path key={i} d="M32 8 L35 24 L29 24 Z" fill={petal} transform={`rotate(${i * 60} 32 24)`}/>);
    petals.push(<circle key="sc" cx="32" cy="24" r="4" fill={center}/>);
  } else {
    // sun / mum / blossom — radial petals
    for (let i = 0; i < n; i++) {
      const rx = k === 'blossom' ? 6 : 4;
      const ry = k === 'mum' ? 11 : k === 'sun' ? 10 : 8;
      petals.push(<ellipse key={i} cx="32" cy={k === 'blossom' ? 13 : 12} rx={rx} ry={ry} fill={petal} transform={`rotate(${(i * 360) / n} 32 24)`} opacity={k === 'mum' ? 0.92 : 1}/>);
    }
    petals.push(<circle key="cc" cx="32" cy="24" r={k === 'sun' ? 6 : 5} fill={center}/>);
  }
  return (
    <svg width={s} height={s} viewBox="0 0 64 64" style={{ opacity: op }}>
      <ellipse cx="32" cy="56" rx="16" ry="3.5" fill="#7A5832" opacity={lit ? 0.4 : 0.2}/>
      <line x1="32" y1="56" x2="32" y2="34" stroke={leaf} strokeWidth="2.5" strokeLinecap="round"/>
      <ellipse cx="24" cy="46" rx="5" ry="2.6" fill={leaf} transform="rotate(-30 24 46)"/>
      <ellipse cx="40" cy="46" rx="5" ry="2.6" fill={leaf} transform="rotate(30 40 46)"/>
      <g transform="translate(0 10)">{petals}</g>
    </svg>
  );
}

// state per month: 'earned' | 'current' | 'future'
function monthState(monthIdx, curMonth, earnedThrough) {
  if (monthIdx < earnedThrough) return 'earned';
  if (monthIdx === curMonth) return 'current';
  return 'future';
}

function MonthlyBloomsGrid({ year = 2026, curMonth = 5, earnedThrough = 5, progress = { days: 18, goal: 20 } }) {
  // curMonth: 0-indexed (5 = June). earnedThrough: months fully earned before current.
  const [detail, setDetail] = React.useState(null);
  const pct = Math.min(1, progress.days / progress.goal);

  return (
    <div>
      {/* current-month hero — the gentle monthly goal */}
      {(() => {
        const cm = MONTH_BLOOMS[curMonth];
        return (
          <div style={{ background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 18, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, padding: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 64, height: 64, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <SeasonBloom data={cm} size={60} lit={pct >= 1}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, fontWeight: 900, color: SPROUT.greenDark, textTransform: 'uppercase', letterSpacing: 0.6 }}>This month · {cm.m}</div>
              <div style={{ fontSize: 16.5, fontWeight: 900, lineHeight: 1.1 }}>{cm.name}</div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: SPROUT.mute, marginTop: 4 }}>
                {progress.days}/{progress.goal} days — your {cm.m} {cm.name.toLowerCase()} is {pct >= 1 ? 'in bloom 🌸' : 'almost in bloom 🌱'}
              </div>
              <div style={{ height: 7, borderRadius: 4, background: SPROUT.cream, overflow: 'hidden', marginTop: 7 }}>
                <div style={{ width: `${pct * 100}%`, height: '100%', background: cm.center, borderRadius: 4 }}/>
              </div>
            </div>
          </div>
        );
      })()}

      {/* yearly grid — Duolingo Monthly Badges style */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 2px 10px' }}>
        <div style={{ fontSize: 14.5, fontWeight: 900 }}>{year} Blooms</div>
        <div style={{ fontSize: 11.5, fontWeight: 900, color: SPROUT.greenDark, background: '#E3F5DB', padding: '2px 9px', borderRadius: 999 }}>{earnedThrough}/12</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
        {MONTH_BLOOMS.map((b, i) => {
          const st = monthState(i, curMonth, earnedThrough);
          const lit = st === 'earned';
          return (
            <button key={b.m} onClick={() => setDetail({ ...b, st, i })} style={{
              border: st === 'current' ? `1.5px solid ${b.center}` : `1px solid ${SPROUT.line}`,
              background: st === 'current' ? SPROUT.paper : (lit ? SPROUT.paper : SPROUT.cream),
              borderRadius: 14, padding: '12px 6px 9px', cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, position: 'relative',
              boxShadow: lit ? `0 2px 0 ${SPROUT.cardShadow}` : 'none',
            }}>
              <SeasonBloom data={b} size={46} lit={lit}/>
              <div style={{ fontSize: 11, fontWeight: 900, color: lit ? SPROUT.ink : SPROUT.mute }}>{b.m}</div>
              {st === 'current' && <span style={{ position: 'absolute', top: 6, right: 6, fontSize: 8.5, fontWeight: 900, color: b.center, background: SPROUT.cream, borderRadius: 999, padding: '2px 5px' }}>NOW</span>}
              {st === 'future' && <span style={{ position: 'absolute', top: 7, right: 7 }}><Icon.Lock size={11} color="#B7AC99"/></span>}
            </button>
          );
        })}
      </div>

      {/* past year (all earned) — stacked below */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 2px 10px' }}>
        <div style={{ fontSize: 14.5, fontWeight: 900 }}>2025 Blooms</div>
        <div style={{ fontSize: 11.5, fontWeight: 900, color: SPROUT.greenDark, background: '#E3F5DB', padding: '2px 9px', borderRadius: 999 }}>12/12</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
        {MONTH_BLOOMS.map((b) => (
          <button key={'25' + b.m} onClick={() => setDetail({ ...b, st: 'earned', i: -1, year: 2025 })} style={{
            border: `1px solid ${SPROUT.line}`, background: SPROUT.paper, borderRadius: 11, padding: '7px 2px',
            cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <SeasonBloom data={b} size={30} lit={true}/>
            <div style={{ fontSize: 8.5, fontWeight: 800, color: SPROUT.mute, marginTop: 2 }}>{b.m}</div>
          </button>
        ))}
      </div>

      {detail && <MonthBloomSheet data={detail} onClose={() => setDetail(null)}/>}
    </div>
  );
}

function MonthBloomSheet({ data, onClose }) {
  const lit = data.st === 'earned';
  const isCurrent = data.st === 'current';
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 55, display: 'flex', alignItems: 'flex-end', background: 'rgba(20,30,20,0.42)' }}>
      <style>{`@keyframes mbUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: SPROUT.bg, borderRadius: '22px 22px 0 0', padding: '16px 18px 28px', animation: 'mbUp 280ms cubic-bezier(.2,.8,.2,1) both' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: SPROUT.line, margin: '0 auto 16px' }}/>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: 96, height: 96, borderRadius: 24, background: lit ? SPROUT.paper : SPROUT.cream, border: `1px solid ${SPROUT.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SeasonBloom data={data} size={76} lit={lit}/>
          </div>
          <div style={{ fontSize: 21, fontWeight: 900, marginTop: 14 }}>{lit ? data.name : (isCurrent ? data.name : '???')}</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: SPROUT.mute, marginTop: 2 }}>
            {data.m}{data.year ? ' ' + data.year : ' 2026'} {lit ? '· grown 🌸' : isCurrent ? '· in progress' : '· not yet'}
          </div>
          <div style={{ marginTop: 14, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14, padding: '12px 14px', width: '100%', boxShadow: `0 2px 0 ${SPROUT.cardShadow}` }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: SPROUT.ink, lineHeight: 1.4 }}>
              {lit ? `A ${data.name.toLowerCase()} for ${data.m} — tended on 20+ days that month. A keepsake of the season.`
                : isCurrent ? `Practise on 20 days this month to grow your ${data.name.toLowerCase()} 🌱`
                : `Comes into season in ${data.m}. Keep tending to unlock it.`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MonthlyBloomsGrid, SeasonBloom, MONTH_BLOOMS });
