// Leagues / weekly leaderboard — sky-themed tiers, promotion/demotion zones,
// and a Special Event slot. Replaces the inline LeagueScreen in app-flow.

const SKY_TIERS = [
  { id: 'mist',    name: 'Mist',    color: '#C8D3DC', shadow: '#9AAAB6', textColor: '#3C4853', glyph: 'mist' },
  { id: 'sunbeam', name: 'Sunbeam', color: '#F5C23D', shadow: '#C99016', textColor: '#5A3F00', glyph: 'beam' },
  { id: 'rainbow', name: 'Rainbow', color: '#E48A7C', shadow: '#B25F52', textColor: '#5A1F18', glyph: 'rainbow' },
  { id: 'aurora',  name: 'Aurora',  color: '#7DC9A8', shadow: '#4B9A78', textColor: '#103526', glyph: 'aurora' },
  { id: 'sky',     name: 'Sky',     color: '#6FA8E4', shadow: '#3D78B5', textColor: '#0F2D52', glyph: 'sky' },
];

function TierGlyph({ tier, size = 56 }) {
  const s = size;
  if (tier.glyph === 'mist') {
    return (
      <svg width={s} height={s} viewBox="0 0 56 56">
        <ellipse cx="28" cy="34" rx="22" ry="8" fill="#fff" opacity="0.9"/>
        <ellipse cx="20" cy="26" rx="14" ry="6" fill="#fff" opacity="0.7"/>
        <ellipse cx="36" cy="20" rx="14" ry="6" fill="#fff" opacity="0.85"/>
      </svg>
    );
  }
  if (tier.glyph === 'beam') {
    return (
      <svg width={s} height={s} viewBox="0 0 56 56">
        <circle cx="28" cy="28" r="12" fill="#fff"/>
        {Array.from({length: 8}).map((_, i) => {
          const a = (i * Math.PI) / 4;
          const x1 = 28 + Math.cos(a) * 16;
          const y1 = 28 + Math.sin(a) * 16;
          const x2 = 28 + Math.cos(a) * 26;
          const y2 = 28 + Math.sin(a) * 26;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth="3" strokeLinecap="round"/>;
        })}
      </svg>
    );
  }
  if (tier.glyph === 'rainbow') {
    return (
      <svg width={s} height={s} viewBox="0 0 56 56">
        {['#fff','#FFD4C7','#FFE19C','#C6F0C5'].map((c, i) => (
          <path key={i} d={`M ${10+i*2} 44 A ${18-i*2} ${18-i*2} 0 0 1 ${46-i*2} 44`} stroke={c} strokeWidth="3" fill="none" strokeLinecap="round"/>
        ))}
        <circle cx="28" cy="44" r="2.5" fill="#fff"/>
      </svg>
    );
  }
  if (tier.glyph === 'aurora') {
    return (
      <svg width={s} height={s} viewBox="0 0 56 56">
        <path d="M6 38 Q14 16 22 30 Q30 44 38 22 Q46 6 50 28" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.95"/>
        <path d="M6 44 Q16 28 24 38 Q34 48 42 30" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.65"/>
      </svg>
    );
  }
  // sky
  return (
    <svg width={s} height={s} viewBox="0 0 56 56">
      <circle cx="42" cy="16" r="6" fill="#fff" opacity="0.9"/>
      <circle cx="14" cy="12" r="3" fill="#fff" opacity="0.7"/>
      <path d="M4 38 q8 -8 16 0 q8 -8 16 0 q8 -8 16 0" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M8 46 q8 -6 14 0 q8 -6 14 0 q8 -6 14 0" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7"/>
    </svg>
  );
}

