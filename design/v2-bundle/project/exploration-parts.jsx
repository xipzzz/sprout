// exploration-parts.jsx — overflow split from exploration.jsx to stay under the
// 500KB Babel transform soft-limit. Shares global scope with exploration.jsx
// (loaded immediately BEFORE it). These are pure Proposed* card components that
// reference shared helpers (SK, SPROUT, Icon, AppChrome, Mini*, CurrentStreakDots,
// Pip, skGridW) at render time, so load order before those helpers is fine.

function ProposedGardenStreakCal({ mode = 'proposed' }) {
  const GREEN = '#6fbf5e', DEEP = '#3fa52e', FILL = '#CDEBBE';
  const COLS = 7, ROWS = 5, C = 24, G = 5, PX = 6, TODAY = 20;
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  // June 2026 starts on a Monday. Watered: a few earlier days + a 12-day run to today.
  const earlier = [0, 1, 2, 4, 5, 7];
  const runStart = 9; // June 10 → today (June 21) is one continuous run
  const watered = new Set([...earlier, ...Array.from({ length: TODAY - runStart + 1 }, (_, k) => runStart + k)]);
  const gridW = PX * 2 + COLS * C + (COLS - 1) * G;
  const cellX = (c) => PX + c * (C + G);
  const cellY = (r) => r * (C + G);
  // continuous-run pill segments, per row
  const segs = [];
  for (let r = 0; r < ROWS; r++) {
    let lo = null, hi = null;
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c;
      if (i >= runStart && i <= TODAY) { if (lo === null) lo = c; hi = c; }
    }
    if (lo !== null) segs.push({ r, lo, hi });
  }

  if (mode === 'current') {
    // CURRENT: the streak is just a lone number — no calendar, no run, no records.
    return (
      <AppChrome top="streak" nav="me">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '24px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon.Leaf size={22} color={DEEP} />
            <Icon.Droplet size={18} color="#2E8FB0" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 66, lineHeight: 1, color: DEEP, letterSpacing: '-.02em' }}>12</span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 16, color: SPROUT.mute }}>days</span>
          </div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 12.5, fontWeight: 700, color: SPROUT.mute }}>Day streak</div>
        </div>
      </AppChrome>
    );
  }

  return (
    <AppChrome top="streak" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, padding: '12px 16px', minHeight: 0 }}>
        {/* header: streak count with leaf/drop motif (no flame) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 30, height: 30, borderRadius: '50%', background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Leaf size={17} color={DEEP} /></span>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 17, color: SPROUT.ink }}>12-day streak</span>
          <Icon.Droplet size={15} color="#2E8FB0" />
        </div>

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>June 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, ${C}px)`, gap: G, alignSelf: 'center', padding: '0 ' + PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* month grid with one connected soft-green run band + today ring */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW }}>
          {segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: cellY(s.r) + 1,
              width: (s.hi - s.lo) * (C + G) + C + 2, height: C, borderRadius: 999, background: FILL, zIndex: 1
            }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, ${C}px)`, gap: G, padding: '0 ' + PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: COLS * ROWS }).map((_, i) => {
              const isToday = i === TODAY;
              const isWatered = watered.has(i);
              const isFuture = i > TODAY;
              const day = i + 1;
              return (
                <div key={i} style={{ width: C, height: C, borderRadius: isWatered ? 999 : 8, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', opacity: isFuture ? 0.45 : 1 }}>
                  {isToday ? (
                    <span style={{ width: C, height: C, borderRadius: '50%', border: '2px solid ' + DEEP, background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 9, color: '#fff', boxShadow: '0 0 0 3px ' + GREEN + '33' }}>{day > 31 ? day - 31 : day}</span>
                  ) : isWatered ? (
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 8.5, color: 'rgba(255,255,255,.9)' }}>{day}</span>
                  ) : (
                    <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: SPROUT.mute }}>{day}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* exactly two quiet record stats */}
        <div style={{ display: 'flex', gap: 9, marginTop: 2 }}>
          {[['Longest streak', '18 days'], ['Watered this month', '21 days']].map(([lab, val]) => (
            <div key={lab} style={{ flex: 1, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '9px 11px', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink, lineHeight: 1 }}>{val}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.05em', textTransform: 'uppercase', color: SPROUT.mute }}>{lab}</span>
            </div>
          ))}
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Connected growth-streak ribbon (isolated dots → one green band) ──
function ProposedGrowthRibbon({ mode = 'proposed' }) {
  const GREEN = '#6fbf5e', DEEP = '#3fa52e', FILL = '#CDEBBE';
  const COLS = 7, ROWS = 5, C = 24, G = 5, PX = 6, RUN_START = 7, TODAY = 19, MILE = 20;
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const watered = new Set(Array.from({ length: TODAY - RUN_START + 1 }, (_, k) => RUN_START + k));
  const gridW = PX * 2 + COLS * C + (COLS - 1) * G;
  const cellX = (c) => PX + c * (C + G);
  const cellY = (r) => r * (C + G);
  const isNew = mode !== 'current';
  // continuous-run pill segments, per row
  const segs = [];
  for (let r = 0; r < ROWS; r++) {
    let lo = null, hi = null;
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c;
      if (i >= RUN_START && i <= TODAY) { if (lo === null) lo = c; hi = c; }
    }
    if (lo !== null) segs.push({ r, lo, hi });
  }

  return (
    <AppChrome top="streak" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, padding: '12px 16px', minHeight: 0 }}>
        {/* quiet two-stat summary — the ONLY addition above the grid (NEW only) */}
        {isNew && (
          <div style={{ display: 'flex', gap: 9 }}>
            <div style={{ flex: 1, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '8px 11px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon.Leaf size={16} color={DEEP} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: SPROUT.ink, lineHeight: 1 }}>47</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.05em', textTransform: 'uppercase', color: SPROUT.mute }}>Days grown</span>
              </div>
            </div>
            <div style={{ flex: 1, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '8px 11px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon.Droplet size={16} color="#2E8FB0" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: SPROUT.ink, lineHeight: 1 }}>2</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.05em', textTransform: 'uppercase', color: SPROUT.mute }}>Water saves used</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, ${C}px)`, gap: G, alignSelf: 'center', padding: '0 ' + PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* the calendar body — the ONLY element that differs */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW }}>
          {/* NEW: one continuous growth ribbon behind the run */}
          {isNew && segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: cellY(s.r) + 1,
              width: (s.hi - s.lo) * (C + G) + C + 2, height: C, borderRadius: 999, background: FILL, zIndex: 1
            }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, ${C}px)`, gap: G, padding: '0 ' + PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: COLS * ROWS }).map((_, i) => {
              const isWatered = watered.has(i);
              const isToday = i === TODAY;
              const isMile = i === MILE;
              const isFuture = i > TODAY;
              const day = i + 1;
              if (isNew && isToday) {
                // today sits at the leading edge of the ribbon, with a gentle lift
                return (
                  <div key={i} style={{ width: C, height: C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: C, height: C, borderRadius: '50%', background: DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 9, color: '#fff', transform: 'translateY(-2px)', boxShadow: '0 6px 12px -4px rgba(63,165,46,.6)' }}>{day}</span>
                  </div>
                );
              }
              if (isNew && isMile) {
                // next milestone: a small flag with a soft highlight ring
                return (
                  <div key={i} style={{ width: C, height: C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: C, height: C, borderRadius: '50%', border: '1.5px dashed ' + DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 3px ' + GREEN + '22' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></svg>
                    </span>
                  </div>
                );
              }
              if (isWatered) {
                // NEW: a green node that reads as part of the ribbon (round, no gap)
                // CURRENT: an isolated filled leaf-circle, disconnected from its neighbours
                return (
                  <div key={i} style={{ width: C, height: C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: isNew ? C : 18, height: isNew ? C : 18, borderRadius: '50%', background: isNew ? GREEN : '#fff', border: isNew ? 'none' : '2.5px solid ' + GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isNew
                        ? <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 8.5, color: 'rgba(255,255,255,.9)' }}>{day}</span>
                        : <Icon.Leaf size={10} color={GREEN} />}
                    </span>
                  </div>
                );
              }
              return (
                <div key={i} style={{ width: C, height: C, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isFuture ? 0.45 : 1 }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: SPROUT.mute }}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Calm sectioned Shop (one long list → labeled sections) ──
function ProposedSectionedShop({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GEM = '#6C8AE4', WATER = '#2E8FB0';

  // a uniform item row: product illustration · name + one-line · single price pill
  const Item = ({ art, tint, name, sub, price, cur, owned, popular }) => (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 9, background: '#fff', border: '1.5px solid ' + (popular ? SPROUT.green : SPROUT.line), borderRadius: 12, padding: '2px 10px', minHeight: 30, boxSizing: 'border-box', overflow: 'hidden' }}>
      {popular && (
        <span style={{ position: 'absolute', top: 4, right: -26, transform: 'rotate(38deg)', background: '#6fbf5e', color: '#fff', fontFamily: 'JetBrains Mono, monospace', fontSize: 6, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700, padding: '2px 26px', boxShadow: '0 2px 5px -2px rgba(0,0,0,.25)' }}>Best value</span>
      )}
      <div style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{art}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 13, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.15 }}>{name}</span>
        </div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 10.5, fontWeight: 600, color: SPROUT.mute, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>{sub}</div>
      </div>
      {owned ? (
        <span style={{ flexShrink: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.mute, background: SPROUT.bg, border: '1px solid ' + SPROUT.line, borderRadius: 999, padding: '4px 10px' }}>Owned</span>
      ) : (
        <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, background: cur === '$' ? '#EAF6E2' : SPROUT.bg, borderRadius: 999, padding: '5px 10px' }}>
          {cur === 'water' ? <Icon.Droplet size={13} color={WATER} /> : cur === 'leaf' ? <Icon.Leaf size={13} color={SPROUT.greenDark} /> : cur === '$' ? null : <Icon.Gem size={13} color={GEM} />}
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: cur === '$' ? SPROUT.greenDark : SPROUT.ink }}>{price}</span>
        </span>
      )}
    </div>
  );

  const Section = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, paddingLeft: 3 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>{children}</div>
    </div>
  );

  let body;
  if (!isNew) {
    // CURRENT: an uneven GRID of tiles — power-ups, water & decor all mixed,
    // different sizes, and an owned item looks identical to a buyable one.
    const Tile = ({ glyph, name, price, tall }) => (
      <div style={{ background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: tall ? '16px 10px 12px' : '11px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: tall ? 10 : 6 }}>
        <div style={{ fontSize: tall ? 34 : 24 }}>{glyph}</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11.5, color: SPROUT.ink, textAlign: 'center', lineHeight: 1.15 }}>{name}</div>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: GEM, background: '#EEF1FB', borderRadius: 999, padding: '3px 9px' }}>{price}</span>
      </div>
    );
    body = (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11, padding: '16px 14px', minHeight: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, alignItems: 'start' }}>
          <Tile glyph="🛡️" name="Streak Freeze" price="120" tall />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <Tile glyph="💧" name="Water Refill" price="30" />
            <Tile glyph="✨" name="Double Seeds" price="90" />
          </div>
          <Tile glyph="🌼" name="Flower Bed" price="150" />
          <Tile glyph="🪴" name="Potted Fern" price="80" />
          <Tile glyph="💎" name="Gem Pouch" price="$1.99" tall />
          <Tile glyph="🌿" name="Garden Arch" price="200" />
        </div>
      </div>
    );
  } else {
    // a small owned-item card showing its state (equipped / count / time left)
    const Owned = ({ art, name, state, stateColor }) => (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 12, padding: '5px 4px' }}>
        <span style={{ fontSize: 16 }}>{art}</span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 8.5, color: SPROUT.mute, textAlign: 'center', lineHeight: 1.1 }}>{name}</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 6.5, letterSpacing: '.04em', textTransform: 'uppercase', color: stateColor || SPROUT.greenDark, background: (stateColor ? stateColor : SPROUT.greenDark) + '1A', borderRadius: 999, padding: '2px 6px' }}>{state}</span>
      </div>
    );
    body = (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 9, padding: '8px 14px', minHeight: 0 }}>
        {/* Power-ups first — function over currency */}
        <Section label="Power-ups">
          <Item art="🛡️" tint="#EAF6E2" name="Streak Shield" sub="Protect a missed day" price="200" cur="gems" />
          <Item art="🌸" tint="#FBF1DA" name="Double Bloom" sub="Wager gems on a 7-day streak" price="50" cur="gems" />
          <Item art="💧" tint="#E5F2F8" name="Watering Can" sub="Refill your daily water" owned />
        </Section>

        {/* Gems below — the existing purchase tiles */}
        <Section label="Gems">
          <Item art="💎" tint="#EEF1FB" name="Gem Pouch" sub="300 gems" price="$1.99" cur="$" />
          <Item art="🧰" tint="#EEF1FB" name="Gem Chest" sub="800 gems · best value" price="$4.99" cur="$" popular />
        </Section>
      </div>
    );
  }

  return <AppChrome top="hud" nav="me">{body}</AppChrome>;
}

// ── Proposed · Shop sections — scannable store rows (flat stack → grouped Phosphor-icon rows) ──
function ProposedShopRows({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GEM = '#6C8AE4', WATER = '#2E8FB0';

  // a uniform calm row: round leaf-tinted Phosphor icon · title + one-line · single price pill
  const Row = ({ icon, tint, name, sub, price, cur }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '7px 11px', minHeight: 34, boxSizing: 'border-box' }}>
      <span style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 13, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.15 }}>{name}</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 10.5, fontWeight: 600, color: SPROUT.mute, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>{sub}</div>
      </div>
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, background: SPROUT.bg, borderRadius: 999, padding: '5px 11px' }}>
        {cur === 'water' ? <Icon.Droplet size={13} color={WATER} /> : cur === 'leaf' ? <Icon.Leaf size={13} color={SPROUT.greenDark} /> : <Icon.Gem size={13} color={GEM} />}
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>{price}</span>
      </span>
    </div>
  );

  const Section = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, paddingLeft: 3 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>{children}</div>
    </div>
  );

  let body;
  if (!isNew) {
    // CURRENT: one undifferentiated stack — power-ups, streak care and gem packs
    // all blur together in a single flat list with no grouping.
    const Flat = ({ glyph, name, price, cur }) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '8px 11px', minHeight: 34, boxSizing: 'border-box' }}>
        <span style={{ fontSize: 19, flexShrink: 0, width: 24, textAlign: 'center' }}>{glyph}</span>
        <span style={{ flex: 1, minWidth: 0, fontFamily: 'Nunito, system-ui', fontSize: 12.5, fontWeight: 800, color: SPROUT.ink }}>{name}</span>
        <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
          {cur === 'water' ? <Icon.Droplet size={12} color="#2E8FB0" /> : cur === '$' ? null : <Icon.Gem size={12} color={GEM} />}
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: cur === '$' ? SPROUT.greenDark : SPROUT.ink }}>{price}</span>
        </span>
      </div>
    );
    body = (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, padding: '14px 14px', minHeight: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Flat glyph="🛡️" name="Streak Freeze" price="120" cur="gems" />
          <Flat glyph="💧" name="Water Refill" price="30" cur="water" />
          <Flat glyph="💎" name="Gem Pouch" price="$1.99" cur="$" />
          <Flat glyph="✨" name="Double Seeds" price="90" cur="gems" />
          <Flat glyph="❄️" name="Frost Cover" price="150" cur="gems" />
          <Flat glyph="🧰" name="Gem Chest" price="$4.99" cur="$" />
          <Flat glyph="🌱" name="Seed Boost" price="60" cur="gems" />
        </div>
      </div>
    );
  } else {
    body = (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10, padding: '8px 14px', minHeight: 0 }}>
        <Section label="Power-ups">
          <Row icon={<Icon.Sparkle size={16} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Double Seeds" sub="2× seeds for 30 min" price="90" cur="gems" />
          <Row icon={<Icon.Plant size={16} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Seed Boost" sub="Head-start your next bloom" price="60" cur="gems" />
        </Section>
        <Section label="Streak care">
          <Row icon={<Icon.Shield size={16} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Streak Freeze" sub="Protect your garden if you miss a day" price="120" cur="gems" />
          <Row icon={<Icon.Droplet size={16} color={WATER} />} tint="#E5F2F8" name="Water Refill" sub="Top up your daily water" price="30" cur="water" />
        </Section>
        <Section label="Gems">
          <Row icon={<Icon.Gem size={16} color={GEM} />} tint="#EEF1FB" name="Gem Pouch" sub="300 gems" price="$1.99" cur="gems" />
          <Row icon={<Icon.Gem size={16} color={GEM} />} tint="#EEF1FB" name="Gem Chest" sub="800 gems" price="$4.99" cur="gems" />
        </Section>
      </div>
    );
  }

  return <AppChrome top="hud" nav="me">{body}</AppChrome>;
}

// ── Proposed · Calm sectioned Shop (flat priced grid → quiet grouped sections + gem-balance pill) ──
function ProposedCalmShop({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GEM = '#6C8AE4';

  if (!isNew) {
    // CURRENT: streak-savers, power-ups & decor all in one undifferentiated priced grid.
    const Tile = ({ glyph, name, price }) => (
      <div style={{ background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '11px 8px 9px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
        <span style={{ fontSize: 24 }}>{glyph}</span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11, color: SPROUT.ink, textAlign: 'center', lineHeight: 1.15 }}>{name}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon.Gem size={11} color={GEM} /><span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: SPROUT.ink }}>{price}</span></span>
      </div>
    );
    return (
      <AppChrome top="hud" nav="me">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 14px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <Tile glyph="🛡️" name="Streak Freeze" price="120" />
            <Tile glyph="✨" name="Double seeds" price="90" />
            <Tile glyph="⏱️" name="Timer boost" price="60" />
            <Tile glyph="🪴" name="Plant pot" price="200" />
            <Tile glyph="🌸" name="Rare bloom" price="350" />
            <Tile glyph="🌼" name="Bloom bundle" price="150" />
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: quiet grouped sections, one clean row each.
  const Row = ({ icon, tint, name, sub, price }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 3px' }}>
      <span style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 13, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.15 }}>{name}</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 10.5, fontWeight: 600, color: SPROUT.mute, lineHeight: 1.25, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>
      </div>
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, background: '#EAF6E2', borderRadius: 999, padding: '5px 11px' }}>
        <Icon.Gem size={12} color={SPROUT.greenDark} />
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: SPROUT.greenDark }}>{price}</span>
      </span>
    </div>
  );
  const Section = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, paddingLeft: 3, marginBottom: 2 }}>{label}</div>
      {React.Children.map(children, (c, i) => (
        <div style={{ borderTop: i ? '1px solid ' + SPROUT.bg : 'none' }}>{c}</div>
      ))}
    </div>
  );

  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* shop title + gem-balance pill */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px 8px', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 999, padding: '4px 11px 4px 9px' }}>
            <Icon.Gem size={13} color={GEM} />
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>420</span>
          </span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '4px 14px 10px', minHeight: 0 }}>
          <Section label="Keep your streak">
            <Row icon={<Icon.Shield size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Streak Freeze" sub="Protect your garden if you miss a day" price="120" />
          </Section>
          <Section label="Power-ups">
            <Row icon={<Icon.Sparkle size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Double seeds" sub="2× seeds for 30 min" price="90" />
            <Row icon={<Icon.Clock size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Timer boost" sub="Extra time on timed lessons" price="60" />
          </Section>
          <Section label="Garden & decor">
            <Row icon={<Icon.Plant size={17} color={SPROUT.greenDark} />} tint="#FBF1DA" name="Plant pot" sub="A new home to grow a bloom" price="200" />
            <Row icon={<Icon.Leaf size={17} color={SPROUT.greenDark} />} tint="#FBF1DA" name="Rare bloom" sub="A special garden flower" price="350" />
          </Section>
        </div>
      </div>
    </AppChrome>
  );
}

function CurrentStreakFlame() {
  // CURRENT: the streak shown only as a lone flame + big count, no month context.
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '16px', minHeight: 0 }}>
        <span style={{ width: 64, height: 64, borderRadius: '50%', background: SPROUT.green, boxShadow: '0 5px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.Leaf size={32} color="#fff" />
        </span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 34, color: SPROUT.ink, lineHeight: 1 }}>13</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute }}>day streak</span>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Garden streak calendar v2 (two-stat header + 7/14/30 ribbon + leaf month grid) ──
function ProposedGardenStreakCalV2({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakFlame />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const CURRENT_STREAK = 13;
  const miles = [7, 14, 30];
  const segFill = (lo, hi) => Math.max(0, Math.min(1, (CURRENT_STREAK - lo) / (hi - lo)));
  const RUN_START = SK.TODAY - (CURRENT_STREAK - 1);
  const Stat = ({ label, value, flame }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {flame && <Icon.Leaf size={13} color={DEEP} />}
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16, color: DEEP }}>{value}</span>
      </span>
    </div>
  );
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, padding: '12px 16px', minHeight: 0 }}>
        {/* (1) two-stat header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Stat label="Current streak" value="13" flame />
          <div style={{ width: 1, alignSelf: 'stretch', background: SPROUT.line }} />
          <Stat label="Next milestone" value="14" />
        </div>

        {/* (2) 7 / 14 / 30 milestone ribbon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {miles.map((m, k) => {
            const lo = k === 0 ? 0 : miles[k - 1];
            const fill = segFill(lo, m);
            const reached = CURRENT_STREAK >= m;
            const isNext = !reached && (k === 0 || CURRENT_STREAK >= miles[k - 1]);
            return (
              <React.Fragment key={m}>
                <div style={{ flex: 1, height: 5, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}>
                  <div style={{ width: (fill * 100) + '%', height: '100%', borderRadius: 999, background: DEEP }} />
                </div>
                <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: reached ? DEEP : (isNext ? '#EAF6E2' : '#fff'), border: '2px solid ' + (reached || isNext ? DEEP : SPROUT.cream2) }}>
                  {reached ? <Icon.Leaf size={10} color="#fff" /> : <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 9, color: isNext ? DEEP : SPROUT.mute }}>{m}</span>}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* (3) month grid with leaf glyphs + today ring */}
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>June 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
            const watered = i >= RUN_START && i <= SK.TODAY;
            const isToday = i === SK.TODAY;
            const future = i > SK.TODAY;
            if (watered) {
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isToday ? '0 0 0 2px ' + DEEP : 'none' }}>
                    <Icon.Leaf size={13} color={DEEP} />
                  </span>
                </div>
              );
            }
            return (
              <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: '50%', border: '1.5px solid ' + SPROUT.line, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: SPROUT.mute }}>{(i % 30) + 1}</span>
              </div>
            );
          })}
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Streak milestone track (7/14/30 rail above a per-day leaf month grid) ──
function ProposedMilestoneTrackLeaf({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const CURRENT_STREAK = 5;
  const miles = [7, 14, 30];
  const segFill = (lo, hi) => Math.max(0, Math.min(1, (CURRENT_STREAK - lo) / (hi - lo)));
  const gridW = skGridW();
  // run of watered days = the 5-day current streak ending at today
  const RUN_START = SK.TODAY - (CURRENT_STREAK - 1);
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 13, padding: '12px 16px', minHeight: 0 }}>
        {/* milestone track: 7 / 14 / 30 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {miles.map((m, k) => {
            const lo = k === 0 ? 0 : miles[k - 1];
            const fill = segFill(lo, m);
            const reached = CURRENT_STREAK >= m;
            const isNext = !reached && (k === 0 || CURRENT_STREAK >= miles[k - 1]);
            return (
              <React.Fragment key={m}>
                <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}>
                  <div style={{ width: (fill * 100) + '%', height: '100%', borderRadius: 999, background: DEEP }} />
                </div>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: reached ? DEEP : (isNext ? '#EAF6E2' : '#fff'),
                  border: '2px solid ' + (reached || isNext ? DEEP : SPROUT.cream2),
                  boxShadow: isNext ? '0 0 0 3px ' + GREEN + '33' : 'none'
                }}>
                  {reached ? <Icon.Leaf size={12} color="#fff" /> : <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10, color: isNext ? DEEP : SPROUT.mute }}>{m}</span>}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* month grid: leaf glyph on each watered day, today ringed, milestone day starred */}
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>June 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
            const watered = i >= RUN_START && i <= SK.TODAY;
            const isToday = i === SK.TODAY;
            const isMile = i === SK.TODAY + 2; // upcoming milestone day to aim for
            const future = i > SK.TODAY;
            if (watered) {
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isToday ? '0 0 0 2px ' + DEEP : 'none' }}>
                    <Icon.Leaf size={13} color={DEEP} />
                  </span>
                </div>
              );
            }
            if (isMile) {
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', border: '1.5px dashed #C2871B', background: '#FBF1DA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon.Star size={12} color="#C2871B" />
                  </span>
                </div>
              );
            }
            return (
              <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: '50%', border: '1.5px solid ' + SPROUT.line, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: SPROUT.mute }}>{(i % 30) + 1}</span>
              </div>
            );
          })}
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

function ProposedMilestoneRail({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e', FILL = '#CDEBBE';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const CURRENT_STREAK = 13;
  const miles = [7, 14, 30];
  const segFill = (lo, hi) => Math.max(0, Math.min(1, (CURRENT_STREAK - lo) / (hi - lo)));
  // connected-band run across the grid rows
  const cellX = (c) => SK.PX + c * (SK.C + SK.G);
  const cellY = (r) => r * (SK.C + SK.G);
  const gridW = skGridW();
  const segs = [];
  for (let r = 0; r < SK.ROWS; r++) {
    let lo = null, hi = null;
    for (let c = 0; c < SK.COLS; c++) {
      const i = r * SK.COLS + c;
      if (i >= SK.START && i <= SK.TODAY) { if (lo === null) lo = c; hi = c; }
    }
    if (lo !== null) segs.push({ r, lo, hi });
  }
  const tiles = [
    ['Current', '13', <Icon.Leaf size={14} color={DEEP} />, '#EAF6E2', DEEP],
    ['Next milestone', '14', <Icon.Star size={14} color="#C2871B" />, '#FBF1DA', '#C2871B'],
    ['Freezes', '2', <Icon.Droplet size={14} color="#2E8FB0" />, '#E5F2F8', '#2E8FB0'],
  ];
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '10px 16px', minHeight: 0 }}>
        {/* (1) slim milestone rail: 7 / 14 / 30 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {miles.map((m, k) => {
            const lo = k === 0 ? 0 : miles[k - 1];
            const fill = segFill(lo, m);
            const reached = CURRENT_STREAK >= m;
            const isNext = !reached && (k === 0 || CURRENT_STREAK >= miles[k - 1]);
            return (
              <React.Fragment key={m}>
                <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}>
                  <div style={{ width: (fill * 100) + '%', height: '100%', borderRadius: 999, background: DEEP }} />
                </div>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: reached ? DEEP : (isNext ? '#EAF6E2' : '#fff'),
                  border: '2px solid ' + (reached || isNext ? DEEP : SPROUT.cream2),
                  boxShadow: isNext ? '0 0 0 3px ' + GREEN + '33' : 'none'
                }}>
                  {reached ? <Icon.Leaf size={10} color="#fff" /> : <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 8, color: isNext ? DEEP : SPROUT.mute }}>{m}</span>}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* (2) centered hero: Pip + sprout-flame glyph + big streak number */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <Pip size={46} mood="cheer" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.Flame size={30} color={GREEN} />
              <span style={{ position: 'absolute' }}><Icon.Leaf size={13} color="#fff" /></span>
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 30, color: DEEP, letterSpacing: '-.02em' }}>13</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.12em', textTransform: 'uppercase', color: SPROUT.mute, marginTop: 2 }}>Day streak</span>
            </div>
          </div>
        </div>

        {/* (3) three quiet stat tiles */}
        <div style={{ display: 'flex', gap: 8 }}>
          {tiles.map(([lab, val, ic, tint, col]) => (
            <div key={lab} style={{ flex: 1, background: tint, border: '1.5px solid ' + col + '33', borderRadius: 12, padding: '8px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              {ic}
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: col, lineHeight: 1 }}>{val}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.mute }}>{lab}</span>
            </div>
          ))}
        </div>

        {/* (4) monthly grid — consecutive watered days joined into one green band */}
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: SPROUT.ink }}>June 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW }}>
          {segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: cellY(s.r) + 1,
              width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 2, height: SK.C, borderRadius: 999, background: FILL, zIndex: 1
            }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const watered = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const future = i > SK.TODAY;
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', opacity: future ? 0.5 : 1 }}>
                  {isToday ? (
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 3px ' + GREEN + '55' }}>
                      <Icon.Leaf size={12} color="#fff" />
                    </span>
                  ) : (
                    <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: watered ? DEEP : SPROUT.mute }}>{((i) % 31) + 1}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Glanceable Me stats grid (stacked rows → calm 2×2 grid) ──
function ProposedMeStatsGrid({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const DEEP = '#3fa52e';
  const stats = [
    { icon: (s) => <Icon.Flame size={s} color={DEEP} />, val: '13 days', label: 'Streak' },
    { icon: (s) => <Icon.Sparkle size={s} color={DEEP} />, val: '1,240', label: 'Seeds' },
    { icon: (s) => <Icon.Shield size={s} color={DEEP} />, val: 'Silver', label: 'League' },
    { icon: (s) => <Icon.Book size={s} color={DEEP} />, val: '84', label: 'Words grown' },
  ];

  // avatar header — shared verbatim between CURRENT and NEW
  const Header = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 2px 2px' }}>
      <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#EAF6E2', border: '2px solid ' + DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Pip size={38} mood="happy" />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16, color: SPROUT.ink, lineHeight: 1.1 }}>Robin</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11.5, color: SPROUT.mute }}>Joined March 2026</div>
      </div>
    </div>
  );

  // achievements/settings below the stats — shared verbatim, kept unchanged
  const Below = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, paddingLeft: 3 }}>Achievements</div>
      {[['🌱', 'First sprout', 'Grew your first word'], ['🔥', 'Two weeks strong', '13-day streak going']].map(([g, t, s]) => (
        <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '10px 12px' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: SPROUT.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{g}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink, lineHeight: 1.15 }}>{t}</div>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 10.5, color: SPROUT.mute }}>{s}</div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, padding: '14px 14px', minHeight: 0 }}>
        <Header />
        {isNew ? (
          // NEW: calm 2×2 grid of equal stat tiles
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {stats.map((s) => (
              <div key={s.label} style={{ background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 16, padding: '13px 13px', display: 'flex', flexDirection: 'column', gap: 7, minHeight: 78, boxSizing: 'border-box' }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon(17)}</span>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 19, color: SPROUT.ink, lineHeight: 1 }}>{s.val}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: '#7B8A72' }}>{s.label}</span>
              </div>
            ))}
          </div>
        ) : (
          // CURRENT: the same four numbers as separate stacked rows / loose blocks
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.map((s) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 12, padding: '11px 13px' }}>
                <span style={{ width: 26, height: 26, borderRadius: 8, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon(15)}</span>
                <span style={{ flex: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: '#7B8A72' }}>{s.label}</span>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: SPROUT.ink }}>{s.val}</span>
              </div>
            ))}
          </div>
        )}
        <Below />
      </div>
    </AppChrome>
  );
}

// ── Proposed · Weekly streak garden row (number card → glanceable 7-day row) ──
function ProposedWeekStreakRow({ mode = 'proposed' }) {
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  if (mode === 'current') {
    // CURRENT: the streak is just a number on a card — momentum invisible.
    return (
      <AppChrome top="hud" nav="me">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '24px 20px', minHeight: 0 }}>
          <div style={{ width: '100%', background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 18, padding: '26px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, boxShadow: '0 8px 22px -14px rgba(42,35,32,.35)' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: '.18em', textTransform: 'uppercase', color: SPROUT.mute }}>Streak now</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 64, lineHeight: 1, color: DEEP, letterSpacing: '-.02em' }}>13</span>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 16, color: SPROUT.mute }}>days</span>
            </div>
            <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 12.5, fontWeight: 700, color: SPROUT.mute }}>Keep it going!</span>
          </div>
        </div>
      </AppChrome>
    );
  }

  const days = [
    { l: 'S', state: 'done' }, { l: 'M', state: 'done' }, { l: 'T', state: 'done' },
    { l: 'W', state: 'done' }, { l: 'T', state: 'today' }, { l: 'F', state: 'future' }, { l: 'S', state: 'future' },
  ];
  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '20px 18px', minHeight: 0 }}>
        {/* (1) headline + Pip with a little watering can */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="exp-bob" style={{ position: 'relative', flexShrink: 0 }}>
            <Pip size={56} mood="cheer" />
            <span style={{ position: 'absolute', right: -10, bottom: 2, fontSize: 20 }} role="img" aria-label="watering can">🪴</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 26, lineHeight: 1, color: DEEP, letterSpacing: '-.01em' }}>13-day</span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 17, color: SPROUT.ink, marginTop: 2 }}>streak</span>
          </div>
        </div>

        {/* (2) the weekly streak row */}
        <div style={{ display: 'flex', gap: 9 }}>
          {days.map((d, i) => {
            const done = d.state === 'done';
            const today = d.state === 'today';
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, fontWeight: 700, color: today ? DEEP : SPROUT.mute }}>{d.l}</span>
                <div style={{ position: 'relative', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {today && (
                    <React.Fragment>
                      <span className="exp-halo" aria-hidden style={{ position: 'absolute', width: 32, height: 32, borderRadius: '50%', border: '3px solid ' + GREEN }} />
                      <span className="exp-halo" aria-hidden style={{ position: 'absolute', width: 32, height: 32, borderRadius: '50%', border: '3px solid ' + GREEN, animationDelay: '1.2s' }} />
                    </React.Fragment>
                  )}
                  <span style={{
                    width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1,
                    background: done ? GREEN : (today ? '#EAF6E2' : 'transparent'),
                    border: today ? '2px solid ' + DEEP : (done ? 'none' : '1.5px solid ' + SPROUT.cream2)
                  }}>
                    {done ? <Icon.Leaf size={15} color="#fff" /> : today ? <Icon.Leaf size={14} color={DEEP} /> : null}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* (3) quiet streak-freeze chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 999, padding: '8px 14px 8px 11px' }}>
          <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#E5F2F8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Shield size={14} color="#2E8FB0" /></span>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, color: SPROUT.ink }}>Freeze a day</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.08em', textTransform: 'uppercase', color: SPROUT.mute, background: SPROUT.bg, borderRadius: 999, padding: '3px 8px' }}>2 left</span>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Teachable wrong-answer drawer (adds replay button on answer + one-line "why" tip) ──
function ProposedTeachableWrong({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const CLAY = '#ff8a80';
  const rows = [
    { label: 'Good morning', state: 'wrong' },
    { label: 'Good evening', state: 'correct' },
    { label: 'See you soon', state: 'idle' },
  ];
  return (
    <AppChrome top="exercise">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* answered question — identical in both modes */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, padding: '10px 16px' }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, color: SPROUT.ink, textAlign: 'center', marginBottom: 1 }}>Which phrase greets someone in the evening?</div>
          {rows.map((r, i) => {
            const wrong = r.state === 'wrong', correct = r.state === 'correct';
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 11, padding: '10px 13px', borderRadius: 13,
                background: wrong ? '#FFF1EF' : (correct ? '#EAF6E2' : '#fff'),
                border: '2px solid ' + (wrong ? CLAY : (correct ? SPROUT.green : SPROUT.line))
              }}>
                <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13.5, color: wrong ? '#C7584F' : (correct ? SPROUT.greenDark : SPROUT.ink) }}>{r.label}</span>
                {wrong && <Icon.XCircle size={18} color={CLAY} />}
                {correct && <Icon.CheckCircle size={18} color={SPROUT.green} />}
              </div>
            );
          })}
        </div>

        {/* the feedback drawer — the ONLY element that differs */}
        <div style={{
          background: '#ffece9', borderTopLeftRadius: 22, borderTopRightRadius: 22,
          borderTop: '1.5px solid ' + CLAY + '55', padding: '13px 16px 14px',
          boxShadow: '0 -12px 28px -18px rgba(42,35,32,.4)', display: 'flex', flexDirection: 'column', gap: isNew ? 8 : 9
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon.XCircle size={22} color={CLAY} />
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16, color: CLAY }}>Not quite</span>
          </div>
          {isNew ? (
            <React.Fragment>
              {/* (a) correct answer line + round replay/speaker button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: '#C7584F' }}>Answer</span>
                  <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: '#B5483F' }}>Good evening</div>
                </div>
                <span style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: '#fff', border: '1.5px solid ' + CLAY + '66', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.Volume size={16} color={CLAY} />
                </span>
              </div>
              {/* (b) one-line "why" tip — English grammar, calm */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, background: '#fff7f5', border: '1px solid ' + CLAY + '33', borderRadius: 11, padding: '8px 11px' }}>
                <Icon.Sparkle size={14} color="#C7584F" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11, color: '#9A6B66', lineHeight: 1.3 }}>“Evening” is the time after sunset — greet it with “Good evening.”</span>
              </div>
              <div style={{ background: CLAY, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.08em', padding: '11px 0', borderRadius: 13, boxShadow: '0 4px 0 #E0726A', marginTop: 1 }}>CONTINUE</div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: '#C7584F' }}>Answer</span>
                <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: '#B5483F' }}>Good evening</div>
              </div>
              <div style={{ background: CLAY, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.08em', padding: '11px 0', borderRadius: 13, boxShadow: '0 4px 0 #E0726A' }}>CONTINUE</div>
            </React.Fragment>
          )}
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Explain-my-mistake feedback (wrong drawer → adds Meaning + Explain secondary + report flag) ──
function ProposedExplainMistake({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const CLAY = '#ff8a80';
  const rows = [
    { label: 'Good morning', state: 'wrong' },   // the learner's pick
    { label: 'Good evening', state: 'correct' },  // the right answer
    { label: 'See you soon', state: 'idle' },
  ];
  const FlagGlyph = ({ c }) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></svg>
  );
  return (
    <AppChrome top="exercise">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* answered question — identical in both modes */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, padding: '10px 16px' }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, color: SPROUT.ink, textAlign: 'center', marginBottom: 1 }}>Which phrase greets someone in the evening?</div>
          {rows.map((r, i) => {
            const wrong = r.state === 'wrong', correct = r.state === 'correct';
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 11, padding: '10px 13px', borderRadius: 13,
                background: wrong ? '#FFF1EF' : (correct ? '#EAF6E2' : '#fff'),
                border: '2px solid ' + (wrong ? CLAY : (correct ? SPROUT.green : SPROUT.line))
              }}>
                <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13.5, color: wrong ? '#C7584F' : (correct ? SPROUT.greenDark : SPROUT.ink) }}>{r.label}</span>
                {wrong && <Icon.XCircle size={18} color={CLAY} />}
                {correct && <Icon.CheckCircle size={18} color={SPROUT.green} />}
              </div>
            );
          })}
        </div>

        {/* the feedback drawer — the ONLY element that differs */}
        {isNew ? (
          <div style={{
            position: 'relative', background: '#ffece9', borderTopLeftRadius: 22, borderTopRightRadius: 22,
            borderTop: '1.5px solid ' + CLAY + '55', padding: '13px 16px 14px',
            boxShadow: '0 -12px 28px -18px rgba(42,35,32,.4)', display: 'flex', flexDirection: 'column', gap: 8
          }}>
            {/* (3) quiet report-flag, top-right */}
            <span style={{ position: 'absolute', top: 12, right: 14, width: 24, height: 24, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.85 }}>
              <FlagGlyph c="#B79490" />
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon.XCircle size={22} color={CLAY} />
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16, color: CLAY }}>Not quite</span>
            </div>
            <div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: '#C7584F' }}>Answer</span>
              <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: '#B5483F' }}>Good evening</div>
            </div>
            {/* (1) quiet Meaning line */}
            <div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9A6B66' }}>Meaning</span>
              <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11.5, color: '#9A6B66' }}>A polite hello used after dark</div>
            </div>
            {/* (2) secondary outline "Explain my mistake" ABOVE the primary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 1 }}>
              <div style={{ background: '#fffdf7', color: SPROUT.greenDark, textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, letterSpacing: '.06em', padding: '9px 0', borderRadius: 12, border: '1.5px solid ' + SPROUT.greenDark }}>EXPLAIN MY MISTAKE</div>
              <div style={{ background: CLAY, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.08em', padding: '11px 0', borderRadius: 13, boxShadow: '0 4px 0 #E0726A' }}>GOT IT</div>
            </div>
          </div>
        ) : (
          // CURRENT: result + correct answer + a single Continue button — a dead end.
          <div style={{
            background: '#ffece9', borderTopLeftRadius: 22, borderTopRightRadius: 22,
            borderTop: '1.5px solid ' + CLAY + '55', padding: '13px 16px 14px',
            boxShadow: '0 -12px 28px -18px rgba(42,35,32,.4)', display: 'flex', flexDirection: 'column', gap: 9
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon.XCircle size={22} color={CLAY} />
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16, color: CLAY }}>Not quite</span>
            </div>
            <div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: '#C7584F' }}>Answer</span>
              <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: '#B5483F' }}>Good evening</div>
            </div>
            <div style={{ background: CLAY, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.08em', padding: '11px 0', borderRadius: 13, boxShadow: '0 4px 0 #E0726A' }}>GOT IT</div>
          </div>
        )}
      </div>
    </AppChrome>
  );
}

// ── Proposed · Calm wrong-answer feedback drawer (harsh bar → teaching sheet) ──
function ProposedWrongDrawer({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const CLAY = '#ff8a80';
  const rows = [
    { label: 'Good morning', state: 'wrong' },   // the learner's pick
    { label: 'Good evening', state: 'correct' },  // the right answer
    { label: 'See you soon', state: 'idle' },
  ];
  return (
    <AppChrome top="exercise">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* answered question — identical in both modes */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, padding: '10px 16px' }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, color: SPROUT.ink, textAlign: 'center', marginBottom: 1 }}>Which phrase greets someone in the evening?</div>
          {rows.map((r, i) => {
            const wrong = r.state === 'wrong', correct = r.state === 'correct';
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 11, padding: '10px 13px', borderRadius: 13,
                background: wrong ? '#FFF1EF' : (correct ? '#EAF6E2' : '#fff'),
                border: '2px solid ' + (wrong ? CLAY : (correct ? SPROUT.green : SPROUT.line))
              }}>
                <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13.5, color: wrong ? '#C7584F' : (correct ? SPROUT.greenDark : SPROUT.ink) }}>{r.label}</span>
                {wrong && <Icon.XCircle size={18} color={CLAY} />}
                {correct && <Icon.CheckCircle size={18} color={SPROUT.green} />}
              </div>
            );
          })}
        </div>

        {/* the feedback drawer — the ONLY element that differs */}
        {isNew ? (
          <div style={{
            background: '#ffece9', borderTopLeftRadius: 22, borderTopRightRadius: 22,
            borderTop: '1.5px solid ' + CLAY + '55', padding: '13px 16px 14px',
            boxShadow: '0 -12px 28px -18px rgba(42,35,32,.4)', display: 'flex', flexDirection: 'column', gap: 9
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon.XCircle size={22} color={CLAY} />
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16, color: CLAY }}>Not quite</span>
            </div>
            <div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: '#C7584F' }}>Answer</span>
              <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: '#B5483F' }}>Good evening · a polite hello used after dark</div>
            </div>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11.5, color: '#9A6B66', textDecoration: 'underline', textUnderlineOffset: 2, alignSelf: 'flex-start' }}>Why this answer?</div>
            <div style={{ background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.08em', padding: '11px 0', borderRadius: 13, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>CONTINUE</div>
          </div>
        ) : (
          // CURRENT: a flat clay bar — just the result + a Continue button, no teaching.
          <div style={{ background: CLAY, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: '#fff' }}>Incorrect</span>
            <span style={{ background: '#fff', color: '#C7584F', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, letterSpacing: '.06em', padding: '9px 18px', borderRadius: 12 }}>CONTINUE</span>
          </div>
        )}
      </div>
    </AppChrome>
  );
}

// ── Proposed · Calm feedback drawer (flat strip → state-tinted grouped sheet, CORRECT state) ──
function ProposedCalmFeedbackDrawer({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const rows = [
    { label: 'Good evening', state: 'correct' },  // the learner's pick = right
    { label: 'Good morning', state: 'idle' },
    { label: 'See you soon', state: 'idle' },
  ];
  return (
    <AppChrome top="exercise">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* answered question — identical in both modes */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, padding: '10px 16px' }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, color: SPROUT.ink, textAlign: 'center', marginBottom: 1 }}>Which phrase greets someone in the evening?</div>
          {rows.map((r, i) => {
            const correct = r.state === 'correct';
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 11, padding: '10px 13px', borderRadius: 13,
                background: correct ? '#EAF6E2' : '#fff',
                border: '2px solid ' + (correct ? SPROUT.green : SPROUT.line)
              }}>
                <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13.5, color: correct ? SPROUT.greenDark : SPROUT.ink }}>{r.label}</span>
                {correct && <Icon.CheckCircle size={18} color={SPROUT.green} />}
              </div>
            );
          })}
        </div>

        {/* the feedback drawer — the ONLY element that differs */}
        {isNew ? (
          <div style={{
            background: '#EAF6E2', borderTopLeftRadius: 22, borderTopRightRadius: 22,
            borderTop: '1.5px solid ' + SPROUT.green + '55', padding: '14px 16px 15px',
            boxShadow: '0 -12px 28px -18px rgba(42,35,32,.4)', display: 'flex', flexDirection: 'column', gap: 10
          }}>
            {/* (1) status row: icon + praise word + earned-seeds chip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon.CheckCircle size={22} color={SPROUT.greenDark} />
              <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16, color: SPROUT.greenDark }}>In bloom!</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#fff', border: '1.5px solid ' + SPROUT.green + '66', borderRadius: 999, padding: '3px 9px 3px 7px' }}>
                <Icon.Sparkle size={12} color="#E5A93A" />
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11.5, color: SPROUT.greenDark }}>+12</span>
              </span>
            </div>
            {/* (2) correct-answer line + one-line meaning */}
            <div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: '#5a7a4e' }}>Answer</span>
              <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.greenDark }}>Good evening · a polite hello used after dark</div>
            </div>
            {/* (3) quiet explain link */}
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: '#6b8a5e', fontWeight: 700, alignSelf: 'flex-start' }}>Explain this</div>
            {/* (4) primary continue */}
            <div style={{ background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.08em', padding: '11px 0', borderRadius: 13, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>CONTINUE</div>
          </div>
        ) : (
          // CURRENT: a flat green result strip — verdict + Continue, nothing grouped.
          <div style={{ background: SPROUT.green, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: '#fff' }}>Correct!</span>
            <span style={{ background: '#fff', color: SPROUT.greenDark, fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, letterSpacing: '.06em', padding: '9px 18px', borderRadius: 12 }}>CONTINUE</span>
          </div>
        )}
      </div>
    </AppChrome>
  );
}

// ── Proposed · Next-to-bloom plot in the Garden (empty plot → highlighted next plot w/ progress ring) ──
function ProposedGardenNextPlot({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const NextPlot = () => {
    // soil mound with a soft dashed outline + a calm progress ring (3/5)
    const pct = 3 / 5;
    return (
      <span style={{ position: 'relative', width: 46, height: 46, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', flexShrink: 0 }}>
        {!isNew ? (
          // CURRENT: just blank dirt — a plain soil mound, no highlight
          <span style={{ width: 30, height: 15, borderRadius: '50% 50% 40% 40% / 80% 80% 40% 40%', background: '#C7A77B' }} />
        ) : (
          <React.Fragment>
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'conic-gradient(' + DEEP + ' ' + (pct * 360) + 'deg, #DDEFD0 ' + (pct * 360) + 'deg)' }} />
            <span style={{ position: 'absolute', inset: 4, borderRadius: '50%', border: '1.5px dashed ' + GREEN, background: 'rgba(255,253,247,0.65)' }} />
            <span style={{ position: 'relative', width: 26, height: 13, marginBottom: 7, borderRadius: '50% 50% 40% 40% / 80% 80% 40% 40%', background: '#C7A77B' }}>
              <span style={{ position: 'absolute', top: -5, left: '50%', transform: 'translateX(-50%)', fontSize: 11 }}>🌱</span>
            </span>
          </React.Fragment>
        )}
      </span>
    );
  };
  const garden = (
    <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #EAF6FB 0%, #F3F7E8 52%, #E4F0D2 100%)' }} />
      <div style={{ position: 'absolute', top: 16, right: 22, width: 34, height: 34, borderRadius: '50%', background: 'radial-gradient(circle, #FFE08A, #F5C23D)', boxShadow: '0 0 22px -2px rgba(245,194,61,.6)' }} />
      <div style={{ position: 'absolute', left: -20, right: -20, bottom: 0, height: '52%', background: '#CDE6A6', borderTopLeftRadius: '60% 80%', borderTopRightRadius: '55% 75%' }} />
      <div style={{ position: 'absolute', left: -20, right: -20, bottom: 0, height: '34%', background: '#B6D98A', borderTopLeftRadius: '55% 70%', borderTopRightRadius: '60% 80%' }} />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 2, padding: '0 14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', fontSize: 26, filter: 'drop-shadow(0 3px 2px rgba(60,90,40,.18))' }}>
          <span>🌳</span><span style={{ fontSize: 30 }}>🌻</span><span>🌲</span><span style={{ fontSize: 22 }}>🌷</span><span>🌳</span>
        </div>
        {/* bottom row ends with the next plot in place of a grown plant */}
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', fontSize: 23, filter: 'drop-shadow(0 3px 2px rgba(60,90,40,.18))' }}>
          <span>🌷</span><span style={{ fontSize: 20 }}>🌱</span><span>🌸</span><span style={{ fontSize: 27 }}>🌹</span>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <NextPlot />
            {isNew && <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 700, color: DEEP, whiteSpace: 'nowrap' }}>Next · 3/5</span>}
          </span>
        </div>
      </div>
    </div>
  );
  return <AppChrome top="hud" nav="home">{garden}</AppChrome>;
}

// ── Proposed · Garden plant-detail sheet (decorative garden → tappable bloom w/ detail sheet) ──
function ProposedGardenPlantDetail({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const garden = (
    <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #EAF6FB 0%, #F3F7E8 52%, #E4F0D2 100%)' }} />
      <div style={{ position: 'absolute', top: 16, right: 22, width: 34, height: 34, borderRadius: '50%', background: 'radial-gradient(circle, #FFE08A, #F5C23D)', boxShadow: '0 0 22px -2px rgba(245,194,61,.6)' }} />
      <div style={{ position: 'absolute', left: -20, right: -20, bottom: 0, height: '52%', background: '#CDE6A6', borderTopLeftRadius: '60% 80%', borderTopRightRadius: '55% 75%' }} />
      <div style={{ position: 'absolute', left: -20, right: -20, bottom: 0, height: '34%', background: '#B6D98A', borderTopLeftRadius: '55% 70%', borderTopRightRadius: '60% 80%' }} />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 2, padding: '0 14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', fontSize: 26, filter: 'drop-shadow(0 3px 2px rgba(60,90,40,.18))' }}>
          <span>🌳</span><span style={{ fontSize: 30 }}>🌻</span><span>🌲</span><span style={{ fontSize: 22 }}>🌷</span><span>🌳</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', fontSize: 23, filter: 'drop-shadow(0 3px 2px rgba(60,90,40,.18))' }}>
          <span>🌷</span><span style={{ fontSize: 20 }}>🌱</span><span>🌸</span><span style={{ fontSize: 27 }}>🌹</span><span>🌼</span><span style={{ fontSize: 19 }}>🌱</span>
        </div>
      </div>
    </div>
  );

  return (
    <AppChrome top="hud" nav="home">
      <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {garden}
        {isNew && (
          <React.Fragment>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(42,35,32,.28)', zIndex: 1 }} />
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 2, background: SPROUT.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22, boxShadow: '0 -12px 28px -16px rgba(42,35,32,.45)', padding: '13px 16px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 34, height: 4, borderRadius: 999, background: SPROUT.cream2 }} />
              {/* hero bloom in rounded frame */}
              <span style={{ width: 70, height: 70, borderRadius: 20, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, boxShadow: '0 4px 12px -4px rgba(60,90,40,.25)' }}>🌷</span>
              {/* name + species line */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 17, color: SPROUT.greenDark }}>Sunrise Tulip</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, marginTop: 3 }}>From Unit 1 · Sprout Basics</div>
              </div>
              {/* status pill */}
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#EAF6E2', border: '1px solid ' + SPROUT.green + '66', borderRadius: 999, padding: '4px 12px' }}>
                <Icon.Leaf size={12} color={SPROUT.greenDark} />
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11, color: SPROUT.greenDark }}>In full bloom</span>
              </span>
              {/* stat line */}
              <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 11, color: SPROUT.mute }}>Grew from 12 words · bloomed Jun 3</div>
              {/* primary + secondary actions */}
              <div style={{ width: '100%', marginTop: 2, background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.04em', padding: '12px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Water to keep growing</div>
              <div style={{ display: 'flex', gap: 22, marginTop: 1 }}>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11.5, color: SPROUT.greenDark }}>View words</span>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11.5, color: SPROUT.mute }}>Share</span>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    </AppChrome>
  );
}

// ── Proposed · Garden growth summary band (passive garden → one calm meaning band) ──
function ProposedGardenSummary({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  // a calm decorative garden scene — identical in both modes
  const garden = (
    <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden' }}>
      {/* soft sky → meadow wash */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #EAF6FB 0%, #F3F7E8 52%, #E4F0D2 100%)' }} />
      {/* sun */}
      <div style={{ position: 'absolute', top: 16, right: 22, width: 34, height: 34, borderRadius: '50%', background: 'radial-gradient(circle, #FFE08A, #F5C23D)', boxShadow: '0 0 22px -2px rgba(245,194,61,.6)' }} />
      {/* rolling hill */}
      <div style={{ position: 'absolute', left: -20, right: -20, bottom: 0, height: '52%', background: '#CDE6A6', borderTopLeftRadius: '60% 80%', borderTopRightRadius: '55% 75%' }} />
      <div style={{ position: 'absolute', left: -20, right: -20, bottom: 0, height: '34%', background: '#B6D98A', borderTopLeftRadius: '55% 70%', borderTopRightRadius: '60% 80%' }} />
      {/* planted rows of grown flora (content emoji — kept per brand) */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 2, padding: '0 14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', fontSize: 26, filter: 'drop-shadow(0 3px 2px rgba(60,90,40,.18))' }}>
          <span>🌳</span><span style={{ fontSize: 30 }}>🌻</span><span>🌲</span><span style={{ fontSize: 22 }}>🌷</span><span>🌳</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', fontSize: 23, filter: 'drop-shadow(0 3px 2px rgba(60,90,40,.18))' }}>
          <span>🌷</span><span style={{ fontSize: 20 }}>🌱</span><span>🌸</span><span style={{ fontSize: 27 }}>🌹</span><span>🌼</span><span style={{ fontSize: 19 }}>🌱</span>
        </div>
      </div>
    </div>
  );

  return (
    <AppChrome top="hud" nav="home">
      {/* the ONLY change: one calm summary band under the HUD, above the garden */}
      {isNew && (
        <div style={{ flexShrink: 0, padding: '11px 16px 10px', borderBottom: '1px solid ' + SPROUT.line, background: SPROUT.bg }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon.Leaf size={13} color="#3fa52e" />
            </span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink }}>34 plants</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: SPROUT.cream2 }} />
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: '#3fa52e' }}>12-day streak</span>
          </div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 11.5, color: SPROUT.mute, marginTop: 3, paddingLeft: 29 }}>Finish today&rsquo;s lesson to bloom your next flower.</div>
        </div>
      )}
      {garden}
    </AppChrome>
  );
}

// ── Proposed · Garden in bloom progress band (passive garden → slim X-of-Y plots-in-bloom band) ──
function ProposedGardenBloomBand({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const garden = (
    <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #EAF6FB 0%, #F3F7E8 52%, #E4F0D2 100%)' }} />
      <div style={{ position: 'absolute', top: 16, right: 22, width: 34, height: 34, borderRadius: '50%', background: 'radial-gradient(circle, #FFE08A, #F5C23D)', boxShadow: '0 0 22px -2px rgba(245,194,61,.6)' }} />
      <div style={{ position: 'absolute', left: -20, right: -20, bottom: 0, height: '52%', background: '#CDE6A6', borderTopLeftRadius: '60% 80%', borderTopRightRadius: '55% 75%' }} />
      <div style={{ position: 'absolute', left: -20, right: -20, bottom: 0, height: '34%', background: '#B6D98A', borderTopLeftRadius: '55% 70%', borderTopRightRadius: '60% 80%' }} />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 2, padding: '0 14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', fontSize: 26, filter: 'drop-shadow(0 3px 2px rgba(60,90,40,.18))' }}>
          <span>🌳</span><span style={{ fontSize: 30 }}>🌻</span><span>🌲</span><span style={{ fontSize: 22 }}>🌷</span><span>🌳</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', fontSize: 23, filter: 'drop-shadow(0 3px 2px rgba(60,90,40,.18))' }}>
          <span>🌷</span><span style={{ fontSize: 20 }}>🌱</span><span>🌸</span><span style={{ fontSize: 27 }}>🌹</span><span>🌼</span><span style={{ fontSize: 19 }}>🌱</span>
        </div>
      </div>
    </div>
  );
  return (
    <AppChrome top="hud" nav="home">
      {/* the ONLY change: a slim garden-progress band under the header, above the garden */}
      {isNew && (
        <div style={{ flexShrink: 0, padding: '10px 16px 11px', borderBottom: '1px solid ' + SPROUT.line, background: SPROUT.bg }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon.Leaf size={12} color={DEEP} />
            </span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, color: SPROUT.ink }}>Your garden · <b style={{ color: DEEP }}>12 of 30</b> plots in bloom</span>
          </div>
          <div style={{ height: 7, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}>
            <div style={{ width: '40%', height: '100%', borderRadius: 999, background: DEEP }} />
          </div>
        </div>
      )}
      {garden}
    </AppChrome>
  );
}

// ── Proposed · Calm watering calendar (month grid of leaf-marked watered days) ──
function ProposedWateringCalendar({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['Su', 'M', 'T', 'W', 'T', 'F', 'Sa'];
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 16px', minHeight: 0 }}>
        {/* Pip + streak-count hero */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Pip size={44} mood="cheer" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 19, color: DEEP, lineHeight: 1 }}>13-day streak</span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 11, color: SPROUT.mute, marginTop: 3 }}>Watered every day this month.</span>
          </div>
        </div>

        {/* 7-column month grid */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
            const watered = i >= SK.START && i <= SK.TODAY;
            const isToday = i === SK.TODAY;
            const future = i > SK.TODAY;
            return (
              <div key={i} style={{
                width: SK.C, height: SK.C, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: isToday ? '2px solid ' + DEEP : 'none'
              }}>
                {watered ? (
                  <span style={{ width: 19, height: 19, borderRadius: '50%', background: isToday ? 'transparent' : '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon.Leaf size={12} color={DEEP} />
                  </span>
                ) : future ? (
                  <span style={{ width: 7, height: 7, borderRadius: '50%', border: '1.5px solid ' + SPROUT.cream2 }} />
                ) : (
                  <span style={{ width: 7, height: 7, borderRadius: '50%', border: '1.5px solid ' + SPROUT.cream2 }} />
                )}
              </div>
            );
          })}
        </div>

        {/* quiet two-stat records row */}
        <div style={{ display: 'flex', gap: 9 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 7, background: '#EAF6E2', border: '1.5px solid ' + GREEN + '55', borderRadius: 12, padding: '8px 11px' }}>
            <Icon.Leaf size={15} color={DEEP} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: SPROUT.ink, lineHeight: 1 }}>14 days</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.mute, marginTop: 3 }}>Longest streak</span>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 7, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 12, padding: '8px 11px' }}>
            <Icon.Droplet size={15} color="#2E8FB0" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: SPROUT.ink, lineHeight: 1 }}>92%</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.mute, marginTop: 3 }}>Best month</span>
            </div>
          </div>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Scannable Shop grid (single-column rows → 2-col card grid) ──
function ProposedScannableShop({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GEM = '#6C8AE4';
  // affordable flagged green, too-pricey muted grey-green
  const cards = [
    { art: '🛡️', tint: '#EAF6E2', name: 'Frost Cover', use: 'Protect a missed day', price: 200, afford: true },
    { art: '💧', tint: '#E5F2F8', name: 'Water Refill', use: 'Refill your daily water', price: 30, afford: true },
    { art: '🌱', tint: '#FBF1DA', name: 'Golden Bloom', use: 'Double seeds, 30 min', price: 50, afford: true },
    { art: '⏰', tint: '#F3ECFB', name: 'Timer Boost', use: 'Extra time, timed lessons', price: 600, afford: false },
  ];
  const bundles = [
    { qty: '300 gems', was: '$2.99', now: '$1.99', save: null },
    { qty: '800 gems', was: '$7.99', now: '$4.99', save: 'Save 40%' },
  ];

  const Grid = ({ asGrid }) => (
    <div style={asGrid
      ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }
      : { display: 'flex', flexDirection: 'column', gap: 8 }}>
      {cards.map((c) => (
        <div key={c.name} style={asGrid
          ? { background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '8px 9px', display: 'flex', flexDirection: 'column', gap: 4 }
          : { background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '7px 11px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: c.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{c.art}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 12.5, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.15 }}>{c.name}</div>
            <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 9.5, fontWeight: 600, color: SPROUT.mute, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.use}</div>
          </div>
          <span style={{
            alignSelf: asGrid ? 'flex-start' : 'center', display: 'inline-flex', alignItems: 'center', gap: 3,
            background: c.afford ? '#EAF6E2' : '#EDEAE0', borderRadius: 999, padding: '3px 9px'
          }}>
            <Icon.Gem size={11} color={c.afford ? SPROUT.greenDark : '#9A9482'} />
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: c.afford ? SPROUT.greenDark : '#9A9482' }}>{c.price}</span>
          </span>
        </div>
      ))}
    </div>
  );

  const body = (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, padding: '6px 14px', minHeight: 0 }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, paddingLeft: 3 }}>Power-ups</div>
      <Grid asGrid={isNew} />
      {isNew && (
        <React.Fragment>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, paddingLeft: 3, marginTop: 1 }}>Gem bundles</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {bundles.map((b) => (
              <div key={b.qty} style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 12, padding: '4px 11px' }}>
                <Icon.Gem size={16} color={GEM} />
                <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>{b.qty}</span>
                {b.save && <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.greenDark, background: '#EAF6E2', borderRadius: 999, padding: '2px 7px' }}>{b.save}</span>}
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 10.5, color: SPROUT.mute, textDecoration: 'line-through' }}>{b.was}</span>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11.5, color: '#fff', background: SPROUT.green, borderRadius: 999, padding: '4px 11px' }}>{b.now}</span>
              </div>
            ))}
          </div>
        </React.Fragment>
      )}
    </div>
  );

  return <AppChrome top="hud" nav="me">{body}</AppChrome>;
}

// ── Proposed · Streak calendar: milestone in sight ──
// Keeps the SAME month-dots grid as CURRENT; adds ONLY a two-stat header
// (Current streak / Next milestone) + a soft ring “Next bloom” marker on the
// upcoming milestone day. The dots themselves are unchanged from CURRENT.
function ProposedStreakMilestone({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const MILE2 = SK.TODAY + 3; // upcoming milestone day, 3 days out
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, padding: '14px 16px', minHeight: 0 }}>
        {/* (1) two-stat header — current streak · next milestone */}
        <div style={{ display: 'flex', gap: 9 }}>
          <div style={{ flex: 1, background: '#EAF6E2', border: '1.5px solid ' + GREEN + '55', borderRadius: 13, padding: '8px 11px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon.Leaf size={16} color={DEEP} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.04em', textTransform: 'uppercase', color: '#5a7a4e', fontWeight: 700 }}>Current streak</span>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: DEEP }}>13 days</span>
            </div>
          </div>
          <div style={{ flex: 1, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '8px 11px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></svg>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.04em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Next milestone</span>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: SPROUT.ink }}>3 days</span>
            </div>
          </div>
        </div>

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: SPROUT.ink }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
            const watered = i >= SK.START && i <= SK.TODAY;
            const future = i > SK.TODAY;
            const isMile = i === MILE2;
            if (isMile) {
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 1, left: 3, fontFamily: 'Nunito, system-ui', fontSize: 7.5, fontWeight: 800, color: DEEP }}>{(i % 31) + 1}</span>
                  <span style={{ width: 19, height: 19, borderRadius: '50%', border: '1.5px dashed ' + DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 3px ' + GREEN + '22' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></svg>
                  </span>
                </div>
              );
            }
            return (
              <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', opacity: future ? 0.5 : 1 }}>
                <span style={{ position: 'absolute', top: 1, left: 3, fontFamily: 'Nunito, system-ui', fontSize: 7.5, fontWeight: 800, color: SPROUT.mute }}>{(i % 31) + 1}</span>
                {watered && <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#9CD389' }} />}
              </div>
            );
          })}
        </div>

        {/* quiet “Next bloom” marker caption */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', border: '1.5px dashed ' + DEEP, boxShadow: '0 0 0 2px ' + GREEN + '22', flexShrink: 0 }} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Next bloom · 16 days</span>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Streak garden calendar (leaf-disc kept days + current/best tiles) ──
// Same month-dots geometry (SK) and chrome as CURRENT; the body swaps the bare
// watered dots for filled leaf-discs, adds two stat tiles + a today pulse ring
// + a calm “water saver” chip. Missed days stay plain muted numbers.
function ProposedStreakGarden({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 14px', minHeight: 0 }}>
        {/* (a) two quiet stat tiles — current vs best, no flame */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, background: '#EAF6E2', border: '1.5px solid ' + GREEN + '55', borderRadius: 13, padding: '8px 11px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon.Leaf size={15} color={DEEP} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.04em', textTransform: 'uppercase', color: '#5a7a4e', fontWeight: 700 }}>Current streak</span>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: DEEP }}>12 days</span>
            </div>
          </div>
          <div style={{ flex: 1, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '8px 11px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.5 9.2l5.9-.9z" /></svg>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.04em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Best streak</span>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: SPROUT.ink }}>21 days</span>
            </div>
          </div>
        </div>

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: SPROUT.ink }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
            const watered = i >= SK.START && i <= SK.TODAY;
            const isToday = i === SK.TODAY;
            const future = i > SK.TODAY;
            // one calm ‘missed’ day mid-run, protected by the water saver
            const missed = i === SK.START + 4;
            if (isToday) {
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <span className="exp-halo" style={{ position: 'absolute', width: SK.C, height: SK.C, borderRadius: '50%', border: '2px solid ' + GREEN, pointerEvents: 'none' }} />
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px -1px ' + DEEP + '88' }}>
                    <Icon.Leaf size={12} color="#fff" />
                  </span>
                </div>
              );
            }
            if (watered && !missed) {
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ width: 19, height: 19, borderRadius: '50%', background: '#DBF0CE', border: '1.5px solid ' + GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon.Leaf size={11} color={DEEP} />
                  </span>
                </div>
              );
            }
            return (
              <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', opacity: future ? 0.5 : 1 }}>
                <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 9.5, fontWeight: 800, color: SPROUT.mute }}>{(i % 31) + 1}</span>
              </div>
            );
          })}
        </div>

        {/* (c) calm ‘water saver’ chip — a missed day reads protected, not broken */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EAF3FB', border: '1.5px solid #BFE0F2', borderRadius: 999, padding: '4px 11px' }}>
            <Icon.Droplet size={12} color="#3E92C9" />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.05em', textTransform: 'uppercase', color: '#3E7FA6', fontWeight: 700 }}>Water saver used ×1</span>
          </span>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Streak week strip (water-drops) — bare count → 7-day water-drop strip + reassurance ──
function ProposedStreakWeekDrops({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const week = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const doneThru = 4; // S–Th watered (today = Thu)

  const Hero = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 56, height: 56, borderRadius: '50%', background: SPROUT.green, boxShadow: '0 5px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon.Leaf size={28} color="#fff" />
      </span>
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 26, color: SPROUT.ink, lineHeight: 1 }}>13</span>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute }}>day streak</span>
    </div>
  );

  if (!isNew) {
    return (
      <React.Fragment>
        <MiniStreakHeader />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '16px', minHeight: 0 }}>
          <Hero />
        </div>
        <MiniBottomNav active="me" />
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, padding: '16px', minHeight: 0 }}>
        <Hero />
        <div style={{ background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 16, padding: '13px 12px 14px' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, marginBottom: 9 }}>This week</div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {week.map((d, i) => {
              const done = i < doneThru, today = i === doneThru;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: today ? DEEP : SPROUT.mute }}>{d}</span>
                  <span style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? GREEN : 'transparent', border: today ? '2px solid ' + DEEP : done ? 'none' : '1.5px solid ' + SPROUT.line, boxShadow: today ? '0 0 0 2.5px ' + GREEN + '33' : 'none' }}>
                    {done ? <Icon.Droplet size={13} color="#fff" /> : today ? <Icon.Droplet size={13} color={DEEP} /> : null}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 10.5, color: SPROUT.mute }}>Water your garden each day to keep your streak.</div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Streak: week strip + milestone bar (CURRENT = dense month grid → NEW = week + bar) ──
function ProposedWeekMilestoneBar({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const week = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const doneThru = 3; // Mo–Th watered, today = Thu
  const milePct = 4 / 7; // 4 of 7 days toward the bloom milestone
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, padding: '16px', minHeight: 0 }}>
        {/* calm streak number + leaf */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 50, height: 50, borderRadius: '50%', background: SPROUT.green, boxShadow: '0 5px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.Leaf size={25} color="#fff" />
          </span>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 24, color: SPROUT.ink, lineHeight: 1 }}>4</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute }}>day streak</span>
        </div>

        {/* current-week strip */}
        <div style={{ background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 16, padding: '13px 12px 14px' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, marginBottom: 9 }}>This week</div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {week.map((d, i) => {
              const done = i <= doneThru, today = i === doneThru;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, fontWeight: 700, color: today ? DEEP : SPROUT.mute }}>{d}</span>
                  <span style={{ width: 25, height: 25, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? GREEN : 'transparent', border: today ? '2px solid ' + DEEP : done ? 'none' : '1.5px solid ' + SPROUT.line, boxShadow: today ? '0 0 0 2.5px ' + GREEN + '33' : 'none' }}>
                    {done && <Icon.Leaf size={12} color="#fff" />}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* milestone progress bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.12em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>3 days to your 7-day bloom</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon.Leaf size={11} color={DEEP} /><span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: DEEP }}>4/7</span></span>
          </div>
          <div style={{ height: 10, borderRadius: 999, background: SPROUT.bg, overflow: 'hidden' }}>
            <div style={{ width: (milePct * 100) + '%', height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,' + GREEN + ',' + DEEP + ')' }} />
          </div>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Streak week strip (CURRENT = bare flame+number → NEW = 7-day strip + record line) ──
function ProposedStreakWeekStrip({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const week = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const doneThru = 4; // Mo–Fr watered (today = Fri)

  const Hero = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 56, height: 56, borderRadius: '50%', background: SPROUT.green, boxShadow: '0 5px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon.Leaf size={28} color="#fff" />
      </span>
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 26, color: SPROUT.ink, lineHeight: 1 }}>13</span>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute }}>day streak</span>
    </div>
  );

  if (!isNew) {
    // CURRENT: just the big flame + number, no week context.
    return (
      <React.Fragment>
        <MiniStreakHeader />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '16px', minHeight: 0 }}>
          <Hero />
        </div>
        <MiniBottomNav active="me" />
      </React.Fragment>
    );
  }

  // NEW: flame + 7-day week strip (connected highlight) + record line.
  const COL = 30, GAP = 4;
  const stripW = week.length * COL + (week.length - 1) * GAP;
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18, padding: '16px', minHeight: 0 }}>
        <Hero />
        <div style={{ background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 16, padding: '13px 12px 14px' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, marginBottom: 9 }}>This week</div>
          {/* day initials */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${week.length}, ${COL}px)`, gap: GAP, justifyContent: 'center', marginBottom: 5 }}>
            {week.map((d, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, fontWeight: 700, color: i === doneThru ? DEEP : SPROUT.mute }}>{d}</div>)}
          </div>
          {/* connected highlight bar behind the watered run + day circles */}
          <div style={{ position: 'relative', width: stripW, margin: '0 auto' }}>
            <div style={{ position: 'absolute', left: COL / 2, top: '50%', transform: 'translateY(-50%)', width: doneThru * (COL + GAP), height: 16, borderRadius: 999, background: GREEN, opacity: 0.28, zIndex: 1 }} />
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${week.length}, ${COL}px)`, gap: GAP, position: 'relative', zIndex: 2 }}>
              {week.map((d, i) => {
                const done = i <= doneThru;
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? GREEN : '#fff', border: done ? 'none' : '1.5px solid ' + SPROUT.line }}>
                      {done && <Icon.Check size={14} color="#fff" />}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* quiet record line */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 7 }}>
          <Icon.Leaf size={12} color={SPROUT.mute} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Longest streak · 21 days</span>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Streak calendar (CURRENT = bare flame+count → NEW = 3 stats + milestone rail + month grid) ──
function ProposedStreakCalFull({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  if (!isNew) {
    // CURRENT: just a flame + day count, no calendar.
    return (
      <React.Fragment>
        <MiniStreakHeader />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 5, padding: '16px', minHeight: 0 }}>
          <span style={{ width: 60, height: 60, borderRadius: '50%', background: SPROUT.green, boxShadow: '0 5px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.Leaf size={30} color="#fff" />
          </span>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 30, color: SPROUT.ink, lineHeight: 1 }}>13</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute }}>day streak</span>
        </div>
        <MiniBottomNav active="me" />
      </React.Fragment>
    );
  }

  // NEW: 3 stat cells + milestone rail + month grid.
  const Stat = ({ icon, label, value }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 12, padding: '8px 4px' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{icon}<span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: DEEP }}>{value}</span></span>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6, letterSpacing: '.08em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{label}</span>
    </div>
  );
  const miles = [7, 14, 30];
  const cur = 13, target = 14, prev = 7;
  const fillPct = Math.min(100, ((cur - prev) / (target - prev)) * 100);
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 14px', minHeight: 0 }}>
        {/* (1) three stat cells */}
        <div style={{ display: 'flex', gap: 7 }}>
          <Stat icon={<Icon.Leaf size={13} color={DEEP} />} label="Current" value="13" />
          <Stat icon={<Icon.Trophy size={13} color="#C79A2E" />} label="Best" value="21" />
          <Stat icon={<Icon.Droplet size={13} color="#2E8FB0" />} label="Freezes" value="2" />
        </div>

        {/* (2) milestone progress rail 7 · 14 · 30 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ position: 'relative', height: 6, borderRadius: 999, background: '#EAE2CF' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: (cur / 30 * 100) + '%', background: GREEN, borderRadius: 999 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {miles.map((m) => (
              <span key={m} style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, fontWeight: 700, letterSpacing: '.04em', color: cur >= m ? DEEP : SPROUT.mute }}>
                <Icon.Leaf size={9} color={cur >= m ? DEEP : SPROUT.line} />{m}d
              </span>
            ))}
          </div>
        </div>

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: SPROUT.ink }}>March 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>
        {/* month grid: watered = leaf token, today ringed, missed = faint circle */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
            const watered = i >= SK.START && i <= SK.TODAY;
            const isToday = i === SK.TODAY;
            const future = i > SK.TODAY;
            return (
              <div key={i} style={{
                width: SK.C, height: SK.C, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: watered ? '#EAF6E2' : 'transparent',
                border: isToday ? '2px solid ' + DEEP : (watered ? 'none' : '1.5px solid ' + SPROUT.line),
                boxShadow: isToday ? '0 0 0 2.5px ' + GREEN + '33' : 'none',
                opacity: future ? 0.5 : 1
              }}>
                {watered ? <Icon.Leaf size={13} color={DEEP} /> : <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: SPROUT.mute }}>{(i % 31) + 1}</span>}
              </div>
            );
          })}
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Glanceable month grid (leaf token on watered days + today ring + Current/Best stats) ──
function ProposedGlanceMonthGrid({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const Stat = ({ label, value }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{label}</span>
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: DEEP }}>{value}</span>
    </div>
  );
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 14px', minHeight: 0 }}>
        {/* two summary stats */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Stat label="Current streak" value="13 days" />
          <div style={{ width: 1, alignSelf: 'stretch', background: SPROUT.line }} />
          <Stat label="Best streak" value="21 days" />
        </div>

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>March 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* month grid: watered = soft-green leaf token, missed = empty outline, today = soft ring */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
            const watered = i >= SK.START && i <= SK.TODAY;
            const isToday = i === SK.TODAY;
            const future = i > SK.TODAY;
            return (
              <div key={i} style={{
                width: SK.C, height: SK.C, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: watered ? '#EAF6E2' : 'transparent',
                border: isToday ? '2px solid ' + DEEP : (watered ? 'none' : '1.5px solid ' + SPROUT.line),
                boxShadow: isToday ? '0 0 0 2.5px ' + GREEN + '33' : 'none',
                opacity: future ? 0.5 : 1
              }}>
                {watered ? <Icon.Leaf size={13} color={DEEP} /> : <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: SPROUT.mute }}>{(i % 31) + 1}</span>}
              </div>
            );
          })}
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Whole month of growth (CURRENT = 7-day strip → NEW = month calendar + stat chips) ──
function ProposedMonthOfGrowth({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const week = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const doneThru = 4; // M–F done this week (today = Fri)

  // shared big flame + streak count header (same framing both modes)
  const Hero = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 52, height: 52, borderRadius: '50%', background: SPROUT.green, boxShadow: '0 5px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon.Leaf size={26} color="#fff" />
      </span>
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 23, color: SPROUT.ink, lineHeight: 1 }}>13</span>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute }}>day streak</span>
    </div>
  );

  if (!isNew) {
    // CURRENT: just the current week — a single 7-day strip.
    return (
      <React.Fragment>
        <MiniStreakHeader />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18, padding: '16px 16px', minHeight: 0 }}>
          <Hero />
          <div style={{ background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 16, padding: '13px 12px 14px' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, marginBottom: 9 }}>This week</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {week.map((d, i) => {
                const done = i <= doneThru;
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{d}</span>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? GREEN : 'transparent', border: done ? 'none' : '1.5px solid ' + SPROUT.line }}>
                      {done && <Icon.Leaf size={13} color="#fff" />}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <MiniBottomNav active="me" />
      </React.Fragment>
    );
  }

  // NEW: month grid + two muted stat chips.
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  const Chip = ({ icon, label, value }) => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 7, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 12, padding: '7px 9px' }}>
      <span style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6, letterSpacing: '.04em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{label}</span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: DEEP }}>{value}</span>
      </div>
    </div>
  );
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 14px', minHeight: 0 }}>
        <Hero />
        {/* two muted stat chips */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Chip icon={<Icon.Leaf size={13} color={DEEP} />} label="Days grown" value="18" />
          <Chip icon={<Icon.Droplet size={13} color="#2E8FB0" />} label="Water saved" value="2" />
        </div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: SPROUT.ink }}>June 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>
        {/* month grid: completed = soft-green leaf dot; today ringed; missed = empty */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
            const inRun = i >= SK.START && i <= SK.TODAY;
            const isToday = i === SK.TODAY;
            const future = i > SK.TODAY;
            if (inRun) {
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isToday ? '0 0 0 2.5px #fffdf7, 0 0 0 4.5px ' + DEEP : 'none' }}>
                    <Icon.Leaf size={12} color="#fff" />
                  </span>
                </div>
              );
            }
            return (
              <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: '50%', border: '1.5px solid ' + SPROUT.line, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: SPROUT.mute }}>{(i % 30) + 1}</span>
              </div>
            );
          })}
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Connected streak ribbon + goal cards + nudge (ribbon run + leaf days + Current/Next + nudge line) ──
function ProposedRibbonGoalNudge({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  const segs = [];
  for (let r = 0; r < SK.ROWS; r++) {
    let lo = null, hi = null;
    for (let c = 0; c < SK.COLS; c++) {
      const i = r * SK.COLS + c;
      if (i >= SK.START && i <= SK.TODAY) { if (lo === null) lo = c; hi = c; }
    }
    if (lo !== null) segs.push({ r, lo, hi });
  }
  const cellX = (c) => SK.PX + c * (SK.C + SK.G);
  const cellY = (r) => r * (SK.C + SK.G);
  const Card = ({ label, value }) => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '8px 11px' }}>
      <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Leaf size={14} color={DEEP} /></span>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{label}</span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: DEEP }}>{value}</span>
      </div>
    </div>
  );
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10, padding: '12px 14px', minHeight: 0 }}>
        {/* (3) two summary cards */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Card label="Current streak" value="13 days" />
          <Card label="Next goal" value="14 days" />
        </div>

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* (1)+(2) continuous ribbon behind the run + a leaf glyph on each watered day */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW }}>
          {segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: cellY(s.r) + 1,
              width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 2, height: SK.C, borderRadius: 999,
              background: GREEN, opacity: 0.3, zIndex: 1
            }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const inRun = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const future = i > SK.TODAY;
              if (inRun) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: isToday ? DEEP : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isToday ? '0 2px 5px -1px ' + DEEP + '99' : 'none' }}>
                      <Icon.Leaf size={13} color={isToday ? '#fff' : DEEP} />
                    </span>
                  </div>
                );
              }
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: SPROUT.mute }}>{(i % 31) + 1}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* (4) one calm nudge line */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 7 }}>
          <Icon.Droplet size={12} color="#2E8FB0" />
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 10.5, color: SPROUT.mute }}>Water today to keep your 13-day streak.</span>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Continuous watered streak ribbon (ribbon + water-drop today + Current/Next-milestone tiles + ‹ › month) ──
function ProposedWateredRibbonDrop({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  const segs = [];
  for (let r = 0; r < SK.ROWS; r++) {
    let lo = null, hi = null;
    for (let c = 0; c < SK.COLS; c++) {
      const i = r * SK.COLS + c;
      if (i >= SK.START && i <= SK.TODAY) { if (lo === null) lo = c; hi = c; }
    }
    if (lo !== null) segs.push({ r, lo, hi });
  }
  const cellX = (c) => SK.PX + c * (SK.C + SK.G);
  const cellY = (r) => r * (SK.C + SK.G);
  const Tile = ({ icon, label, value }) => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '8px 11px' }}>
      <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{label}</span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: DEEP }}>{value}</span>
      </div>
    </div>
  );
  const Drop = ({ c }) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={c}><path d="M12 2C12 2 5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13z" /></svg>
  );
  const Chev = ({ dir }) => (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: dir === 'r' ? 'none' : 'rotate(180deg)' }}><path d="M9 18l6-6-6-6" /></svg>
  );
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 14px', minHeight: 0 }}>
        {/* two stat tiles */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Tile icon={<Icon.Leaf size={14} color={DEEP} />} label="Current streak" value="5 days" />
          <Tile icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></svg>} label="Next milestone" value="7 days" />
        </div>

        {/* month label with ‹ › arrows */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <Chev dir="l" />
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>May 2026</span>
          <Chev dir="r" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* continuous ribbon; today = leading edge w/ water-drop; future = empty circles */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW }}>
          {segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: cellY(s.r) + 1,
              width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 2, height: SK.C, borderRadius: 999,
              background: GREEN, opacity: 0.32, zIndex: 1
            }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const inRun = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const future = i > SK.TODAY;
              if (isToday) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px -1px ' + DEEP + '99' }}>
                      <Drop c="#fff" />
                    </span>
                  </div>
                );
              }
              if (future) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: '50%', border: '1.5px solid ' + SPROUT.line, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
                    <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: SPROUT.mute }}>{(i % 31) + 1}</span>
                  </div>
                );
              }
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: inRun ? DEEP : SPROUT.mute }}>{(i % 31) + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Garden Streak Calendar (leaf markers + vine ribbon + Current-streak/Water-saved cards) ──
function ProposedGardenStreakCal2({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  const segs = [];
  for (let r = 0; r < SK.ROWS; r++) {
    let lo = null, hi = null;
    for (let c = 0; c < SK.COLS; c++) {
      const i = r * SK.COLS + c;
      if (i >= SK.START && i <= SK.TODAY) { if (lo === null) lo = c; hi = c; }
    }
    if (lo !== null) segs.push({ r, lo, hi });
  }
  const cellX = (c) => SK.PX + c * (SK.C + SK.G);
  const cellY = (r) => r * (SK.C + SK.G);
  const Card = ({ icon, label, value }) => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '8px 11px' }}>
      <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{label}</span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: DEEP }}>{value}</span>
      </div>
    </div>
  );
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 14px', minHeight: 0 }}>
        {/* two quiet stat cards */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Card icon={<Icon.Leaf size={14} color={DEEP} />} label="Current streak" value="13 days" />
          <Card icon={<Icon.Droplet size={14} color="#2E8FB0" />} label="Water saved" value="2" />
        </div>

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* vine ribbon threading consecutive days + a leaf marker on every watered day */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW }}>
          {segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: cellY(s.r) + 1,
              width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 2, height: SK.C, borderRadius: 999,
              background: GREEN, opacity: 0.3, zIndex: 1
            }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const inRun = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const future = i > SK.TODAY;
              if (inRun) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: isToday ? DEEP : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isToday ? '0 2px 6px -1px ' + DEEP + 'cc, 0 0 0 2px #fffdf7' : 'none', transform: isToday ? 'translateY(-1px)' : 'none' }}>
                      <Icon.Leaf size={13} color={isToday ? '#fff' : DEEP} />
                    </span>
                  </div>
                );
              }
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: SPROUT.mute }}>{(i % 31) + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Watered-days streak calendar (ribbon + leaf disc on every day + Current/Best stats) ──
function ProposedWateredRibbon({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  const segs = [];
  for (let r = 0; r < SK.ROWS; r++) {
    let lo = null, hi = null;
    for (let c = 0; c < SK.COLS; c++) {
      const i = r * SK.COLS + c;
      if (i >= SK.START && i <= SK.TODAY) { if (lo === null) lo = c; hi = c; }
    }
    if (lo !== null) segs.push({ r, lo, hi });
  }
  const cellX = (c) => SK.PX + c * (SK.C + SK.G);
  const cellY = (r) => r * (SK.C + SK.G);
  const Stat = ({ label, value }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{label}</span>
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: DEEP }}>{value}</span>
    </div>
  );
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 14px', minHeight: 0 }}>
        {/* streak emblem + twin Current / Best stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <span style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.Leaf size={17} color={DEEP} />
          </span>
          <Stat label="Current" value="13 days" />
          <div style={{ width: 1, alignSelf: 'stretch', background: SPROUT.line }} />
          <Stat label="Best ever" value="21 days" />
        </div>

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* continuous watered ribbon behind the run + a small leaf disc on every completed day */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW }}>
          {segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: cellY(s.r) + 1,
              width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 2, height: SK.C, borderRadius: 999,
              background: GREEN, opacity: 0.28, zIndex: 1
            }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const inRun = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const future = i > SK.TODAY;
              if (inRun) {
                // every completed day = a small filled leaf disc; today adds a quiet ring
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{
                      width: SK.C, height: SK.C, borderRadius: '50%', background: GREEN,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: isToday ? '0 0 0 2.5px #fffdf7, 0 0 0 4.5px ' + DEEP : 'none'
                    }}>
                      <Icon.Leaf size={12} color="#fff" />
                    </span>
                  </div>
                );
              }
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: SPROUT.mute }}>{(i % 31) + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Connected streak band + next-bloom marker (band run + today disc + milestone tag) ──
function ProposedStreakBandBloom({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  const segs = [];
  for (let r = 0; r < SK.ROWS; r++) {
    let lo = null, hi = null;
    for (let c = 0; c < SK.COLS; c++) {
      const i = r * SK.COLS + c;
      if (i >= SK.START && i <= SK.TODAY) { if (lo === null) lo = c; hi = c; }
    }
    if (lo !== null) segs.push({ r, lo, hi });
  }
  const cellX = (c) => SK.PX + c * (SK.C + SK.G);
  const cellY = (r) => r * (SK.C + SK.G);
  const Stat = ({ icon, label, value }) => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '8px 11px' }}>
      <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{label}</span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: DEEP }}>{value}</span>
      </div>
    </div>
  );
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 14px', minHeight: 0 }}>
        {/* compact two-stat row */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Stat icon={<Icon.Leaf size={14} color={DEEP} />} label="Current streak" value="13" />
          <Stat icon={<Icon.Droplet size={14} color="#2E8FB0" />} label="Waters saved" value="2" />
        </div>

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* one continuous green growth band; today = bright disc; next milestone = outlined leaf + tag */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW, paddingBottom: 16 }}>
          {segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: cellY(s.r) + 1,
              width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 2, height: SK.C, borderRadius: 999,
              background: DEEP, opacity: 0.22, zIndex: 1
            }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const inRun = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const isMile = i === SK.MILE;
              const future = i > SK.TODAY;
              if (isToday) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 3px ' + GREEN + '55, 0 2px 5px -1px ' + DEEP + '99' }}>
                      <Icon.Leaf size={13} color="#fff" />
                    </span>
                  </div>
                );
              }
              if (isMile) {
                return (
                  <div key={i} style={{ position: 'relative', width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', border: '1.5px dashed ' + DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon.Leaf size={11} color={DEEP} />
                    </span>
                    <span style={{ position: 'absolute', top: SK.C + 3, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700, color: SPROUT.greenDark, background: '#EAF6E2', border: '1px solid ' + GREEN + '66', borderRadius: 5, padding: '1.5px 5px' }}>Next bloom</span>
                  </div>
                );
              }
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: inRun ? DEEP : SPROUT.mute }}>{(i % 31) + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Connected streak ribbon + milestone chip (ribbon run + today disc + bloom chip) ──
function ProposedRibbonBloomChip({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  const segs = [];
  for (let r = 0; r < SK.ROWS; r++) {
    let lo = null, hi = null;
    for (let c = 0; c < SK.COLS; c++) {
      const i = r * SK.COLS + c;
      if (i >= SK.START && i <= SK.TODAY) { if (lo === null) lo = c; hi = c; }
    }
    if (lo !== null) segs.push({ r, lo, hi });
  }
  const cellX = (c) => SK.PX + c * (SK.C + SK.G);
  const cellY = (r) => r * (SK.C + SK.G);
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 14px', minHeight: 0 }}>
        {/* milestone + longest stacked above (kept from CURRENT framing) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <span style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.Leaf size={17} color={DEEP} />
          </span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 17, color: SPROUT.ink, lineHeight: 1 }}>13<span style={{ fontSize: 11.5, fontWeight: 800, color: SPROUT.mute, marginLeft: 5 }}>day streak</span></span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.12em', textTransform: 'uppercase', color: SPROUT.mute, marginTop: 3 }}>Longest · 21 days</span>
          </div>
        </div>

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>May 2026</div>

        {/* (chip) quiet milestone line above the grid */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EAF6E2', border: '1px solid ' + GREEN + '66', borderRadius: 999, padding: '4px 12px' }}>
            <Icon.Leaf size={11} color={DEEP} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, color: SPROUT.greenDark }}>3 days to your next bloom</span>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* one continuous soft-green ribbon; past days inside it, today = deep-green leaf disc */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW }}>
          {segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: cellY(s.r) + 1,
              width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 2, height: SK.C, borderRadius: 999,
              background: GREEN, opacity: 0.30, zIndex: 1
            }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const inRun = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const future = i > SK.TODAY;
              if (isToday) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px -1px ' + DEEP + '99' }}>
                      <Icon.Leaf size={13} color="#fff" />
                    </span>
                  </div>
                );
              }
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: inRun ? DEEP : SPROUT.mute }}>{(i % 31) + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Connected streak vine + filled cells + ringed today + big CURRENT/NEXT GOAL header ──
function ProposedVineFilledRing({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  const segs = [];
  for (let r = 0; r < SK.ROWS; r++) {
    let lo = null, hi = null;
    for (let c = 0; c < SK.COLS; c++) {
      const i = r * SK.COLS + c;
      if (i >= SK.START && i <= SK.TODAY) { if (lo === null) lo = c; hi = c; }
    }
    if (lo !== null) segs.push({ r, lo, hi });
  }
  const cellX = (c) => SK.PX + c * (SK.C + SK.G);
  const cellY = (r) => r * (SK.C + SK.G);
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, padding: '12px 14px', minHeight: 0 }}>
        {/* big twin-stat header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Current</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon.Leaf size={18} color={DEEP} />
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 26, color: SPROUT.ink, lineHeight: 1 }}>13</span>
            </span>
          </div>
          <div style={{ width: 1, height: 30, background: SPROUT.line }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Next goal</span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 26, color: SPROUT.mute, lineHeight: 1 }}>14</span>
          </div>
        </div>

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* soft-green cell fills under a continuous vine ribbon; today = soft ring */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW }}>
          {/* per-cell soft fills */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'absolute', inset: 0, zIndex: 1 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const inRun = i >= SK.START && i <= SK.TODAY;
              return <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: inRun ? GREEN + '33' : 'transparent' }} />;
            })}
          </div>
          {/* connected vine ribbon */}
          {segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: cellY(s.r) + 1,
              width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 2, height: SK.C, borderRadius: 999,
              background: GREEN, opacity: 0.5, zIndex: 2
            }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 3 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const inRun = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const future = i > SK.TODAY;
              if (isToday) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', border: '2px solid ' + DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 2.5px #fffdf7 inset' }}>
                      <Icon.Leaf size={12} color={DEEP} />
                    </span>
                  </div>
                );
              }
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: inRun ? DEEP : SPROUT.mute }}>{(i % 31) + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Week strip + connected growth ribbons (week discs + month ribbon + GROWING chip + mini-stats) ──
function ProposedWeekStripRibbons({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const week = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const wkDone = 4; // Su–Thu watered, today = Thu
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  const segs = [];
  for (let r = 0; r < SK.ROWS; r++) {
    let lo = null, hi = null;
    for (let c = 0; c < SK.COLS; c++) {
      const i = r * SK.COLS + c;
      if (i >= SK.START && i <= SK.TODAY) { if (lo === null) lo = c; hi = c; }
    }
    if (lo !== null) segs.push({ r, lo, hi });
  }
  const cellX = (c) => SK.PX + c * (SK.C + SK.G);
  const cellY = (r) => r * (SK.C + SK.G);
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10, padding: '11px 14px', minHeight: 0 }}>
        {/* (1) this-week strip */}
        <div style={{ background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '9px 10px 10px' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, marginBottom: 7 }}>This week</div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {week.map((d, i) => {
              const done = i < wkDone, today = i === wkDone;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, fontWeight: 700, color: today ? DEEP : SPROUT.mute }}>{d}</span>
                  <span style={{ width: 23, height: 23, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? GREEN : 'transparent', border: today ? '2px solid ' + DEEP : done ? 'none' : '1.5px solid ' + SPROUT.line, boxShadow: today ? '0 0 0 2.5px ' + GREEN + '33' : 'none' }}>
                    {done ? <Icon.Leaf size={12} color="#fff" /> : today ? <span style={{ width: 6, height: 6, borderRadius: '50%', background: DEEP }} /> : null}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* (3) month label + GROWING praise chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>May 2026</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, color: SPROUT.greenDark, background: '#EAF6E2', border: '1px solid ' + GREEN + '66', borderRadius: 5, padding: '2px 6px' }}>Growing</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* (2) month grid with connected growth ribbon */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW }}>
          {segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: cellY(s.r) + 1,
              width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 2, height: SK.C, borderRadius: 999,
              background: GREEN, opacity: 0.3, zIndex: 1
            }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const inRun = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const future = i > SK.TODAY;
              if (isToday) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px -1px ' + DEEP + '99' }}>
                      <Icon.Leaf size={13} color="#fff" />
                    </span>
                  </div>
                );
              }
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: inRun ? DEEP : SPROUT.mute }}>{(i % 31) + 1}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* (3) quiet mini-stats row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icon.Leaf size={12} color={DEEP} />
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 10, color: SPROUT.mute }}><b style={{ color: SPROUT.ink }}>13</b> days watered</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icon.Droplet size={12} color="#2E8FB0" />
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 10, color: SPROUT.mute }}><b style={{ color: SPROUT.ink }}>2</b> freezes used</span>
          </span>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Connected streak ribbon + Your records + milestone flag (ribbon run + record rows) ──
function ProposedRibbonRecords({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const gridW = skGridW();
  const segs = [];
  for (let r = 0; r < SK.ROWS; r++) {
    let lo = null, hi = null;
    for (let c = 0; c < SK.COLS; c++) {
      const i = r * SK.COLS + c;
      if (i >= SK.START && i <= SK.TODAY) { if (lo === null) lo = c; hi = c; }
    }
    if (lo !== null) segs.push({ r, lo, hi });
  }
  const cellX = (c) => SK.PX + c * (SK.C + SK.G);
  const cellY = (r) => r * (SK.C + SK.G);
  const Record = ({ icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 12, padding: '8px 11px' }}>
      <span style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11, color: SPROUT.mute }}>{label}</span>
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>{value}</span>
    </div>
  );
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 9, padding: '11px 14px', minHeight: 0 }}>
        {/* streak count header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon.Leaf size={20} color={DEEP} />
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 17, color: SPROUT.ink }}>13<span style={{ fontSize: 11.5, fontWeight: 800, color: SPROUT.mute, marginLeft: 5 }}>day streak</span></span>
        </div>
        {/* month header with < > */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 13, color: SPROUT.mute }}>‹</span>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>May 2026</span>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 13, color: SPROUT.mute }}>›</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>
        {/* connected vine ribbon + today disc + milestone flag */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW }}>
          {segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: cellY(s.r) + 1,
              width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 2, height: SK.C, borderRadius: 999,
              background: GREEN, opacity: 0.32, zIndex: 1
            }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const inRun = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const isMile = i === SK.MILE;
              const future = i > SK.TODAY;
              if (isToday) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px -1px ' + DEEP + '99' }}>
                      <Icon.Leaf size={13} color="#fff" />
                    </span>
                  </div>
                );
              }
              if (isMile) {
                return (
                  <div key={i} style={{ position: 'relative', width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: SPROUT.mute }}>{(i % 31) + 1}</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#C79A2E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', top: -7, right: 0 }}><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></svg>
                  </div>
                );
              }
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: inRun ? DEEP : SPROUT.mute }}>{(i % 31) + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
        {/* Your records */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, paddingLeft: 3 }}>Your records</div>
          <Record icon={<Icon.Leaf size={13} color={DEEP} />} label="Longest streak" value="21 days" />
          <Record icon={<Icon.Droplet size={13} color="#2E8FB0" />} label="Days watered" value="146" />
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Connected streak ribbon + Days-grown/Freezes-left tiles + Next-bloom flag ──
function ProposedRibbonFreezeTiles({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  const segs = [];
  for (let r = 0; r < SK.ROWS; r++) {
    let lo = null, hi = null;
    for (let c = 0; c < SK.COLS; c++) {
      const i = r * SK.COLS + c;
      if (i >= SK.START && i <= SK.TODAY) { if (lo === null) lo = c; hi = c; }
    }
    if (lo !== null) segs.push({ r, lo, hi });
  }
  const cellX = (c) => SK.PX + c * (SK.C + SK.G);
  const cellY = (r) => r * (SK.C + SK.G);
  const Tile = ({ icon, label, value }) => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '8px 11px' }}>
      <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{label}</span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: DEEP }}>{value}</span>
      </div>
    </div>
  );
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 14px', minHeight: 0 }}>
        {/* (2) two glanceable stat tiles */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Tile icon={<Icon.Leaf size={14} color={DEEP} />} label="Days grown" value="13" />
          <Tile icon={<Icon.Droplet size={14} color="#2E8FB0" />} label="Freezes left" value="2" />
        </div>

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* (1) continuous ribbon + (3) Next-bloom flag on the milestone day */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW, paddingBottom: 16 }}>
          {segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: cellY(s.r) + 1,
              width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 2, height: SK.C, borderRadius: 999,
              background: GREEN, opacity: 0.32, zIndex: 1
            }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const inRun = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const isMile = i === SK.MILE;
              const future = i > SK.TODAY;
              if (isToday) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px -1px ' + DEEP + '99' }}>
                      <Icon.Leaf size={13} color="#fff" />
                    </span>
                  </div>
                );
              }
              if (isMile) {
                return (
                  <div key={i} style={{ position: 'relative', width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', border: '1.5px dashed #C79A2E', background: '#FBF1DA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#C79A2E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></svg>
                    </span>
                    <span style={{ position: 'absolute', top: SK.C + 3, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700, color: '#A87C1B', background: '#FBF1DA', border: '1px solid #E8D6A8', borderRadius: 5, padding: '1.5px 5px' }}>Next bloom</span>
                  </div>
                );
              }
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: inRun ? DEEP : SPROUT.mute }}>{(i % 31) + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Streak as a growing vine (vine ribbon + leaf per day + raised tip + Current/Next + PERFECT) ──
function ProposedGrowingVineTip({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  const segs = [];
  for (let r = 0; r < SK.ROWS; r++) {
    let lo = null, hi = null, count = 0;
    for (let c = 0; c < SK.COLS; c++) {
      const i = r * SK.COLS + c;
      if (i >= SK.START && i <= SK.TODAY) { if (lo === null) lo = c; hi = c; count++; }
    }
    if (lo !== null) segs.push({ r, lo, hi, perfect: count === SK.COLS });
  }
  const cellX = (c) => SK.PX + c * (SK.C + SK.G);
  const cellY = (r) => r * (SK.C + SK.G);
  const perfectRow = segs.find((s) => s.perfect);
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 14px', minHeight: 0 }}>
        {/* quiet Current streak · Next milestone stat pair */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Current streak <b style={{ color: DEEP }}>13 days</b></span>
          <span style={{ color: SPROUT.line }}>·</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Next milestone <b style={{ color: SPROUT.ink }}>14</b></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>May 2026</span>
          {perfectRow && <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 700, color: SPROUT.greenDark }}>Perfect</span>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* one continuous vine ribbon; leaf on each day; today = raised disc at the tip */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW }}>
          {segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: cellY(s.r) + 1,
              width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 2, height: SK.C, borderRadius: 999,
              background: GREEN, opacity: 0.3, zIndex: 1
            }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const inRun = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const future = i > SK.TODAY;
              if (isToday) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: SK.C + 2, height: SK.C + 2, borderRadius: '50%', background: DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 6px -1px ' + DEEP + 'aa' }}>
                      <Icon.Leaf size={13} color="#fff" />
                    </span>
                  </div>
                );
              }
              if (inRun) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon.Leaf size={13} color={DEEP} />
                  </div>
                );
              }
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: SPROUT.mute }}>{(i % 31) + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Streak run, connected (track + today ring + milestone flag + two stat cards) ──
function ProposedStreakRunConnected({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  const segs = [];
  for (let r = 0; r < SK.ROWS; r++) {
    let lo = null, hi = null;
    for (let c = 0; c < SK.COLS; c++) {
      const i = r * SK.COLS + c;
      if (i >= SK.START && i <= SK.TODAY) { if (lo === null) lo = c; hi = c; }
    }
    if (lo !== null) segs.push({ r, lo, hi });
  }
  const cellX = (c) => SK.PX + c * (SK.C + SK.G);
  const cellY = (r) => r * (SK.C + SK.G);
  const Card = ({ label, value }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 12, padding: '8px 11px' }}>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{label}</span>
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16, color: DEEP }}>{value}</span>
    </div>
  );
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 14px', minHeight: 0 }}>
        {/* two quiet stat cards */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Card label="Current streak" value="13" />
          <Card label="Next milestone" value="14" />
        </div>

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* one continuous track; today = hollow deep-green ring + leaf; milestone flag pennant */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW }}>
          {segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: cellY(s.r) + 1,
              width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 2, height: SK.C, borderRadius: 999,
              background: GREEN, opacity: 0.3, zIndex: 1
            }} />
          ))}
          {(() => {
            const mr = Math.floor(SK.MILE / SK.COLS), mc = SK.MILE % SK.COLS;
            return (
              <div style={{ position: 'absolute', left: cellX(mc) + SK.C / 2 - 6, top: cellY(mr) - 9, zIndex: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C2871B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></svg>
              </div>
            );
          })()}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const inRun = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const isMile = i === SK.MILE;
              const future = i > SK.TODAY;
              if (isToday) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: '#fff', border: '2.5px solid ' + DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon.Leaf size={12} color={DEEP} />
                    </span>
                  </div>
                );
              }
              if (isMile) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', border: '1.5px dashed #C2871B', background: '#FBF1DA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: '#A87C1B' }}>{(i % 31) + 1}</span>
                    </span>
                  </div>
                );
              }
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: inRun ? DEEP : SPROUT.mute }}>{(i % 31) + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Connected streak trail (vine + leaf glyph per day + Current/Next header + milestone marker) ──
function ProposedStreakTrail({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  const segs = [];
  for (let r = 0; r < SK.ROWS; r++) {
    let lo = null, hi = null;
    for (let c = 0; c < SK.COLS; c++) {
      const i = r * SK.COLS + c;
      if (i >= SK.START && i <= SK.TODAY) { if (lo === null) lo = c; hi = c; }
    }
    if (lo !== null) segs.push({ r, lo, hi });
  }
  const cellX = (c) => SK.PX + c * (SK.C + SK.G);
  const cellY = (r) => r * (SK.C + SK.G);
  const Stat = ({ label, value }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{label}</span>
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: DEEP }}>{value}</span>
    </div>
  );
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 14px', minHeight: 0 }}>
        {/* Current streak / Next milestone header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Stat label="Current streak" value="13 days" />
          <div style={{ width: 1, alignSelf: 'stretch', background: SPROUT.line }} />
          <Stat label="Next milestone" value="14 days" />
        </div>

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* continuous growth vine; leaf glyph on each grown day; today disc; outlined milestone marker */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW }}>
          {segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: cellY(s.r) + 1,
              width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 2, height: SK.C, borderRadius: 999,
              background: GREEN, opacity: 0.3, zIndex: 1
            }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const inRun = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const isMile = i === SK.MILE;
              const future = i > SK.TODAY;
              if (isToday) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px -1px ' + DEEP + '99' }}>
                      <Icon.Leaf size={13} color="#fff" />
                    </span>
                  </div>
                );
              }
              if (inRun) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon.Leaf size={13} color={DEEP} />
                  </div>
                );
              }
              if (isMile) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', border: '1.5px dashed ' + DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: DEEP }}>{(i % 31) + 1}</span>
                    </span>
                  </div>
                );
              }
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: SPROUT.mute }}>{(i % 31) + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Connected watered ribbon + today ring + Your-records row ──
function ProposedRibbonWateredRing({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  const segs = [];
  for (let r = 0; r < SK.ROWS; r++) {
    let lo = null, hi = null;
    for (let c = 0; c < SK.COLS; c++) {
      const i = r * SK.COLS + c;
      if (i >= SK.START && i <= SK.TODAY) { if (lo === null) lo = c; hi = c; }
    }
    if (lo !== null) segs.push({ r, lo, hi });
  }
  const cellX = (c) => SK.PX + c * (SK.C + SK.G);
  const cellY = (r) => r * (SK.C + SK.G);
  const Rec = ({ label, value }) => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 12, padding: '8px 11px' }}>
      <span style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Leaf size={12} color={DEEP} /></span>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6, letterSpacing: '.04em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{label}</span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>{value}</span>
      </div>
    </div>
  );
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 14px', minHeight: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>
        {/* continuous watered ribbon; today = soft green ring on the ribbon */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW }}>
          {segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: cellY(s.r) + 1,
              width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 2, height: SK.C, borderRadius: 999,
              background: GREEN, opacity: 0.32, zIndex: 1
            }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const inRun = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const future = i > SK.TODAY;
              if (isToday) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: '#fff', border: '2.5px solid ' + DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 900, color: DEEP }}>{(i % 31) + 1}</span>
                    </span>
                  </div>
                );
              }
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: inRun ? DEEP : SPROUT.mute }}>{(i % 31) + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
        {/* quiet Your-records row */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, paddingLeft: 3 }}>Your records</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Rec label="Longest daily streak" value="21 days" />
            <Rec label="Longest weekly" value="6 weeks" />
          </div>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Connected streak ribbon + PERFECT WEEK tag above month (ribbon run + today leaf disc) ──
function ProposedRibbonPerfectTag({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  const segs = [];
  for (let r = 0; r < SK.ROWS; r++) {
    let lo = null, hi = null;
    for (let c = 0; c < SK.COLS; c++) {
      const i = r * SK.COLS + c;
      if (i >= SK.START && i <= SK.TODAY) { if (lo === null) lo = c; hi = c; }
    }
    if (lo !== null) segs.push({ r, lo, hi });
  }
  const cellX = (c) => SK.PX + c * (SK.C + SK.G);
  const cellY = (r) => r * (SK.C + SK.G);
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '14px 14px', minHeight: 0 }}>
        {/* quiet PERFECT WEEK leaf tag above the month label */}
        <div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#EAF6E2', border: '1px solid ' + GREEN + '66', borderRadius: 999, padding: '4px 11px', marginBottom: 9 }}>
            <Icon.Leaf size={11} color={DEEP} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 700, color: SPROUT.greenDark }}>Perfect week</span>
          </span>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: SPROUT.ink }}>May 2026</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* one continuous green vine ribbon; today = deep-green leaf disc at leading end */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW }}>
          {segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: cellY(s.r) + 1,
              width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 2, height: SK.C, borderRadius: 999,
              background: GREEN, opacity: 0.32, zIndex: 1
            }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const inRun = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const future = i > SK.TODAY;
              if (isToday) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px -1px ' + DEEP + '99' }}>
                      <Icon.Leaf size={13} color="#fff" />
                    </span>
                  </div>
                );
              }
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: inRun ? DEEP : SPROUT.mute }}>{(i % 31) + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Connected streak vine + Perfect Week (gradient ribbon + Current/Next + week chip) ──
function ProposedVinePerfectWeek({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  const segs = [];
  for (let r = 0; r < SK.ROWS; r++) {
    let lo = null, hi = null, count = 0;
    for (let c = 0; c < SK.COLS; c++) {
      const i = r * SK.COLS + c;
      if (i >= SK.START && i <= SK.TODAY) { if (lo === null) lo = c; hi = c; count++; }
    }
    if (lo !== null) segs.push({ r, lo, hi, perfect: count === SK.COLS });
  }
  const cellX = (c) => SK.PX + c * (SK.C + SK.G);
  const cellY = (r) => r * (SK.C + SK.G);
  const Stat = ({ label, value }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{label}</span>
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: DEEP }}>{value}</span>
    </div>
  );
  // the row that holds today's run-end (used to anchor the PERFECT WEEK chip)
  const fullRow = segs.find((s) => s.perfect);
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 14px', minHeight: 0 }}>
        {/* (1) quiet Current streak / Next goal header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Stat label="Current streak" value="12 days" />
          <div style={{ width: 1, alignSelf: 'stretch', background: SPROUT.line }} />
          <Stat label="Next goal" value="14 days" />
        </div>

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* (2) one continuous gradient vine ribbon; today = filled leaf node */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW }}>
          {segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: cellY(s.r) + 1,
              width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 2, height: SK.C, borderRadius: 999,
              background: 'linear-gradient(90deg, ' + GREEN + ' 0%, ' + DEEP + ' 100%)', opacity: 0.32, zIndex: 1
            }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const inRun = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const future = i > SK.TODAY;
              if (isToday) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px -1px ' + DEEP + '99' }}>
                      <Icon.Leaf size={13} color="#fff" />
                    </span>
                  </div>
                );
              }
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: inRun ? DEEP : SPROUT.mute }}>{(i % 31) + 1}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* (3) quiet PERFECT WEEK chip for a fully-completed row */}
        {fullRow && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#EAF6E2', border: '1px solid ' + GREEN + '66', borderRadius: 999, padding: '4px 11px' }}>
              <Icon.Leaf size={11} color={DEEP} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 700, color: SPROUT.greenDark }}>Perfect week</span>
            </span>
          </div>
        )}
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Connected streak ribbon + freeze jar (vine run + dew-drop jar chip + protected day) ──
function ProposedRibbonFreezeJar({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e', DEW = '#2E8FB0';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  const PROTECTED = SK.START + 5; // one day mid-run was protected by a dew drop
  const segs = [];
  for (let r = 0; r < SK.ROWS; r++) {
    let lo = null, hi = null;
    for (let c = 0; c < SK.COLS; c++) {
      const i = r * SK.COLS + c;
      if (i >= SK.START && i <= SK.TODAY) { if (lo === null) lo = c; hi = c; }
    }
    if (lo !== null) segs.push({ r, lo, hi });
  }
  const cellX = (c) => SK.PX + c * (SK.C + SK.G);
  const cellY = (r) => r * (SK.C + SK.G);
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 14px', minHeight: 0 }}>
        {/* (2) calm streak-freeze inventory chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#E5F2F8', border: '1.5px solid #BFE0EC', borderRadius: 13, padding: '9px 12px' }}>
          <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.Droplet size={15} color={DEW} />
          </span>
          <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12, color: '#1F6E8C' }}>2 dew drops in your jar</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, color: '#4A7E92' }}>On hand</span>
        </div>

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* (1) continuous vine ribbon; (3) protected day = blue dew drop; today = leaf disc */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW }}>
          {segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: cellY(s.r) + 1,
              width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 2, height: SK.C, borderRadius: 999,
              background: GREEN, opacity: 0.3, zIndex: 1
            }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const inRun = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const isProtected = i === PROTECTED;
              const future = i > SK.TODAY;
              if (isToday) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px -1px ' + DEEP + '99' }}>
                      <Icon.Leaf size={13} color="#fff" />
                    </span>
                  </div>
                );
              }
              if (isProtected) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: '#E5F2F8', border: '1.5px solid ' + DEW + '88', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon.Droplet size={12} color={DEW} />
                    </span>
                  </div>
                );
              }
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: inRun ? DEEP : SPROUT.mute }}>{(i % 31) + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Connected streak vine (solid ribbon + Current/Next-goal two-up + leaf-bud tip) ──
// Same SK month geometry + chrome as CURRENT; consecutive practiced days fuse into
// one solid soft-green vine, today is a leaf-bud node at the tip, a quiet two-up
// header (Current streak / Next goal) sits above. Only the calendar body changes.
function ProposedConnectedVine({ mode = 'proposed', current = '13 days', nextLabel = 'Next goal', nextValue = '14 days' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  const segs = [];
  for (let r = 0; r < SK.ROWS; r++) {
    let lo = null, hi = null;
    for (let c = 0; c < SK.COLS; c++) {
      const i = r * SK.COLS + c;
      if (i >= SK.START && i <= SK.TODAY) { if (lo === null) lo = c; hi = c; }
    }
    if (lo !== null) segs.push({ r, lo, hi });
  }
  const cellX = (c) => SK.PX + c * (SK.C + SK.G);
  const cellY = (r) => r * (SK.C + SK.G);
  const Stat = ({ label, value, accent }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{label}</span>
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: accent }}>{value}</span>
    </div>
  );
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 14px', minHeight: 0 }}>
        {/* (2) quiet two-up summary header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Stat label="Current streak" value={current} accent={DEEP} />
          <div style={{ width: 1, alignSelf: 'stretch', background: SPROUT.line }} />
          <Stat label={nextLabel} value={nextValue} accent={SPROUT.ink} />
        </div>

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* (1) grid with one continuous solid-green vine + leaf-bud today tip */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW }}>
          {segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: cellY(s.r) + 1,
              width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 2, height: SK.C, borderRadius: 999,
              background: GREEN, opacity: 0.34, zIndex: 1
            }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const inRun = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const future = i > SK.TODAY;
              if (isToday) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px -1px ' + DEEP + '99' }}>
                      <Icon.Leaf size={13} color="#fff" />
                    </span>
                  </div>
                );
              }
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: inRun ? DEEP : SPROUT.mute }}>{(i % 31) + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Unbroken streak ribbon (solid vine + leaf end-caps, ringed today, milestone pennant) ──
function ProposedUnbrokenRibbon({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  const segs = [];
  for (let r = 0; r < SK.ROWS; r++) {
    let lo = null, hi = null;
    for (let c = 0; c < SK.COLS; c++) {
      const i = r * SK.COLS + c;
      if (i >= SK.START && i <= SK.TODAY) { if (lo === null) lo = c; hi = c; }
    }
    if (lo !== null) segs.push({ r, lo, hi });
  }
  const cellX = (c) => SK.PX + c * (SK.C + SK.G);
  const cellY = (r) => r * (SK.C + SK.G);
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, padding: '14px', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: SPROUT.ink }}>May 2026</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#EAF6E2', borderRadius: 999, padding: '3px 9px' }}>
            <Icon.Leaf size={11} color={DEEP} />
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: DEEP }}>13-day streak</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* one continuous vine ribbon with leaf end-caps; ringed today; milestone pennant */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW, paddingTop: 9 }}>
          {segs.map((s, k) => (
            <React.Fragment key={k}>
              <div style={{
                position: 'absolute', left: cellX(s.lo) - 1, top: 9 + cellY(s.r) + 1,
                width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 2, height: SK.C, borderRadius: 999,
                background: GREEN, opacity: 0.32, zIndex: 1
              }} />
              {/* leaf accents at each end of the run */}
              <div style={{ position: 'absolute', left: cellX(s.lo) + 1, top: 9 + cellY(s.r) - 3, zIndex: 3, opacity: 0.7 }}><Icon.Leaf size={9} color={DEEP} /></div>
              <div style={{ position: 'absolute', left: cellX(s.hi) + SK.C - 9, top: 9 + cellY(s.r) + SK.C - 6, zIndex: 3, opacity: 0.7 }}><Icon.Leaf size={9} color={DEEP} /></div>
            </React.Fragment>
          ))}
          {/* milestone pennant above the next upcoming milestone day */}
          {(() => {
            const mr = Math.floor(SK.MILE / SK.COLS), mc = SK.MILE % SK.COLS;
            return (
              <div style={{ position: 'absolute', left: cellX(mc) + SK.C / 2 - 6, top: 9 + cellY(mr) - 9, zIndex: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E5A93A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></svg>
              </div>
            );
          })()}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const inRun = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const isMile = i === SK.MILE;
              const future = i > SK.TODAY;
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future && !isMile ? 0.5 : 1, border: isToday ? '2px solid ' + DEEP : (isMile ? '1.5px dashed ' + GREEN : 'none'), boxSizing: 'border-box' }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: isToday ? DEEP : (inRun ? DEEP : SPROUT.mute) }}>{(i % 31) + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Calm monthly streak calendar (Current/Best stats + leaf-filled days + ringed today + caption) ──


// ───────── batch 2 (moved from exploration.jsx for 500KB headroom) ─────────

// ── Proposed · Streak milestone rail + 3 stat tiles + leaf-badge milestone days ──
function ProposedMilestoneRailTiles({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const CURRENT_STREAK = 13;
  const miles = [7, 14, 30];
  const segFill = (lo, hi) => Math.max(0, Math.min(1, (CURRENT_STREAK - lo) / (hi - lo)));
  // milestone days on the grid (7-day and 14-day marks within the run/upcoming)
  const mileCells = [SK.START + 6, SK.TODAY + 1];
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 16px', minHeight: 0 }}>
        {/* milestone rail 7 › 14 › 30 */}
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.12em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Next milestone · 14-day bloom · 1 day to go</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {miles.map((m, k) => {
            const lo = k === 0 ? 0 : miles[k - 1];
            const fill = segFill(lo, m);
            const reached = CURRENT_STREAK >= m;
            const isNext = !reached && (k === 0 || CURRENT_STREAK >= miles[k - 1]);
            return (
              <React.Fragment key={m}>
                <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}>
                  <div style={{ width: (fill * 100) + '%', height: '100%', borderRadius: 999, background: GREEN }} />
                </div>
                <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: reached ? DEEP : (isNext ? '#EAF6E2' : '#fff'), border: '2px solid ' + (reached || isNext ? DEEP : SPROUT.cream2), boxShadow: isNext ? '0 0 0 3px ' + GREEN + '33' : 'none' }}>
                  {reached ? <Icon.Leaf size={11} color="#fff" /> : <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 9, color: isNext ? DEEP : SPROUT.mute }}>{m}</span>}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* 3 glanceable stat tiles */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[['Current streak', '13'], ['Longest streak', '21'], ['Water saves', '2']].map(([label, value], i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 11, padding: '7px 4px' }}>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: DEEP }}>{value}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6, letterSpacing: '.05em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700, textAlign: 'center' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* month grid with leaf-badge milestone days */}
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: SPROUT.ink }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
            const watered = i >= SK.START && i <= SK.TODAY;
            const isMile = mileCells.includes(i);
            const future = i > SK.TODAY;
            return (
              <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', opacity: future ? 0.5 : 1 }}>
                <span style={{ position: 'absolute', top: 1, left: 3, fontFamily: 'Nunito, system-ui', fontSize: 7.5, fontWeight: 800, color: SPROUT.mute }}>{(i % 31) + 1}</span>
                {isMile
                  ? <span style={{ width: 15, height: 15, borderRadius: '50%', background: '#EAF6E2', border: '1.5px solid ' + DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Leaf size={9} color={DEEP} /></span>
                  : watered && <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#9CD389' }} />}
              </div>
            );
          })}
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · This-week leaf strip + one connected run (count + 7-leaf strip + run pill + record) ──
function ProposedWeekStripRun({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  // this-week strip: Su–Sa, watered through today (Thu)
  const week = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const wateredThru = 4; // 0..4 done (Su–Thu), Fri/Sat pending
  // per-row pill segments for the run START..TODAY
  const segs = [];
  for (let r = 0; r < SK.ROWS; r++) {
    let lo = null, hi = null;
    for (let c = 0; c < SK.COLS; c++) {
      const i = r * SK.COLS + c;
      if (i >= SK.START && i <= SK.TODAY) { if (lo === null) lo = c; hi = c; }
    }
    if (lo !== null) segs.push({ r, lo, hi });
  }
  const cellX = (c) => SK.PX + c * (SK.C + SK.G);
  const cellY = (r) => r * (SK.C + SK.G);
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10, padding: '12px 14px', minHeight: 0 }}>
        {/* leaf-streak count (unchanged framing) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon.Leaf size={22} color={DEEP} />
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 19, color: SPROUT.ink }}>13<span style={{ fontSize: 12.5, fontWeight: 800, color: SPROUT.mute, marginLeft: 5 }}>day streak</span></span>
        </div>

        {/* (1) THIS WEEK 7-day leaf strip */}
        <div style={{ background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '9px 11px 10px' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, marginBottom: 8 }}>This week</div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {week.map((d, i) => {
              const done = i <= wateredThru;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{d}</span>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? '#EAF6E2' : 'transparent', border: done ? '1.5px solid ' + GREEN + '66' : '1.5px solid ' + SPROUT.line }}>
                    <Icon.Leaf size={13} color={done ? DEEP : SPROUT.line} />
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* (2) month grid with one connected run pill + today disc */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW }}>
          {segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: cellY(s.r) + 1,
              width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 2, height: SK.C, borderRadius: 999,
              background: '#CDEBBE', zIndex: 1
            }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const inRun = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const future = i > SK.TODAY;
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                  {isToday ? (
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 9, color: '#fff' }}>{(i % 31) + 1}</span>
                  ) : (
                    <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: inRun ? DEEP : SPROUT.mute }}>{(i % 31) + 1}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* longest-streak record row (unchanged) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '9px 12px' }}>
          <Icon.Leaf size={15} color={SPROUT.mute} />
          <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11.5, color: SPROUT.mute }}>Longest streak</span>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: SPROUT.ink }}>21 days</span>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// NEW — connected run + summary chips + next-milestone flag + records card
function ProposedStreakRun({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  // per-row pill segments for the run START..TODAY
  const segs = [];
  for (let r = 0; r < SK.ROWS; r++) {
    let lo = null, hi = null;
    for (let c = 0; c < SK.COLS; c++) {
      const i = r * SK.COLS + c;
      if (i >= SK.START && i <= SK.TODAY) { if (lo === null) lo = c; hi = c; }
    }
    if (lo !== null) segs.push({ r, lo, hi });
  }
  const cellX = (c) => SK.PX + c * (SK.C + SK.G);
  const cellY = (r) => r * (SK.C + SK.G);
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 14px', minHeight: 0 }}>
        {/* (1) two quiet summary chips */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, background: '#EAF6E2', border: '1.5px solid ' + GREEN + '55', borderRadius: 13, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15 }}>🌿</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.04em', textTransform: 'uppercase', color: '#5a7a4e', fontWeight: 700 }}>Current streak</span>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: DEEP }}>13 days</span>
            </div>
          </div>
          <div style={{ flex: 1, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></svg>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.04em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Next milestone</span>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: SPROUT.ink }}>14 days</span>
            </div>
          </div>
        </div>

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* (2)+(3) grid with one connected run pill + today disc + milestone flag */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW }}>
          {/* run pills, one per row segment, behind the cells */}
          {segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: cellY(s.r) + 1,
              width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 2, height: SK.C, borderRadius: 999,
              background: '#CFEebF', backgroundColor: '#CDEBBE', zIndex: 1
            }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const inRun = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const isMile = i === SK.MILE;
              const future = i > SK.TODAY;
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', opacity: future && !isMile ? 0.5 : 1 }}>
                  {isToday ? (
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 9, color: '#fff' }}>{((i) % 31) + 1}</span>
                  ) : isMile ? (
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', border: '1.5px dashed ' + DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></svg>
                    </span>
                  ) : (
                    <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: inRun ? DEEP : SPROUT.mute }}>{((i) % 31) + 1}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* (4) calm records card */}
        <div style={{ background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '10px 12px' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.mute, marginBottom: 7 }}>Your records</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 7 }}>
              <Icon.Leaf size={14} color={DEEP} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>21 days</span>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 9, color: SPROUT.mute }}>Longest run</span>
              </div>
            </div>
            <div style={{ width: 1, background: SPROUT.line }} />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 7 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>7/7</span>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 9, color: SPROUT.mute }}>Best week</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · One continuous growth vine (gradient ribbon + Days-grown/Waters tiles + longest-bloom) ──
// Same SK month geometry + chrome as CURRENT; runs of watered days fuse into one
// soft-green→deep gradient vine behind the numbers, today sits at the leafy tip,
// two summary tiles (Days grown / Waters used) sit above, a muted longest-bloom
// record line sits below. Only the calendar body changes.
function ProposedGrowthVine({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  const segs = [];
  for (let r = 0; r < SK.ROWS; r++) {
    let lo = null, hi = null;
    for (let c = 0; c < SK.COLS; c++) {
      const i = r * SK.COLS + c;
      if (i >= SK.START && i <= SK.TODAY) { if (lo === null) lo = c; hi = c; }
    }
    if (lo !== null) segs.push({ r, lo, hi });
  }
  const cellX = (c) => SK.PX + c * (SK.C + SK.G);
  const cellY = (r) => r * (SK.C + SK.G);
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 14px', minHeight: 0 }}>
        {/* (2) two summary tiles — Days grown / Waters used */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, background: '#EAF6E2', border: '1.5px solid ' + GREEN + '55', borderRadius: 13, padding: '8px 11px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon.Leaf size={15} color={DEEP} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.04em', textTransform: 'uppercase', color: '#5a7a4e', fontWeight: 700 }}>Days grown</span>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: DEEP }}>13</span>
            </div>
          </div>
          <div style={{ flex: 1, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '8px 11px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon.Droplet size={15} color="#3E92C9" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.04em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Waters used</span>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: SPROUT.ink }}>2</span>
            </div>
          </div>
        </div>

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* (1) grid with one continuous gradient growth vine + leafy today tip */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW }}>
          {segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: cellY(s.r) + 1,
              width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 2, height: SK.C, borderRadius: 999,
              background: 'linear-gradient(90deg, ' + GREEN + ' 0%, ' + DEEP + ' 100%)', opacity: 0.32, zIndex: 1
            }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const inRun = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const future = i > SK.TODAY;
              if (isToday) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px -1px ' + DEEP + '99' }}>
                      <Icon.Leaf size={13} color="#fff" />
                    </span>
                  </div>
                );
              }
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: inRun ? DEEP : SPROUT.mute }}>{(i % 31) + 1}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* (3) quiet longest-bloom record line */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 7 }}>
          <Icon.Leaf size={12} color={SPROUT.mute} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Longest bloom · 21 days</span>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Garden streak calendar (month grid + connected band + records) ──
function ProposedCalmMonthCal({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const Stat = ({ label, value }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{label}</span>
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: DEEP }}>{value}</span>
    </div>
  );
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 14px', minHeight: 0 }}>
        {/* (a) two-stat header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Stat label="Current streak" value="12 days" />
          <div style={{ width: 1, alignSelf: 'stretch', background: SPROUT.line }} />
          <Stat label="Best streak" value="21 days" />
        </div>

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>June 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* (b)(c) month grid: watered = soft-green filled circle w/ leaf glyph; today = ring; missed = muted outline */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
            const watered = i >= SK.START && i <= SK.TODAY;
            const isToday = i === SK.TODAY;
            const future = i > SK.TODAY;
            if (isToday) {
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: GREEN, border: '2px solid ' + DEEP, boxSizing: 'border-box' }}>
                  <Icon.Leaf size={12} color="#fff" />
                </div>
              );
            }
            if (watered) {
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: GREEN }}>
                  <Icon.Leaf size={12} color={DEEP} />
                </div>
              );
            }
            return (
              <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid ' + SPROUT.line, boxSizing: 'border-box', opacity: future ? 0.65 : 1 }}>
                <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: SPROUT.mute }}>{(i % 31) + 1}</span>
              </div>
            );
          })}
        </div>

        {/* (d) quiet caption */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 7 }}>
          <Icon.Leaf size={12} color={SPROUT.mute} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.12em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>12 days grown this month</span>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Connected streak ribbon (3-stat row + flowing vine + leaf-bud tip + milestone leaf marker) ──
function ProposedRibbonStats({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  const segs = [];
  for (let r = 0; r < SK.ROWS; r++) {
    let lo = null, hi = null;
    for (let c = 0; c < SK.COLS; c++) {
      const i = r * SK.COLS + c;
      if (i >= SK.START && i <= SK.TODAY) { if (lo === null) lo = c; hi = c; }
    }
    if (lo !== null) segs.push({ r, lo, hi });
  }
  const cellX = (c) => SK.PX + c * (SK.C + SK.G);
  const cellY = (r) => r * (SK.C + SK.G);
  const Stat = ({ icon, value, label }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '8px 4px' }}>
      {icon}
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink, lineHeight: 1 }}>{value}</span>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6, letterSpacing: '.08em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700, textAlign: 'center' }}>{label}</span>
    </div>
  );
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 14px', minHeight: 0 }}>
        {/* calm 3-stat row */}
        <div style={{ display: 'flex', gap: 7 }}>
          <Stat icon={<Icon.Leaf size={15} color={DEEP} />} value="13" label="Current streak" />
          <Stat icon={<Icon.Plant size={15} color={GREEN} />} value="13" label="Days watered" />
          <Stat icon={<Icon.Droplet size={15} color="#2E8FB0" />} value="2" label="Water saved" />
        </div>

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* grid with one continuous vine + leaf-bud today tip + milestone leaf marker */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW, paddingTop: 9 }}>
          {segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: 9 + cellY(s.r) + 1,
              width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 2, height: SK.C, borderRadius: 999,
              background: GREEN, opacity: 0.32, zIndex: 1
            }} />
          ))}
          {/* quiet next-milestone leaf marker above the goal day */}
          {(() => {
            const mr = Math.floor(SK.MILE / SK.COLS), mc = SK.MILE % SK.COLS;
            return (
              <div style={{ position: 'absolute', left: cellX(mc) + SK.C / 2 - 6, top: 9 + cellY(mr) - 10, zIndex: 4 }}>
                <Icon.Leaf size={12} color={SPROUT.mute} />
              </div>
            );
          })()}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const inRun = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const isMile = i === SK.MILE;
              const future = i > SK.TODAY;
              if (isToday) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px -1px ' + DEEP + '99' }}>
                      <Icon.Leaf size={13} color="#fff" />
                    </span>
                  </div>
                );
              }
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future && !isMile ? 0.5 : 1, border: isMile ? '1.5px dashed ' + GREEN : 'none', boxSizing: 'border-box' }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: inRun ? DEEP : SPROUT.mute }}>{(i % 31) + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Streak calendar with milestone track (2-stat header + 7/14/30 rail + water-drop day cells) ──
function ProposedMilestoneTrack({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const CUR = 9, NEXT = 14;
  const miles = [7, 14, 30];
  const Stat = ({ icon, label, value, accent }) => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
      {icon}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.12em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{label}</span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16, color: accent, lineHeight: 1 }}>{value}</span>
      </div>
    </div>
  );
  // SK.TODAY corresponds to the 9-day current streak; mark watered days as drops
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 14px', minHeight: 0 }}>
        {/* (1) header stat row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Stat icon={<span style={{ width: 28, height: 28, borderRadius: '50%', background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Leaf size={15} color={DEEP} /></span>} label="Current streak" value={CUR} accent={DEEP} />
          <div style={{ width: 1, alignSelf: 'stretch', background: SPROUT.line }} />
          <Stat icon={<span style={{ width: 28, height: 28, borderRadius: '50%', background: '#E5F2F8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Droplet size={15} color="#2E8FB0" /></span>} label="Next milestone" value={NEXT} accent={SPROUT.ink} />
        </div>

        {/* (2) slim milestone track rail: chips 7/14/30 + green fill to today */}
        <div style={{ position: 'relative', padding: '6px 2px 2px' }}>
          <div style={{ position: 'absolute', left: 8, right: 8, top: 13, height: 4, borderRadius: 999, background: SPROUT.line }} />
          <div style={{ position: 'absolute', left: 8, top: 13, height: 4, borderRadius: 999, background: GREEN, width: 'calc((100% - 16px) * ' + (CUR / 30) + ')' }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {miles.map((m) => {
              const passed = CUR >= m;
              const isNext = !passed && m === NEXT;
              return (
                <div key={m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
                    background: passed ? GREEN : '#fff',
                    border: passed ? 'none' : '2px solid ' + (isNext ? DEEP : SPROUT.line),
                    boxShadow: isNext ? '0 0 0 3px ' + GREEN + '33' : 'none'
                  }}>
                    {passed ? <Icon.Leaf size={10} color="#fff" /> : <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 8, color: isNext ? DEEP : SPROUT.mute }}>{m}</span>}
                  </span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.06em', textTransform: 'uppercase', color: isNext ? DEEP : SPROUT.mute, fontWeight: 700 }}>{m}d</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: SPROUT.ink }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* (3) month grid: watered = soft-green drop; milestone day = highlight ring; today = focus ring */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
            const watered = i >= SK.START && i <= SK.TODAY;
            const isToday = i === SK.TODAY;
            const isMile = i === SK.MILE;
            const future = i > SK.TODAY;
            if (isToday) {
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: GREEN, boxShadow: '0 0 0 3px ' + GREEN + '44', boxSizing: 'border-box' }}>
                  <Icon.Droplet size={12} color="#fff" />
                </div>
              );
            }
            if (watered) {
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EAF6E2' }}>
                  <Icon.Droplet size={12} color={DEEP} />
                </div>
              );
            }
            return (
              <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: isMile ? '2px solid ' + GREEN : '1.5px solid ' + SPROUT.line, boxSizing: 'border-box', opacity: future && !isMile ? 0.6 : 1 }}>
                <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: isMile ? DEEP : SPROUT.mute }}>{(i % 31) + 1}</span>
              </div>
            );
          })}
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Growing-vine streak calendar (solid vine + leaf on each watered day + ringed today + Current/Longest) ──
function ProposedGrowingVine({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  const segs = [];
  for (let r = 0; r < SK.ROWS; r++) {
    let lo = null, hi = null;
    for (let c = 0; c < SK.COLS; c++) {
      const i = r * SK.COLS + c;
      if (i >= SK.START && i <= SK.TODAY) { if (lo === null) lo = c; hi = c; }
    }
    if (lo !== null) segs.push({ r, lo, hi });
  }
  const cellX = (c) => SK.PX + c * (SK.C + SK.G);
  const cellY = (r) => r * (SK.C + SK.G);
  const Stat = ({ label, value, accent }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{label}</span>
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: accent }}>{value}</span>
    </div>
  );
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 14px', minHeight: 0 }}>
        {/* two quiet summary stats */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Stat label="Current streak" value="13 days" accent={DEEP} />
          <div style={{ width: 1, alignSelf: 'stretch', background: SPROUT.line }} />
          <Stat label="Longest streak" value="21 days" accent={SPROUT.ink} />
        </div>

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* one continuous growing vine + a leaf on every watered day + ringed today */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW }}>
          {segs.map((s, k) => (
            <div key={k} style={{
              position: 'absolute', left: cellX(s.lo) - 1, top: cellY(s.r) + 1,
              width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 2, height: SK.C, borderRadius: 999,
              background: GREEN, opacity: 0.32, zIndex: 1
            }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 2 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const watered = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const future = i > SK.TODAY;
              if (watered) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', border: isToday ? '2px solid ' + DEEP : 'none', boxShadow: isToday ? '0 0 0 3px ' + GREEN + '33' : 'none' }}>
                    <Icon.Leaf size={13} color={DEEP} />
                  </div>
                );
              }
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: SPROUT.mute }}>{(i % 31) + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Streak screen: weekly ring + dew-drop saver (stacked summary → week ring + saver chip) ──
function ProposedWeekRingSaver({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const week = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const doneThru = 3; // M–Th done, Th = today, Fri/Sat/Sun pending

  if (!isNew) {
    // CURRENT: the win buried in a plain stacked summary — no week row, no saver.
    const Row = ({ label, value }) => (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 12, padding: '11px 13px' }}>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 12.5, color: SPROUT.mute }}>{label}</span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, color: SPROUT.ink }}>{value}</span>
      </div>
    );
    return (
      <React.Fragment>
        <MiniStreakHeader />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 13, padding: '16px 16px', minHeight: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ position: 'relative', width: 58, height: 58, borderRadius: '50%', background: SPROUT.green, boxShadow: '0 5px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.Leaf size={28} color="#fff" />
            </span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 26, color: SPROUT.ink, lineHeight: 1 }}>13</span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 12, color: SPROUT.mute }}>day streak</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Row label="Longest streak" value="21 days" />
            <Row label="Days grown" value="34" />
            <Row label="This month" value="92%" />
          </div>
        </div>
        <MiniBottomNav active="me" />
      </React.Fragment>
    );
  }

  // NEW: calm hero + glanceable seven-day ring + dew-drop saver chip.
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, padding: '16px 16px', minHeight: 0 }}>
        {/* (1) calm hero — Pip beside the big streak number + leaf-flame accent */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Pip size={52} mood="cheer" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ width: 30, height: 30, borderRadius: '50% 50% 50% 0', transform: 'rotate(45deg)', background: 'linear-gradient(180deg,#7FCC6C,' + DEEP + ')', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon.Leaf size={15} color="#fff" style={{ transform: 'rotate(-45deg)' }} />
              </span>
            </span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 30, color: SPROUT.ink, lineHeight: 1 }}>13</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, marginTop: 3 }}>day streak</span>
            </div>
          </div>
        </div>

        {/* (2) one clean seven-day ring row */}
        <div style={{ background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 16, padding: '13px 12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {week.map((d, i) => {
              const done = i < doneThru;
              const today = i === doneThru;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: today ? DEEP : SPROUT.mute }}>{d}</span>
                  <span style={{
                    width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: done ? GREEN : 'transparent',
                    border: today ? '2px solid ' + DEEP : done ? 'none' : '1.5px solid ' + SPROUT.line,
                    boxShadow: today ? '0 0 0 3px ' + GREEN + '33' : 'none'
                  }}>
                    {done
                      ? <Icon.Check size={14} color="#fff" />
                      : today
                        ? <span style={{ width: 7, height: 7, borderRadius: '50%', background: DEEP }} />
                        : null}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* (3) quiet dew-drop saver chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#E5F2F8', border: '1.5px solid #BFE0EC', borderRadius: 13, padding: '10px 13px' }}>
          <span style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.Droplet size={16} color="#2E8FB0" />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: '#1F6E8C', lineHeight: 1.1 }}>Dew-drop saver</div>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 10.5, color: '#4A7E92', marginTop: 1 }}>Skip a day without losing your streak</div>
          </div>
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Calm sectioned Shop with POPULAR tag (flat grid → Boosts/Streak/Garden rows) ──
function ProposedShopPopular({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GEM = '#6C8AE4';

  if (!isNew) {
    // CURRENT: flat undifferentiated grid — boosts, streak items & cosmetics blur together.
    const Tile = ({ glyph, name, price }) => (
      <div style={{ background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '11px 8px 9px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
        <span style={{ fontSize: 24 }}>{glyph}</span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11, color: SPROUT.ink, textAlign: 'center', lineHeight: 1.15 }}>{name}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon.Gem size={11} color={GEM} /><span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: SPROUT.ink }}>{price}</span></span>
      </div>
    );
    return (
      <AppChrome top="hud" nav="me">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 14px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <Tile glyph="✨" name="Double seeds" price="90" />
            <Tile glyph="⏱️" name="Timer boost" price="60" />
            <Tile glyph="🛡️" name="Streak Freeze" price="120" />
            <Tile glyph="❄️" name="Frost Cover" price="200" />
            <Tile glyph="🪴" name="Plant pot" price="200" />
            <Tile glyph="🌸" name="Rare bloom" price="350" />
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: calm sectioned list, one clean row each; exactly one POPULAR tab badge.
  const Row = ({ icon, tint, name, sub, price, popular }) => (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 3px' }}>
      <span style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 13, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.15 }}>{name}</span>
          {popular && (
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, color: SPROUT.greenDark, background: '#EAF6E2', border: '1px solid ' + SPROUT.green + '66', borderRadius: 5, padding: '2px 5px' }}>Popular</span>
          )}
        </div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 10.5, fontWeight: 600, color: SPROUT.mute, lineHeight: 1.25, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>
      </div>
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, background: '#EAF6E2', borderRadius: 999, padding: '5px 11px' }}>
        <Icon.Gem size={12} color={SPROUT.greenDark} />
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: SPROUT.greenDark }}>{price}</span>
      </span>
    </div>
  );
  const Section = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, paddingLeft: 3, marginBottom: 2 }}>{label}</div>
      {React.Children.map(children, (c, i) => (
        <div style={{ borderTop: i ? '1px solid ' + SPROUT.bg : 'none' }}>{c}</div>
      ))}
    </div>
  );

  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ padding: '12px 14px 6px', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, padding: '4px 14px 10px', minHeight: 0 }}>
          <Section label="Boosts">
            <Row icon={<Icon.Sparkle size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Double seeds" sub="2× seeds for 30 min" price="90" popular />
            <Row icon={<Icon.Clock size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Timer boost" sub="Extra time on timed lessons" price="60" />
          </Section>
          <Section label="Streak">
            <Row icon={<Icon.Shield size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Streak Freeze" sub="Protect your garden if you miss a day" price="120" />
          </Section>
          <Section label="Garden">
            <Row icon={<Icon.Plant size={17} color={SPROUT.greenDark} />} tint="#FBF1DA" name="Plant pot" sub="A new home to grow a bloom" price="200" />
            <Row icon={<Icon.Leaf size={17} color={SPROUT.greenDark} />} tint="#FBF1DA" name="Rare bloom" sub="A special garden flower" price="350" />
          </Section>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Sectioned Shop with item rows (flat grid → Streak/Power-ups/League rows + POPULAR) ──
function ProposedShopStreakLeague({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GEM = '#6C8AE4';

  if (!isNew) {
    // CURRENT: flat priced grid — streak savers, boosts & league items blur together.
    const Tile = ({ glyph, name, price }) => (
      <div style={{ background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '11px 8px 9px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
        <span style={{ fontSize: 23 }}>{glyph}</span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 10.5, color: SPROUT.ink, textAlign: 'center', lineHeight: 1.15 }}>{name}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon.Gem size={11} color={GEM} /><span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: SPROUT.ink }}>{price}</span></span>
      </div>
    );
    return (
      <AppChrome top="hud" nav="me">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 14px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <Tile glyph="🛡️" name="Streak Freeze" price="200" />
            <Tile glyph="🌙" name="Weekend Water" price="350" />
            <Tile glyph="✨" name="Double Seeds" price="100" />
            <Tile glyph="⏱️" name="Time Boost" price="120" />
            <Tile glyph="🏅" name="League Shield" price="1000" />
            <Tile glyph="💧" name="Water Refill" price="60" />
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: grouped sections, one consistent row each; single quiet POPULAR tag.
  const Row = ({ icon, tint, name, sub, price, popular }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 3px' }}>
      <span style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 12.5, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.15 }}>{name}</span>
          {popular && (
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, color: SPROUT.greenDark, background: '#EAF6E2', border: '1px solid ' + SPROUT.green + '66', borderRadius: 5, padding: '2px 5px' }}>Popular</span>
          )}
        </div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 10, fontWeight: 600, color: SPROUT.mute, lineHeight: 1.25, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>
      </div>
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, background: '#EAF6E2', borderRadius: 999, padding: '5px 10px' }}>
        <Icon.Gem size={12} color={SPROUT.greenDark} />
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11.5, color: SPROUT.greenDark }}>{price}</span>
      </span>
    </div>
  );
  const Section = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, paddingLeft: 3, marginBottom: 2 }}>{label}</div>
      {React.Children.map(children, (c, i) => (
        <div style={{ borderTop: i ? '1px solid ' + SPROUT.bg : 'none' }}>{c}</div>
      ))}
    </div>
  );

  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ padding: '12px 14px 5px', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10, padding: '3px 14px 10px', minHeight: 0 }}>
          <Section label="Streak">
            <Row icon={<Icon.Shield size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Streak Freeze" sub="Keeps your garden alive for one missed day" price="200" />
            <Row icon={<Icon.Droplet size={17} color="#2E8FB0" />} tint="#E5F2F8" name="Weekend Water" sub="Take the weekend off, streak stays" price="350" />
          </Section>
          <Section label="Power-ups">
            <Row icon={<Icon.Sparkle size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Double Seeds" sub="2× seeds for the next 15 min" price="100" popular />
            <Row icon={<Icon.Clock size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Time Boost" sub="+30s on timed lessons" price="120" />
          </Section>
          <Section label="League">
            <Row icon={<Icon.Trophy size={17} color="#C79A2E" />} tint="#FBF1DA" name="League Shield" sub="Avoid dropping a league once" price="1000" />
          </Section>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Self-explaining Shop (bare icon+price grid → descriptive benefit rows) ──
function ProposedShopSelfExplain({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GEM = '#6C8AE4', WATER = '#2E8FB0';

  if (!isNew) {
    // CURRENT: a bare icon + gem-price grid, no explanation of what each does.
    const Tile = ({ glyph, name, price }) => (
      <div style={{ background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '12px 6px 9px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 24 }}>{glyph}</span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 10.5, color: SPROUT.ink, textAlign: 'center', lineHeight: 1.15 }}>{name}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon.Gem size={11} color={GEM} /><span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: SPROUT.ink }}>{price}</span></span>
      </div>
    );
    return (
      <AppChrome top="hud" nav="me">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 14px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <Tile glyph="🛡️" name="Streak Freeze" price="200" />
            <Tile glyph="🌸" name="Double Bloom" price="400" />
            <Tile glyph="💧" name="Water Refill" price="350" />
            <Tile glyph="✨" name="Seed Boost" price="90" />
            <Tile glyph="⏱️" name="Timer Boost" price="60" />
            <Tile glyph="🌱" name="Garden Rescue" price="350" />
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: descriptive benefit rows under quiet category headers.
  const Row = ({ icon, tint, name, sub, price, cur }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '9px 11px' }}>
      <span style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 12.5, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.15 }}>{name}</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 10, fontWeight: 600, color: SPROUT.mute, lineHeight: 1.25, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>
      </div>
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, background: SPROUT.green, borderRadius: 999, padding: '5px 11px', boxShadow: '0 2px 0 ' + SPROUT.greenShadow }}>
        {cur === 'water' ? <Icon.Droplet size={12} color="#fff" /> : <Icon.Gem size={12} color="#fff" />}
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11.5, color: '#fff' }}>{price}</span>
      </span>
    </div>
  );
  const Section = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, paddingLeft: 3 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </div>
  );

  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ padding: '12px 14px 6px', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, padding: '4px 14px 10px', minHeight: 0 }}>
          <Section label="Power-ups">
            <Row icon={<Icon.Sparkle size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Double Bloom" sub="Earn 2× seeds for 15 minutes" price="400" cur="gems" />
            <Row icon={<Icon.Droplet size={17} color={WATER} />} tint="#E5F2F8" name="Water Refill" sub="Top your watering can back to full" price="350" cur="gems" />
          </Section>
          <Section label="Streak">
            <Row icon={<Icon.Shield size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Streak Freeze" sub="Keeps your streak safe for one missed day" price="200" cur="gems" />
          </Section>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Tidy Shop: Golden Bloom Wager hero + Garden Care / Boosts sections ──
function ProposedShopWagerSections({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GEM = '#6C8AE4', WATER = '#2E8FB0';

  if (!isNew) {
    // CURRENT: one long flat scroll of look-alike rows, no grouping or hero.
    const Flat = ({ glyph, name, price, cur }) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 12, padding: '9px 11px', minHeight: 34, boxSizing: 'border-box' }}>
        <span style={{ fontSize: 19, flexShrink: 0, width: 24, textAlign: 'center' }}>{glyph}</span>
        <span style={{ flex: 1, minWidth: 0, fontFamily: 'Nunito, system-ui', fontSize: 12.5, fontWeight: 800, color: SPROUT.ink }}>{name}</span>
        <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
          {cur === 'water' ? <Icon.Droplet size={12} color={WATER} /> : <Icon.Gem size={12} color={GEM} />}
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: SPROUT.ink }}>{price}</span>
        </span>
      </div>
    );
    return (
      <AppChrome top="hud" nav="me">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, padding: '14px 14px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Flat glyph="🛡️" name="Streak Freeze" price="200" cur="gems" />
            <Flat glyph="💧" name="Water Refill" price="30" cur="water" />
            <Flat glyph="🌿" name="Wilt Repair" price="120" cur="gems" />
            <Flat glyph="✨" name="Double Seeds 24h" price="90" cur="gems" />
            <Flat glyph="⏱️" name="Timed-round Boost" price="60" cur="gems" />
            <Flat glyph="🪴" name="Garden decor" price="150" cur="gems" />
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: featured wager hero + Garden Care / Boosts sections, consistent rows.
  const Row = ({ icon, tint, name, sub, price, cur }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 3px' }}>
      <span style={{ width: 34, height: 34, borderRadius: 11, flexShrink: 0, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 12.5, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.15 }}>{name}</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 10, fontWeight: 600, color: SPROUT.mute, lineHeight: 1.25, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>
      </div>
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, background: '#EAF6E2', borderRadius: 999, padding: '5px 10px' }}>
        {cur === 'water' ? <Icon.Droplet size={12} color={WATER} /> : <Icon.Gem size={12} color={SPROUT.greenDark} />}
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11.5, color: SPROUT.greenDark }}>{price}</span>
      </span>
    </div>
  );
  const Section = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, paddingLeft: 3, marginBottom: 2 }}>{label}</div>
      {React.Children.map(children, (c, i) => (
        <div style={{ borderTop: i ? '1px solid ' + SPROUT.bg : 'none' }}>{c}</div>
      ))}
    </div>
  );

  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ padding: '11px 14px 5px', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '3px 14px 10px', minHeight: 0 }}>
          {/* (1) featured Golden Bloom Wager hero */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#FBF1DA', border: '1.5px solid #E8D6A8', borderRadius: 15, padding: '11px 12px' }}>
            <span style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Sparkle size={20} color="#C2871B" /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 13.5, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.1 }}>Golden Bloom Wager</div>
              <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 10, fontWeight: 600, color: '#A87C1B', marginTop: 1 }}>Wager 50 gems — keep your streak 7 days to double it</div>
            </div>
            <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: '1px solid #E8D6A8', borderRadius: 999, padding: '5px 10px' }}>
              <Icon.Gem size={12} color="#C2871B" />
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11.5, color: '#A87C1B' }}>50</span>
            </span>
          </div>

          <Section label="Garden Care">
            <Row icon={<Icon.Shield size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Streak Freeze" sub="Protect your garden if you miss a day" price="200" cur="gems" />
            <Row icon={<Icon.Droplet size={17} color={WATER} />} tint="#E5F2F8" name="Water Refill" sub="Top up your daily water" price="30" cur="water" />
            <Row icon={<Icon.Leaf size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Wilt Repair" sub="Revive a wilted plant" price="120" cur="gems" />
          </Section>
          <Section label="Boosts">
            <Row icon={<Icon.Sparkle size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Double Seeds 24h" sub="2× seeds for a full day" price="90" cur="gems" />
            <Row icon={<Icon.Clock size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Timed-round Boost" sub="Extra time on timed lessons" price="60" cur="gems" />
          </Section>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Sectioned shop with what-it-does (flat grid → Streak care / Boosts described rows) ──
function ProposedShopWhatItDoes({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GEM = '#6C8AE4';

  if (!isNew) {
    const Tile = ({ glyph, price }) => (
      <div style={{ background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '13px 6px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
        <span style={{ fontSize: 24 }}>{glyph}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon.Gem size={11} color={GEM} /><span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: SPROUT.ink }}>{price}</span></span>
      </div>
    );
    return (
      <AppChrome top="hud" nav="me">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 14px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <Tile glyph="🛡️" price="200" />
            <Tile glyph="❄️" price="150" />
            <Tile glyph="✨" price="400" />
            <Tile glyph="🌱" price="120" />
            <Tile glyph="💧" price="80" />
            <Tile glyph="⏱️" price="60" />
          </div>
        </div>
      </AppChrome>
    );
  }

  const Row = ({ icon, tint, name, sub, price, popular }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 3px' }}>
      <span style={{ width: 34, height: 34, borderRadius: 11, flexShrink: 0, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 12.5, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.15 }}>{name}</span>
          {popular && (
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, color: SPROUT.mute, background: SPROUT.bg, borderRadius: 5, padding: '2px 5px' }}>Popular</span>
          )}
        </div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 10, fontWeight: 600, color: SPROUT.mute, lineHeight: 1.25, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>
      </div>
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, background: '#EAF6E2', borderRadius: 999, padding: '5px 10px' }}>
        <Icon.Gem size={12} color={SPROUT.greenDark} />
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11.5, color: SPROUT.greenDark }}>{price}</span>
      </span>
    </div>
  );
  const Section = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, paddingLeft: 3, marginBottom: 2 }}>{label}</div>
      {React.Children.map(children, (c, i) => (
        <div style={{ borderTop: i ? '1px solid ' + SPROUT.bg : 'none' }}>{c}</div>
      ))}
    </div>
  );

  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px 5px', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 999, padding: '4px 11px 4px 9px' }}>
            <Icon.Gem size={13} color={GEM} />
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>420</span>
          </span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, padding: '3px 14px 10px', minHeight: 0 }}>
          <Section label="Streak care">
            <Row icon={<Icon.Shield size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Streak Freeze" sub="Keeps your garden alive for one missed day" price="200" popular />
            <Row icon={<Icon.Droplet size={17} color="#2E8FB0" />} tint="#E5F2F8" name="Frost Cover" sub="Shields a wilting day overnight" price="150" />
          </Section>
          <Section label="Boosts">
            <Row icon={<Icon.Sparkle size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Double Seeds" sub="Earn 2× seeds for 15 minutes" price="400" />
            <Row icon={<Icon.Plant size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Seed Boost" sub="Head-start your next bloom" price="120" />
            <Row icon={<Icon.Clock size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Timer Boost" sub="Extra time on timed lessons" price="60" />
          </Section>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Shop, sorted by purpose (flat grid → Keep-streak / Grow-faster / Garden-style rows) ──
function ProposedShopByPurpose({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GEM = '#6C8AE4';

  if (!isNew) {
    // CURRENT: flat grid of bare icon + gem price, no explanation.
    const Tile = ({ glyph, price }) => (
      <div style={{ background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '13px 6px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
        <span style={{ fontSize: 24 }}>{glyph}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon.Gem size={11} color={GEM} /><span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: SPROUT.ink }}>{price}</span></span>
      </div>
    );
    return (
      <AppChrome top="hud" nav="me">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 14px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <Tile glyph="🛡️" price="200" />
            <Tile glyph="❄️" price="150" />
            <Tile glyph="✨" price="90" />
            <Tile glyph="🌱" price="60" />
            <Tile glyph="🪴" price="200" />
            <Tile glyph="🌸" price="350" />
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: purpose sections, one calm row each; header gem balance; one POPULAR tag.
  const Row = ({ icon, tint, name, sub, price, popular }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 3px' }}>
      <span style={{ width: 34, height: 34, borderRadius: 11, flexShrink: 0, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 12.5, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.15 }}>{name}</span>
          {popular && (
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, color: SPROUT.greenDark, background: '#EAF6E2', border: '1px solid ' + SPROUT.green + '66', borderRadius: 5, padding: '2px 5px' }}>Popular</span>
          )}
        </div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 10, fontWeight: 600, color: SPROUT.mute, lineHeight: 1.25, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>
      </div>
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, background: '#EAF6E2', borderRadius: 999, padding: '5px 10px' }}>
        <Icon.Gem size={12} color={SPROUT.greenDark} />
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11.5, color: SPROUT.greenDark }}>{price}</span>
      </span>
    </div>
  );
  const Section = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, paddingLeft: 3, marginBottom: 2 }}>{label}</div>
      {React.Children.map(children, (c, i) => (
        <div style={{ borderTop: i ? '1px solid ' + SPROUT.bg : 'none' }}>{c}</div>
      ))}
    </div>
  );

  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px 5px', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 999, padding: '4px 11px 4px 9px' }}>
            <Icon.Gem size={13} color={GEM} />
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>420</span>
          </span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '3px 14px 10px', minHeight: 0 }}>
          <Section label="Keep your streak">
            <Row icon={<Icon.Shield size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Streak Freeze" sub="Protects your garden if you miss a day" price="200" popular />
            <Row icon={<Icon.Droplet size={17} color="#2E8FB0" />} tint="#E5F2F8" name="Frost Cover" sub="Shields a wilting day overnight" price="150" />
          </Section>
          <Section label="Grow faster">
            <Row icon={<Icon.Sparkle size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Double Seeds" sub="2× seeds for 30 min" price="90" />
            <Row icon={<Icon.Plant size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Seed Boost" sub="Head-start your next bloom" price="60" />
          </Section>
          <Section label="Garden style">
            <Row icon={<Icon.Leaf size={17} color={SPROUT.greenDark} />} tint="#FBF1DA" name="Rare Bloom" sub="A special garden flower" price="350" />
          </Section>
        </div>
      </div>
    </AppChrome>
  );
}



// ── Type-it exercise card (produce-the-word typing; deck's first typed-answer exercise) ──
// ── Proposed · Type it (tap-the-word-bank Arrange → free-recall typed translation w/ keyboard) ──
function ProposedTypeIt({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const DEEP = '#3fa52e', GREEN = '#6fbf5e';

  // CURRENT: the Arrange exercise — build the sentence by tapping the word bank.
  if (!isNew) {
    const placed = ['The', 'cat'];
    const bank = ['The', 'cat', 'drinks', 'water', 'slowly', 'now'];
    const Chip = ({ label }) => (
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13, padding: '8px 13px', borderRadius: 11, background: '#fff', border: '1.5px solid ' + SPROUT.line, color: SPROUT.ink, boxShadow: '0 2px 0 ' + SPROUT.cream2 }}>{label}</span>
    );
    return (
      <AppChrome top="exercise">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 13, padding: '14px 16px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink }}>Build the sentence</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z" fill={DEEP} stroke="none"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>
            </span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 16, color: SPROUT.ink }}>The cat drinks water.</span>
          </div>
          {/* answer line of tapped chips */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, borderBottom: '2px solid ' + SPROUT.line, paddingBottom: 8, minHeight: 40 }}>
            {placed.map((w) => <Chip key={w} label={w} />)}
          </div>
          {/* the tap word bank */}
          <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {bank.map((w, i) => <Chip key={i} label={w} />)}
          </div>
          <div style={{ flexShrink: 0, background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.06em', padding: '12px 0', borderRadius: 13, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>CHECK</div>
        </div>
      </AppChrome>
    );
  }

  // NEW: a "Type it" produce-the-word exercise with an on-screen keyboard.
  const ROWS = [
    'QWERTYUIOP'.split(''),
    'ASDFGHJKL'.split(''),
    'ZXCVBNM'.split(''),
  ];
  const Key = ({ ch, w }) => (
    <span style={{ flex: w || 1, height: 29, borderRadius: 6, background: '#fff', boxShadow: '0 1px 0 #B6AEA0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 12.5, color: '#2A2320' }}>{ch}</span>
  );
  const hints = ['purrs', 'pet', 'furry'];

  return (
    <AppChrome top="exercise">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11, padding: '12px 16px 8px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink }}>Type the word</div>

          {/* Pip with a speech bubble holding the spoken clue to produce */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div className="exp-bob" style={{ flexShrink: 0 }}><Pip size={44} mood="cheer" /></div>
            <div style={{ position: 'relative', flex: 1, minWidth: 0, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '10px 13px', marginTop: 4 }}>
              <span style={{ position: 'absolute', left: -6, top: 14, width: 10, height: 10, background: '#fff', borderLeft: '1.5px solid ' + SPROUT.line, borderBottom: '1.5px solid ' + SPROUT.line, transform: 'rotate(45deg)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z" fill={DEEP} stroke="none"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>
                </span>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 14, color: SPROUT.ink, lineHeight: 1.25 }}>A small furry pet that purrs</span>
              </div>
            </div>
          </div>

          {/* the calm typing field with a soft green outline + text cursor */}
          <div style={{ background: '#FFFDF7', border: '2px solid ' + GREEN, borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', minHeight: 46 }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 15, color: SPROUT.mute }}>Type in English…</span>
            <span className="exp-caret" style={{ display: 'inline-block', width: 2, height: 20, background: DEEP, marginLeft: 1 }} />
          </div>

          <div style={{ flex: 1, minHeight: 10 }} />

          {/* full-width CHECK between the field and the keyboard */}
          <div style={{ flexShrink: 0, background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.06em', padding: '10px 0', borderRadius: 13, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>CHECK</div>
        </div>

        {/* on-screen iOS keyboard — its natural state for a typing screen (replaces tab bar) */}
        <div style={{ flexShrink: 0, background: '#D1D5DB', display: 'flex', flexDirection: 'column' }}>
          {/* dotted tap-hint words sit in the keyboard's suggestion strip, just above the keys */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '6px 6px', borderBottom: '1px solid #BFC4CB' }}>
            {hints.map((w, i) => (
              <span key={i} style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, color: '#2A2320', borderBottom: '2px dotted ' + DEEP, paddingBottom: 1 }}>{w}</span>
            ))}
          </div>
          <div style={{ padding: '6px 4px 8px', display: 'flex', flexDirection: 'column', gap: 5 }}>
            {ROWS.map((row, ri) => (
              <div key={ri} style={{ display: 'flex', gap: 4, padding: ri === 1 ? '0 14px' : '0 2px' }}>
                {ri === 2 && <Key ch="⇧" w={1.5} />}
                {row.map((ch) => <Key key={ch} ch={ch} />)}
                {ri === 2 && <Key ch="⌫" w={1.5} />}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 4, padding: '0 2px' }}>
              <Key ch="123" w={1.5} />
              <Key ch="space" w={5} />
              <Key ch="return" w={2} />
            </div>
          </div>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Type-it word hints (bare empty field → tappable word-hint strip + length cue) ──
function ProposedTypeItHints({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const DEEP = '#3fa52e', GREEN = '#6fbf5e';

  const ROWS = ['QWERTYUIOP'.split(''), 'ASDFGHJKL'.split(''), 'ZXCVBNM'.split('')];
  const Key = ({ ch, w }) => (
    <span style={{ flex: w || 1, height: 29, borderRadius: 6, background: '#fff', boxShadow: '0 1px 0 #B6AEA0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 12.5, color: '#2A2320' }}>{ch}</span>
  );
  // candidate words, each with a tiny meaning beneath
  const chips = [
    { w: 'The', m: 'article' },
    { w: 'cat', m: 'a pet' },
    { w: 'drinks', m: 'sips' },
    { w: 'water', m: 'to sip' },
    { w: 'slowly', m: 'not fast' },
  ];

  // the shared exercise body — prompt, field, CHECK, keyboard. Only the hint strip differs.
  const PromptAndField = () => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11, padding: '12px 16px 8px', minHeight: 0 }}>
      <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink }}>Type what you hear</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z" fill={DEEP} stroke="none"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>
        </span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 12.5, color: SPROUT.mute, letterSpacing: '.02em' }}>Tap to hear the sentence</span>
      </div>
      {/* the typing field — bare on CURRENT; shows "The" + a length cue on NEW */}
      <div style={{ background: '#FFFDF7', border: '2px solid ' + GREEN, borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', minHeight: 46 }}>
        <span style={{ flex: 1, minWidth: 0, fontFamily: 'Nunito, system-ui', fontWeight: isNew ? 800 : 600, fontSize: 15, color: isNew ? SPROUT.ink : SPROUT.mute }}>
          {isNew ? 'The' : 'Type in English…'}
          <span className="exp-caret" style={{ display: 'inline-block', width: 2, height: 18, background: DEEP, marginLeft: 2, verticalAlign: 'text-bottom' }} />
        </span>
        {isNew && <span style={{ flexShrink: 0, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 9.5, letterSpacing: '.04em', color: SPROUT.mute }}>1 / 4 words</span>}
      </div>
      <div style={{ flex: 1, minHeight: 10 }} />
      <div style={{ flexShrink: 0, background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.06em', padding: '10px 0', borderRadius: 13, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>CHECK</div>
    </div>
  );

  const Keyboard = () => (
    <div style={{ padding: '6px 4px 8px', display: 'flex', flexDirection: 'column', gap: 5, background: '#D1D5DB' }}>
      {ROWS.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 4, padding: ri === 1 ? '0 14px' : '0 2px' }}>
          {ri === 2 && <Key ch="⇧" w={1.5} />}
          {row.map((ch) => <Key key={ch} ch={ch} />)}
          {ri === 2 && <Key ch="⌫" w={1.5} />}
        </div>
      ))}
      <div style={{ display: 'flex', gap: 4, padding: '0 2px' }}>
        <Key ch="123" w={1.5} />
        <Key ch="space" w={5} />
        <Key ch="return" w={2} />
      </div>
    </div>
  );

  return (
    <AppChrome top="exercise">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <PromptAndField />
        {/* NEW only: a quiet tappable word-hint strip sits just above the keyboard */}
        {isNew && (
          <div style={{ flexShrink: 0, background: '#EFE9DD', borderTop: '1px solid #DCD4C4', padding: '8px 8px', display: 'flex', gap: 7, overflow: 'hidden' }}>
            {chips.map((c, i) => {
              const used = i === 0; // "The" already dropped into the field
              return (
                <div key={i} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 4px', borderRadius: 10, background: used ? '#EAF6E2' : '#fff', border: '1.5px solid ' + (used ? GREEN : SPROUT.line), opacity: used ? 0.7 : 1 }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: used ? DEEP : SPROUT.ink }}>{c.w}</span>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 8, color: SPROUT.mute, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{c.m}</span>
                </div>
              );
            })}
          </div>
        )}
        <Keyboard />
      </div>
    </AppChrome>
  );
}

// ── Proposed · Picture-grid recognition (text-only answer chips → calm 2x2 picture grid) ──
function ProposedPictureGridMcq({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const DEEP = '#3fa52e', GREEN = '#6fbf5e';
  const opts = [
    { glyph: '🐕', label: 'a dog', sel: true },
    { glyph: '🐈', label: 'a cat', sel: false },
    { glyph: '🐦', label: 'a bird', sel: false },
    { glyph: '🐟', label: 'a fish', sel: false },
  ];

  return (
    <AppChrome>
      <MiniExerciseTop progress={0.55} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, padding: '6px 18px 18px', minHeight: 0 }}>
        {isNew ? (
          <React.Fragment>
            {/* NEW: speaker + prompt word, then a calm 2x2 picture grid */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 999, padding: '8px 16px 8px 9px', boxShadow: '0 3px 0 ' + SPROUT.cream2 }}>
                <span style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 0 ' + SPROUT.greenShadow }}>
                  <Icon.Volume size={17} color="#fff" />
                </span>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 17, color: SPROUT.ink, whiteSpace: 'nowrap' }}>the dog</span>
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
              {opts.map((o, i) => {
                const on = o.sel;
                const st = on
                  ? { background: '#EAF6E2', border: '2px solid ' + DEEP, boxShadow: '0 9px 18px -8px rgba(79,158,63,.5), 0 3px 0 ' + SPROUT.greenShadow, transform: 'translateY(-3px)' }
                  : { background: '#FFFDF7', border: '2px solid ' + SPROUT.line, boxShadow: '0 3px 0 ' + SPROUT.cardShadow, transform: 'none' };
                return (
                  <div key={i} style={{ borderRadius: 16, padding: '16px 10px', transition: 'all .2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, position: 'relative', ...st }}>
                    {on && (
                      <span style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon.Check size={12} color="#fff" />
                      </span>
                    )}
                    <div style={{ width: 60, height: 60, borderRadius: 14, background: on ? '#fff' : SPROUT.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34 }}>{o.glyph}</div>
                    <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13.5, color: on ? SPROUT.greenDark : SPROUT.ink }}>{o.label}</span>
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {/* CURRENT: written prompt over four stacked TEXT-only answer chips */}
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: SPROUT.ink, textAlign: 'center' }}>Which one is the dog?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {opts.map((o, i) => {
                const on = o.sel;
                const st = on
                  ? { background: '#EAF6E2', border: '2px solid ' + DEEP, boxShadow: '0 3px 0 ' + SPROUT.greenShadow }
                  : { background: '#FFFDF7', border: '2px solid ' + SPROUT.line, boxShadow: '0 3px 0 ' + SPROUT.cardShadow };
                return (
                  <div key={i} style={{ borderRadius: 14, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 11, position: 'relative', ...st }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, border: '2px solid ' + (on ? GREEN : SPROUT.line), background: on ? GREEN : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {on && <Icon.Check size={12} color="#fff" />}
                    </span>
                    <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 14.5, color: on ? SPROUT.greenDark : SPROUT.ink }}>{o.label}</span>
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        )}
        <div style={{ background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, padding: '12px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow, letterSpacing: '.08em' }}>CHECK</div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Type what you hear (recognition listening → dictation: type the full word/sentence) ──
function ProposedDictation({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const DEEP = '#3fa52e', GREEN = '#6fbf5e';

  // CURRENT: the recognition listening task — audio + tap a matching word tile (recognition only).
  if (!isNew) {
    const tiles = ['meadow', 'harvest', 'orchard', 'blossom'];
    return (
      <AppChrome top="exercise">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '12px 20px 18px', minHeight: 0 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute }}>What do you hear?</div>
          <div className="exp-bob" style={{ width: 90, height: 90, borderRadius: 24, background: SPROUT.green, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 0 ' + SPROUT.greenShadow }}>
            <Icon.Volume size={40} color="#fff" />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 9, marginTop: 'auto' }}>
            {tiles.map((t, i) => (
              <span key={i} style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13, padding: '9px 15px', borderRadius: 12, background: '#fff', border: '1.5px solid ' + SPROUT.line, color: SPROUT.ink, boxShadow: '0 2px 0 ' + SPROUT.cream2 }}>{t}</span>
            ))}
          </div>
          <div style={{ width: '100%', background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.06em', padding: '12px 0', borderRadius: 13, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>CHECK</div>
        </div>
      </AppChrome>
    );
  }

  // NEW: a "Type what you hear" dictation — normal + slow replay, then type the full answer.
  return (
    <AppChrome top="exercise">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, padding: '14px 16px 12px', minHeight: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink }}>Type what you hear</div>

        {/* Pip beside the two audio buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div className="exp-bob" style={{ flexShrink: 0 }}><Pip size={50} mood="cheer" /></div>
          <div style={{ display: 'flex', gap: 9 }}>
            {/* normal play */}
            <span style={{ width: 50, height: 50, borderRadius: 16, background: SPROUT.green, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>
              <Icon.Volume size={24} color="#fff" />
            </span>
            {/* slow replay */}
            <span style={{ width: 50, height: 50, borderRadius: 16, background: '#fff', border: '1.5px solid ' + SPROUT.line, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, boxShadow: '0 3px 0 ' + SPROUT.cream2 }}>
              <svg width="22" height="16" viewBox="0 0 30 20" fill="none">
                <ellipse cx="17" cy="13" rx="9" ry="5.5" fill={SPROUT.sky} stroke="#3E88A8" strokeWidth="1.3" />
                <path d="M17 8 q1-5 6-4" stroke="#3E88A8" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                <circle cx="23.5" cy="3.5" r="1.4" fill="#3E88A8" />
                <path d="M9 13 q-4 0-6-3" stroke="#3E88A8" strokeWidth="1.6" fill="none" strokeLinecap="round" />
              </svg>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 7.5, color: '#3E88A8', letterSpacing: '.04em' }}>0.5×</span>
            </span>
          </div>
        </div>

        {/* the cream dictation field */}
        <div style={{ background: '#FFFDF7', border: '2px solid ' + GREEN, borderRadius: 14, padding: '14px 14px', display: 'flex', alignItems: 'center', minHeight: 56 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 14.5, color: SPROUT.mute }}>Type what you heard…</span>
          <span className="exp-caret" style={{ display: 'inline-block', width: 2, height: 20, background: DEEP, marginLeft: 1 }} />
        </div>

        <div style={{ flex: 1 }} />

        {/* quiet "Can't listen now" fallback just above CHECK */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13, color: SPROUT.mute, textDecoration: 'underline', textUnderlineOffset: 3 }}>Can&rsquo;t listen now</span>
        </div>
        <div style={{ flexShrink: 0, background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.06em', padding: '12px 0', borderRadius: 13, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>CHECK</div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Almost — a gentle near-miss state (binary correct/wrong → amber accepted near-miss) ──
function ProposedNearMiss({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const DEEP = '#3fa52e', GREEN = '#6fbf5e', CLAY = '#ff8a80';
  const AMBER_BG = '#FBEACB', AMBER_LINE = '#E7B84F', AMBER_INK = '#9A6B12';

  // shared exercise body — the Type-it screen with the learner's typed answer "cafe", IDENTICAL on both.
  const Body = () => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 13, padding: '14px 16px 12px', minHeight: 0 }}>
      <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink }}>Type what you hear</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ flexShrink: 0 }}><Pip size={48} mood="happy" /></div>
        <span style={{ width: 50, height: 50, borderRadius: 16, background: SPROUT.green, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>
          <Icon.Volume size={24} color="#fff" />
        </span>
      </div>
      <div style={{ background: '#FFFDF7', border: '2px solid ' + SPROUT.line, borderRadius: 14, padding: '14px', display: 'flex', alignItems: 'center', minHeight: 54 }}>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 16, color: SPROUT.ink }}>cafe</span>
      </div>
    </div>
  );

  if (!isNew) {
    // CURRENT: the binary clay "wrong" drawer — a missing accent scored as totally wrong, no credit.
    return (
      <AppChrome top="exercise">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Body />
          <div style={{ flexShrink: 0, background: '#FBE7E4', borderTop: '1.5px solid ' + CLAY, padding: '14px 18px 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: CLAY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </span>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: '#C0392B' }}>Incorrect</span>
            </div>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 12.5, color: '#9A4036' }}>Correct answer: <span style={{ fontWeight: 900 }}>café</span></div>
            <div style={{ background: CLAY, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.06em', padding: '12px 0', borderRadius: 13, boxShadow: '0 4px 0 #E0726C' }}>GOT IT</div>
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: a calm amber "Almost!" near-miss — accepted, with the slipped character corrected in green.
  return (
    <AppChrome top="exercise">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Body />
        <div style={{ flexShrink: 0, background: AMBER_BG, borderTop: '1.5px solid ' + AMBER_LINE, padding: '14px 18px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: AMBER_LINE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.Leaf size={15} color="#fff" />
            </span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: AMBER_INK }}>Almost — watch the accent</span>
          </div>
          {/* the learner's own answer with ONLY the slipped character corrected in green */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 19, color: SPROUT.ink, background: '#fff', border: '1.5px solid ' + AMBER_LINE, borderRadius: 10, padding: '4px 12px' }}>
              caf<span style={{ color: DEEP }}>é</span>
            </span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11.5, color: AMBER_INK }}>We&rsquo;ll count it — just mind the accent</span>
          </div>
          <div style={{ background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.06em', padding: '12px 0', borderRadius: 13, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>CONTINUE</div>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Speak exercise cards (moved from exploration.jsx to stay under the 500KB Babel limit) ──
// ── Proposed · Speak-it exercise (bare mic → hear-it-first card, one calm green mic, no-penalty fallback) ──
function ProposedSpeakIt({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const DEEP = '#3fa52e', GREEN = '#6fbf5e', CLAY = '#ff8a80';
  const PHRASE = 'Good morning';

  const SpeakerGlyph = ({ s = 15, c = '#fff' }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /></svg>
  );

  if (!isNew) {
    // CURRENT: a bare mic prompt — no way to hear it first, no graceful exit, harsh wrong-state.
    return (
      <AppChrome top="exercise">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '12px 20px 18px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16, color: SPROUT.ink, textAlign: 'center' }}>Speak this phrase</div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 22, color: SPROUT.ink, textAlign: 'center' }}>{PHRASE}</div>
          {/* harsh wrong-state banner */}
          <div style={{ background: '#FFE3E0', border: '1.5px solid #FF5A4D', borderRadius: 12, padding: '8px 14px', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: '#D8362A' }}>Incorrect. Try again.</div>
          <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#FF5A4D', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 0 #C9362B' }}>
            <Icon.Mic size={40} color="#fff" />
          </div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 12, color: SPROUT.mute }}>Tap to speak</div>
        </div>
      </AppChrome>
    );
  }

  // NEW: calm speak-it layout — hear it first, one green mic w/ gentle waveform, no-penalty fallback.
  return (
    <AppChrome top="exercise">
      <style>{`@keyframes speakPulse{0%,100%{transform:scaleY(.5);opacity:.7}50%{transform:scaleY(1);opacity:1}}`}</style>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '12px 18px 16px', minHeight: 0 }}>
        {/* (1) quiet prompt line */}
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, flexShrink: 0 }}>Say it out loud</div>

        {/* (2+3) hear-it-first card with speaker + 0.5x slow chip, Pip beside it */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', flexShrink: 0 }}>
          <div style={{ flex: 1, minWidth: 0, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 16, padding: '13px 14px', boxShadow: '0 4px 14px -10px rgba(42,35,32,.4)' }}>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 19, color: SPROUT.ink, marginBottom: 10 }}>{PHRASE}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 0 ' + SPROUT.greenShadow }}><SpeakerGlyph s={16} /></span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#EAF6E2', border: '1.5px solid ' + GREEN + '88', borderRadius: 999, padding: '5px 11px' }}>
                <span style={{ width: 16, height: 16, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><SpeakerGlyph s={9} /></span>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: SPROUT.greenDark }}>0.5×</span>
              </span>
            </div>
          </div>
          <div className="exp-bob" style={{ flexShrink: 0 }}><Pip size={50} mood="cheer" /></div>
        </div>

        {/* (4) one big centered mic tile with a gentle green waveform while recording */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 9, minHeight: 0 }}>
          <div style={{ width: 96, height: 96, borderRadius: '50%', background: DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 6px 0 ' + SPROUT.greenShadow }}>
            <span aria-hidden style={{ position: 'absolute', inset: -7, borderRadius: '50%', border: '2px solid ' + GREEN + '55' }} />
            {/* gentle calm waveform — soft pulsing bars, not a bouncing meter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 30 }}>
              {[0.55, 0.8, 1, 0.7, 0.5].map((h, i) => (
                <span key={i} style={{ width: 4, height: 30 * h + 'px', borderRadius: 999, background: '#fff', opacity: 0.92, animation: 'speakPulse 1.3s ease-in-out ' + (i * 0.13) + 's infinite' }} />
              ))}
            </div>
          </div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12, color: DEEP }}>Listening…</div>
        </div>

        {/* (5) quiet no-penalty fallback link — mirrors the shipped Quiet audio fallback */}
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13, color: SPROUT.mute, textDecoration: 'underline', textUnderlineOffset: 3, flexShrink: 0 }}>Can&rsquo;t speak now</div>

        {/* (6) full-width CHECK */}
        <div style={{ width: '100%', flexShrink: 0, background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.08em', padding: '12px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>CHECK</div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Word-level speak feedback (one all-or-nothing verdict → per-word color-coded accuracy) ──
function ProposedSpeakFeedback({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const DEEP = '#3fa52e', GREEN = '#6fbf5e', CLAY = '#ff8a80';

  const SpeakerGlyph = ({ s = 15, c = '#fff' }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /></svg>
  );

  // the recorded sentence — each word carries a pronunciation accuracy flag
  const wordsNew = [
    { w: 'I', ok: true }, { w: 'water', ok: true }, { w: 'the', ok: true },
    { w: 'little', ok: false }, { w: 'garden', ok: true }, { w: 'flowers', ok: false },
  ];

  if (!isNew) {
    // CURRENT: a single all-or-nothing verdict — no word-level signal.
    return (
      <AppChrome top="exercise">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '14px 20px 18px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 19, color: SPROUT.ink, textAlign: 'center', lineHeight: 1.4 }}>I water the little garden flowers</div>
          <div style={{ width: 84, height: 84, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 0 ' + SPROUT.greenShadow }}>
            <Icon.Check size={40} color="#fff" />
          </div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 17, color: DEEP }}>Sounds good!</div>
          <div style={{ width: '100%', marginTop: 'auto', background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.08em', padding: '12px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>CONTINUE</div>
        </div>
      </AppChrome>
    );
  }

  // NEW: per-word color-coded accuracy + a calm score chip + tap-to-retry hint.
  return (
    <AppChrome top="exercise">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, padding: '14px 18px 16px', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexShrink: 0 }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute }}>Your pronunciation</span>
          {/* quiet overall score chip */}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#EAF6E2', border: '1.5px solid ' + GREEN + '88', borderRadius: 999, padding: '4px 11px' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: DEEP }} />
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: SPROUT.greenDark }}>82% clear</span>
          </span>
        </div>

        {/* the sentence, each word colored by accuracy */}
        <div style={{ background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 18, padding: '18px 16px', boxShadow: '0 5px 16px -12px rgba(42,35,32,.35)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px 8px', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 21, lineHeight: 1.45 }}>
            {wordsNew.map((it, i) => (
              <span key={i} style={{ position: 'relative', color: it.ok ? DEEP : CLAY, display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                {it.w}
                <span style={{ width: '100%', height: 3, borderRadius: 999, marginTop: 2, background: it.ok ? GREEN : CLAY, opacity: it.ok ? 0.5 : 1 }} />
              </span>
            ))}
          </div>
        </div>

        {/* gentle hint line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
          <span style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: '#FFEDEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SpeakerGlyph s={11} c={CLAY} /></span>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 12.5, color: SPROUT.mute }}>Tap a <span style={{ color: CLAY, fontWeight: 900 }}>clay</span> word to hear it &amp; try again</span>
        </div>

        {/* full-width continue */}
        <div style={{ width: '100%', marginTop: 'auto', flexShrink: 0, background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.08em', padding: '12px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>CONTINUE</div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Live listening Speak state (static mic → karaoke word-fill + live waveform while talking) ──
function ProposedSpeakLive({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const DEEP = '#3fa52e', GREEN = '#6fbf5e';

  // the target sentence; in NEW the first few words are already recognised (karaoke fill)
  const sentence = ['I', 'water', 'the', 'little', 'garden', 'flowers'];
  const recognisedUpto = 3; // words 0..2 recognised, word 3 in-progress

  if (!isNew) {
    // CURRENT: a static mic button — no live sign the app hears them, no progress.
    return (
      <AppChrome top="exercise">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '14px 20px 18px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 19, color: SPROUT.ink, textAlign: 'center', lineHeight: 1.4 }}>I water the little garden flowers</div>
          <div style={{ width: 96, height: 96, borderRadius: '50%', background: DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 0 ' + SPROUT.greenShadow }}>
            <Icon.Mic size={42} color="#fff" />
          </div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 12.5, color: SPROUT.mute }}>Recording…</div>
        </div>
      </AppChrome>
    );
  }

  // NEW: karaoke word-fill + live waveform + Pip leaning in + calm fallback.
  return (
    <AppChrome top="exercise">
      <style>{`
        @keyframes liveWave{0%,100%{transform:scaleY(.35);opacity:.65}50%{transform:scaleY(1);opacity:1}}
        @keyframes wordFill{from{width:0%}to{width:100%}}
      `}</style>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, padding: '14px 18px 16px', minHeight: 0 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, flexShrink: 0 }}>Say it out loud</div>

        {/* (a) sentence card — each word dotted-underlined; underline fills green as recognised */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, flexShrink: 0 }}>
          <div style={{ flex: 1, minWidth: 0, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 18, padding: '17px 15px', boxShadow: '0 5px 16px -12px rgba(42,35,32,.35)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '11px 9px', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 20, lineHeight: 1.4 }}>
              {sentence.map((w, i) => {
                const done = i < recognisedUpto;
                const active = i === recognisedUpto;
                return (
                  <span key={i} style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'stretch', color: done ? DEEP : SPROUT.ink }}>
                    <span style={{ textAlign: 'center' }}>{w}</span>
                    {/* dotted base underline */}
                    <span style={{ position: 'relative', height: 3, marginTop: 3, borderRadius: 999, background: 'transparent', borderTop: '2px dotted ' + SPROUT.cream2 }}>
                      {/* green fill: full for done words, animating for the active word */}
                      <span style={{ position: 'absolute', left: 0, top: -2, height: 3, borderRadius: 999, background: GREEN, width: done ? '100%' : '0%', animation: active ? 'wordFill 1.1s ease-out forwards' : 'none' }} />
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
          {/* (c) Pip leans in, listening */}
          <div className="exp-bob" style={{ flexShrink: 0 }}><Pip size={48} mood="cheer" /></div>
        </div>

        {/* (b) live green waveform in a rounded cream card while the mic is open */}
        <div style={{ background: SPROUT.cream, border: '1.5px solid ' + SPROUT.line, borderRadius: 16, padding: '14px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 38 }}>
            {[0.4, 0.7, 1, 0.55, 0.85, 0.5, 0.95, 0.65, 0.45, 0.8, 0.6, 0.35, 0.75, 0.5, 0.9].map((h, i) => (
              <span key={i} style={{ width: 4, height: 38 * h + 'px', borderRadius: 999, background: i % 2 ? GREEN : DEEP, animation: 'liveWave 1.1s ease-in-out ' + (i * 0.07) + 's infinite' }} />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: DEEP, boxShadow: '0 0 0 3px ' + GREEN + '44' }} />
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12, color: DEEP }}>Listening… keep going</span>
          </div>
        </div>

        {/* (d) calm no-penalty fallback link */}
        <div style={{ marginTop: 'auto', textAlign: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13, color: SPROUT.mute, textDecoration: 'underline', textUnderlineOffset: 3 }}>Can&rsquo;t speak now</span>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Lesson preview start sheet (bare START → calm preview bottom-sheet over dimmed path) ──
function ProposedLessonPreview({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';

  // the unit header ribbon + path nodes — IDENTICAL on both phones (shared chrome).
  const UnitHeader = () => (
    <div style={{ width: '100%', maxWidth: 252, background: SPROUT.green, borderRadius: 16, padding: '11px 14px 12px', boxShadow: '0 5px 0 ' + SPROUT.greenShadow, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Leaf size={14} color="#fff" /></span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.82)' }}>Unit 1</span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: '#fff', lineHeight: 1.1 }}>Sprout Basics</span>
          </div>
        </div>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: '#fff' }}>3<span style={{ opacity: .65 }}>/8</span></span>
      </div>
      <div style={{ height: 7, borderRadius: 999, background: 'rgba(255,255,255,.3)', overflow: 'hidden' }}>
        <div style={{ width: '32%', height: '100%', borderRadius: 999, background: '#fff' }} />
      </div>
    </div>
  );

  // the path trail: a completed disc, the active node (START), a locked disc.
  const Trail = ({ dim }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px 0 6px', minHeight: 0, opacity: dim ? 0.45 : 1, filter: dim ? 'saturate(.85)' : 'none', transition: 'opacity .2s' }}>
      <div style={{ width: 46, height: 46, borderRadius: '50%', background: SPROUT.green, boxShadow: '0 4px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: .92 }}>
        <Icon.Check size={22} color="#fff" />
      </div>
      <div style={{ width: 0, height: 22, borderLeft: '3px dotted ' + SPROUT.cream2 }} />
      {/* active node with START bubble */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ background: '#fff', color: SPROUT.greenDark, fontWeight: 900, fontSize: 11, letterSpacing: '.16em', padding: '5px 13px', borderRadius: 999, marginBottom: 8, boxShadow: '0 4px 12px -5px rgba(42,35,32,.3)' }}>START</div>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(180deg,#7FCC6C,' + SPROUT.green + ')', boxShadow: '0 6px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.Leaf size={30} color="#fff" />
        </div>
      </div>
      <div style={{ width: 0, height: 22, borderLeft: '3px dotted ' + SPROUT.cream2 }} />
      <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#EDE4D2', boxShadow: '0 4px 0 #D9CDB5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#B6A98E" strokeWidth="2.4"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round"/></svg>
      </div>
    </div>
  );

  if (!isNew) {
    // CURRENT: tapping the node just shows the bare START bubble — no preview.
    return (
      <AppChrome top="hud" nav="home">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, padding: '14px 18px', minHeight: 0, overflow: 'hidden' }}>
          <UnitHeader />
          <Trail dim={false} />
        </div>
      </AppChrome>
    );
  }

  // NEW: the same path, dimmed, with a calm preview start-sheet risen from the bottom.
  return (
    <AppChrome top="hud" nav="home">
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, padding: '14px 18px 0', minHeight: 0, overflow: 'hidden' }}>
        <UnitHeader />
        <Trail dim={true} />
        {/* scrim over the path */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'rgba(42,35,32,.22)' }} />

        {/* the preview start-sheet */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: '#FFFDF7', borderTopLeftRadius: 22, borderTopRightRadius: 22, boxShadow: '0 -14px 34px -16px rgba(42,35,32,.5)', padding: '0 18px 18px' }}>
          {/* Pip peeking over the top edge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: -34, marginBottom: 2, pointerEvents: 'none' }}>
            <div className="exp-bob"><Pip size={62} mood="cheer" /></div>
          </div>
          {/* grab handle */}
          <div style={{ width: 38, height: 4, borderRadius: 999, background: SPROUT.cream2, margin: '0 auto 12px' }} />
          {/* eyebrow */}
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, textAlign: 'center', marginBottom: 5 }}>Unit 1 · Lesson 3</div>
          {/* title */}
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 21, color: DEEP, textAlign: 'center', lineHeight: 1.1, marginBottom: 8 }}>Garden Greetings</div>
          {/* one plain-language line */}
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 13, color: SPROUT.mute, textAlign: 'center', lineHeight: 1.45, maxWidth: 260, margin: '0 auto 14px' }}>Here you&rsquo;ll grow: saying hello and asking how someone&rsquo;s day is growing.</div>
          {/* two stat chips */}
          <div style={{ display: 'flex', gap: 9, marginBottom: 15 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#EAF6E2', border: '1.5px solid ' + GREEN + '66', borderRadius: 12, padding: '9px 6px' }}>
              <Icon.Leaf size={14} color={DEEP} />
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, letterSpacing: '.04em', color: SPROUT.greenDark }}>LEVEL 1 OF 3</span>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#FBF1DA', border: '1.5px solid #E8D6A8', borderRadius: 12, padding: '9px 6px' }}>
              <Icon.Sparkle size={14} color="#E0A21C" />
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, letterSpacing: '.04em', color: '#A87C1B' }}>EARN +15 SEEDS</span>
            </div>
          </div>
          {/* full-width start button */}
          <div style={{ background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, letterSpacing: '.06em', padding: '14px 0', borderRadius: 15, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Start</div>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Onboarding payoff: "Your garden plan is ready" (abrupt end → personalized plan recap) ──
function ProposedGardenPlan({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const DEEP = '#3fa52e', GREEN = '#6fbf5e';

  // shared onboarding progress bar (chevron + green bar + step count)
  const Progress = ({ pct, step }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px 4px', flexShrink: 0 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
      <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}>
        <div style={{ width: pct, height: '100%', borderRadius: 999, background: SPROUT.green }} />
      </div>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, fontWeight: 700, letterSpacing: '.08em', color: SPROUT.mute }}>{step}</span>
    </div>
  );

  if (!isNew) {
    // CURRENT: the flow ends on the last question — the daily watering-goal commitment.
    const goals = [['5 min', 'a day', 'Casual'], ['10 min', 'a day', 'Regular'], ['15 min', 'a day', 'Serious'], ['20 min', 'a day', 'Intense']];
    const SELECTED = 1;
    return (
      <React.Fragment>
        <Progress pct="88%" step="6/6" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11, padding: '10px 18px 14px', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div className="exp-bob" style={{ flexShrink: 0 }}><Pip size={44} mood="cheer" /></div>
            <div style={{ position: 'relative', background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '10px 13px', marginTop: 3 }}>
              <span style={{ position: 'absolute', left: -6, top: 13, width: 10, height: 10, background: '#fff', borderLeft: '1.5px solid ' + SPROUT.line, borderBottom: '1.5px solid ' + SPROUT.line, transform: 'rotate(45deg)' }} />
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, color: SPROUT.ink, lineHeight: 1.3 }}>What's your daily watering goal?</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {goals.map(([time, per, desc], i) => {
              const sel = i === SELECTED;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 7, padding: '11px 13px', borderRadius: 14, background: sel ? '#EAF6E2' : '#fff', border: '2px solid ' + (sel ? SPROUT.green : SPROUT.line), boxShadow: sel ? '0 3px 0 ' + SPROUT.green + '55' : 'none' }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14.5, color: sel ? SPROUT.greenDark : SPROUT.ink }}>{time}</span>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 10.5, color: SPROUT.mute }}>{per}</span>
                  <span style={{ marginLeft: 'auto', fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11.5, color: sel ? SPROUT.greenDark : SPROUT.mute }}>{desc}</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 'auto', background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.04em', padding: '13px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>I'm committed</div>
        </div>
      </React.Fragment>
    );
  }

  // NEW: a calm payoff screen that reflects the learner's answers back as a personalized plan.
  const stats = [
    { icon: <Icon.Leaf size={17} color={DEEP} />, value: '300+', label: 'words to grow' },
    { icon: <Icon.Book size={17} color={DEEP} />, value: '12', label: 'garden tales' },
  ];
  const readback = [
    { icon: <Icon.Compass size={16} color={DEEP} />, label: 'Motivation', detail: 'Travel & live abroad' },
    { icon: <Icon.Target size={16} color={DEEP} />, label: 'Daily goal', detail: '10 min a day' },
    { icon: <Icon.Clock size={16} color={DEEP} />, label: 'Watering reminder', detail: '8:00 AM each morning' },
  ];

  return (
    <React.Fragment>
      <Progress pct="100%" step="6/6" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 18px 16px', minHeight: 0, overflow: 'hidden' }}>
        {/* (2) Pip celebrating */}
        <div style={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <div className="exp-bob"><Pip size={66} mood="cheer" /></div>
        </div>
        {/* (3) headline */}
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 21, color: DEEP, textAlign: 'center', lineHeight: 1.1, flexShrink: 0 }}>Your garden plan is ready!</div>

        {/* (4) plan stats */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, textAlign: 'center', marginBottom: 8 }}>Your plan includes</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {stats.map((s, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#EAF6E2', border: '1.5px solid ' + GREEN + '55', borderRadius: 13, padding: '10px 11px' }}>
                <span style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</span>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.greenDark }}>{s.value}</span>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 9.5, color: SPROUT.mute }}>{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* (5) divider + read-back of the learner's own answers */}
        <div style={{ height: 1, background: SPROUT.line, flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, flexShrink: 0 }}>
          {readback.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r.icon}</span>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>{r.label}</span>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11, color: SPROUT.mute }}>{r.detail}</span>
              </div>
            </div>
          ))}
        </div>

        {/* (6) full-width start button */}
        <div style={{ marginTop: 'auto', background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, letterSpacing: '.05em', padding: '14px 0', borderRadius: 15, boxShadow: '0 4px 0 ' + SPROUT.greenShadow, flexShrink: 0 }}>Start growing</div>
      </div>
    </React.Fragment>
  );
}

// ── Proposed · Today card time estimate (no length cue → calm "~4 min · 3 exercises" line) ──
function ProposedTodayTime({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  return (
    <AppChrome top="hud" nav="home">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '18px 18px', minHeight: 0 }}>
        <div style={{ width: '100%', maxWidth: 256, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 20, padding: '15px 15px 16px', boxShadow: '0 4px 0 ' + SPROUT.line }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, marginBottom: 10 }}>Today</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 46, height: 46, borderRadius: 13, flexShrink: 0, background: '#EAF6E2', border: '1.5px solid ' + GREEN + '66', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.Leaf size={23} color={DEEP} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Unit 1 · Lesson 3</div>
              <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15.5, color: SPROUT.ink, lineHeight: 1.15, marginTop: 1 }}>Market Greetings</div>
              <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 10.5, color: SPROUT.mute, lineHeight: 1.25, marginTop: 2 }}>Greet a vendor and ask a price</div>
            </div>
          </div>
          {/* NEW: one calm, muted time-estimate line between the lesson and the CTA */}
          {isNew && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10, paddingLeft: 1 }}>
              <Icon.Clock size={12} color={DEEP} />
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 10, letterSpacing: '.03em', color: SPROUT.mute, whiteSpace: 'nowrap' }}>~4 min · 3 exercises</span>
            </div>
          )}
          <div style={{ marginTop: isNew ? 11 : 13, background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.06em', padding: '12px 0', borderRadius: 13, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>WATER THIS LESSON</div>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 9.5, color: SPROUT.mute }}>1 of 2 lessons watered today</span>
              <Icon.Droplet size={11} color="#3E92C9" />
            </div>
            <div style={{ height: 6, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}>
              <div style={{ width: '50%', height: '100%', borderRadius: 999, background: GREEN }} />
            </div>
          </div>
        </div>
        <div style={{ width: 0, height: 18, borderLeft: '3px dotted ' + SPROUT.cream2 }} />
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#EDE4D2', boxShadow: '0 4px 0 #D9CDB5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.Lock size={18} color="#B6A98E" />
        </div>
      </div>
    </AppChrome>
  );
}

