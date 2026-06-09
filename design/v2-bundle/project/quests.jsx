// ─────────────────────────────────────────────────────────────
// Daily Garden Tasks (Quests) — dedicated bottom-nav tab.
// 2–3 daily goals, each with a distinct garden reward (seed / watering
// can / sun), a refresh timer, a seed-chest overview, per-quest claim,
// and a "Claim all" affordance when several complete at once.
// ─────────────────────────────────────────────────────────────

// Distinct reward glyphs tied to the garden economy (simple shapes only).
function RewardIcon({ kind, size = 26 }) {
  if (kind === 'seed') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24">
        <path d="M12 3c4 3 6 6.5 6 10a6 6 0 0 1-12 0c0-3.5 2-7 6-10z" fill="#7FB85C"/>
        <path d="M12 6.5c2.4 2 3.6 4.2 3.6 6.5a3.6 3.6 0 0 1-3.6 3.6z" fill="#9AD06F" opacity="0.7"/>
      </svg>
    );
  }
  if (kind === 'can') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24">
        <path d="M4 10h11v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-7z" fill="#6FBF5E"/>
        <path d="M15 11l5-3v3l-5 2z" fill="#6FBF5E"/>
        <rect x="7" y="6" width="6" height="3" rx="1.5" fill="#4D9E3F"/>
        <circle cx="20.5" cy="7" r="1.3" fill="#A8D8EA"/>
        <circle cx="22" cy="9.5" r="1" fill="#A8D8EA"/>
      </svg>
    );
  }
  // sun
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="5" fill="#F5B94A"/>
      {[0,45,90,135,180,225,270,315].map((a) => (
        <rect key={a} x="11.2" y="1.5" width="1.6" height="3.5" rx="0.8" fill="#F5B94A"
          transform={`rotate(${a} 12 12)`}/>
      ))}
    </svg>
  );
}

