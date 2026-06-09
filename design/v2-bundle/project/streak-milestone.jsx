// ─────────────────────────────────────────────────────────────
// Streak milestone moment — full-screen celebration at 7 / 30 / 100 / 365 days.
// Garden-themed escalation: sprout → flowering bush → tree → mighty oak.
// Includes a shareable card surface (Sprout's first share moment).
// Reuses the Lesson Complete celebration vocabulary.
// ─────────────────────────────────────────────────────────────

// Escalating plant SVG. tier: 'sprout' | 'bush' | 'tree' | 'oak'
function MilestonePlant({ tier = 'sprout', size = 200 }) {
  const soil = '#C68A5B';
  const soilDark = '#A66E43';
  const stem = '#5C9E47';
  const leaf = '#6FBF5E';
  const leafDark = '#4D9E3F';
  const bloom = '#F47A7A';
  const bloomSun = '#F5B94A';

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ display: 'block' }}>
      {/* soil mound */}
      <ellipse cx="100" cy="176" rx="62" ry="16" fill={soilDark}/>
      <ellipse cx="100" cy="172" rx="62" ry="14" fill={soil}/>

      {tier === 'sprout' && (
        <g>
          <path d="M100 172 V128" stroke={stem} strokeWidth="7" strokeLinecap="round"/>
          <path d="M100 140 q-26 -6 -34 -26 q26 -2 34 18z" fill={leaf}/>
          <path d="M100 134 q26 -8 34 -28 q-26 -2 -34 20z" fill={leafDark}/>
        </g>
      )}

      {tier === 'bush' && (
        <g>
          <path d="M100 172 V120" stroke={stem} strokeWidth="8" strokeLinecap="round"/>
          <path d="M100 150 q-30 -8 -40 -30 q30 -2 40 22z" fill={leaf}/>
          <path d="M100 142 q30 -10 40 -32 q-30 -2 -40 24z" fill={leafDark}/>
          <circle cx="100" cy="104" r="30" fill={leaf}/>
          <circle cx="78" cy="116" r="20" fill={leafDark}/>
          <circle cx="122" cy="116" r="20" fill={leafDark}/>
          <circle cx="100" cy="100" r="9" fill={bloom}/>
          <circle cx="84" cy="112" r="7" fill={bloomSun}/>
          <circle cx="118" cy="110" r="7" fill={bloomSun}/>
        </g>
      )}

      {tier === 'tree' && (
        <g>
          <path d="M100 174 V96" stroke={soilDark} strokeWidth="14" strokeLinecap="round"/>
          <path d="M100 130 q-22 -4 -30 -20" stroke={soilDark} strokeWidth="8" fill="none" strokeLinecap="round"/>
          <circle cx="100" cy="80" r="44" fill={leaf}/>
          <circle cx="66" cy="98" r="28" fill={leafDark}/>
          <circle cx="134" cy="98" r="28" fill={leafDark}/>
          <circle cx="100" cy="64" r="30" fill={leaf}/>
          <circle cx="86" cy="74" r="8" fill={bloomSun}/>
          <circle cx="116" cy="86" r="8" fill={bloom}/>
          <circle cx="100" cy="100" r="7" fill={bloomSun}/>
        </g>
      )}

      {tier === 'oak' && (
        <g>
          <path d="M100 176 V90" stroke={soilDark} strokeWidth="20" strokeLinecap="round"/>
          <path d="M100 132 q-30 -6 -40 -28" stroke={soilDark} strokeWidth="11" fill="none" strokeLinecap="round"/>
          <path d="M100 120 q32 -6 42 -30" stroke={soilDark} strokeWidth="11" fill="none" strokeLinecap="round"/>
          <circle cx="100" cy="66" r="52" fill={leafDark}/>
          <circle cx="58" cy="86" r="32" fill={leaf}/>
          <circle cx="142" cy="86" r="32" fill={leaf}/>
          <circle cx="100" cy="48" r="36" fill={leaf}/>
          <circle cx="80" cy="60" r="8" fill={bloomSun}/>
          <circle cx="122" cy="64" r="8" fill={bloom}/>
          <circle cx="100" cy="86" r="8" fill={bloomSun}/>
          <circle cx="64" cy="96" r="7" fill={bloom}/>
          <circle cx="136" cy="98" r="7" fill={bloomSun}/>
        </g>
      )}
    </svg>
  );
}

