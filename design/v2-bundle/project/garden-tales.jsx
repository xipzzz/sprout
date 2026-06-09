// ─────────────────────────────────────────────────────────────
// Garden Tales — short illustrated narrative stories (Sprout's take on
// Duolingo Stories). Tap-to-advance dialogue between Pip and a friend,
// 1–2 inline comprehension checks, lesson chrome (progress + X), and a
// completion screen. Calm-mode friendly (no timers).
// Surfaced as a "Tale" node on the path AND a shelf in the Words tab.
// ─────────────────────────────────────────────────────────────

// Cast — Pip (green) + Fern, a sun-yellow sprout friend. Distinct hues.
const TALE_CAST = {
  pip:  { name: 'Pip',  body: '#6FBF5E', leaf: '#8AD577', side: 'right' },
  fern: { name: 'Fern', body: '#F5B94A', leaf: '#F7CE6E', side: 'left' },
};

// One full tale. Items are revealed one tap at a time.
// Each spoken line carries: `gloss` (a plain-English paraphrase for comprehension)
// and `teach` (the key vocabulary this line introduces — boxed in the bubble).
// `glossary` gives a short English meaning for tappable words/phrases.
const TALE_GLOSSARY = {
  'good morning': 'A friendly greeting used early in the day.',
  'morning': 'The early part of the day, before noon.',
  'welcome': 'A warm greeting to someone who arrives.',
  'café': 'A small shop that sells coffee and snacks.',
  'hello': 'A word you say to greet someone.',
  'beautiful': 'Very pleasant and nice to see.',
  'drink': 'Something you sip, like coffee or water.',
  'today': 'This present day.',
  'coffee': 'A warm brown drink made from roasted beans.',
  'please': 'A polite word used when you ask for something.',
  'coins': 'Small, round pieces of metal money.',
  'three': 'The number 3.',
  'thank you': 'A polite phrase to show you are grateful.',
  'lovely': 'Very nice or pleasant.',
};

const TALES = {
  cafe: {
    id: 'cafe',
    title: 'Morning at the café',
    subtitle: 'Greetings · ordering · numbers',
    minutes: 2,
    xp: 15,
    glossary: TALE_GLOSSARY,
    // Establishing shot — an illustrated backdrop + one-line scene-setter (Duo Stories).
    scene: { backdrop: 'cafe', where: 'The morning café', line: 'Pip stops in for breakfast and a warm coffee ☕' },
    // Finishing a tale grows a plant in the Garden, themed to the story.
    bloom: { name: 'Café Bloom', tier: 'bush' },
    items: [
      { type: 'line', who: 'fern', text: 'Good morning! Welcome to the café.', gloss: 'A friendly hello as you arrive.', teach: ['Good morning', 'Welcome', 'café'] },
      { type: 'line', who: 'pip',  text: 'Hello, Fern! It is a beautiful morning.', gloss: 'Pip says hi and likes the day.', teach: ['Hello', 'beautiful'] },
      { type: 'line', who: 'fern', text: 'What would you like to drink today?', gloss: 'Fern asks what Pip wants.', teach: ['drink', 'today'] },
      { type: 'line', who: 'pip',  text: 'I would like a coffee, please.', gloss: 'Pip orders politely.', teach: ['coffee', 'please'] },
      { type: 'check', who: 'fern',
        q: 'What does Pip want to drink?',
        options: ['A coffee', 'A glass of water', 'An orange juice'],
        answer: 0,
        good: 'Yes — Pip asked for a coffee!',
        bad: 'Listen again — Pip said “a coffee, please.”' },
      { type: 'line', who: 'fern', text: 'One coffee. That will be three coins.', gloss: 'The coffee costs three coins.', teach: ['three', 'coins'] },
      { type: 'line', who: 'pip',  text: 'Here you are. Thank you, Fern!', gloss: 'Pip pays and thanks Fern.', teach: ['Thank you'] },
      { type: 'line', who: 'fern', text: 'Thank you! Have a lovely morning.', gloss: 'Fern wishes Pip well.', teach: ['lovely'] },
      { type: 'fill', who: 'pip',
        before: 'I love', after: 'in the morning.',
        options: ['coffee', 'numbers', 'evening'],
        answer: 0,
        good: 'Perfect — “I love coffee in the morning.”',
        bad: 'Try again — what was Pip drinking?' },
    ],
  },
};

