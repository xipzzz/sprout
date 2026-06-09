// ─────────────────────────────────────────────────────────────
// Juice — the shared motion/feedback layer.
//  • haptics: light tap on correct, soft error buzz on wrong, success on complete
//  • Reduce Motion: when iOS "Reduce Motion" is on (or the in-app toggle), big
//    celebrations + springs collapse to gentle cross-fades — feedback kept, movement dropped
// Haptics use navigator.vibrate (Android/PWA); on iOS Safari it's a graceful no-op,
// so the visual + Pip feedback always carries the moment too.
// ─────────────────────────────────────────────────────────────

// in-app override: 'auto' (follow OS) | 'on' | 'off'
function reduceMotionOn() {
  try {
    const o = localStorage.getItem('sprout.reduceMotion');
    if (o === 'on') return true;
    if (o === 'off') return false;
  } catch (e) {}
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
}

function hapticsOn() {
  try { return localStorage.getItem('sprout.haptics') !== 'off'; } catch (e) { return true; }
}

// Fire a haptic for a named beat. Patterns are short + gentle (calm brand).
const HAPTIC_PATTERNS = {
  light:   10,           // a tap — correct answer, tile placed, toggle
  medium:  18,
  success: [14, 40, 24], // a little rising buzz — lesson complete / milestone
  error:   [22, 30, 22], // a soft double — wrong answer (never harsh)
  select:  6,
};
function haptic(kind = 'light') {
  if (!hapticsOn()) return;
  // honoring reduce-motion for the strongest patterns keeps things calm
  const pat = HAPTIC_PATTERNS[kind] || HAPTIC_PATTERNS.light;
  try { if (navigator.vibrate) navigator.vibrate(pat); } catch (e) {}
}

// Global CSS: under reduce-motion, neutralize transforms/long animations into fades.
// Scoped to elements that opt in via [data-juice] OR applied broadly when the
// in-app toggle is 'on' (covers OS-off users who still want calm). We inject both
// a media-query rule (always) and a body-class rule (in-app override).
function JuiceStyles() {
  return (
    <style>{`
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.08ms !important;
          scroll-behavior: auto !important;
        }
        /* keep opacity fades so feedback still reads */
        [data-fade] { animation: juiceFade .18s ease both !important; transition: opacity .18s ease !important; }
      }
      body.sprout-reduce-motion *, body.sprout-reduce-motion *::before, body.sprout-reduce-motion *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.08ms !important;
      }
      body.sprout-reduce-motion [data-fade] { animation: juiceFade .18s ease both !important; }
      @keyframes juiceFade { from { opacity: 0; } to { opacity: 1; } }
    `}</style>
  );
}

// Keep the body class in sync with the in-app 'on' override so springs everywhere calm down.
function useReduceMotionClass(override) {
  React.useEffect(() => {
    const on = override === 'on';
    document.body.classList.toggle('sprout-reduce-motion', on);
  }, [override]);
}

// A tiny self-contained garden-particle burst (leaves/petals/droplets) for
// CONTAINED small wins — drop it at a point and it cleans itself up.
// kind: 'leaf' | 'petal' | 'drop'
function MiniBurst({ kind = 'leaf', n = 7, size = 14 }) {
  const glyphs = kind === 'drop' ? ['💧'] : kind === 'petal' ? ['🌸', '🌼'] : ['🍃', '🌱'];
  if (reduceMotionOn()) {
    // reduce-motion: a single gentle fading glyph, no scatter
    return (
      <span aria-hidden data-fade style={{ position: 'absolute', left: '50%', top: 0, transform: 'translate(-50%,-50%)', fontSize: size, pointerEvents: 'none' }}>
        {glyphs[0]}
      </span>
    );
  }
  return (
    <span aria-hidden style={{ position: 'absolute', left: '50%', top: 0, width: 0, height: 0, pointerEvents: 'none' }}>
      <style>{`@keyframes juiceBurst { 0% { transform: translate(-50%,-50%) scale(.4); opacity: 0; } 30% { opacity: 1; } 100% { transform: translate(calc(-50% + var(--bx)), calc(-50% + var(--by))) rotate(var(--br)) scale(1); opacity: 0; } }`}</style>
      {Array.from({ length: n }).map((_, i) => {
        const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
        const dist = 26 + (i % 3) * 9;
        return (
          <span key={i} style={{
            position: 'absolute', fontSize: size,
            ['--bx']: `${Math.cos(ang) * dist}px`,
            ['--by']: `${Math.sin(ang) * dist}px`,
            ['--br']: `${(i % 2 ? 1 : -1) * 140}deg`,
            animation: `juiceBurst ${640 + (i % 4) * 90}ms cubic-bezier(.2,.7,.3,1) ${i * 14}ms both`,
          }}>{glyphs[i % glyphs.length]}</span>
        );
      })}
    </span>
  );
}

Object.assign(window, { haptic, reduceMotionOn, hapticsOn, JuiceStyles, useReduceMotionClass, MiniBurst });