// Tier ladder strip — reads as a climb: tiers below your current one are
// "passed", your tier glows, higher tiers show a lock. Still tappable to
// preview each tier's board.
function TierLadder({ activeId, onSelect, userTierId = 'rainbow' }) {
  const userIdx = SKY_TIERS.findIndex(t => t.id === userTierId);
  return (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 4px 8px', minWidth: 0, position: 'relative' }} className="no-scrollbar">
        {/* connecting climb line */}
        <div style={{ position: 'absolute', left: 12, right: 12, top: 29, height: 3, background: SPROUT.line, borderRadius: 2, zIndex: 0 }}/>
        <div style={{ position: 'absolute', left: 12, top: 29, height: 3, background: SPROUT.green, borderRadius: 2, zIndex: 0, width: `calc(${(userIdx / (SKY_TIERS.length - 1)) * 100}% - 12px)` }}/>
        {SKY_TIERS.map((t, i) => {
          const active = t.id === activeId;
          const passed = i < userIdx;
          const isUser = i === userIdx;
          const locked = i > userIdx;
          return (
            <button key={t.id} onClick={() => onSelect && onSelect(t.id)} style={{
              border: 'none', background: 'transparent', padding: 0, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              opacity: active ? 1 : locked ? 0.7 : 0.85, minWidth: 64, position: 'relative', zIndex: 1,
            }}>
              <div style={{
                width: 50, height: 50, borderRadius: 14,
                background: locked ? '#E7E0D2' : t.color,
                boxShadow: `0 3px 0 ${locked ? '#CFC6B5' : t.shadow}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: active ? 'translateY(-2px)' : 'none',
                border: active ? `2px solid ${SPROUT.ink}` : isUser ? `2px solid ${SPROUT.sun}` : 'none',
                position: 'relative',
              }}>
                {locked
                  ? <Icon.Lock size={20} color="#A99E8B"/>
                  : <TierGlyph tier={t} size={32}/>}
                {passed && (
                  <span style={{ position: 'absolute', bottom: -3, right: -3, width: 18, height: 18, borderRadius: '50%', background: SPROUT.green, border: '2px solid ' + SPROUT.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon.Check size={10} color="#fff"/>
                  </span>
                )}
                {isUser && (
                  <span style={{ position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)', fontSize: 7.5, fontWeight: 900, color: '#fff', background: SPROUT.sun, padding: '1px 5px', borderRadius: 999, letterSpacing: 0.4, whiteSpace: 'nowrap', boxShadow: '0 1px 0 ' + SPROUT.sunShadow }}>YOU</span>
                )}
              </div>
              <span style={{ fontSize: 10, fontWeight: 900, color: active ? SPROUT.ink : SPROUT.mute, letterSpacing: 0.5 }}>{t.name.toUpperCase()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Live countdown to the weekly reset — precise d/h/m, ticks every minute.
function LeagueCountdown({ children, style }) {
  const target = React.useRef(Date.now() + (3 * 24 + 14) * 3600 * 1000 + 22 * 60 * 1000);
  const [, force] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => force(x => x + 1), 30000);
    return () => clearInterval(id);
  }, []);
  let ms = Math.max(0, target.current - Date.now());
  const d = Math.floor(ms / 86400000); ms -= d * 86400000;
  const h = Math.floor(ms / 3600000); ms -= h * 3600000;
  const m = Math.floor(ms / 60000);
  const txt = d > 0 ? `${d}d ${h}h left` : h > 0 ? `${h}h ${m}m left` : `${m}m left`;
  return <span style={style}>{typeof children === 'function' ? children(txt) : txt}</span>;
}

// Top-3 podium — elevates the promotion winners (1st center w/ crown, 2nd left,
// 3rd right). Top 3 = promotion, so the goal reads as aspirational (TikTok pattern).
function Podium({ top3, youRank }) {
  // order on stage: 2nd, 1st, 3rd
  const stage = [
    { ...top3[1], place: 2, h: 64,  medal: '🥈', tint: '#EAE8E3', ring: '#B3B0AA' },
    { ...top3[0], place: 1, h: 84,  medal: '👑', tint: '#FBEFC9', ring: '#E0B43A' },
    { ...top3[2], place: 3, h: 50,  medal: '🥉', tint: '#F1E2D2', ring: '#C68A55' },
  ];
  return (
    <div style={{
      position: 'relative', borderRadius: 18, padding: '16px 12px 0', marginBottom: 12,
      background: 'linear-gradient(180deg, #FFF8E6 0%, #EDF8E7 100%)',
      border: `1px solid #DCEBD0`, overflow: 'hidden',
    }}>
      <div style={{ textAlign: 'center', fontSize: 10, fontWeight: 900, letterSpacing: 1, color: SPROUT.greenDark, textTransform: 'uppercase', marginBottom: 12 }}>
        ↑ Promotion zone
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10 }}>
        {stage.map((p) => {
          const first = p.place === 1;
          return (
            <div key={p.place} style={{ flex: 1, maxWidth: 104, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: first ? 22 : 17, lineHeight: 1, marginBottom: 4 }}>{p.medal}</div>
              <div style={{
                width: first ? 56 : 46, height: first ? 56 : 46, borderRadius: '50%',
                background: '#EFF7EA', border: `2.5px solid ${p.isYou ? SPROUT.sun : p.ring}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: first ? `0 0 0 4px ${p.ring}33` : 'none',
              }}>
                <Pip size={first ? 44 : 36} mood={p.mood || 'happy'}/>
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 900, color: SPROUT.ink, marginTop: 5, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.isYou ? 'You' : p.name}
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: SPROUT.mute, marginBottom: 7 }}>{p.xp} XP</div>
              <div style={{
                width: '100%', height: p.h, borderRadius: '10px 10px 0 0',
                background: p.tint, border: `1px solid ${p.ring}66`, borderBottom: 'none',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 8,
                fontSize: first ? 26 : 20, fontWeight: 900, color: p.ring,
              }}>{p.place}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Leaderboard row
function LeagueRow({ rank, name, xp, isYou, zone, mood }) {
  const zoneBg = zone === 'promote' ? '#EDF8E7' : zone === 'demote' ? '#FBE6E6' : '#fff';
  const rankColor = rank === 1 ? '#E0B43A' : rank === 2 ? '#B3B0AA' : rank === 3 ? '#C68A55' : SPROUT.mute;
  const rankBg = rank <= 3 ? rankColor : 'transparent';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 12px',
      background: isYou ? '#FFF4D6' : zoneBg,
      borderRadius: 14,
      border: isYou ? `2px solid ${SPROUT.sun}` : `1px solid ${SPROUT.line}`,
      boxShadow: isYou ? `0 2px 0 ${SPROUT.sunShadow}` : 'none',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 14,
        background: rankBg, color: rank <= 3 ? '#fff' : SPROUT.mute,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 900, fontSize: 13, flexShrink: 0,
        border: rank > 3 ? `1.5px solid ${SPROUT.line}` : 'none',
      }}>{rank}</div>
      <div style={{
        width: 36, height: 36, borderRadius: '50%', background: '#EFF7EA',
        border: `1.5px solid ${SPROUT.green}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Pip size={28} mood={mood || 'happy'}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: SPROUT.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}{isYou && <span style={{ color: SPROUT.sunShadow, marginLeft: 6 }}>· YOU</span>}
        </div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 900, color: SPROUT.ink, fontVariantNumeric: 'tabular-nums' }}>
        {xp}<span style={{ fontSize: 10, fontWeight: 800, color: SPROUT.mute, marginLeft: 3 }}>XP</span>
      </div>
    </div>
  );
}

// Zone divider — promotion / demotion line
function ZoneDivider({ tone = 'promote', text }) {
  const palette = tone === 'promote'
    ? { color: SPROUT.green, bg: '#EDF8E7', dark: SPROUT.greenShadow }
    : { color: SPROUT.coral, bg: '#FBE6E6', dark: '#C85555' };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      margin: '4px 0',
    }}>
      <div style={{ flex: 1, height: 2, borderRadius: 1, background: palette.color, opacity: 0.6 }}/>
      <div style={{
        fontSize: 10, fontWeight: 900, letterSpacing: 0.7, textTransform: 'uppercase',
        color: palette.dark, background: palette.bg,
        padding: '3px 8px', borderRadius: 999,
        border: `1.5px solid ${palette.color}55`,
      }}>{tone === 'promote' ? '↑ ' : '↓ '}{text}</div>
      <div style={{ flex: 1, height: 2, borderRadius: 1, background: palette.color, opacity: 0.6 }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// End-of-week results — full-screen celebration shown when the timer
// hits zero. Three outcomes: promoted / held / demoted. Reuses the
// Lesson Complete celebration vocabulary (confetti, Pip, stat tiles).
// ─────────────────────────────────────────────────────────────
function LeagueResults({ outcome = 'promote', calm = false, onContinue }) {
  const fromTier = SKY_TIERS.find(t => t.id === 'rainbow');
  const cfg = {
    promote: {
      toTier: SKY_TIERS.find(t => t.id === 'aurora'),
      rank: 3, mood: 'cheer',
      kicker: 'You finished #3',
      title: calm ? 'You grew into Aurora' : 'You bloomed into Aurora League!',
      sub: calm ? 'Lovely steady growth this week.' : 'Top 3 — you climbed a tier. 🎉',
      accent: '#7DC9A8', accentDark: '#4B9A78', burst: true,
      rewards: [{ icon: <Icon.Gem size={22} color="#fff"/>, bg: '#5B8DEF', label: '+50 gems' },
                { icon: <span style={{ fontSize: 18 }}>🌱</span>, bg: '#7FB85C', label: 'Rare seed' }],
    },
    hold: {
      toTier: fromTier,
      rank: 6, mood: 'happy',
      kicker: 'You finished #6',
      title: calm ? 'You held your place' : 'You held your spot in Rainbow League',
      sub: 'Finish top 3 next week to climb to Aurora.',
      accent: fromTier.color, accentDark: fromTier.shadow, burst: false,
      rewards: [{ icon: <Icon.Gem size={22} color="#fff"/>, bg: '#5B8DEF', label: '+20 gems' }],
    },
    demote: {
      toTier: SKY_TIERS.find(t => t.id === 'sunbeam'),
      rank: 14, mood: 'sleepy',
      kicker: 'You finished #14',
      title: calm ? 'A gentler week ahead' : 'You slipped to Sunbeam',
      sub: calm ? "No pressure — let's grow back together. 🌱" : "It happens — let's grow back next week. 🌱",
      accent: '#F5C23D', accentDark: '#C99016', burst: false,
    },
  }[outcome];

  // Reveal sequence: 'anticipate' (the week's results are in…) → 'rank' (your final
  // rank) → 'result' (the outcome screen above). Calm/reduced-motion skip to result.
  const skipIntro = calm || (typeof reduceMotionOn === 'function' && reduceMotionOn());
  const [phase, setPhase] = React.useState(skipIntro ? 'result' : 'anticipate');
  React.useEffect(() => {
    if (phase === 'result') return;
    const t = setTimeout(() => setPhase(phase === 'anticipate' ? 'rank' : 'result'), phase === 'anticipate' ? 1300 : 1600);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase !== 'result') {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: SPROUT.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 28px', fontFamily: '"Nunito", system-ui' }}>
        <style>{`@keyframes lrIntro{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}
          @keyframes lrRankPop{0%{opacity:0;transform:scale(.4)}55%{transform:scale(1.12)}100%{opacity:1;transform:scale(1)}}
          @keyframes lrDots{0%,80%,100%{opacity:.3}40%{opacity:1}}`}</style>
        {phase === 'anticipate' ? (
          <div key="ant" style={{ animation: 'lrIntro .4s both' }}>
            <div style={{ marginBottom: 20 }}><Pip size={92} mood="happy"/></div>
            <div style={{ fontSize: 21, fontWeight: 900, color: SPROUT.ink }}>The week’s results are in…</div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
              {[0, 1, 2].map((i) => <span key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: SPROUT.green, animation: `lrDots 1.2s ${i * 0.18}s infinite` }}/>)}
            </div>
          </div>
        ) : (
          <div key="rank" style={{ animation: 'lrIntro .4s both' }}>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1.2, textTransform: 'uppercase', color: SPROUT.mute, marginBottom: 12 }}>Rainbow League · Week 14</div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: SPROUT.mute }}>You finished</div>
            <div style={{ fontSize: 88, fontWeight: 900, color: cfg.accentDark, lineHeight: 1, animation: 'lrRankPop .6s cubic-bezier(.2,.9,.3,1.3) both' }}>#{cfg.rank}</div>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: SPROUT.ink, marginTop: 6 }}>of 15 gardeners</div>
            {/* the in-zone hint hints at the outcome before it lands */}
            <div style={{ display: 'inline-block', marginTop: 16, fontSize: 12.5, fontWeight: 900, color: cfg.accentDark, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 999, padding: '6px 14px' }}>
              {outcome === 'promote' ? 'Promotion zone 🌈' : outcome === 'demote' ? 'A gentler tier next week' : 'Safe — held'}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: SPROUT.bg, display: 'flex', flexDirection: 'column', fontFamily: '"Nunito", system-ui' }}>
      <style>{`
        @keyframes lrPop { 0%{transform:scale(.5);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        @keyframes lrFall { 0%{transform:translateY(-30px) rotate(0);opacity:0} 12%{opacity:1} 100%{transform:translateY(560px) rotate(360deg);opacity:0} }
        @keyframes lrRise { from{transform:translateY(14px);opacity:0} to{transform:translateY(0);opacity:1} }
      `}</style>

      {/* confetti on promote */}
      {cfg.burst && !calm && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {Array.from({ length: 26 }).map((_, i) => {
            const colors = ['#F5C23D', '#7DC9A8', '#E48A7C', '#6FA8E4', '#58CC42'];
            return <div key={i} style={{
              position: 'absolute', left: `${(i * 37) % 100}%`, top: 0,
              width: 9, height: 9, borderRadius: i % 2 ? '50%' : 2,
              background: colors[i % colors.length],
              animation: `lrFall ${2 + (i % 5) * 0.4}s linear ${(i % 7) * 0.18}s infinite`,
            }}/>;
          })}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px', position: 'relative' }}>
        <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1.2, textTransform: 'uppercase', color: SPROUT.mute, marginBottom: 14, animation: 'lrRise .5s both' }}>{cfg.kicker} · Week 14</div>

        {/* Tier badge */}
        <div style={{ position: 'relative', animation: 'lrPop .6s cubic-bezier(.2,.9,.3,1.2) both' }}>
          <div style={{
            width: 130, height: 130, borderRadius: 34, background: cfg.toTier.color,
            boxShadow: `0 8px 0 ${cfg.toTier.shadow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TierGlyph tier={cfg.toTier} size={84}/>
          </div>
          {outcome === 'promote' && <div style={{ position: 'absolute', top: -8, right: -8, fontSize: 30 }}>⬆️</div>}
        </div>

        <div style={{ marginTop: 22, animation: 'lrRise .5s .15s both' }}><Pip size={84} mood={cfg.mood}/></div>

        <div style={{ fontSize: 25, fontWeight: 900, color: SPROUT.ink, marginTop: 12, lineHeight: 1.15, maxWidth: 320, animation: 'lrRise .5s .25s both' }}>{cfg.title}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: SPROUT.mute, marginTop: 8, maxWidth: 300, lineHeight: 1.4, animation: 'lrRise .5s .32s both' }}>{cfg.sub}</div>

        {/* Rewards */}
        {cfg.rewards && (
          <div style={{ display: 'flex', gap: 12, marginTop: 22, animation: 'lrRise .5s .4s both' }}>
            {cfg.rewards.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14, padding: '10px 14px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}` }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r.icon}</div>
                <span style={{ fontSize: 15, fontWeight: 900, color: SPROUT.ink }}>{r.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ flexShrink: 0, padding: '14px 20px 30px' }}>
        <div style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 800, color: SPROUT.mute, marginBottom: 12 }}>
          {outcome === 'promote' ? 'Fresh week starts now 🌱 — top 3 bloom up again' : outcome === 'demote' ? 'Fresh week, fresh start 🌱 — you’ve got this' : 'New week starts now 🌱 — top 3 climb to Aurora'}
        </div>
        <button onClick={onContinue} style={{
          width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          background: SPROUT.green, color: '#fff', fontSize: 17, fontWeight: 900,
          letterSpacing: 0.4, textTransform: 'uppercase', borderRadius: 16, padding: '15px 0',
          boxShadow: `0 4px 0 ${SPROUT.greenShadow}`,
        }}>{outcome === 'demote' ? 'Keep growing' : 'Continue'}</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Season history — past weekly finishes + the league's past top-3.
