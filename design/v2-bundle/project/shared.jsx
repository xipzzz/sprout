// ── SPROUT: shared data + small atoms ────────────────────────
const SPROUT = {
  // palette
  bg: '#FDF8EE',          // warm cream background
  paper: '#FFFFFF',
  ink: '#2A2320',
  mute: '#857B70',
  green: '#6FBF5E',
  greenDark: '#4D9E3F',
  greenShadow: '#3F7F34',
  cream: '#F3E8D2',
  cream2: '#E9DCC0',
  sun: '#F5B94A',
  sunShadow: '#D59428',
  coral: '#F47A7A',
  sky: '#A8D8EA',
  lilac: '#C9B8E3',
  line: '#E8DFCE',
  cardShadow: '#E8DFCE',  // the solid drop under cards (cream)
};

// ── LAYOUT: single source of truth for device safe-areas + screen padding ────
// The iOS status bar / dynamic island occupies ~62px at the top of the frame and
// the home indicator ~34px at the bottom. EVERY full-screen surface (HUD, lesson
// chrome, onboarding, sheets, skeletons) clears them through these tokens so they
// all start on one baseline — no 2px jump navigating home → lesson, and the
// skeleton HUD lines up pixel-for-pixel with the real one it's replacing.
const LAYOUT = {
  safeTop: 62,      // top inset that clears the status bar / dynamic island
  safeBottom: 28,   // bottom padding inside the tab bar (home-indicator clearance)
  padX: 16,         // standard screen horizontal padding
  hudPadY: 13,      // HUD vertical breathing room below the safe-top inset
  scrollBottom: 90, // scroll-area bottom padding so content clears the tab bar
  cardRadius: 16,   // standard card corner radius
};

// ── Live theming ─────────────────────────────────────────────
// The whole app reads SPROUT.* (and literal card backgrounds, swept to
// SPROUT.paper) at render time. applyTheme() mutates SPROUT in place; the
// App re-renders on a theme change so every screen picks up the new palette.
const THEME_LIGHT = {
  bg: '#FDF8EE', paper: '#FFFFFF', ink: '#2A2320', mute: '#857B70',
  green: '#6FBF5E', greenDark: '#4D9E3F', greenShadow: '#3F7F34',
  cream: '#F3E8D2', cream2: '#E9DCC0', sun: '#F5B94A', sunShadow: '#D59428',
  coral: '#F47A7A', sky: '#A8D8EA', lilac: '#C9B8E3', line: '#E8DFCE', cardShadow: '#E8DFCE',
};
// Moonlit Garden — soft forest-charcoal, brightened accents (kept legible on dark).
const THEME_DARK = {
  bg: '#1C2620', paper: '#2B3830', ink: '#EAF1E8', mute: '#9DB0A2',
  green: '#7FD86A', greenDark: '#A6E89A', greenShadow: '#3F7F34',
  cream: '#243029', cream2: '#33423A', sun: '#F6CE5A', sunShadow: '#B98E2E',
  coral: '#FF8A8A', sky: '#6FC8E8', lilac: '#B59BE0', line: '#3A4940', cardShadow: '#141C18',
};
function applyTheme(mode) {
  // mode: 'light' | 'dark'
  const t = mode === 'dark' ? THEME_DARK : THEME_LIGHT;
  Object.assign(SPROUT, t);
  return mode;
}
// Resolve 'light' | 'dark' | 'system' (+ optional auto-evening) → concrete mode.
// TEMP: light-mode only. Flip ALLOW_DARK back to true to re-enable the Moonlit
// (dark) theme + the Appearance control. All dark-theme code is preserved below.
const ALLOW_DARK = false;
function resolveTheme(pref, autoEvening) {
  if (!ALLOW_DARK) return 'light';
  if (pref === 'dark') return 'dark';
  if (pref === 'light') {
    if (autoEvening) { const h = new Date().getHours(); if (h >= 19 || h < 6) return 'dark'; }
    return 'light';
  }
  // system
  let sys = 'light';
  try { sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch (e) {}
  if (sys === 'light' && autoEvening) { const h = new Date().getHours(); if (h >= 19 || h < 6) return 'dark'; }
  return sys;
}

// A cartoon "push button" — flat top face, solid bottom shadow, presses down on hover
function PushButton({ children, color = SPROUT.green, shadow = SPROUT.greenShadow, textColor = '#fff', onClick, size = 'lg', disabled, outlined, outlineColor, style = {} }) {
  const [down, setDown] = React.useState(false);
  const h = size === 'lg' ? 56 : size === 'md' ? 46 : 36;
  const fs = size === 'lg' ? 16 : size === 'md' ? 14 : 13;
  const drop = disabled ? 2 : (down ? 2 : 5);
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseDown={() => setDown(true)}
      onMouseUp={() => setDown(false)}
      onMouseLeave={() => setDown(false)}
      onTouchStart={() => setDown(true)}
      onTouchEnd={() => setDown(false)}
      style={{
        position: 'relative', height: h, padding: 0, margin: 0,
        borderRadius: 14, border: 'none', cursor: disabled ? 'default' : 'pointer',
        background: shadow, opacity: disabled ? 0.5 : 1,
        fontFamily: 'inherit', fontWeight: 800, fontSize: fs, letterSpacing: 0.5,
        textTransform: 'uppercase', color: textColor,
        boxShadow: 'none', transition: 'transform 80ms ease',
        display: 'inline-block',
        ...style,
      }}
    >
      <span style={{
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: h, padding: '0 20px', bottom: drop,
        background: color, borderRadius: 14, color: textColor,
        border: outlined ? `2px solid ${outlineColor || shadow}` : 'none',
        transition: 'bottom 80ms ease', whiteSpace: 'nowrap', boxSizing: 'border-box',
      }}>{children}</span>
    </button>
  );
}

