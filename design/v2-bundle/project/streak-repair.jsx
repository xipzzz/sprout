// ─────────────────────────────────────────────────────────────
// Streak repair moments — the highest-leverage win-back beats, kept calm.
//  • StreakSaved   — a relief beat when a Freeze auto-applies ("phew")
//  • Comeback      — reassuring (never scolding) greeting after a missed day
//  • StreakRepair  — a kind repair / "replant" path if a streak actually broke
// English-only. Reuses Pip + MilestonePlant + the Sprout palette.
// ─────────────────────────────────────────────────────────────

// A snowflaked rainy-day chip for the frozen day.
function FrozenDayChip({ size = 56 }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: 16, background: '#E7F1FA', border: '1.5px solid #BFD8E4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.5 }}>❄️</div>
    </div>
  );
}

// 1) STREAK SAVED — opens when a Freeze auto-applied while you were away.
function StreakSaved({ days = 30, freezesLeft = 1, calm = false, onContinue }) {
  React.useEffect(() => { if (typeof haptic === 'function') haptic('light'); }, []);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 46, background: 'linear-gradient(180deg, #DCEBF7 0%, #EAF3F8 45%, ' + (calm ? '#F1F6EC' : SPROUT.bg) + ' 100%)', display: 'flex', flexDirection: 'column', fontFamily: '"Nunito", system-ui' }}>
      <style>{`@keyframes ssPop{0%{transform:scale(.5);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}} @keyframes ssRise{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}} @keyframes ssFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 30px' }}>
        {/* frozen plant under a snowflake */}
        <div style={{ position: 'relative', animation: 'ssPop .6s cubic-bezier(.2,.9,.3,1.25) both' }}>
          <div style={{ animation: 'ssFloat 3s ease-in-out infinite' }}>
            <MilestonePlant tier={days >= 100 ? 'oak' : days >= 30 ? 'tree' : 'bush'} size={120}/>
          </div>
          <div style={{ position: 'absolute', top: -6, right: -10, fontSize: 38, animation: 'ssFloat 2.4s ease-in-out infinite' }}>❄️</div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1.2, textTransform: 'uppercase', color: '#2E8FB0', marginTop: 20, animation: 'ssRise .5s .1s both' }}>Streak saved</div>
        <div style={{ fontSize: 25, fontWeight: 900, color: SPROUT.ink, marginTop: 6, lineHeight: 1.15, animation: 'ssRise .5s .2s both' }}>Phew — your {days}-day streak is safe 🌱</div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: SPROUT.mute, marginTop: 10, lineHeight: 1.45, maxWidth: 290, animation: 'ssRise .5s .3s both' }}>
          A Streak Freeze covered the day you missed. Pip's got your back — no need to start over.
        </div>

        {/* frozen day + freezes left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 22, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 16, padding: '12px 16px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, animation: 'ssRise .5s .4s both' }}>
          <FrozenDayChip size={48}/>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13.5, fontWeight: 900, color: SPROUT.ink }}>Yesterday — frozen</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: SPROUT.mute }}>{freezesLeft} freeze{freezesLeft === 1 ? '' : 's'} left</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 22px 32px' }}>
        <PushButton size="lg" color={SPROUT.green} shadow={SPROUT.greenShadow} onClick={onContinue} style={{ width: '100%' }}>Keep growing 🌱</PushButton>
      </div>
    </div>
  );
}

// 2) COMEBACK — a gentle, non-guilty greeting for a returning lapsed user.
function Comeback({ daysAway = 3, calm = false, onContinue }) {
  React.useEffect(() => { if (typeof haptic === 'function') haptic('light'); }, []);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 46, background: calm ? '#F1F6EC' : SPROUT.bg, display: 'flex', flexDirection: 'column', fontFamily: '"Nunito", system-ui' }}>
      <style>{`@keyframes cbWave{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(8deg)}} @keyframes cbRise{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}} @keyframes cbGrow{from{transform:scaleY(.6);opacity:.5;transform-origin:bottom}to{transform:scaleY(1);opacity:1}}`}</style>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 30px' }}>
        <div style={{ animation: 'cbRise .6s both' }}>
          <Pip size={132} mood="happy" wave={true}/>
        </div>
        <div style={{ fontSize: 25, fontWeight: 900, color: SPROUT.ink, marginTop: 14, lineHeight: 1.18, animation: 'cbRise .5s .15s both' }}>
          It's okay — your garden waited for you 🌱
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: SPROUT.mute, marginTop: 10, lineHeight: 1.45, maxWidth: 296, animation: 'cbRise .5s .25s both' }}>
          {daysAway >= 1 ? `It's been ${daysAway} day${daysAway === 1 ? '' : 's'}. ` : ''}No guilt, no catching up — the important thing is you're here today. Let's grow a little.
        </div>
      </div>

      <div style={{ padding: '0 22px 32px' }}>
        <PushButton size="lg" color={SPROUT.green} shadow={SPROUT.greenShadow} onClick={onContinue} style={{ width: '100%' }}>Grow today</PushButton>
      </div>
    </div>
  );
}

