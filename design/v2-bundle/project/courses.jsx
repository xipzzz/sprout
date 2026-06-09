// ─────────────────────────────────────────────────────────────
// Course switcher — the HUD flag opens "My courses". Multilingual learners
// can switch language, add a course (with a starting level), and crucially
// each language has ITS OWN garden — "I'm growing three gardens 🌱🌻🌳".
// Streak is shared (one daily practice keeps all gardens — gentle, on-brand).
// English-only UI copy. Reuses MilestonePlant + the Sprout palette.
// ─────────────────────────────────────────────────────────────

// Each course = a separate garden. progress is per-language; streak is shared.
const MY_COURSES = [
  { id: 'en', flag: '🇺🇸', name: 'English', native: 'English', words: 128, plants: 8, tier: 'tree' },
  { id: 'fr', flag: '🇫🇷', name: 'French', native: 'Français', words: 64, plants: 5, tier: 'bush' },
  { id: 'ja', flag: '🇯🇵', name: 'Japanese', native: '日本語', words: 12, plants: 1, tier: 'sprout' },
];

// Languages you can add — native + English names (searchable).
const ADDABLE = [
  { id: 'de', flag: '🇩🇪', name: 'German', native: 'Deutsch' },
  { id: 'it', flag: '🇮🇹', name: 'Italian', native: 'Italiano' },
  { id: 'pt', flag: '🇵🇹', name: 'Portuguese', native: 'Português' },
  { id: 'ko', flag: '🇰🇷', name: 'Korean', native: '한국어' },
  { id: 'zh', flag: '🇨🇳', name: 'Chinese', native: '中文' },
  { id: 'nl', flag: '🇳🇱', name: 'Dutch', native: 'Nederlands' },
  { id: 'hi', flag: '🇮🇳', name: 'Hindi', native: 'हिन्दी' },
  { id: 'ar', flag: '🇸🇦', name: 'Arabic', native: 'العربية' },
  { id: 'sv', flag: '🇸🇪', name: 'Swedish', native: 'Svenska' },
  { id: 'pl', flag: '🇵🇱', name: 'Polish', native: 'Polski' },
];

const START_LEVELS = [
  { id: 'new', icon: '🌰', label: 'Brand new', sub: 'Start from a seed' },
  { id: 'some', icon: '🌱', label: 'I know some', sub: 'Skip the basics' },
  { id: 'inter', icon: '🌿', label: 'Intermediate', sub: 'Jump further ahead' },
];