// StatChip — small pill with icon + number (streak/xp/gems) + caption label
function StatChip({ icon, value, color = SPROUT.ink, dim = false, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '4px 8px 4px 5px', borderRadius: 999,
        background: dim ? 'rgba(0,0,0,0.04)' : 'transparent',
      }}>
        {icon}
        <span style={{ fontWeight: 800, color, fontSize: 13 }}>{value}</span>
      </div>
      {label && (
        <span style={{ fontSize: 8, fontWeight: 800, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: -2 }}>{label}</span>
      )}
    </div>
  );
}

// Skill type for path nodes — drives tiny corner-icon badge
// listen 🎧, speak 🎤, review ♻︎, game 🎮, mix ⭐ (default)
const SKILL_META = {
  listen:  { label: 'Listening', color: '#5BA8C8', bg: '#E7F3F8' },
  speak:   { label: 'Speaking',  color: '#C85555', bg: '#FBE6E6' },
  review:  { label: 'Review',    color: '#7A60A8', bg: '#EFE7F8' },
  game:    { label: 'Game',      color: '#E48A2B', bg: '#FCEED7' },
  mix:     { label: 'Mixed',     color: '#4D9E3F', bg: '#E8F4DF' },
  story:   { label: 'Story',     color: '#A87A2B', bg: '#F6ECD3' },
  boss:    { label: 'Big test',  color: '#6F3D9B', bg: '#EADCF4' },
};

function SkillIcon({ skill, size = 14, color }) {
  const c = color || SKILL_META[skill]?.color || SPROUT.mute;
  if (skill === 'listen') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24"><path d="M5 11a7 7 0 0 1 14 0v3a3 3 0 0 1-3 3h-1v-6h2v-0a5 5 0 0 0-10 0v0h2v6H8a3 3 0 0 1-3-3v-3z" fill={c}/></svg>
    );
  }
  if (skill === 'speak') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3" fill={c}/><path d="M6 11a6 6 0 0 0 12 0" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12" y2="21" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>
    );
  }
  if (skill === 'review') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 14-5.3L20 5v6h-6l2.5-2.5A6 6 0 0 0 6 12H4zm16 0a8 8 0 0 1-14 5.3L4 19v-6h6l-2.5 2.5A6 6 0 0 0 18 12h2z" fill={c}/></svg>
    );
  }
  if (skill === 'game') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="11" rx="4" fill={c}/><circle cx="8" cy="12.5" r="1.6" fill="#fff"/><rect x="15" y="11.5" width="3" height="2" rx="1" fill="#fff"/></svg>
    );
  }
  if (skill === 'story') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24"><path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a1 1 0 0 1-1.5.87L12 17l-6.5 2.87A1 1 0 0 1 4 19V5z" fill={c}/></svg>
    );
  }
  if (skill === 'boss') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24"><path d="M3 8l4 3 5-7 5 7 4-3-2 11H5L3 8z" fill={c}/></svg>
    );
  }
  // mix / star
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.2 2.1 7.3L12 16.5 5.4 20.5l2.1-7.3L2 9h7l3-7z" fill={c}/></svg>
  );
}

