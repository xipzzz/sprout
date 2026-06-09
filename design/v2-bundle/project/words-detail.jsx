// ─────────────────────────────────────────────────────────────
// Words review engine — the vocabulary surface of the Words tab.
//   1. Mastery buckets (New seeds / Growing / Bloomed) with counts.
//   2. Per-word strength shown as a little plant that WILTS as the word
//      fades, plus a "Water your weak words 🌱" CTA that drills the faders.
//   3. Rich word-detail sheet: phonetic + audio + example + source + star.
// On-brand: a word you don't review wilts; watering it perks it back up.
// ─────────────────────────────────────────────────────────────

// strength 1–5. 1–2 = wilting/weak, 3 = growing, 4–5 = bloomed.
const VOCAB = [
  { en: 'morning',  ipa: '/ˈmɔːr.nɪŋ/',  re: 'MOR-ning',   strength: 1, ex: 'Good morning! How are you?',        src: 'Unit 1 · Getting started' },
  { en: 'colors',   ipa: '/ˈkʌl.ərz/',   re: 'KUH-lerz',   strength: 1, ex: 'I like bright colors.',             src: 'Unit 1 · Colors' },
  { en: 'numbers',  ipa: '/ˈnʌm.bərz/',  re: 'NUM-berz',   strength: 2, ex: 'Let’s count the numbers together.', src: 'Unit 1 · Numbers' },
  { en: 'please',   ipa: '/pliːz/',      re: 'PLEEZ',      strength: 2, ex: 'A coffee, please.',                  src: 'Café Garden Tale' },
  { en: 'coffee',   ipa: '/ˈkɔː.fi/',    re: 'KAW-fee',    strength: 3, ex: 'I drink coffee in the morning.',    src: 'Unit 2 · Food & drink' },
  { en: 'water',    ipa: '/ˈwɔː.tər/',   re: 'WAW-ter',    strength: 3, ex: 'Can I have some water?',            src: 'Unit 2 · Food & drink' },
  { en: 'drink',    ipa: '/drɪŋk/',      re: 'DRINGK',     strength: 4, ex: 'What would you like to drink?',      src: 'Unit 2 · Food & drink' },
  { en: 'hello',    ipa: '/həˈloʊ/',     re: 'huh-LOH',    strength: 5, ex: 'Hello! Nice to meet you.',          src: 'Unit 1 · Greetings' },
  { en: 'goodbye',  ipa: '/ɡʊdˈbaɪ/',    re: 'good-BYE',   strength: 5, ex: 'Goodbye, see you tomorrow!',         src: 'Unit 1 · Greetings' },
];

const VOCAB_BUCKETS = [
  { id: 'weak',   label: 'New seeds', sub: 'Need watering', color: SPROUT.coral, chip: '#FBE4E1', ink: '#C2564B', test: (s) => s <= 2 },
  { id: 'grow',   label: 'Growing',   sub: 'Coming along',  color: SPROUT.sun,   chip: '#FBEFC9', ink: '#9A7A1E', test: (s) => s === 3 },
  { id: 'bloom',  label: 'Bloomed',   sub: 'Mastered',      color: SPROUT.green, chip: '#E3F5DB', ink: '#4D9E3F', test: (s) => s >= 4 },
];

// A word's strength drawn as a wilting→upright sprout. Lower strength = more wilt.
function WiltPlant({ strength, size = 26 }) {
  const wilt = strength <= 2;
  const grow = strength === 3;
  const leanA = wilt ? -34 : grow ? -10 : 0;     // stem lean
  const leanB = wilt ? 30 : grow ? 12 : 4;
  const col = wilt ? SPROUT.coral : grow ? '#D9A93A' : SPROUT.green;
  const leaf = wilt ? '#E8A59C' : grow ? '#EDCB6E' : '#8AD577';
  const droop = wilt ? 6 : 0;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M12 22 V11" stroke={col} strokeWidth="2.2" strokeLinecap="round"/>
      {/* left leaf */}
      <path d={`M12 ${14+droop} q -7 ${leanA/6 - 2} -8 ${2+droop}`} stroke="none" />
      <ellipse cx={6.5} cy={15 + droop} rx="4.5" ry="2.6" fill={leaf} transform={`rotate(${leanA} 6.5 ${15+droop})`}/>
      {/* right leaf */}
      <ellipse cx={17.5} cy={12 + droop} rx="4.5" ry="2.6" fill={leaf} transform={`rotate(${leanB} 17.5 ${12+droop})`}/>
      {/* bud / bloom on top */}
      {strength >= 4
        ? <circle cx="12" cy="8" r="3.4" fill={col}/>
        : <circle cx="12" cy={10 + droop} r="2.6" fill={col}/>}
    </svg>
  );
}

