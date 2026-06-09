// ─────────────────────────────────────────────────────────────
// Golden Bloom mastery — the endgame "Legendary", garden-reskinned.
// After a unit's lessons are all done, its trailing node offers a gold
// "Make it bloom" challenge: a harder replay (no hints, tighter pace,
// mixed exercises) that costs currency. Pass → the node turns gold for
// good + a rare Golden Bloom + bonus gems. Fail → gentle, calm-friendly.
// ─────────────────────────────────────────────────────────────

const GOLD = { face: '#F2C84B', dark: '#D9A22B', deep: '#B8841C', glow: '#FCEBB6', ink: '#6B4E12' };

// Sparkle decoration used around the gold elements.
function Sparkle({ size = 14, color = '#fff', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      <path d="M12 2c1 5.5 3.5 8 9 9-5.5 1-8 3.5-9 9-1-5.5-3.5-8-9-9 5.5-1 8-3.5 9-9z" fill={color}/>
    </svg>
  );
}

// Tier palettes for the graded bloom (Bronze → Silver → Gold).
const BLOOM_TIERS = {
  bronze: { key: 'bronze', label: 'Bronze', face: '#D89B6A', dark: '#B06E3C', deep: '#8A5226', glow: '#F2D7BE', ink: '#6E3F18', need: 'Pass the run' },
  silver: { key: 'silver', label: 'Silver', face: '#C9D2DC', dark: '#9AA6B4', deep: '#7C8A99', glow: '#EDF1F5', ink: '#4A5560', need: '90%+ correct' },
  gold:   { key: 'gold',   label: 'Gold',   face: '#F4C84B', dark: '#D9A323', deep: '#B7841A', glow: '#FBEFC4', ink: '#7A5A12', need: 'A flawless run' },
};
function tierFor(accuracy) {
  if (accuracy >= 1) return 'gold';
  if (accuracy >= 0.9) return 'silver';
  return 'bronze';
}

// The gold flower medallion — the trophy/visual anchor for the whole feature.
// `tier` (bronze|silver|gold) tints it; falls back to gold when lit.
function GoldenBloomMedal({ size = 150, lit = true, tier }) {
  const tp = tier ? BLOOM_TIERS[tier] : null;
  const petal = lit ? (tp ? tp.face : GOLD.face) : '#D8D2C4';
  const petalDeep = lit ? (tp ? tp.dark : GOLD.dark) : '#BDB6A6';
  const center = lit ? (tp ? tp.deep : GOLD.deep) : '#A59E8D';
  const glow = lit ? (tp ? tp.glow : GOLD.glow) : '#C9C2B2';
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: 'block' }}>
      <g transform="translate(60 60)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
          <g key={i} transform={`rotate(${a})`}>
            <ellipse cx="0" cy="-34" rx="15" ry="24" fill={i % 2 ? petalDeep : petal}/>
          </g>
        ))}
        <circle r="22" fill={center}/>
        <circle r="22" fill="none" stroke={glow} strokeWidth="2"/>
        {lit && <Sparkle size={20} color={glow} style={{ transform: 'translate(-10px,-10px)' }}/>}
      </g>
    </svg>
  );
}