// Pip speech bubble — small mascot-in-corner reaction
function PipBubble({ mood = 'happy', text, side = 'left', tone = 'neutral', size = 42 }) {
  const isLeft = side === 'left';
  const palette = tone === 'positive'
    ? { bg: '#EFF8E8', border: SPROUT.green, ink: SPROUT.greenDark }
    : tone === 'negative'
      ? { bg: '#FBE6E6', border: SPROUT.coral, ink: '#A0322A' }
      : { bg: '#fff', border: SPROUT.line, ink: SPROUT.ink };
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexDirection: isLeft ? 'row' : 'row-reverse' }}>
      <div style={{ flexShrink: 0 }}><Pip size={size} mood={mood}/></div>
      <div style={{
        position: 'relative', background: palette.bg, padding: '8px 12px', borderRadius: 12,
        border: `2px solid ${palette.border}`, fontSize: 13, fontWeight: 700, color: palette.ink,
        boxShadow: `0 2px 0 ${palette.border}33`, lineHeight: 1.35, maxWidth: 250,
      }}>
        {text}
        <span style={{
          position: 'absolute', bottom: 10,
          [isLeft ? 'left' : 'right']: -8,
          width: 0, height: 0,
          borderTop: '6px solid transparent', borderBottom: '6px solid transparent',
          [isLeft ? 'borderRight' : 'borderLeft']: `8px solid ${palette.border}`,
        }}/>
      </div>
    </div>
  );
}

// (PipMini is defined in mascot.jsx)

// SpeakableWord — vocabulary text + a tiny tap-to-hear speaker, so reading ↔ listening
// is reinforced everywhere a word appears (answer labels, Words tab, feedback drawer…).
// Renders as inline spans (never a <button>) so it's safe to nest inside other buttons.
function SpeakableWord({ children, size = 13, color, weight = 800, slow = false, gap = 5, onPlay, style = {} }) {
  const [playing, setPlaying] = React.useState(false);
  const ink = color || SPROUT.ink;
  const say = (e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    setPlaying(true);
    if (onPlay) onPlay();
    setTimeout(() => setPlaying(false), slow ? 1100 : 650);
  };
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={say}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') say(e); }}
      title="Tap to hear"
      style={{ display: 'inline-flex', alignItems: 'center', gap, cursor: 'pointer', verticalAlign: 'middle', ...style }}
    >
      <span style={{ fontWeight: weight, fontSize: size, color: ink }}>{children}</span>
      <span aria-hidden style={{
        width: size + 7, height: size + 7, borderRadius: '50%', flexShrink: 0,
        background: playing ? SPROUT.green : 'transparent',
        border: `1.5px solid ${playing ? SPROUT.green : SPROUT.line}`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transform: playing ? 'scale(1.12)' : 'scale(1)', transition: 'transform .15s',
      }}>
        <Icon.Volume size={Math.round(size * 0.62)} color={playing ? '#fff' : SPROUT.mute}/>
      </span>
    </span>
  );
}