// Renders a line's text with: taught phrases boxed (highlighted), and any
// glossary word/phrase tappable with a dotted underline. Calls onWord(word, def).
function renderTaleText(text, teach, glossary, onWord) {
  const g = glossary || {};
  const phrases = (teach || []).slice().sort((a, b) => b.length - a.length);
  // 1) split out the boxed (taught) phrases
  let segs = [{ box: false, text }];
  phrases.forEach((ph) => {
    const esc = ph.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${esc})`, 'i');
    const next = [];
    segs.forEach((s) => {
      if (s.box) { next.push(s); return; }
      let rest = s.text, m;
      while ((m = rest.match(re)) && m.index != null) {
        if (m.index > 0) next.push({ box: false, text: rest.slice(0, m.index) });
        next.push({ box: true, text: m[0] });
        rest = rest.slice(m.index + m[0].length);
      }
      if (rest) next.push({ box: false, text: rest });
    });
    segs = next;
  });
  // 2) render each segment; tokenize plain runs for glossary words
  const out = [];
  segs.forEach((s, si) => {
    const def = g[s.text.trim().toLowerCase()];
    if (s.box) {
      out.push(
        <span key={`b${si}`} onClick={(e) => { e.stopPropagation(); if (def) onWord(s.text.trim(), def); }}
          style={{
            background: '#FBF1D6', borderRadius: 6, padding: '0 4px', margin: '0 1px',
            boxShadow: `inset 0 -2px 0 ${SPROUT.sun}`, fontWeight: 800,
            cursor: def ? 'pointer' : 'default', whiteSpace: 'nowrap',
          }}>{s.text}</span>
      );
      return;
    }
    const parts = s.text.match(/[A-Za-zÀ-ÿ']+|[^A-Za-zÀ-ÿ']+/g) || [s.text];
    parts.forEach((p, pi) => {
      const key = p.toLowerCase();
      if (/[a-zà-ÿ]/i.test(p) && g[key]) {
        out.push(
          <span key={`${si}-${pi}`} onClick={(e) => { e.stopPropagation(); onWord(p, g[key]); }}
            style={{ borderBottom: `2px dotted ${SPROUT.mute}`, cursor: 'pointer' }}>{p}</span>
        );
      } else {
        out.push(<React.Fragment key={`${si}-${pi}`}>{p}</React.Fragment>);
      }
    });
  });
  return out;
}

// Illustrated café backdrop — a warm establishing shot the tale opens on.
function CafeScene({ height = 132 }) {
  return (
    <svg width="100%" height={height} viewBox="0 0 340 132" preserveAspectRatio="xMidYMax slice" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="cafeWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FBEFD6"/>
          <stop offset="1" stopColor="#F3E1BF"/>
        </linearGradient>
      </defs>
      {/* warm wall */}
      <rect x="0" y="0" width="340" height="132" fill="url(#cafeWall)"/>
      {/* striped awning */}
      <g>
        <rect x="0" y="0" width="340" height="22" fill="#6FBF5E"/>
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={i} x={i * 36} y="0" width="18" height="22" fill="#8AD577"/>
        ))}
        <path d="M0 22 h340 l-12 14 h-22 l8 -14 h-28 l-8 14 h-22 l8 -14 h-28 l-8 14 h-22 l8 -14 h-28 l-8 14 h-22 l8 -14 h-28 l-8 14 H40 l8 -14 H20 l-8 14 H0z" fill="#5BA84C"/>
      </g>
      {/* CAFÉ sign */}
      <g transform="translate(170 58)">
        <rect x="-40" y="-16" width="80" height="30" rx="8" fill="#fff" stroke="#E8DFCE" strokeWidth="2"/>
        <text x="0" y="6" textAnchor="middle" fontFamily='"Nunito", system-ui' fontSize="18" fontWeight="900" fill="#6B5B45" letterSpacing="2">CAFÉ</text>
      </g>
      {/* counter */}
      <rect x="0" y="104" width="340" height="28" fill="#C68A5B"/>
      <rect x="0" y="104" width="340" height="6" fill="#B07A4C"/>
      {/* steaming coffee cup on the counter */}
      <g transform="translate(60 86)">
        <path d="M-4 -8 q0 -10 4 -14" stroke="#D9C7A8" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8"/>
        <path d="M6 -8 q0 -12 -2 -16" stroke="#D9C7A8" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6"/>
        <rect x="-10" y="0" width="22" height="16" rx="3" fill="#fff" stroke="#E0D4BE" strokeWidth="1.5"/>
        <path d="M12 3 q8 0 8 5 q0 5 -8 5" fill="none" stroke="#E0D4BE" strokeWidth="2.5"/>
      </g>
      {/* potted plant on the other end */}
      <g transform="translate(286 80)">
        <path d="M0 24 V8" stroke="#5C9E47" strokeWidth="4" strokeLinecap="round"/>
        <path d="M0 14 q-12 -3 -16 -13 q12 -1 16 9z" fill="#6FBF5E"/>
        <path d="M0 10 q12 -4 16 -14 q-12 -1 -16 11z" fill="#4D9E3F"/>
        <rect x="-9" y="22" width="18" height="12" rx="2" fill="#E08A5B"/>
      </g>
    </svg>
  );
}

// Opening scene card — establishing backdrop + where/what one-liner (Duo Stories).
function TaleScene({ tale }) {
  const sc = tale.scene || {};
  return (
    <div style={{
      borderRadius: 18, overflow: 'hidden', border: `2px solid ${SPROUT.line}`,
      boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, background: SPROUT.paper, marginBottom: 2,
      animation: 'gtLineIn .4s cubic-bezier(.2,.8,.2,1) both',
    }}>
      <CafeScene/>
      <div style={{ padding: '11px 14px 13px' }}>
        <div style={{ fontSize: 11, fontWeight: 900, color: SKILL_META.story.color, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 }}>{sc.where || 'A short tale'}</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: SPROUT.ink, lineHeight: 1.35 }}>{sc.line || tale.subtitle}</div>
      </div>
    </div>
  );
}

// A friend/Pip avatar in a soft ring.
function TaleAvatar({ who, mood = 'happy', size = 52 }) {
  const c = TALE_CAST[who] || TALE_CAST.pip;
  return (
    <div style={{
      width: size + 10, height: size + 10, borderRadius: '50%', flexShrink: 0,
      background: SPROUT.paper, border: `2px solid ${c.body}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 2px 0 rgba(0,0,0,0.06)',
    }}>
      <Pip size={size} mood={mood} body={c.body} leaf={c.leaf}/>
    </div>
  );
}

