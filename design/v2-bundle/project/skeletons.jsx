// ─────────────────────────────────────────────────────────────
// Loading / skeleton states — perceived-performance polish.
//  • Shape-matched skeletons per screen (path / garden / league / today)
//  • Chrome (status bar + HUD + bottom nav) stays instant; only content shimmers
//  • On-brand cream→sage shimmer, plus a Pip-watering micro-moment for long waits
// ─────────────────────────────────────────────────────────────

// One shimmering block. `r` = border-radius, `c` = circle.
function Sk({ w = '100%', h = 14, r = 8, c = false, style = {} }) {
  return (
    <div style={{
      width: c ? h : w, height: h, borderRadius: c ? '50%' : r, flexShrink: 0,
      background: 'linear-gradient(100deg, #ECE3D0 30%, #F6EFDF 50%, #ECE3D0 70%)',
      backgroundSize: '220% 100%', animation: 'skShimmer 1.4s ease-in-out infinite',
      ...style,
    }}/>
  );
}

// inject the shimmer keyframes once
function SkStyle() {
  return <style>{`@keyframes skShimmer { 0% { background-position: 180% 0; } 100% { background-position: -180% 0; } }
    @keyframes pipWater { 0%,100% { transform: rotate(-4deg); } 50% { transform: rotate(8deg); } }
    @keyframes seedGrow { 0% { transform: scaleY(0.2); opacity: .4; } 60% { transform: scaleY(1.05); } 100% { transform: scaleY(1); opacity: 1; } }`}</style>;
}

// Winding-path skeleton — node circles zig-zagging down the path line.
function PathSkeleton() {
  const xs = [50, 68, 78, 68, 50, 32, 22, 32]; // % offsets to mimic the sinewave
  return (
    <div style={{ padding: '20px 0 80px' }}>
      <SkStyle/>
      {/* unit banner */}
      <div style={{ margin: '0 16px 22px', display: 'flex', alignItems: 'center', gap: 12, background: SPROUT.paper, borderRadius: 16, padding: 14, border: `1px solid ${SPROUT.line}` }}>
        <Sk h={40} c/>
        <div style={{ flex: 1 }}>
          <Sk w="55%" h={13} style={{ marginBottom: 7 }}/>
          <Sk w="80%" h={10}/>
        </div>
      </div>
      {xs.map((x, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ marginLeft: `${(x - 50) * 4}px` }}>
            <Sk h={62} c/>
          </div>
        </div>
      ))}
    </div>
  );
}

