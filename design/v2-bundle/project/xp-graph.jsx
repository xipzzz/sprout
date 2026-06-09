// ─────────────────────────────────────────────────────────────
// 7-day XP trend — line chart with tappable points. Selecting a day
// shows its XP + lessons; today's point is highlighted in brand green.
// ─────────────────────────────────────────────────────────────

function XPGraph({ calm }) {
  const days = [
    { d: 'Mon', xp: 20, lessons: 2 },
    { d: 'Tue', xp: 35, lessons: 3 },
    { d: 'Wed', xp: 15, lessons: 1 },
    { d: 'Thu', xp: 50, lessons: 4 },
    { d: 'Fri', xp: 30, lessons: 2 },
    { d: 'Sat', xp: 60, lessons: 5 },
    { d: 'Sun', xp: 45, lessons: 3 },
  ];
  const todayIdx = 6;
  const [sel, setSel] = React.useState(todayIdx);

  const W = 300, H = 110, padX = 18, padY = 16;
  const max = Math.max(...days.map((x) => x.xp));
  const stepX = (W - padX * 2) / (days.length - 1);
  const pt = (i) => ({
    x: padX + i * stepX,
    y: padY + (1 - days[i].xp / max) * (H - padY * 2),
  });
  const line = days.map((_, i) => { const p = pt(i); return `${p.x},${p.y}`; }).join(' ');
  const total = days.reduce((s, x) => s + x.xp, 0);
  const selDay = days[sel];

  return (
    <div style={{ background: SPROUT.paper, borderRadius: 16, border: `1px solid ${SPROUT.line}`, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, padding: '14px 14px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: SPROUT.ink }}>
          {selDay.d}: <span style={{ color: SPROUT.greenDark }}>{selDay.xp} XP</span>
          <span style={{ color: SPROUT.mute, fontWeight: 700 }}> · {selDay.lessons} lesson{selDay.lessons === 1 ? '' : 's'}</span>
        </div>
        <div style={{ fontSize: 11, fontWeight: 800, color: SPROUT.mute }}>{total} XP this week</div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* area fill */}
        <polygon points={`${padX},${H - padY} ${line} ${W - padX},${H - padY}`} fill={`${SPROUT.green}22`}/>
        {/* line */}
        <polyline points={line} fill="none" stroke={SPROUT.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        {/* points */}
        {days.map((day, i) => {
          const p = pt(i);
          const isToday = i === todayIdx;
          const isSel = i === sel;
          return (
            <g key={i} onClick={() => setSel(i)} style={{ cursor: 'pointer' }}>
              {/* tap target */}
              <rect x={p.x - stepX / 2} y={0} width={stepX} height={H} fill="transparent"/>
              {isSel && <line x1={p.x} y1={padY - 6} x2={p.x} y2={H - padY} stroke={SPROUT.cream2} strokeWidth="2"/>}
              <circle cx={p.x} cy={p.y} r={isSel ? 6 : 4.5}
                fill={isToday ? SPROUT.green : '#fff'} stroke={SPROUT.green} strokeWidth="3"/>
              <text x={p.x} y={H - 2} textAnchor="middle"
                fontSize="10" fontWeight={isToday ? 800 : 600}
                fill={isToday ? SPROUT.greenDark : SPROUT.mute}
                fontFamily="Nunito, system-ui">{day.d[0]}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

Object.assign(window, { XPGraph });