// A single spoken line — avatar + bubble + tappable audio cue.
// Bubble text boxes the taught vocabulary and makes glossary words tappable
// (dotted underline) to reveal a short English meaning. A plain-English gloss
// sits beneath the bubble for comprehension.
function TaleLine({ who, text, gloss, teach, glossary, active }) {
  const c = TALE_CAST[who] || TALE_CAST.pip;
  const isLeft = c.side === 'left';
  const [playing, setPlaying] = React.useState(false);
  const [pop, setPop] = React.useState(null); // { word, def }
  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'flex-end',
      flexDirection: isLeft ? 'row' : 'row-reverse',
      opacity: active ? 1 : 0.55, transition: 'opacity .3s',
      animation: active ? 'gtLineIn .35s cubic-bezier(.2,.8,.2,1) both' : 'none',
    }}>
      <TaleAvatar who={who} mood="happy" size={46}/>
      <div style={{ maxWidth: '76%' }}>
        <div style={{ fontSize: 11, fontWeight: 900, color: c.body, marginBottom: 3, textAlign: isLeft ? 'left' : 'right', letterSpacing: 0.3 }}>{c.name}</div>
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'relative', background: SPROUT.paper,
            border: `2px solid ${SPROUT.line}`, borderRadius: 16,
            [isLeft ? 'borderTopLeftRadius' : 'borderTopRightRadius']: 4,
            padding: '11px 13px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
            display: 'flex', alignItems: 'flex-start', gap: 9,
          }}>
            <button onClick={() => { setPlaying(true); setTimeout(() => setPlaying(false), 700); }} style={{
              flexShrink: 0, border: 'none', cursor: 'pointer', padding: 0, marginTop: 1,
              width: 26, height: 26, borderRadius: '50%', background: c.body,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: playing ? 'scale(1.15)' : 'scale(1)', transition: 'transform .15s',
            }} aria-label="Play line">
              <Icon.Volume size={14} color="#fff"/>
            </button>
            <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.45, color: SPROUT.ink }}>
              {renderTaleText(text, teach, glossary, (word, def) => setPop({ word, def }))}
            </div>
          </div>

          {/* word/phrase definition popover (English-only) */}
          {pop && (
            <React.Fragment>
              <div onClick={() => setPop(null)} style={{ position: 'fixed', inset: 0, zIndex: 9 }}/>
              <div style={{
                position: 'absolute', bottom: 'calc(100% + 8px)', [isLeft ? 'left' : 'right']: 8, zIndex: 10,
                width: 200, background: SPROUT.ink, color: '#fff', borderRadius: 12, padding: '10px 12px',
                boxShadow: '0 8px 22px rgba(0,0,0,0.25)', animation: 'gtPopIn .16s ease both',
              }}>
                <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 2, color: SPROUT.sun }}>{pop.word}</div>
                <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.35, opacity: 0.92 }}>{pop.def}</div>
                <div style={{ position: 'absolute', top: '100%', [isLeft ? 'left' : 'right']: 18, width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: `6px solid ${SPROUT.ink}` }}/>
              </div>
            </React.Fragment>
          )}
        </div>

        {/* plain-English gloss for comprehension */}
        {gloss && (
          <div style={{ fontSize: 12.5, fontWeight: 600, color: SPROUT.mute, marginTop: 5, fontStyle: 'italic', textAlign: isLeft ? 'left' : 'right', paddingLeft: isLeft ? 2 : 0, paddingRight: isLeft ? 0 : 2 }}>
            {gloss}
          </div>
        )}
      </div>
    </div>
  );
}

