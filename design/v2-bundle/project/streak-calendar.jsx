// Streak calendar modal — calendar heatmap + Streak Freeze item
// Opens from the streak chip on the top bar.

function StreakCalendar({ onClose, tweaks = {}, water = 5, freezes = 2 }) {
  const { calm } = tweaks;

  // Mock activity: 28 days of "practiced" (true/false), with current streak
  // Day 0 = today, indexed backwards. We render last 35 days (5 weeks × 7).
  const practiced = React.useMemo(() => {
    const arr = Array(35).fill(false);
    // current streak — 13 consecutive days
    for (let i = 0; i < 13; i++) arr[i] = true;
    // earlier active days sprinkled
    [15, 16, 17, 19, 20, 21, 22, 24, 26, 28, 29, 30, 32, 33].forEach(i => arr[i] = true);
    return arr;
  }, []);

  // Days a Freeze quietly covered — they read as "kept safe", bridging a run (never a gap/scar).
  const frozen = React.useMemo(() => new Set([18, 23]), []);

  const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Build a 5×7 grid aligned to start-of-week. Day 0 = today.
  const today = new Date('2026-05-29');
  const todayDow = (today.getDay() + 6) % 7; // 0..6, Mon=0
  // start at the Monday of the week 4 weeks before "today" — gives 5 visible weeks
  const cells = [];
  for (let w = 0; w < 5; w++) {
    for (let d = 0; d < 7; d++) {
      const idxFromToday = (4 - w) * 7 + (todayDow - d);
      // idxFromToday: how many days BACK from today (positive = past). For future days, idx<0.
      const isFuture = idxFromToday < 0;
      const dayNum = new Date(today.getTime() - idxFromToday * 86400000).getDate();
      const cellDate = new Date(today.getTime() - idxFromToday * 86400000);
      cells.push({ idxFromToday, isFuture, dayNum, month: cellDate.getMonth(), practicedFlag: !isFuture && practiced[idxFromToday], frozenFlag: !isFuture && frozen.has(idxFromToday) });
    }
  }

  const streakColor = calm ? SPROUT.green : SPROUT.coral;
  const streakShadow = calm ? SPROUT.greenShadow : '#C85555';
  const streakIcon = calm ? <Icon.Leaf size={22} color="#fff"/> : <Icon.Flame size={22} color="#fff"/>;

  // ── Next-milestone progress (between the big 7/30/100/365 celebrations) ──
  const streakLen = 13;
  const milestones = [7, 30, 100, 365];
  const nextMs = milestones.find(m => m > streakLen) || null;
  const msToGo = nextMs ? nextMs - streakLen : 0;

  // Named garden stages for the milestone rail. Anchors include an implicit 0 start.
  const MS_ANCHORS = [0, 7, 30, 100];
  const MS_STAGES = [
    { d: 7,   name: 'Sprout',  icon: '🌱' },
    { d: 30,  name: 'Sapling', icon: '🌿' },
    { d: 100, name: 'Tree',    icon: '🌳' },
  ];
  const railX = (i) => 11 + i * 26; // % position of anchor index 0..3
  const dayToX = (day) => {
    for (let i = 1; i < MS_ANCHORS.length; i++) {
      if (day <= MS_ANCHORS[i]) {
        const lo = MS_ANCHORS[i - 1], hi = MS_ANCHORS[i];
        return railX(i - 1) + ((day - lo) / (hi - lo)) * (railX(i) - railX(i - 1));
      }
    }
    return railX(MS_ANCHORS.length - 1);
  };
  const curX = dayToX(streakLen);
  const nextStage = MS_STAGES.find(s => s.d > streakLen) || MS_STAGES[MS_STAGES.length - 1];

  // ── Month summary + perfect-month badge ──
  const monthCells = cells.filter(c => !c.isFuture && c.month === today.getMonth());
  const grownThisMonth = monthCells.filter(c => c.practicedFlag).length;
  const missedThisMonth = monthCells.filter(c => !c.practicedFlag).length;
  const freezesUsed = monthCells.filter(c => c.frozenFlag).length;
  const perfectMonth = missedThisMonth === 0 && grownThisMonth > 0;

  // ── Vine: connect consecutive in-streak days into one growing trail ──
  const gridRef = React.useRef(null);
  const cellRefs = React.useRef({});
  const [vine, setVine] = React.useState({ d: '', nodes: [], w: 0, h: 0 });
  React.useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const compute = () => {
      const gr = grid.getBoundingClientRect();
      const pts = [];
      for (let idx = streakLen - 1; idx >= 0; idx--) {
        const el = cellRefs.current[idx];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        pts.push({ x: r.left - gr.left + r.width / 2, y: r.top - gr.top + r.height / 2, idx });
      }
      if (pts.length < 1) { setVine({ d: '', nodes: [], w: gr.width, h: gr.height }); return; }
      let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) {
        const p0 = pts[i - 1], p1 = pts[i];
        if (Math.abs(p1.y - p0.y) < 4) {
          d += ` L ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
        } else {
          // week wrap — swoop out to the right edge, down, and back into the next row from the left
          const dy = (p1.y - p0.y);
          d += ` C ${(gr.width + 6).toFixed(1)} ${(p0.y + dy * 0.45).toFixed(1)}, ${(-6).toFixed(1)} ${(p1.y - dy * 0.45).toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
        }
      }
      setVine({ d, nodes: pts, w: gr.width, h: gr.height });
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(grid);
    return () => ro.disconnect();
  }, [calm]);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50 }}>
      <style>{`
        @keyframes scOverlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scSheetIn { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes scStreakPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      `}</style>
      {/* dim */}
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(20, 18, 12, 0.55)',
        animation: 'scOverlayIn 200ms ease-out',
      }}/>
      {/* sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: SPROUT.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '16px 16px 24px',
        animation: 'scSheetIn 260ms cubic-bezier(.2,.9,.2,1)',
        maxHeight: '88%', overflow: 'auto',
        boxShadow: '0 -8px 24px rgba(0,0,0,0.18)',
      }}>
        {/* grabber */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: SPROUT.cream2, margin: '0 auto 12px' }}/>

        {/* hero — current streak */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 14px', borderRadius: 16,
          background: streakColor,
          boxShadow: `0 4px 0 ${streakShadow}`,
          color: '#fff',
        }}>
          <div style={{
            width: 54, height: 54, borderRadius: '50%',
            background: 'rgba(0,0,0,0.16)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: calm ? 'none' : 'scStreakPulse 1.4s ease-in-out infinite',
          }}>
            {streakIcon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 0.8, opacity: 0.9 }}>
              {calm ? 'DAYS GROWN' : 'CURRENT STREAK'}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.05 }}>13</div>
              <div style={{ fontSize: 14, fontWeight: 800, opacity: 0.9 }}>days</div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.92, marginTop: 2 }}>
              {calm ? 'No pressure — just keep showing up.' : 'Longest yet · 23 all-time'}
            </div>
          </div>
        </div>

        {/* milestone rail — the whole journey: Sprout → Sapling → Tree, with where you are now */}
        {nextMs && (
          <div style={{ marginTop: 12, padding: '13px 14px 12px', borderRadius: 14, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, boxShadow: `0 2px 0 ${SPROUT.cardShadow}` }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.ink, textTransform: 'uppercase', letterSpacing: 0.6 }}>Streak milestones</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: SPROUT.greenDark }}>{msToGo} days to {nextStage.name}</div>
            </div>
            {/* Proactive safety net — show protections are ready BEFORE a miss, not just after.
                Garden-framed kindness: the learner sees the net before they need it. */}
            {freezes > 0 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12, padding: '5px 10px', borderRadius: 999, background: '#EAF4FA', border: '1px solid #CFE6F2' }}>
                <span style={{ fontSize: 12 }}>🍃</span>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: '#2E6E8A' }}>
                  {freezes} rainy-day {freezes === 1 ? 'cover' : 'covers'} ready — a missed day stays safe
                </span>
              </div>
            )}
            <div style={{ position: 'relative', height: 50 }}>
              {/* track */}
              <div style={{ position: 'absolute', left: `${railX(0)}%`, right: '8%', top: 12, height: 6, borderRadius: 999, background: '#EDE4D2' }}/>
              {/* fill up to today */}
              <div style={{ position: 'absolute', left: `${railX(0)}%`, top: 12, height: 6, borderRadius: 999, width: `${curX - railX(0)}%`, background: `linear-gradient(90deg, ${SPROUT.green}, #7BD267)`, transition: 'width .5s ease' }}/>
              {/* you-are-here bud */}
              <div style={{ position: 'absolute', left: `${curX}%`, top: 15, transform: 'translateX(-50%)', width: 0, height: 0 }}>
                <div style={{ position: 'absolute', left: -1, top: -16, fontSize: 11, fontWeight: 900, color: SPROUT.greenDark, whiteSpace: 'nowrap', transform: 'translateX(-50%)' }}>{streakLen}</div>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: streakColor, border: '2px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transform: 'translate(-50%, -6px)' }}/>
              </div>
              {/* stage nodes */}
              {MS_STAGES.map((s, i) => {
                const passed = streakLen >= s.d;
                return (
                  <div key={s.d} style={{ position: 'absolute', left: `${railX(i + 1)}%`, top: 0, transform: 'translateX(-50%)', textAlign: 'center', width: 56 }}>
                    <div style={{ width: 30, height: 30, margin: '0 auto', borderRadius: '50%', background: passed ? '#E3F5DB' : SPROUT.cream, border: `2px solid ${passed ? SPROUT.green : SPROUT.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, opacity: passed ? 1 : 0.85 }}>{s.icon}</div>
                    <div style={{ fontSize: 9.5, fontWeight: 900, color: passed ? SPROUT.greenDark : SPROUT.mute, marginTop: 4 }}>{s.name}</div>
                    <div style={{ fontSize: 8.5, fontWeight: 800, color: SPROUT.mute }}>{s.d} days</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* soft records — dual metric, celebrated quietly (no loud badges) */}
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { v: '47', label: 'days tended', icon: '🌱' },
            { v: '6', label: 'weeks in bloom', icon: '🌿' },
            { v: '23', label: 'longest bloom', icon: '🌸' },
          ].map((r, i) => (
            <div key={i} style={{ background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14, padding: '11px 8px', textAlign: 'center', boxShadow: `0 2px 0 ${SPROUT.cardShadow}` }}>
              <div style={{ fontSize: 15, marginBottom: 1 }}>{r.icon}</div>
              <div style={{ fontSize: 19, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.05 }}>{r.v}</div>
              <div style={{ fontSize: 9.5, fontWeight: 800, color: SPROUT.mute, letterSpacing: 0.2, lineHeight: 1.15, marginTop: 2 }}>{r.label}</div>
            </div>
          ))}
        </div>

        {/* calendar */}
        <div style={{ marginTop: 18 }}>
          {/* a gentle, one-line nudge to keep the run growing — never a threat */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
            padding: '9px 12px', borderRadius: 12,
            background: calm ? '#EFF7EA' : '#FFF2DC',
            border: `1px solid ${calm ? '#CEE2C0' : '#F5D699'}`,
          }}>
            <span style={{ fontSize: 15, flexShrink: 0 }}>{calm ? '🌱' : '🌸'}</span>
            <div style={{ fontSize: 12, fontWeight: 800, color: calm ? SPROUT.greenDark : '#8B5E12', lineHeight: 1.3 }}>
              {calm
                ? 'One lesson today keeps your garden growing.'
                : <>One lesson today keeps your <b>13-day bloom</b> alive!</>}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: SPROUT.ink }}>May 2026</div>
            {perfectMonth
              ? <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 900, color: '#C28A1C', background: '#FCEFC7', padding: '3px 9px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: 0.5 }}>Perfect month 🌸</div>
              : <div style={{ fontSize: 11, fontWeight: 800, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.6 }}>Last 5 weeks</div>}
          </div>

          {/* month summary line */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 12, fontSize: 12, fontWeight: 800, color: SPROUT.mute }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon.Leaf size={14} color={SPROUT.green}/> {grownThisMonth} days grown
            </span>
            {freezesUsed > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 13 }}>🍃</span> {freezesUsed} {freezesUsed === 1 ? 'day' : 'days'} kept safe
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 4 }}>
            {dayLetters.map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 900, color: SPROUT.mute, letterSpacing: 0.4 }}>{d}</div>
            ))}
          </div>

          {/* grid + vine overlay */}
          <div ref={gridRef} style={{ position: 'relative' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {cells.map((c, i) => {
                const isToday = c.idxFromToday === 0;
                const inStreak = c.practicedFlag && c.idxFromToday < streakLen;
                // States: in-streak (vivid, vine runs through) · practiced earlier (soft leaf dot)
                //         · frozen (kept safe) · missed (quiet, neutral) · future (dashed)
                const bg = c.isFuture
                  ? 'transparent'
                  : c.practicedFlag
                    ? (inStreak ? streakColor : '#CDEBC0')
                    : c.frozenFlag
                      ? '#E2EFF7'
                      : '#EFE8D9';
                const fg = c.isFuture ? SPROUT.mute
                  : inStreak ? '#fff'
                  : c.practicedFlag ? SPROUT.greenDark
                  : c.frozenFlag ? '#3E88A8'
                  : SPROUT.mute;
                return (
                  <div
                    key={i}
                    ref={inStreak ? (el => { if (el) cellRefs.current[c.idxFromToday] = el; }) : undefined}
                    title={c.frozenFlag ? 'A leaf kept your garden safe this day' : undefined}
                    style={{
                      position: 'relative', aspectRatio: '1', borderRadius: 8,
                      background: bg,
                      border: isToday ? `2px solid ${SPROUT.ink}` : (c.frozenFlag ? '1px solid #BBD9EA' : (c.isFuture ? `1px dashed ${SPROUT.cream2}` : 'none')),
                      boxShadow: c.practicedFlag && !c.isFuture && !inStreak ? 'inset 0 -2px 0 rgba(0,0,0,0.06)' : 'none',
                      opacity: c.isFuture ? 0.5 : (!c.practicedFlag && !c.frozenFlag && !isToday ? 0.85 : 1),
                    }}>
                    {/* day number tucked top-left so the vine can run through the center */}
                    <span style={{ position: 'absolute', top: 3, left: 5, fontSize: 9.5, fontWeight: 800, color: fg, opacity: inStreak ? 0.75 : 1 }}>{c.dayNum}</span>
                    {/* frozen → a little leaf that kept the day safe (never a cold scar) */}
                    {c.frozenFlag && (
                      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, lineHeight: 1 }}>🍃</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* the growing vine — one continuous trail through consecutive streak days */}
            {vine.d && (
              <svg width={vine.w} height={vine.h} viewBox={`0 0 ${vine.w} ${vine.h}`} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}>
                <path d={vine.d} fill="none" stroke={calm ? '#3DA94F' : '#2E9E3A'} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d={vine.d} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                {vine.nodes.map((n, i) => (
                  i === vine.nodes.length - 1
                    ? <text key={i} x={n.x} y={n.y + 5} textAnchor="middle" fontSize="15">{calm ? '🌿' : '🌸'}</text>
                    : <g key={i}>
                        <circle cx={n.x} cy={n.y} r="3.4" fill={calm ? '#2E9E3A' : '#1F8A2C'}/>
                        {/* tiny leaf bud, alternating sides */}
                        <ellipse cx={n.x + (i % 2 ? 5 : -5)} cy={n.y - 4} rx="3" ry="1.7" fill={calm ? '#5FC06F' : '#5BC04A'} transform={`rotate(${i % 2 ? 35 : -35} ${n.x + (i % 2 ? 5 : -5)} ${n.y - 4})`}/>
                      </g>
                ))}
              </svg>
            )}
          </div>

          {/* legend */}
          <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 11, fontWeight: 700, color: SPROUT.mute }}>
            <Legend swatch={streakColor} label="In streak"/>
            <Legend swatch="#CDEBC0" label="Practiced"/>
            <Legend swatch="#E2EFF7" label="Kept safe 🍃"/>
            <Legend swatch="#EFE8D9" label="Rest day"/>
          </div>
        </div>

        {/* gentle rest day — forgiving, not punishing. A "rainy day": your garden
            rests and your streak is kept, no purchase needed (1–2 a month). */}
        <div style={{
          marginTop: 18, padding: '14px', borderRadius: 16,
          background: 'linear-gradient(135deg, #EAF2F8, #EEF5EC)',
          border: `1px solid ${SPROUT.line}`, boxShadow: '0 2px 0 #DCE5DD',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>🌧️</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: SPROUT.ink }}>Rainy day rest</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute, marginTop: 2, lineHeight: 1.35 }}>
                Take a day off — your garden rests and your streak is kept. No pressure. 🌱
              </div>
            </div>
            <div style={{ flexShrink: 0, textAlign: 'center' }}>
              <div style={{ fontSize: 19, fontWeight: 900, color: SPROUT.greenDark, lineHeight: 1 }}>2</div>
              <div style={{ fontSize: 9, fontWeight: 800, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.4 }}>left</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 11 }}>
            {[true, true].map((avail, i) => (
              <div key={i} style={{ flex: 1, height: 7, borderRadius: 999, background: avail ? SPROUT.green : SPROUT.cream2 }}/>
            ))}
            <div style={{ flex: 1, height: 7, borderRadius: 999, background: SPROUT.cream2, opacity: 0.6 }}/>
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: SPROUT.mute, textAlign: 'center', marginTop: 7 }}>Refills monthly · used 0 of 2 this month</div>
        </div>

        {/* freeze item */}
        <div style={{
          marginTop: 18, padding: '14px 14px', borderRadius: 16,
          background: SPROUT.paper, border: `1px solid ${SPROUT.line}`,
          boxShadow: `0 2px 0 #E8DFCE`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: '#E7F3F8', border: `2px solid ${SPROUT.sky}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              {/* freeze drop — a snowflaked water drop */}
              <svg width="26" height="32" viewBox="0 0 24 30">
                <path d="M12 1C12 1 3 11 3 19a9 9 0 0 0 18 0C21 11 12 1 12 1z" fill={SPROUT.sky} stroke="#3E88A8" strokeWidth="1.5"/>
                <g stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.95">
                  <line x1="12" y1="14" x2="12" y2="24"/>
                  <line x1="8" y1="16" x2="16" y2="22"/>
                  <line x1="16" y1="16" x2="8" y2="22"/>
                </g>
              </svg>
              {/* count badge */}
              <div style={{
                position: 'absolute', top: -6, right: -6,
                minWidth: 22, height: 22, padding: '0 5px', borderRadius: 11,
                background: SPROUT.coral, color: '#fff',
                fontSize: 11, fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)', border: '2px solid #fff',
              }}>×{freezes}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: SPROUT.ink }}>Streak Freeze</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute, marginTop: 2, lineHeight: 1.35 }}>
                Protects your streak for one missed day. Auto-applies if you forget.
              </div>
            </div>
          </div>
          <button style={{
            marginTop: 12, width: '100%', height: 44, borderRadius: 12,
            border: 'none', cursor: 'pointer',
            background: water >= 3 ? SPROUT.sky : '#D7CFBE',
            color: water >= 3 ? '#fff' : SPROUT.mute,
            fontFamily: 'inherit', fontWeight: 900, fontSize: 14,
            letterSpacing: 0.4, textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: water >= 3 ? '0 3px 0 #3E88A8' : 'none',
          }}>
            Buy 1 — 3
            <svg width="14" height="17" viewBox="0 0 12 16"><path d="M6 1C6 1 1 7 1 10.5a5 5 0 0 0 10 0C11 7 6 1 6 1z" fill="#fff" stroke="#3E88A8" strokeWidth="1"/></svg>
            water
          </button>
          <div style={{ marginTop: 9, fontSize: 11, fontWeight: 700, color: SPROUT.mute, textAlign: 'center', lineHeight: 1.4 }}>
            You earn <b style={{ color: '#3E88A8' }}>+1 water</b> per lesson, <b style={{ color: '#3E88A8' }}>+2</b> when you hit your daily goal.
          </div>
        </div>

        {/* close */}
        <button onClick={onClose} style={{
          marginTop: 12, width: '100%', height: 44, borderRadius: 12,
          border: `2px solid ${SPROUT.line}`, background: 'transparent', cursor: 'pointer',
          fontFamily: 'inherit', fontWeight: 900, fontSize: 13, color: SPROUT.mute,
          letterSpacing: 0.5, textTransform: 'uppercase',
        }}>Done</button>
      </div>
    </div>
  );
}

function Legend({ swatch, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, background: swatch }}/>
      <span>{label}</span>
    </div>
  );
}

Object.assign(window, { StreakCalendar });
