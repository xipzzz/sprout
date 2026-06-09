// ─────────────────────────────────────────────────────────────
// VARIATION A — Classic "winding path" (familiar gamified feel)
// Zig-zag trail of circular nodes with a mascot hovering by active
// ─────────────────────────────────────────────────────────────
function VariantA({ tweaks, onStartLesson, onOpenTale, onOpenGolden, nav, onStreakTap, onWaterTap, onGemsTap }) {
  const { calm } = tweaks;
  const [localTab, setLocalTab] = React.useState('home');
  const activeTab = nav ? nav.active : localTab;
  const onTab = nav ? nav.onChange : setLocalTab;
  const launch = (meta) => {
    // Story nodes open a Garden Tale; golden nodes open the mastery challenge.
    if (meta && meta.tale) { if (onOpenTale) onOpenTale(meta.tale); return; }
    if (meta && meta.golden) { if (onOpenGolden) onOpenGolden(meta); return; }
    if (onStartLesson) onStartLesson(meta);
  };

  // Section / Unit / Lesson preview (Tweaks). When unset, show the authored
  // course (UNITS) verbatim so the default view is unchanged.
  const focusSection = tweaks.section;
  const focusUnit = tweaks.unit;
  const focusLesson = tweaks.lessonN;
  const focused = focusSection != null || focusUnit != null;
  const sourceUnits = focused
    ? coursePath(focusSection || 1, focusUnit || 1, focusLesson)
    : UNITS;
  const focusUnitNo = focused ? Math.max(1, Math.min(focusUnit || 1, sourceUnits.length)) : null;

  // layout the nodes along a sinewave path
  const nodes = [];
  sourceUnits.forEach((u, ui) => {
    nodes.push({ kind: 'banner', unit: u, unitNo: ui + 1 });
    u.lessons.forEach((l, li) => nodes.push({ kind: 'node', lesson: l, unit: u, li }));
    if (u.golden) nodes.push({ kind: 'node', unit: u, golden: true, lesson: { kind: 'golden', status: u.golden.status, label: 'Golden Bloom', unitTitle: u.golden.unitTitle } });
  });

  // Scroll the focused unit's banner into view whenever the focus changes.
  const scrollRef = React.useRef(null);
  const activeNodeRef = React.useRef(null);  // the current/active node, for the "Today" jump
  const [guideUnit, setGuideUnit] = React.useState(null); // unit whose guidebook is open
  const [testOutUnit, setTestOutUnit] = React.useState(null); // unit offered for "grow ahead" test-out
  // First fully-locked unit = the calm "grow ahead?" candidate (skip-ahead for returning learners).
  const firstLockedUnitNo = (() => {
    for (let i = 0; i < sourceUnits.length; i++) {
      if (sourceUnits[i].lessons.every((l) => l.status === 'locked')) return i + 1;
    }
    return null;
  })();
  const [showJump, setShowJump] = React.useState(false);  // float "Today" when active node off-screen
  React.useEffect(() => {
    if (!focused) return;
    const cont = scrollRef.current;
    if (!cont) return;
    const banner = cont.querySelector('[data-focus-banner="1"]');
    if (banner) cont.scrollTop = Math.max(0, banner.offsetTop - 12);
  }, [focused, focusSection, focusUnit, focusLesson]);

  // On first load, open the map pre-scrolled to the active node (Duolingo pattern) so
  // the eye lands on "do this next" without a hunt. Skips when a test-out focus is set.
  const didCenter = React.useRef(false);
  React.useEffect(() => {
    if (focused || didCenter.current) return;
    const cont = scrollRef.current, node = activeNodeRef.current;
    if (!cont || !node) return;
    let off = 0, el = node;
    while (el && el !== cont) { off += el.offsetTop; el = el.offsetParent; }
    cont.scrollTop = Math.max(0, off - cont.clientHeight / 2 + 60);
    didCenter.current = true;
  }, [focused]);

  // Show the floating "Today" pill only while the active node is scrolled out of view.
  const onScroll = React.useCallback(() => {
    const cont = scrollRef.current, node = activeNodeRef.current;
    if (!cont || !node) { setShowJump(false); return; }
    const cr = cont.getBoundingClientRect(), nr = node.getBoundingClientRect();
    const visible = nr.bottom > cr.top + 56 && nr.top < cr.bottom - 40;
    setShowJump(!visible);
  }, []);
  const jumpToToday = () => {
    const cont = scrollRef.current, node = activeNodeRef.current;
    if (!cont || !node) return;
    // Resolve offset relative to the scroll container (offsetParent may be an inner wrapper).
    let off = 0, el = node;
    while (el && el !== cont) { off += el.offsetTop; el = el.offsetParent; }
    const target = Math.max(0, off - cont.clientHeight / 2 + 60);
    // scrollTo({behavior:'smooth'}) is ignored in some embedded contexts — animate manually.
    const start = cont.scrollTop, dist = target - start, dur = 380, t0 = performance.now();
    const ease = (p) => 1 - Math.pow(1 - p, 3);
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      cont.scrollTop = start + dist * ease(p);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const waveX = (i) => {
    // zigzag centered around 0, amplitude 100px
    const t = i * 0.7;
    return Math.sin(t) * 90;
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: SPROUT.bg, color: SPROUT.ink, fontFamily: '"Nunito", system-ui' }}>
      {/* Top bar */}
      <TopBar tweaks={tweaks} onStreakTap={onStreakTap} onWaterTap={onWaterTap} onGemsTap={onGemsTap}/>

      {/* Scrollable path */}
      <div ref={scrollRef} onScroll={onScroll} style={{ flex: 1, overflow: 'auto', paddingBottom: 100, position: 'relative' }}>
        <div style={{ position: 'relative', paddingTop: 16 }}>
          {(() => {
            let nodeIdx = 0;
            let stepNum = 0;
            let prevX = null;
            return nodes.map((n, i) => {
              if (n.kind === 'banner') {
                prevX = null; // reset connector across unit boundaries
                const isFocus = focusUnitNo != null && n.unitNo === focusUnitNo;
                const showChecklist = tweaks.firstTime && n.unitNo === 1 && !focused;
                // The active unit (has an in-progress lesson) docks the daily-goal ring.
                const isActiveUnit = n.unit.lessons.some((l) => l.status === 'active');
                return (
                  <div key={i} data-focus-banner={isFocus ? '1' : undefined} style={{ margin: '18px 0 14px', position: 'sticky', top: 0, zIndex: 6 }}>
                    <SectionBanner
                      unit={n.unitNo}
                      title={n.unit.title}
                      desc={n.unit.desc}
                      color={n.unit.color}
                      shadow={n.unit.shadow}
                      section={n.unit.section || 1}
                      totalLessons={n.unit.lessons.length}
                      doneLessons={n.unit.lessons.filter((l) => l.status === 'done').length}
                      onGuide={() => setGuideUnit(n.unit)}
                      dailyDone={isActiveUnit && !calm ? 2 : null}
                      dailyGoal={isActiveUnit && !calm ? 3 : null}
                    />
                    {showChecklist && <SproutingChecklist/>}
                    {/* Calm "grow ahead?" test-out — only on the first locked unit, opt-in,
                        for returning/confident learners. Never blocks the default flow. */}
                    {n.unitNo === firstLockedUnitNo && !calm && (
                      <button onClick={() => setTestOutUnit(n.unit)} style={{
                        margin: '10px auto 0', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                        fontFamily: 'inherit', background: SPROUT.paper, border: `1.5px dashed ${SPROUT.green}99`,
                        borderRadius: 999, padding: '8px 15px', color: SPROUT.greenDark, fontWeight: 900, fontSize: 13,
                        boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
                      }}>
                        <span style={{ fontSize: 15 }}>🌿</span>
                        Already know this? Grow ahead
                      </button>
                    )}
                  </div>
                );
              }
              const isGolden = n.lesson.kind === 'golden';
              const x = waveX(nodeIdx);
              nodeIdx++;
              if (!isGolden) stepNum++;
              const fromX = prevX; // previous node's offset (null right after a banner)
              prevX = x;
              return (
                <React.Fragment key={i}>
                  <div
                    ref={n.lesson.status === 'active' ? activeNodeRef : undefined}
                    style={{
                    position: 'relative',
                    display: 'flex', justifyContent: 'center', margin: '16px 0',
                    transform: `translateX(${x}px)`,
                  }}>
                    {/* dotted "stepping-stone" connector threading this node to the one above.
                        Absolutely placed (no layout shift); absent at unit boundaries. */}
                    {fromX !== null && (
                      <div aria-hidden="true" style={{
                        position: 'absolute', bottom: '100%', left: '50%',
                        transform: `translateX(calc(-50% + ${(fromX - x) / 2}px))`,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                        marginBottom: 4, pointerEvents: 'none',
                      }}>
                        {[0, 1, 2].map((d) => (
                          <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: n.lesson.status === 'done' ? SPROUT.green : SPROUT.line, opacity: n.lesson.status === 'done' ? (0.85 - d * 0.12) : (0.55 - d * 0.12) }}/>
                        ))}
                      </div>
                    )}
                    <LessonNode
                      lesson={n.lesson}
                      unitTitle={n.unit.title}
                      color={isGolden ? GOLD.face : n.unit.color}
                      shadow={isGolden ? GOLD.dark : n.unit.shadow}
                      step={isGolden ? null : stepNum}
                      onStart={launch}/>
                  </div>
                </React.Fragment>
              );
            });
          })()}
          <div style={{ height: 60 }}/>
        </div>
      </div>

      {/* Floating "Today" jump — appears only when the active node scrolls off-screen */}
      {showJump && (
        <button onClick={jumpToToday} aria-label="Jump to today's lesson" style={{
          position: 'absolute', left: '50%', bottom: 92, transform: 'translateX(-50%)', zIndex: 8,
          display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontFamily: 'inherit',
          background: SPROUT.green, color: '#fff', border: 'none', borderRadius: 999,
          padding: '10px 16px', boxShadow: `0 4px 0 ${SPROUT.greenShadow}, 0 6px 14px rgba(0,0,0,0.18)`,
          fontSize: 13.5, fontWeight: 900, animation: 'jumpUp 240ms cubic-bezier(.2,.9,.3,1.2) both',
        }}>
          <style>{`@keyframes jumpUp{from{opacity:0;transform:translate(-50%,12px)}to{opacity:1;transform:translate(-50%,0)}}@keyframes jumpChev{0%,100%{transform:translateY(0)}50%{transform:translateY(2px)}}`}</style>
          <Icon.Leaf size={15} color="#fff"/>
          Today
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'jumpChev 1.1s ease-in-out infinite' }}>
            <path d="M3.5 5.5L7 9l3.5-3.5"/>
          </svg>
        </button>
      )}

      {/* Bottom nav */}
      <BottomNav active={activeTab} onChange={onTab}/>

      {/* Unit guidebook — opened by the banner's book icon */}
      {guideUnit && <GuideSheet unit={guideUnit} onClose={() => setGuideUnit(null)} onStart={() => { setGuideUnit(null); launch(); }}/>}

      {/* "Grow ahead?" test-out sheet — calm, opt-in placement check (no pressure) */}
      {testOutUnit && (
        <div onClick={() => setTestOutUnit(null)} style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', background: 'rgba(20,30,40,0.45)' }}>
          <style>{`@keyframes goSlide{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: SPROUT.bg, borderRadius: '24px 24px 0 0', padding: '20px 18px 26px', animation: 'goSlide 300ms cubic-bezier(.2,.8,.2,1) both' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: SPROUT.line, margin: '0 auto 14px' }}/>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}><Pip size={70} mood="happy"/></div>
            <div style={{ fontSize: 19, fontWeight: 900, color: SPROUT.ink, textAlign: 'center' }}>Already know {testOutUnit.title}?</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: SPROUT.mute, textAlign: 'center', marginTop: 6, lineHeight: 1.4 }}>
              Take a quick check and, if it goes well, this unit blooms instantly — so you can grow ahead. No pressure either way. 🌿
            </div>
            <button onClick={() => { const u = testOutUnit; setTestOutUnit(null); launch({ title: `${u.title} check`, queue: lessonQueueFor({ id: 'testout', label: u.title }) }); }} style={{
              width: '100%', marginTop: 16, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: SPROUT.green, color: '#fff', fontSize: 16, fontWeight: 900, borderRadius: 14, padding: '14px 0',
              boxShadow: `0 3px 0 ${SPROUT.greenShadow}`,
            }}>Take the quick check</button>
            <button onClick={() => setTestOutUnit(null)} style={{
              width: '100%', marginTop: 8, border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 800, color: SPROUT.mute, padding: '6px 0',
            }}>Keep growing at my own pace</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Unit guidebook sheet — quick tips + key phrases for the unit (Duolingo's guidebook).
function GuideSheet({ unit, onClose, onStart }) {
  const phrases = (unit.lessons || []).filter((l) => l.label && l.kind === 'core').slice(0, 4).map((l) => l.label);
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', alignItems: 'flex-end', background: 'rgba(20,30,20,0.4)' }}>
      <style>{`@keyframes gdUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: SPROUT.bg, borderRadius: '22px 22px 0 0', padding: '16px 18px 26px', animation: 'gdUp 280ms cubic-bezier(.2,.8,.2,1) both', maxHeight: '78%', overflow: 'auto' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: SPROUT.line, margin: '0 auto 14px' }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: unit.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon.Book size={22} color="#fff"/>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 1, color: SPROUT.mute, textTransform: 'uppercase' }}>Guidebook · Unit {unit.unit}</div>
            <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.15 }}>{unit.title}</div>
          </div>
        </div>
        {unit.desc && <div style={{ fontSize: 13.5, fontWeight: 700, color: SPROUT.mute, marginBottom: 16, lineHeight: 1.4 }}>{unit.desc}</div>}
        <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>Key phrases you’ll grow</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
          {phrases.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 13, padding: '11px 13px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}` }}>
              <span style={{ fontSize: 16 }}>🌱</span>
              <SpeakableWord size={15}>{p}</SpeakableWord>
            </div>
          ))}
        </div>
        <PushButton size="lg" color={unit.color} shadow={unit.shadow} onClick={onStart} style={{ width: '100%' }}>Start practising</PushButton>
      </div>
    </div>
  );
}