// Section header used in lesson list — section badge, unit title, lesson count + progress
function SectionBanner({ unit, title, desc, color = SPROUT.green, shadow = SPROUT.greenShadow, totalLessons, doneLessons, section = 1, onGuide, dailyDone = null, dailyGoal = null }) {
  const pct = totalLessons ? Math.max(0, Math.min(1, (doneLessons || 0) / totalLessons)) : null;
  // Optional daily-goal ring ("water N plants today") — only docked on the active unit.
  const showDaily = dailyGoal != null && dailyGoal > 0;
  const dPct = showDaily ? Math.max(0, Math.min(1, (dailyDone || 0) / dailyGoal)) : 0;
  const dMet = showDaily && (dailyDone || 0) >= dailyGoal;
  const R = 13, C = 2 * Math.PI * R;
  return (
    <div style={{
      position: 'relative', margin: '0 16px',
      background: shadow, borderRadius: 18,
    }}>
      <div style={{
        position: 'relative', background: color, borderRadius: 18,
        padding: '12px 14px', marginTop: -3,
        color: '#fff',
      }}>
        {/* row 1 — section/unit chip + title + book icon */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 6px', borderRadius: 6, background: 'rgba(0,0,0,0.18)', fontSize: 9, fontWeight: 900, letterSpacing: 1, lineHeight: 1.2 }}>
              SECTION {section} · UNIT {unit}
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.2, marginTop: 4 }}>{title}</div>
            {desc && <div style={{ fontSize: 11, opacity: 0.9, marginTop: 2, lineHeight: 1.2 }}>{desc}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* daily-goal ring — "water N plants today", keeps the daily loop visible on the path */}
            {showDaily && (
              <div aria-label={`Today's goal: ${dailyDone} of ${dailyGoal} plants watered`} title={`Water ${dailyGoal} plants today`} style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
                <svg width="36" height="36" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r={R} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="4"/>
                  <circle cx="18" cy="18" r={R} fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="4" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - dPct)} style={{ transition: 'stroke-dashoffset .5s' }}/>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: dMet ? 13 : 9.5, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                  {dMet ? '💧' : `${dailyDone}/${dailyGoal}`}
                </div>
              </div>
            )}
            <button onClick={onGuide} aria-label="Open unit guidebook" style={{
              width: 36, height: 36, borderRadius: 10, border: 'none',
              background: 'rgba(255,255,255,0.2)', cursor: onGuide ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, fontFamily: 'inherit',
            }}>
              <Icon.Book size={18} color="#fff"/>
            </button>
          </div>
        </div>

        {/* row 2 — lesson position + a thin growth track, so a long scroll stays oriented */}
        {pct != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 9 }}>
            <span style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: 0.4, whiteSpace: 'nowrap', opacity: 0.95 }}>
              Lesson {Math.min((doneLessons || 0) + 1, totalLessons)} of {totalLessons}
            </span>
            <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'rgba(0,0,0,0.18)', overflow: 'hidden' }}>
              <div style={{ width: `${pct * 100}%`, height: '100%', borderRadius: 999, background: 'rgba(255,255,255,0.9)', transition: 'width .4s' }}/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Lesson data — 3 units
const UNITS = [
  {
    unit: 1, title: 'Getting started', desc: 'Greetings & basics',
    color: SPROUT.green, shadow: SPROUT.greenShadow,
    section: 1,
    lessons: [
      { id: 1, status: 'done', kind: 'core', skill: 'speak', label: 'Hello', mastery: 3 },
      { id: 2, status: 'done', kind: 'core', skill: 'listen', label: 'Introductions', mastery: 2 },
      { id: 3, status: 'done', kind: 'chest', skill: 'game', label: 'Bonus' },
      { id: 4, status: 'active', progress: 0.4, kind: 'core', skill: 'mix', label: 'Numbers' },
      { id: 5, status: 'locked', kind: 'core', skill: 'listen', label: 'Colors' },
      { id: 6, status: 'locked', kind: 'boss', skill: 'boss', label: 'Review' },
    ],
    golden: { status: 'available', unitTitle: 'Getting started' },
  },
  {
    unit: 2, title: 'Food & drink', desc: 'Order at a café',
    color: SPROUT.sun, shadow: SPROUT.sunShadow,
    section: 1,
    lessons: [
      { id: 7, status: 'locked', kind: 'core', skill: 'speak', label: 'Breakfast' },
      { id: 8, status: 'locked', kind: 'core', skill: 'mix', label: 'Coffee' },
      { id: 9, status: 'locked', kind: 'story', skill: 'story', label: 'Story', tale: 'cafe' },
      { id: 10, status: 'locked', kind: 'core', skill: 'review', label: 'Lunch' },
      { id: 11, status: 'locked', kind: 'boss', skill: 'boss', label: 'Review' },
    ],
  },
  {
    unit: 3, title: 'Around town', desc: 'Getting around',
    color: SPROUT.coral, shadow: '#C85555',
    section: 1,
    lessons: [
      { id: 12, status: 'locked', kind: 'core', skill: 'listen', label: 'Directions' },
      { id: 13, status: 'locked', kind: 'core', skill: 'speak', label: 'Transport' },
    ],
  },
];