// Weekly checkpoint ladder — a longer arc than the daily reset, with chests
// along the way toward a marquee reward. (Numo "reward progress" pattern.)
function WeeklyLadder({ calm }) {
  const goalXP = 500, curXP = 320;
  const pct = Math.min(100, (curXP / goalXP) * 100);
  const stops = [
    { at: 125, icon: '💧', label: '+5 water' },
    { at: 250, icon: '💎', label: '+20 gems' },
    { at: 375, icon: '🌱', label: 'Seed' },
    { at: 500, icon: '🌸', label: 'Rare Bloom', marquee: true },
  ];
  return (
    <div style={{
      background: SPROUT.paper, borderRadius: 18, padding: '16px 16px 14px', border: `1px solid ${SPROUT.line}`,
      boxShadow: `0 3px 0 ${SPROUT.cardShadow}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 16 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: '#F6ECD3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <BloomFlower level={4} color={SPROUT.sun} size={38}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 900 }}>Earn 500 XP this week</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>Grow a Rare Bloom 🌸{calm ? '' : ' · 4 days left'}</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 900, color: SPROUT.sunShadow, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{curXP}<span style={{ color: SPROUT.mute, fontSize: 11 }}>/{goalXP}</span></div>
      </div>
      {/* track with checkpoint chests */}
      <div style={{ position: 'relative', height: 10, borderRadius: 6, background: SPROUT.cream2, marginBottom: 30 }}>
        <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, height: '100%', borderRadius: 6, background: `linear-gradient(90deg, ${SPROUT.green}, ${SPROUT.sun})`, transition: 'width .5s' }}/>
        {stops.map((s) => {
          const reached = curXP >= s.at;
          const left = (s.at / goalXP) * 100;
          return (
            <div key={s.at} style={{ position: 'absolute', top: '50%', left: `${left}%`, transform: 'translate(-50%,-50%)' }}>
              <div style={{
                width: s.marquee ? 30 : 24, height: s.marquee ? 30 : 24, borderRadius: 9, fontSize: s.marquee ? 16 : 13,
                background: reached ? (s.marquee ? SPROUT.sun : '#EFF7EA') : '#fff',
                border: `2px solid ${reached ? (s.marquee ? SPROUT.sunShadow : SPROUT.green) : SPROUT.line}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: reached ? 1 : 0.55,
                boxShadow: reached ? '0 2px 0 rgba(0,0,0,0.08)' : 'none',
              }}>{reached ? s.icon : '🔒'}</div>
              <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 4, whiteSpace: 'nowrap', fontSize: 9.5, fontWeight: 800, color: s.marquee ? SPROUT.sunShadow : SPROUT.mute }}>{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuestsScreen({ tweaks, tab, onTab, onStreakTap, onStartLesson, onWaterTap, onGemsTap }) {
  const calm = tweaks.calm;
  const [cheered, setCheered] = React.useState(false);
  // Co-op shared quest — promoted to the headline of the Quests tab.
  const coopYou = 19, coopFriend = 15, coopGoal = 50;
  const coopTotal = coopYou + coopFriend;
  const initial = [
    { id: 'q1', kind: 'seed', title: 'Plant a lesson', desc: 'Complete your next lesson', cur: 1, goal: 1, reward: '+1 water' },
    { id: 'q2', kind: 'can',  title: 'Steady hand',    desc: 'Get 5 answers in a row correct', cur: 5, goal: 5, reward: '+10 XP' },
    { id: 'q3', kind: 'sun',  title: 'Bright bloom',   desc: 'Score 90% in any lesson', cur: 0, goal: 1, reward: '+2 water' },
  ];
  const [claimed, setClaimed] = React.useState({});
  const [burst, setBurst] = React.useState(null); // id mid-claim

  const isComplete = (q) => q.cur >= q.goal;
  const claimableIds = initial.filter((q) => isComplete(q) && !claimed[q.id]).map((q) => q.id);
  const doneCount = initial.filter((q) => isComplete(q)).length;

  const claim = (id) => {
    setBurst(id);
    setTimeout(() => { setClaimed((c) => ({ ...c, [id]: true })); setBurst(null); }, 460);
  };
  const claimAll = () => claimableIds.forEach((id, i) => setTimeout(() => claim(id), i * 120));

  return (
    <ScreenScaffold tweaks={tweaks} tab={tab} onTab={onTab} onStreakTap={onStreakTap} onWaterTap={onWaterTap} onGemsTap={onGemsTap}>
      <style>{`
        @keyframes qPop { 0%{transform:scale(1)} 40%{transform:scale(1.18)} 100%{transform:scale(1)} }
        @keyframes qChestShake { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-6deg)} 75%{transform:rotate(6deg)} }
      `}</style>

      <div style={{ fontSize: 24, fontWeight: 900, margin: '0 4px 16px' }}>{calm ? 'Garden tasks' : 'Quests'}</div>

      {/* Co-op quest — promoted to the headline of the Quests tab. */}
      <div style={{ margin: '0 0 22px' }}>
        <SectionTitle>Grow together</SectionTitle>
        <div style={{
          background: 'linear-gradient(135deg, #EFF7EA, #E7F1FA)', borderRadius: 18, padding: 16,
          border: `1px solid ${SPROUT.line}`, boxShadow: '0 3px 0 #D6E2D0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 13 }}>
            <div style={{ display: 'flex' }}>
              <Avatar name="You" hue={SPROUT.green} size={40}/>
              <div style={{ marginLeft: -11 }}><Avatar name="Maya" hue="#A8D8EA" size={40}/></div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15.5, fontWeight: 900 }}>You + Maya</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>Grow 50 lessons together this week</div>
            </div>
            <span style={{ fontSize: 24 }}>🌻</span>
          </div>

          {/* Shared contribution bar — two-tone split by who did what */}
          <div style={{ height: 16, borderRadius: 9, background: SPROUT.paper, overflow: 'hidden', display: 'flex', border: `1px solid ${SPROUT.line}` }}>
            <div style={{ width: `${(coopYou / coopGoal) * 100}%`, height: '100%', background: SPROUT.green, transition: 'width .4s' }}/>
            <div style={{ width: `${(coopFriend / coopGoal) * 100}%`, height: '100%', background: SPROUT.sky, transition: 'width .4s' }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, fontWeight: 800 }}>
            <span style={{ color: SPROUT.greenDark }}>● You {coopYou}</span>
            <span style={{ color: '#5B9CB8' }}>Maya {coopFriend} ●</span>
            <span style={{ color: SPROUT.mute }}>{coopTotal} of {coopGoal}</span>
          </div>

          <button onClick={() => setCheered(true)} disabled={cheered} style={{
            width: '100%', marginTop: 13, border: 'none', cursor: cheered ? 'default' : 'pointer', fontFamily: 'inherit',
            background: cheered ? SPROUT.cream2 : SPROUT.sun, color: cheered ? SPROUT.mute : '#5B3E07',
            fontSize: 14, fontWeight: 900, borderRadius: 12, padding: '11px 0',
            boxShadow: cheered ? 'none' : `0 3px 0 ${SPROUT.sunShadow}`,
          }}>{cheered ? 'Cheer sent to Maya 👏' : 'Cheer Maya 👏'}</button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 2px 10px' }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: SPROUT.mute, letterSpacing: 1, textTransform: 'uppercase' }}>{calm ? 'Garden tasks' : 'Daily tasks'}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: SPROUT.mute }}>
          {calm ? 'Whenever you like' : 'Refreshes in 8h 12m 🌙'}
        </span>
      </div>
      {/* Chest overview */}
      <div style={{
        background: '#EFF7EA', borderRadius: 18, padding: 16, marginBottom: 20,
        border: `1px solid ${SPROUT.line}`, boxShadow: '0 3px 0 #CEE2C0',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{ animation: doneCount === initial.length ? 'qChestShake .8s ease-in-out infinite' : 'none' }}>
          <Icon.Chest size={50}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 900 }}>Seed chest</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute, marginBottom: 7 }}>
            {doneCount} of {initial.length} tasks done
          </div>
          <div style={{ height: 9, borderRadius: 5, background: '#D6E8CC', overflow: 'hidden' }}>
            <div style={{ width: `${(doneCount / initial.length) * 100}%`, height: '100%', borderRadius: 5, background: SPROUT.green, transition: 'width .4s' }}/>
          </div>
        </div>
      </div>

      {/* Claim all */}
      {claimableIds.length >= 2 && (
        <button onClick={claimAll} style={{
          width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          background: SPROUT.sun, color: '#5B3E07', fontSize: 15, fontWeight: 900,
          borderRadius: 14, padding: '13px 0', marginBottom: 14,
          boxShadow: `0 3px 0 ${SPROUT.sunShadow}`, letterSpacing: 0.3,
        }}>Claim all {claimableIds.length} rewards</button>
      )}

      {/* Quest list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {initial.map((q) => {
          const complete = isComplete(q);
          const isClaimed = claimed[q.id];
          return (
            <div key={q.id} style={{
              background: SPROUT.paper, borderRadius: 16, padding: '13px 14px',
              border: `1px solid ${isClaimed ? SPROUT.line : complete ? '#CEE2C0' : SPROUT.line}`,
              boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, display: 'flex', alignItems: 'center', gap: 13,
              opacity: isClaimed ? 0.6 : 1, transition: 'opacity .3s',
            }}>
              <div style={{
                width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                background: complete ? '#EFF7EA' : SPROUT.cream,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: burst === q.id ? 'qPop .46s ease' : 'none',
              }}>
                <RewardIcon kind={q.kind} size={28}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 900 }}>{q.title}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: SPROUT.greenDark }}>{q.reward}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute, marginBottom: 7 }}>{q.desc}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 7, borderRadius: 4, background: SPROUT.cream2, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (q.cur / q.goal) * 100)}%`, height: '100%', borderRadius: 4, background: complete ? SPROUT.green : SPROUT.sun, transition: 'width .4s' }}/>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: SPROUT.mute, fontVariantNumeric: 'tabular-nums' }}>{Math.min(q.cur, q.goal)}/{q.goal}</span>
                </div>
              </div>
              {complete && !isClaimed && (
                <button onClick={() => claim(q.id)} style={{
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                  background: SPROUT.green, color: '#fff', fontSize: 13, fontWeight: 900,
                  borderRadius: 10, padding: '9px 14px', boxShadow: `0 2px 0 ${SPROUT.greenShadow}`,
                }}>Claim</button>
              )}
              {isClaimed && (
                <div style={{ flexShrink: 0, color: SPROUT.greenDark }}><Icon.Check size={22} color={SPROUT.greenDark}/></div>
              )}
              {!complete && (
                <button onClick={() => onStartLesson && onStartLesson({ title: q.title, queue: ['ex-mc', 'ex-fill', 'ex-arrange'] })} style={{
                  border: `1.5px solid ${SPROUT.line}`, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                  background: SPROUT.paper, color: SPROUT.greenDark, fontSize: 13, fontWeight: 900,
                  borderRadius: 10, padding: '9px 13px',
                }}>Go</button>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 22 }}>
        <SectionTitle>This week</SectionTitle>
        <WeeklyLadder calm={calm}/>
      </div>
    </ScreenScaffold>
  );
}

Object.assign(window, { QuestsScreen });