// Inline comprehension check — a question with tappable options.
function TaleCheck({ item, onResolved }) {
  const [sel, setSel] = React.useState(null);
  const isFill = item.type === 'fill';
  const correct = sel !== null && sel === item.answer;
  const wrong = sel !== null && sel !== item.answer;

  const choose = (i) => {
    if (correct) return; // lock once right
    setSel(i);
    if (i === item.answer) setTimeout(() => onResolved(), 650);
  };

  return (
    <div style={{
      background: SPROUT.cream, border: `2px dashed ${SPROUT.line}`, borderRadius: 18,
      padding: '14px 14px 16px', animation: 'gtLineIn .35s both',
    }}>
      <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Quick check</div>

      {isFill ? (
        <div style={{ fontSize: 17, fontWeight: 800, color: SPROUT.ink, marginBottom: 12, lineHeight: 1.4 }}>
          {item.before}{' '}
          <span style={{
            display: 'inline-block', minWidth: 70, textAlign: 'center', padding: '1px 10px',
            borderBottom: `3px solid ${correct ? SPROUT.green : SPROUT.sun}`,
            color: correct ? SPROUT.greenDark : SPROUT.mute, fontWeight: 900,
          }}>{sel !== null ? item.options[sel] : '\u00A0'}</span>{' '}
          {item.after}
        </div>
      ) : (
        <div style={{ fontSize: 17, fontWeight: 800, color: SPROUT.ink, marginBottom: 12, lineHeight: 1.3 }}>{item.q}</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {item.options.map((o, i) => {
          const on = i === sel;
          let bg = '#fff', border = SPROUT.line, ink = SPROUT.ink;
          if (on && correct) { bg = '#E8F8E2'; border = SPROUT.green; ink = SPROUT.greenDark; }
          else if (on && wrong) { bg = '#FBE6E6'; border = SPROUT.coral; ink = '#A0322A'; }
          return (
            <button key={i} onClick={() => choose(i)} style={{
              textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
              background: bg, border: `2px solid ${border}`, color: ink,
              borderRadius: 13, padding: '11px 13px', fontSize: 15, fontWeight: 800,
              boxShadow: `0 2px 0 ${border}55`,
            }}>{o}</button>
          );
        })}
      </div>

      {sel !== null && (
        <div style={{ marginTop: 10, fontSize: 13, fontWeight: 800, color: correct ? SPROUT.greenDark : '#A0322A' }}>
          {correct ? item.good : item.bad}
        </div>
      )}
    </div>
  );
}

// Gathers the unique key phrases the tale taught — these become collectible
// "seeds" added to the Words tab on completion.
function taleSeeds(tale) {
  const seen = new Set();
  const seeds = [];
  (tale.items || []).forEach((it) => {
    (it.teach || []).forEach((ph) => {
      const k = ph.toLowerCase();
      if (!seen.has(k)) { seen.add(k); seeds.push(ph); }
    });
  });
  return seeds;
}

function TaleComplete({ tale, calm, onContinue }) {
  const [replay, setReplay] = React.useState(false);
  const [share, setShare] = React.useState(false);
  const bloom = tale.bloom || { name: 'Tale Bloom', tier: 'bush' };
  const seeds = taleSeeds(tale);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 5, background: calm ? '#F1F6EC' : SPROUT.bg, display: 'flex', flexDirection: 'column', fontFamily: '"Nunito", system-ui' }}>
      <style>{`@keyframes gtPop{0%{transform:scale(.5);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}@keyframes gtSeed{from{transform:translateY(8px) scale(.85);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}`}</style>
      {!calm && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {Array.from({ length: 20 }).map((_, i) => {
            const colors = ['#F5B94A', '#6FBF5E', '#F47A7A', '#A8D8EA'];
            return <div key={i} style={{ position: 'absolute', left: `${(i * 41) % 100}%`, top: 0, width: 8, height: 8, borderRadius: i % 2 ? '50%' : 2, background: colors[i % colors.length], animation: `smFall ${2 + (i % 4) * 0.4}s linear ${(i % 6) * 0.2}s infinite` }}/>;
          })}
        </div>
      )}

      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '46px 24px 8px' }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: SPROUT.ink }}>Tale complete! 🌱</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: SPROUT.mute, marginTop: 6, maxWidth: 280, lineHeight: 1.4 }}>
          {calm ? `You read “${tale.title}”. Lovely.` : `You read “${tale.title}” and answered every check.`}
        </div>

        {/* Garden payoff — the tale grew a plant in your Garden */}
        <div style={{ marginTop: 14, position: 'relative', animation: 'gtPop .6s cubic-bezier(.2,.9,.3,1.2) both' }}>
          <MilestonePlant tier={bloom.tier} size={150}/>
          <div style={{ position: 'absolute', right: -6, top: 6, background: SPROUT.paper, border: `2px solid ${SPROUT.line}`, borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: `0 2px 0 ${SPROUT.cardShadow}` }}>🌸</div>
        </div>
        <div style={{ fontSize: 17, fontWeight: 900, color: SPROUT.greenDark, marginTop: 2 }}>You grew a {bloom.name}</div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: SPROUT.mute, marginTop: 2 }}>Added to your Garden</div>

        {!calm && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14, padding: '9px 16px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}` }}>
            <Icon.Star size={18} color={SPROUT.sun}/>
            <span style={{ fontSize: 15, fontWeight: 900, color: SPROUT.ink }}>+{tale.xp} XP</span>
          </div>
        )}

        {/* Collected key phrases drop into Words as seeds */}
        {seeds.length > 0 && (
          <div style={{ marginTop: 18, width: '100%', maxWidth: 320, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 16, padding: '13px 14px 15px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}` }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 9 }}>{seeds.length} new seeds for your Words 🌱</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center' }}>
              {seeds.map((s, i) => (
                <span key={s} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5, background: SKILL_META.story.bg,
                  border: `1px solid ${SPROUT.line}`, borderRadius: 999, padding: '5px 11px',
                  fontSize: 13, fontWeight: 800, color: SPROUT.ink,
                  animation: `gtSeed .3s cubic-bezier(.2,.9,.3,1.3) ${0.15 + i * 0.06}s both`,
                }}>
                  <span style={{ fontSize: 11 }}>🌱</span>{s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* actions */}
      <div style={{ flexShrink: 0, padding: '12px 18px 26px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {/* Replay the whole conversation (Babbel's "Listen to dialogue") */}
          <button onClick={() => setReplay(true)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: `2px solid ${SPROUT.line}`, cursor: 'pointer', fontFamily: 'inherit', background: SPROUT.paper, color: SPROUT.ink, fontSize: 14, fontWeight: 900, borderRadius: 14, padding: '12px 8px', boxShadow: `0 3px 0 ${SPROUT.cardShadow}` }}>
            <Icon.Volume size={16} color={SPROUT.green}/> Replay
          </button>
          {/* Share the bloom this tale grew */}
          <button onClick={() => setShare(true)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: `2px solid ${SPROUT.line}`, cursor: 'pointer', fontFamily: 'inherit', background: SPROUT.paper, color: SPROUT.ink, fontSize: 14, fontWeight: 900, borderRadius: 14, padding: '12px 8px', boxShadow: `0 3px 0 ${SPROUT.cardShadow}` }}>
            <Icon.Share size={16} color={SPROUT.greenDark}/> Share
          </button>
        </div>
        <button onClick={onContinue} style={{ width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: SPROUT.green, color: '#fff', fontSize: 17, fontWeight: 900, letterSpacing: 0.4, textTransform: 'uppercase', borderRadius: 16, padding: '15px 0', boxShadow: `0 4px 0 ${SPROUT.greenShadow}` }}>Continue</button>
      </div>

      {replay && <TaleReplay tale={tale} onClose={() => setReplay(false)}/>}
      {share && <TaleShareOverlay tale={tale} bloom={bloom} seeds={seeds} onClose={() => setShare(false)}/>}
    </div>
  );
}