// Tiny speaker, reused styling from the feedback drawer.
function WordSpeaker({ size = 26, accent = SPROUT.green }) {
  const [on, setOn] = React.useState(false);
  return (
    <button onClick={(e) => { e.stopPropagation(); setOn(true); setTimeout(() => setOn(false), 600); }}
      aria-label="Hear word" style={{
        width: size, height: size, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0,
        background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: on ? 'scale(1.18)' : 'scale(1)', transition: 'transform .15s',
      }}>
      <Icon.Volume size={size * 0.5} color="#fff"/>
    </button>
  );
}

// Rich detail sheet — phonetic, respelling, audio, example, source, star.
function WordDetailSheet({ word, starred, onStar, onClose }) {
  if (!word) return null;
  const bucket = VOCAB_BUCKETS.find((b) => b.test(word.strength));
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', background: 'rgba(20,30,40,0.45)', animation: 'wdFade 180ms ease both', fontFamily: '"Nunito", system-ui' }}>
      <style>{`@keyframes wdFade{from{opacity:0}to{opacity:1}} @keyframes wdSlide{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: SPROUT.bg, borderRadius: '24px 24px 0 0', padding: '16px 18px 26px', animation: 'wdSlide 300ms cubic-bezier(.2,.8,.2,1) both', boxShadow: '0 -10px 30px rgba(0,0,0,0.15)' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: SPROUT.line, margin: '0 auto 14px' }}/>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: bucket.chip, border: `1px solid ${SPROUT.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <WiltPlant strength={word.strength} size={36}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: SPROUT.ink }}>{word.en}</span>
              <WordSpeaker accent={SPROUT.green}/>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: SPROUT.mute, marginTop: 2, fontStyle: 'italic' }}>{word.ipa} · “{word.re}”</div>
          </div>
          <button onClick={() => onStar(word.en)} aria-label="Save word" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
            <Icon.Star size={26} color={SPROUT.sun} filled={starred}/>
          </button>
        </div>

        {/* strength */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 14, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 12, padding: '9px 12px' }}>
          <span style={{ fontSize: 10.5, fontWeight: 900, color: bucket.ink, background: bucket.chip, padding: '3px 9px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: 0.5 }}>{bucket.label}</span>
          <div style={{ display: 'flex', gap: 3, flex: 1 }}>
            {[1,2,3,4,5].map((n) => (
              <div key={n} style={{ flex: 1, height: 7, borderRadius: 3, background: n <= word.strength ? bucket.color : SPROUT.cream2 }}/>
            ))}
          </div>
        </div>

        {/* example + source */}
        <div style={{ marginTop: 12, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14, padding: '12px 13px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
            <span style={{ fontSize: 9.5, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.6 }}>In use</span>
            <WordSpeaker size={22} accent={SPROUT.sky === '#A8D8EA' ? '#5BA8C8' : SPROUT.mute}/>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: SPROUT.ink, fontStyle: 'italic', lineHeight: 1.35 }}>“{word.ex}”</div>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: SPROUT.mute, marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icon.Leaf size={13} color={SPROUT.green}/> Learned in {word.src}
          </div>
        </div>
      </div>
    </div>
  );
}