function HudStat({ icon, value, color, onClick, ariaLabel, pulse = false, float = null, bump = false, tint = null, calm = false }) {
  const [down, setDown] = React.useState(false);
  // In Calm mode the chips read as quiet metadata (borderless icon+number) so the
  // path below can breathe; in standard mode they wear a hairline pill to telegraph
  // tappability. A low-water tint always wins (urgency stays legible either way).
  const quiet = calm && !tint;
  return (
    <button onClick={onClick} aria-label={ariaLabel}
      onMouseDown={() => setDown(true)} onMouseUp={() => setDown(false)} onMouseLeave={() => setDown(false)}
      style={{
        border: quiet ? '1px solid transparent' : `1px solid ${SPROUT.line}`,
        background: down ? 'rgba(0,0,0,0.05)' : (tint || (quiet ? 'transparent' : SPROUT.paper)), cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 11,
        transition: 'background .2s', position: 'relative',
        animation: pulse ? 'hudPulse 1s ease-in-out infinite' : 'none',
      }}>
      <style>{`
        @keyframes hudPulse { 0%,100%{ transform:scale(1); } 50%{ transform:scale(1.12); } }
        @keyframes hudBump { 0%{ transform:scale(1); } 35%{ transform:scale(1.32); } 100%{ transform:scale(1); } }
        @keyframes hudFloat { 0%{ transform:translate(-50%,0); opacity:0; } 18%{ opacity:1; } 100%{ transform:translate(-50%,-26px); opacity:0; } }
      `}</style>
      <span style={{ display: 'inline-flex', animation: bump ? 'hudBump .6s cubic-bezier(.3,1.5,.5,1)' : 'none' }}>{icon}</span>
      <span style={{ fontWeight: 900, fontSize: 16, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1, animation: bump ? 'hudBump .6s cubic-bezier(.3,1.5,.5,1)' : 'none' }}>{value}</span>
      {float && (
        <span style={{
          position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)',
          fontWeight: 900, fontSize: 13, color, whiteSpace: 'nowrap', pointerEvents: 'none',
          animation: 'hudFloat 1s ease-out forwards', textShadow: '0 1px 2px rgba(255,255,255,0.8)',
        }}>{float}</span>
      )}
    </button>
  );
}