// ── Gate: tapping the gold node opens this. Cost + rules + start. ──
function GoldenBloomGate({ unit = {}, gems = 420, cans = 1, calm = false, weakWords = ['morning', 'please', 'water', 'thank you', 'goodbye', 'coffee'], onStart, onClose }) {
  const cost = 40;
  const canAfford = gems >= cost || cans >= 1;
  const focus = weakWords.slice(0, 6);
  const rules = [
    { icon: '🚫', label: 'No multiple-choice hints' },
    { icon: '⏱️', label: calm ? 'A brisker pace' : 'Tighter timer on every question' },
    { icon: '🔀', label: 'Mixed exercises from the whole unit' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(40,32,14,0.55)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', fontFamily: '"Nunito", system-ui' }} onClick={onClose}>
      <style>{`@keyframes gbUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: SPROUT.bg, borderTopLeftRadius: 26, borderTopRightRadius: 26,
        padding: '10px 22px 30px', animation: 'gbUp .32s cubic-bezier(.2,.8,.2,1) both',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.25)',
      }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: SPROUT.cream2, margin: '0 auto 14px' }}/>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ position: 'relative', filter: `drop-shadow(0 6px 14px ${GOLD.dark}66)` }}>
            <GoldenBloomMedal size={104}/>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, padding: '3px 10px', borderRadius: 999, background: GOLD.glow, color: GOLD.ink, fontSize: 11, fontWeight: 900, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            <Sparkle size={12} color={GOLD.dark}/> Golden Bloom
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: SPROUT.ink, marginTop: 10 }}>Master “{unit.title || 'this unit'}”</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: SPROUT.mute, marginTop: 6, maxWidth: 290, lineHeight: 1.4 }}>
            One harder run to make this unit bloom gold at the top of your path — and unlock what’s next.
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, padding: '5px 12px', borderRadius: 999, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, fontSize: 12.5, fontWeight: 800, color: SPROUT.greenDark }}>
            🔓 Unlocks the next unit on your path
          </div>
        </div>

        {/* Personalized review — targets the words you struggled with this unit */}
        {focus.length > 0 && (
          <div style={{ background: '#FFF7E6', borderRadius: 16, border: `1px solid ${GOLD.face}`, padding: '12px 14px 13px', margin: '16px 0 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
              <Sparkle size={13} color={GOLD.dark}/>
              <span style={{ fontSize: 12.5, fontWeight: 900, color: '#8A6A1E' }}>We’ll focus on the {focus.length} words you found tricky</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {focus.map((w) => (
                <span key={w} style={{ background: SPROUT.paper, border: `1px solid ${GOLD.face}`, borderRadius: 999, padding: '4px 10px', fontSize: 12.5, fontWeight: 800, color: '#7A5A12' }}>{w}</span>
              ))}
            </div>
          </div>
        )}

        {/* rules */}
        <div style={{ background: SPROUT.paper, borderRadius: 16, border: `1px solid ${SPROUT.line}`, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, padding: '6px 14px', margin: '18px 0 14px' }}>
          {rules.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 0', borderTop: i === 0 ? 'none' : `1px solid ${SPROUT.line}` }}>
              <span style={{ fontSize: 17, width: 22, textAlign: 'center' }}>{r.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: SPROUT.ink }}>{r.label}</span>
            </div>
          ))}
        </div>

        {/* tiered reward — earn a higher bloom for a cleaner run (replay value) */}
        <div style={{ margin: '14px 0 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.7, textAlign: 'center', marginBottom: 9 }}>Earn a higher bloom for a cleaner run</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['bronze', 'silver', 'gold'].map((k) => {
              const tp = BLOOM_TIERS[k];
              return (
                <div key={k} style={{ flex: 1, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14, padding: '10px 6px 9px', textAlign: 'center', boxShadow: `0 2px 0 ${SPROUT.cardShadow}` }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}><GoldenBloomMedal size={36} tier={k}/></div>
                  <div style={{ fontSize: 12.5, fontWeight: 900, color: tp.ink, marginTop: 3 }}>{tp.label}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: SPROUT.mute, marginTop: 1 }}>{tp.need}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA with cost */}
        <button onClick={canAfford ? onStart : undefined} style={{
          width: '100%', border: 'none', cursor: canAfford ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
          background: canAfford ? GOLD.face : '#E2DAC9', color: canAfford ? GOLD.ink : SPROUT.mute,
          fontSize: 16, fontWeight: 900, letterSpacing: 0.3, borderRadius: 16, padding: '15px 0',
          boxShadow: canAfford ? `0 4px 0 ${GOLD.dark}` : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
        }}>
          Make it bloom
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 999, background: 'rgba(0,0,0,0.12)', fontSize: 13 }}>
            <Icon.Gem size={14} color={GOLD.ink}/> {cost}
          </span>
        </button>
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12.5, fontWeight: 700, color: SPROUT.mute }}>
          or spend 1 watering can · you have {cans}
        </div>
      </div>
    </div>
  );
}

// ── Result: pass = gold celebration, fail = gentle retry. ──
function GoldenBloomResult({ outcome = 'pass', unit = {}, calm = false, earned = 2, total = 8, accuracy = 1, tier, onContinue, onRetry, onViewCollection }) {
  const pass = outcome === 'pass';
  const grade = pass ? (tier || tierFor(accuracy)) : null;
  const tp = grade ? BLOOM_TIERS[grade] : GOLD;
  const canUpgrade = pass && grade !== 'gold';
  const nextTier = grade === 'bronze' ? BLOOM_TIERS.silver : grade === 'silver' ? BLOOM_TIERS.gold : null;
  const [confetti, setConfetti] = React.useState(pass && !calm);
  const [share, setShare] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setConfetti(false), 2600); return () => clearTimeout(t); }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: pass ? '#FBF4DE' : SPROUT.bg, display: 'flex', flexDirection: 'column', fontFamily: '"Nunito", system-ui', overflow: 'hidden' }}>
      <style>{`
        @keyframes gbPop{0%{transform:scale(.4) rotate(-12deg);opacity:0}55%{transform:scale(1.12) rotate(4deg)}100%{transform:scale(1) rotate(0);opacity:1}}
        @keyframes gbRise{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes gbFall{0%{transform:translateY(-30px) rotate(0);opacity:0}12%{opacity:1}100%{transform:translateY(620px) rotate(420deg);opacity:0}}
        @keyframes gbSpin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
      `}</style>

      {pass && (
        <div style={{ position: 'absolute', top: 200, left: '50%', width: 520, height: 520, transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', opacity: 0.7, animation: 'gbSpin 60s linear infinite',
            background: `repeating-conic-gradient(from 0deg, ${tp.glow} 0 8deg, transparent 8deg 16deg)`,
            maskImage: 'radial-gradient(circle, transparent 14%, black 26%, black 48%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 14%, black 26%, black 48%, transparent 70%)' }}/>
        </div>
      )}
      {confetti && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {Array.from({ length: 26 }).map((_, i) => {
            const colors = [tp.face, tp.dark, '#fff', '#F5B94A', '#E6C25A'];
            return <div key={i} style={{ position: 'absolute', left: `${(i * 33) % 100}%`, top: 0, width: 9, height: 9, borderRadius: i % 2 ? '50%' : 2, background: colors[i % colors.length], animation: `gbFall ${2.2 + (i % 5) * 0.4}s linear ${(i % 7) * 0.16}s infinite` }}/>;
          })}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '54px 26px 0', position: 'relative' }}>
        <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1.4, textTransform: 'uppercase', color: pass ? tp.dark : SPROUT.mute, marginBottom: 10, animation: 'gbRise .5s both' }}>
          {pass ? `${tp.label} Bloom earned` : 'Almost there'}
        </div>

        <div style={{ animation: 'gbPop .7s cubic-bezier(.2,.9,.3,1.25) both', filter: pass ? `drop-shadow(0 8px 18px ${tp.dark}77)` : 'none', position: 'relative' }}>
          <GoldenBloomMedal size={172} lit={pass} tier={grade}/>
          {pass && (
            <div style={{
              position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
              background: `linear-gradient(180deg, ${tp.face}, ${tp.dark})`, color: tp.ink,
              fontSize: 12, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase',
              padding: '4px 16px', borderRadius: 999, border: '2px solid #fff',
              boxShadow: `0 3px 8px ${tp.dark}66`, whiteSpace: 'nowrap',
            }}>{tp.label} · Mastered</div>
          )}
        </div>
        <div style={{ marginTop: 16, animation: 'gbRise .5s .2s both' }}><Pip size={76} mood={pass ? 'proud' : 'happy'}/></div>

        <div style={{ fontSize: 24, fontWeight: 900, color: SPROUT.ink, marginTop: 10, lineHeight: 1.15, maxWidth: 310, animation: 'gbRise .5s .3s both' }}>
          {pass ? `“${unit.title || 'Unit'}” is ${grade === 'gold' ? 'golden' : grade}!` : 'So close — give it one more go'}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: SPROUT.mute, marginTop: 8, maxWidth: 290, lineHeight: 1.4, animation: 'gbRise .5s .38s both' }}>
          {pass
            ? `This unit now blooms ${grade} on your path, and a ${tp.label} Bloom joined your garden.`
            : (calm ? "No pressure — your progress is safe. Try again whenever you like." : 'You kept your place — no streak lost. Want another attempt?')}
        </div>

        {/* recap line — what made this a cut above a normal completion */}
        {pass && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 12, padding: '7px 13px', borderRadius: 999, background: SPROUT.paper, border: `1px solid ${tp.face}`, boxShadow: `0 2px 0 ${tp.face}66`, animation: 'gbRise .5s .42s both' }}>
            <Sparkle size={13} color={tp.dark}/>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: tp.ink }}>
              {Math.round(accuracy * 100)}% correct · {grade === 'gold' ? 'flawless — no hints, beat the timer' : 'no hints, beat the timer'}
            </span>
          </div>
        )}

        {/* upgrade hint — come back to raise a bronze/silver bloom to gold (replay value) */}
        {canUpgrade && nextTier && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 9, padding: '6px 13px', borderRadius: 999, background: nextTier.glow, animation: 'gbRise .5s .46s both' }}>
            <GoldenBloomMedal size={18} tier={nextTier.key}/>
            <span style={{ fontSize: 12, fontWeight: 800, color: nextTier.ink }}>Replay for {nextTier.need.toLowerCase()} → a {nextTier.label} Bloom</span>
          </div>
        )}

        {pass && (
          <div style={{ display: 'flex', gap: 10, marginTop: 20, animation: 'gbRise .5s .46s both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14, padding: '9px 13px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}` }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: tp.face, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkle size={16} color={tp.ink}/></div>
              <span style={{ fontSize: 15, fontWeight: 900, color: SPROUT.ink }}>{tp.label} Bloom</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14, padding: '9px 13px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}` }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: '#5B8DEF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Gem size={18} color="#fff"/></div>
              <span style={{ fontSize: 15, fontWeight: 900, color: SPROUT.ink }}>+60 gems</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ flexShrink: 0, padding: '12px 20px 30px', display: 'flex', flexDirection: 'column', gap: 10, animation: 'gbRise .5s .55s both' }}>
        {!pass && (
          <button onClick={onRetry} style={{ width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: GOLD.face, color: GOLD.ink, fontSize: 16, fontWeight: 900, borderRadius: 16, padding: '14px 0', boxShadow: `0 4px 0 ${GOLD.dark}` }}>Try again</button>
        )}
        {pass && (
          <React.Fragment>
            {/* Share — mastery is the most share-worthy moment (Drops/OLIO pattern) */}
            <button onClick={() => setShare(true)} style={{
              width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: `linear-gradient(180deg, ${GOLD.face}, ${GOLD.dark})`, color: GOLD.ink, fontSize: 16, fontWeight: 900,
              borderRadius: 16, padding: '14px 0', boxShadow: `0 4px 0 ${GOLD.dark}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            }}>
              <Icon.Share size={17} color={GOLD.ink}/> Share my Golden Bloom 🌸
            </button>
            {/* Collection link — turns one win into a drive to gold the whole set (OLIO) */}
            <button onClick={onViewCollection || onContinue} style={{
              width: '100%', border: `2px solid ${GOLD.face}`, cursor: 'pointer', fontFamily: 'inherit',
              background: SPROUT.paper, color: '#8A6A1E', fontSize: 14, fontWeight: 900,
              borderRadius: 16, padding: '12px 0',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              View your Golden Blooms
              <span style={{ fontSize: 12, fontWeight: 900, color: GOLD.ink, background: GOLD.glow, borderRadius: 999, padding: '2px 9px' }}>{earned} / {total} units</span>
            </button>
          </React.Fragment>
        )}
        <button onClick={onContinue} style={{
          width: '100%', border: pass ? 'none' : `2px solid ${SPROUT.line}`, cursor: 'pointer', fontFamily: 'inherit',
          background: pass ? SPROUT.green : '#fff', color: pass ? '#fff' : SPROUT.mute, fontSize: 17, fontWeight: 900,
          letterSpacing: 0.4, textTransform: 'uppercase', borderRadius: 16, padding: '15px 0',
          boxShadow: pass ? `0 4px 0 ${SPROUT.greenShadow}` : 'none',
        }}>{pass ? 'Keep growing' : 'Maybe later'}</button>
      </div>

      {share && <BloomShareOverlay unit={unit} onClose={() => setShare(false)}/>}
    </div>
  );
}

// Shareable Golden Bloom card — the rarest thing a learner earns.
function BloomShareOverlay({ unit = {}, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 70, background: 'rgba(40,32,12,0.6)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24,
      animation: 'gbRise .25s both',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: 300, borderRadius: 24, overflow: 'hidden',
        background: `linear-gradient(165deg, #FCEFC4, #F7DFA0)`,
        boxShadow: '0 18px 40px rgba(0,0,0,0.35)', border: '5px solid #fff', position: 'relative',
      }}>
        {/* rays behind the medal */}
        <div style={{ position: 'absolute', top: 96, left: '50%', width: 360, height: 360, transform: 'translate(-50%,-50%)', pointerEvents: 'none',
          background: `repeating-conic-gradient(from 0deg, rgba(255,255,255,.5) 0 7deg, transparent 7deg 14deg)`,
          maskImage: 'radial-gradient(circle, transparent 18%, black 30%, transparent 62%)',
          WebkitMaskImage: 'radial-gradient(circle, transparent 18%, black 30%, transparent 62%)' }}/>
        <div style={{ padding: '24px 22px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Icon.Leaf size={17} color={SPROUT.greenDark}/>
            <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', color: SPROUT.greenDark }}>Sprout</span>
          </div>
          <div style={{ filter: `drop-shadow(0 6px 14px ${GOLD.dark}66)` }}><GoldenBloomMedal size={140} lit={true}/></div>
          <div style={{ marginTop: 12, fontSize: 11, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase', color: GOLD.dark }}>Golden Bloom</div>
          <div style={{ fontSize: 21, fontWeight: 900, color: '#6A4E12', lineHeight: 1.15, marginTop: 3 }}>{unit.title ? `“${unit.title}” mastered` : 'Unit mastered'}</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#9A7A2E', marginTop: 4 }}>no hints · beat the timer 🌸</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 18, width: '100%', maxWidth: 300 }}>
        <button onClick={onClose} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: 'rgba(255,255,255,0.9)', color: SPROUT.ink, fontSize: 14, fontWeight: 900, borderRadius: 13, padding: '12px 0' }}>Close</button>
        <button onClick={onClose} style={{ flex: 2, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: `linear-gradient(180deg, ${GOLD.face}, ${GOLD.dark})`, color: GOLD.ink, fontSize: 14, fontWeight: 900, borderRadius: 13, padding: '12px 0', boxShadow: `0 3px 0 ${GOLD.dark}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <Icon.Share size={16} color={GOLD.ink}/> Share image
        </button>
      </div>
    </div>
  );
}

// Small counter for the Me/Garden blooms area: "Golden Blooms 2 / 8 units".
function GoldenBloomCounter({ earned = 2, total = 8 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: `linear-gradient(100deg, ${GOLD.glow}, #FFF7E2)`, border: `1px solid ${GOLD.face}`, borderRadius: 16, padding: '12px 14px', boxShadow: `0 2px 0 ${GOLD.face}66` }}>
      <div style={{ flexShrink: 0, filter: `drop-shadow(0 3px 6px ${GOLD.dark}44)` }}><GoldenBloomMedal size={44}/></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: GOLD.ink }}>Golden Blooms</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#9A7A2E' }}>Master a whole unit to earn one</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, flexShrink: 0 }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: GOLD.ink, fontVariantNumeric: 'tabular-nums' }}>{earned}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#B89A52' }}>/ {total}</span>
      </div>
    </div>
  );
}

Object.assign(window, { GoldenBloomGate, GoldenBloomResult, GoldenBloomCounter, GoldenBloomMedal, BloomShareOverlay, Sparkle, GOLD, BLOOM_TIERS, tierFor });