// Each tier GRANTS something tangible (escalating) + leaves a collectible bloom in the Garden.
const MILESTONES = {
  7:   { tier: 'sprout', label: 'a sprout',         gems: 20,
        reward: { icon: '💧', tint: '#5BA8C8', text: '+5 bonus water' },
        collectible: 'Seven-day sprout', pip: 'cheer', pipSize: 78,
        pipLine: 'Seven days! I\u2019m so proud of you 🌱', blurb: 'One week of steady growth.' },
  30:  { tier: 'bush',   label: 'a flowering bush', gems: 50,
        reward: { icon: '🌱', tint: '#7FB85C', text: 'A special seed' },
        collectible: 'Monthly bloom', pip: 'cheer', pipSize: 84,
        pipLine: 'A whole month together — look at us bloom!', blurb: 'A whole month of growing.' },
  100: { tier: 'tree',   label: 'a strong tree',    gems: 150,
        reward: { icon: '🌟', tint: '#E6A93B', text: 'A golden plant' },
        collectible: 'Golden plant', pip: 'proud', pipSize: 92,
        pipLine: 'One hundred days. You\u2019re unstoppable now 🌿', blurb: 'A hundred days. Deep roots now.' },
  365: { tier: 'oak',    label: 'a mighty oak',     gems: 500,
        reward: { icon: '🌳', tint: '#4D9E3F', text: 'A one-of-a-kind year tree' },
        collectible: 'Year tree', pip: 'proud', pipSize: 100,
        pipLine: 'A full year! So proud to grow with you 🌳', blurb: 'A full year. Your garden is legendary.' },
};

// Visualises THIS run of the streak — day-drops for short streaks, a filling
// week/heatmap grid for long ones (Numo-style "see your consistency").
function StreakDots({ days, calm }) {
  const fill = calm ? SPROUT.green : SPROUT.sun;
  const cell = (i, w, h, r) => (
    <div key={i} style={{
      width: w, height: h, borderRadius: r, background: fill, flexShrink: 0,
      boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.10)',
      animation: `smDrop .32s cubic-bezier(.2,.9,.3,1.4) ${0.5 + i * 0.018}s both`,
    }}/>
  );

  // ≤10 days → a row of water-drops
  if (days <= 10) {
    return (
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {Array.from({ length: days }).map((_, i) =>
          cell(i, 16, 20, '50% 50% 50% 50% / 62% 62% 40% 40%'))}
      </div>
    );
  }

  // ≤40 days → a month-style grid of day cells
  if (days <= 40) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 5 }}>
          {Array.from({ length: days }).map((_, i) => cell(i, 14, 14, 4))}
        </div>
        <div style={{ fontSize: 12, fontWeight: 800, color: SPROUT.mute }}>{days} days grown 🌿</div>
      </div>
    );
  }

  // longer → one cell per week, filling in
  const weeks = Math.round(days / 7);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 1fr)', gap: 4, maxWidth: 290 }}>
        {Array.from({ length: weeks }).map((_, i) => cell(i, 13, 13, 4))}
      </div>
      <div style={{ fontSize: 12, fontWeight: 800, color: SPROUT.mute }}>{weeks} weeks grown 🌿</div>
    </div>
  );
}