// Lightweight earn bus — finishLesson (or anywhere) dispatches a 'sprout-earn'
// event; the mounted HUD animates the matching stat (+gems float, water fill +
// splash, streak flame pulse). Keeps the trigger decoupled from every variant.
function emitEarn(detail) {
  try { window.dispatchEvent(new CustomEvent('sprout-earn', { detail })); } catch (e) {}
}

function TopBar({ tweaks = {}, calm: calmProp, onStreakTap, onGemsTap, onWaterTap, onFlagTap }) {
  const calm = calmProp !== undefined ? calmProp : !!tweaks.calm;
  const plus = !!tweaks.plus;
  const water = plus ? 5 : (tweaks.lowWater ? 1 : 5);
  const wst = waterState(water, 5, plus);

  // earn animations — listen for 'sprout-earn' and animate the matching stat
  const [earn, setEarn] = React.useState({}); // { gems:'+5', streak:true, water:true }
  React.useEffect(() => {
    const onEarn = (e) => {
      const d = (e && e.detail) || {};
      const next = {};
      if (d.gems) next.gems = `+${d.gems}`;
      if (d.streak) next.streak = true;
      if (d.water) next.water = true;
      setEarn(next);
      const t = setTimeout(() => setEarn({}), 1050);
      return () => clearTimeout(t);
    };
    window.addEventListener('sprout-earn', onEarn);
    return () => window.removeEventListener('sprout-earn', onEarn);
  }, []);

  return (
    <div style={{ position: 'relative', borderBottom: `1px solid ${SPROUT.line}`, background: SPROUT.bg }}>
    <div style={{ padding: `${LAYOUT.safeTop}px ${LAYOUT.padX}px ${LAYOUT.hudPadY}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
      {/* flag — taps open the My Courses switcher (garden per language). A small
          chevron telegraphs it's a language switcher, not a static label. */}
      <button onClick={onFlagTap} aria-label="Switch language course" style={{
        flexShrink: 0, lineHeight: 1, border: `1px solid ${SPROUT.line}`, background: SPROUT.paper,
        cursor: onFlagTap ? 'pointer' : 'default', padding: '4px 7px 4px 8px', borderRadius: 10, fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        <span style={{ fontSize: 20 }}>🇺🇸</span>
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.5 }}><path d="M2.5 4 L5 6.5 L7.5 4" stroke={SPROUT.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      {/* Currencies cluster — grouped tightly on the right (rewards), set apart from
          the flag context control on the left, so the row reads "where am I" vs "earned". */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {/* STREAK — warm flame, amber. Tap → streak calendar */}
      <HudStat
        ariaLabel="Open streak calendar"
        onClick={onStreakTap}
        icon={calm
          ? <Icon.Leaf size={21} color={SPROUT.greenDark}/>
          : <Icon.Flame size={21} color="#F5833E"/>}
        value={calm ? '34' : '12'}
        color={calm ? SPROUT.greenDark : '#E0820F'}
        bump={!!earn.streak}
        calm={calm}
      />
      {/* GEMS — sapphire/periwinkle diamond (kept distinct from the aqua water gauge
          so spendable currency vs. energy separate at a glance). Tap → shop */}
      <HudStat
        ariaLabel="Open shop"
        onClick={onGemsTap}
        icon={<Icon.Gem size={19} color="#6C8AE4"/>}
        value="420"
        color="#3F5FC0"
        bump={!!earn.gems}
        float={calm ? null : earn.gems}
        calm={calm}
      />
      {/* WATER — bottle gauge showing LEVEL like a battery; fills from the
          bottom, aqua → amber at 2 → red + pulse at 1/0. Tap → water sheet.
          When low, the chip itself warms (soft amber→coral wash) so the bar
          carries gentle urgency at a glance — calm, never a nag. */}
      <HudStat
        ariaLabel={plus ? 'Water details' : `Water ${water} of 5 — tap for refill`}
        onClick={onWaterTap}
        icon={<WaterGauge level={water} max={5} size={18} plus={plus} pulse={wst.pulse} showNumber={false}/>}
        value={plus ? '∞' : water}
        color={wst.number}
        pulse={wst.pulse}
        tint={!plus && water <= 1 ? 'rgba(239,91,67,0.12)' : (!plus && water <= 2 ? 'rgba(245,194,61,0.16)' : null)}
        bump={!!earn.water}
        float={calm ? null : (earn.water ? '+1' : null)}
        calm={calm}
      />
      </div>
    </div>

    </div>
  );
}

// First-run "sprouting" checklist — a few first steps so a new learner knows
// exactly what to do. Sits under the Getting-started banner; first item is
// pre-checked (they've planted by arriving), the rest fill in as they go.
function SproutingChecklist() {
  const items = [
    { done: true,  label: 'Plant your first seed', sub: 'Open your garden' },
    { done: false, label: 'Finish a lesson',        sub: 'Grow your first bloom' },
    { done: false, label: 'Water 3 days in a row',  sub: 'Start a streak' },
  ];
  const doneCount = items.filter((i) => i.done).length;
  return (
    <div style={{
      margin: '10px 4px 0', padding: '13px 14px', background: SPROUT.paper,
      border: `1px solid ${SPROUT.line}`, borderRadius: 16, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 900, color: SPROUT.ink, textTransform: 'uppercase', letterSpacing: 0.6 }}>First steps 🌱</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: SPROUT.greenDark }}>{doneCount}/{items.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {items.map((it) => (
          <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: it.done ? 0.6 : 1 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              background: it.done ? SPROUT.green : 'transparent',
              border: `2px solid ${it.done ? SPROUT.green : SPROUT.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{it.done && <Icon.Check size={12} color="#fff"/>}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: SPROUT.ink, textDecoration: it.done ? 'line-through' : 'none' }}>{it.label}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: SPROUT.mute }}>{it.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LessonNode({ lesson, unitTitle, color, shadow, step, onStart }) {
  const size = lesson.kind === 'boss' ? 88 : lesson.kind === 'chest' ? 76 : 78;
  const isLocked = lesson.status === 'locked';
  const isActive = lesson.status === 'active';
  const isDone = lesson.status === 'done';
  const isGolden = lesson.kind === 'golden';

  const faceColor = isLocked ? '#D7CDB8' : color;
  const faceShadow = isLocked ? '#B5AA93' : shadow;

  const [down, setDown] = React.useState(false);
  const [showLockHint, setShowLockHint] = React.useState(false);
  const tappable = !isLocked && !!onStart;
  const handleTap = () => {
    if (isLocked) {
      // reveal a quiet "why" cue so grey reads as "coming up", not "broken"
      setShowLockHint((v) => !v);
      return;
    }
    if (!onStart) return;
    if (lesson.kind === 'golden') { onStart({ golden: true, title: lesson.unitTitle }); return; }
    if (lesson.kind === 'story') { onStart({ title: lesson.label, tale: lesson.tale || 'cafe' }); return; }
    onStart({ title: lesson.label, queue: lessonQueueFor(lesson) });
  };

  const glyph = () => {
    if (lesson.kind === 'golden') return <GoldenBloomMedal size={size - 26} lit={true}/>;
    if (lesson.kind === 'chest') return <span style={{ fontSize: 34 }}>🎁</span>;
    if (lesson.kind === 'boss') return <Icon.Crown size={34} color="#fff"/>;
    if (lesson.kind === 'story') return <Icon.Book size={34} color="#fff"/>;
    if (isLocked) {
      // locked: muted taupe (not pale cream) so the type glyph stays legible on cream
      if (lesson.skill && lesson.skill !== 'mix' && lesson.skill !== 'boss') return <SkillIcon skill={lesson.skill} size={32} color="#9A8E74"/>;
      return <Icon.Star size={30} color="#9A8E74" filled={true}/>;
    }
    // completed → checkmark on a muted face, so DONE reads distinctly from AVAILABLE at a glance
    if (isDone) return <Icon.Check size={34} color="#fff"/>;
    // active/available → big centered exercise-type icon (speak/listen/etc); star for general
    if (lesson.skill && lesson.skill !== 'mix' && lesson.skill !== 'boss') return <SkillIcon skill={lesson.skill} size={34} color="#fff"/>;
    return <Icon.Star size={34} color="#fff" filled={true}/>;
  };

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Active node bubble — orientation + progress pips + reward telegraph.
          Tappable to start (the node still launches on tap too — no extra-tap regression). */}
      {isActive && (() => {
        const prog = Math.max(0, Math.min(1, lesson.progress || 0));
        const pipTotal = 5;
        const pipsDone = Math.round(prog * pipTotal);
        return (
          <div onClick={handleTap} role="button" style={{
            position: 'absolute', top: -84, background: SPROUT.paper, borderRadius: 15,
            padding: '9px 13px', border: `2px solid ${SPROUT.line}`, cursor: 'pointer',
            color: SPROUT.ink, boxShadow: '0 4px 0 #E8DFCE', whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: 9, zIndex: 3,
            animation: 'startBob 2.4s ease-in-out infinite',
          }}>
            <style>{`@keyframes startBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}@media (prefers-reduced-motion: reduce){[style*="startBob"]{animation:none!important}}`}</style>
            <PipMini size={30}/>
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.12, gap: 3 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: 0.6, color: SPROUT.greenDark, textTransform: 'uppercase' }}>Start</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9.5, fontWeight: 900, color: '#C28A1C', background: '#FCEFC7', borderRadius: 6, padding: '1px 5px' }}>+10 🌱</span>
              </span>
              <span style={{ fontSize: 13, fontWeight: 900 }}>{lesson.label}</span>
              {/* per-skill progress pips — otherwise invisible on the path */}
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 1 }}>
                {Array.from({ length: pipTotal }).map((_, i) => (
                  <span key={i} style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: i < pipsDone ? SPROUT.green : SPROUT.cream2,
                    border: `1px solid ${i < pipsDone ? SPROUT.green : SPROUT.line}`,
                  }}/>
                ))}
                <span style={{ fontSize: 9, fontWeight: 800, color: SPROUT.mute, marginLeft: 3 }}>{pipsDone}/{pipTotal}</span>
              </span>
            </span>
            <span style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: `8px solid #fff` }}/>
          </div>
        );
      })()}

      {/* Golden mastery bubble */}
      {isGolden && (
        <div style={{
          position: 'absolute', top: -50, background: GOLD.ink, borderRadius: 12,
          padding: '6px 11px', fontWeight: 900, fontSize: 12, color: '#fff',
          letterSpacing: 0.4, whiteSpace: 'nowrap', boxShadow: `0 4px 0 ${GOLD.deep}`,
          display: 'flex', alignItems: 'center', gap: 5, zIndex: 3,
        }}>
          <Sparkle size={12} color={GOLD.face}/> GROW GOLDEN BLOOM
          <span style={{ position: 'absolute', bottom: -7, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: `7px solid ${GOLD.ink}` }}/>
        </div>
      )}

      {/* Locked "why" cue — quiet, tap-to-reveal so grey reads as "coming up", not "broken" */}
      {isLocked && showLockHint && (
        <div style={{
          position: 'absolute', top: -44, background: '#6B6256', borderRadius: 11,
          padding: '7px 11px', fontWeight: 800, fontSize: 11.5, color: '#fff',
          letterSpacing: 0.1, whiteSpace: 'nowrap', boxShadow: '0 4px 0 rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', gap: 6, zIndex: 4,
        }}>
          <Icon.Lock size={12} color="#EFE9DA"/>
          Finish the steps above to unlock
          <span style={{ position: 'absolute', bottom: -7, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '7px solid #6B6256' }}/>
        </div>
      )}

      {/* the circular button */}
      <div
        onClick={handleTap}
        onMouseDown={() => tappable && setDown(true)}
        onMouseUp={() => setDown(false)}
        onMouseLeave={() => setDown(false)}
        role={tappable ? 'button' : undefined}
        style={{
          width: size, height: size, borderRadius: '50%',
          background: faceShadow, position: 'relative',
          cursor: tappable ? 'pointer' : (isLocked ? 'pointer' : 'default'),
          transform: down ? 'translateY(3px)' : (isActive ? 'translateY(-2px)' : 'none'),
          transition: 'transform 80ms ease',
          // ACTIVE node lifts off the path with a soft drop-shadow so it's the
          // obvious tap target even before the callout is read. DONE nodes recede.
          filter: isDone ? 'saturate(0.62) brightness(0.9)' : (isActive ? 'drop-shadow(0 6px 7px rgba(74,124,46,0.32))' : 'none'),
        }}
      >
        {/* exercise icon now lives CENTERED in the node (see glyph), Duolingo-style */}
        <div style={{
          position: 'absolute', inset: 0, bottom: 6, background: faceColor,
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: isActive ? `inset 0 0 0 4px #fff, inset 0 0 0 6px ${color}` : 'none',
        }}>
          {glyph()}
        </div>
        {/* progress ring for active — SEGMENTED (one arc per sub-lesson) so "2/5"
            reads spatially on the ring, echoing the START bubble's pips. */}
        {isActive && (() => {
          const segTotal = 5;
          const segDone = Math.round(Math.max(0, Math.min(1, lesson.progress || 0)) * segTotal);
          const r = 46, C = 2 * Math.PI * r;
          const gap = 7;                       // degrees of gap between segments
          const segDeg = 360 / segTotal - gap; // arc length per segment in degrees
          const segLen = C * (segDeg / 360);
          return (
            <svg style={{ position: 'absolute', inset: -8, pointerEvents: 'none' }} viewBox="0 0 100 100">
              {Array.from({ length: segTotal }).map((_, i) => {
                const startDeg = -90 + i * (360 / segTotal) + gap / 2;
                return (
                  <circle key={i} cx="50" cy="50" r={r} fill="none" strokeWidth="6" strokeLinecap="round"
                    stroke={i < segDone ? SPROUT.sun : SPROUT.cream2}
                    strokeDasharray={`${segLen} ${C - segLen}`}
                    strokeDashoffset={`${-C * (startDeg + 90) / 360}`}
                    transform="rotate(-90 50 50)"/>
                );
              })}
            </svg>
          );
        })()}
        {/* Reward is shown once, in the START callout above — keeping the node area
            clean (no duplicate +10 badge in the busiest spot on the path). */}
        {/* gold ring for the mastery node — a quiet STATIC identity ring (no pulse), so
            it reads as a reward to reach, never competing with the active node for "tap here". */}
        {isGolden && (
          <div style={{
            position: 'absolute', inset: -7, borderRadius: '50%',
            border: `3px solid ${GOLD.face}`, opacity: 0.55, pointerEvents: 'none',
          }}/>
        )}
        {/* gentle pulsing halo on the ACTIVE node — draws the eye to the one tap that
            matters on a long path. Soft (calm-brand): slow, low-opacity, no bounce.
            Respects reduced-motion. */}
        {isActive && (
          <div style={{
            position: 'absolute', inset: -7, borderRadius: '50%',
            border: `3px solid ${color}`, pointerEvents: 'none',
            animation: 'nodeHalo 1.8s ease-in-out infinite',
          }}>
            <style>{`@keyframes nodeHalo{0%,100%{opacity:.0;transform:scale(1)}50%{opacity:.5;transform:scale(1.09)}}@media (prefers-reduced-motion: reduce){[style*="nodeHalo"]{animation:none!important;opacity:.4!important}}`}</style>
          </div>
        )}
      </div>

      {/* Mastery petals — gentle 1–3 rating on completed core lessons; a soft
          re-practice incentive (a faint petal invites another pass to fill it).
          Rendered as bare petals (no pill/border) so they read as a quiet cue,
          not a floating chip — keeps the space between nodes calm. Full petals
          stay vivid; an unfilled petal fades back so a perfect 3/3 nearly vanishes. */}
      {isDone && lesson.mastery != null && (
        <div aria-label={`Mastery ${lesson.mastery} of 3`} style={{
          display: 'flex', gap: 2, marginTop: 4, opacity: lesson.mastery === 3 ? 0.55 : 0.9,
        }}>
          {[0, 1, 2].map((i) => (
            <Icon.Flower key={i} size={11} color={i < lesson.mastery ? SPROUT.sun : '#E2D9C6'}/>
          ))}
        </div>
      )}
    </div>
  );
}

