// Water level indicator — vertical bottle that fills from the bottom.
// The one depleting currency, so it reads like a battery: cap + neck + body,
// light-aqua outline, solid fill rising from the base with a subtle waterline
// wave. Aqua normally → amber at 2 → red + pulse at 1 and 0 (out of water).
// Used in the top HUD (showNumber=false, paired with HudStat's number),
// the exercise bars, and — larger — in the Water details sheet header.

// Shared state logic so the gauge and any sibling number agree on color/pulse.
function waterState(level = 5, max = 5, plus = false) {
  if (plus) {
    return { pct: 1, fill: '#2BB8E6', outline: '#6BC1E0', number: '#2B8FAF', pulse: false, empty: false, label: 'Unlimited' };
  }
  const pct = Math.max(0, Math.min(1, level / max));
  if (level <= 0) {
    return { pct: 0, fill: 'transparent', outline: '#E0A59C', number: '#C85555', pulse: true, empty: true, label: 'Empty' };
  }
  if (level <= 1) {
    return { pct, fill: '#EF5B43', outline: '#EBA79C', number: '#C85555', pulse: true, empty: false, label: `${level} of ${max}` };
  }
  if (level <= 2) {
    return { pct, fill: SPROUT.sun, outline: '#E7C77F', number: '#C28A1C', pulse: false, empty: false, label: `${level} of ${max}` };
  }
  return { pct, fill: '#2BB8E6', outline: '#6BC1E0', number: '#2B8FAF', pulse: false, empty: false, label: `${level} of ${max}` };
}

function WaterGauge({ level = 5, max = 5, size = 28, plus = false, pulse = null, showNumber = true }) {
  const st = waterState(level, max, plus);
  const doPulse = pulse === null ? st.pulse : pulse;

  // viewBox 0 0 24 32 — cap, short neck, rounded body.
  // Fill range inside the body: full surface ≈ y 7.5, empty ≈ y 29.
  const FILL_TOP = 7.5, FILL_RANGE = 21.5;
  const dropY = (1 - st.pct) * FILL_RANGE; // how far the surface sinks from full

  const w = size;
  const h = size * 1.34;
  const uid = `${size}-${level}-${max}-${plus ? 'p' : 'n'}`;

  // Bottle silhouette (shared by clip + outline).
  const bottle = `
    M 9.5 4
    L 9.5 6.4
    Q 9.5 7.4 8.7 7.9
    Q 3.5 10.4 3.5 16
    L 3.5 25.5
    Q 3.5 29.3 7.4 29.3
    L 16.6 29.3
    Q 20.5 29.3 20.5 25.5
    L 20.5 16
    Q 20.5 10.4 15.3 7.9
    Q 14.5 7.4 14.5 6.4
    L 14.5 4
    Z`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: showNumber ? 6 : 0, animation: doPulse ? 'wgPulse 1s ease-in-out infinite' : 'none' }}>
      <style>{`
        @keyframes wgPulse { 0%,100%{ transform:scale(1); } 50%{ transform:scale(1.1); } }
        @keyframes wgWave { from{ transform:translateX(0); } to{ transform:translateX(-12px); } }
      `}</style>
      <svg width={w} height={h} viewBox="0 0 24 32" style={{ overflow: 'visible', display: 'block' }}>
        <defs>
          <clipPath id={`wg-clip-${uid}`}>
            <path d={bottle} />
          </clipPath>
        </defs>

        {/* water — clipped to the bottle, surface sinks as level drops */}
        {!st.empty && (
          <g clipPath={`url(#wg-clip-${uid})`}>
            <g style={{ transform: `translateY(${dropY}px)`, transition: 'transform .55s cubic-bezier(.4,0,.25,1)' }}>
              {/* wavy top edge, drifting sideways for a gentle ripple */}
              <g style={{ animation: 'wgWave 2.6s linear infinite' }}>
                <path
                  d={`M -8 ${FILL_TOP}
                      Q -5 ${FILL_TOP - 1.3} -2 ${FILL_TOP}
                      T 4 ${FILL_TOP} T 10 ${FILL_TOP} T 16 ${FILL_TOP}
                      T 22 ${FILL_TOP} T 28 ${FILL_TOP} T 34 ${FILL_TOP}
                      L 34 34 L -8 34 Z`}
                  fill={st.fill} />
              </g>
              {/* crisp surface highlight just under the waterline */}
              <rect x="-8" y={FILL_TOP} width="42" height="1.1" fill="#fff" opacity="0.45" />
            </g>
          </g>
        )}

        {/* bottle outline — light aqua */}
        <path d={bottle} fill="none" stroke={st.outline} strokeWidth="2" strokeLinejoin="round" />
        {/* cap */}
        <rect x="8.3" y="0.8" width="7.4" height="3.2" rx="1.2" fill={st.outline} />
      </svg>

      {showNumber && (
        <span style={{ fontWeight: 800, fontSize: plus ? 19 : 16, color: st.number, fontVariantNumeric: 'tabular-nums', lineHeight: 1, transition: 'color .3s' }}>
          {plus ? '∞' : level}
        </span>
      )}
    </div>
  );
}

Object.assign(window, { WaterGauge, waterState });