// Builds the exercise queue for a given lesson, varying by lesson kind.
// Exercise type ids map to components in app-flow.jsx.
function lessonQueueFor(lesson = {}) {
  switch (lesson.kind) {
    case 'boss':
      return ['ex-mc', 'ex-arrange', 'ex-match', 'ex-hear', 'ex-fill', 'ex-speak'];
    case 'story':
      return ['ex-hear', 'ex-arrange', 'ex-mc'];
    case 'chest':
      return ['ex-mc', 'ex-match'];
    default: // core
      return ['ex-mc', 'ex-arrange', 'ex-hear', 'ex-match', 'ex-fill'];
  }
}

// ─────────────────────────────────────────────────────────────
// Full course map — drives the Section/Unit path preview (Tweaks).
// Section 1 reuses the authored UNITS verbatim; sections 2–3 extend
// the curriculum so any point in the course can be previewed.
// ─────────────────────────────────────────────────────────────
const COURSE_SECTIONS = [
  { section: 1, title: 'Basics', units: UNITS },
  { section: 2, title: 'Everyday life', units: [
    { unit: 4, title: 'Family & home', desc: 'People you love', color: SPROUT.sky, shadow: '#7BBBD4', section: 2, lessons: [
      { id: 101, kind: 'core', skill: 'speak', label: 'Family' },
      { id: 102, kind: 'core', skill: 'listen', label: 'The house' },
      { id: 103, kind: 'chest', skill: 'game', label: 'Bonus' },
      { id: 104, kind: 'core', skill: 'mix', label: 'Rooms' },
      { id: 105, kind: 'boss', skill: 'boss', label: 'Review' },
    ]},
    { unit: 5, title: 'Daily routine', desc: 'Morning to night', color: SPROUT.lilac, shadow: '#A892C9', section: 2, lessons: [
      { id: 106, kind: 'core', skill: 'listen', label: 'Mornings' },
      { id: 107, kind: 'core', skill: 'mix', label: 'At work' },
      { id: 108, kind: 'story', skill: 'story', label: 'Story', tale: 'cafe' },
      { id: 109, kind: 'core', skill: 'review', label: 'Evenings' },
      { id: 110, kind: 'boss', skill: 'boss', label: 'Review' },
    ]},
    { unit: 6, title: 'Shopping', desc: 'Markets & money', color: SPROUT.green, shadow: SPROUT.greenShadow, section: 2, lessons: [
      { id: 111, kind: 'core', skill: 'speak', label: 'Money' },
      { id: 112, kind: 'core', skill: 'mix', label: 'Clothes' },
      { id: 113, kind: 'core', skill: 'review', label: 'Bargains' },
      { id: 114, kind: 'boss', skill: 'boss', label: 'Review' },
    ]},
    { unit: 7, title: 'At the doctor', desc: 'Health & body', color: SPROUT.sun, shadow: SPROUT.sunShadow, section: 2, lessons: [
      { id: 115, kind: 'core', skill: 'listen', label: 'The body' },
      { id: 116, kind: 'core', skill: 'speak', label: 'Symptoms' },
      { id: 117, kind: 'core', skill: 'mix', label: 'Pharmacy' },
      { id: 118, kind: 'boss', skill: 'boss', label: 'Review' },
    ]},
  ]},
  { section: 3, title: 'Out in the world', units: [
    { unit: 8, title: 'Travel', desc: 'Airports & hotels', color: SPROUT.coral, shadow: '#C85555', section: 3, lessons: [
      { id: 201, kind: 'core', skill: 'listen', label: 'Airport' },
      { id: 202, kind: 'core', skill: 'speak', label: 'The hotel' },
      { id: 203, kind: 'chest', skill: 'game', label: 'Bonus' },
      { id: 204, kind: 'core', skill: 'mix', label: 'Directions' },
      { id: 205, kind: 'boss', skill: 'boss', label: 'Review' },
    ]},
    { unit: 9, title: 'Nature', desc: 'Weather & seasons', color: SPROUT.sky, shadow: '#7BBBD4', section: 3, lessons: [
      { id: 206, kind: 'core', skill: 'listen', label: 'Weather' },
      { id: 207, kind: 'core', skill: 'mix', label: 'Seasons' },
      { id: 208, kind: 'story', skill: 'story', label: 'Story', tale: 'cafe' },
      { id: 209, kind: 'core', skill: 'review', label: 'Animals' },
      { id: 210, kind: 'boss', skill: 'boss', label: 'Review' },
    ]},
    { unit: 10, title: 'Work & study', desc: 'Office & school', color: SPROUT.lilac, shadow: '#A892C9', section: 3, lessons: [
      { id: 211, kind: 'core', skill: 'speak', label: 'The office' },
      { id: 212, kind: 'core', skill: 'mix', label: 'School' },
      { id: 213, kind: 'core', skill: 'review', label: 'Email' },
      { id: 214, kind: 'boss', skill: 'boss', label: 'Review' },
    ]},
    { unit: 11, title: 'Stories & news', desc: 'Read & discuss', color: SPROUT.green, shadow: SPROUT.greenShadow, section: 3, lessons: [
      { id: 215, kind: 'core', skill: 'listen', label: 'Headlines' },
      { id: 216, kind: 'core', skill: 'speak', label: 'Opinions' },
      { id: 217, kind: 'story', skill: 'story', label: 'Story', tale: 'cafe' },
      { id: 218, kind: 'boss', skill: 'boss', label: 'Review' },
    ]},
  ]},
];

