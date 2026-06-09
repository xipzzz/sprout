// ─────────────────────────────────────────────────────────────
// Search — find a word, lesson, or Garden Tale fast.
//  • Type-ahead, results grouped into Words / Lessons / Tales
//  • Words show respelling + tap-to-hear audio; tap a word → detail sheet
//  • Pre-query state: Recent (with Clear) + Suggested (your weak words)
// English-only (Sprout teaches English): the secondary line is the respelling,
// not a translation. Calm + fast — a clean filtered list, no heavy results page.
// ─────────────────────────────────────────────────────────────

const SEARCH_LESSONS = [
  { title: 'Greetings', sub: 'Unit 1 · Getting started', queue: ['ex-mc', 'ex-arrange', 'ex-fill'] },
  { title: 'Numbers', sub: 'Unit 1 · Getting started', queue: ['ex-mc', 'ex-fill', 'ex-hear'] },
  { title: 'Colors', sub: 'Unit 1 · Getting started', queue: ['ex-mc', 'ex-match'] },
  { title: 'Food & drink', sub: 'Unit 2', queue: ['ex-mc', 'ex-arrange', 'ex-speak'] },
  { title: 'Around town', sub: 'Unit 3', queue: ['ex-hear', 'ex-arrange', 'ex-fill'] },
  { title: 'Family & home', sub: 'Unit 4', queue: ['ex-mc', 'ex-fill'] },
];
const SEARCH_TALES = [
  { title: 'Morning at the café', sub: 'Garden Tale · greetings, ordering', tale: 'cafe' },
];

function SearchOverlay({ onClose, onStartLesson, onOpenTale }) {
  const [q, setQ] = React.useState('');
  const [recent, setRecent] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('sprout.recentSearch') || '[]'); } catch (e) { return []; }
  });
  const [openWord, setOpenWord] = React.useState(null);
  const [stars, setStars] = React.useState({});
  const vocab = window.VOCAB || [];

  const remember = (term) => {
    const next = [term, ...recent.filter((r) => r !== term)].slice(0, 6);
    setRecent(next);
    try { localStorage.setItem('sprout.recentSearch', JSON.stringify(next)); } catch (e) {}
  };
  const clearRecent = () => { setRecent([]); try { localStorage.removeItem('sprout.recentSearch'); } catch (e) {} };

  const query = q.trim().toLowerCase();
  const hit = (s) => s.toLowerCase().includes(query);
  const wordHits = query ? vocab.filter((w) => hit(w.en) || hit(w.re) || hit(w.ex)) : [];
  const lessonHits = query ? SEARCH_LESSONS.filter((l) => hit(l.title) || hit(l.sub)) : [];
  const taleHits = query ? SEARCH_TALES.filter((t) => hit(t.title) || hit(t.sub)) : [];
  const nResults = wordHits.length + lessonHits.length + taleHits.length;
  const weak = vocab.filter((w) => w.strength <= 2);

  const Group = ({ label, children }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.7, margin: '0 2px 8px' }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  );

  const WordRow = ({ w }) => {
    const b = (window.VOCAB_BUCKETS || []).find((x) => x.test(w.strength));
    return (
      <div onClick={() => { remember(w.en); setOpenWord(w); }} style={{
        display: 'flex', alignItems: 'center', gap: 12, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`,
        borderRadius: 14, padding: '11px 13px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, cursor: 'pointer',
      }}>
        <div style={{ flexShrink: 0 }}><WiltPlant strength={w.strength} size={26}/></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div onClick={(e) => e.stopPropagation()}><SpeakableWord size={15.5}>{w.en}</SpeakableWord></div>
          <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute, marginTop: 1 }}>{w.re} · {w.src}</div>
        </div>
        {b && <span style={{ flexShrink: 0, fontSize: 9.5, fontWeight: 900, color: b.ink, background: b.chip, borderRadius: 999, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: 0.4 }}>{b.label}</span>}
        <Icon.ChevR size={16} color={SPROUT.mute}/>
      </div>
    );
  };

  const JumpRow = ({ icon, title, sub, onClick }) => (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', fontFamily: 'inherit',
      background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14, padding: '11px 13px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, cursor: 'pointer',
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: SPROUT.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 900 }}>{title}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>{sub}</div>
      </div>
      <Icon.ChevR size={16} color={SPROUT.mute}/>
    </button>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: SPROUT.bg, display: 'flex', flexDirection: 'column', fontFamily: '"Nunito", system-ui' }}>
      {/* search bar */}
      <div style={{ padding: '56px 14px 12px', display: 'flex', alignItems: 'center', gap: 9, borderBottom: `1px solid ${SPROUT.line}` }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: SPROUT.paper, border: `1.5px solid ${SPROUT.line}`, borderRadius: 13, padding: '0 12px', height: 44 }}>
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke={SPROUT.mute} strokeWidth="2" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M16 16l-3.5-3.5"/></svg>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search words, lessons, tales"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, color: SPROUT.ink }}/>
          {q && <button onClick={() => setQ('')} aria-label="Clear" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: SPROUT.mute, fontSize: 18, padding: 2 }}>×</button>}
        </div>
        <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 900, color: SPROUT.greenDark, padding: '0 4px' }}>Done</button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 14px 24px' }}>
        {!query ? (
          <React.Fragment>
            {recent.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 2px 8px' }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.7 }}>Recent</span>
                  <button onClick={clearRecent} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 800, color: SPROUT.greenDark }}>Clear</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {recent.map((r) => (
                    <button key={r} onClick={() => setQ(r)} style={{ border: `1px solid ${SPROUT.line}`, background: SPROUT.paper, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, color: SPROUT.ink, borderRadius: 999, padding: '7px 14px' }}>{r}</button>
                  ))}
                </div>
              </div>
            )}
            {/* Suggested — your weak words, nudging review */}
            <Group label="Suggested · words to water">
              {weak.slice(0, 4).map((w) => <WordRow key={w.en} w={w}/>)}
            </Group>
          </React.Fragment>
        ) : nResults === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 30px', color: SPROUT.mute }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🌱</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: SPROUT.ink }}>Nothing growing under “{q}”</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>Try another word or lesson name.</div>
          </div>
        ) : (
          <React.Fragment>
            {wordHits.length > 0 && <Group label={`Words · ${wordHits.length}`}>{wordHits.map((w) => <WordRow key={w.en} w={w}/>)}</Group>}
            {lessonHits.length > 0 && <Group label={`Lessons · ${lessonHits.length}`}>{lessonHits.map((l) => <JumpRow key={l.title} icon="📘" title={l.title} sub={l.sub} onClick={() => { remember(l.title); onStartLesson && onStartLesson({ title: l.title, queue: l.queue }); }}/>)}</Group>}
            {taleHits.length > 0 && <Group label={`Garden Tales · ${taleHits.length}`}>{taleHits.map((t) => <JumpRow key={t.title} icon="📖" title={t.title} sub={t.sub} onClick={() => { remember(t.title); onOpenTale && onOpenTale(t.tale); }}/>)}</Group>}
          </React.Fragment>
        )}
      </div>

      {openWord && <WordDetailSheet word={openWord} starred={!!stars[openWord.en]} onStar={() => setStars((s) => ({ ...s, [openWord.en]: !s[openWord.en] }))} onClose={() => setOpenWord(null)}/>}
    </div>
  );
}

Object.assign(window, { SearchOverlay, SEARCH_LESSONS, SEARCH_TALES });
