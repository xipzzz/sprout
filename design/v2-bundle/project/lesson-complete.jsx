// Lesson complete screen — reward + stats + streak
function LessonComplete({ tweaks = {}, onContinue, onReview, firstLesson = false, words, accuracy: accProp }) {
  const { calm } = tweaks;
  const [xp, setXp] = React.useState(0);
  const [accuracy, setAccuracy] = React.useState(0);
  const [showConfetti, setShowConfetti] = React.useState(true);
  const [spoke, setSpoke] = React.useState(null);
  const [showStreakBeat, setShowStreakBeat] = React.useState(false); // streak unfolds as a 2nd beat
  const [goalFill, setGoalFill] = React.useState(false); // daily-goal bar animates forward on mount

  // Today's garden goal — this lesson visibly advances the day's target ("one more" nudge).
  const goalTotal = 5;
  const goalBefore = 2;     // waterings before this lesson
  const goalAfter = 3;      // after the win that just landed
  const goalMet = goalAfter >= goalTotal;

  // the vocab grown this session — reinforced at the moment of accomplishment
  const learned = words || ['morning', 'coffee', 'please'];
  const targetAcc = accProp != null ? accProp : 92;
  // A flawless run grows a bonus Golden Bloom — ties perfection to the Golden Bloom mechanic.
  const flawless = !firstLesson && targetAcc >= 100;

  // Adaptive praise — the headline + tone follow how the lesson went, garden-flavoured.
  // "In full bloom" (no misses) · "Steady grower" (solid) · "Needs a little water" (struggled).
  const tier = targetAcc >= 100 ? 'bloom' : targetAcc >= 80 ? 'steady' : 'water';
  const praise = {
    bloom:  { std: 'In full bloom! 🌸', calm: 'In full bloom', subStd: 'A perfect run — every answer right. Pip is beaming.', subCalm: 'Not a single miss. Lovely, careful growing.' },
    steady: { std: 'Steady grower 🌱', calm: 'Steady growth', subStd: 'Solid work — your garden’s coming along nicely.', subCalm: 'A good, steady session. Pip is glad you stopped by.' },
    water:  { std: 'Needs a little water 💧', calm: 'A little more water', subStd: 'Tricky one! A quick review will help it bloom.', subCalm: 'Some tough ones — that’s how roots grow deeper.' },
  }[tier];
  const headline = firstLesson
    ? (calm ? 'Your first sprout' : 'Your first sprout! 🌱')
    : (calm ? praise.calm : praise.std);
  const subline = firstLesson
    ? (calm ? 'A seed is planted. Come back tomorrow to help it grow.' : 'You planted your first seed — your garden has begun!')
    : (calm ? praise.subCalm : praise.subStd);

  // Garden-tier label for the accuracy card — same data, more emotionally legible.
  const accTier = targetAcc >= 95 ? 'Lush' : targetAcc >= 80 ? 'Healthy' : 'Sprouting';

  // Itemized reward ledger — shows the math so the seed total feels earned, not handed out.
  // Always sums to the 15-seed total; bonuses scale with how the run went.
  const ledger = tier === 'bloom'
    ? [{ label: 'Correct', val: 10 }, { label: 'Flawless bonus', val: 5 }]
    : tier === 'steady'
    ? [{ label: 'Correct', val: 12 }, { label: 'Good pace', val: 3 }]
    : [{ label: 'Correct', val: 15 }];
  const ledgerTotal = ledger.reduce((s, x) => s + x.val, 0);


  // roll up XP + accuracy on mount
  React.useEffect(() => {
    if (typeof haptic === 'function') haptic(calm ? 'light' : 'success');
    if (typeof sproutSound === 'function') sproutSound('complete');
    let x = 0, a = 0;
    const targetXp = 15;
    const iv = setInterval(() => {
      x = Math.min(targetXp, x + 1);
      a = Math.min(targetAcc, a + 4);
      setXp(x);
      setAccuracy(a);
      if (x >= targetXp && a >= targetAcc) clearInterval(iv);
    }, 40);
    const t = setTimeout(() => setShowConfetti(false), 2000);
    // The streak/seedling-grows moment lands as a distinct second beat, after the tiles settle.
    const tb = setTimeout(() => setShowStreakBeat(true), 1300);
    // Daily-goal bar fills forward once the seed total has landed.
    const gf = setTimeout(() => setGoalFill(true), 900);
    return () => { clearInterval(iv); clearTimeout(t); clearTimeout(tb); clearTimeout(gf); };
  }, [targetAcc]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: calm ? '#F1F6EC' : SPROUT.bg, color: SPROUT.ink, fontFamily: '"Nunito", system-ui', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes scBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes scBreathe { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-2px) scale(1.015); } }
        @keyframes scPop { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes scConfetti { 0% { transform: translateY(-20px) rotate(0); opacity: 1; } 100% { transform: translateY(560px) rotate(720deg); opacity: 0; } }
        @keyframes scSunRays { 0% { transform: rotate(0); } 100% { transform: rotate(360deg); } }
        @keyframes scFlame { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @keyframes scLeafFall { 0% { transform: translateY(-10px) rotate(-10deg); opacity: 0; } 20% { opacity: 0.7; } 100% { transform: translateY(560px) rotate(40deg); opacity: 0; } }
        @keyframes scHaloPulse { 0%,100% { transform: translate(-50%, -50%) scale(1); opacity: 0.35; } 50% { transform: translate(-50%, -50%) scale(1.06); opacity: 0.5; } }
      `}</style>

      {/* Background atmosphere — celebratory sun rays for standard, soft breathing halo for calm */}
      {!calm ? (
        <div style={{
          position: 'absolute', top: 260, left: '50%', width: 620, height: 620,
          transform: 'translate(-50%, -50%)', pointerEvents: 'none',
        }}>
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%', opacity: 0.6,
            animation: 'scSunRays 60s linear infinite',
            background: `repeating-conic-gradient(from 0deg, ${SPROUT.sun}22 0 10deg, transparent 10deg 20deg)`,
            maskImage: 'radial-gradient(circle, transparent 0%, black 15%, black 45%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 0%, black 15%, black 45%, transparent 75%)',
          }}/>
        </div>
      ) : (
        <div style={{
          position: 'absolute', top: 270, left: '50%', width: 460, height: 460,
          borderRadius: '50%', pointerEvents: 'none',
          background: `radial-gradient(circle, ${SPROUT.green}1F 0%, transparent 65%)`,
          animation: 'scHaloPulse 6s ease-in-out infinite',
        }}/>
      )}

      {/* Particles — confetti for standard, slow falling leaves for calm */}
      {!calm && showConfetti && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {Array.from({ length: 24 }).map((_, i) => {
            const colors = [SPROUT.green, SPROUT.sun, SPROUT.coral, SPROUT.sky, SPROUT.lilac];
            const color = colors[i % colors.length];
            const left = (i * 37) % 380;
            const delay = (i * 0.08) % 1.2;
            const dur = 1.6 + (i % 5) * 0.2;
            const shape = i % 3;
            return (
              <div key={i} style={{
                position: 'absolute', top: 80, left,
                width: shape === 0 ? 8 : 10, height: shape === 0 ? 8 : 14,
                background: color,
                borderRadius: shape === 0 ? '50%' : 2,
                animation: `scConfetti ${dur}s ease-out ${delay}s forwards`,
              }}/>
            );
          })}
        </div>
      )}
      {calm && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {Array.from({ length: 8 }).map((_, i) => {
            const left = 30 + (i * 47) % 340;
            const delay = (i * 0.9) % 6;
            const dur = 7 + (i % 3) * 1.5;
            return (
              <div key={i} style={{
                position: 'absolute', top: 60, left,
                animation: `scLeafFall ${dur}s ease-in ${delay}s infinite`,
              }}>
                <Icon.Leaf size={14} color={SPROUT.green}/>
              </div>
            );
          })}
        </div>
      )}

      {/* close */}
      <div style={{ padding: `${LAYOUT.safeTop}px ${LAYOUT.padX}px 0`, display: 'flex', position: 'relative', zIndex: 2 }}>
        <button style={{ border: 'none', background: 'transparent', fontSize: 22, color: SPROUT.mute, cursor: 'pointer', padding: 0, lineHeight: 1 }}>×</button>
      </div>

      {/* hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px 8px', position: 'relative', zIndex: 2, overflowY: 'auto' }}>
        <div style={{ animation: calm ? 'scBreathe 4s ease-in-out infinite' : 'scBounce 1.6s ease-in-out infinite' }}>
          <Pip size={140} mood={calm ? 'sleepy' : 'cheer'} wave={!calm}/>
        </div>
        <div style={{
          fontSize: calm ? 28 : 34, fontWeight: 900, marginTop: 12,
          color: calm ? SPROUT.greenDark : SPROUT.sunShadow,
          letterSpacing: -0.5, textAlign: 'center',
          animation: 'scPop 400ms ease-out both',
        }}>{headline}</div>
        <div style={{ fontSize: calm ? 14 : 15, fontWeight: calm ? 600 : 700, color: SPROUT.mute, marginTop: 4, textAlign: 'center', lineHeight: 1.4, maxWidth: 280 }}>
          {subline}
        </div>

        {/* Reward ledger — the math behind the seeds, so the total feels earned (standard only). */}
        {!calm && !firstLesson && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 6,
            width: '100%', marginTop: 22, fontSize: 12, fontWeight: 800,
            animation: 'scPop 500ms ease-out both',
          }}>
            {ledger.map((it, i) => (
              <React.Fragment key={it.label}>
                {i > 0 && <span style={{ color: SPROUT.mute }}>+</span>}
                <span style={{ background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 999, padding: '4px 10px', color: SPROUT.ink }}>
                  {it.label} <b style={{ color: SPROUT.sunShadow }}>+{it.val}</b>
                </span>
              </React.Fragment>
            ))}
            <span style={{ color: SPROUT.mute }}>=</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FFF2DC', border: '1px solid #F5D699', borderRadius: 999, padding: '4px 11px', color: '#8B5E12' }}>
              <b>{ledgerTotal}</b> seeds 🌱
            </span>
          </div>
        )}

        {/* stat tiles — garden-framed: Seeds earned · Bloom rate · Days grown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, width: '100%', marginTop: calm || firstLesson ? 28 : 14 }}>
          <StatTile label="Seeds" value={`+${xp}`} color={SPROUT.sun} shadow={SPROUT.sunShadow} icon={<svg width="22" height="22" viewBox="0 0 24 24"><path d="M12 2l3 6.5 7 1-5 5 1.2 7L12 18l-6.2 3.5L7 14.5l-5-5 7-1L12 2z" fill="#fff"/></svg>}/>
          <StatTile label="Bloom rate" sub={accuracy >= targetAcc ? accTier : null} value={`${accuracy}%`} color={SPROUT.green} shadow={SPROUT.greenShadow} icon={<Icon.Check size={22} color="#fff"/>}/>
          <StatTile label={calm ? 'Days grown' : 'Streak'} value={firstLesson ? '1' : (calm ? '34' : '13')} unit="day" color={calm ? SPROUT.greenDark : SPROUT.coral} shadow={calm ? '#2E5B29' : '#C85555'} icon={calm ? <Icon.Leaf size={22} color="#fff"/> : <div style={{ animation: 'scFlame 1.2s ease-in-out infinite' }}><Icon.Flame size={22} color="#fff"/></div>}/>
        </div>

        {/* Today's garden goal — the win you just earned advances the day's target (non-calm; calm hides goals) */}
        {!calm && (
          <div style={{
            marginTop: 14, padding: '11px 14px', width: '100%',
            background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14,
            boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: SPROUT.greenDark, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon.Leaf size={14} color={SPROUT.green}/> Today's garden
              </span>
              <span style={{ fontSize: 12, fontWeight: 900, color: goalMet ? SPROUT.greenDark : SPROUT.mute }}>
                {goalMet ? 'Goal met! 🌸' : `${goalAfter}/${goalTotal} watered`}
              </span>
            </div>
            <div style={{ height: 10, borderRadius: 999, background: SPROUT.cream2, overflow: 'hidden', position: 'relative' }}>
              {/* the portion already banked before this lesson */}
              <div style={{ position: 'absolute', inset: 0, width: `${(goalBefore / goalTotal) * 100}%`, background: '#CDEBC0', borderRadius: 999 }}/>
              {/* this lesson's contribution animates in on top */}
              <div style={{
                position: 'absolute', inset: 0,
                width: `${((goalFill ? goalAfter : goalBefore) / goalTotal) * 100}%`,
                background: `linear-gradient(90deg, ${SPROUT.green}, #8FD46F)`,
                borderRadius: 999, transition: 'width .7s cubic-bezier(.2,.8,.2,1)',
              }}/>
            </div>
          </div>
        )}

        {/* Flawless run → a bonus Golden Bloom grew. Perfection makes something special, not just +XP. */}
        {flawless && (
          <div style={{
            marginTop: 14, padding: '13px 15px', width: '100%',
            background: 'linear-gradient(135deg, #FFF6DF 0%, #FCEFC7 100%)',
            border: '1.5px solid #F0C964', borderRadius: 16,
            boxShadow: '0 3px 0 #E3B24A',
            display: 'flex', alignItems: 'center', gap: 12,
            animation: 'scPop 600ms ease-out both',
          }}>
            <div style={{ width: 46, height: 46, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: -2, borderRadius: '50%', background: `radial-gradient(circle, ${SPROUT.sun}55 0%, transparent 70%)`, animation: 'scHaloPulse 2.4s ease-in-out infinite' }}/>
              <Icon.Flower size={40} color="#E0A21C"/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: '#8B5E12', lineHeight: 1.15 }}>Flawless — a Golden Bloom grew! 🌟</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#A2762A', marginTop: 1 }}>Not a single miss. That perfect run earned a rare bloom.</div>
            </div>
          </div>
        )}
        <div style={{
          width: '100%',
          opacity: showStreakBeat ? 1 : 0,
          transform: showStreakBeat ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity .45s ease, transform .45s cubic-bezier(.2,.8,.2,1)',
        }}>
        {!calm && (
          <div style={{
            marginTop: 18, padding: '10px 14px', background: '#FFF2DC',
            border: `1px solid #F5D699`, borderRadius: 14,
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
          }}>
            <Icon.Flame size={22} color={SPROUT.sun}/>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#8B5E12', flex: 1 }}>
              {firstLesson
                ? <>You're on a <b>1-day streak</b> — come back tomorrow to keep it growing!</>
                : <>Streak now <b>13 days</b> — your longest yet. Keep it alive!</>}
            </div>
          </div>
        )}
        {calm && (
          <div style={{
            marginTop: 18, padding: '10px 14px', background: '#EFF7EA',
            border: `1px solid #CEE2C0`, borderRadius: 14,
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
          }}>
            <Icon.Leaf size={22} color={SPROUT.greenDark}/>
            <div style={{ fontSize: 13, fontWeight: 700, color: SPROUT.greenDark, flex: 1 }}>
              Pip grew a little more today. 🌱 No streak pressure here.
            </div>
          </div>
        )}
        </div>
        {/* You learned — word recap; cements the session's vocab (with audio) */}
        <div style={{
          marginTop: 14, padding: '12px 14px', width: '100%',
          background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 16,
          boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
        }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: SPROUT.greenDark, marginBottom: 9, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon.Leaf size={15} color={SPROUT.green}/> You grew {learned.length} new words
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {learned.map((w, i) => (
              <button key={w} onClick={() => { setSpoke(i); setTimeout(() => setSpoke(s => s === i ? null : s), 600); }} style={{
                display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: 'inherit',
                background: SPROUT.cream, border: `1px solid ${SPROUT.line}`, borderRadius: 999,
                padding: '6px 11px 6px 12px', fontSize: 13.5, fontWeight: 800, color: SPROUT.ink,
              }}>
                {w}
                <span style={{
                  width: 20, height: 20, borderRadius: '50%', background: SPROUT.green, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: spoke === i ? 'scale(1.2)' : 'scale(1)', transition: 'transform .15s',
                }}><Icon.Volume size={11} color="#fff"/></span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* footer */}
      <div style={{ padding: '14px 16px 28px', background: SPROUT.paper, borderTop: `1px solid ${SPROUT.line}`, position: 'relative', zIndex: 2 }}>
        <PushButton size="lg" color={SPROUT.green} shadow={SPROUT.greenShadow} style={{ width: '100%' }} onClick={onContinue}>Continue</PushButton>
        <button onClick={onReview} style={{
          width: '100%', marginTop: 10, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 14, fontWeight: 800, color: SPROUT.mute, letterSpacing: 0.3, padding: '4px 0',
        }}>Review this lesson</button>
      </div>
    </div>
  );
}

function StatTile({ label, value, unit, color, shadow, icon, sub }) {
  return (
    <div style={{ background: shadow, borderRadius: 16 }}>
      <div style={{
        background: color, borderRadius: 16, padding: '10px 8px', marginTop: -3,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      }}>
        <div style={{ fontSize: 11, fontWeight: 900, color: '#fff', opacity: 0.95, textTransform: 'uppercase', letterSpacing: 0.9 }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          {icon && <div style={{ alignSelf: 'center' }}>{icon}</div>}
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
          {unit && <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', opacity: 0.75 }}>{unit}</div>}
        </div>
        {sub && <div style={{ fontSize: 10, fontWeight: 900, color: '#fff', opacity: 0.92, textTransform: 'uppercase', letterSpacing: 0.6, background: 'rgba(255,255,255,0.22)', borderRadius: 999, padding: '1px 7px', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

Object.assign(window, { LessonComplete });