// Shareable card for a finished tale — the bloom it grew + the phrases learned.
function TaleShareOverlay({ tale, bloom, seeds, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 24, background: 'rgba(20,30,40,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'gtPopIn .2s ease both' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 300, background: SPROUT.paper, borderRadius: 24, overflow: 'hidden', boxShadow: '0 18px 50px rgba(0,0,0,0.3)' }}>
        <div style={{ background: `linear-gradient(180deg, ${SKILL_META.story.bg}, #fff)`, padding: '22px 20px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: SKILL_META.story.color, textTransform: 'uppercase', letterSpacing: 1 }}>Garden Tale</div>
          <div style={{ fontSize: 19, fontWeight: 900, color: SPROUT.ink, marginTop: 2 }}>{tale.title}</div>
          <div style={{ margin: '6px 0 0' }}><MilestonePlant tier={bloom.tier} size={132}/></div>
          <div style={{ fontSize: 15, fontWeight: 900, color: SPROUT.greenDark, marginTop: -4 }}>I grew a {bloom.name} 🌸</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 12 }}>
            {seeds.slice(0, 5).map((s) => (
              <span key={s} style={{ background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 999, padding: '3px 9px', fontSize: 11.5, fontWeight: 800, color: SPROUT.mute }}>{s}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px 0 14px', borderTop: `1px solid ${SPROUT.line}` }}>
          <span style={{ width: 22, height: 22, borderRadius: 6, background: SPROUT.green, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 13 }}>↑</span>
          <span style={{ fontSize: 14, fontWeight: 900, color: SPROUT.ink }}>Sprout</span>
        </div>
        <button onClick={onClose} style={{ width: '100%', border: 'none', borderTop: `1px solid ${SPROUT.line}`, cursor: 'pointer', fontFamily: 'inherit', background: SPROUT.cream, color: SPROUT.ink, fontSize: 14, fontWeight: 900, padding: '13px 0' }}>Done</button>
      </div>
    </div>
  );
}

// Replays the dialogue end-to-end as continuous audio — auto-advancing
// transcript with the active speaker highlighted (Babbel's "Listen to dialogue").
function TaleReplay({ tale, onClose }) {
  const lines = tale.items.filter((it) => it.type === 'line');
  const [idx, setIdx] = React.useState(0);
  const [playing, setPlaying] = React.useState(true);
  const listRef = React.useRef(null);
  const rowRefs = React.useRef({});

  React.useEffect(() => {
    if (!playing) return;
    if (idx >= lines.length) { setPlaying(false); return; }
    const t = setTimeout(() => setIdx((i) => i + 1), 1400);
    return () => clearTimeout(t);
  }, [idx, playing, lines.length]);

  React.useEffect(() => {
    const row = rowRefs.current[idx];
    const list = listRef.current;
    if (row && list) list.scrollTop = row.offsetTop - list.clientHeight / 2 + row.clientHeight / 2;
  }, [idx]);

  const done = idx >= lines.length;
  const restart = () => { setIdx(0); setPlaying(true); };

  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(20,30,40,0.55)', display: 'flex', alignItems: 'flex-end', animation: 'gtPopIn .2s ease both' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxHeight: '80%', display: 'flex', flexDirection: 'column', background: SPROUT.bg, borderRadius: '24px 24px 0 0', padding: '18px 18px 26px', boxShadow: '0 -10px 30px rgba(0,0,0,0.18)' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: SPROUT.line, margin: '0 auto 14px', flexShrink: 0 }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexShrink: 0 }}>
          <span style={{ width: 34, height: 34, borderRadius: '50%', background: done ? SPROUT.cream2 : SPROUT.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: done ? 'none' : 'gtPulse 1.4s ease-in-out infinite' }}>
            <Icon.Volume size={17} color={done ? SPROUT.mute : '#fff'}/>
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: SPROUT.ink }}>{done ? 'That’s the whole tale' : 'Listening to the tale…'}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>{tale.title}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'transparent', fontSize: 22, color: SPROUT.mute, cursor: 'pointer', width: 32, height: 32, lineHeight: 1, flexShrink: 0 }}>×</button>
        </div>

        <style>{`@keyframes gtPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}`}</style>

        <div ref={listRef} style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 9, padding: '2px 0' }}>
          {lines.map((ln, i) => {
            const c = TALE_CAST[ln.who] || TALE_CAST.pip;
            const isLeft = c.side === 'left';
            const isActive = i === idx;
            const isPast = i < idx;
            return (
              <div key={i} ref={(el) => { if (el) rowRefs.current[i] = el; }} style={{ display: 'flex', flexDirection: isLeft ? 'row' : 'row-reverse', gap: 8, opacity: isActive || isPast ? 1 : 0.4, transition: 'opacity .25s' }}>
                <div style={{ maxWidth: '80%', background: isActive ? '#fff' : 'transparent', border: `2px solid ${isActive ? c.body : 'transparent'}`, borderRadius: 14, padding: isActive ? '8px 11px' : '4px 11px', boxShadow: isActive ? `0 2px 0 ${SPROUT.cardShadow}` : 'none', transition: 'all .2s' }}>
                  <span style={{ fontSize: 10, fontWeight: 900, color: c.body, marginRight: 6 }}>{c.name}</span>
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: SPROUT.ink }}>{ln.text}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* transport scrubber — prev / pause-play / next, so any line can be replayed (Babbel) */}
        <div style={{ marginTop: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <button onClick={() => { setIdx((i) => Math.max(0, i - 1)); }} disabled={idx <= 0} aria-label="Previous line" style={{
            border: 'none', cursor: idx <= 0 ? 'default' : 'pointer', fontFamily: 'inherit',
            width: 46, height: 46, borderRadius: '50%', background: SPROUT.paper, border: `1.5px solid ${SPROUT.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: idx <= 0 ? 0.4 : 1,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11 3 L6 8 L11 13 M5 3 L5 13" stroke={SPROUT.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={() => { if (done) { restart(); } else { setPlaying((p) => !p); } }} aria-label={done ? 'Play again' : (playing ? 'Pause' : 'Play')} style={{
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            width: 60, height: 60, borderRadius: '50%', background: SPROUT.green,
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 3px 0 ${SPROUT.greenShadow}`,
          }}>
            {done
              ? <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 11a7 7 0 1 0 2-4.9 M6 3 V6.5 H9.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : playing
                ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="5" y="4" width="3.5" height="12" rx="1.4" fill="#fff"/><rect x="11.5" y="4" width="3.5" height="12" rx="1.4" fill="#fff"/></svg>
                : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 4 L16 10 L6 16 Z" fill="#fff"/></svg>}
          </button>
          <button onClick={() => { setPlaying(false); setIdx((i) => Math.min(lines.length, i + 1)); }} disabled={done} aria-label="Next line" style={{
            border: 'none', cursor: done ? 'default' : 'pointer', fontFamily: 'inherit',
            width: 46, height: 46, borderRadius: '50%', background: SPROUT.paper, border: `1.5px solid ${SPROUT.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: done ? 0.4 : 1,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 3 L10 8 L5 13 M11 3 L11 13" stroke={SPROUT.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// The full tale player.
function GardenTale({ tale: taleProp = 'cafe', calm = false, onExit, onComplete }) {
  const tale = typeof taleProp === 'string' ? (TALES[taleProp] || TALES.cafe) : taleProp;
  const items = tale.items;
  const [step, setStep] = React.useState(0);           // index of last-revealed item
  const [resolved, setResolved] = React.useState({});   // check index → true
  const [done, setDone] = React.useState(false);
  const threadRef = React.useRef(null);

  const current = items[step];
  const isGate = current && (current.type === 'check' || current.type === 'fill');
  const gateOpen = !isGate || resolved[step];

  React.useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [step, resolved]);

  const advance = () => {
    if (!gateOpen) return;
    if (step + 1 < items.length) setStep(step + 1);
    else setDone(true);
  };

  // progress across all items (+1 headroom, completes at the end)
  const progress = (step + (gateOpen ? 1 : 0)) / items.length;

  if (done) return <TaleComplete tale={tale} calm={calm} onContinue={onComplete} />;

  return (
    <div style={{ position: 'absolute', inset: 0, background: SPROUT.bg, display: 'flex', flexDirection: 'column', fontFamily: '"Nunito", system-ui' }}>
      <style>{`@keyframes gtLineIn{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes gtPopIn{from{transform:translateY(4px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

      {/* chrome — X + progress (matches lesson chrome) */}
      <div style={{ padding: `${LAYOUT.safeTop}px ${LAYOUT.padX}px 10px`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={onExit} style={{ border: 'none', background: 'transparent', fontSize: 22, color: SPROUT.mute, cursor: 'pointer', padding: 0, lineHeight: 1 }}>×</button>
        <div style={{ flex: 1, height: 14, borderRadius: 8, background: SPROUT.cream, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, right: `${(1 - progress) * 100}%`, background: `linear-gradient(180deg, #8AD577, ${SPROUT.green})`, borderRadius: 8, transition: 'right .3s ease' }}>
            <div style={{ position: 'absolute', top: 2, left: 4, right: 4, height: 4, background: 'rgba(255,255,255,0.5)', borderRadius: 4 }}/>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: SPROUT.mute, fontWeight: 900, fontSize: 12 }}>
          <Icon.Book size={16} color={SKILL_META.story.color}/>
        </div>
      </div>

      {/* conversation thread — opens on the illustrated scene */}
      <div ref={threadRef} style={{ flex: 1, overflow: 'auto', padding: '12px 16px 8px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <TaleScene tale={tale}/>
        {items.slice(0, step + 1).map((it, i) => {
          if (it.type === 'line') return <TaleLine key={i} who={it.who} text={it.text} gloss={it.gloss} teach={it.teach} glossary={tale.glossary} active={i === step}/>;
          // check / fill
          return (
            <TaleCheck key={i} item={it} onResolved={() => setResolved((r) => ({ ...r, [i]: true }))}/>
          );
        })}
      </div>

      {/* footer */}
      <div style={{ padding: '12px 16px 28px', borderTop: `1px solid ${SPROUT.line}`, background: SPROUT.paper, flexShrink: 0 }}>
        <button onClick={advance} disabled={!gateOpen} style={{
          width: '100%', border: 'none', cursor: gateOpen ? 'pointer' : 'default', fontFamily: 'inherit',
          background: gateOpen ? SPROUT.green : '#E3DAC8', color: gateOpen ? '#fff' : '#A99', 
          fontSize: 17, fontWeight: 900, letterSpacing: 0.4, textTransform: 'uppercase',
          borderRadius: 16, padding: '15px 0',
          boxShadow: gateOpen ? `0 4px 0 ${SPROUT.greenShadow}` : 'none',
        }}>
          {isGate && !gateOpen ? 'Pick an answer' : (step + 1 >= items.length ? 'Finish tale' : 'Continue')}
        </button>
      </div>
    </div>
  );
}

// "Garden Tales" shelf for the Words tab.
function GardenTalesShelf({ onOpenTale }) {
  const shelf = [
    { id: 'cafe', title: 'Morning at the café', sub: 'Greetings · ordering', minutes: 2, status: 'ready', reward: 15 },
    { id: 'park', title: 'A walk in the park', sub: 'Colors · numbers', minutes: 3, status: 'locked', reward: 20 },
    { id: 'market', title: 'At the market', sub: 'Food · counting', minutes: 3, status: 'locked', reward: 20 },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {shelf.map((t) => {
        const locked = t.status === 'locked';
        return (
          <button key={t.id} disabled={locked} onClick={() => !locked && onOpenTale(t.id)} style={{
            width: '100%', textAlign: 'left', cursor: locked ? 'default' : 'pointer', fontFamily: 'inherit',
            background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 16, padding: 12,
            display: 'flex', alignItems: 'center', gap: 12, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
            opacity: locked ? 0.6 : 1,
          }}>
            <div style={{
              width: 46, height: 46, borderRadius: 12, flexShrink: 0,
              background: locked ? SPROUT.cream : SKILL_META.story.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {locked
                ? <span style={{ fontSize: 18 }}>🔒</span>
                : <SkillIcon skill="story" size={22} color={SKILL_META.story.color}/>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: SPROUT.ink }}>{t.title}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>{t.sub} · {t.minutes} min</div>
            </div>
            {locked
              ? <Icon.ChevR size={20} color={SPROUT.mute}/>
              : (
                /* reward preview — the payoff is visible before you commit (Duo Stories) */
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0, background: '#EAF6E2', borderRadius: 999, padding: '5px 9px' }}>
                  <span style={{ fontSize: 13 }}>🌱</span>
                  <span style={{ fontSize: 12.5, fontWeight: 900, color: SPROUT.greenDark }}>+{t.reward}</span>
                </span>
              )}
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { GardenTale, GardenTalesShelf, TaleComplete, CafeScene, TaleScene, TaleShareOverlay, TALES, TALE_CAST });
