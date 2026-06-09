// ─────────────────────────────────────────────────────────────
// VARIATION C — "Today card" (minimal, anti-anxiety)
// One hero lesson at a time + a condensed path below. Focus on
// removing FOMO and overwhelm. Mascot encourages, doesn't nag.
// ─────────────────────────────────────────────────────────────
// Circular daily-goal ring — pays off the goal chosen in onboarding
// (Casual 5 / Regular 10 / Serious 15 / Intense 20). Fills as XP is earned,
// flips to a celebratory "Goal met" state at 100%.
function GoalRing({ xp, goal, size = 66, calm }) {
  const pct = Math.max(0, Math.min(1, xp / goal));
  const met = xp >= goal;
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const ringColor = met ? SPROUT.sun : SPROUT.green;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={SPROUT.cream} strokeWidth="8"/>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ringColor} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.3,.8,.3,1)' }}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
        {met ? (
          <span style={{ fontSize: size * 0.42 }}>🌱</span>
        ) : (
          <React.Fragment>
            <span style={{ fontSize: size * 0.27, fontWeight: 900, color: SPROUT.ink }}>{xp}</span>
            <span style={{ fontSize: size * 0.16, fontWeight: 800, color: SPROUT.mute }}>/ {goal}</span>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

// Daily-goal celebration — fired when today's goal RING closes. Distinct from
// lesson-complete (smaller) and a streak milestone (bigger): a gentle "garden
// tended today" moment in Finch's habit-framing tone, tied to a weekly bloom ring.
function DailyGoalCelebration({ goal = 20, weekDone = 4, calm, onClose }) {
  const reduce = (typeof reduceMotionOn === 'function') && reduceMotionOn();
  React.useEffect(() => { if (typeof haptic === 'function' && !calm) haptic('success'); if (typeof sproutSound === 'function') sproutSound('goal'); }, []);
  const weekTotal = 7;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 55, fontFamily: '"Nunito", system-ui',
      background: `linear-gradient(180deg, ${SPROUT.green} 0%, ${SPROUT.greenDark} 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', padding: '0 30px' }}>
      <style>{`@keyframes dgcPetal { 0% { transform: translateY(-10px) rotate(0); opacity: 0; } 12% { opacity: 1; } 100% { transform: translateY(360px) rotate(var(--r)); opacity: 0; } }
        @keyframes dgcPop { 0% { transform: scale(.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }`}</style>
      {/* falling petals/leaves — calm, garden-themed (skipped under reduce-motion) */}
      {!reduce && Array.from({ length: 14 }).map((_, i) => (
        <span key={i} aria-hidden style={{ position: 'absolute', top: -10, left: `${(i * 7 + 5) % 100}%`, fontSize: 16 + (i % 3) * 5,
          ['--r']: `${(i % 2 ? 1 : -1) * 220}deg`, animation: `dgcPetal ${2400 + (i % 5) * 400}ms ease-in ${i * 130}ms infinite` }}>{['🌸', '🍃', '🌼'][i % 3]}</span>
      ))}
      <div style={{ animation: reduce ? 'none' : 'dgcPop 500ms cubic-bezier(.3,1.5,.5,1) both' }}>
        <Pip size={104} mood="cheer" wave={true}/>
      </div>
      <div style={{ fontSize: 25, fontWeight: 900, marginTop: 16, lineHeight: 1.15 }}>You’ve tended your<br/>garden today 🌱</div>
      <div style={{ fontSize: 16, fontWeight: 800, opacity: 0.92, marginTop: 8 }}>{goal} / {goal} XP · daily goal met</div>
      <div style={{ fontSize: 13.5, fontWeight: 700, opacity: 0.82, marginTop: 6, maxWidth: 280 }}>
        Little by little, you’re planting the seeds of a habit.
      </div>

      {/* weekly "in bloom" ring — ties the daily close to ongoing growth */}
      <div style={{ marginTop: 24, background: 'rgba(255,255,255,0.16)', borderRadius: 18, padding: '14px 18px', width: '100%', maxWidth: 300 }}>
        <div style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.6, opacity: 0.85, marginBottom: 9 }}>This week in bloom</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 5 }}>
          {Array.from({ length: weekTotal }).map((_, i) => {
            const filled = i < weekDone;
            const today = i === weekDone - 1;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: filled ? '#fff' : 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, border: today ? '2px solid #fff' : 'none' }}>
                  {filled ? '🌸' : ''}
                </div>
                <span style={{ fontSize: 9.5, fontWeight: 800, opacity: 0.8 }}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 800, marginTop: 10, opacity: 0.92 }}>{weekDone} of {weekTotal} days this week 🌸</div>
      </div>

      <button onClick={onClose} style={{ marginTop: 26, width: '100%', maxWidth: 300, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        background: '#fff', color: SPROUT.greenDark, fontSize: 16, fontWeight: 900, borderRadius: 16, padding: '15px 0' }}>
        {calm ? 'Lovely' : 'Keep growing 🌱'}
      </button>
    </div>
  );
}

function VariantC({ tweaks, onStartLesson, nav, onStreakTap, onWaterTap, onGemsTap }) {
  const { calm } = tweaks;
  const [localTab, setLocalTab] = React.useState('home');
  const [goalCeleb, setGoalCeleb] = React.useState(false);
  const [inboxOpen, setInboxOpen] = React.useState(false);
  const activeTab = nav ? nav.active : localTab;
  const onTab = nav ? nav.onChange : setLocalTab;
  const launch = onStartLesson || (() => {});

  // Today's progress — drives the goal ring, stats triplet, and streak nudge.
  const dailyGoal = calm ? 10 : 20;          // from onboarding (Casual 5 / Regular 10 / Serious 15 / Intense 20)
  const xpToday = 12;
  const wordsToday = 5;
  const minToday = 4;
  // Streak isn't secured until today's goal is met — show the nudge until then
  // (independent of xpToday so the demo state can surface it). Hidden in calm mode.
  const practicedToday = xpToday >= dailyGoal;
  const streakDays = calm ? 34 : 13;

  // Time-aware Pip greeting — shifts by the device clock so the daily open feels personal.
  const hour = new Date().getHours();
  const greeting = hour < 5 ? 'Up late, Alex'
    : hour < 12 ? 'Morning, Alex'
    : hour < 17 ? 'Afternoon, Alex'
    : hour < 21 ? 'Evening, Alex'
    : 'Night, Alex';
  const subline = calm ? "Let's grow a little today 🌱"
    : hour < 12 ? 'Ready to grow today? 🌱'
    : hour < 17 ? "Let's grow a little today 🌱"
    : practicedToday ? 'Lovely — your garden is watered 🌱' : 'One lesson keeps your streak 🔥';

  // Today's plan — a short, finishable 3-item checklist (Tangerine/Todoist).
  const plan = [
    { id: 'lesson', label: 'Finish today’s lesson', done: false, queue: lessonQueueFor({ kind: 'core' }), title: 'Numbers 1–20' },
    { id: 'words', label: 'Water 5 weak words', done: true, queue: ['ex-mc', 'ex-fill'], title: 'Review weak words' },
    { id: 'quest', label: 'Complete 1 quest', done: false, tab: 'quests' },
  ];
  const planDone = plan.filter(p => p.done).length;

  // Locally-completable plan rows — tapping the checkbox closes a row out with a
  // satisfying pop + strike-through, so the card visibly empties as you go (Brilliant).
  const [doneIds, setDoneIds] = React.useState(() => new Set(plan.filter(p => p.done).map(p => p.id)));
  const [justDone, setJustDone] = React.useState(null);
  const isDone = (p) => doneIds.has(p.id);
  const completeRow = (p) => {
    if (doneIds.has(p.id)) return;
    setDoneIds((s) => { const n = new Set(s); n.add(p.id); return n; });
    setJustDone(p.id);
    setTimeout(() => setJustDone((v) => (v === p.id ? null : v)), 700);
  };

  // Compact week strip — which days were practised this week (Mon→Sun, today = Thu).
  const week = [
    { d: 'M', done: true }, { d: 'T', done: true }, { d: 'W', done: true },
    { d: 'T', done: false, today: true }, { d: 'F', done: false }, { d: 'S', done: false }, { d: 'S', done: false },
  ];

  const warmups = [
    { t: '5 pairs', s: 'Match words',        bg: '#FEE9C8', ic: '🔗', queue: ['ex-match'] },
    { t: 'Listen',  s: 'Type what you hear', bg: '#DCF0E8', ic: '👂', queue: ['ex-hear'] },
    { t: 'Say it',  s: 'Speak out loud',     bg: '#FCD9D9', ic: '🎤', queue: ['ex-speak'] },
    { t: 'Review',  s: '3 weak words',       bg: '#E5DCF5', ic: '♻︎', queue: ['ex-mc', 'ex-fill', 'ex-arrange'] },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: SPROUT.bg, color: SPROUT.ink, fontFamily: '"Nunito", system-ui' }}>
      <TopBar tweaks={tweaks} onStreakTap={onStreakTap} onWaterTap={onWaterTap} onGemsTap={onGemsTap}/>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 16px 80px' }}>
        {/* Greeting + daily-goal ring */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0 4px 14px' }}>
          <div style={{ flex: '0 0 auto' }}><Pip size={44} mood="happy"/></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: SPROUT.mute, fontWeight: 700 }}>{greeting}</div>
            <div style={{ fontSize: 21, fontWeight: 800, lineHeight: 1.2, marginTop: 2 }}>{subline}</div>
          </div>
          {typeof InboxBell === 'function' && <InboxBell count={3} onClick={() => setInboxOpen(true)}/>}
          <button onClick={() => (xpToday >= dailyGoal ? setGoalCeleb(true) : (onStreakTap && onStreakTap()))} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }} aria-label="Daily goal">
            <GoalRing xp={xpToday} goal={dailyGoal} calm={calm}/>
            <span style={{ fontSize: 10, fontWeight: 900, color: xpToday >= dailyGoal ? SPROUT.sun : SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {xpToday >= dailyGoal ? 'Goal met!' : 'Daily goal'}
            </span>
          </button>
        </div>

        {/* Week strip — which days you practised this week; today highlighted */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 4px 14px' }}>
          {week.map((w, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: '100%', maxWidth: 34, aspectRatio: '1', borderRadius: 10,
                background: w.done ? SPROUT.green : w.today ? '#fff' : SPROUT.cream,
                border: w.today ? `2px dashed ${SPROUT.green}` : `1px solid ${w.done ? SPROUT.greenShadow : SPROUT.line}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: w.done ? `0 2px 0 ${SPROUT.greenShadow}` : 'none',
              }}>
                {w.done ? <Icon.Check size={15} color="#fff"/> : w.today ? <span style={{ width: 6, height: 6, borderRadius: 999, background: SPROUT.green }}/> : null}
              </div>
              <span style={{ fontSize: 10, fontWeight: 800, color: w.today ? SPROUT.greenDark : SPROUT.mute }}>{w.d}</span>
            </div>
          ))}
        </div>

        {/* Today so far — quick stats triplet (Memrise) + a warm Pip-voiced tail */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 4px 14px', fontSize: 12.5, fontWeight: 800, color: SPROUT.mute, flexWrap: 'wrap' }}>
          <span style={{ color: SPROUT.greenDark }}>Today</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>{xpToday} XP</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{wordsToday} words</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{minToday} min</span>
          {xpToday > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: SPROUT.greenDark }}>
              <span style={{ opacity: 0.4, color: SPROUT.mute }}>·</span>
              {practicedToday ? 'Pip’s so proud 🌱' : 'a lovely start 🌱'}
            </span>
          )}
        </div>

        {/* Streak-at-risk nudge — biggest daily-return lever; hidden once practiced or in calm mode */}
        {!calm && !practicedToday && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 14px',
            padding: '11px 13px', borderRadius: 14,
            background: 'linear-gradient(90deg, #FFF1DE, #FFE6CE)', border: '1px solid #F4D6B0',
          }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🔥</span>
            <div style={{ flex: 1, fontSize: 13.5, fontWeight: 800, color: '#8A5A1E', lineHeight: 1.3 }}>
              Practice by 9:00 PM to keep your {streakDays}-day streak — one lesson does it.
            </div>
          </div>
        )}

        {/* Today's plan — short, finishable checklist (ticks off as you go) */}
        <div style={{
          background: SPROUT.paper, borderRadius: 18, padding: '14px 14px 8px', marginBottom: 14,
          border: `1px solid ${SPROUT.line}`, boxShadow: `0 3px 0 ${SPROUT.cardShadow}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 900 }}>Today’s plan</div>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: doneIds.size === plan.length ? SPROUT.greenDark : SPROUT.mute, transition: 'color .3s' }}>
              {doneIds.size === plan.length ? 'All done 🌱' : `${doneIds.size} of ${plan.length} done`}
            </div>
          </div>
          <style>{`@keyframes planPop{0%{transform:scale(.6);opacity:.3}55%{transform:scale(1.18)}100%{transform:scale(1);opacity:1}}@keyframes planFlash{0%{background:rgba(88,204,66,.16)}100%{background:transparent}}`}</style>
          {plan.map((p, i) => {
            const done = isDone(p);
            const flashing = justDone === p.id;
            return (
            <div key={p.id}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '9px 6px', borderRadius: 10,
                borderTop: i === 0 ? 'none' : `1px solid ${SPROUT.cream}`,
                animation: flashing ? 'planFlash .7s ease both' : 'none',
              }}>
              {/* tappable checkbox — closes the row out with a pop */}
              <button onClick={() => completeRow(p)} aria-label={done ? 'Completed' : `Mark "${p.label}" done`} disabled={done} style={{
                width: 24, height: 24, borderRadius: 8, flexShrink: 0, padding: 0, cursor: done ? 'default' : 'pointer',
                background: done ? SPROUT.green : '#fff', border: `2px solid ${done ? SPROUT.green : SPROUT.line}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: flashing ? 'planPop .5s cubic-bezier(.3,1.3,.5,1) both' : 'none',
              }}>{done && <Icon.Check size={14} color="#fff"/>}</button>
              {/* label — also the action: tapping it launches the lesson/quest (unless done) */}
              <button onClick={() => { if (done) return; if (p.tab) onTab(p.tab); else launch({ title: p.title, queue: p.queue }); }}
                disabled={done} style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: 0, border: 'none', background: 'transparent',
                cursor: done ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'left',
              }}>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 800, color: done ? SPROUT.mute : SPROUT.ink, textDecoration: done ? 'line-through' : 'none', transition: 'color .3s' }}>{p.label}</span>
                {!done && <span style={{ fontSize: 13, fontWeight: 900, color: SPROUT.greenDark }}>›</span>}
              </button>
            </div>
            );
          })}
        </div>

        {/* Today's lesson — BIG card */}
        <div style={{
          background: SPROUT.paper, borderRadius: 24, padding: 18,
          boxShadow: '0 4px 0 #E8DFCE', border: `1px solid ${SPROUT.line}`,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* soft bg */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, #CFE8BE 0%, transparent 70%)' }}/>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: SPROUT.greenDark, letterSpacing: 1, textTransform: 'uppercase' }}>Today · Unit 1 · Lesson 4 of 6</div>
            <div style={{ flex: 1 }}/>
            <div style={{ fontSize: 12, color: SPROUT.mute, fontWeight: 700 }}>≈ 4 min</div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, position: 'relative' }}>Numbers 1–20</div>
          <div style={{ fontSize: 14, color: SPROUT.mute, marginTop: 4, position: 'relative' }}>You’ll learn 10–20 and counting things. Resume — 4 of 10 exercises done.</div>

          {/* progress strip — tied to the real 4/10 position */}
          <div style={{ marginTop: 14, height: 10, borderRadius: 6, background: SPROUT.cream, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '40%', background: `linear-gradient(90deg, ${SPROUT.green}, ${SPROUT.greenDark})`, borderRadius: 6 }}/>
          </div>

          {/* mascot + CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, position: 'relative' }}>
            <Pip size={64} mood="happy"/>
            <div style={{
              flex: 1, background: SPROUT.cream, borderRadius: 12, padding: '8px 12px',
              fontSize: 13, fontWeight: 700, color: SPROUT.ink,
              position: 'relative',
            }}>
              <span style={{ position: 'absolute', left: -6, top: 14, width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderRight: `6px solid ${SPROUT.cream}` }}/>
              "Pick whichever feels fun. No rush."
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <PushButton size="lg" color={SPROUT.green} shadow={SPROUT.greenShadow} style={{ flex: 1 }} onClick={() => launch({ title: 'Numbers 1–20', queue: lessonQueueFor({ kind: 'core' }) })}>Resume lesson</PushButton>
            <PushButton size="lg" color="#fff" shadow="#D9CEB6" textColor={SPROUT.ink} style={{ width: 56 }} onClick={() => launch({ title: 'Numbers · Listen', queue: ['ex-hear'] })}>
              <Icon.Play size={18} color={SPROUT.ink}/>
            </PushButton>
          </div>
        </div>

        {/* Smart "what's next" — a single state-based recommendation so it's never a dead-end */}
        {(() => {
          // pick by state: weak words due → review · streak at risk → quick lesson · else → a tale
          const rec = !practicedToday
            ? { ic: '🌱', t: 'Tend your garden', s: '5 weak words ready for a little water', q: ['ex-mc', 'ex-fill', 'ex-arrange'], title: 'Tend your garden' }
            : { ic: '☕', t: 'Try a Garden Tale', s: 'A short café story — listening practice', q: null, tale: true };
          return (
            <button onClick={() => rec.tale ? (nav && nav.openTale ? nav.openTale('cafe') : launch({ title: 'Garden Tale', queue: ['ex-hear'] })) : launch({ title: rec.title, queue: rec.q })} style={{
              width: '100%', textAlign: 'left', marginTop: 14, border: `1px solid ${SPROUT.line}`, cursor: 'pointer', fontFamily: 'inherit',
              background: SPROUT.paper, borderRadius: 18, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
            }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: SPROUT.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, flexShrink: 0 }}>{rec.ic}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10.5, fontWeight: 900, color: SPROUT.greenDark, textTransform: 'uppercase', letterSpacing: 0.5 }}>Then, if you like</div>
                <div style={{ fontSize: 15, fontWeight: 900 }}>{rec.t}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>{rec.s}</div>
              </div>
              <Icon.ChevR size={18} color={SPROUT.mute}/>
            </button>
          );
        })()}

        {/* Quick warmups row */}
        <div style={{ fontSize: 12, fontWeight: 800, color: SPROUT.mute, letterSpacing: 1, textTransform: 'uppercase', margin: '20px 4px 8px' }}>Quick warm-ups</div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '2px 2px 6px', margin: '0 -16px', paddingLeft: 16, paddingRight: 16 }} className="no-scrollbar">
          {warmups.map((c, i) => (
            <button key={i} onClick={() => launch({ title: c.t, queue: c.queue })} style={{
              minWidth: 140, background: c.bg, borderRadius: 16, padding: 12,
              border: `1px solid rgba(0,0,0,0.06)`, textAlign: 'left',
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <div style={{ fontSize: 24 }}>{c.ic}</div>
              <div style={{ fontSize: 14, fontWeight: 800, marginTop: 6 }}>{c.t}</div>
              <div style={{ fontSize: 11, color: SPROUT.mute, fontWeight: 700 }}>{c.s}</div>
            </button>
          ))}
        </div>

        {/* Map preview — condensed, horizontal */}
        <div style={{ fontSize: 12, fontWeight: 800, color: SPROUT.mute, letterSpacing: 1, textTransform: 'uppercase', margin: '20px 4px 8px' }}>Your path</div>
        <div style={{
          background: SPROUT.paper, borderRadius: 20, padding: 14,
          border: `1px solid ${SPROUT.line}`,
          boxShadow: `0 3px 0 ${SPROUT.cardShadow}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', minWidth: 0 }} className="no-scrollbar">
            {UNITS.flatMap(u => u.lessons.map(l => ({ l, u }))).map(({ l, u }, i, arr) => (
              <React.Fragment key={l.id}>
                <MiniNode lesson={l} color={u.color} shadow={u.shadow} onStart={launch}/>
                {i < arr.length - 1 && (
                  <div style={{
                    flex: '0 0 14px', height: 3, borderRadius: 2,
                    background: l.status === 'done' ? SPROUT.green : SPROUT.cream2,
                  }}/>
                )}
              </React.Fragment>
            ))}
          </div>
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: SPROUT.mute, fontWeight: 700 }}>Unit 1 · Getting started</div>
            <button onClick={() => onTab('home')} style={{ border: 'none', background: 'transparent', fontSize: 13, fontWeight: 800, color: SPROUT.greenDark, cursor: 'pointer' }}>Full map →</button>
          </div>
        </div>

        {/* Calm mode footer */}
        {calm && (
          <div style={{
            marginTop: 16, padding: 14, background: '#EFF7EA', borderRadius: 16,
            border: `1px solid #CEE2C0`, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Icon.Leaf size={22} color={SPROUT.greenDark}/>
            <div style={{ fontSize: 13, fontWeight: 700, color: SPROUT.greenDark }}>
              Calm mode is on. No streaks, no timers — just grow at your own pace.
            </div>
          </div>
        )}
      </div>

      <BottomNav active={activeTab} onChange={onTab}/>
      {inboxOpen && <InboxScreen tweaks={tweaks} onClose={() => setInboxOpen(false)} onGoTo={() => setInboxOpen(false)}/>}
      {goalCeleb && <DailyGoalCelebration goal={dailyGoal} weekDone={4} calm={calm} onClose={() => setGoalCeleb(false)}/>}
    </div>
  );
}

function MiniNode({ lesson, color, shadow, onStart }) {
  const isLocked = lesson.status === 'locked';
  const isActive = lesson.status === 'active';
  const isDone = lesson.status === 'done';
  const bg = isLocked ? '#D7CDB8' : color;
  const tappable = !isLocked && !!onStart;
  return (
    <div
      onClick={() => tappable && onStart({ title: lesson.label, queue: lessonQueueFor(lesson) })}
      role={tappable ? 'button' : undefined}
      style={{
        flex: '0 0 auto', width: 36, height: 36, borderRadius: '50%',
        background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isActive ? `0 0 0 3px #fff, 0 0 0 5px ${SPROUT.sun}` : (isLocked ? 'none' : `0 2px 0 ${shadow}`),
        color: '#fff', fontWeight: 900, fontSize: 12,
        cursor: tappable ? 'pointer' : 'default',
      }}
    >
      {isDone ? <Icon.Check size={18} color="#fff"/> : isLocked ? <Icon.Lock size={14} color="#F3EEDF"/> : <Icon.Star size={16} color="#fff"/>}
    </div>
  );
}

Object.assign(window, { VariantC, DailyGoalCelebration });