// Closes the loop on the result screens: long-term players get a
// sense of progression across weeks (Stadium Live "see past winners").
// ─────────────────────────────────────────────────────────────
function SeasonHistory({ onClose }) {
  const tierOf = (id) => SKY_TIERS.find(t => t.id === id);
  const weeks = [
    { wk: 13, tier: 'rainbow', rank: 4, xp: 354, outcome: 'hold', top3: ['Cedar', 'Iris', 'Mossy'] },
    { wk: 12, tier: 'sunbeam', rank: 2, xp: 488, outcome: 'promote', top3: ['Lark', 'You', 'Reed'] },
    { wk: 11, tier: 'sunbeam', rank: 7, xp: 305, outcome: 'hold', top3: ['Maple', 'Birch', 'Wren'] },
    { wk: 10, tier: 'mist', rank: 1, xp: 540, outcome: 'promote', top3: ['You', 'Sage', 'Fern'] },
    { wk: 9, tier: 'mist', rank: 5, xp: 268, outcome: 'hold', top3: ['Sage', 'Fern', 'Juno'] },
  ];
  const outMeta = {
    promote: { label: 'Promoted', color: SPROUT.greenDark, bg: '#E3F5DB', icon: '⬆️' },
    hold: { label: 'Held', color: '#9A7A1E', bg: '#FBF0D2', icon: '➡️' },
    demote: { label: 'Dropped', color: '#A0322A', bg: '#FBE6E6', icon: '⬇️' },
  };
  const promos = weeks.filter(w => w.outcome === 'promote').length;
  const best = weeks.reduce((a, w) => Math.min(a, w.rank), 99);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: SPROUT.bg, display: 'flex', flexDirection: 'column', fontFamily: '"Nunito", system-ui' }}>
      {/* Header */}
      <div style={{ flexShrink: 0, padding: '54px 16px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${SPROUT.line}` }}>
        <button onClick={onClose} aria-label="Back" style={{ border: 'none', background: SPROUT.paper, width: 38, height: 38, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, flexShrink: 0 }}>
          <span style={{ fontSize: 20, color: SPROUT.ink }}>‹</span>
        </button>
        <div style={{ fontSize: 20, fontWeight: 900, color: SPROUT.ink }}>Season history</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 28px' }}>
        {/* Summary tiles */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {[
            { v: `#${best}`, k: 'Best finish' },
            { v: promos, k: 'Promotions' },
            { v: weeks.length, k: 'Weeks played' },
          ].map((s) => (
            <div key={s.k} style={{ flex: 1, background: SPROUT.paper, borderRadius: 14, border: `1px solid ${SPROUT.line}`, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, padding: '12px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: SPROUT.ink, fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>{s.k}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.mute, letterSpacing: 0.6, textTransform: 'uppercase', margin: '0 2px 8px' }}>Your weekly finishes</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {weeks.map((w) => {
            const t = tierOf(w.tier);
            const om = outMeta[w.outcome];
            return (
              <div key={w.wk} style={{ background: SPROUT.paper, borderRadius: 16, border: `1px solid ${SPROUT.line}`, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, padding: '12px 13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: t.color, boxShadow: `0 2px 0 ${t.shadow}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <TierGlyph tier={t} size={28}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 900, color: SPROUT.ink }}>Week {w.wk} · {t.name}</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: SPROUT.mute }}>Finished #{w.rank} · {w.xp} XP</div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 900, color: om.color, background: om.bg, padding: '5px 9px', borderRadius: 999, flexShrink: 0 }}>
                    {om.icon} {om.label}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 9, paddingTop: 9, borderTop: `1px solid ${SPROUT.line}` }}>
                  <span style={{ fontSize: 10, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.5, marginRight: 2 }}>Top 3</span>
                  {w.top3.map((n, i) => (
                    <span key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11.5, fontWeight: 800,
                      color: n === 'You' ? SPROUT.greenDark : SPROUT.ink,
                      background: n === 'You' ? '#E3F5DB' : SPROUT.cream, padding: '3px 8px', borderRadius: 999,
                    }}>{['🥇','🥈','🥉'][i]} {n}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 800, color: SPROUT.mute, marginTop: 16 }}>
          Your climb so far 🌱 — keep finishing top 3 to reach Sky.
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Cooperative GROVE — the calm-mode social screen. ~5 gardeners grow a
// shared plot together; everyone's practice adds blooms to one collective
// garden. No ranks, no winners, no demotion — just showing up together.
// This is Sprout's on-brand answer to the competitive ladder.
// ─────────────────────────────────────────────────────────────
function CooperativeGrove({ tweaks = {}, tab, onTab, onStreakTap, onWaterTap, onGemsTap }) {
  const [scope, setScope] = React.useState('grove'); // 'grove' (cohort) | 'friends'
  const groveMembers = [
    { name: 'You', isYou: true, blooms: 6, color: SPROUT.green, mood: 'cheer', note: 'tended daily' },
    { name: 'Wren', blooms: 5, color: SPROUT.sun, mood: 'happy', note: 'on a gentle roll' },
    { name: 'Juniper', blooms: 4, color: SPROUT.coral, mood: 'proud', note: 'back after a rest' },
    { name: 'Sol', blooms: 5, color: '#A88FCB', mood: 'sleepy', note: 'steady as ever' },
    { name: 'Briar', blooms: 3, color: '#5AB9D9', mood: 'happy', note: 'just getting going' },
  ];
  const friendMembers = [
    { name: 'You', isYou: true, blooms: 6, color: SPROUT.green, mood: 'cheer', note: 'tended daily' },
    { name: 'Maya', blooms: 7, color: SPROUT.coral, mood: 'proud', note: 'blooming away' },
    { name: 'Theo', blooms: 4, color: '#5AB9D9', mood: 'happy', note: 'steady as ever' },
  ];
  const members = scope === 'friends' ? friendMembers : groveMembers;
  const total = members.reduce((s, m) => s + m.blooms, 0);
  const goal = scope === 'friends' ? 20 : 30;
  const pct = Math.min(1, total / goal);
  const remaining = Math.max(0, goal - total);
  // Gently mark the leading gardener (a top-bloom sprig, never a rank numeral).
  const topBlooms = Math.max(...members.map((m) => m.blooms));
  const seasonTotal = 148; // cumulative blooms grown this season — a calm long-term number

  // Send a little encouragement — warm, reciprocal, never competitive.
  const [cheered, setCheered] = React.useState({});

  return (
    <ScreenScaffold tweaks={tweaks} tab={tab} onTab={onTab} onStreakTap={onStreakTap} onWaterTap={onWaterTap} onGemsTap={onGemsTap}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, margin: '0 4px 4px' }}>
        <div style={{ fontSize: 24, fontWeight: 900, whiteSpace: 'nowrap' }}>Your Grove</div>
        <div style={{ fontSize: 12, fontWeight: 800, color: SPROUT.mute, flexShrink: 0 }}>🌿 {seasonTotal} this season</div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: SPROUT.mute, margin: '0 4px 12px', lineHeight: 1.4 }}>
        {scope === 'friends'
          ? `You and ${members.length - 1} friends are growing together this week. 🌱`
          : `You and ${members.length - 1} others are growing a garden together this week. 🌱`}
      </div>

      {/* My grove / Friends — opt-in social, no extra pressure */}
      <div style={{ display: 'inline-flex', padding: 3, background: 'rgba(42,35,32,.06)', borderRadius: 999, marginBottom: 14 }}>
        {[{ id: 'grove', label: 'My grove' }, { id: 'friends', label: 'Friends' }].map((s) => {
          const on = scope === s.id;
          return (
            <button key={s.id} onClick={() => setScope(s.id)} style={{
              appearance: 'none', border: 0, cursor: 'pointer', fontFamily: 'inherit',
              minHeight: 34, padding: '0 16px', borderRadius: 999, fontSize: 12.5, fontWeight: 900,
              background: on ? SPROUT.paper : 'transparent', color: on ? SPROUT.greenDark : SPROUT.mute,
              boxShadow: on ? `0 1px 3px rgba(0,0,0,.12)` : 'none', transition: 'background .15s, color .15s',
            }}>{s.label}</button>
          );
        })}
      </div>

      {/* Shared plot — the collective garden bed everyone's blooms grow in */}
      <div style={{
        position: 'relative', borderRadius: 20, overflow: 'hidden', marginBottom: 14,
        background: 'linear-gradient(180deg, #EAF6FB 0%, #EAF6E2 55%, #DDEFCF 100%)',
        border: '1px solid #CEE2C0', boxShadow: '0 4px 0 #CEE2C0',
      }}>
        <div style={{ padding: '16px 16px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 0.8, textTransform: 'uppercase', color: SPROUT.greenDark, opacity: 0.85 }}>Grown together</div>
          <div style={{ fontSize: 34, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.05, marginTop: 2 }}>{total} <span style={{ fontSize: 18 }}>blooms</span></div>
        </div>
        {/* the bed — blooms from everyone, mingled (not attributed/ranked) */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 1, flexWrap: 'wrap', padding: '10px 12px 4px', minHeight: 56 }}>
          {(() => {
            const seq = [];
            members.forEach((m) => { for (let i = 0; i < m.blooms; i++) seq.push(m.color); });
            // gently shuffle by interleaving so colors mingle rather than cluster
            const mingled = [];
            let added = true;
            const buckets = members.map((m) => ({ color: m.color, n: m.blooms }));
            while (added) {
              added = false;
              buckets.forEach((b) => { if (b.n > 0) { mingled.push(b.color); b.n--; added = true; } });
            }
            return mingled.map((c, i) => (
              <div key={i} style={{ transform: `translateY(${(i % 3) * -2}px)` }}>
                <BloomFlower level={2 + (i % 3)} color={c} size={26}/>
              </div>
            ));
          })()}
        </div>
        {/* collective goal — a shared milestone, reached together (no competition) */}
        <div style={{ padding: '4px 16px 16px' }}>
          <div style={{ height: 9, borderRadius: 999, background: 'rgba(255,255,255,0.6)', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)' }}>
            <div style={{ width: `${pct * 100}%`, height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${SPROUT.green}, #8FD46F)`, transition: 'width .4s' }}/>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: SPROUT.greenDark, marginTop: 8, textAlign: 'center' }}>
            {remaining > 0 ? `${remaining} more to reach this week's grove goal 🌸` : 'Grove goal reached — beautiful work, everyone! 🌸'}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: SPROUT.mute, marginTop: 4, textAlign: 'center', opacity: 0.85 }}>
            Grove refreshes Sunday — a gentle fresh start, no pressure.
          </div>
        </div>
      </div>

      {/* Members — everyone who's tending the grove. No ranks, no XP race. */}
      <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.mute, letterSpacing: 0.6, textTransform: 'uppercase', margin: '0 2px 8px' }}>Gardeners · {members.length} tending</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {members.map((m) => {
          const isCheered = !!cheered[m.name];
          return (
            <div key={m.name} style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px',
              background: m.isYou ? '#EFF7EA' : SPROUT.paper, borderRadius: 14,
              border: m.isYou ? `1.5px solid ${SPROUT.green}55` : `1px solid ${SPROUT.line}`,
              boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#EFF7EA', border: `1.5px solid ${m.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Pip size={32} mood={m.mood}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 900, color: SPROUT.ink, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {m.name}
                  {m.isYou && <span style={{ fontSize: 10, fontWeight: 900, color: SPROUT.greenDark, background: '#DCEFD2', padding: '2px 6px', borderRadius: 6, letterSpacing: 0.5 }}>YOU</span>}
                  {m.blooms === topBlooms && (
                    <span title="Most blooms this week" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 900, color: '#C28A1C', background: '#FBF1DC', padding: '2px 7px', borderRadius: 999 }}>🌷 Top bloom</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 800, color: SPROUT.mute }}>
                    <Icon.Leaf size={12} color={m.color}/> {m.blooms} blooms
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: SPROUT.mute, opacity: 0.8 }}>· {m.note}</span>
                </div>
              </div>
              {!m.isYou && (
                <button onClick={() => setCheered((c) => ({ ...c, [m.name]: !c[m.name] }))} aria-label={`Cheer ${m.name}`} style={{
                  flexShrink: 0, cursor: 'pointer', fontFamily: 'inherit', border: 'none',
                  display: 'flex', alignItems: 'center', gap: 5, borderRadius: 999, padding: '8px 12px', minHeight: 38,
                  background: isCheered ? '#DCEFD2' : SPROUT.cream,
                  color: isCheered ? SPROUT.greenDark : SPROUT.mute,
                  fontSize: 12.5, fontWeight: 900, transition: 'background .14s',
                }}>
                  <span style={{ fontSize: 14 }}>{isCheered ? '💚' : '👏'}</span>
                  {isCheered ? 'Cheered' : 'Cheer'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 800, color: SPROUT.greenDark, margin: '16px 8px 4px', lineHeight: 1.45 }}>
        Everyone grows at their own pace here — no winners, no losers, just a garden you tend together. 🌿
      </div>
      {/* Quiet opt-in: competition is available for those who want it, never forced */}
      <div style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: SPROUT.mute, marginTop: 6, lineHeight: 1.4 }}>
        Prefer a friendly ranked league? Turn off Calm mode anytime in Settings.
      </div>
    </ScreenScaffold>
  );
}

function LeagueScreen({ tweaks = {}, tab, onTab, onStreakTap, onWaterTap, onGemsTap, initialResult = null }) {
  const [tierId, setTierId] = React.useState('rainbow');
  const [result, setResult] = React.useState(initialResult); // 'promote'|'hold'|'demote'|null
  const [history, setHistory] = React.useState(false);
  const tier = SKY_TIERS.find(t => t.id === tierId);
  const firstTime = tweaks && tweaks.firstTime;

  if (result) {
    return <LeagueResults outcome={result} calm={tweaks.calm} onContinue={() => setResult(null)} />;
  }
  if (history) {
    return <SeasonHistory onClose={() => setHistory(false)} />;
  }

  // Calm mode (the default) — no competitive ladder. A cooperative Grove instead:
  // a shared garden the group grows together, with zero ranking or demotion.
  if (tweaks.calm) {
    return <CooperativeGrove tweaks={tweaks} tab={tab} onTab={onTab} onStreakTap={onStreakTap} onWaterTap={onWaterTap} onGemsTap={onGemsTap} />;
  }

  // ── FIRST-WEEK / FIRST-TIME LEAGUE ───────────────────────────
  // A new user dropped into a ranked board is intimidating. The first
  // week reframes it as "just practice to climb" and explains the rules
  // gently before any competition is shown (Speak "Start a Streak!").
  if (firstTime && !tweaks.calm) {
    const newcomers = [
      { name: 'You', xp: 0, isYou: true, mood: 'cheer' },
      { name: 'Wren', xp: 0, mood: 'happy' },
      { name: 'Juniper', xp: 0, mood: 'happy' },
      { name: 'Sol', xp: 0, mood: 'sleepy' },
      { name: 'Briar', xp: 0, mood: 'happy' },
    ];
    const mist = SKY_TIERS[0];
    return (
      <ScreenScaffold tweaks={tweaks} tab={tab} onTab={onTab} onStreakTap={onStreakTap} onWaterTap={onWaterTap} onGemsTap={onGemsTap}>
        {/* Welcome banner — your first week, framed as growth not ranking */}
        <div style={{
          position: 'relative', borderRadius: 18, padding: '18px 16px', marginBottom: 14,
          background: mist.color, color: mist.textColor, boxShadow: `0 4px 0 ${mist.shadow}`, overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: -12, top: -12, opacity: 0.22, transform: 'rotate(8deg)' }}>
            <TierGlyph tier={mist} size={150}/>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 1, opacity: 0.85 }}>YOUR FIRST WEEK</div>
            <div style={{ fontSize: 23, fontWeight: 900, lineHeight: 1.15, marginTop: 2 }}>{mist.name} League</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6, opacity: 0.92, lineHeight: 1.4, maxWidth: 280 }}>
              Just practice to climb 🌱 — earn XP from any lesson and watch yourself rise. No pressure to win.
            </div>
          </div>
        </div>

        {/* How leagues work — explained before any competition */}
        <div style={{ background: SPROUT.paper, borderRadius: 18, border: `1px solid ${SPROUT.line}`, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, padding: '16px 16px 6px', marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>How leagues work</div>
          {[
            { emoji: '⭐', title: 'Earn XP, move up', body: 'Every lesson adds XP. Your spot on the board updates as you practice all week.' },
            { emoji: '⬆️', title: 'Top finishers advance', body: 'Finish near the top and you climb to the next league. Climb all the way to Sky.' },
            { emoji: '🌿', title: 'You can’t drop on week one', body: 'Your first week is a soft landing — only good things happen. Just have fun growing.' },
          ].map((row) => (
            <div key={row.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: SPROUT.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{row.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 900, color: SPROUT.ink }}>{row.title}</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: SPROUT.mute, lineHeight: 1.4, marginTop: 2 }}>{row.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* The board — everyone starts at 0; a friendly "be the first to grow" nudge */}
        <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.mute, letterSpacing: 0.6, textTransform: 'uppercase', margin: '0 2px 8px' }}>This week's group · {newcomers.length} growing</div>
        <div style={{ background: SPROUT.paper, borderRadius: 16, border: `1px solid ${SPROUT.line}`, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, overflow: 'hidden' }}>
          {newcomers.map((p, i) => (
            <div key={p.name} style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '12px 13px',
              borderTop: i === 0 ? 'none' : `1px solid ${SPROUT.line}`,
              background: p.isYou ? '#EFF7EA' : '#fff',
            }}>
              <span style={{ width: 18, fontSize: 14, fontWeight: 900, color: SPROUT.mute, textAlign: 'center' }}>{i + 1}</span>
              <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: p.isYou ? SPROUT.green : SPROUT.cream2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: p.isYou ? '#fff' : SPROUT.mute }}>{p.name[0]}</div>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 800 }}>
                {p.name}{p.isYou && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 900, color: SPROUT.greenDark, background: '#DCEFD2', padding: '2px 6px', borderRadius: 6, letterSpacing: 0.5 }}>YOU</span>}
              </span>
              <span style={{ fontSize: 14, fontWeight: 900, color: SPROUT.mute, fontVariantNumeric: 'tabular-nums' }}>{p.xp}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: SPROUT.mute }}>XP</span>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 800, color: SPROUT.greenDark, marginTop: 14, lineHeight: 1.4 }}>
          Everyone's at zero — finish a lesson to take the lead 🌱
        </div>
      </ScreenScaffold>
    );
  }

  // Mock leaderboard — your rank #4 in promotion zone
  const players = [
    { name: 'Cedar', xp: 480, mood: 'cheer' },
    { name: 'Iris', xp: 412, mood: 'proud' },
    { name: 'Mossy', xp: 390, mood: 'happy' },
    { name: 'You', xp: 354, isYou: true, mood: 'cheer' },
    { name: 'Fern', xp: 348, mood: 'happy' },
    { name: 'Aster', xp: 305, mood: 'happy' },
    { name: 'Bramble', xp: 282, mood: 'thinking' },
    { name: 'Clover', xp: 248, mood: 'happy' },
    { name: 'Dahlia', xp: 220, mood: 'happy' },
    { name: 'Echo', xp: 195, mood: 'sleepy' },
    { name: 'Fox', xp: 174, mood: 'happy' },
    { name: 'Glade', xp: 152, mood: 'happy' },
    { name: 'Hazel', xp: 138, mood: 'sleepy' },
    { name: 'Ivy', xp: 96, mood: 'sleepy' },
    { name: 'Juno', xp: 22, mood: 'sleepy' },
  ];
  const youIdx = players.findIndex(p => p.isYou);
  const youRank = youIdx + 1;
  const rival = players[youIdx - 1];          // person one rank above
  const gapToPass = rival ? (rival.xp - players[youIdx].xp + 1) : 0;
  const youInPromo = youRank > 3;             // just outside the top-3 promotion zone

  return (
    <ScreenScaffold tweaks={tweaks} tab={tab} onTab={onTab} onStreakTap={onStreakTap} onWaterTap={onWaterTap} onGemsTap={onGemsTap}>
      {/* Tier banner */}
      <div style={{
        position: 'relative', borderRadius: 18, padding: '16px 14px', marginBottom: 12,
        background: tier.color, color: tier.textColor,
        boxShadow: `0 4px 0 ${tier.shadow}`,
        overflow: 'hidden',
      }}>
        {/* subtle background pattern */}
        <div style={{ position: 'absolute', right: -10, top: -10, opacity: 0.25, transform: 'rotate(8deg)' }}>
          <TierGlyph tier={tier} size={140}/>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 62, height: 62, borderRadius: 16,
            background: 'rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <TierGlyph tier={tier} size={42}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 1, opacity: 0.85 }}>WEEK 14 · LEAGUE</div>
            <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>{tier.name} League</div>
            <div style={{ fontSize: 12, fontWeight: 700, marginTop: 3, opacity: 0.9 }}>
              You're #{youRank} of {players.length}
            </div>
          </div>
        </div>
        {/* Stakes + live countdown — turns a static list into a live race */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 900, background: 'rgba(255,255,255,0.35)', padding: '5px 10px', borderRadius: 999 }}>
            ⬆️ Top 3 bloom up to Aurora
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 900, background: 'rgba(0,0,0,0.14)', padding: '5px 10px', borderRadius: 999, fontVariantNumeric: 'tabular-nums' }}>
            ⏳ <LeagueCountdown/>
          </span>
        </div>
      </div>

      {/* Tier ladder */}
      <TierLadder activeId={tierId} onSelect={setTierId}/>

      {/* Season history entry — past weekly finishes + past top-3 */}
      <button onClick={() => setHistory(true)} style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
        padding: '10px 13px', marginBottom: 14, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
        background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
      }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: SPROUT.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 17 }}>📜</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 900, color: SPROUT.ink }}>Season history</div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: SPROUT.mute }}>Your past finishes &amp; league winners</div>
        </div>
        <span style={{ fontSize: 18, color: SPROUT.mute }}>›</span>
      </button>

      {/* Results entry — appears on results day */}
      <button onClick={() => setResult('promote')} style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
        padding: '11px 13px', marginBottom: 14, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
        background: 'linear-gradient(90deg, #EAF6E2, #DCEFD2)', border: `1px solid #CEE2C0`,
        borderRadius: 14, boxShadow: '0 3px 0 #CEE2C0',
      }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: SPROUT.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 22 }}>🎉</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: SPROUT.greenDark, letterSpacing: 0.6 }}>WEEK 14 HAS ENDED</div>
          <div style={{ fontSize: 14, fontWeight: 900, color: SPROUT.ink }}>See your results</div>
        </div>
        <span style={{ fontSize: 18, color: SPROUT.greenDark }}>›</span>
      </button>

      {/* Special Event slot */}
      <button style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '10px 12px', marginBottom: 14,
        background: 'linear-gradient(90deg, #F8E7A1, #F6C16C)',
        border: 'none', borderRadius: 14,
        boxShadow: '0 3px 0 #C88E2C',
        cursor: 'pointer', textAlign: 'left',
        fontFamily: 'inherit',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ fontSize: 22 }}>🎯</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: '#5A3F00', letterSpacing: 0.6 }}>SPECIAL EVENT · 2 DAYS LEFT</div>
          <div style={{ fontSize: 14, fontWeight: 900, color: '#3F2A00' }}>Match Madness</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#5A3F00', opacity: 0.9 }}>2× XP on all Match exercises</div>
        </div>
        <span style={{ fontSize: 18, color: '#5A3F00' }}>›</span>
      </button>

      {/* Top-3 podium — the promotion winners, elevated */}
      <Podium top3={players.slice(0, 3)} youRank={youRank}/>

      {/* Rival prompt — concrete next goal toward the promotion zone (Tonal pattern) */}
      {youInPromo && rival && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
          padding: '11px 13px', borderRadius: 14,
          background: 'linear-gradient(90deg, #EAF6E2, #DCEFD2)', border: `1px solid #CEE2C0`,
          boxShadow: '0 2px 0 #CEE2C0',
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: SPROUT.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>⬆️</div>
          <div style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 800, color: SPROUT.ink, lineHeight: 1.3 }}>
            <b style={{ color: SPROUT.greenDark }}>{gapToPass} XP</b> to pass {rival.name} into the promotion zone
          </div>
        </div>
      )}

      {/* Leaderboard — full standings (ranks 4 down; top 3 are on the podium). 
          Encouragement-only: no demotion zone, no red loss framing, bottom as welcome as top. */}
      <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.mute, letterSpacing: 0.6, textTransform: 'uppercase', margin: '0 2px 8px' }}>Everyone growing this week</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {players.map((p, i) => {
          const rank = i + 1;
          if (rank <= 3) return null; // shown on the podium
          return (
            <React.Fragment key={p.name + i}>
              {rank === 4 && <ZoneDivider tone="promote" text="Promotion to Aurora"/>}
              <LeagueRow rank={rank} name={p.name} xp={p.xp} isYou={p.isYou} zone="neutral" mood={p.mood}/>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 800, color: SPROUT.mute, marginTop: 12, lineHeight: 1.4 }}>
        Everyone here is growing 🌱 — no one drops a league. Climb if you like, at your own pace.
      </div>
    </ScreenScaffold>
  );
}

Object.assign(window, { LeagueScreen, LeagueResults, SKY_TIERS, TierGlyph, TierLadder });