function BottomNav({ active, onChange }) {
  const items = [
    { id: 'home', icon: Icon.Home, label: 'Learn' },
    { id: 'book', icon: Icon.Book, label: 'Words' },
    { id: 'quests', icon: Icon.Target, label: 'Quests', dot: true },
    { id: 'trophy', icon: Icon.Trophy, label: 'League', dot: true },
    { id: 'me', icon: Icon.User, label: 'Me' },
  ];
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '10px 4px 28px', background: SPROUT.paper, borderTop: `1px solid ${SPROUT.line}`,
    }}>
      <style>{`@keyframes navBump{0%{transform:translateY(0)}40%{transform:translateY(-3px)}100%{transform:translateY(0)}}@media (prefers-reduced-motion: reduce){[style*="navBump"]{animation:none!important}}`}</style>
      {items.map(it => {
        const Icn = it.icon;
        const on = it.id === active;
        // A claimable-state dot pulls users back gently (quests reward ready / league
        // results posted) — only when that tab isn't the one you're already on.
        const showDot = it.dot && !on;
        return (
          <button key={it.id} onClick={() => onChange(it.id)} aria-current={on ? 'page' : undefined} style={{
            border: 'none', background: 'transparent', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '2px 6px', borderRadius: 12,
            color: on ? SPROUT.greenDark : SPROUT.mute,
          }}>
            {/* active-tab container — a second, non-color cue (a11y: readable in bright
                sun / for color-blind users), not green tint alone */}
            <span style={{
              position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 50, height: 30, borderRadius: 999,
              background: on ? '#E3F5DB' : 'transparent', transition: 'background .18s',
              animation: on ? 'navBump .32s ease' : 'none',
            }}>
              <Icn size={22} color={on ? SPROUT.greenDark : SPROUT.mute}/>
              {showDot && (
                <span style={{
                  position: 'absolute', top: 1, right: 9, width: 8, height: 8, borderRadius: '50%',
                  background: SPROUT.coral, border: `1.5px solid ${SPROUT.paper}`,
                }}/>
              )}
            </span>
            <span style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.3 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { VariantA, TopBar, HudStat, BottomNav, LessonNode, emitEarn });