// 3) STREAK REPAIR — a kind path when a streak broke with no freeze left.
function StreakRepair({ lostStreak = 30, calm = false, repairCost = 0, onRepair, onFresh }) {
  const [confirmFresh, setConfirmFresh] = React.useState(false);
  React.useEffect(() => { if (typeof haptic === 'function') haptic('light'); }, []);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 46, background: calm ? '#F1F6EC' : SPROUT.bg, display: 'flex', flexDirection: 'column', fontFamily: '"Nunito", system-ui' }}>
      <style>{`@keyframes srRise{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 30px' }}>
        {/* a wilted-but-alive plant — never "dead" */}
        <div style={{ position: 'relative', animation: 'srRise .6s both' }}>
          <div style={{ filter: 'grayscale(0.25)', opacity: 0.9 }}><MilestonePlant tier="bush" size={116}/></div>
          <div style={{ position: 'absolute', top: -4, right: -6, fontSize: 30 }}>☔</div>
        </div>
        <div style={{ fontSize: 25, fontWeight: 900, color: SPROUT.ink, marginTop: 18, lineHeight: 1.18, animation: 'srRise .5s .15s both' }}>
          Your garden could use some water 🌱
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: SPROUT.mute, marginTop: 10, lineHeight: 1.45, maxWidth: 296, animation: 'srRise .5s .25s both' }}>
          Your {lostStreak}-day streak paused while you were away. Bring it back, or start a fresh one — either way, your garden's still here.
        </div>
      </div>

      <div style={{ padding: '0 22px 32px', display: 'flex', flexDirection: 'column', gap: 11 }}>
        <PushButton size="lg" color={SPROUT.green} shadow={SPROUT.greenShadow} onClick={onRepair} style={{ width: '100%' }}>
          {repairCost > 0 ? `Replant my ${lostStreak}-day streak · ${repairCost} 💎` : `Replant my ${lostStreak}-day streak 🌱`}
        </PushButton>
        {repairCost === 0 && (
          <div style={{ fontSize: 11.5, fontWeight: 800, color: SPROUT.greenDark, textAlign: 'center', marginTop: -4 }}>Your first repair is on us 🌱</div>
        )}
        {!confirmFresh ? (
          <button onClick={() => setConfirmFresh(true)} style={{
            width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 14.5, fontWeight: 900, color: SPROUT.mute, padding: '10px 0', minHeight: 44,
          }}>Start a new streak instead</button>
        ) : (
          <div style={{ background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14, padding: '13px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: SPROUT.ink, marginBottom: 10 }}>Start a new streak? Your garden begins again 🌱</div>
            <div style={{ display: 'flex', gap: 9 }}>
              <button onClick={() => setConfirmFresh(false)} style={{ flex: 1, border: `1.5px solid ${SPROUT.line}`, background: SPROUT.paper, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 900, color: SPROUT.ink, borderRadius: 12, padding: '11px 0' }}>Keep my streak</button>
              <button onClick={onFresh} style={{ flex: 1, border: 'none', background: SPROUT.green, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 900, borderRadius: 12, padding: '11px 0', boxShadow: `0 3px 0 ${SPROUT.greenShadow}` }}>Start fresh</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { StreakSaved, Comeback, StreakRepair });