function CourseRow({ c, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
      background: active ? '#EFF7EA' : '#fff', border: `1.5px solid ${active ? SPROUT.green : SPROUT.line}`,
      borderRadius: 16, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 13, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
    }}>
      <div style={{ fontSize: 30, flexShrink: 0, lineHeight: 1 }}>{c.flag}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 16, fontWeight: 900 }}>{c.name}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>{c.native}</span>
          {active && <span style={{ fontSize: 9.5, fontWeight: 900, color: SPROUT.greenDark, background: '#DCEFD2', padding: '2px 7px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: 0.5 }}>Active</span>}
        </div>
        <div style={{ fontSize: 12, fontWeight: 800, color: SPROUT.mute, marginTop: 2 }}>🌱 {c.plants} plants · {c.words} words</div>
      </div>
      {/* this course's own little garden */}
      <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 12, background: '#F1F6EC', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
        <MilestonePlant tier={c.tier} size={40}/>
      </div>
      {active && <Icon.Check size={20} color={SPROUT.green}/>}
    </button>
  );
}

function CourseSwitcher({ onClose }) {
  const [activeId, setActiveId] = React.useState('en');
  const [adding, setAdding] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [picked, setPicked] = React.useState(null);   // language being added
  const [level, setLevel] = React.useState(null);
  const [courses, setCourses] = React.useState(MY_COURSES);
  const [confirmSwap, setConfirmSwap] = React.useState(null); // course pending switch confirmation

  const results = ADDABLE.filter((l) => !courses.find((c) => c.id === l.id))
    .filter((l) => (l.name + l.native).toLowerCase().includes(query.toLowerCase()));

  const confirmAdd = () => {
    setCourses((cs) => [...cs, { ...picked, words: 0, plants: 0, tier: 'sprout' }]);
    setActiveId(picked.id);
    setAdding(false); setPicked(null); setLevel(null); setQuery('');
  };

  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 70, display: 'flex', alignItems: 'flex-end', background: 'rgba(20,30,20,0.45)', fontFamily: '"Nunito", system-ui' }}>
      <style>{`@keyframes csUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: SPROUT.bg, borderRadius: '22px 22px 0 0', padding: '16px 18px 26px', animation: 'csUp 280ms cubic-bezier(.2,.8,.2,1) both', maxHeight: '86%', overflow: 'auto', color: SPROUT.ink }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: SPROUT.line, margin: '0 auto 14px' }}/>

        {!adding ? (
          <React.Fragment>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 3 }}>My courses</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: SPROUT.mute, marginBottom: 16 }}>Each language grows its own garden 🌱 · your streak keeps them all</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              {courses.map((c) => <CourseRow key={c.id} c={c} active={c.id === activeId} onClick={() => { if (c.id !== activeId) setConfirmSwap(c); }}/>)}
            </div>
            <button onClick={() => setAdding(true)} style={{
              width: '100%', cursor: 'pointer', fontFamily: 'inherit', background: 'transparent',
              border: `2px dashed ${SPROUT.cream2}`, borderRadius: 16, padding: '14px 0', color: SPROUT.greenDark,
              fontSize: 14.5, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}><span style={{ fontSize: 18 }}>＋</span> Add a language 🌱</button>
          </React.Fragment>
        ) : picked ? (
          // starting-level step
          <React.Fragment>
            <button onClick={() => setPicked(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4, color: SPROUT.mute, fontWeight: 900, fontSize: 13, marginBottom: 12, padding: 0 }}>
              <Icon.ChevL size={18} color={SPROUT.mute}/> Back
            </button>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 44 }}>{picked.flag}</div>
              <div style={{ fontSize: 20, fontWeight: 900, marginTop: 4 }}>Growing {picked.name}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: SPROUT.mute }}>Where should this garden start?</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {START_LEVELS.map((l) => (
                <button key={l.id} onClick={() => setLevel(l.id)} style={{
                  width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                  background: level === l.id ? '#EFF7EA' : '#fff', border: `1.5px solid ${level === l.id ? SPROUT.green : SPROUT.line}`,
                  borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
                }}>
                  <span style={{ fontSize: 24 }}>{l.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 900 }}>{l.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>{l.sub}</div>
                  </div>
                  {level === l.id && <Icon.Check size={18} color={SPROUT.green}/>}
                </button>
              ))}
            </div>
            <PushButton size="lg" color={SPROUT.green} shadow={SPROUT.greenShadow} disabled={!level} onClick={confirmAdd} style={{ width: '100%' }}>
              Plant my {picked.name} garden
            </PushButton>
          </React.Fragment>
        ) : (
          // language picker step
          <React.Fragment>
            <button onClick={() => setAdding(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4, color: SPROUT.mute, fontWeight: 900, fontSize: 13, marginBottom: 12, padding: 0 }}>
              <Icon.ChevL size={18} color={SPROUT.mute}/> Back
            </button>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 12 }}>Add a language</div>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search languages…" autoFocus style={{
              width: '100%', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, padding: '12px 14px', marginBottom: 14,
              borderRadius: 13, border: `1.5px solid ${SPROUT.line}`, background: SPROUT.paper, outline: 'none', color: SPROUT.ink, boxSizing: 'border-box',
            }}/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {results.map((l) => (
                <button key={l.id} onClick={() => { setPicked(l); setLevel(null); }} style={{
                  width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                  background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14, padding: '12px 14px',
                  display: 'flex', alignItems: 'center', gap: 13, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
                }}>
                  <span style={{ fontSize: 28 }}>{l.flag}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 900 }}>{l.name}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>{l.native}</div>
                  </div>
                  <span style={{ fontSize: 20, color: SPROUT.greenDark, fontWeight: 900 }}>＋</span>
                </button>
              ))}
              {!results.length && <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: SPROUT.mute, padding: '20px 0' }}>No languages match “{query}”.</div>}
            </div>
          </React.Fragment>
        )}

        {/* Confirm before switching the whole course — prevents an accidental tap
            from swapping the active garden out from under the learner (Speak pattern). */}
        {confirmSwap && (
          <div onClick={() => setConfirmSwap(null)} style={{ position: 'absolute', inset: 0, zIndex: 5, display: 'flex', alignItems: 'flex-end', background: 'rgba(20,30,20,0.4)' }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: SPROUT.bg, borderRadius: '22px 22px 0 0', padding: '18px 18px 24px', boxShadow: '0 -10px 30px rgba(0,0,0,0.16)' }}>
              <div style={{ textAlign: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 40 }}>{confirmSwap.flag}</div>
                <div style={{ fontSize: 18, fontWeight: 900, marginTop: 6 }}>Switch to {confirmSwap.name}?</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: SPROUT.mute, marginTop: 4, lineHeight: 1.4 }}>Your {confirmSwap.name} garden picks up right where you left it. Your streak keeps growing across all courses. 🌱</div>
              </div>
              <button onClick={() => { setActiveId(confirmSwap.id); setConfirmSwap(null); }} style={{
                width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: SPROUT.green, color: '#fff', fontSize: 15.5, fontWeight: 900,
                borderRadius: 14, padding: '13px 0', boxShadow: `0 3px 0 ${SPROUT.greenShadow}`,
              }}>Switch garden</button>
              <button onClick={() => setConfirmSwap(null)} style={{
                width: '100%', marginTop: 8, border: 'none', background: 'transparent', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 13.5, fontWeight: 800, color: SPROUT.mute, padding: '6px 0',
              }}>Stay here</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { CourseSwitcher, MY_COURSES });
