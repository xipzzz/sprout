// exploration-views.jsx — perf split from exploration.jsx to keep each in-browser
// Babel file well under the ~500KB transform ceiling (the Exploration deck grew past
// it, hanging the preview at about:blank). This holds a contiguous block of top-level
// PROPOSED_* component functions + their shared mini-chrome helpers. Every symbol is a
// global function declaration resolved at RENDER time, so load order before
// exploration.jsx (which builds PROPOSED_VIEWS) is fine — identical mechanism to
// exploration-parts.jsx. No component content changed; this is a pure file move.

// streak-screen header chrome — a back chevron + centered "Streak" title
function MiniStreakHeader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderBottom: '1px solid ' + SPROUT.line, flexShrink: 0 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SPROUT.ink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5 8 12l7 7" /></svg>
      <span style={{ flex: 1, textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink, marginLeft: -14 }}>Streak</span>
    </div>
  );
}

// shared streak-grid geometry
const SK = { COLS: 7, ROWS: 5, C: 24, G: 5, PX: 8, PY: 4, START: 7, TODAY: 19, MILE: 20 };
function skGridW() { return SK.PX * 2 + SK.COLS * SK.C + (SK.COLS - 1) * SK.G; }

// ── Proposed · Streak garden calendar (modal sheet: hero + perfect-week + month grid + records) ──
// A modal sheet — NO bottom tab bar. Sheet header with a close X is the only chrome
// besides the iOS status bar (from the frame). CURRENT = plain dotted month; NEW =
// hero count + perfect-week strip + bloom month grid + quiet record lines + freeze chip.
function SheetCloseHeader({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderBottom: '1px solid ' + SPROUT.line, flexShrink: 0 }}>
      <span style={{ flex: 1, textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink, marginLeft: 14 }}>{title}</span>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
    </div>
  );
}

// ── Proposed · Streak — a week you can see (two-up header + this-week strip + month leaf-dots) ──
function ProposedStreakWeekYouCanSee({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const week = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const wkDone = 4; // Su–Thu done, today = Thu
  const Stat = ({ label, value }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.12em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{label}</span>
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: DEEP }}>{value}</span>
    </div>
  );
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, padding: '13px 16px', minHeight: 0 }}>
        {/* (1) two-up header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Stat label="Current streak" value="13 days" />
          <div style={{ width: 1, alignSelf: 'stretch', background: SPROUT.line }} />
          <Stat label="Next milestone" value="14" />
        </div>

        {/* (2) this-week strip */}
        <div style={{ background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '10px 11px 11px' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, marginBottom: 8 }}>This week</div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {week.map((d, i) => {
              const done = i < wkDone, today = i === wkDone;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, fontWeight: 700, color: today ? DEEP : SPROUT.mute }}>{d}</span>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? GREEN : (today ? '#EAF6E2' : SPROUT.bg), border: today ? '2px solid ' + DEEP : done ? 'none' : '1.5px solid ' + SPROUT.line, boxShadow: today ? '0 2px 4px -1px ' + DEEP + '66' : 'none' }}>
                    {done ? <Icon.Leaf size={12} color="#fff" /> : today ? <Icon.Leaf size={12} color={DEEP} /> : null}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* (3) compact month grid with leaf dots */}
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: SPROUT.ink }}>June 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
            const practiced = i >= SK.START && i <= SK.TODAY;
            const future = i > SK.TODAY;
            return (
              <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', opacity: future ? 0.5 : 1 }}>
                <span style={{ position: 'absolute', top: 1, left: 3, fontFamily: 'Nunito, system-ui', fontSize: 7.5, fontWeight: 800, color: SPROUT.mute }}>{(i % 30) + 1}</span>
                {practiced && <span style={{ width: 9, height: 9, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Leaf size={6} color="#fff" /></span>}
              </div>
            );
          })}
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

function ProposedStreakGardenModal({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e', CLAY = '#ff8a80';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();

  if (!isNew) {
    // CURRENT: a plain dotted month + bare count, no week strip or records.
    return (
      <React.Fragment>
        <SheetCloseHeader title="Streak" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 13, padding: '16px 16px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 19, color: SPROUT.ink, textAlign: 'center' }}>13 day streak</div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>June 2026</div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
            {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const watered = i >= SK.START && i <= SK.TODAY;
              const future = i > SK.TODAY;
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                  {watered ? <span style={{ width: 13, height: 13, borderRadius: '50%', background: GREEN }} /> : <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: SPROUT.mute }}>{(i % 30) + 1}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </React.Fragment>
    );
  }

  // NEW: hero count + perfect-week strip + bloom month grid + record lines + freeze chip.
  const week = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const wkDone = 4; // M–F watered, today = Fri
  return (
    <React.Fragment>
      <SheetCloseHeader title="Streak" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10, padding: '11px 16px', minHeight: 0 }}>
        {/* (1) hero current-streak count */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ width: 30, height: 30, borderRadius: '50%', background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Leaf size={17} color={DEEP} /></span>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 22, color: DEEP }}>13<span style={{ fontSize: 13, color: SPROUT.ink, marginLeft: 5 }}>day streak</span></span>
        </div>

        {/* (2) perfect-week strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
          {week.map((d, i) => {
            const done = i < wkDone, today = i === wkDone;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, fontWeight: 700, color: today ? DEEP : SPROUT.mute }}>{d}</span>
                <span style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? GREEN : 'transparent', border: today ? '2px solid ' + DEEP : done ? 'none' : '1.5px solid ' + SPROUT.line, boxShadow: today ? '0 0 0 2.5px ' + GREEN + '33' : 'none' }}>
                  {done ? <Icon.Leaf size={11} color="#fff" /> : today ? <span style={{ width: 6, height: 6, borderRadius: '50%', background: DEEP }} /> : null}
                </span>
              </div>
            );
          })}
        </div>

        {/* (3) month grid with bloom cells */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5 8 12l7 7" /></svg>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: SPROUT.ink }}>June 2026</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="m9 5 7 7-7 7" /></svg>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
            const watered = i >= SK.START && i <= SK.TODAY;
            const isToday = i === SK.TODAY;
            const isBreak = i === SK.START - 2; // one quiet break before the run
            const future = i > SK.TODAY;
            if (watered) {
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isToday ? '0 0 0 2px ' + DEEP : 'none' }}>
                    <Icon.Leaf size={12} color={DEEP} />
                  </span>
                </div>
              );
            }
            return (
              <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                {isBreak ? <span style={{ width: 6, height: 6, borderRadius: '50%', background: CLAY }} /> : <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: SPROUT.mute }}>{(i % 30) + 1}</span>}
              </div>
            );
          })}
        </div>

        {/* (4) record lines + (5) freeze chip */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Longest streak</span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: SPROUT.ink }}>21 days</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Days grown this month</span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: SPROUT.ink }}>22</span>
          </div>
        </div>
        <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 5, background: '#E5F2F8', border: '1px solid #BFE0EC', borderRadius: 999, padding: '4px 10px' }}>
          <Icon.Droplet size={11} color="#2E8FB0" />
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 10, color: '#1F6E8C' }}>1 freeze used</span>
        </div>
      </div>
    </React.Fragment>
  );
}


// CURRENT (plain) streak calendar — isolated watered dots, no summary/records
function CurrentStreakDots() {
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, padding: '14px 16px', minHeight: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: SPROUT.ink }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
            const watered = i >= SK.START && i <= SK.TODAY;
            const future = i > SK.TODAY;
            return (
              <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', opacity: future ? 0.5 : 1 }}>
                <span style={{ position: 'absolute', top: 1, left: 3, fontFamily: 'Nunito, system-ui', fontSize: 7.5, fontWeight: 800, color: SPROUT.mute }}>{((i) % 31) + 1}</span>
                {watered && <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#9CD389' }} />}
              </div>
            );
          })}
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Glanceable weekly streak row (lead week row + headline + freeze pill, month grid below) ──
function ProposedWeeklyStreakRow({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const week = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const wkDone = 4; // Mon–Fri watered, today = Fri
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 16px', minHeight: 0 }}>
        {/* streak headline + freeze-save pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: SPROUT.green, boxShadow: '0 3px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Leaf size={16} color="#fff" /></span>
          <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>12<span style={{ fontSize: 12, fontWeight: 800, color: SPROUT.mute, marginLeft: 5 }}>day streak</span></span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#E5F2F8', border: '1.5px solid #BFE0EC', borderRadius: 999, padding: '4px 10px' }}>
            <Icon.Droplet size={12} color="#2E8FB0" />
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: '#1F6E8C' }}>2 saves</span>
          </span>
        </div>

        {/* LEAD: glanceable 7-day week row */}
        <div style={{ background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 16, padding: '12px 12px 13px' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, marginBottom: 9 }}>This week</div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {week.map((d, i) => {
              const done = i < wkDone, today = i === wkDone;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: today ? DEEP : SPROUT.mute }}>{d}</span>
                  <span style={{ width: 25, height: 25, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? GREEN : '#fff', border: today ? '2px solid ' + DEEP : done ? 'none' : '1.5px solid ' + SPROUT.line }}>
                    {done ? <Icon.Leaf size={12} color="#fff" /> : today ? <span style={{ width: 6, height: 6, borderRadius: '50%', background: DEEP }} /> : null}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECONDARY: full month grid collapsed below */}
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, 18px)`, gap: 4, alignSelf: 'center' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 7, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, 18px)`, gap: 4, alignSelf: 'center' }}>
          {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
            const watered = i >= SK.START && i <= SK.TODAY;
            const isToday = i === SK.TODAY;
            const future = i > SK.TODAY;
            return (
              <div key={i} style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: watered ? '#CDEBBE' : 'transparent', border: isToday ? '1.5px solid ' + DEEP : (watered ? 'none' : '1px solid ' + SPROUT.line), opacity: future ? 0.45 : 1 }}>
                <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 7, fontWeight: 800, color: watered ? DEEP : SPROUT.mute }}>{(i % 31) + 1}</span>
              </div>
            );
          })}
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Streak milestone rail (unchanged month grid + 7/14/30 rail above + 3-stat row below) ──
function ProposedMilestoneRailAbove({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const CURRENT_STREAK = 13; // matches the unchanged grid run (START..TODAY)
  const miles = [7, 14, 30];
  const segFill = (lo, hi) => Math.max(0, Math.min(1, (CURRENT_STREAK - lo) / (hi - lo)));
  // next milestone after 13 = 14, 1 day to go
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 16px', minHeight: 0 }}>
        {/* NEXT MILESTONE label + 7/14/30 rail (added ABOVE the grid) */}
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

        {/* month grid — byte-for-byte the SAME as CURRENT */}
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: SPROUT.ink }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
            const watered = i >= SK.START && i <= SK.TODAY;
            const future = i > SK.TODAY;
            return (
              <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', opacity: future ? 0.5 : 1 }}>
                <span style={{ position: 'absolute', top: 1, left: 3, fontFamily: 'Nunito, system-ui', fontSize: 7.5, fontWeight: 800, color: SPROUT.mute }}>{((i) % 31) + 1}</span>
                {watered && <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#9CD389' }} />}
              </div>
            );
          })}
        </div>

        {/* quiet 3-stat summary row */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[['Current', '13'], ['Longest', '21'], ['Freezes used', '2']].map(([label, value], i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 11, padding: '7px 4px' }}>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: DEEP }}>{value}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
      <MiniBottomNav active="me" />
    </React.Fragment>
  );
}