// Garden skeleton — plant-card placeholders in the bed grid.
function GardenSkeleton() {
  return (
    <div style={{ padding: '16px 16px 80px' }}>
      <SkStyle/>
      {/* hero */}
      <div style={{ height: 150, borderRadius: 20, background: 'linear-gradient(180deg,#E4EFDC,#EFF6E8)', marginBottom: 18, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 18 }}>
        <Sk h={70} c/>
      </div>
      <Sk w="40%" h={14} style={{ marginBottom: 14 }}/>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ background: SPROUT.paper, borderRadius: 14, padding: '14px 8px', border: `1px solid ${SPROUT.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Sk h={46} c/>
            <Sk w="80%" h={9}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// League skeleton — ranked-row placeholders.
function LeagueSkeleton() {
  return (
    <div style={{ padding: '16px 16px 80px' }}>
      <SkStyle/>
      {/* tier rail */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
        {Array.from({ length: 5 }).map((_, i) => <Sk key={i} h={42} c/>)}
      </div>
      <Sk w="60%" h={13} style={{ margin: '0 auto 18px' }}/>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: SPROUT.paper, borderRadius: 13, padding: '11px 13px', border: `1px solid ${SPROUT.line}` }}>
            <Sk w="18px" h={14}/>
            <Sk h={36} c/>
            <Sk w="45%" h={13}/>
            <div style={{ flex: 1 }}/>
            <Sk w="42px" h={13}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// Today-card skeleton — its stacked card shapes.
function TodaySkeleton() {
  return (
    <div style={{ padding: '16px 16px 80px' }}>
      <SkStyle/>
      <Sk w="65%" h={20} style={{ marginBottom: 8 }}/>
      <Sk w="45%" h={12} style={{ marginBottom: 20 }}/>
      {/* week strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
        {Array.from({ length: 7 }).map((_, i) => <Sk key={i} h={30} c/>)}
      </div>
      {/* main lesson card */}
      <div style={{ background: SPROUT.paper, borderRadius: 18, padding: 16, border: `1px solid ${SPROUT.line}`, marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
          <Sk h={54} c/>
          <div style={{ flex: 1 }}>
            <Sk w="70%" h={14} style={{ marginBottom: 8 }}/>
            <Sk w="50%" h={11}/>
          </div>
        </div>
        <Sk h={44} r={14}/>
      </div>
      {/* warm-up chips */}
      <div style={{ display: 'flex', gap: 9 }}>
        {Array.from({ length: 3 }).map((_, i) => <Sk key={i} w="33%" h={40} r={12}/>)}
      </div>
    </div>
  );
}

// Long-wait micro-moment — Pip watering a sprouting seed, in a loop. On-brand,
// for genuinely longer waits (generating a Garden Tale, syncing after offline).
function PipLoading({ label = 'Growing your garden…', calm = true }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: calm ? '#F1F6EC' : SPROUT.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Nunito", system-ui', gap: 18 }}>
      <SkStyle/>
      <div style={{ position: 'relative', width: 150, height: 130 }}>
        {/* sprout growing */}
        <svg width="80" height="90" viewBox="0 0 80 90" style={{ position: 'absolute', left: 38, bottom: 0 }}>
          <ellipse cx="40" cy="84" rx="26" ry="6" fill="#E3D6BC"/>
          <g style={{ transformOrigin: '40px 84px', animation: 'seedGrow 1.8s ease-in-out infinite alternate' }}>
            <path d="M40 84 Q40 60 40 44" stroke={SPROUT.greenDark} strokeWidth="4" fill="none" strokeLinecap="round"/>
            <path d="M40 56 Q26 52 20 60 Q31 62 40 56 Z" fill={SPROUT.green}/>
            <path d="M40 48 Q54 44 60 52 Q49 55 40 50 Z" fill="#7CD168"/>
          </g>
        </svg>
        {/* Pip with a tilting watering can */}
        <div style={{ position: 'absolute', left: -6, top: 4, animation: 'pipWater 1.8s ease-in-out infinite' }}>
          <Pip size={70} mood="happy"/>
        </div>
      </div>
      <div style={{ fontSize: 14.5, fontWeight: 800, color: SPROUT.mute }}>{label}</div>
    </div>
  );
}

// Wraps a screen skeleton with the INSTANT chrome (status bar lives in IOSDevice;
// here we render a HUD bar shell + bottom-nav shell so only content shimmers).
function ScreenLoading({ kind = 'path', calm = true }) {
  const body = kind === 'garden' ? <GardenSkeleton/>
    : kind === 'league' ? <LeagueSkeleton/>
    : kind === 'today' ? <TodaySkeleton/>
    : <PathSkeleton/>;
  return (
    <div style={{ position: 'absolute', inset: 0, background: calm ? '#F1F6EC' : SPROUT.bg, display: 'flex', flexDirection: 'column', fontFamily: '"Nunito", system-ui' }}>
      <SkStyle/>
      {/* HUD shell — instant; mirrors the evenly-spread real bar */}
      <div style={{ padding: `${LAYOUT.safeTop}px ${LAYOUT.padX}px ${LAYOUT.hudPadY}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${SPROUT.line}` }}>
        <Sk h={22} c/>
        <Sk w="44px" h={18} r={10}/>
        <Sk w="44px" h={18} r={10}/>
        <Sk w="44px" h={18} r={10}/>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>{body}</div>
      {/* bottom-nav shell — instant */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: `10px 4px ${LAYOUT.safeBottom}px`, borderTop: `1px solid ${SPROUT.line}`, background: SPROUT.paper }}>
        {Array.from({ length: 5 }).map((_, i) => <Sk key={i} h={26} c/>)}
      </div>
    </div>
  );
}

Object.assign(window, { Sk, SkStyle, PathSkeleton, GardenSkeleton, LeagueSkeleton, TodaySkeleton, PipLoading, ScreenLoading });