// The full Words review surface — buckets, weak-words CTA, per-word rows.
function WordsReview({ onStartLesson }) {
  const [open, setOpen] = React.useState(null);
  const [filter, setFilter] = React.useState('all');
  const [stars, setStars] = React.useState({});
  const toggleStar = (en) => setStars((s) => ({ ...s, [en]: !s[en] }));

  const counts = VOCAB_BUCKETS.map((b) => ({ ...b, n: VOCAB.filter((w) => b.test(w.strength)).length }));
  const weak = VOCAB.filter((w) => w.strength <= 2);
  const shown = filter === 'all' ? VOCAB : VOCAB.filter((w) => {
    const b = VOCAB_BUCKETS.find((x) => x.test(w.strength));
    return b && b.id === filter;
  });
  const sorted = [...shown].sort((a, b) => a.strength - b.strength);

  return (
    <div>
      {/* Water-your-weak-words CTA — drills exactly the fading words */}
      {weak.length > 0 && (
        <button onClick={() => onStartLesson && onStartLesson({ title: 'Water weak words', queue: lessonQueueFor({ kind: 'review' }) })} style={{
          width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
          background: 'linear-gradient(100deg, #FBE9E5 0%, #EFF7EA 120%)', border: `1px solid #F0D3CD`,
          borderRadius: 16, padding: '13px 14px', marginBottom: 18,
          display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 3px 0 #E7CEC8',
        }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <WiltPlant strength={1} size={28}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15.5, fontWeight: 900, color: SPROUT.ink }}>Water your weak words 🌱</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: SPROUT.mute }}>{weak.length} words are wilting — perk them back up</div>
          </div>
          <span style={{ fontSize: 19, color: '#C2564B', flexShrink: 0 }}>›</span>
        </button>
      )}

      {/* Mastery buckets — counts + tap to filter */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 9, marginBottom: 18 }}>
        {counts.map((b) => {
          const active = filter === b.id;
          return (
            <button key={b.id} onClick={() => setFilter(active ? 'all' : b.id)} style={{
              border: active ? `1.5px solid ${b.color}` : `1px solid ${SPROUT.line}`,
              background: active ? b.chip : '#fff', borderRadius: 14, padding: '11px 8px', cursor: 'pointer',
              fontFamily: 'inherit', textAlign: 'center', boxShadow: active ? 'none' : `0 2px 0 ${SPROUT.cardShadow}`,
            }}>
              <div style={{ fontSize: 23, fontWeight: 900, color: b.ink, lineHeight: 1 }}>{b.n}</div>
              <div style={{ fontSize: 11.5, fontWeight: 900, color: SPROUT.ink, marginTop: 4 }}>{b.label}</div>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: SPROUT.mute }}>{b.sub}</div>
            </button>
          );
        })}
      </div>

      {/* Word rows */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 2px 8px' }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: SPROUT.mute, letterSpacing: 1, textTransform: 'uppercase' }}>
          {filter === 'all' ? 'All words' : counts.find((b) => b.id === filter).label}
        </span>
        {filter !== 'all' && <button onClick={() => setFilter('all')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 800, color: SPROUT.greenDark }}>Show all</button>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map((w) => {
          const b = VOCAB_BUCKETS.find((x) => x.test(w.strength));
          return (
            <button key={w.en} onClick={() => setOpen(w)} style={{
              background: SPROUT.paper, borderRadius: 14, padding: '11px 13px', cursor: 'pointer', fontFamily: 'inherit',
              border: `1px solid ${SPROUT.line}`, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
              display: 'flex', alignItems: 'center', gap: 11, textAlign: 'left',
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: b.chip, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <WiltPlant strength={w.strength} size={26}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: SPROUT.ink }}>{w.en}</span>
                  {stars[w.en] && <Icon.Star size={13} color={SPROUT.sun} filled={true}/>}
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: SPROUT.mute, fontStyle: 'italic' }}>“{w.re}” · {w.ipa}</div>
              </div>
              <div style={{ display: 'flex', gap: 2.5, flexShrink: 0 }}>
                {[1,2,3,4,5].map((n) => (
                  <div key={n} style={{ width: 6, height: 15, borderRadius: 2, background: n <= w.strength ? b.color : SPROUT.cream2 }}/>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {open && <WordDetailSheet word={open} starred={!!stars[open.en]} onStar={toggleStar} onClose={() => setOpen(null)}/>}
    </div>
  );
}

Object.assign(window, { WordsReview, WordDetailSheet, WiltPlant, VOCAB, VOCAB_BUCKETS });