function StreakMilestone({ days = 30, calm = false, onContinue, onShare }) {
  const m = MILESTONES[days] || MILESTONES[30];
  const [showConfetti, setShowConfetti] = React.useState(!calm);
  const [shared, setShared] = React.useState(false);

  React.useEffect(() => {
    if (typeof haptic === 'function' && !calm) haptic('success');
    const t = setTimeout(() => setShowConfetti(false), 2400);
    return () => clearTimeout(t);
  }, []);

  const handleShare = () => { setShared(true); if (onShare) onShare(); };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 45, background: calm ? '#F1F6EC' : SPROUT.bg, display: 'flex', flexDirection: 'column', fontFamily: '"Nunito", system-ui', overflow: 'hidden' }}>
      <style>{`
        @keyframes smPop { 0%{transform:scale(.4) translateY(20px);opacity:0} 55%{transform:scale(1.08) translateY(0)} 100%{transform:scale(1);opacity:1} }
        @keyframes smRise { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes smFall { 0%{transform:translateY(-30px) rotate(0);opacity:0} 12%{opacity:1} 100%{transform:translateY(620px) rotate(400deg);opacity:0} }
        @keyframes smSway { 0%,100%{transform:rotate(-1.5deg)} 50%{transform:rotate(1.5deg)} }
        @keyframes smRays { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
        @keyframes smDrop { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
      `}</style>

      {/* sun rays behind plant */}
      <div style={{ position: 'absolute', top: 210, left: '50%', width: 560, height: 560, transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
        <div style={{
          width: '100%', height: '100%', borderRadius: '50%', opacity: calm ? 0.4 : 0.7,
          animation: 'smRays 70s linear infinite',
          background: `repeating-conic-gradient(from 0deg, ${SPROUT.sun}26 0 9deg, transparent 9deg 18deg)`,
          maskImage: 'radial-gradient(circle, transparent 8%, black 22%, black 46%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(circle, transparent 8%, black 22%, black 46%, transparent 72%)',
        }}/>
      </div>

      {/* confetti */}
      {showConfetti && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {Array.from({ length: 28 }).map((_, i) => {
            const colors = ['#F5B94A', '#6FBF5E', '#F47A7A', '#A8D8EA', '#C9B8E3'];
            return <div key={i} style={{
              position: 'absolute', left: `${(i * 31) % 100}%`, top: 0,
              width: 9, height: 9, borderRadius: i % 2 ? '50%' : 2,
              background: colors[i % colors.length],
              animation: `smFall ${2.2 + (i % 5) * 0.4}s linear ${(i % 7) * 0.16}s infinite`,
            }}/>;
          })}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '34px 24px 0', position: 'relative', overflowY: 'auto' }}>
        <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1.4, textTransform: 'uppercase', color: SPROUT.mute, marginBottom: 4, animation: 'smRise .5s both' }}>Streak milestone</div>

        {/* plant */}
        <div style={{ animation: 'smPop .7s cubic-bezier(.2,.9,.3,1.25) both', transformOrigin: 'bottom center' }}>
          <div style={{ animation: 'smSway 4s ease-in-out infinite', transformOrigin: 'bottom center' }}>
            <MilestonePlant tier={m.tier} size={138}/>
          </div>
        </div>

        {/* day count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 2, animation: 'smRise .5s .2s both' }}>
          <div style={{ animation: 'scFlame 1.3s ease-in-out infinite' }}><Icon.Flame size={26} color={SPROUT.sun}/></div>
          <div style={{ fontSize: 44, fontWeight: 900, color: SPROUT.ink, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{days}</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: SPROUT.mute, alignSelf: 'flex-end', marginBottom: 5 }}>days</div>
        </div>

        <div style={{ fontSize: 21, fontWeight: 900, color: SPROUT.ink, marginTop: 10, lineHeight: 1.2, maxWidth: 300, animation: 'smRise .5s .3s both' }}>
          {calm ? `Your garden grew into ${m.label}` : `Your garden is ${days} days strong!`}
        </div>

        {/* streak made visual — this run, dot by dot */}
        <div style={{ marginTop: 14, animation: 'smRise .5s .4s both' }}>
          <StreakDots days={days} calm={calm}/>
        </div>

        {/* Pip, centre-stage, with milestone-specific encouragement */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 16, animation: 'smRise .5s .48s both' }}>
          <div style={{ flexShrink: 0, animation: 'smSway 3.4s ease-in-out infinite', transformOrigin: 'bottom center' }}>
            <Pip size={m.pipSize} mood={m.pip} wave/>
          </div>
          <div style={{ position: 'relative', background: SPROUT.paper, border: `2px solid ${SPROUT.line}`, borderRadius: 14, padding: '9px 13px', maxWidth: 196, textAlign: 'left', boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, marginBottom: 8 }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: SPROUT.ink, lineHeight: 1.3 }}>{m.pipLine}</div>
            <div style={{ position: 'absolute', left: -8, bottom: 13, width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderRight: `9px solid ${SPROUT.line}` }}/>
            <div style={{ position: 'absolute', left: -5, bottom: 13, width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderRight: '9px solid #fff' }}/>
          </div>
        </div>

        {/* tangible, tier-escalating rewards + the collectible that lands in the Garden */}
        <div style={{ display: 'flex', gap: 9, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center', animation: 'smRise .5s .56s both' }}>
          {!calm && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14, padding: '8px 12px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}` }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#5B8DEF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Gem size={16} color="#fff"/></div>
              <span style={{ fontSize: 14.5, fontWeight: 900, color: SPROUT.ink }}>+{m.gems} gems</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14, padding: '8px 12px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}` }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: m.reward.tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 15 }}>{m.reward.icon}</span></div>
            <span style={{ fontSize: 14.5, fontWeight: 900, color: SPROUT.ink }}>{m.reward.text}</span>
          </div>
        </div>

        {/* collectible note — it lives on in your Garden */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 11, padding: '5px 12px', borderRadius: 999, background: '#F0E7D4', animation: 'smRise .5s .62s both' }}>
          <Icon.Leaf size={13} color={SPROUT.greenDark}/>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: SPROUT.greenDark }}>“{m.collectible}” added to your Garden</span>
        </div>
      </div>

      {/* footer actions */}
      <div style={{ flexShrink: 0, padding: '12px 20px 30px', display: 'flex', flexDirection: 'column', gap: 10, animation: 'smRise .5s .55s both' }}>
        <button onClick={handleShare} style={{
          width: '100%', cursor: 'pointer', fontFamily: 'inherit',
          background: SPROUT.paper, color: SPROUT.greenDark, fontSize: 16, fontWeight: 900,
          letterSpacing: 0.3, borderRadius: 16, padding: '13px 0',
          border: `2px solid ${SPROUT.green}`, boxShadow: `0 3px 0 ${SPROUT.green}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Icon.Share size={19} color={SPROUT.greenDark}/>
          {shared ? 'Card ready to share' : 'Share my garden'}
        </button>
        <button onClick={onContinue} style={{
          width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          background: SPROUT.green, color: '#fff', fontSize: 17, fontWeight: 900,
          letterSpacing: 0.4, textTransform: 'uppercase', borderRadius: 16, padding: '15px 0',
          boxShadow: `0 4px 0 ${SPROUT.greenShadow}`,
        }}>Keep growing</button>
      </div>

      {/* share card preview overlay */}
      {shared && (
        <ShareCardOverlay days={days} tier={m.tier} onClose={() => setShared(false)}/>
      )}
    </div>
  );
}

// Shareable card — the surface the Share button generates.
function ShareCardOverlay({ days, tier, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(40,32,22,0.55)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24,
      animation: 'smRise .25s both',
    }}>
      {/* the card */}
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: 300, borderRadius: 24, overflow: 'hidden',
        background: `linear-gradient(160deg, #FCE9C0, #F8D9E0)`,
        boxShadow: '0 18px 40px rgba(0,0,0,0.3)', border: '5px solid #fff',
      }}>
        <div style={{ padding: '26px 22px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Icon.Leaf size={18} color={SPROUT.greenDark}/>
            <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', color: SPROUT.greenDark }}>Sprout</span>
          </div>
          <MilestonePlant tier={tier} size={150}/>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 2 }}>
            <Icon.Flame size={26} color={SPROUT.sun}/>
            <span style={{ fontSize: 46, fontWeight: 900, color: '#5A3E22', lineHeight: 1 }}>{days}</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#7A5B36', marginTop: 2, marginBottom: 18 }}>day streak 🌱</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 18, width: '100%', maxWidth: 300 }}>
        <button onClick={onClose} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: 'rgba(255,255,255,0.9)', color: SPROUT.ink, fontSize: 14, fontWeight: 900, borderRadius: 13, padding: '12px 0' }}>Close</button>
        <button onClick={onClose} style={{ flex: 2, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: SPROUT.green, color: '#fff', fontSize: 14, fontWeight: 900, borderRadius: 13, padding: '12px 0', boxShadow: `0 3px 0 ${SPROUT.greenShadow}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <Icon.Share size={16} color="#fff"/> Share image
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { StreakMilestone, MilestonePlant, ShareCardOverlay, StreakDots, MILESTONES });