const COURSE_UNIT_COUNTS = COURSE_SECTIONS.map(s => s.units.length); // [3,4,4]

// Returns the units of `section`, with lesson statuses recomputed so that the
// course reads as positioned at (section, unit, lesson): units before the focus
// unit are fully grown, the focus unit is mid-progress with one active node, and
// later units are locked. Lets the viewer preview ANY point without authoring it.
function coursePath(section = 1, focusUnit = 1, focusLesson = null) {
  const sec = COURSE_SECTIONS.find(s => s.section === section) || COURSE_SECTIONS[0];
  const fu = Math.max(1, Math.min(focusUnit || 1, sec.units.length));
  return sec.units.map((u, idx) => {
    const unitNo = idx + 1;
    let lessons, golden = null;
    if (unitNo < fu) {
      lessons = u.lessons.map(l => { const { progress, ...rest } = l; return { ...rest, status: 'done' }; });
      golden = { status: 'available', unitTitle: u.title };
    } else if (unitNo === fu) {
      // default active node sits halfway through the unit; the Lesson tweak overrides it
      const activeIdx = focusLesson != null
        ? Math.max(0, Math.min(focusLesson - 1, u.lessons.length - 1))
        : Math.floor(u.lessons.length / 2);
      lessons = u.lessons.map((l, li) => {
        if (li < activeIdx) return { ...l, status: 'done' };
        if (li === activeIdx) return { ...l, status: 'active', progress: l.progress != null ? l.progress : 0.4 };
        return { ...l, status: 'locked' };
      });
      golden = { status: 'locked', unitTitle: u.title };
    } else {
      lessons = u.lessons.map(l => ({ ...l, status: 'locked' }));
    }
    return { ...u, section, lessons, golden };
  });
}

Object.assign(window, { SPROUT, LAYOUT, applyTheme, resolveTheme, ALLOW_DARK, THEME_LIGHT, THEME_DARK, PushButton, StatChip, SectionBanner, SpeakableWord, UNITS, COURSE_SECTIONS, COURSE_UNIT_COUNTS, coursePath, lessonQueueFor, SKILL_META, SkillIcon, PipBubble });