// ── Proposed · Unbroken streak ribbon (vine ribbon + next-milestone strip + Days-grown/Freezes tiles) ──
function ProposedUnbrokenRibbon({ mode = 'proposed' }) {
  if (mode === 'current') return <CurrentStreakDots />;
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const gridW = skGridW();
  const CURRENT_STREAK = 13;
  const miles = [7, 14, 30];
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
  // next-milestone strip fill toward 14 (current 13)
  const nextMile = miles.find((m) => m > CURRENT_STREAK) || miles[miles.length - 1];
  const prevMile = [...miles].reverse().find((m) => m <= CURRENT_STREAK) || 0;
  const stripFill = Math.max(0, Math.min(1, (CURRENT_STREAK - prevMile) / (nextMile - prevMile)));
  return (
    <React.Fragment>
      <MiniStreakHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '12px 16px', minHeight: 0 }}>
        {/* (3) two quiet stat tiles */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Tile icon={<Icon.Leaf size={14} color={DEEP} />} label="Days grown" value="13" />
          <Tile icon={<Icon.Droplet size={14} color="#2E8FB0" />} label="Freezes" value="2" />
        </div>

        {/* (2) next-milestone strip */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.12em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Next bloom</span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: DEEP }}>{nextMile} days</span>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}>
              <div style={{ width: (stripFill * 100) + '%', height: '100%', borderRadius: 999, background: GREEN }} />
            </div>
            {/* leaf node markers at milestone steps */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
              {miles.map((m, k) => (
                <div key={m} style={{ position: 'absolute', left: ((m / miles[miles.length - 1]) * 100) + '%', transform: 'translateX(-50%)', width: 13, height: 13, borderRadius: '50%', background: CURRENT_STREAK >= m ? DEEP : '#fff', border: '1.5px solid ' + (CURRENT_STREAK >= m ? DEEP : SPROUT.cream2), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {CURRENT_STREAK >= m && <Icon.Leaf size={7} color="#fff" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>May 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, alignSelf: 'center', padding: '0 ' + SK.PX + 'px' }}>
          {letters.map((l, i) => <div key={'h' + i} style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: SPROUT.mute }}>{l}</div>)}
        </div>

        {/* (1) continuous growth-vine ribbon: soft glow + deep core, today at the tip */}
        <div style={{ position: 'relative', alignSelf: 'center', width: gridW }}>
          {segs.map((s, k) => (
            <React.Fragment key={k}>
              {/* soft glow */}
              <div style={{ position: 'absolute', left: cellX(s.lo) - 2, top: cellY(s.r), width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C + 4, height: SK.C + 2, borderRadius: 999, background: GREEN, opacity: 0.28, zIndex: 1 }} />
              {/* deep core */}
              <div style={{ position: 'absolute', left: cellX(s.lo) + 3, top: cellY(s.r) + 5, width: (s.hi - s.lo) * (SK.C + SK.G) + SK.C - 6, height: SK.C - 10, borderRadius: 999, background: DEEP, opacity: 0.85, zIndex: 2 }} />
            </React.Fragment>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SK.COLS}, ${SK.C}px)`, gap: SK.G, padding: '0 ' + SK.PX + 'px', position: 'relative', zIndex: 3 }}>
            {Array.from({ length: SK.COLS * SK.ROWS }).map((_, i) => {
              const inRun = i >= SK.START && i <= SK.TODAY;
              const isToday = i === SK.TODAY;
              const future = i > SK.TODAY;
              if (isToday) {
                return (
                  <div key={i} style={{ width: SK.C, height: SK.C, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: SK.C, height: SK.C, borderRadius: '50%', background: '#fff', border: '2.5px solid ' + DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px -1px ' + DEEP + '99' }}>
                      <Icon.Leaf size={12} color={DEEP} />
                    </span>
                  </div>
                );
              }
              return (
                <div key={i} style={{ width: SK.C, height: SK.C, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: future ? 0.5 : 1 }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 8.5, fontWeight: 800, color: inRun ? '#fff' : SPROUT.mute }}>{(i % 31) + 1}</span>
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

// ── Proposed · Sectioned Shop: STREAK SAVERS / BOOSTS / GEMS rows + 2-up gem grid + POPULAR ──
function ProposedShopSaversBoostsGems({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GEM = '#6C8AE4', WATER = '#2E8FB0';

  if (!isNew) {
    // CURRENT: one undifferentiated grid of same-size item cards.
    const Tile = ({ glyph, name, price, money }) => (
      <div style={{ background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '11px 6px 9px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
        <span style={{ fontSize: 22 }}>{glyph}</span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 10.5, color: SPROUT.ink, textAlign: 'center', lineHeight: 1.15 }}>{name}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>{!money && <Icon.Gem size={11} color={GEM} />}<span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: SPROUT.ink }}>{price}</span></span>
      </div>
    );
    return (
      <AppChrome top="hud" nav="me">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 14px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <Tile glyph="🛡️" name="Streak Freeze" price="200" />
            <Tile glyph="💧" name="Water refill" price="30" />
            <Tile glyph="✨" name="Double seeds" price="90" />
            <Tile glyph="⏱️" name="Timer boost" price="60" />
            <Tile glyph="🪙" name="1,200 gems" price="$4.99" money />
            <Tile glyph="🧰" name="3,000 gems" price="$9.99" money />
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: STREAK SAVERS / BOOSTS rows + GEMS 2-up grid, one POPULAR tag.
  const Row = ({ icon, tint, name, sub, price, cur, popular }) => (
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
  const GemPack = ({ amount, price, tint }) => (
    <div style={{ background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 0' }}><Icon.Gem size={20} color="#fff" /></div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '7px 0 9px' }}>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>{amount}</span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: SPROUT.greenDark, background: '#EAF6E2', borderRadius: 999, padding: '3px 11px' }}>{price}</span>
      </div>
    </div>
  );

  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ padding: '12px 14px 5px', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '3px 14px 10px', minHeight: 0 }}>
          <Section label="Streak savers">
            <Row icon={<Icon.Shield size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Streak Freeze" sub="Protect your garden if you miss a day" price="200" cur="gems" popular />
          </Section>
          <Section label="Boosts">
            <Row icon={<Icon.Sparkle size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Double seeds" sub="2× seeds for 30 min" price="90" cur="gems" />
            <Row icon={<Icon.Droplet size={17} color={WATER} />} tint="#E5F2F8" name="Water refill" sub="Top up your daily water" price="30" cur="water" />
          </Section>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, paddingLeft: 3 }}>Gems</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <GemPack amount="1,200" price="$4.99" tint="#8FA9E8" />
              <GemPack amount="3,000" price="$9.99" tint="#6C8AE4" />
            </div>
          </div>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Sectioned Shop: BOOSTS / REFILLS + one POPULAR ribbon (flat scroll → two sections) ──
function ProposedShopBoostsRefills({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GEM = '#6C8AE4', WATER = '#2E8FB0';

  if (!isNew) {
    // CURRENT: one flat scroll — every item the same weight, no scan path.
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
            <Flat glyph="🌼" name="Golden Bloom boost" price="120" cur="gems" />
            <Flat glyph="🛡️" name="Streak shield" price="200" cur="gems" />
            <Flat glyph="💧" name="Water refill" price="30" cur="water" />
            <Flat glyph="❤️" name="Heart refill" price="90" cur="gems" />
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: BOOSTS / REFILLS sections, one consistent row, single POPULAR ribbon.
  const Row = ({ icon, tint, name, price, cur, popular }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 3px' }}>
      <span style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ fontFamily: 'Nunito, system-ui', fontSize: 12.5, fontWeight: 900, color: SPROUT.ink }}>{name}</span>
        {popular && (
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, color: SPROUT.greenDark, background: '#EAF6E2', border: '1px solid ' + SPROUT.green + '66', borderRadius: 5, padding: '2px 5px' }}>Popular</span>
        )}
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
        <div style={{ padding: '12px 14px 6px', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, padding: '4px 14px 10px', minHeight: 0 }}>
          <Section label="Boosts">
            <Row icon={<Icon.Sparkle size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Golden Bloom boost" price="120" cur="gems" popular />
            <Row icon={<Icon.Shield size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Streak shield" price="200" cur="gems" />
          </Section>
          <Section label="Refills">
            <Row icon={<Icon.Droplet size={17} color={WATER} />} tint="#E5F2F8" name="Water refill" price="30" cur="water" />
            <Row icon={<Icon.Leaf size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Heart refill" price="90" cur="gems" />
          </Section>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Shop: grouped sections (flat scroll → POWER-UPS cards + GEMS 3-up money packs) ──
function ProposedShopGroupedSections({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GEM = '#6C8AE4';

  if (!isNew) {
    // CURRENT: one flat scroll mixing gem-priced power-ups and money-priced gem packs.
    const Flat = ({ glyph, name, price, money }) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 12, padding: '9px 11px', minHeight: 34, boxSizing: 'border-box' }}>
        <span style={{ fontSize: 19, flexShrink: 0, width: 24, textAlign: 'center' }}>{glyph}</span>
        <span style={{ flex: 1, minWidth: 0, fontFamily: 'Nunito, system-ui', fontSize: 12.5, fontWeight: 800, color: SPROUT.ink }}>{name}</span>
        <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
          {!money && <Icon.Gem size={12} color={GEM} />}
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: money ? SPROUT.greenDark : SPROUT.ink }}>{price}</span>
        </span>
      </div>
    );
    return (
      <AppChrome top="hud" nav="me">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, padding: '14px 14px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Flat glyph="🛡️" name="Streak Shield" price="200" />
            <Flat glyph="🪙" name="1,200 gems" price="$4.99" money />
            <Flat glyph="💧" name="Water Boost" price="90" />
            <Flat glyph="🧰" name="3,000 gems" price="$9.99" money />
            <Flat glyph="🌱" name="Garden Rescue" price="350" />
            <Flat glyph="📦" name="6,500 gems" price="$19.99" money />
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: two labeled sections — POWER-UPS (gem cards) + GEMS (3-up money packs).
  const PUCard = ({ icon, name, sub, price, popular }) => (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 11, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '10px 12px' }}>
      <span style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
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
  const Pack = ({ amount, price }) => (
    <div style={{ background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '11px 6px 9px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 32, height: 32, borderRadius: '50%', background: '#EEF1FB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Gem size={17} color={GEM} /></span>
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: SPROUT.ink }}>{amount}</span>
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: SPROUT.greenDark, background: '#EAF6E2', borderRadius: 999, padding: '3px 9px' }}>{price}</span>
    </div>
  );
  const SecLabel = ({ children }) => (
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, paddingLeft: 3 }}>{children}</div>
  );

  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ padding: '12px 14px 5px', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '3px 14px 10px', minHeight: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <SecLabel>Power-ups</SecLabel>
            <PUCard icon={<Icon.Shield size={17} color={SPROUT.greenDark} />} name="Streak Shield" sub="Keep your garden streak safe for a day" price="200" popular />
            <PUCard icon={<Icon.Droplet size={17} color="#2E8FB0" />} name="Water Boost" sub="Double water for one hour" price="90" />
            <PUCard icon={<Icon.Plant size={17} color={SPROUT.greenDark} />} name="Garden Rescue" sub="Revive a wilted streak" price="350" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <SecLabel>Gems</SecLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <Pack amount="1,200" price="$4.99" />
              <Pack amount="3,000" price="$9.99" />
              <Pack amount="6,500" price="$19.99" />
            </div>
          </div>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Owned items row in the Shop (adds a glanceable Owned strip atop the buyable list) ──
function ProposedShopOwnedRow({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GEM = '#6C8AE4';

  // buyable sections — identical in BOTH modes; NEW only adds the Owned strip above.
  const Row = ({ icon, tint, name, sub, price }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 3px' }}>
      <span style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 12.5, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.15 }}>{name}</div>
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
  const buyable = (
    <React.Fragment>
      <Section label="Power-ups">
        <Row icon={<Icon.Sparkle size={16} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Double Seeds" sub="2× seeds for 30 min" price="90" />
        <Row icon={<Icon.Clock size={16} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Timer Boost" sub="Extra time on timed lessons" price="60" />
      </Section>
      <Section label="Seeds">
        <Row icon={<Icon.Plant size={16} color={SPROUT.greenDark} />} tint="#FBF1DA" name="Seed Pack" sub="A jar of 500 seeds" price="50" />
      </Section>
      <Section label="Décor">
        <Row icon={<Icon.Leaf size={16} color={SPROUT.greenDark} />} tint="#FBF1DA" name="Rare bloom" sub="A special garden flower" price="350" />
      </Section>
    </React.Fragment>
  );

  // the Owned strip — only on NEW
  const owned = [
    { icon: <Icon.Shield size={17} color={SPROUT.greenDark} />, name: 'Streak Shield', qty: 2 },
    { icon: <Icon.Droplet size={17} color="#2E8FB0" />, name: 'Watering Can', qty: 3 },
    { icon: <Icon.Sparkle size={17} color={SPROUT.greenDark} />, name: 'Seed Boost', qty: 1 },
  ];

  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ padding: '12px 14px 5px', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10, padding: '3px 14px 10px', minHeight: 0 }}>
          {isNew && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, paddingLeft: 3 }}>Owned</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {owned.map((o, i) => (
                  <div key={i} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '9px 5px 7px' }}>
                    <span style={{ position: 'absolute', top: -5, right: -4, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 999, background: SPROUT.green, color: '#fff', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(42,35,32,.25)' }}>×{o.qty}</span>
                    <span style={{ width: 30, height: 30, borderRadius: '50%', background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{o.icon}</span>
                    <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 9, color: SPROUT.ink, textAlign: 'center', lineHeight: 1.1 }}>{o.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {buyable}
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Sectioned Shop rows with EQUIPPED/ACTIVE state (flat list → sections + owned state) ──
function ProposedShopOwnedState({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GEM = '#6C8AE4', WATER = '#2E8FB0';

  if (!isNew) {
    // CURRENT: a loose, mostly-undifferentiated list — boosts, refills & packs blur together.
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
            <Flat glyph="✨" name="Double Seeds" price="90" cur="gems" />
            <Flat glyph="🛡️" name="Streak Freeze" price="120" cur="gems" />
            <Flat glyph="💧" name="Water Refill" price="30" cur="water" />
            <Flat glyph="⏱️" name="Timer Boost" price="60" cur="gems" />
            <Flat glyph="🌱" name="Seed Pack" price="50" cur="gems" />
            <Flat glyph="🪣" name="Water Pack" price="40" cur="water" />
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: titled sections, one consistent row; owned items show EQUIPPED/ACTIVE.
  const Row = ({ icon, tint, name, sub, price, cur, state }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 3px' }}>
      <span style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 12.5, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.15 }}>{name}</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 10, fontWeight: 600, color: SPROUT.mute, lineHeight: 1.25, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>
      </div>
      {state ? (
        <span style={{ flexShrink: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, color: SPROUT.mute, background: SPROUT.bg, borderRadius: 6, padding: '4px 8px' }}>{state}</span>
      ) : (
        <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, background: '#EAF6E2', borderRadius: 999, padding: '5px 10px' }}>
          {cur === 'water' ? <Icon.Droplet size={12} color={WATER} /> : <Icon.Gem size={12} color={SPROUT.greenDark} />}
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11.5, color: SPROUT.greenDark }}>{price}</span>
        </span>
      )}
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10, padding: '3px 14px 10px', minHeight: 0 }}>
          <Section label="Power-ups">
            <Row icon={<Icon.Sparkle size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Double Seeds" sub="2× seeds for 30 min" state="Active" />
            <Row icon={<Icon.Clock size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Timer Boost" sub="Extra time on timed lessons" price="60" cur="gems" />
          </Section>
          <Section label="Refills">
            <Row icon={<Icon.Shield size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Streak Freeze" sub="Protect your garden if you miss a day" state="Equipped" />
            <Row icon={<Icon.Droplet size={17} color={WATER} />} tint="#E5F2F8" name="Water Refill" sub="Top up your daily water" price="30" cur="water" />
          </Section>
          <Section label="Seed & water packs">
            <Row icon={<Icon.Plant size={17} color={SPROUT.greenDark} />} tint="#FBF1DA" name="Seed Pack" sub="A jar of 500 seeds" price="50" cur="gems" />
            <Row icon={<Icon.Droplet size={17} color={WATER} />} tint="#E5F2F8" name="Water Pack" sub="A bucket of 20 water" price="40" cur="water" />
          </Section>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · My Shed owned-items row (adds an inventory strip above the unchanged buy sections) ──
function ProposedShopMyShed({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GEM = '#6C8AE4', WATER = '#2E8FB0';

  // buy sections — identical in BOTH modes; NEW only adds My Shed above.
  const Row = ({ icon, tint, name, sub, price, cur }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 3px' }}>
      <span style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 12.5, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.15 }}>{name}</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 10, fontWeight: 600, color: SPROUT.mute, lineHeight: 1.25, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>
      </div>
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, background: cur === 'water' ? '#EAF6E2' : '#EAF0FB', borderRadius: 999, padding: '5px 10px' }}>
        {cur === 'water' ? <Icon.Droplet size={12} color={WATER} /> : <Icon.Gem size={12} color={GEM} />}
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11.5, color: cur === 'water' ? SPROUT.greenDark : '#3B5BA8' }}>{price}</span>
      </span>
    </div>
  );
  const Section = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, paddingLeft: 3, marginBottom: 2 }}>{label}</div>
      {React.Children.map(children, (c, i) => <div style={{ borderTop: i ? '1px solid ' + SPROUT.bg : 'none' }}>{c}</div>)}
    </div>
  );
  const buy = (
    <React.Fragment>
      <Section label="Power-ups">
        <Row icon={<Icon.Sparkle size={16} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Double Seeds" sub="2× seeds for 30 min" price="90" cur="gems" />
        <Row icon={<Icon.Shield size={16} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Streak Shield" sub="Protect your garden if you miss a day" price="200" cur="gems" />
      </Section>
      <Section label="Gem bundles">
        <Row icon={<Icon.Gem size={16} color={GEM} />} tint="#EAF0FB" name="1,200 gems" sub="A bag of gems" price="$4.99" cur="gems" />
      </Section>
    </React.Fragment>
  );

  // the My Shed owned strip — only on NEW
  const shed = [
    { icon: <Icon.Droplet size={17} color={WATER} />, name: 'Watering Can', qty: 3 },
    { icon: <Icon.Shield size={17} color={SPROUT.greenDark} />, name: 'Streak Shield', qty: 2 },
    { icon: <Icon.Sparkle size={17} color={SPROUT.greenDark} />, name: 'Sun Boost', qty: 1 },
  ];

  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ padding: '11px 14px 5px', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '3px 14px 10px', minHeight: 0 }}>
          {isNew && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, paddingLeft: 3 }}>My shed</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {shed.map((o, i) => (
                  <div key={i} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '9px 5px 7px' }}>
                    <span style={{ position: 'absolute', top: -5, right: -4, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 999, background: SPROUT.mute, color: '#fff', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×{o.qty}</span>
                    <span style={{ width: 30, height: 30, borderRadius: '50%', background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{o.icon}</span>
                    <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 9, color: SPROUT.ink, textAlign: 'center', lineHeight: 1.1 }}>{o.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {buy}
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Grouped scannable Shop (flat → hero offer + Power-Ups/Seeds&Gems/Super Items + currency chips) ──
function ProposedShopGroupedHero({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GEM = '#6C8AE4', WATER = '#2E8FB0';

  if (!isNew) {
    // CURRENT: one flat undifferentiated grid of tiles.
    const Tile = ({ glyph, name, price, cur }) => (
      <div style={{ background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '11px 6px 9px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
        <span style={{ fontSize: 22 }}>{glyph}</span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 10.5, color: SPROUT.ink, textAlign: 'center', lineHeight: 1.15 }}>{name}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>{cur === 'water' ? <Icon.Droplet size={11} color={WATER} /> : <Icon.Gem size={11} color={GEM} />}<span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: SPROUT.ink }}>{price}</span></span>
      </div>
    );
    return (
      <AppChrome top="hud" nav="me">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 14px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <Tile glyph="🌼" name="Golden Bloom" price="120" cur="gems" />
            <Tile glyph="🛡️" name="Streak Freeze" price="200" cur="gems" />
            <Tile glyph="✨" name="Double Seeds" price="90" cur="gems" />
            <Tile glyph="💧" name="Water Refill" price="30" cur="water" />
            <Tile glyph="🪙" name="1,200 gems" price="$4.99" />
            <Tile glyph="🌱" name="Seed Pack" price="50" cur="gems" />
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: hero offer + grouped sections + currency-coloured chips + EQUIPPED state.
  const Chip = ({ price, cur }) => {
    const blue = cur === 'gems' || cur === 'cash';
    return (
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, background: blue ? '#EAF0FB' : '#EAF6E2', borderRadius: 999, padding: '5px 10px' }}>
        {blue ? <Icon.Gem size={12} color={GEM} /> : cur === 'water' ? <Icon.Droplet size={12} color={WATER} /> : <Icon.Leaf size={12} color={SPROUT.greenDark} />}
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11.5, color: blue ? '#3B5BA8' : SPROUT.greenDark }}>{price}</span>
      </span>
    );
  };
  const Row = ({ icon, tint, name, sub, price, cur, equipped }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '3px 3px' }}>
      <span style={{ width: 34, height: 34, borderRadius: 11, flexShrink: 0, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 12.5, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.15 }}>{name}</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 10, fontWeight: 600, color: SPROUT.mute, lineHeight: 1.25, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>
      </div>
      {equipped
        ? <span style={{ flexShrink: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, color: SPROUT.mute, background: SPROUT.bg, borderRadius: 6, padding: '4px 8px' }}>Equipped</span>
        : <Chip price={price} cur={cur} />}
    </div>
  );
  const Section = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, paddingLeft: 3, marginBottom: 2 }}>{label}</div>
      {React.Children.map(children, (c, i) => <div style={{ borderTop: i ? '1px solid ' + SPROUT.bg : 'none' }}>{c}</div>)}
    </div>
  );

  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ padding: '11px 14px 5px', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5, padding: '2px 14px 8px', minHeight: 0 }}>
          {/* (1) featured hero offer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#FBF1DA', border: '1.5px solid #E8D6A8', borderRadius: 15, padding: '7px 12px' }}>
            <span style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Sparkle size={18} color="#C2871B" /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 13.5, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.1 }}>Golden Bloom boost</div>
              <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 10, fontWeight: 600, color: '#A87C1B', marginTop: 1 }}>Double your seeds for the next 7 days</div>
            </div>
            <Chip price="120" cur="gems" />
          </div>
          {/* (2) grouped sections */}
          <Section label="Power-Ups">
            <Row icon={<Icon.Shield size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Streak Freeze" sub="Protect your garden if you miss a day" equipped />
            <Row icon={<Icon.Clock size={17} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Timer Boost" sub="Extra time on timed lessons" price="60" cur="gems" />
          </Section>
          <Section label="Seeds & Gems">
            <Row icon={<Icon.Droplet size={17} color={WATER} />} tint="#E5F2F8" name="Water Refill" sub="Top up your daily water" price="30" cur="water" />
            <Row icon={<Icon.Gem size={17} color={GEM} />} tint="#EAF0FB" name="1,200 gems" sub="A bag of gems" price="$4.99" cur="cash" />
          </Section>
          <Section label="Super Items">
            <Row icon={<Icon.Plant size={17} color={SPROUT.greenDark} />} tint="#FBF1DA" name="Rare Bloom" sub="A special garden flower" price="350" cur="gems" />
          </Section>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Sectioned Shop: Super Items featured + 3-up Gems grid + Promo (flat list → sections) ──
function ProposedShopSuperGems({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GEM = '#6C8AE4';

  if (!isNew) {
    // CURRENT: a long flat scroll of near-identical purchase rows — packs + the
    // streak-protect item all blur together, the useful item buried mid-list.
    const FlatRow = ({ name, sub, price }) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 12, padding: '9px 11px' }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: '#EEF1FB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Gem size={15} color={GEM} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 12.5, fontWeight: 800, color: SPROUT.ink, lineHeight: 1.1 }}>{name}</div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 9.5, fontWeight: 600, color: SPROUT.mute }}>{sub}</div>
        </div>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11.5, color: SPROUT.greenDark }}>{price}</span>
      </div>
    );
    return (
      <AppChrome top="hud" nav="me">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, padding: '14px 14px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <FlatRow name="400 gems" sub="Starter pouch" price="$1.99" />
            <FlatRow name="Bloom Saver" sub="Streak protection" price="$2.99" />
            <FlatRow name="1,200 gems" sub="Garden bag" price="$4.99" />
            <FlatRow name="Water pack" sub="+20 water" price="$1.99" />
            <FlatRow name="3,000 gems" sub="Bloom chest" price="$9.99" />
            <FlatRow name="6,500 gems" sub="Greenhouse haul" price="$19.99" />
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: Super Items featured card → Gems 3-up grid → Promo row.
  const Pack = ({ amount, price }) => (
    <div style={{ background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '11px 6px 9px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#EEF1FB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Gem size={18} color={GEM} /></span>
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: SPROUT.ink }}>{amount}</span>
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: SPROUT.greenDark, background: '#EAF6E2', borderRadius: 999, padding: '3px 9px' }}>{price}</span>
    </div>
  );
  const SecLabel = ({ children }) => (
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, paddingLeft: 3 }}>{children}</div>
  );

  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ padding: '12px 14px 6px', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11, padding: '3px 14px 10px', minHeight: 0 }}>
          {/* (1) Super Items — one featured full-width card, leads */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <SecLabel>Super Items</SecLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#EAF6E2', border: '1.5px solid ' + SPROUT.green + '66', borderRadius: 15, padding: '11px 12px' }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Shield size={20} color={SPROUT.greenDark} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 13.5, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.1 }}>Bloom Saver</div>
                <div style={{ fontFamily: 'Nunito, system-ui', fontSize: 10, fontWeight: 600, color: '#5a7a4e', marginTop: 1 }}>Auto-saves your garden streak if you miss a day</div>
              </div>
              <span style={{ flexShrink: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, color: SPROUT.greenDark, background: '#fff', border: '1px solid ' + SPROUT.green + '66', borderRadius: 6, padding: '4px 7px' }}>Equipped</span>
            </div>
          </div>

          {/* (2) Gems — 3-up grid of packs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <SecLabel>Gems</SecLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <Pack amount="400" price="$1.99" />
              <Pack amount="1,200" price="$4.99" />
              <Pack amount="3,000" price="$9.99" />
            </div>
          </div>

          {/* (3) Promo code row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '9px 12px' }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: '#FBF1DA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Star size={14} color="#C2871B" /></span>
            <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12, color: SPROUT.ink }}>Redeem a code</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, color: SPROUT.greenDark }}>Redeem</span>
          </div>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Calm match-pair feedback (flat tiles → armed / matched / mismatch states + combo) ──
function ProposedMatchFeedback({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e', CLAY = '#ff8a80';
  // left & right columns; states only differ in NEW
  const left = [
    { label: 'Seed', state: 'matched' },
    { label: 'Water', state: 'armed' },
    { label: 'Bloom', state: 'mismatch' },
    { label: 'Leaf', state: 'idle' },
  ];
  const right = [
    { label: 'Sprout', state: 'mismatch' },
    { label: 'Seedling', state: 'matched' },
    { label: 'Drop', state: 'idle' },
    { label: 'Petal', state: 'idle' },
  ];

  const tileStyle = (state) => {
    const base = { display: 'flex', alignItems: 'center', justifyContent: 'center', height: 38, borderRadius: 12, fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13, transition: 'all .15s', boxSizing: 'border-box' };
    if (!isNew) return { ...base, background: '#fff', border: '1.5px solid ' + SPROUT.line, color: SPROUT.ink };
    if (state === 'armed') return { ...base, background: '#e9f5e3', border: '2px solid ' + GREEN, color: DEEP, transform: 'translateY(-2px)', boxShadow: '0 4px 10px -3px ' + GREEN + '88' };
    if (state === 'matched') return { ...base, background: '#F1F3EE', border: '1.5px solid ' + SPROUT.line, color: '#AEB6A6', opacity: 0.7 };
    if (state === 'mismatch') return { ...base, background: '#FFF1EF', border: '2px solid ' + CLAY, color: '#C7584F' };
    return { ...base, background: '#fff', border: '1.5px solid ' + SPROUT.line, color: SPROUT.ink };
  };

  return (
    <AppChrome top="exercise">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: '12px 16px 16px' }}>
        {/* exercise header + (NEW) calm combo chip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink }}>Tap the matching pairs</span>
          {isNew && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#EAF6E2', border: '1px solid ' + GREEN + '66', borderRadius: 999, padding: '3px 9px', flexShrink: 0 }}>
              <Icon.Leaf size={11} color={DEEP} />
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10, color: SPROUT.greenDark }}>Combo ×3</span>
            </span>
          )}
        </div>

        {/* two columns of tiles */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {left.map((t, i) => <div key={i} style={tileStyle(t.state)}>{t.label}</div>)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {right.map((t, i) => <div key={i} style={tileStyle(t.state)}>{t.label}</div>)}
          </div>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Claimable quest progress (plain rows → inline progress bar + claim-in-place chest) ──
function ProposedQuestsClaimable({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const DEEP = '#3fa52e', GREEN = '#6fbf5e';
  const quests = [
    { icon: <Icon.Target size={17} color={DEEP} />, title: 'Earn 30 seeds', cur: 30, total: 30 },
    { icon: <Icon.Leaf size={17} color={DEEP} />, title: 'Water 2 lessons', cur: 1, total: 2 },
    { icon: <Icon.Sparkle size={17} color={DEEP} />, title: 'Score 90% in a lesson', cur: 0, total: 1 },
  ];

  if (!isNew) {
    // CURRENT: plain rows — icon, title, chevron; no progress, no inline reward.
    return (
      <AppChrome top="hud" nav="quests">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11, padding: '14px 16px', minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Daily Quests</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, textTransform: 'uppercase', color: SPROUT.mute }}><Icon.Clock size={11} color={SPROUT.mute} />6h</span>
          </div>
          {quests.map((q, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '13px 13px' }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{q.icon}</span>
              <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13, color: SPROUT.ink }}>{q.title}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </div>
          ))}
        </div>
      </AppChrome>
    );
  }

  // NEW: each row gets an inline progress bar + a chest that becomes a Claim pill at 100%.
  return (
    <AppChrome top="hud" nav="quests">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 16px', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Daily Quests</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, textTransform: 'uppercase', color: SPROUT.mute }}><Icon.Clock size={11} color={SPROUT.mute} />resets in 6h</span>
        </div>
        {quests.map((q, i) => {
          const done = q.cur >= q.total;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1.5px solid ' + (done ? GREEN + '88' : SPROUT.line), borderRadius: 13, padding: '10px 12px' }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{q.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink, lineHeight: 1.1, marginBottom: 6 }}>{q.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ flex: 1, height: 6, borderRadius: 999, background: SPROUT.cream2, overflow: 'hidden' }}>
                    <div style={{ width: (q.cur / q.total * 100) + '%', height: '100%', background: GREEN, borderRadius: 999 }} />
                  </div>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 9.5, color: done ? DEEP : SPROUT.mute, flexShrink: 0 }}>{q.cur}/{q.total}</span>
                </div>
              </div>
              {done ? (
                <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, background: GREEN, borderRadius: 999, padding: '7px 12px', boxShadow: '0 3px 0 ' + SPROUT.greenShadow }}>
                  <Icon.Leaf size={11} color="#fff" />
                  <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, letterSpacing: '.04em', color: '#fff' }}>Claim</span>
                </span>
              ) : (
                <span style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 9, background: '#FBF1DA', border: '1.5px solid #E8D6A8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.Trophy size={15} color="#C79A2E" />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </AppChrome>
  );
}

// ── Proposed · Quest rewards you can see (task+bar only → reward pouch per row + "Resets at sunrise") ──
function ProposedQuestsRewards({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const DEEP = '#3fa52e', GREEN = '#6fbf5e';
  const quests = [
    { glyph: '🌱', title: 'Water 2 lessons', cur: 1, total: 2, reward: 15, cur_icon: <Icon.Leaf size={11} color={DEEP} /> },
    { glyph: '🎯', title: 'Score 90% in a lesson', cur: 0, total: 1, reward: 20, cur_icon: <Icon.Leaf size={11} color={DEEP} /> },
    { glyph: '✨', title: 'Earn 30 seeds', cur: 20, total: 30, reward: 5, gem: true },
  ];
  const Row = ({ q }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '11px 13px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ fontSize: 17 }}>{q.glyph}</span>
        <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13, color: SPROUT.ink }}>{q.title}</span>
        {isNew && (
          <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3, background: q.gem ? '#EAF0FB' : '#EAF6E2', borderRadius: 999, padding: '5px 10px' }}>
            {q.gem ? <Icon.Gem size={11} color="#6C8AE4" /> : <Icon.Leaf size={11} color={DEEP} />}
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: q.gem ? '#3B5BA8' : DEEP }}>+{q.reward}</span>
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{ flex: 1, height: 7, borderRadius: 999, background: SPROUT.cream2, overflow: 'hidden' }}>
          <div style={{ width: (q.cur / q.total * 100) + '%', height: '100%', background: GREEN, borderRadius: 999 }} />
        </div>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 10, color: SPROUT.mute, flexShrink: 0 }}>{q.cur}/{q.total}</span>
      </div>
    </div>
  );
  return (
    <AppChrome top="hud" nav="quests">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11, padding: '14px 16px', minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.ink, fontWeight: 700 }}>Daily Quests</span>
          {isNew && <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Resets at sunrise</span>}
        </div>
        {quests.map((q, i) => <Row key={i} q={q} />)}
      </div>
    </AppChrome>
  );
}

// ── Proposed · Scannable daily quests (flat list → aligned icon/title/inline-progress/reward rows) ──
function ProposedQuestsScannable({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const DEEP = '#3fa52e', GREEN = '#6fbf5e';
  const quests = [
    { icon: <Icon.Target size={17} color={DEEP} />, title: 'Earn 30 seeds', sub: 'Practice to grow your garden', cur: 20, total: 30, reward: 10 },
    { icon: <Icon.Leaf size={17} color={DEEP} />, title: 'Water 2 lessons', sub: 'Keep your plants happy', cur: 1, total: 2, reward: 15 },
    { icon: <Icon.Sparkle size={17} color={DEEP} />, title: 'Score 90% in a lesson', sub: 'Aim for a clean bloom', cur: 0, total: 1, reward: 20 },
  ];

  if (!isNew) {
    // CURRENT: a plain quest list — misaligned, progress + reward not lined up.
    return (
      <AppChrome top="hud" nav="quests">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11, padding: '14px 16px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Daily Quests</div>
          {quests.map((q, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '11px 13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ fontSize: 18 }}>{['🎯', '🌿', '✨'][i]}</span>
                <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13, color: SPROUT.ink }}>{q.title}</span>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11.5, color: SPROUT.mute }}>+{q.reward}</span>
              </div>
              <div style={{ height: 7, borderRadius: 999, background: SPROUT.cream2, overflow: 'hidden' }}>
                <div style={{ width: (q.cur / q.total * 100) + '%', height: '100%', background: GREEN }} />
              </div>
            </div>
          ))}
        </div>
      </AppChrome>
    );
  }

  // NEW: one calm aligned row per quest + DAILY header w/ countdown + chest card.
  return (
    <AppChrome top="hud" nav="quests">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 16px 5px', flexShrink: 0 }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Daily</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.mute }}>
            <Icon.Clock size={11} color={SPROUT.mute} />resets in 6h
          </span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 6, padding: '2px 16px 10px', minHeight: 0 }}>
          {quests.map((q, i) => {
            const done = q.cur >= q.total;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '7px 11px' }}>
                <span style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{q.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink, lineHeight: 1.1 }}>{q.title}</div>
                  <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 9.5, color: SPROUT.mute, lineHeight: 1.2, marginTop: 1, marginBottom: 5 }}>{q.sub}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ flex: 1, height: 6, borderRadius: 999, background: SPROUT.cream2, overflow: 'hidden' }}>
                      <div style={{ width: (q.cur / q.total * 100) + '%', height: '100%', background: GREEN, borderRadius: 999 }} />
                    </div>
                    <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 9.5, color: SPROUT.mute, flexShrink: 0 }}>{q.cur}/{q.total}</span>
                  </div>
                </div>
                <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3, background: '#EAF6E2', borderRadius: 999, padding: '5px 9px' }}>
                  <Icon.Leaf size={11} color={DEEP} />
                  <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: DEEP }}>+{q.reward}</span>
                </span>
              </div>
            );
          })}
          {/* end-of-day reward chest card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FBF1DA', border: '1.5px solid #E8D6A8', borderRadius: 13, padding: '7px 11px' }}>
            <span style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Trophy size={17} color="#C79A2E" /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink, lineHeight: 1.1 }}>Daily reward chest</div>
              <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 9.5, color: '#A87C1B', marginTop: 1 }}>Finish all 3 quests to open</div>
            </div>
            <span style={{ flexShrink: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, color: '#A87C1B', background: '#fff', border: '1px solid #E8D6A8', borderRadius: 6, padding: '4px 7px' }}>1/3</span>
          </div>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Weekly quest beyond the daily reset (daily-only list → calm weekly-quest banner pinned above) ──
function ProposedWeeklyQuest({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const DEEP = '#3fa52e', GREEN = '#6fbf5e';

  // The daily quests — IDENTICAL in both modes, listed below the (new) weekly card.
  const dailies = [
    { icon: <Icon.Target size={17} color={DEEP} />, title: 'Earn 30 seeds', cur: 20, total: 30, reward: 10 },
    { icon: <Icon.Leaf size={17} color={DEEP} />, title: 'Water 2 lessons', cur: 1, total: 2, reward: 15 },
    { icon: <Icon.Sparkle size={17} color={DEEP} />, title: 'Score 90% in a lesson', cur: 0, total: 1, reward: 20 },
  ];

  const DailyRow = ({ q }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '6px 11px' }}>
      <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{q.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink, lineHeight: 1.1, marginBottom: 4 }}>{q.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ flex: 1, height: 6, borderRadius: 999, background: SPROUT.cream2, overflow: 'hidden' }}>
            <div style={{ width: (q.cur / q.total * 100) + '%', height: '100%', background: GREEN, borderRadius: 999 }} />
          </div>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 9.5, color: SPROUT.mute, flexShrink: 0 }}>{q.cur}/{q.total}</span>
        </div>
      </div>
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3, background: '#EAF6E2', borderRadius: 999, padding: '5px 9px' }}>
        <Icon.Leaf size={11} color={DEEP} />
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: DEEP }}>+{q.reward}</span>
      </span>
    </div>
  );

  // The 7-day week meter (NEW only) — 4 of 7 filled, woven seed-basket reward at the end.
  const WEEK_DONE = 4, WEEK_TOTAL = 7;
  const WeeklyCard = () => (
    <div style={{ background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '10px 12px', boxShadow: '0 3px 0 ' + SPROUT.cream2 }}>
      {/* quiet title + week countdown */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Plant size={13} color={DEEP} /></span>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, color: SPROUT.ink }}>Weekly Quest</span>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 9.5, color: SPROUT.mute }}>{WEEK_DONE}/{WEEK_TOTAL}</span>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.mute }}>
          <Icon.Clock size={11} color={SPROUT.mute} />3 days left
        </span>
      </div>
      {/* 7-segment week bar (4 of 7 grown) + woven seed-basket reward at the finish */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
          {Array.from({ length: WEEK_TOTAL }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 8, borderRadius: 999, background: i < WEEK_DONE ? GREEN : SPROUT.cream2 }} />
          ))}
        </div>
        <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 9, background: '#FBF1DA', border: '1.5px solid #E8D6A8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.Basket size={16} color="#A87C1B" />
        </span>
      </div>
    </div>
  );

  return (
    <AppChrome top="hud" nav="quests">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* QUESTS section header — shared, byte-identical in both modes */}
        <div style={{ padding: '11px 16px 7px', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Quests</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, padding: '0 16px 8px', minHeight: 0 }}>
          {/* NEW: the only added element — a calm weekly quest pinned above the daily list */}
          {isNew && <WeeklyCard />}
          {/* DAILY sub-header + nightly reset countdown — unchanged */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Daily</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.mute }}>
              <Icon.Clock size={11} color={SPROUT.mute} />resets in 6h
            </span>
          </div>
          {dailies.map((q, i) => <DailyRow key={i} q={q} />)}
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Achievements with progress to next bloom (flat badge shelf → vertical progress list) ──
function ProposedAchievementProgress({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';

  // identity header + stats grid — IDENTICAL in both modes.
  const header = (
    <React.Fragment>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <span style={{ width: 50, height: 50, borderRadius: '50%', background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Pip size={36} mood="cheer" /></span>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Xip</span>
            <span style={{ fontSize: 12 }}>🇺🇸</span>
          </div>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11.5, color: SPROUT.mute }}>@xipgrows</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[['Streak', '13'], ['Seeds', '1,240'], ['League', 'Silver'], ['Words', '84']].map(([l, v], i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 11, padding: '8px 3px' }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: DEEP }}>{v}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6, letterSpacing: '.05em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{l}</span>
          </div>
        ))}
      </div>
    </React.Fragment>
  );

  if (!isNew) {
    // CURRENT: flat horizontal bloom shelf — earned/locked badges, no progress.
    const shelf = [
      { earned: true }, { earned: true }, { earned: false }, { earned: false }, { earned: false },
    ];
    return (
      <AppChrome top="hud" nav="me">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 16px', minHeight: 0, overflow: 'hidden' }}>
          {header}
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink }}>Achievements</span>
          <div style={{ display: 'flex', gap: 9 }}>
            {shelf.map((b, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', aspectRatio: '1', background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: '50%', opacity: b.earned ? 1 : 0.5 }}>
                <span style={{ width: '64%', height: '64%', borderRadius: '50%', background: b.earned ? 'linear-gradient(160deg,#8FD178,' + DEEP + ')' : '#EAE2D1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.Leaf size={16} color={b.earned ? '#fff' : '#C9BFAE'} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: vertical scannable list — tier badge + name + how-to + progress bar/count.
  const rows = [
    { tier: 'Tier 1', name: 'Early Sprout', sub: 'Water a lesson 3 days in a row', cur: 2, total: 3 },
    { tier: 'Tier 2', name: 'Wildflower', sub: 'Earn 100 seeds', cur: 40, total: 100 },
    { tier: 'Tier 1', name: 'Green Thumb', sub: 'Reach a 7-day streak', cur: 4, total: 7 },
  ];
  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, padding: '9px 16px', minHeight: 0, overflow: 'hidden' }}>
        {header}
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: SPROUT.ink }}>Achievements</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {rows.map((rw, i) => {
            const pct = rw.cur / rw.total;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 12, padding: '6px 11px' }}>
                <span style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(160deg,#8FD178,' + DEEP + ')', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.Leaf size={15} color="#fff" />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.greenDark, fontWeight: 700 }}>{rw.tier}</span>
                    <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>{rw.name}</span>
                  </div>
                  <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 9.5, color: SPROUT.mute, marginTop: 0, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rw.sub}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#EFE7D6', overflow: 'hidden' }}>
                      <div style={{ width: (pct * 100) + '%', height: '100%', borderRadius: 999, background: GREEN }} />
                    </div>
                    <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 9.5, color: SPROUT.mute, flexShrink: 0 }}>{rw.cur}/{rw.total}</span>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700, padding: '2px 0 0' }}>View 9 more</div>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Tale Complete — what you discovered (silent shelf-return → named-words finish moment) ──
function ProposedTaleComplete({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';

  if (!isNew) {
    // CURRENT: finishing a tale drops back to the Tales shelf with only a tiny +seeds toast.
    const tales = [
      { name: 'The Morning Market', done: true },
      { name: 'A Walk in the Park', done: false },
      { name: 'At the Café', done: false },
    ];
    return (
      <AppChrome top="hud" nav="home">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11, padding: '14px 16px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 17, color: SPROUT.ink }}>Garden Tales</div>
          {/* tiny +seeds toast over the shelf */}
          <div style={{ alignSelf: 'center', display: 'flex', alignItems: 'center', gap: 5, background: '#EAF6E2', border: '1.5px solid ' + GREEN + '66', borderRadius: 999, padding: '4px 11px' }}>
            <Icon.Leaf size={12} color={DEEP} />
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11, color: DEEP }}>+12 seeds</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tales.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '11px 12px' }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: t.done ? '#EAF6E2' : '#EFE9DD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Book size={16} color={t.done ? DEEP : '#B6A98E'} /></span>
                <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13, color: SPROUT.ink }}>{t.name}</span>
                {t.done ? <Icon.CheckCircle size={17} color={GREEN} /> : <Icon.Lock size={14} color="#B6A98E" />}
              </div>
            ))}
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: a calm full-screen Tale-Complete finish — only the iOS status bar as chrome.
  const words = ['mercado', 'pan', 'café'];
  return (
    <AppChrome>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 13, padding: '18px 22px', minHeight: 0 }}>
        <div className="exp-bob" style={{ flexShrink: 0 }}><Pip size={56} mood="cheer" /></div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 21, color: DEEP, textAlign: 'center' }}>Tale finished!</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 12, color: SPROUT.mute, textAlign: 'center' }}>You read The Morning Market</div>

        {/* new-words reward row */}
        <div style={{ width: '100%', background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '11px 13px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>New words</div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {words.map((w, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#EAF6E2', border: '1.5px solid ' + GREEN + '55', borderRadius: 999, padding: '4px 11px' }}>
                <Icon.Leaf size={11} color={DEEP} />
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12, color: SPROUT.greenDark }}>{w}</span>
              </span>
            ))}
          </div>
        </div>

        {/* seeds line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon.Leaf size={15} color={DEEP} />
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink }}>+12 seeds</span>
        </div>

        {/* stacked actions */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 9, marginTop: 2 }}>
          <div style={{ background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14.5, letterSpacing: '.06em', padding: '13px 0', borderRadius: 15, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>CONTINUE</div>
          <div style={{ textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, color: SPROUT.mute }}>Read again</div>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · A moment when a badge blooms (silent shelf-drop → full-screen bloom celebration) ──
function ProposedBadgeBloom({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';

  if (!isNew) {
    // CURRENT: the badge just lands silently in the Achievements shelf.
    const badges = [
      { name: 'Seedling', tier: 'TIER 1', earned: true },
      { name: 'Seven-Day Sprout', tier: 'TIER 2', earned: true, isNew: true },
      { name: 'Wildflower', tier: 'TIER 2', earned: false },
    ];
    return (
      <AppChrome top="hud" nav="me">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 16px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 17, color: SPROUT.ink }}>Achievements</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {badges.map((b, i) => (
              <div key={i} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '13px 6px 10px' }}>
                {b.isNew && <span style={{ position: 'absolute', top: 6, right: 7, width: 8, height: 8, borderRadius: '50%', background: DEEP }} />}
                <span style={{ width: 40, height: 40, borderRadius: '50%', background: b.earned ? '#EAF6E2' : '#EFE9DD', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid ' + (b.earned ? GREEN : SPROUT.line) }}>
                  <Icon.Leaf size={19} color={b.earned ? DEEP : '#B6A98E'} />
                </span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.1em', color: SPROUT.mute, fontWeight: 700 }}>{b.tier}</span>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 9.5, color: SPROUT.ink, textAlign: 'center', lineHeight: 1.15 }}>{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: full-screen bloom celebration — only the iOS status bar as chrome.
  const petals = [
    { l: '12%', t: '14%', s: 9, c: '#B7E3A6', r: -20 }, { l: '78%', t: '11%', s: 11, c: '#F6D278', r: 25 },
    { l: '30%', t: '7%', s: 7, c: '#9CD389', r: 40 }, { l: '64%', t: '20%', s: 8, c: '#B7E3A6', r: -35 },
    { l: '20%', t: '30%', s: 7, c: '#F6D278', r: 15 }, { l: '85%', t: '34%', s: 9, c: '#9CD389', r: -25 },
    { l: '8%', t: '46%', s: 8, c: '#B7E3A6', r: 30 }, { l: '88%', t: '54%', s: 7, c: '#F6D278', r: -15 },
  ];
  return (
    <AppChrome>
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 13, padding: '20px 24px', minHeight: 0, overflow: 'hidden' }}>
        {petals.map((p, i) => (
          <span key={i} aria-hidden style={{ position: 'absolute', left: p.l, top: p.t, width: p.s, height: p.s, borderRadius: '50% 0 50% 50%', background: p.c, transform: 'rotate(' + p.r + 'deg)', opacity: 0.7 }} />
        ))}
        {/* bloom medallion */}
        <span style={{ position: 'relative', width: 110, height: 110, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid ' + GREEN + '44' }} />
          <span style={{ position: 'absolute', inset: 10, borderRadius: '50%', border: '2px solid ' + GREEN + '66' }} />
          <span style={{ width: 70, height: 70, borderRadius: '50%', background: 'linear-gradient(160deg,#7FCC6C,' + DEEP + ')', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px -4px ' + DEEP + 'aa' }}>
            <Icon.Leaf size={34} color="#fff" />
          </span>
        </span>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 22, color: DEEP, textAlign: 'center', position: 'relative' }}>In full bloom!</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: SPROUT.ink, textAlign: 'center', position: 'relative' }}>Seven-Day Sprout</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 12, color: SPROUT.mute, textAlign: 'center', maxWidth: 210, lineHeight: 1.4, position: 'relative' }}>You watered your garden 7 days in a row.</div>
        <div style={{ width: '100%', marginTop: 6, background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14.5, letterSpacing: '.06em', padding: '14px 0', borderRadius: 15, boxShadow: '0 4px 0 ' + SPROUT.greenShadow, position: 'relative' }}>CONTINUE</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12, color: SPROUT.mute, position: 'relative' }}>Share</div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Achievement bloom shelf (Me screen → adds a tiered badge shelf under the stats grid) ──
function ProposedAchievementShelf({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';

  // identity header + stats grid — IDENTICAL in both modes; NEW only adds the shelf below.
  const header = (
    <React.Fragment>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <span style={{ width: 50, height: 50, borderRadius: '50%', background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Pip size={36} mood="cheer" /></span>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Xip</span>
            <span style={{ fontSize: 12 }}>🇺🇸</span>
          </div>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11.5, color: SPROUT.mute }}>@xipgrows</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[['Streak', '13'], ['Seeds', '1,240'], ['League', 'Silver'], ['Words', '84']].map(([l, v], i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 11, padding: '8px 3px' }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: DEEP }}>{v}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6, letterSpacing: '.05em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{l}</span>
          </div>
        ))}
      </div>
    </React.Fragment>
  );

  // tiered bloom badges — only on NEW
  const badges = [
    { tier: 'Seedling', pct: 1, earned: true },
    { tier: 'Sapling', pct: 0.85, earned: false },
    { tier: 'Golden Bloom', pct: 0.2, earned: false },
  ];
  const ringSize = 54, r = 24, circ = 2 * Math.PI * r;

  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 16px', minHeight: 0, overflow: 'hidden' }}>
        {header}
        {isNew && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink }}>Achievements</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.greenDark, fontWeight: 700 }}>View all</span>
            </div>
            <div style={{ display: 'flex', gap: 9 }}>
              {badges.map((b, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '12px 5px 10px', opacity: b.earned ? 1 : 0.92 }}>
                  <span style={{ position: 'relative', width: ringSize, height: ringSize, flexShrink: 0 }}>
                    <svg width={ringSize} height={ringSize} viewBox={'0 0 ' + ringSize + ' ' + ringSize} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                      <circle cx={ringSize / 2} cy={ringSize / 2} r={r} fill="none" stroke="#EAE2D1" strokeWidth="4" />
                      <circle cx={ringSize / 2} cy={ringSize / 2} r={r} fill="none" stroke={b.earned ? DEEP : GREEN} strokeWidth="4" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - b.pct)} />
                    </svg>
                    <span style={{ position: 'absolute', inset: 7, borderRadius: '50%', background: b.earned ? 'linear-gradient(160deg,#8FD178,' + DEEP + ')' : '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon.Leaf size={20} color={b.earned ? '#fff' : GREEN} />
                    </span>
                  </span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.08em', textTransform: 'uppercase', color: b.earned ? SPROUT.greenDark : SPROUT.mute, fontWeight: 700, textAlign: 'center', lineHeight: 1.25 }}>{b.tier}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppChrome>
  );
}

// ── Proposed · Tap a bloom for detail (static bloom shelf → calm bloom-detail sheet over the dimmed shelf) ──
function ProposedBloomDetail({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';

  // identity header + stats grid — IDENTICAL on both phones (shared Me chrome).
  const header = (
    <React.Fragment>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <span style={{ width: 50, height: 50, borderRadius: '50%', background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Pip size={36} mood="cheer" /></span>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Xip</span>
            <span style={{ fontSize: 12 }}>🇺🇸</span>
          </div>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11.5, color: SPROUT.mute }}>@xipgrows</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[['Streak', '13'], ['Seeds', '1,240'], ['League', 'Silver'], ['Words', '84']].map(([l, v], i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 11, padding: '8px 3px' }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: DEEP }}>{v}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6, letterSpacing: '.05em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{l}</span>
          </div>
        ))}
      </div>
    </React.Fragment>
  );

  // a fuller bloom shelf — 6 blooms (earned + locked), IDENTICAL on both phones.
  const blooms = [
    { name: 'First Sprout', earned: true },
    { name: 'Seven-Day Sprout', earned: true, focus: true },
    { name: 'Word Gardener', earned: true },
    { name: 'Night Owl', earned: false },
    { name: 'Perfect Week', earned: false },
    { name: 'Golden Bloom', earned: false },
  ];

  const Shelf = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 1 }}>
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink }}>Achievements</span>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {blooms.map((b, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: '#FFFDF7', border: '1.5px solid ' + (b.focus && isNew ? GREEN : SPROUT.line), borderRadius: 14, padding: '12px 5px 9px', opacity: b.earned ? 1 : 0.6 }}>
            <span style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, background: b.earned ? 'linear-gradient(160deg,#8FD178,' + DEEP + ')' : '#ECE4D4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {b.earned ? <Icon.Leaf size={22} color="#fff" /> : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B6A98E" strokeWidth="2.4"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round"/></svg>
              )}
            </span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.05em', textTransform: 'uppercase', color: b.earned ? SPROUT.greenDark : SPROUT.mute, fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{b.name}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (!isNew) {
    // CURRENT: the shelf is a flat gallery — tapping a bloom does nothing.
    return (
      <AppChrome top="hud" nav="me">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 16px', minHeight: 0, overflow: 'hidden' }}>
          {header}
          <Shelf />
        </div>
      </AppChrome>
    );
  }

  // NEW: tapping a bloom raises a calm detail sheet over the dimmed shelf.
  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 16px 0', minHeight: 0, overflow: 'hidden' }}>
        <div style={{ opacity: 0.5, filter: 'saturate(.85)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {header}
          <Shelf />
        </div>
        {/* scrim */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'rgba(42,35,32,.2)' }} />

        {/* bloom-detail sheet (earned bloom) */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: '#FFFDF7', borderTopLeftRadius: 22, borderTopRightRadius: 22, boxShadow: '0 -14px 34px -16px rgba(42,35,32,.5)', padding: '12px 20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* grab handle */}
          <div style={{ width: 38, height: 4, borderRadius: 999, background: SPROUT.cream2, marginBottom: 14 }} />
          {/* (1) large bloom icon */}
          <div style={{ position: 'relative', width: 78, height: 78, flexShrink: 0, marginBottom: 12 }}>
            <span aria-hidden style={{ position: 'absolute', inset: -8, borderRadius: '50%', background: 'radial-gradient(circle, ' + GREEN + '40 0%, ' + GREEN + '00 70%)' }} />
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(160deg,#8FD178,' + DEEP + ')', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 12px -4px ' + DEEP + 'aa' }}>
              <Icon.Leaf size={38} color="#fff" />
            </span>
          </div>
          {/* (2) bloom name */}
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: DEEP, textAlign: 'center', lineHeight: 1.15, marginBottom: 7, whiteSpace: 'nowrap' }}>Seven-Day Sprout</div>
          {/* (3) earned: date line + one warm description */}
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.12em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700, marginBottom: 11, whiteSpace: 'nowrap' }}>Grown on Jun 3</div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 13, color: SPROUT.ink, textAlign: 'center', lineHeight: 1.45, maxWidth: 250, marginBottom: 16 }}>You watered your garden 7 days in a row.</div>
          {/* (5) quiet more-blooms link */}
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, letterSpacing: '.02em', color: SPROUT.mute, textDecoration: 'underline', textUnderlineOffset: 3 }}>More blooms</span>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Achievement detail: bloom tiers (flat shelf, tapping does nothing → tier-ladder detail sheet) ──
function ProposedBloomTiers({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e', GOLD = '#E5A93A';

  // identity header + stats grid — IDENTICAL on both phones (shared Me chrome).
  const header = (
    <React.Fragment>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <span style={{ width: 50, height: 50, borderRadius: '50%', background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Pip size={36} mood="cheer" /></span>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Xip</span>
            <span style={{ fontSize: 12 }}>🇺🇸</span>
          </div>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11.5, color: SPROUT.mute }}>@xipgrows</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[['Streak', '13'], ['Seeds', '1,240'], ['League', 'Silver'], ['Words', '84']].map(([l, v], i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 11, padding: '8px 3px' }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: DEEP }}>{v}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6, letterSpacing: '.05em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{l}</span>
          </div>
        ))}
      </div>
    </React.Fragment>
  );

  const blooms = [
    { name: 'First Sprout', earned: true },
    { name: 'Lesson Bloom', earned: true, focus: true },
    { name: 'Word Gardener', earned: true },
    { name: 'Night Owl', earned: false },
    { name: 'Perfect Week', earned: false },
    { name: 'Golden Bloom', earned: false },
  ];
  const Shelf = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 1 }}>
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink }}>Achievements</span>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {blooms.map((b, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: '#FFFDF7', border: '1.5px solid ' + (b.focus && isNew ? GREEN : SPROUT.line), borderRadius: 14, padding: '12px 5px 9px', opacity: b.earned ? 1 : 0.6 }}>
            <span style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, background: b.earned ? 'linear-gradient(160deg,#8FD178,' + DEEP + ')' : '#ECE4D4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {b.earned ? <Icon.Leaf size={22} color="#fff" /> : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B6A98E" strokeWidth="2.4"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round"/></svg>
              )}
            </span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.05em', textTransform: 'uppercase', color: b.earned ? SPROUT.greenDark : SPROUT.mute, fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{b.name}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (!isNew) {
    return (
      <AppChrome top="hud" nav="me">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 16px', minHeight: 0, overflow: 'hidden' }}>
          {header}
          <Shelf />
        </div>
      </AppChrome>
    );
  }

  // the four-step tier ladder: earned → next (outlined) → muted
  const TIERS = [
    { name: 'Seedling', state: 'earned' },
    { name: 'Sprout', state: 'earned' },
    { name: 'Bloom', state: 'next' },
    { name: 'Golden', state: 'muted' },
  ];
  const tierDot = (state) => {
    if (state === 'earned') return { background: GREEN, border: 'none', icon: <Icon.Check size={13} color="#fff" /> };
    if (state === 'next') return { background: '#fff', border: '2px solid ' + DEEP, icon: <Icon.Leaf size={13} color={DEEP} /> };
    return { background: '#ECE4D4', border: 'none', icon: <Icon.Leaf size={13} color="#C3B8A2" /> };
  };

  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 16px 0', minHeight: 0, overflow: 'hidden' }}>
        <div style={{ opacity: 0.5, filter: 'saturate(.85)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {header}
          <Shelf />
        </div>
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'rgba(42,35,32,.2)' }} />

        {/* bloom-tier detail sheet */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: '#FFFDF7', borderTopLeftRadius: 22, borderTopRightRadius: 22, boxShadow: '0 -14px 34px -16px rgba(42,35,32,.5)', padding: '12px 20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 38, height: 4, borderRadius: 999, background: SPROUT.cream2, marginBottom: 12 }} />
          {/* (1) large bloom hero + current tier label */}
          <div style={{ position: 'relative', width: 74, height: 74, flexShrink: 0, marginBottom: 9 }}>
            <span aria-hidden style={{ position: 'absolute', inset: -8, borderRadius: '50%', background: 'radial-gradient(circle, ' + GREEN + '40 0%, ' + GREEN + '00 70%)' }} />
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(160deg,#8FD178,' + DEEP + ')', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 12px -4px ' + DEEP + 'aa' }}>
              <Icon.Leaf size={36} color="#fff" />
            </span>
          </div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 17, color: DEEP, marginBottom: 2 }}>Lesson Bloom</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.12em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700, marginBottom: 15 }}>Bloom · Tier 2 of 4</div>

          {/* (2) horizontal tier ladder */}
          <div style={{ width: '100%', display: 'flex', alignItems: 'flex-start', marginBottom: 16 }}>
            {TIERS.map((t, i) => {
              const d = tierDot(t.state);
              return (
                <React.Fragment key={i}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0, width: 44 }}>
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: d.background, border: d.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{d.icon}</span>
                    <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: t.state === 'muted' ? 700 : 900, fontSize: 8.5, color: t.state === 'earned' ? DEEP : (t.state === 'next' ? SPROUT.ink : SPROUT.mute), whiteSpace: 'nowrap' }}>{t.name}</span>
                  </div>
                  {i < TIERS.length - 1 && (
                    <div style={{ flex: 1, height: 3, borderRadius: 999, background: t.state === 'earned' ? GREEN : SPROUT.cream2, marginTop: 13 }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* (3) progress bar to next tier + count */}
          <div style={{ width: '100%', marginBottom: 9 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>To Golden</span>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11.5, color: SPROUT.ink }}>28 / 50 lessons watered</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}>
              <div style={{ width: '56%', height: '100%', borderRadius: 999, background: GREEN }} />
            </div>
          </div>

          {/* (4) single rule line */}
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 12, color: SPROUT.mute, textAlign: 'center', marginBottom: 14 }}>Complete 50 lessons to reach Golden.</div>

          {/* (5) quiet link */}
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, letterSpacing: '.02em', color: SPROUT.mute, textDecoration: 'underline', textUnderlineOffset: 3 }}>More achievements</span>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Garden Friends row on Me (solo profile → adds a calm friends section below the stats) ──
function ProposedGardenFriends({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e', GOLD = '#E5A93A';

  // identity header + stats grid — IDENTICAL in both modes; NEW only adds the friends section below.
  const header = (
    <React.Fragment>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <span style={{ width: 50, height: 50, borderRadius: '50%', background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Pip size={36} mood="cheer" /></span>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Xip</span>
            <span style={{ fontSize: 12 }}>🇺🇸</span>
          </div>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11.5, color: SPROUT.mute }}>@xipgrows</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.04em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700, marginTop: 1 }}>Joined Mar 2026</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[['Streak', '13'], ['Seeds', '1,240'], ['League', 'Silver'], ['Words', '84']].map(([l, v], i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 11, padding: '8px 3px' }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: DEEP }}>{v}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6, letterSpacing: '.05em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{l}</span>
          </div>
        ))}
      </div>
    </React.Fragment>
  );

  // the friends — NEW only. Streak shown as a calm glyph + number (gold flame for a hot run, green leaf otherwise).
  const friends = [
    { name: 'Maya', tint: '#F3D9A6', ring: '#E8C77E', streak: 12, hot: false },
    { name: 'Theo', tint: '#BFE3F2', ring: '#9CCFE4', streak: 30, hot: true },
    { name: 'Sol', tint: '#CDEBBC', ring: '#A9D993', streak: 7, hot: false },
  ];

  const FriendRow = ({ f }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 4px', borderBottom: '1px solid ' + SPROUT.line }}>
      <span style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: f.tint, border: '1.5px solid ' + f.ring, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: '#6b5a36' }}>{f.name[0]}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: SPROUT.ink, lineHeight: 1.1 }}>{f.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
          {f.hot ? <Icon.Flame size={13} color={GOLD} /> : <Icon.Leaf size={13} color={DEEP} />}
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11.5, color: f.hot ? '#B07E1E' : SPROUT.greenDark }}>{f.streak}</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.08em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700, marginLeft: 1 }}>days</span>
        </div>
      </div>
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: '1.5px solid ' + GREEN, borderRadius: 999, padding: '5px 11px' }}>
        <Icon.Hand size={11} color={DEEP} />
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, letterSpacing: '.02em', color: DEEP }}>Wave</span>
      </span>
    </div>
  );

  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: '13px 16px', minHeight: 0, overflow: 'hidden' }}>
        {header}
        {isNew && (
          <div style={{ background: SPROUT.cream, border: '1.5px solid ' + SPROUT.line, borderRadius: 16, padding: '10px 13px 4px', marginTop: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 3, gap: 8 }}>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink, whiteSpace: 'nowrap' }}>Garden Friends</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.greenDark, fontWeight: 700, whiteSpace: 'nowrap' }}>3 growing</span>
            </div>
            {friends.map((f, i) => <FriendRow key={i} f={f} />)}
            {/* dashed ghost row — invite a friend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 4px 8px' }}>
              <span style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, border: '1.5px dashed ' + SPROUT.mute, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              </span>
              <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, color: SPROUT.mute }}>Invite a friend</span>
            </div>
          </div>
        )}
      </div>
    </AppChrome>
  );
}

// ── Proposed · Friends garden activity feed (static avatar strip → calm feed of friends' garden wins) ──
function ProposedFriendsFeed({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const DEEP = '#3fa52e', GREEN = '#6fbf5e';

  // identity header + stats grid — IDENTICAL in both modes; only the friends component changes.
  const header = (
    <React.Fragment>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <span style={{ width: 50, height: 50, borderRadius: '50%', background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Pip size={36} mood="cheer" /></span>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Xip</span>
            <span style={{ fontSize: 12 }}>🇺🇸</span>
          </div>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11.5, color: SPROUT.mute }}>@xipgrows</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.04em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700, marginTop: 1 }}>Joined Mar 2026</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[['Streak', '13'], ['Seeds', '1,240'], ['League', 'Silver'], ['Words', '84']].map(([l, v], i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 11, padding: '8px 3px' }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: DEEP }}>{v}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6, letterSpacing: '.05em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{l}</span>
          </div>
        ))}
      </div>
    </React.Fragment>
  );

  const friends = [
    { name: 'Bea', tint: '#F3D9A6', ring: '#E8C77E', milestone: "Bea's garden reached full bloom", time: '12m' },
    { name: 'Tom', tint: '#BFE3F2', ring: '#9CCFE4', milestone: 'Tom kept a 30-day streak', time: '2h' },
    { name: 'Mei', tint: '#CDEBBC', ring: '#A9D993', milestone: 'Mei planted 5 new words', time: '1d' },
  ];

  // CURRENT: a static horizontal strip of avatars — no context, nothing to do.
  const Strip = () => (
    <div style={{ background: SPROUT.cream, border: '1.5px solid ' + SPROUT.line, borderRadius: 16, padding: '11px 13px', marginTop: 1 }}>
      <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink, marginBottom: 11 }}>Garden Friends</div>
      <div style={{ display: 'flex', gap: 13 }}>
        {friends.map((f, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, background: f.tint, border: '1.5px solid ' + f.ring, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 17, color: '#6b5a36' }}>{f.name[0]}</span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 10.5, color: SPROUT.mute }}>{f.name}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // NEW: the same row becomes a calm activity feed of friends' garden wins.
  const FeedRow = ({ f }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 4px', borderBottom: '1px solid ' + SPROUT.line }}>
      <span style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: f.tint, border: '1.5px solid ' + f.ring, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, color: '#6b5a36' }}>{f.name[0]}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11, color: SPROUT.ink, lineHeight: 1.15 }}>
          <span style={{ fontWeight: 900 }}>{f.name}</span>{f.milestone.replace(f.name, '')}
        </div>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{f.time} ago</span>
      </div>
      <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', background: '#EAF6E2', border: '1.5px solid ' + GREEN + '66', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon.Heart size={12} color={DEEP} />
      </span>
    </div>
  );

  const Feed = () => (
    <div style={{ background: SPROUT.cream, border: '1.5px solid ' + SPROUT.line, borderRadius: 16, padding: '9px 13px 4px', marginTop: 1 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 2, gap: 8 }}>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink, whiteSpace: 'nowrap' }}>Garden Friends</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.greenDark, fontWeight: 700, whiteSpace: 'nowrap' }}>Activity</span>
      </div>
      {friends.map((f, i) => <FeedRow key={i} f={f} />)}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5px 0 3px' }}>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11.5, letterSpacing: '.02em', color: DEEP }}>See all</span>
      </div>
    </div>
  );

  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, padding: '13px 16px', minHeight: 0, overflow: 'hidden' }}>
        {header}
        {isNew ? <Feed /> : <Strip />}
      </div>
    </AppChrome>
  );
}

// ── Proposed · Garden Buddy shared streak (solo friend stats → one mutual shared-streak card) ──
function ProposedGardenBuddy({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const DEEP = '#3fa52e', GREEN = '#6fbf5e';

  // identity header + stats grid — IDENTICAL in both modes; only the Friends section changes.
  const header = (
    <React.Fragment>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <span style={{ width: 50, height: 50, borderRadius: '50%', background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Pip size={36} mood="cheer" /></span>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Xip</span>
            <span style={{ fontSize: 12 }}>🇺🇸</span>
          </div>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11.5, color: SPROUT.mute }}>@xipgrows</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.04em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700, marginTop: 1 }}>Joined Mar 2026</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[['Streak', '13'], ['Seeds', '1,240'], ['League', 'Silver'], ['Words', '84']].map(([l, v], i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 11, padding: '8px 3px' }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: DEEP }}>{v}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6, letterSpacing: '.05em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{l}</span>
          </div>
        ))}
      </div>
    </React.Fragment>
  );

  const Avatar = ({ ch, tint, ring, size = 30 }) => (
    <span style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: tint, border: '1.5px solid ' + ring, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: size * 0.42, color: '#6b5a36' }}>{ch}</span>
  );

  // the friends list — each row shows the friend's OWN solo stat (leaf/streak).
  const friends = [
    { name: 'Bea', tint: '#F3D9A6', ring: '#E8C77E', leaf: 28, streak: 12 },
    { name: 'Tom', tint: '#BFE3F2', ring: '#9CCFE4', leaf: 41, streak: 30 },
    { name: 'Mei', tint: '#CDEBBC', ring: '#A9D993', leaf: 19, streak: 6 },
  ];
  const SoloRow = ({ f }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 2px', borderBottom: '1px solid ' + SPROUT.line }}>
      <Avatar ch={f.name[0]} tint={f.tint} ring={f.ring} size={30} />
      <span style={{ flex: 1, minWidth: 0, fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>{f.name}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Icon.Leaf size={12} color={DEEP} />
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11, color: SPROUT.mute }}>{f.leaf}</span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, width: 46, justifyContent: 'flex-end' }}>
        <Icon.Flame size={12} color="#E5A93A" />
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11, color: SPROUT.mute }}>{f.streak}</span>
      </span>
    </div>
  );

  const FriendsList = ({ heading }) => (
    <div style={{ background: SPROUT.cream, border: '1.5px solid ' + SPROUT.line, borderRadius: 16, padding: '10px 13px 5px', marginTop: 1 }}>
      <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink, marginBottom: 6 }}>{heading}</div>
      {friends.map((f, i) => <SoloRow key={i} f={f} />)}
    </div>
  );

  // CURRENT: a flat friends list of solo stats — nothing the two of you grow together.
  if (!isNew) {
    return (
      <AppChrome top="hud" nav="me">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, padding: '13px 16px', minHeight: 0, overflow: 'hidden' }}>
          {header}
          <FriendsList heading="Garden Friends" />
        </div>
      </AppChrome>
    );
  }

  // NEW: the Friends section leads with a calm Garden Buddy shared-streak card.
  const WEEK = [true, true, true, true, false, true, true]; // days you BOTH watered
  const BuddyCard = () => (
    <div style={{ background: '#EDF7E5', border: '1.5px solid #CDE9BC', borderRadius: 16, padding: '10px 13px', boxShadow: '0 3px 0 #DCEFD0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, color: SPROUT.ink }}>Garden Buddy</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.12em', textTransform: 'uppercase', color: SPROUT.greenDark, fontWeight: 700 }}>Shared streak</span>
      </div>
      {/* you + buddy, vines intertwining into one shared sprout with the shared count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 8 }}>
        <span style={{ position: 'relative', zIndex: 2 }}><Avatar ch="X" tint="#EAF6E2" ring={GREEN} size={40} /></span>
        {/* the intertwined shared sprout/flame */}
        <span style={{ position: 'relative', zIndex: 3, margin: '0 -8px', width: 46, height: 46, borderRadius: '50%', background: 'radial-gradient(circle at 50% 38%, #BDEBA8, ' + GREEN + ')', border: '2px solid #fff', boxShadow: '0 3px 9px -3px ' + DEEP + '99', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.Plant size={19} color="#fff" />
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: '#fff', lineHeight: 1, marginTop: -1 }}>12</span>
        </span>
        <span style={{ position: 'relative', zIndex: 2 }}><Avatar ch="B" tint="#F3D9A6" ring="#E8C77E" size={40} /></span>
      </div>
      <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: DEEP, textAlign: 'center', marginBottom: 8 }}>12 days grown together</div>
      {/* 7-dot week strip — the days you BOTH watered */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginBottom: 9 }}>
        {WEEK.map((on, i) => (
          <span key={i} style={{ width: 15, height: 15, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? GREEN : 'transparent', border: on ? 'none' : '1.5px dashed #BBD3AC' }}>
            {on && <Icon.Check size={9} color="#fff" />}
          </span>
        ))}
      </div>
      {/* one soft nudge button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: GREEN, color: '#fff', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, letterSpacing: '.03em', padding: '9px 0', borderRadius: 12, boxShadow: '0 3px 0 ' + SPROUT.greenShadow }}>
        <Icon.Sun size={15} color="#fff" />Send sunshine
      </div>
    </div>
  );

  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, padding: '12px 16px', minHeight: 0, overflow: 'hidden' }}>
        {header}
        <BuddyCard />
        {/* a dashed invite slot for a second buddy */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, border: '1.5px dashed #C9BEA8', borderRadius: 13, padding: '7px 12px' }}>
          <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, border: '1.5px dashed #C9BEA8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          </span>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12, color: SPROUT.mute }}>Invite a buddy</span>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Calm profile identity header (loose stacked header → one tidy identity card) ──
function ProposedProfileIdentity({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';

  if (!isNew) {
    // CURRENT: a loose, cramped header — avatar + name + a couple facts loosely stacked.
    return (
      <AppChrome top="hud" nav="me">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 16px', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Pip size={44} mood="cheer" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16, color: SPROUT.ink }}>Xip</span>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 11, color: SPROUT.mute }}>@xipgrows</span>
            </div>
          </div>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 11, color: SPROUT.mute }}>Joined Mar 2026</span>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 11, color: SPROUT.mute }}>12 Following · 8 Followers</span>
          {/* a plain stats strip below (unchanged area) */}
          <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
            {[['Streak', '13'], ['Seeds', '1,240'], ['League', 'Silver']].map(([l, v], i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 11, padding: '8px 4px' }}>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: DEEP }}>{v}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: one tidy identity card — avatar, name, handle, join, flag, counts, Add button.
  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11, padding: '13px 16px', minHeight: 0, overflow: 'hidden' }}>
        <div style={{ background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 18, padding: '15px 15px 14px', boxShadow: '0 6px 16px -12px rgba(42,35,32,.3)', display: 'flex', flexDirection: 'column', gap: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 56, height: 56, borderRadius: '50%', background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Pip size={40} mood="cheer" /></span>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 19, color: SPROUT.ink }}>Xip</span>
                <span style={{ fontSize: 13 }}>🇺🇸</span>
              </div>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 12, color: SPROUT.mute }}>@xipgrows</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.04em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700, marginTop: 2 }}>Joined Mar 2026</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5 }}>
            <span style={{ color: DEEP }}>12</span><span style={{ color: SPROUT.mute, fontWeight: 600 }}>Following</span>
            <span style={{ color: SPROUT.line }}>·</span>
            <span style={{ color: DEEP }}>8</span><span style={{ color: SPROUT.mute, fontWeight: 600 }}>Followers</span>
          </div>
          <div style={{ textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, letterSpacing: '.03em', color: DEEP, background: '#fff', border: '1.5px solid ' + GREEN, borderRadius: 12, padding: '10px 0' }}>Add gardeners</div>
        </div>
        {/* stats grid below stays unchanged */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[['Streak', '13'], ['Seeds', '1,240'], ['League', 'Silver']].map(([l, v], i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 11, padding: '8px 4px' }}>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: DEEP }}>{v}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · This-week activity chart on Me (all-time totals → adds a 7-day seeds bar chart) ──
function ProposedMeWeekChart({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const days = [
    ['M', 18], ['T', 12], ['W', 0], ['T', 22], ['F', 14], ['S', 18, true], ['S', 0],
  ];
  const max = 24;
  const Identity = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ width: 52, height: 52, borderRadius: '50%', background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Pip size={38} mood="cheer" /></span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Xip</span>
          <span style={{ fontSize: 12 }}>🇺🇸</span>
        </div>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11.5, color: SPROUT.mute }}>@xipgrows</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.04em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700, marginTop: 1 }}>Joined Mar 2026</span>
      </div>
    </div>
  );
  const Grid = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {[['Days grown', '13'], ['Total seeds', '1,240'], ['League', 'Silver'], ['Words', '84']].map(([l, v], i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 12, padding: '9px 12px' }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: DEEP }}>{v}</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{l}</span>
        </div>
      ))}
    </div>
  );
  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: '13px 16px', minHeight: 0, overflow: 'hidden' }}>
        <Identity />
        {isNew && (
          <div style={{ background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 15, padding: '12px 14px 11px' }}>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, color: SPROUT.ink }}>You watered 5 of 7 days</div>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 10.5, color: SPROUT.mute, marginTop: 1 }}>84 seeds this week</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6, height: 64, marginTop: 11, borderBottom: '1.5px solid ' + SPROUT.line, paddingBottom: 0 }}>
              {days.map(([d, v, today], i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 4, height: '100%' }}>
                  <div style={{ width: '64%', height: Math.max(3, (v / max) * 50) + 'px', borderRadius: 5, background: v === 0 ? '#EAE2D1' : (today ? DEEP : GREEN) }} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, color: today ? DEEP : SPROUT.mute }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <Grid />
      </div>
    </AppChrome>
  );
}

// ── Proposed · Share my garden (Me screen dead-ends → adds one calm share action card) ──
function ProposedShareGarden({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';

  // identity header — identical in BOTH modes
  const Identity = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ width: 52, height: 52, borderRadius: '50%', background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Pip size={38} mood="cheer" /></span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Xip</span>
          <span style={{ fontSize: 12 }}>🇺🇸</span>
        </div>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11.5, color: SPROUT.mute }}>@xipgrows</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.04em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700, marginTop: 1 }}>Joined Mar 2026</span>
      </div>
    </div>
  );
  // stats strip + achievement shelf — identical in BOTH modes
  const Body = () => (
    <React.Fragment>
      <div style={{ display: 'flex', gap: 8 }}>
        {[['Streak', '13'], ['Seeds', '1,240'], ['League', 'Silver']].map(([l, v], i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 11, padding: '8px 4px' }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: DEEP }}>{v}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.06em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{l}</span>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700, marginTop: 1 }}>Achievements</div>
      <div style={{ display: 'flex', gap: 9 }}>
        {[['#EAF6E2', DEEP], ['#FBF1DA', '#C2871B'], ['#EAF6E2', GREEN]].map(([bg, c], i) => (
          <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 46, background: bg, border: '1.5px solid ' + SPROUT.line, borderRadius: 13 }}>
            <Icon.Leaf size={20} color={c} />
          </div>
        ))}
      </div>
    </React.Fragment>
  );

  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11, padding: '13px 16px', minHeight: 0, overflow: 'hidden' }}>
        <Identity />
        {isNew && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 15, padding: '12px 14px', boxShadow: '0 4px 12px -10px rgba(42,35,32,.3)' }}>
            <span style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.8l7.4-4.3M8.3 13.2l7.4 4.3"/></svg>
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, color: SPROUT.ink, lineHeight: 1.15 }}>Share my garden</div>
              <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 10.5, color: SPROUT.mute, marginTop: 1 }}>Show off your streak, leaves &amp; League</div>
            </div>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M9 6l6 6-6 6"/></svg>
          </div>
        )}
        <Body />
      </div>
    </AppChrome>
  );
}

// ── Proposed · Golden Bloom benefits screen (vague upsell → benefit rows + recommended plan + CTA) ──
function ProposedGoldenBloomBenefits({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e', GOLD = '#E5A93A';

  const Header = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 16px 8px', flexShrink: 0 }}>
      <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#fff', border: '1.5px solid ' + SPROUT.line, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.5" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19" /></svg>
      </span>
      <span style={{ flex: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Golden Bloom</span>
    </div>
  );
  const Emblem = ({ size }) => (
    <span style={{ width: size, height: size, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 50% 42%, #FBF1DA 0%, #EAF6E2 60%, #FFFDF7 100%)', border: '2px solid ' + GREEN + '66', flexShrink: 0 }}>
      <span style={{ width: size * 0.56, height: size * 0.56, borderRadius: '50%', background: 'linear-gradient(160deg,#F6D278,' + GOLD + ')', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 9px -2px ' + GOLD + 'aa' }}><Icon.Leaf size={size * 0.3} color="#fff" /></span>
    </span>
  );

  if (!isNew) {
    // CURRENT: golden hero + single CTA, no benefits spelled out.
    return (
      <AppChrome top="none">
        <Header />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 13, padding: '18px 22px', minHeight: 0 }}>
          <Emblem size={92} />
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 20, color: DEEP, textAlign: 'center' }}>Golden Bloom</div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 12.5, color: SPROUT.mute, textAlign: 'center', maxWidth: 210, lineHeight: 1.45 }}>Unlock the full Sprout garden experience.</div>
          <div style={{ width: '100%', marginTop: 6, background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.04em', padding: '14px 0', borderRadius: 15, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Unlock Golden Bloom</div>
        </div>
      </AppChrome>
    );
  }

  // NEW: benefit rows + recommended plan card + single CTA.
  const benefits = [
    [<Icon.Droplet size={16} color="#2E8FB0" />, '#E5F2F8', 'Unlimited water', 'Never run dry mid-lesson'],
    [<Icon.Leaf size={16} color={DEEP} />, '#EAF6E2', 'No ads between lessons', 'Stay in your garden, uninterrupted'],
    [<Icon.Sparkle size={16} color={DEEP} />, '#EAF6E2', 'Double seeds', 'Earn 2× on every lesson'],
    [<Icon.Plant size={16} color={GOLD} />, '#FBF1DA', 'Exclusive Garden Tales', 'Golden plots & special blooms'],
  ];
  return (
    <AppChrome top="none">
      <Header />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, padding: '2px 16px 8px', minHeight: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <Emblem size={42} />
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: DEEP }}>Golden Bloom</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {benefits.map(([icon, tint, title, desc], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink, lineHeight: 1.15 }}>{title}</div>
                <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 10, color: SPROUT.mute, lineHeight: 1.2 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
        {/* recommended Annual plan + muted Monthly */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#EAF6E2', border: '2px solid ' + GREEN, borderRadius: 13, padding: '8px 12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>Annual</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.greenDark, fontWeight: 700 }}>Best value · save 40%</div>
            </div>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: DEEP }}>£49.98/yr</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '8px 12px' }}>
            <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, color: SPROUT.ink }}>Monthly</span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.mute }}>£6.99/mo</span>
          </div>
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: '100%', background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.04em', padding: '12px 0', borderRadius: 15, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Start 7-day free trial</div>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 9.5, color: SPROUT.mute }}>then £49.98/yr · cancel anytime</span>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11, color: SPROUT.mute }}>Maybe later</span>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Free vs Sprout+ at a glance (long marketing list → side-by-side comparison table) ──
function ProposedPlanCompare({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';

  const Header = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 16px 8px', flexShrink: 0 }}>
      <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#fff', border: '1.5px solid ' + SPROUT.line, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.5" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19" /></svg>
      </span>
      <span style={{ flex: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Sprout+</span>
    </div>
  );

  const rows = ['Unlimited water (no run-outs)', 'No ads', 'Streak repair', 'Unlimited practice', 'Golden Bloom boost', 'Personal review path'];

  if (!isNew) {
    const perks = [
      ['Unlimited water', 'Never run dry in the middle of a lesson — keep watering as long as you like, no waiting for refills.'],
      ['No ads', 'Stay in your garden with zero interruptions between lessons.'],
      ['Streak repair', 'Life happens — mend a broken streak and keep your garden growing.'],
      ['Unlimited practice', 'Review as much as you want, whenever you want, with no daily caps.'],
      ['Golden Bloom boost', 'Climb the monthly challenge faster with bonus progress.'],
      ['Personal review path', 'A tailored path that revisits exactly the words you keep missing.'],
    ];
    return (
      <AppChrome top="none">
        <Header />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11, padding: '4px 18px 14px', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 19, color: DEEP, flexShrink: 0 }}>Go Sprout+</div>
          {perks.map(([title, copy], i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Check size={11} color={DEEP} /></span>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: SPROUT.ink }}>{title}</span>
              </div>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 11, color: SPROUT.mute, lineHeight: 1.35, paddingLeft: 25 }}>{copy}</span>
            </div>
          ))}
          <div style={{ marginTop: 'auto', flexShrink: 0, background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, letterSpacing: '.04em', padding: '12px 0', borderRadius: 15, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Start free trial</div>
        </div>
      </AppChrome>
    );
  }

  return (
    <AppChrome top="none">
      <Header />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 16px 14px', minHeight: 0, overflow: 'hidden' }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: DEEP, textAlign: 'center', flexShrink: 0 }}>What you get</div>

        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div aria-hidden style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 78, background: '#EAF6E2', border: '1.5px solid #CDE9BC', borderRadius: 14 }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', paddingBottom: 9 }}>
            <span style={{ flex: 1 }} />
            <span style={{ width: 56, textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Free</span>
            <span style={{ width: 78, textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: DEEP }}>Sprout+</span>
          </div>
          {rows.map((label, i) => (
            <div key={i} style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '9px 0', borderTop: '1px solid ' + SPROUT.line }}>
              <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12, color: SPROUT.ink, paddingRight: 6 }}>{label}</span>
              <span style={{ width: 56, display: 'flex', justifyContent: 'center', color: SPROUT.line, fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13 }}>—</span>
              <span style={{ width: 78, display: 'flex', justifyContent: 'center' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 0 ' + SPROUT.greenShadow }}><Icon.Check size={13} color="#fff" /></span>
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flexShrink: 0 }}>
          <div style={{ width: '100%', background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.04em', padding: '13px 0', borderRadius: 15, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Start free trial</div>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12, color: SPROUT.mute }}>Maybe later</span>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Sprout+ free-trial reassurance timeline (feature grid only → Today→Day5→Day7 timeline) ──
function ProposedTrialTimeline({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';

  const Header = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '12px 16px 4px', flexShrink: 0 }}>
      <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#fff', border: '1.5px solid ' + SPROUT.line, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.5" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19" /></svg>
      </span>
    </div>
  );

  if (!isNew) {
    // CURRENT: leads with a Free-vs-Sprout+ feature grid + trial button — no "what happens next".
    const rows = ['Unlimited water', 'No ads', 'Streak repair', 'Every Garden Tale'];
    return (
      <AppChrome top="none">
        <Header />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 13, padding: '2px 16px 14px', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: DEEP, textAlign: 'center', flexShrink: 0 }}>Go Sprout+</div>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div aria-hidden style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 74, background: '#EAF6E2', border: '1.5px solid #CDE9BC', borderRadius: 14 }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', paddingBottom: 9 }}>
              <span style={{ flex: 1 }} />
              <span style={{ width: 54, textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Free</span>
              <span style={{ width: 74, textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: DEEP }}>Sprout+</span>
            </div>
            {rows.map((label, i) => (
              <div key={i} style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '10px 0', borderTop: '1px solid ' + SPROUT.line }}>
                <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12, color: SPROUT.ink, paddingRight: 6 }}>{label}</span>
                <span style={{ width: 54, display: 'flex', justifyContent: 'center', color: SPROUT.line, fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13 }}>—</span>
                <span style={{ width: 74, display: 'flex', justifyContent: 'center' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 0 ' + SPROUT.greenShadow }}><Icon.Check size={13} color="#fff" /></span>
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'auto', flexShrink: 0, background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.04em', padding: '13px 0', borderRadius: 15, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Start free trial</div>
        </div>
      </AppChrome>
    );
  }

  // NEW: a calm single-focus paywall — Pip hero + a "how your free trial works" 3-step timeline.
  const STEPS = [
    { day: 'Today', text: 'Full Sprout+ access unlocked', glyph: <Icon.Leaf size={14} color="#fff" />, bg: DEEP },
    { day: 'Day 5', text: 'We\u2019ll remind you the trial is ending', glyph: <Icon.Bell size={13} color="#fff" />, bg: GREEN },
    { day: 'Day 7', text: 'You\u2019ll be billed — cancel anytime before', glyph: <Icon.Check size={13} color="#fff" />, bg: '#C9BDA4' },
  ];
  const benefits = ['Unlimited hearts & water', 'No ads', 'Every Garden Tale'];

  return (
    <AppChrome top="none">
      <Header />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '0 20px 6px', minHeight: 0, overflow: 'hidden' }}>
        <div className="exp-bob" style={{ flexShrink: 0 }}><Pip size={36} mood="cheer" /></div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: DEEP, textAlign: 'center', flexShrink: 0 }}>Grow without limits</div>
        {/* three short muted benefit lines */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3px 12px', flexShrink: 0, marginTop: -1 }}>
          {benefits.map((b, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11, color: SPROUT.mute }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: GREEN }} />{b}
            </span>
          ))}
        </div>

        {/* the key element: a "How your free trial works" 3-step vertical timeline */}
        <div style={{ width: '100%', background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 16, padding: '10px 15px 5px', flexShrink: 0 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.12em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700, marginBottom: 8 }}>How your free trial works</div>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 11, position: 'relative' }}>
              {/* connector rail + marker */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>{s.glyph}</span>
                {i < STEPS.length - 1 && <span style={{ width: 3, flex: 1, minHeight: 8, background: GREEN + '55', borderRadius: 999 }} />}
              </div>
              <div style={{ flex: 1, paddingBottom: i < STEPS.length - 1 ? 6 : 1 }}>
                <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink, marginTop: 2 }}>{s.day}</div>
                <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 11, color: SPROUT.mute, lineHeight: 1.25 }}>{s.text}</div>
              </div>
            </div>
          ))}
        </div>

        {/* price line + CTA + restore */}
        <div style={{ width: '100%', marginTop: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11, color: SPROUT.mute, textAlign: 'center' }}>Free for 7 days, then $7.99/mo · cancel anytime</span>
          <div style={{ width: '100%', background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.03em', padding: '11px 0', borderRadius: 15, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Start my free trial</div>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11, color: SPROUT.mute, textDecoration: 'underline', textUnderlineOffset: 2 }}>Restore purchase</span>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Sprout+ plan picker (long benefits list + single price → two side-by-side plan cards) ──
function ProposedPlanPicker({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';

  const Header = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '12px 16px 4px', flexShrink: 0 }}>
      <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#fff', border: '1.5px solid ' + SPROUT.line, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.5" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19" /></svg>
      </span>
    </div>
  );

  if (!isNew) {
    // CURRENT: a long stacked benefits list + a single price/CTA — no side-by-side plans.
    const perks = [
      ['Unlimited water', 'Never run dry mid-lesson.'],
      ['No ads', 'Zero interruptions between lessons.'],
      ['Streak repair', 'Mend a broken streak and keep growing.'],
      ['Unlimited practice', 'Review as much as you like, no caps.'],
      ['Every Garden Tale', 'Unlock the full story library.'],
    ];
    return (
      <AppChrome top="none">
        <Header />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: '2px 18px 14px', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 19, color: DEEP, flexShrink: 0 }}>Go Sprout+</div>
          {perks.map(([t, c], i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Check size={11} color={DEEP} /></span>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: SPROUT.ink }}>{t}</span>
              </div>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 11, color: SPROUT.mute, lineHeight: 1.35, paddingLeft: 25 }}>{c}</span>
            </div>
          ))}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11.5, color: SPROUT.mute }}>$5.99/mo</span>
            <div style={{ width: '100%', background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.03em', padding: '12px 0', borderRadius: 15, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Start free trial</div>
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: two clear plan cards + one calm CTA.
  const PlanCard = ({ name, price, sub, tag, selected }) => (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 11, background: selected ? '#EAF6E2' : '#FFFDF7', border: '2px solid ' + (selected ? DEEP : SPROUT.line), borderRadius: 16, padding: '13px 14px', boxShadow: selected ? '0 3px 0 ' + GREEN + '55' : 'none' }}>
      {/* radio */}
      <span style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 1, border: '2px solid ' + (selected ? DEEP : SPROUT.line), background: selected ? DEEP : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {selected && <Icon.Check size={12} color="#fff" />}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* name + price on one row */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14.5, color: SPROUT.ink }}>{name}</span>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: selected ? DEEP : SPROUT.ink, flexShrink: 0 }}>{price}</span>
        </div>
        {tag && <div style={{ marginTop: 4 }}><span style={{ display: 'inline-block', fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.06em', textTransform: 'uppercase', color: DEEP, fontWeight: 700, background: '#fff', border: '1px solid ' + GREEN + '88', borderRadius: 999, padding: '2px 7px', whiteSpace: 'nowrap' }}>{tag}</span></div>}
        {sub && <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 10.5, color: SPROUT.mute, marginTop: 3 }}>{sub}</div>}
      </div>
    </div>
  );

  return (
    <AppChrome top="none">
      <Header />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11, padding: '0 18px 8px', minHeight: 0, overflow: 'hidden' }}>
        <div className="exp-bob" style={{ flexShrink: 0 }}><Pip size={44} mood="cheer" /></div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: DEEP, textAlign: 'center', flexShrink: 0 }}>Grow faster with Sprout+</div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 9, flexShrink: 0 }}>
          <PlanCard name="Annual" price="$39.99" sub="$3.33/mo · billed yearly" tag="Best value · Save 40%" selected />
          <PlanCard name="Monthly" price="$5.99" sub="billed monthly" selected={false} />
        </div>

        <div style={{ width: '100%', marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ width: '100%', background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.03em', padding: '13px 0', borderRadius: 15, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Start 7-day free trial</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12, color: SPROUT.mute }}>Maybe later</span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12, color: SPROUT.mute, textDecoration: 'underline', textUnderlineOffset: 2 }}>Restore purchase</span>
          </div>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 10.5, color: SPROUT.mute }}>Cancel anytime · No charge today</span>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Golden Bloom monthly challenge tracker (prize-only → filling bloom + progress + reward preview) ──
function ProposedGoldenBloomTracker({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e', GOLD = '#E5A93A';

  if (!isNew) {
    // CURRENT: prize + CTA, no progress sense.
    return (
      <AppChrome top="hud" nav="home">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 13, padding: '18px 22px', minHeight: 0 }}>
          <span style={{ width: 92, height: 92, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 50% 42%, #FBF1DA 0%, #EAF6E2 60%, #FFFDF7 100%)', border: '2px solid ' + GREEN + '66' }}>
            <span style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(160deg,#F6D278,' + GOLD + ')', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 9px -2px ' + GOLD + 'aa' }}><Icon.Leaf size={28} color="#fff" /></span>
          </span>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 19, color: DEEP, textAlign: 'center' }}>June Golden Bloom</div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 12, color: SPROUT.mute, textAlign: 'center', maxWidth: 210, lineHeight: 1.4 }}>Water your garden this month to earn the Golden Bloom badge.</div>
          <div style={{ width: '100%', marginTop: 4, background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.04em', padding: '13px 0', borderRadius: 15, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>View challenge</div>
        </div>
      </AppChrome>
    );
  }

  // NEW: filling bloom badge + progress line + reward preview + calm CTA.
  const DAYS = 12, TOTAL = 30, pct = DAYS / TOTAL;
  // petal fill: a conic-style golden fill behind the bloom
  return (
    <AppChrome top="hud" nav="home">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '16px 22px', minHeight: 0 }}>
        {/* hero bloom badge that fills as the month progresses */}
        <div style={{ position: 'relative', width: 104, height: 104, flexShrink: 0 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'conic-gradient(' + GOLD + ' ' + (pct * 360) + 'deg, #EFE6D0 ' + (pct * 360) + 'deg)' }} />
          <div style={{ position: 'absolute', inset: 7, borderRadius: '50%', background: '#FFFDF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(160deg,#F6D278,' + GOLD + ')', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 9px -2px ' + GOLD + 'aa' }}><Icon.Leaf size={28} color="#fff" /></span>
          </div>
        </div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: DEEP, textAlign: 'center' }}>June Golden Bloom</div>

        {/* one quiet progress line + slim bar */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>{DAYS} / {TOTAL} days watered</span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11, color: SPROUT.mute }}>{TOTAL - DAYS} to go</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}>
            <div style={{ width: (pct * 100) + '%', height: '100%', borderRadius: 999, background: GREEN }} />
          </div>
        </div>

        {/* reward preview row */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '9px 12px' }}>
          <span style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: '#FBF1DA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Leaf size={15} color={GOLD} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Blooming unlocks</div>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>Golden Bloom badge + 100 seeds</div>
          </div>
        </div>

        <div style={{ width: '100%', background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.04em', padding: '13px 0', borderRadius: 15, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Keep growing</div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Daily goal reached (ordinary lesson-complete → once-a-day filled-ring "garden watered") ──
function ProposedDailyGoalRing({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';

  if (!isNew) {
    // CURRENT: hitting the daily goal looks exactly like any single lesson finish.
    const tiles = [
      ['Total XP', '15', '#FBF1DA', <Icon.Sparkle size={14} color="#C2871B" />],
      ['Accuracy', '92%', '#EAF6E2', <Icon.Target size={14} color={DEEP} />],
    ];
    return (
      <AppChrome>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 13, padding: '18px', minHeight: 0 }}>
          <div className="exp-bob"><Pip size={62} mood="cheer" /></div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 21, color: SPROUT.greenDark }}>Lesson complete!</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FBF1DA', borderRadius: 999, padding: '6px 13px' }}>
            <Icon.Sparkle size={15} color="#C2871B" />
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: '#C2871B' }}>+15 XP</span>
          </div>
          <div style={{ display: 'flex', gap: 9, width: '100%', maxWidth: 252 }}>
            {tiles.map(([lab, val, c, ic]) => (
              <div key={lab} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: '#FFFDF8', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '11px 6px' }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: c, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ic}</span>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: SPROUT.ink }}>{val}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '.08em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>{lab}</span>
              </div>
            ))}
          </div>
          <div style={{ width: '100%', maxWidth: 252, background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.08em', padding: '12px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>CONTINUE</div>
          {/* at most a tiny leaf toast — the day's real win passes by */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, opacity: 0.9 }}>
            <Icon.Leaf size={12} color={GREEN} />
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 10.5, color: SPROUT.mute }}>Daily goal 3/3</span>
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: a calm once-a-day filled-ring payoff — the daily watering goal, garden-watered metaphor.
  const RING = 132;
  return (
    <AppChrome>
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 22px 16px', minHeight: 0, overflow: 'hidden' }}>
        {/* close button, top-left */}
        <div style={{ alignSelf: 'flex-start', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, width: '100%', minHeight: 0 }}>
          {/* the single filled green goal ring with a soft check at center */}
          <div style={{ position: 'relative', width: RING, height: RING, flexShrink: 0 }}>
            <div aria-hidden style={{ position: 'absolute', inset: -10, borderRadius: '50%', background: 'radial-gradient(circle, ' + GREEN + '40 0%, ' + GREEN + '00 70%)' }} />
            {/* filled ring (3/3 = full) */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'conic-gradient(' + GREEN + ' 360deg, #E6EFD9 0deg)' }} />
            <div style={{ position: 'absolute', inset: 13, borderRadius: '50%', background: '#FFFDF7', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 8px -4px rgba(42,35,32,.25)' }}>
              <span style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(160deg,#8FD47C,' + DEEP + ')', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px -3px ' + DEEP + 'aa' }}>
                <Icon.Check size={32} color="#fff" />
              </span>
            </div>
            {/* quiet 3/3 lessons label pinned under the ring */}
            <div style={{ position: 'absolute', left: '50%', bottom: -7, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 999, padding: '2px 10px', whiteSpace: 'nowrap' }}>
              <Icon.Leaf size={11} color={DEEP} />
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: DEEP }}>3 / 3 lessons</span>
            </div>
          </div>

          {/* Pip beside a little watering can */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, flexShrink: 0, marginTop: 4 }}>
            <span className="exp-bob"><Pip size={48} mood="cheer" /></span>
            {/* watering can */}
            <svg width="40" height="34" viewBox="0 0 48 40" fill="none" style={{ marginBottom: 2 }}>
              <path d="M10 16 h20 a3 3 0 0 1 3 3 v9 a6 6 0 0 1 -6 6 h-14 a6 6 0 0 1 -6 -6 v-9 a3 3 0 0 1 3 -3 z" fill={GREEN} stroke={DEEP} strokeWidth="1.5" />
              <path d="M30 18 l11 -5" stroke={DEEP} strokeWidth="3" strokeLinecap="round" />
              <path d="M14 16 a6 6 0 0 1 11 0" stroke={DEEP} strokeWidth="2.2" fill="none" strokeLinecap="round" />
              {/* water drops from the spout */}
              <circle cx="42" cy="17" r="1.6" fill="#8FD47C" />
              <circle cx="44" cy="21" r="1.3" fill="#8FD47C" />
            </svg>
          </div>

          {/* headline */}
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 21, color: DEEP, textAlign: 'center', lineHeight: 1.12, flexShrink: 0 }}>Your garden&rsquo;s watered for today</div>
          {/* subtitle */}
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 12.5, color: SPROUT.mute, textAlign: 'center', maxWidth: 250, lineHeight: 1.45, flexShrink: 0 }}>Daily goal complete — come back tomorrow to keep it growing.</div>
        </div>

        {/* single full-width calm CTA */}
        <div style={{ width: '100%', flexShrink: 0, background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, letterSpacing: '.05em', padding: '14px 0', borderRadius: 15, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Keep growing</div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Golden Bloom complete (tracker ticks to 100% in place → dedicated claim celebration) ──
function ProposedGoldenBloomComplete({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e', GOLD = '#E5A93A', SKY = '#5BB4D9';

  // CURRENT: the Golden Bloom tracker simply reads 100% in place — full app chrome,
  // no celebration, no claim. A month of effort ends with a shrug.
  if (!isNew) {
    const DAYS = 30, TOTAL = 30, pct = 1;
    return (
      <AppChrome top="hud" nav="home">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '16px 22px', minHeight: 0 }}>
          <div style={{ position: 'relative', width: 104, height: 104, flexShrink: 0 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'conic-gradient(' + GOLD + ' ' + (pct * 360) + 'deg, #EFE6D0 ' + (pct * 360) + 'deg)' }} />
            <div style={{ position: 'absolute', inset: 7, borderRadius: '50%', background: '#FFFDF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(160deg,#F6D278,' + GOLD + ')', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 9px -2px ' + GOLD + 'aa' }}><Icon.Leaf size={28} color="#fff" /></span>
            </div>
          </div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: DEEP, textAlign: 'center' }}>June Golden Bloom</div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>{DAYS} / {TOTAL} days watered</span>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11, color: SPROUT.mute }}>0 to go</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: 999, background: GREEN }} />
            </div>
          </div>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '9px 12px' }}>
            <span style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: '#FBF1DA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Leaf size={15} color={GOLD} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Blooming unlocks</div>
              <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>Golden Bloom badge + 250 seeds</div>
            </div>
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: a dedicated claim celebration — iOS status bar only (HUD + nav intentionally hidden).
  const petals = [
    { l: '11%', t: '13%', s: 9, c: '#F6D278', r: -20 }, { l: '80%', t: '10%', s: 11, c: '#F2C879', r: 25 },
    { l: '29%', t: '7%', s: 7, c: '#B7E3A6', r: 40 }, { l: '67%', t: '17%', s: 8, c: '#F6D278', r: -35 },
    { l: '18%', t: '26%', s: 7, c: '#F2C879', r: 15 }, { l: '87%', t: '30%', s: 9, c: '#B7E3A6', r: -25 },
  ];
  const tiles = [
    { head: 'Days', headBg: GOLD, icon: <Icon.Calendar size={19} color={GOLD} />, value: '30/30' },
    { head: 'Seeds', headBg: DEEP, icon: <Icon.Sparkle size={19} color="#E0A21C" />, value: '+250' },
    { head: 'Tier', headBg: SKY, icon: <Icon.Crown size={19} color={GOLD} />, value: 'Gold Gardener', small: true },
  ];

  return (
    <AppChrome>
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 20px 16px', minHeight: 0, overflow: 'hidden' }}>
        {/* (1) close button, top-left */}
        <div style={{ alignSelf: 'flex-start', width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </div>

        {/* floating petals */}
        {petals.map((p, i) => (
          <span key={i} aria-hidden style={{ position: 'absolute', left: p.l, top: p.t, width: p.s, height: p.s, borderRadius: '50% 0 50% 50%', background: p.c, transform: 'rotate(' + p.r + 'deg)', opacity: 0.7 }} />
        ))}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', minHeight: 0 }}>
          {/* (2) hero: Golden Bloom in full bloom + Pip celebrating beside it */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 4, flexShrink: 0, marginBottom: 2 }}>
            <span style={{ position: 'relative', width: 116, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* soft glow */}
              <span aria-hidden style={{ position: 'absolute', inset: -8, borderRadius: '50%', background: 'radial-gradient(circle, ' + GOLD + '55 0%, ' + GOLD + '00 68%)' }} />
              {/* eight gold petals in full bloom */}
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', width: 26, height: 38, marginLeft: -13, marginTop: -19, transformOrigin: '50% 100%', transform: 'rotate(' + (i * 45) + 'deg) translateY(-22px)', borderRadius: '50% 50% 50% 50% / 64% 64% 36% 36%', background: 'linear-gradient(180deg,#FBE08A,' + GOLD + ')', boxShadow: 'inset 0 -3px 6px -2px ' + GOLD + '88' }} />
              ))}
              {/* warm center disc */}
              <span style={{ position: 'relative', width: 40, height: 40, borderRadius: '50%', background: 'radial-gradient(circle at 50% 40%, #FBEFC6, #E59B2E)', boxShadow: '0 2px 7px -1px ' + GOLD + 'aa, inset 0 -3px 6px -2px #C9852088', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon.Leaf size={18} color="#fff" />
              </span>
            </span>
            <span className="exp-bob" style={{ flexShrink: 0, marginBottom: 4 }}><Pip size={42} mood="cheer" /></span>
          </div>

          {/* (3) date chip */}
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F3EEE2', borderRadius: 999, padding: '4px 11px', flexShrink: 0 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, fontWeight: 700, letterSpacing: '.16em', color: SPROUT.mute }}>JUNE 2026</span>
          </span>

          {/* (4) headline */}
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 21, color: DEEP, textAlign: 'center', lineHeight: 1.1, flexShrink: 0 }}>Golden Bloom, complete!</div>
          {/* (5) subtitle */}
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 12.5, color: SPROUT.mute, textAlign: 'center', maxWidth: 230, lineHeight: 1.4, flexShrink: 0 }}>You watered your garden all 30 days.</div>

          {/* (6) three Duolingo-style stat tiles — colored header tab + white body */}
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 9, width: '100%', maxWidth: 290, marginTop: 3, flexShrink: 0 }}>
            {tiles.map((t, i) => (
              <div key={i} style={{ flex: 1, minWidth: 0, borderRadius: 14, overflow: 'hidden', border: '1.5px solid ' + SPROUT.line, background: '#fff', boxShadow: '0 3px 0 ' + SPROUT.cream2 }}>
                <div style={{ background: t.headBg, textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#fff', padding: '5px 0' }}>{t.head}</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '10px 4px 11px' }}>
                  <span style={{ display: 'flex' }}>{t.icon}</span>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: t.small ? 10.5 : 15, color: SPROUT.ink, textAlign: 'center', lineHeight: 1.05 }}>{t.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* (7) full-width claim CTA */}
        <div style={{ width: '100%', flexShrink: 0, background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14.5, letterSpacing: '.06em', padding: '14px 0', borderRadius: 15, boxShadow: '0 4px 0 ' + SPROUT.greenShadow, position: 'relative' }}>CLAIM REWARD</div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Tap a word to study it (words list → word-detail bottom sheet over dimmed list) ──
function ProposedWordDetail({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';
  const words = [
    { w: 'Trellis', g: 'a frame for climbing plants' },
    { w: 'Meadow', g: 'a field of grass and flowers' },
    { w: 'Harvest', g: 'to gather a ripe crop' },
    { w: 'Sprout', g: 'to begin to grow; a shoot' },
    { w: 'Blossom', g: 'a flower or mass of flowers' },
  ];
  const SpeakerIcon = ({ s = 13 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="1.5" strokeLinejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5z" fill={DEEP} stroke="none" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /></svg>
  );
  const List = ({ dim }) => (
    <div style={{ display: 'flex', flexDirection: 'column', opacity: dim ? 0.4 : 1 }}>
      {words.map((it, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 2px', borderBottom: '1px solid ' + SPROUT.line }}>
          <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SpeakerIcon /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink }}>{it.w}</div>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 11, color: SPROUT.mute, marginTop: 1 }}>{it.g}</div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!isNew) {
    return (
      <AppChrome top="hud" nav="book">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, padding: '13px 16px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Words</div>
          <List />
        </div>
      </AppChrome>
    );
  }

  // NEW: same list dimmed, with a calm word-detail bottom sheet raised over it.
  const Drop = ({ filled }) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? DEEP : 'none'} stroke={filled ? DEEP : SPROUT.line} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3s5 5.6 5 9a5 5 0 0 1-10 0c0-3.4 5-9 5-9z" /></svg>
  );
  return (
    <AppChrome top="hud" nav="book">
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, padding: '13px 16px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink, opacity: 0.4 }}>Words</div>
          <List dim />
        </div>
        {/* dim scrim */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(42,35,32,.18)', zIndex: 1 }} />
        {/* word-detail bottom sheet */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 2, background: '#FFFDF7', borderTopLeftRadius: 22, borderTopRightRadius: 22, boxShadow: '0 -12px 30px -16px rgba(42,35,32,.45)', padding: '14px 18px 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
          <span style={{ width: 34, height: 4, borderRadius: 999, background: SPROUT.line, alignSelf: 'center', marginBottom: 2 }} />
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 24, color: SPROUT.ink, lineHeight: 1 }}>Trellis</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: SPROUT.mute, letterSpacing: '.02em' }}>/ˈtrel.ɪs/</span>
            <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><SpeakerIcon s={12} /></span>
          </div>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 13, color: '#9A8F82' }}>a frame for climbing plants</span>
          <div style={{ borderLeft: '2.5px solid ' + GREEN, paddingLeft: 11, display: 'flex', flexDirection: 'column', gap: 2, marginTop: 1 }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, color: SPROUT.ink, fontStyle: 'italic' }}>"The roses climbed the trellis by June."</span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 11, color: SPROUT.mute }}>A garden frame the roses grew up.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <span style={{ display: 'flex', gap: 4 }}>{[0, 1, 2, 3, 4].map((d) => <Drop key={d} filled={d < 3} />)}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Sprouting</span>
          </div>
          <div style={{ width: '100%', marginTop: 4, background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.04em', padding: '13px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Water this word</div>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Water-level word strength (flat words list → per-word water bars + sort + Water-your-words CTA) ──
function ProposedWordStrength({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e', YOUNG = '#C7E8B4';
  const words = [
    { w: 'Trellis', g: 'a frame for climbing plants', m: 0.22 },
    { w: 'Meadow', g: 'a field of grass and flowers', m: 0.4 },
    { w: 'Harvest', g: 'to gather a ripe crop', m: 0.55 },
    { w: 'Sprout', g: 'to begin to grow; a shoot', m: 0.8 },
    { w: 'Blossom', g: 'a flower or mass of flowers', m: 0.95 },
  ];
  const SpeakerIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="1.5" strokeLinejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5z" fill={DEEP} stroke="none" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /></svg>
  );

  if (!isNew) {
    return (
      <AppChrome top="hud" nav="book">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, padding: '13px 16px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Words</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {words.map((it, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 2px', borderBottom: '1px solid ' + SPROUT.line }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SpeakerIcon /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink }}>{it.w}</div>
                  <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 11, color: SPROUT.mute, marginTop: 1 }}>{it.g}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: top CTA + count/sort header + per-word water-level bars.
  return (
    <AppChrome top="hud" nav="book">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, padding: '11px 16px', minHeight: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 17, color: SPROUT.ink }}>Words</div>
        {/* calm top CTA — waters the weakest words first */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: SPROUT.green, color: '#fff', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, letterSpacing: '.03em', padding: '9px 0', borderRadius: 12, boxShadow: '0 3px 0 ' + SPROUT.greenShadow }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3s5 5.6 5 9a5 5 0 0 1-10 0c0-3.4 5-9 5-9z" /></svg>
          Water your words · +10 <Icon.Leaf size={13} color="#fff" />
        </div>
        {/* count + sort control */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1px 1px' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>20 words</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: SPROUT.greenDark, fontWeight: 700 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={SPROUT.greenDark} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h12M3 12h9M3 18h5M17 17l3 3 3-3M20 20V8" /></svg>
            Weakest
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {words.map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '6px 2px', borderBottom: '1px solid ' + SPROUT.line }}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SpeakerIcon /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: SPROUT.ink }}>{it.w}</div>
                <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 10, color: SPROUT.mute, marginTop: 1, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.g}</div>
                <div style={{ height: 5, borderRadius: 999, background: '#EFE6D6', overflow: 'hidden' }}>
                  <div style={{ width: (it.m * 100) + '%', height: '100%', borderRadius: 999, background: it.m > 0.7 ? DEEP : (it.m < 0.35 ? '#E9C98B' : GREEN) }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Water your weak words (flat words list → pinned "Needs water" review banner above the list) ──
function ProposedWordsNeedsWater({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e', DRY = '#E2A93F';

  // The learned-words list — IDENTICAL on both phones. Low-water words are scattered
  // (not sorted), so today you have to hunt for what's about to be forgotten.
  const words = [
    { w: 'Vine', g: 'a climbing or trailing plant stem', m: 0.16 },
    { w: 'Blossom', g: 'a flower or mass of flowers', m: 0.92 },
    { w: 'Moss', g: 'soft green growth on damp ground', m: 0.24 },
    { w: 'Harvest', g: 'to gather a ripe crop', m: 0.58 },
    { w: 'Husk', g: 'the dry outer covering of a seed', m: 0.3 },
    { w: 'Meadow', g: 'a field of grass and flowers', m: 0.74 },
  ];
  // the three driest words, surfaced in the banner peek
  const wilting = [...words].sort((a, b) => a.m - b.m).slice(0, 3);

  const SpeakerIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="1.5" strokeLinejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5z" fill={DEEP} stroke="none" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /></svg>
  );

  // ONE shared word row, used verbatim in both modes
  const Row = ({ it }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 2px', borderBottom: '1px solid ' + SPROUT.line }}>
      <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SpeakerIcon /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, color: SPROUT.ink }}>{it.w}</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 10.5, color: SPROUT.mute, marginTop: 1, marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.g}</div>
        <div style={{ height: 5, borderRadius: 999, background: '#EFE6D6', overflow: 'hidden' }}>
          <div style={{ width: (it.m * 100) + '%', height: '100%', borderRadius: 999, background: it.m > 0.7 ? DEEP : (it.m < 0.35 ? DRY : GREEN) }} />
        </div>
      </div>
    </div>
  );

  const List = () => (
    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {words.map((it, i) => <Row key={i} it={it} />)}
    </div>
  );

  // The pinned review banner — soft-green surface, drop glyph, wilting peek, one CTA
  const Banner = () => (
    <div style={{ flexShrink: 0, background: '#EDF7E5', border: '1.5px solid #CDE9BC', borderRadius: 15, padding: '11px 12px', boxShadow: '0 3px 0 #DCEFD0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
        <span style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Drop size={17} color={DEEP} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, color: SPROUT.ink, lineHeight: 1.1 }}>Needs water</div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11, color: '#5a7a4e', marginTop: 1, whiteSpace: 'nowrap' }}>5 words are running low</div>
        </div>
      </div>
      {/* quiet one-row peek of 3 wilting words with low water meters */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 10 }}>
        {wilting.map((it, i) => (
          <div key={i} style={{ flex: 1, minWidth: 0, background: '#fff', border: '1px solid #DCE9D2', borderRadius: 10, padding: '6px 8px' }}>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11, color: SPROUT.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 5 }}>{it.w}</div>
            <div style={{ height: 4, borderRadius: 999, background: '#F0E7D7', overflow: 'hidden' }}>
              <div style={{ width: (it.m * 100) + '%', height: '100%', borderRadius: 999, background: DRY }} />
            </div>
          </div>
        ))}
      </div>
      {/* single full-width deep-green CTA — launches focused review of only the low-water words */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: DEEP, color: '#fff', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, letterSpacing: '.02em', padding: '10px 0', borderRadius: 12, boxShadow: '0 3px 0 ' + SPROUT.greenShadow }}>
        <Icon.Drop size={15} color="#fff" />Water them now
      </div>
    </div>
  );

  if (!isNew) {
    return (
      <AppChrome top="hud" nav="book">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, padding: '13px 16px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Words</div>
          <List />
        </div>
      </AppChrome>
    );
  }

  return (
    <AppChrome top="hud" nav="book">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, padding: '13px 16px', minHeight: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Words</div>
        <Banner />
        <List />
      </div>
    </AppChrome>
  );
}

// ── Proposed · Words you can water (flat vocab list → per-word mastery bars + Sprouting/In-bloom summary) ──
function ProposedWordsMastery({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e', YOUNG = '#C7E8B4';
  // English vocabulary (project is English-only) — word + a short gloss, with a mastery 0..1
  const words = [
    { w: 'Blossom', g: 'a flower or mass of flowers', m: 0.95, fav: true },
    { w: 'Sprout', g: 'to begin to grow; a shoot', m: 0.8 },
    { w: 'Harvest', g: 'to gather a ripe crop', m: 0.55 },
    { w: 'Meadow', g: 'a field of grass and flowers', m: 0.4, fav: true },
    { w: 'Trellis', g: 'a frame for climbing plants', m: 0.25 },
  ];

  const Header = () => (
    <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink, marginBottom: 2 }}>Words</div>
  );

  if (!isNew) {
    // CURRENT: flat list — word + translation only, every word looks equally known.
    return (
      <AppChrome top="hud" nav="book">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, padding: '13px 16px', minHeight: 0 }}>
          <Header />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {words.map((it, i) => (
              <div key={i} style={{ padding: '10px 2px', borderBottom: '1px solid ' + SPROUT.line }}>
                <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, color: SPROUT.ink }}>{it.w}</div>
                <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 11, color: SPROUT.mute, marginTop: 1 }}>{it.g}</div>
              </div>
            ))}
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: summary strip + per-word audio, mastery bar, favourite heart.
  const Heart = ({ on }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={on ? '#F2A0A0' : 'none'} stroke={on ? '#E98B8B' : SPROUT.line} strokeWidth="2"><path d="M12 21s-7.5-4.6-10-9.2C.3 8.4 2 5 5.2 5c2 0 3.3 1.2 4.8 3 1.5-1.8 2.8-3 4.8-3C18 5 19.7 8.4 18 11.8 17.5 16.4 12 21 12 21z" /></svg>
  );
  return (
    <AppChrome top="hud" nav="book">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: '13px 16px', minHeight: 0 }}>
        <Header />
        {/* quiet summary strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '2px 2px 6px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: YOUNG }} />Sprouting <b style={{ color: SPROUT.ink, marginLeft: 1 }}>9</b>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: DEEP }} />In bloom <b style={{ color: SPROUT.ink, marginLeft: 1 }}>11</b>
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {words.map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 2px', borderBottom: '1px solid ' + SPROUT.line }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill={DEEP} stroke={DEEP} strokeWidth="1.5" strokeLinejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5z" fill={DEEP} stroke="none" /><path d="M15.5 8.5a5 5 0 0 1 0 7" fill="none" /></svg>
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, color: SPROUT.ink }}>{it.w}</div>
                <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 10.5, color: SPROUT.mute, marginTop: 1, marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.g}</div>
                <div style={{ height: 5, borderRadius: 999, background: '#EFE6D6', overflow: 'hidden' }}>
                  <div style={{ width: (it.m * 100) + '%', height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,' + YOUNG + ',' + (it.m > 0.7 ? DEEP : GREEN) + ')' }} />
                </div>
              </div>
              <span style={{ flexShrink: 0 }}><Heart on={it.fav} /></span>
            </div>
          ))}
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Focused Golden Bloom gate (busy stacked rows + 2 buttons → single-action hero) ──
function ProposedGoldenBloomGate({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e', GOLD = '#E5A93A';

  const Emblem = ({ size }) => (
    <span style={{ width: size, height: size, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 50% 42%, #FBF1DA 0%, #EAF6E2 60%, #FFFDF7 100%)', border: '2px solid ' + GREEN + '66', flexShrink: 0 }}>
      <span style={{ width: size * 0.58, height: size * 0.58, borderRadius: '50%', background: 'linear-gradient(160deg,#F6D278,' + GOLD + ')', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 9px -2px ' + GOLD + 'aa' }}>
        <Icon.Leaf size={size * 0.3} color="#fff" />
      </span>
    </span>
  );

  if (!isNew) {
    // CURRENT: emblem + stacked requirement/reward/timer rows + two buttons — busy.
    const Req = ({ icon, label, value }) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 12, padding: '9px 12px' }}>
        <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
        <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11.5, color: SPROUT.ink }}>{label}</span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11.5, color: SPROUT.mute }}>{value}</span>
      </div>
    );
    return (
      <AppChrome top="hud" nav="home">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 16px 12px', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Emblem size={50} />
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: SPROUT.ink }}>Golden Bloom</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 1 }}>
            <Req icon={<Icon.Target size={14} color={DEEP} />} label="Pass 8 questions" value="0/8" />
            <Req icon={<Icon.Leaf size={14} color={DEEP} />} label="Reward" value="50 seeds" />
            <Req icon={<Icon.Clock size={14} color={DEEP} />} label="Time limit" value="5 min" />
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div style={{ background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, letterSpacing: '.04em', padding: '11px 0', borderRadius: 13, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Start challenge</div>
            <div style={{ textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11.5, color: SPROUT.mute }}>How it works</div>
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: one glowing emblem, one promise, one reward chip, one Start button.
  return (
    <AppChrome top="hud" nav="home">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '14px 22px', minHeight: 0 }}>
        <Emblem size={80} />
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 20, color: DEEP, textAlign: 'center', lineHeight: 1.2 }}>Earn the Golden Bloom</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 12, color: SPROUT.mute, textAlign: 'center', lineHeight: 1.4, maxWidth: 220 }}>Ace this 8-question mastery round to turn this unit gold.</div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FBF1DA', border: '1.5px solid #E8D6A8', borderRadius: 999, padding: '6px 13px' }}>
          <Icon.Leaf size={13} color={GOLD} />
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 11.5, color: '#A87C1B' }}>Golden Bloom + 50 seeds</span>
        </span>
        <div style={{ width: '100%', marginTop: 2, background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.04em', padding: '13px 0', borderRadius: 15, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Start mastery</div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Shop sectioned shelves (flat run → Refills/Boosts/Décor card grids + POPULAR) ──
function ProposedShopShelves({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GEM = '#6C8AE4', WATER = '#2E8FB0';

  const BalancePill = () => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 999, padding: '4px 11px 4px 9px' }}>
      <Icon.Gem size={13} color={GEM} />
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>420</span>
    </span>
  );

  if (!isNew) {
    // CURRENT: one flat ungrouped run of item cards.
    const items = [
      ['💧', 'Water refill', 30], ['🪣', 'Water pack', 40], ['✨', 'Double seeds', 90],
      ['⏱️', 'Timer boost', 60], ['🪴', 'Plant pot', 200], ['🌸', 'Rare bloom', 350],
    ];
    return (
      <AppChrome top="hud" nav="me">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 14px', minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</span>
            <BalancePill />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {items.map(([g, n, p], i) => (
              <div key={i} style={{ background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '11px 6px 9px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 22 }}>{g}</span>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 10.5, color: SPROUT.ink, textAlign: 'center', lineHeight: 1.15 }}>{n}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon.Gem size={11} color={GEM} /><span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: SPROUT.ink }}>{p}</span></span>
              </div>
            ))}
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: labeled sections, each a tidy card grid; one POPULAR tab.
  const Card = ({ icon, tint, name, price, cur, popular }) => (
    <div style={{ position: 'relative', background: '#fff', border: '1.5px solid ' + (popular ? SPROUT.green + '88' : SPROUT.line), borderRadius: 14, padding: '11px 6px 9px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      {popular && <span style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, color: '#fff', background: SPROUT.green, borderRadius: 5, padding: '2px 6px' }}>Popular</span>}
      <span style={{ width: 30, height: 30, borderRadius: '50%', background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 10, color: SPROUT.ink, textAlign: 'center', lineHeight: 1.15 }}>{name}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>{cur === 'water' ? <Icon.Droplet size={11} color={WATER} /> : <Icon.Gem size={11} color={GEM} />}<span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: SPROUT.ink }}>{price}</span></span>
    </div>
  );
  const Section = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, paddingLeft: 3 }}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>{children}</div>
    </div>
  );

  return (
    <AppChrome top="hud" nav="me">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px 6px', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Shop</span>
          <BalancePill />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, padding: '4px 14px 10px', minHeight: 0 }}>
          <Section label="Refills">
            <Card icon={<Icon.Droplet size={16} color={WATER} />} tint="#E5F2F8" name="Water refill" price="30" cur="water" />
            <Card icon={<Icon.Droplet size={16} color={WATER} />} tint="#E5F2F8" name="Water pack" price="40" cur="water" popular />
          </Section>
          <Section label="Boosts">
            <Card icon={<Icon.Sparkle size={16} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Double seeds" price="90" cur="gems" />
            <Card icon={<Icon.Clock size={16} color={SPROUT.greenDark} />} tint="#EAF6E2" name="Timer boost" price="60" cur="gems" />
          </Section>
          <Section label="Garden décor">
            <Card icon={<Icon.Plant size={16} color={SPROUT.greenDark} />} tint="#FBF1DA" name="Plant pot" price="200" cur="gems" />
            <Card icon={<Icon.Leaf size={16} color={SPROUT.greenDark} />} tint="#FBF1DA" name="Rare bloom" price="350" cur="gems" />
          </Section>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Pick up where you left off (add a resume hero card atop the unchanged path) ──
function ProposedResumeCard({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';

  // a compact winding-path snippet, identical in both modes
  const PathSnippet = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: SPROUT.green, boxShadow: '0 4px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: .92, marginLeft: -40 }}>
        <Icon.Check size={20} color="#fff" />
      </div>
      <div style={{ width: 0, height: 16, borderLeft: '3px dotted ' + SPROUT.cream2 }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ background: '#fff', color: SPROUT.greenDark, fontWeight: 900, fontSize: 10, letterSpacing: '.16em', padding: '4px 11px', borderRadius: 999, marginBottom: 7, boxShadow: '0 4px 12px -5px rgba(42,35,32,.3)' }}>START</div>
        <div style={{ width: 54, height: 54, borderRadius: '50%', background: SPROUT.green, boxShadow: '0 5px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.Leaf size={25} color="#fff" />
        </div>
      </div>
      <div style={{ width: 0, height: 16, borderLeft: '3px dotted ' + SPROUT.cream2 }} />
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#EDE4D2', boxShadow: '0 4px 0 #D9CDB5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 44 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B6A98E" strokeWidth="2.4"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round"/></svg>
      </div>
    </div>
  );

  return (
    <AppChrome top="hud" nav="home">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11, padding: '12px 16px', minHeight: 0, overflow: 'hidden' }}>
        {/* NEW only: resume hero card pinned at the top */}
        {isNew && (
          <div style={{ background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 16, padding: '11px', boxShadow: '0 3px 10px -6px rgba(42,35,32,.25)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <span style={{ width: 44, height: 44, borderRadius: 13, flexShrink: 0, background: 'linear-gradient(160deg,#EAF6E2,#D4EDC6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Leaf size={22} color={DEEP} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.12em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700 }}>Unit 1 · Sprout Basics</div>
                <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, color: SPROUT.ink, marginTop: 1 }}>Lesson 3 · Greetings</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 6 }}>
                  <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}>
                    <div style={{ width: '25%', height: '100%', borderRadius: 999, background: GREEN }} />
                  </div>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 9.5, color: SPROUT.mute }}>2/8</span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 9, background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, letterSpacing: '.06em', padding: '10px 0', borderRadius: 13, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Continue</div>
          </div>
        )}
        {/* the path — identical in both modes */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0 }}>
          <PathSnippet />
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Tap a tricky word for its meaning (plain prompt → dotted-underline words + tap-to-reveal popover) ──
function ProposedWordHint({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const DEEP = '#3fa52e', GREEN = '#6fbf5e';

  const SpeakerGlyph = ({ s = 12, c = DEEP }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /></svg>
  );

  // answer options for "choose the meaning" — IDENTICAL on both phones; one selected.
  const opts = [
    { label: 'careful and hard-working', sel: true },
    { label: 'lazy and slow', sel: false },
    { label: 'cheerful and loud', sel: false },
    { label: 'tired and weak', sel: false },
  ];

  // the prompt sentence as tokens; on NEW two words carry a quiet dotted underline.
  const Prompt = () => {
    const Word = ({ children }) => (
      <span style={{
        borderBottom: '2px dotted ' + DEEP, paddingBottom: 1,
        color: SPROUT.ink, fontWeight: 900,
      }}>{children}</span>
    );
    return (
      <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end', gap: '6px 6px', fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 18, color: SPROUT.ink, lineHeight: 1.6, padding: '0 4px' }}>
        <span>The</span>
        {isNew ? <span style={{ position: 'relative' }}>
          <Word>diligent</Word>
          {/* calm popover anchored under the word */}
          <span style={{ position: 'absolute', top: 'calc(100% + 9px)', left: '50%', transform: 'translateX(-50%)', zIndex: 5, width: 168, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, boxShadow: '0 10px 26px -10px rgba(42,35,32,.45)', padding: '9px 11px', textAlign: 'left' }}>
            {/* upward caret */}
            <span aria-hidden style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 11, height: 11, background: '#FFFDF7', borderLeft: '1.5px solid ' + SPROUT.line, borderTop: '1.5px solid ' + SPROUT.line }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: DEEP }}>diligent</span>
              <span style={{ width: 19, height: 19, borderRadius: '50%', background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SpeakerGlyph s={11} /></span>
            </div>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 11.5, color: SPROUT.mute, lineHeight: 1.35 }}>careful and hard-working</div>
          </span>
        </span> : <span>diligent</span>}
        <span>gardener tends her</span>
        {isNew ? <Word>plot</Word> : <span>plot</span>}
        <span>.</span>
      </div>
    );
  };

  return (
    <AppChrome top="exercise">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: '14px 18px 18px', minHeight: 0 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, textAlign: 'center', flexShrink: 0 }}>What does “diligent” mean?</div>
        <div style={{ paddingTop: 6, paddingBottom: isNew ? 56 : 6, flexShrink: 0 }}><Prompt /></div>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 9 }}>
          {opts.map((o, i) => {
            const on = o.sel;
            const st = on
              ? { background: '#EAF6E2', border: '2px solid ' + SPROUT.green, boxShadow: '0 8px 16px -9px rgba(79,158,63,.5), 0 3px 0 ' + SPROUT.greenShadow }
              : { background: '#fff', border: '2px solid ' + SPROUT.line, boxShadow: '0 3px 0 ' + SPROUT.cardShadow };
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, borderRadius: 14, padding: '12px 14px', position: 'relative', ...st }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, border: '2px solid ' + (on ? SPROUT.green : SPROUT.line), background: on ? SPROUT.green : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && <Icon.Check size={11} color="#fff" />}</span>
                <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13.5, color: on ? SPROUT.greenDark : SPROUT.ink }}>{o.label}</span>
              </div>
            );
          })}
        </div>
        <div style={{ flexShrink: 0, background: SPROUT.green, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, padding: '12px 0', borderRadius: 14, boxShadow: '0 4px 0 ' + SPROUT.greenShadow, letterSpacing: '.08em' }}>CHECK</div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Find a word in your garden (flat Words list → pinned search + Recent w/ inline meanings) ──
function ProposedWordSearch({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const DEEP = '#3fa52e', GREEN = '#6fbf5e', DRY = '#E2A93F';

  const SpeakerIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="1.5" strokeLinejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5z" fill={DEEP} stroke="none" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /></svg>
  );

  // the full learned-words list — IDENTICAL on both phones.
  const words = [
    { w: 'Trellis', g: 'a frame for climbing plants', m: 0.6 },
    { w: 'Seedling', g: 'a young plant grown from seed', m: 0.85 },
    { w: 'Harvest', g: 'to gather a ripe crop', m: 0.5 },
    { w: 'Meadow', g: 'a field of grass and flowers', m: 0.74 },
    { w: 'Compost', g: 'decayed matter that feeds soil', m: 0.45 },
    { w: 'Blossom', g: 'a flower or mass of flowers', m: 0.9 },
  ];

  // three water-level dots, filled to strength
  const Dots = ({ m }) => {
    const filled = m > 0.7 ? 3 : (m < 0.4 ? 1 : 2);
    const col = m > 0.7 ? DEEP : (m < 0.4 ? DRY : GREEN);
    return (
      <span style={{ display: 'inline-flex', gap: 3, flexShrink: 0, alignItems: 'center' }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i < filled ? col : '#E7DFCE' }} />
        ))}
      </span>
    );
  };

  // the plain learned-words row (full list)
  const ListRow = ({ it }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 2px', borderBottom: '1px solid ' + SPROUT.line }}>
      <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SpeakerIcon /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, color: SPROUT.ink }}>{it.w}</div>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 10.5, color: SPROUT.mute, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.g}</div>
      </div>
      <Dots m={it.m} />
    </div>
  );

  // a search-result style row: word + inline meaning + water-level dots
  const SearchRow = ({ it }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', background: '#fff', border: '1.5px solid ' + SPROUT.line, borderRadius: 12 }}>
      <span style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SpeakerIcon /></span>
      <div style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12.5, color: SPROUT.ink }}>{it.w}</span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 11, color: SPROUT.mute }}> — {it.g}</span>
      </div>
      <Dots m={it.m} />
    </div>
  );

  if (!isNew) {
    // CURRENT: one long scrollable list, no way to jump to a word.
    return (
      <AppChrome top="hud" nav="book">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, padding: '13px 16px', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink }}>Words</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {words.map((it, i) => <ListRow key={i} it={it} />)}
          </div>
        </div>
      </AppChrome>
    );
  }

  // NEW: pinned search field + Recent group + a small "water your weak words" group.
  const recent = [
    { w: 'Seedling', g: 'young plant', m: 0.85 },
    { w: 'Harvest', g: 'gather a crop', m: 0.5 },
    { w: 'Trellis', g: 'climbing frame', m: 0.6 },
  ];
  const weak = [
    { w: 'Compost', g: 'feeds the soil', m: 0.28 },
    { w: 'Furrow', g: 'a soil cut', m: 0.2 },
  ];
  const GroupLabel = ({ children }) => (
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700, padding: '0 2px' }}>{children}</div>
  );

  return (
    <AppChrome top="hud" nav="book">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 16px', minHeight: 0, overflow: 'hidden' }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.ink, flexShrink: 0 }}>Words</div>
        {/* pinned cream search field — resting/empty state */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, padding: '10px 13px', flexShrink: 0, boxShadow: '0 2px 0 ' + SPROUT.cream2 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 12.5, color: SPROUT.mute, whiteSpace: 'nowrap' }}>Find a word in your garden</span>
        </div>

        {/* Recent group */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          <GroupLabel>Recent</GroupLabel>
          {recent.map((it, i) => <SearchRow key={i} it={it} />)}
        </div>

        {/* suggested: water your weak words */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          <GroupLabel>Water your weak words</GroupLabel>
          {weak.map((it, i) => <SearchRow key={i} it={it} />)}
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Settings, grouped and scannable (flat ungrouped run → grouped iOS-style settings) ──
// A pushed sub-screen: status bar (from the frame) + a "‹ Settings" nav header are the
// ONLY chrome — no HUD row, no bottom tab bar (correct for this nav level). CURRENT is a
// flat ungrouped list with unguarded Sign out; NEW groups rows, shows inline values, calm
// green toggles, and a separated clay Sign out.
function ProposedSettingsGrouped({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e', CLAY = '#ff8a80';

  // the shared "‹ Settings" nav header — byte-identical on both phones
  const NavHeader = () => (
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px 10px', borderBottom: '1px solid ' + SPROUT.line }}>
      <Icon.ChevL size={20} color={SPROUT.ink} />
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 17, color: SPROUT.ink }}>Settings</span>
    </div>
  );

  const Toggle = ({ on }) => (
    <span style={{ width: 34, height: 20, borderRadius: 999, background: on ? GREEN : '#D8CFBE', position: 'relative', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 2, left: on ? 16 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.2)' }} />
    </span>
  );

  if (!isNew) {
    // CURRENT: a flat, ungrouped run — no section headers, no inline values, every row
    // the same weight, and "Sign out" sitting unguarded in the same list.
    const rows = ['Edit profile', 'Daily goal', 'Reminders', 'Sound effects', 'Haptics', 'Motivational messages', 'Speaking exercises', 'Listening exercises', 'Golden Bloom', 'App language', 'Help center', 'Privacy policy', 'Sign out'];
    return (
      <React.Fragment>
        <NavHeader />
        <div style={{ flex: 1, padding: '6px 16px 14px', minHeight: 0, overflow: 'hidden' }}>
          {rows.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 2px', borderBottom: i < rows.length - 1 ? '1px solid ' + SPROUT.line : 'none' }}>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 13, color: SPROUT.ink }}>{r}</span>
              <Icon.ChevR size={15} color={SPROUT.line} />
            </div>
          ))}
        </div>
      </React.Fragment>
    );
  }

  // NEW: a calm, grouped iOS-style settings screen.
  const GroupLabel = ({ children }) => (
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700, padding: '0 4px 6px' }}>{children}</div>
  );
  const Card = ({ children }) => (
    <div style={{ background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 13, overflow: 'hidden' }}>{children}</div>
  );
  const Row = ({ label, value, toggle, on, last }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 12px', borderBottom: last ? 'none' : '1px solid ' + SPROUT.line }}>
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, color: SPROUT.ink }}>{label}</span>
      {toggle ? <Toggle on={on} /> : (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {value && <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11.5, color: SPROUT.mute }}>{value}</span>}
          <Icon.ChevR size={14} color={SPROUT.line} />
        </span>
      )}
    </div>
  );

  return (
    <React.Fragment>
      <NavHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 13, padding: '12px 16px 14px', minHeight: 0, overflow: 'hidden' }}>
        {/* editable identity row pinned at the top */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '11px 13px' }}>
          <span style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Pip size={30} mood="cheer" /></span>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 15, color: SPROUT.ink }}>Xip</span>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 11, color: SPROUT.mute }}>@xipgrows</span>
          </div>
          <Icon.ChevR size={16} color={SPROUT.mute} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <GroupLabel>Account</GroupLabel>
          <Card>
            <Row label="Email & login" />
            <Row label="App language" value="🇺🇸" last />
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <GroupLabel>Daily habit</GroupLabel>
          <Card>
            <Row label="Daily goal" value="3 lessons" />
            <Row label="Reminder" value="9:00 PM" last />
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <GroupLabel>Sound &amp; motion</GroupLabel>
          <Card>
            <Row label="Sound effects" toggle on />
            <Row label="Haptics" toggle on />
            <Row label="Motivational messages" toggle on last />
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <GroupLabel>Practice</GroupLabel>
          <Card>
            <Row label="Speaking exercises" toggle on />
            <Row label="Listening exercises" toggle on last />
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <GroupLabel>Golden Bloom</GroupLabel>
          <Card>
            <Row label="Golden Bloom" value="Manage" last />
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <GroupLabel>Support</GroupLabel>
          <Card>
            <Row label="Help center" />
            <Row label="Privacy policy" last />
          </Card>
        </div>

        {/* one quiet, separated clay Sign out — set apart so it's never hit by accident */}
        <div style={{ marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1.5px solid ' + CLAY, borderRadius: 13, padding: '11px 0' }}>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: CLAY }}>Sign out</span>
        </div>
      </div>
    </React.Fragment>
  );
}

// ── Proposed · Tunable watering reminders (lone buried Notifications row → grouped reminders sub-screen) ──
function ProposedReminderSettings({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';

  const NavHeader = ({ title }) => (
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px 10px', borderBottom: '1px solid ' + SPROUT.line }}>
      <Icon.ChevL size={20} color={SPROUT.ink} />
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 17, color: SPROUT.ink }}>{title}</span>
    </div>
  );
  const Toggle = ({ on }) => (
    <span style={{ width: 34, height: 20, borderRadius: 999, background: on ? GREEN : '#D8CFBE', position: 'relative', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 2, left: on ? 16 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.2)' }} />
    </span>
  );
  const DropGlyph = ({ c = DEEP, s = 15 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 3 C12 3 5 11 5 15.5 a7 7 0 0 0 14 0 C19 11 12 3 12 3 Z" fill={c} opacity="0.9" /></svg>
  );

  if (!isNew) {
    // CURRENT: the flat Settings list — notifications are just one buried "Notifications" row.
    const rows = [
      ['Edit profile', false], ['Daily goal', false], ['Notifications', true],
      ['Sound effects', false], ['Sign out', false],
    ];
    return (
      <React.Fragment>
        <NavHeader title="Settings" />
        <div style={{ flex: 1, padding: '6px 16px 14px', minHeight: 0, overflow: 'hidden' }}>
          {rows.map(([r, toggle], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 2px', borderBottom: i < rows.length - 1 ? '1px solid ' + SPROUT.line : 'none' }}>
              <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 13, color: SPROUT.ink }}>{r}</span>
              {toggle ? <Toggle on /> : <Icon.ChevR size={15} color={SPROUT.line} />}
            </div>
          ))}
        </div>
      </React.Fragment>
    );
  }

  // NEW: a dedicated grouped "Watering reminders" sub-screen.
  const GroupLabel = ({ children }) => (
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700, padding: '0 4px 6px' }}>{children}</div>
  );
  const Card = ({ children }) => (
    <div style={{ background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, overflow: 'hidden' }}>{children}</div>
  );
  const ToggleRow = ({ icon, label, caption, on, last }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderBottom: last ? 'none' : '1px solid ' + SPROUT.line }}>
      {icon && <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, color: SPROUT.ink, lineHeight: 1.2 }}>{label}</div>
        {caption && <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 10.5, color: SPROUT.mute, marginTop: 2 }}>{caption}</div>}
      </div>
      <Toggle on={on} />
    </div>
  );

  return (
    <React.Fragment>
      <NavHeader title="Watering reminders" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, padding: '13px 16px 14px', minHeight: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <GroupLabel>Daily watering</GroupLabel>
          <Card>
            {/* daily reminder toggle + a tappable time line beneath it */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderBottom: '1px solid ' + SPROUT.line }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><DropGlyph /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, color: SPROUT.ink }}>Daily watering reminder</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 10.5, color: SPROUT.mute }}>Every day at 7:30 PM ·</span>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: DEEP }}>Change</span>
                </div>
              </div>
              <Toggle on />
            </div>
            <ToggleRow icon={<Icon.Sparkle size={14} color={DEEP} />} label="Smart watering" caption="We nudge you when you usually practice" on last />
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <GroupLabel>Other nudges</GroupLabel>
          <Card>
            <ToggleRow label="Streak at risk" on />
            <ToggleRow label="League updates" on={false} />
            <ToggleRow label="Friend activity" on={false} last />
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
}

// ── Proposed · Tap the flag to switch gardens (inert HUD flag → flag-tap course switcher popover) ──
// Both phones are the full path screen with shared chrome (HUD + unit header + tab bar).
// CURRENT: tapping the flag does nothing. NEW: the flag is tapped → a calm cream popover
// drops under it showing language gardens as flag tiles + a "+ New garden" tile.
function ProposedFlagSwitcher({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';

  // the path body — IDENTICAL on both phones (completed disc, active node + START, locked disc)
  const PathBody = () => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 18px', minHeight: 0 }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: SPROUT.green, boxShadow: '0 4px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: .92 }}>
        <Icon.Check size={22} color="#fff" />
      </div>
      <div style={{ width: 0, height: 24, borderLeft: '3px dotted ' + SPROUT.cream2 }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ background: '#fff', color: SPROUT.greenDark, fontWeight: 900, fontSize: 11, letterSpacing: '.16em', padding: '5px 13px', borderRadius: 999, marginBottom: 8, boxShadow: '0 4px 12px -5px rgba(42,35,32,.3)' }}>START</div>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(180deg,#7FCC6C,' + SPROUT.green + ')', boxShadow: '0 5px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.Leaf size={30} color="#fff" />
        </div>
      </div>
      <div style={{ width: 0, height: 24, borderLeft: '3px dotted ' + SPROUT.cream2 }} />
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#EDE4D2', boxShadow: '0 4px 0 #D9CDB5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#B6A98E" strokeWidth="2.4"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round"/></svg>
      </div>
    </div>
  );

  // a garden flag tile in the popover
  const Tile = ({ flag, name, active, dim }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, width: 52 }}>
      <span style={{ width: 44, height: 44, borderRadius: 13, background: active ? '#EAF6E2' : '#fff', border: active ? '2px solid ' + DEEP : '1.5px solid ' + SPROUT.line, boxShadow: active ? '0 0 0 3px ' + GREEN + '55' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 23, opacity: dim ? 0.5 : 1 }}>{flag}</span>
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: active ? 900 : 700, fontSize: 10, color: active ? DEEP : SPROUT.mute, opacity: dim ? 0.7 : 1 }}>{name}</span>
    </div>
  );

  return (
    <AppChrome top="hud" nav="home">
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <PathBody />
        {isNew && (
          <React.Fragment>
            {/* soft scrim so the popover reads as a focused layer */}
            <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'rgba(42,35,32,.10)' }} />
            {/* cream popover anchored under the HUD flag (top-left) */}
            <div style={{ position: 'absolute', top: 6, left: 9, background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 16, boxShadow: '0 14px 30px -12px rgba(42,35,32,.4)', padding: '12px 12px' }}>
              {/* little pointer up toward the flag */}
              <span aria-hidden style={{ position: 'absolute', top: -6, left: 18, width: 11, height: 11, background: '#FFFDF7', borderLeft: '1.5px solid ' + SPROUT.line, borderTop: '1.5px solid ' + SPROUT.line, transform: 'rotate(45deg)' }} />
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700, marginBottom: 10 }}>My gardens</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                <Tile flag="🇺🇸" name="English" active />
                <Tile flag="🇫🇷" name="French" dim />
                {/* dashed + New garden tile */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, width: 52 }}>
                  <span style={{ width: 44, height: 44, borderRadius: 13, border: '1.5px dashed #C9BEA8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={SPROUT.mute} strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  </span>
                  <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 10, color: SPROUT.mute }}>New garden</span>
                </div>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    </AppChrome>
  );
}

// ── Proposed · Lesson Complete: water what you missed (always-flawless finish → imperfect-run recap) ──
// CURRENT reuses the perfect-run finish (Pip + "In full bloom!" + three stat cards) even after
// an imperfect run; NEW adapts the SAME finish — accuracy dot-strip, flexed praise stat, a
// "Words to water" recap of the missed items, and a "Water these" re-drill button.
function ProposedLessonMissed({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e', CLAY = '#ff8a80';

  const StatCard = ({ header, headerBg, icon, value, valueColor }) => (
    <div style={{ flex: 1, minWidth: 0, borderRadius: 13, overflow: 'hidden', border: '2px solid ' + headerBg, background: '#fff', boxShadow: '0 3px 0 ' + headerBg + '55' }}>
      <div style={{ background: headerBg, color: '#fff', textAlign: 'center', padding: '4px 2px', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 8, letterSpacing: '.08em', textTransform: 'uppercase' }}>{header}</div>
      <div style={{ padding: '9px 4px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
        {icon}
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 16, color: valueColor, lineHeight: 1 }}>{value}</span>
      </div>
    </div>
  );

  if (!isNew) {
    // CURRENT: the same celebratory "flawless" finish — shown even after an imperfect run.
    return (
      <AppChrome>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '24px 18px' }}>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <span className="exp-twinkle" aria-hidden style={{ position: 'absolute', top: -2, right: -10, color: SPROUT.sun, fontSize: 13 }}>✦</span>
            <span className="exp-twinkle" aria-hidden style={{ position: 'absolute', top: 14, left: -14, color: '#8FD46F', fontSize: 9, animationDelay: '.9s' }}>✦</span>
            <div className="exp-bob"><Pip size={84} mood="cheer" /></div>
          </div>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 25, color: SPROUT.greenDark, letterSpacing: '-.01em' }}>In full bloom!</div>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 700, fontSize: 13, color: SPROUT.mute }}>A perfect run — take a bow.</div>
          </div>
          <div style={{ display: 'flex', gap: 9, width: '100%' }}>
            <StatCard header="Seeds" headerBg="#E5A93A" valueColor="#C2871B" value="+15" icon={<Icon.Leaf size={17} color="#C2871B" />} />
            <StatCard header="Flawless" headerBg={GREEN} valueColor={DEEP} value="100%" icon={<Icon.Target size={15} color={DEEP} />} />
            <StatCard header="Quick" headerBg="#5B9CB8" valueColor="#3E88A8" value="3:49" icon={<Icon.Clock size={15} color="#3E88A8" />} />
          </div>
          <div style={{ width: '100%', background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.08em', padding: '13px 0', borderRadius: 15, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>CONTINUE</div>
        </div>
      </AppChrome>
    );
  }

  // NEW: same finish, adapted for an imperfect run.
  const DOTS = [true, true, true, true, true, false]; // 5/6
  const missed = ['meadow', 'harvest'];
  const Speaker = ({ s = 13, c = DEEP }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z" fill={c} stroke="none"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>
  );

  return (
    <AppChrome>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 13, padding: '16px 18px' }}>
        <div className="exp-bob"><Pip size={62} mood="happy" /></div>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 22, color: SPROUT.greenDark, letterSpacing: '-.01em' }}>Almost in bloom!</div>
          {/* accuracy dot-strip — five green + one clay = 5/6 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {DOTS.map((on, i) => (
              <span key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: on ? GREEN : CLAY }} />
            ))}
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11.5, color: SPROUT.mute, marginLeft: 3 }}>5/6</span>
          </div>
        </div>

        {/* three stat cards — middle praise flexes with performance */}
        <div style={{ display: 'flex', gap: 9, width: '100%' }}>
          <StatCard header="Seeds" headerBg="#E5A93A" valueColor="#C2871B" value="+12" icon={<Icon.Leaf size={17} color="#C2871B" />} />
          <StatCard header="Accuracy" headerBg={GREEN} valueColor={DEEP} value="83%" icon={<Icon.Target size={15} color={DEEP} />} />
          <StatCard header="Time" headerBg="#5B9CB8" valueColor="#3E88A8" value="3:49" icon={<Icon.Clock size={15} color="#3E88A8" />} />
        </div>

        {/* "Words to water" recap of the missed items */}
        <div style={{ width: '100%', background: '#FFFDF7', border: '1.5px solid ' + SPROUT.line, borderRadius: 14, padding: '11px 13px' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: '.14em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700, marginBottom: 9 }}>Words to water</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {missed.map((w, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: '#FBE7E4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={CLAY} strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                </span>
                <span style={{ flex: 1, fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13, color: SPROUT.ink }}>{w}</span>
                <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: '#EAF6E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Speaker /></span>
              </div>
            ))}
          </div>
        </div>

        {/* primary re-drill + quiet Continue */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: GREEN, color: '#fff', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14, letterSpacing: '.03em', padding: '13px 0', borderRadius: 15, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>
            <Icon.Leaf size={15} color="#fff" />Water these (+10)
          </div>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 12.5, color: SPROUT.mute, textDecoration: 'underline', textUnderlineOffset: 3 }}>Continue</span>
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Find your garden friends: warm empty state (blank "no friends" → inviting front door) ──
// Both phones keep the HUD + a "‹ Garden Friends" header + tab bar (ME active). CURRENT is a
// near-blank dead end; NEW is a calm empty state with hero, one line, a primary connect action.
function ProposedFriendsEmpty({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';

  // the shared in-page header — a back arrow + "Garden Friends", byte-identical on both phones
  const Header = () => (
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7, padding: '11px 16px 9px' }}>
      <Icon.ChevL size={20} color={SPROUT.ink} />
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 17, color: SPROUT.ink }}>Garden Friends</span>
    </div>
  );

  // a little sprout glyph for the hero cluster
  const Sprout = ({ h = 26, c = GREEN }) => (
    <svg width={h * 0.7} height={h} viewBox="0 0 18 26" fill="none">
      <path d="M9 25 V11" stroke={DEEP} strokeWidth="2" strokeLinecap="round" />
      <path d="M9 14 C9 9 4 8 2 9 C3 13 7 14 9 14Z" fill={c} />
      <path d="M9 12 C9 7 14 6 16 7 C15 11 11 12 9 12Z" fill={c} />
    </svg>
  );

  if (!isNew) {
    // CURRENT: an abrupt, near-blank "no friends" — no illustration, no reason, no way in.
    return (
      <AppChrome top="hud" nav="me">
        <Header />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '18px', minHeight: 0 }}>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 15, color: SPROUT.ink }}>No friends yet</div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 12.5, color: SPROUT.mute }}>Friends you add will show up here.</div>
        </div>
      </AppChrome>
    );
  }

  // NEW: a warm, inviting empty state.
  return (
    <AppChrome top="hud" nav="me">
      <Header />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '20px 22px', minHeight: 0 }}>
        {/* hero: Pip beside a small cluster of little sprouts */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <span className="exp-bob"><Pip size={76} mood="cheer" /></span>
          <span style={{ display: 'flex', alignItems: 'flex-end', gap: 3, marginBottom: 6 }}>
            <Sprout h={22} c="#8FD46F" />
            <Sprout h={30} c={GREEN} />
            <Sprout h={20} c="#8FD46F" />
          </span>
        </div>

        {/* one warm line */}
        <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 18, color: SPROUT.greenDark, textAlign: 'center', lineHeight: 1.2, flexShrink: 0 }}>Learning grows faster together</div>

        {/* primary connect action + reassurance */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ width: '100%', background: GREEN, color: '#fff', textAlign: 'center', fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 14.5, letterSpacing: '.02em', padding: '13px 0', borderRadius: 15, boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>Find garden friends</div>
          <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 600, fontSize: 11, color: SPROUT.mute }}>We&rsquo;ll never message your contacts</span>
        </div>

        {/* secondary link */}
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 13, color: DEEP, textDecoration: 'underline', textUnderlineOffset: 3, flexShrink: 0 }}>Share an invite</span>
      </div>
    </AppChrome>
  );
}

// ── Proposed · Harvest checkpoint at the unit boundary (identical disc → distinct golden milestone node) ──
// Both phones are the path with the SAME shared chrome (HUD + unit ribbon + tab bar). Only the
// unit-boundary node changes: CURRENT a plain green lesson disc, NEW a golden Harvest checkpoint.
function ProposedHarvestNode({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e', GOLD = '#E5A93A';

  // the slim unit ribbon — shared, byte-identical on both phones
  const UnitRibbon = () => (
    <div style={{ flexShrink: 0, margin: '4px 16px 0', background: SPROUT.green, borderRadius: 13, padding: '8px 13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.82)' }}>Unit 1</span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, color: '#fff', lineHeight: 1.1 }}>Sprout Basics</span>
      </div>
      <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 12, color: '#fff' }}>7<span style={{ opacity: .65 }}>/8</span></span>
    </div>
  );

  const Connector = () => <div style={{ width: 0, height: 18, borderLeft: '3px dotted ' + SPROUT.cream2 }} />;
  const DoneDisc = () => (
    <div style={{ width: 44, height: 44, borderRadius: '50%', background: SPROUT.green, boxShadow: '0 4px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: .92 }}>
      <Icon.Check size={20} color="#fff" />
    </div>
  );
  const ActiveDisc = () => (
    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(180deg,#7FCC6C,' + SPROUT.green + ')', boxShadow: '0 5px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon.Leaf size={26} color="#fff" />
    </div>
  );

  // the unit-boundary node — a plain lesson disc (CURRENT) vs the Harvest checkpoint (NEW)
  const BoundaryNode = () => {
    if (!isNew) {
      // CURRENT: it looks the same as every other lesson — a regular green disc.
      return (
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(180deg,#7FCC6C,' + SPROUT.green + ')', boxShadow: '0 5px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.Leaf size={26} color="#fff" />
        </div>
      );
    }
    // NEW: a distinct golden Harvest checkpoint — larger milestone disc, soft glow, basket glyph,
    // a calm leaf-lock while the unit's lessons are still being watered, and a label beneath.
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 74, height: 74 }}>
          <span aria-hidden style={{ position: 'absolute', inset: -9, borderRadius: '50%', background: 'radial-gradient(circle, ' + GREEN + '50 0%, ' + GREEN + '00 70%)' }} />
          <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(165deg,#F6D278,' + GOLD + ')', border: '3px solid #fff', boxShadow: '0 6px 0 #C9852B, 0 8px 16px -6px ' + GOLD + 'cc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* woven basket / harvest glyph */}
            <Icon.Basket size={34} color="#fff" />
          </span>
          {/* calm leaf-lock badge (not harsh) — the unit isn't fully watered yet */}
          <span style={{ position: 'absolute', right: -4, bottom: -2, width: 24, height: 24, borderRadius: '50%', background: '#FBF1DA', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px -1px rgba(42,35,32,.3)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.4"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round"/></svg>
          </span>
        </div>
        <div style={{ marginTop: 11, textAlign: 'center' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: GOLD, fontWeight: 700 }}>Unit 1 · Harvest</div>
          <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 11, color: SPROUT.mute, marginTop: 2 }}>Review all 8 lessons</div>
        </div>
      </div>
    );
  };

  return (
    <AppChrome top="hud" nav="home">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        <UnitRibbon />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0, padding: '10px 18px', minHeight: 0 }}>
          <DoneDisc />
          <Connector />
          <DoneDisc />
          <Connector />
          {/* the active lesson just before the boundary */}
          <ActiveDisc />
          <Connector />
          {/* the unit-boundary node */}
          <BoundaryNode />
        </div>
      </div>
    </AppChrome>
  );
}

// ── Proposed · See your whole journey (slim ribbon, scroll-only path → tap-to-open section overview sheet) ──
// Both phones are the path with the SAME chrome (HUD + slim unit ribbon). CURRENT: the ribbon
// isn't tappable. NEW: tapping the ribbon raises a calm "Your journey" bottom sheet of unit rows.
function ProposedJourneySheet({ mode = 'proposed' }) {
  const isNew = mode !== 'current';
  const GREEN = '#6fbf5e', DEEP = '#3fa52e';

  // the slim unit ribbon — shared, byte-identical on both phones (NEW adds a tiny chevron hint)
  const UnitRibbon = () => (
    <div style={{ flexShrink: 0, margin: '4px 16px 0', background: SPROUT.green, borderRadius: 13, padding: '8px 13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 0 ' + SPROUT.greenShadow }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.82)', whiteSpace: 'nowrap' }}>Unit 1 · Sprout Basics</span>
        <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13.5, color: '#fff', lineHeight: 1.1 }}>1 / 8 lessons</span>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isNew ? 'rotate(180deg)' : 'none', opacity: .9 }}><path d="M6 9l6 6 6-6" /></svg>
    </div>
  );

  const Connector = () => <div style={{ width: 0, height: 20, borderLeft: '3px dotted ' + SPROUT.cream2 }} />;
  const PathBody = () => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 18px', minHeight: 0 }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: SPROUT.green, boxShadow: '0 4px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: .92 }}><Icon.Check size={20} color="#fff" /></div>
      <Connector />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ background: '#fff', color: SPROUT.greenDark, fontWeight: 900, fontSize: 11, letterSpacing: '.16em', padding: '5px 13px', borderRadius: 999, marginBottom: 8, boxShadow: '0 4px 12px -5px rgba(42,35,32,.3)' }}>START</div>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(180deg,#7FCC6C,' + SPROUT.green + ')', boxShadow: '0 5px 0 ' + SPROUT.greenShadow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Leaf size={28} color="#fff" /></div>
      </div>
      <Connector />
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EDE4D2', boxShadow: '0 4px 0 #D9CDB5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B6A98E" strokeWidth="2.4"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round"/></svg>
      </div>
    </div>
  );

  // every unit as a garden row — done / current / locked
  const units = [
    { name: 'Sprout Basics', state: 'done', pct: 1 },
    { name: 'Market Garden', state: 'current', pct: 0.4 },
    { name: 'Morning Greetings', state: 'locked' },
    { name: 'Around Town', state: 'locked' },
  ];

  const UnitRow = ({ u }) => {
    const done = u.state === 'done', current = u.state === 'current', locked = u.state === 'locked';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 2px', opacity: locked ? 0.55 : 1 }}>
        <span style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: locked ? '#ECE4D4' : 'linear-gradient(160deg,#8FD178,' + DEEP + ')', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {locked
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B6A98E" strokeWidth="2.4"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round"/></svg>
            : <Icon.Leaf size={17} color="#fff" />}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
            <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 13, color: locked ? SPROUT.mute : SPROUT.ink }}>{u.name}</span>
            {done && <span style={{ width: 18, height: 18, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon.Check size={11} color="#fff" /></span>}
            {current && <span style={{ fontFamily: 'Nunito, system-ui', fontWeight: 900, fontSize: 10.5, color: DEEP, flexShrink: 0 }}>Continue</span>}
          </div>
          <div style={{ height: 5, borderRadius: 999, background: '#EAE2D1', overflow: 'hidden' }}>
            {!locked && <div style={{ width: (u.pct * 100) + '%', height: '100%', borderRadius: 999, background: GREEN }} />}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppChrome top="hud" nav="home">
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        <UnitRibbon />
        <PathBody />
        {isNew && (
          <React.Fragment>
            {/* scrim over the path, below the HUD + ribbon */}
            <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'rgba(42,35,32,.22)' }} />
            {/* "Your journey" bottom sheet */}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: '#FFFDF7', borderTopLeftRadius: 22, borderTopRightRadius: 22, boxShadow: '0 -14px 34px -16px rgba(42,35,32,.5)', padding: '11px 18px 16px' }}>
              <div style={{ width: 38, height: 4, borderRadius: 999, background: SPROUT.cream2, margin: '0 auto 11px' }} />
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: SPROUT.mute, fontWeight: 700, marginBottom: 9 }}>Your journey</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {units.map((u, i) => <UnitRow key={i} u={u} />)}
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    </AppChrome>
  );
}

