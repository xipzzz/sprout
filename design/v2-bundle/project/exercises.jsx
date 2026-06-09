// ─────────────────────────────────────────────────────────────
// Lesson exercise screens — shared shell + 5 exercise types
// ─────────────────────────────────────────────────────────────

// Small "Don't know" affordance with a clear penalty indicator (costs water)
function DontKnow({ onClick }) {
  return (
    <button onClick={onClick} style={{ border: 'none', background: 'transparent', padding: '0 6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
      <span style={{ fontWeight: 800, fontSize: 13, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.5 }}>Don't know</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 800, color: '#3E88A8' }}>
        −1
        <svg width="9" height="11" viewBox="0 0 12 16"><path d="M6 1C6 1 1 7 1 10.5a5 5 0 0 0 10 0C11 7 6 1 6 1z" fill={SPROUT.sky} stroke="#3E88A8" strokeWidth="1"/></svg>
        <span style={{ fontSize: 9, color: '#3E88A8', opacity: 0.9 }}>water</span>
      </span>
    </button>
  );
}

function ExerciseShell({ progress = 0.4, hearts = 5, prompt, pipMood = 'happy', pipText, children, footer, onExit, steps = 5 }) {
  const [quitOpen, setQuitOpen] = React.useState(false);
  // segment the progress bar like Duolingo — fill N of `steps`
  const filled = Math.round(progress * steps);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: SPROUT.bg, color: SPROUT.ink, fontFamily: '"Nunito", system-ui' }}>
      {/* Top: close + progress + hearts */}
      <div style={{ padding: `${LAYOUT.safeTop}px ${LAYOUT.padX}px 10px`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => setQuitOpen(true)} aria-label="Quit lesson" style={{ border: 'none', background: 'transparent', fontSize: 22, color: SPROUT.mute, cursor: 'pointer', padding: 0, lineHeight: 1, minWidth: 28 }}>×</button>
        {/* segmented progress — fills segment by segment like Duolingo */}
        <div style={{ flex: 1, display: 'flex', gap: 4 }}>
          {Array.from({ length: steps }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 12, borderRadius: 7, background: SPROUT.cream, overflow: 'hidden', position: 'relative' }}>
              {i < filled && (
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, #8AD577, ${SPROUT.green})`, borderRadius: 7 }}>
                  <div style={{ position: 'absolute', top: 2, left: 3, right: 3, height: 3, background: 'rgba(255,255,255,0.5)', borderRadius: 3 }}/>
                </div>
              )}
            </div>
          ))}
        </div>
        <WaterGauge level={hearts} max={5}/>
      </div>

      {/* prompt — Pip on the left, prompt sentence + optional speech bubble */}
      <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flexShrink: 0, marginTop: 2 }}>
          <Pip size={58} mood={pipMood}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            position: 'relative',
            background: SPROUT.paper,
            border: `2px solid ${SPROUT.line}`,
            borderRadius: 14,
            padding: '10px 12px',
            boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
          }}>
            <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.3, color: SPROUT.ink }}>{prompt}</div>
            {pipText && <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute, marginTop: 4, lineHeight: 1.35 }}>{pipText}</div>}
            <span style={{
              position: 'absolute', left: -10, top: 18,
              width: 0, height: 0,
              borderTop: '8px solid transparent', borderBottom: '8px solid transparent',
              borderRight: `10px solid ${SPROUT.line}`,
            }}/>
            <span style={{
              position: 'absolute', left: -7, top: 19,
              width: 0, height: 0,
              borderTop: '7px solid transparent', borderBottom: '7px solid transparent',
              borderRight: `9px solid #fff`,
            }}/>
          </div>
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, padding: '14px 16px', overflow: 'auto' }}>{children}</div>

      {/* footer */}
      <div style={{ padding: '12px 16px 28px', borderTop: `1px solid ${SPROUT.line}`, background: SPROUT.paper }}>
        {footer}
      </div>

      {/* Pip-led quit confirmation — "Keep going" is the primary; quitting is the quiet path */}
      {quitOpen && (
        <div onClick={() => setQuitOpen(false)} style={{ position: 'absolute', inset: 0, zIndex: 70, display: 'flex', alignItems: 'flex-end', background: 'rgba(20,30,20,0.42)' }}>
          <style>{`@keyframes qsUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: SPROUT.bg, borderRadius: '22px 22px 0 0', padding: '16px 18px 26px', animation: 'qsUp 280ms cubic-bezier(.2,.8,.2,1) both', boxShadow: '0 -8px 26px rgba(0,0,0,0.16)' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: SPROUT.line, margin: '0 auto 14px' }}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 6 }}>
              <div style={{ flexShrink: 0 }}><Pip size={56} mood="thinking"/></div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.15 }}>You're growing nicely 🌱</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: SPROUT.mute, marginTop: 2, lineHeight: 1.35 }}>Leave now and this lesson's progress won't be saved.</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
              <PushButton size="lg" color={SPROUT.green} shadow={SPROUT.greenShadow} onClick={() => setQuitOpen(false)} style={{ width: '100%' }}>Keep going</PushButton>
              <button onClick={() => { setQuitOpen(false); if (onExit) onExit('pause'); }} style={{
                width: '100%', border: `1.5px solid ${SPROUT.line}`, background: SPROUT.paper, cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 14.5, fontWeight: 900, color: SPROUT.ink, borderRadius: 14, padding: '12px 0', minHeight: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              }}>🌙 Pause — pick up where I left off</button>
              <button onClick={() => { setQuitOpen(false); if (onExit) onExit('quit'); }} style={{
                width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 14, fontWeight: 900, color: SPROUT.mute, padding: '8px 0', minHeight: 40,
              }}>Quit lesson</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 1) Multiple choice (image-to-word) ────────────────────────────
function ExMultipleChoice({ onDone, onExit, progress = 0.4 }) {
  const rightIdx = 1;
  const [sel, setSel] = React.useState(null);
  const [checked, setChecked] = React.useState(false);
  const [promptPlaying, setPromptPlaying] = React.useState(false);
  const [slow, setSlow] = React.useState(false);
  const [speaking, setSpeaking] = React.useState(null);  // which card is "saying" its word
  const [escape, setEscape] = React.useState(false);     // "Can't listen now?" sheet
  const options = [
    { label: 'a dog', glyph: '🐕' },
    { label: 'a cat', glyph: '🐈' },
    { label: 'a bird', glyph: '🐦' },
    { label: 'a fish', glyph: '🐟' },
  ];
  const isCorrect = sel === rightIdx;
  const playPrompt = () => { setPromptPlaying(true); setTimeout(() => setPromptPlaying(false), slow ? 1300 : 800); };
  const sayCard = (i) => { setSpeaking(i); setTimeout(() => setSpeaking(s => s === i ? null : s), 650); };
  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
    <style>{`@keyframes mcLeaf { 0% { transform: translate(0,0) rotate(0) scale(.4); opacity: 0; } 18% { opacity: 1; } 100% { transform: translate(var(--fx), var(--fy)) rotate(var(--fr)) scale(1); opacity: 0; } }`}</style>
    <ExerciseShell
      prompt={null}
      pipMood={checked ? (isCorrect ? 'cheer' : 'thinking') : 'happy'}
      pipText={checked ? (isCorrect ? 'Perfect — that\'s a cat!' : 'Hmm, listen again.') : 'Listen, then tap the matching picture.'}
      progress={progress}
      onExit={onExit}
      footer={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <DontKnow onClick={() => { setSel(rightIdx === 0 ? 1 : 0); setChecked(true); }}/>
          <div style={{ flex: 1 }}/>
          <button onClick={() => setEscape(true)} style={{
            border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 5, padding: '0 4px',
            fontSize: 11.5, fontWeight: 800, color: SPROUT.mute, textDecoration: 'underline', textUnderlineOffset: 2,
            textTransform: 'uppercase', letterSpacing: 0.5,
          }}>Can't listen now?</button>
          <PushButton size="lg" color={SPROUT.green} shadow={SPROUT.greenShadow} disabled={sel === null} onClick={() => setChecked(true)}>Check</PushButton>
        </div>
      }
    >
      {/* quiet first-encounter label — a passive tag, set apart from the audio controls below */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8, fontSize: 10.5, fontWeight: 800, color: SPROUT.mute, letterSpacing: 0.5, textTransform: 'uppercase' }}>
        <span aria-hidden="true" style={{ fontSize: 11, color: '#A88FCB' }}>✦</span>New word
      </div>
      {/* prompt with audio controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 19, fontWeight: 800, color: SPROUT.ink }}>Which one is</span>
        <button onClick={playPrompt} style={{
          display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'inherit',
          border: 'none', background: promptPlaying ? '#E3F5DB' : '#fff', borderRadius: 12,
          padding: '7px 13px', boxShadow: `0 0 0 1.5px ${SPROUT.green}, 0 2px 0 ${SPROUT.greenShadow}`,
        }}>
          <span style={{ width: 26, height: 26, borderRadius: '50%', background: SPROUT.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transform: promptPlaying ? 'scale(1.12)' : 'scale(1)', transition: 'transform .15s' }}>
            <Icon.Volume size={14} color="#fff"/>
          </span>
          <span style={{ fontSize: 18, fontWeight: 900, color: SPROUT.greenDark }}>“the cat”?</span>
        </button>
        <button onClick={() => setSlow(s => !s)} aria-pressed={slow} aria-label="Slow audio" style={{
          cursor: 'pointer', border: 'none', borderRadius: 999, padding: '6px 10px', minHeight: 36,
          fontWeight: 900, fontSize: 12, fontFamily: 'inherit',
          background: slow ? SPROUT.sky : '#fff', color: slow ? '#1F5F7A' : SPROUT.mute,
          boxShadow: slow ? '0 2px 0 #7FB9D1' : `inset 0 0 0 1.5px ${SPROUT.line}`,
        }}>🐢 0.5×</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {options.map((o, i) => {
          const on = i === sel;
          // five crisp states — selected-pre-check uses SKY (never green) so it
          // can't be mistaken for "correct"; correct/wrong pair colour with ✓/✗.
          let ring = `0 0 0 1px ${SPROUT.line}, 0 3px 0 ${SPROUT.cardShadow}`;
          let bg = SPROUT.paper;
          let dim = false;
          let status = null; // 'correct' | 'wrong'
          if (checked) {
            if (i === rightIdx) { ring = `0 0 0 2px ${SPROUT.green}, 0 3px 0 ${SPROUT.greenShadow}`; bg = '#E3F5DB'; status = 'correct'; }
            else if (on)        { ring = `0 0 0 2px ${SPROUT.coral}, 0 3px 0 #C85555`; bg = '#FDE5E5'; status = 'wrong'; }
            else                { dim = true; }
          } else if (on) {
            ring = `0 0 0 2px ${SPROUT.sky}, 0 3px 0 #7FB9D1`; bg = '#E7F3F9';
          }
          return (
            <button key={i} onClick={() => { if (checked) return; sayCard(i); setSel(i); }} style={{
              border: 'none', cursor: checked ? 'default' : 'pointer', padding: 14,
              background: bg, borderRadius: 16, boxShadow: ring,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              fontFamily: 'inherit', position: 'relative',
              opacity: dim ? 0.45 : 1, transition: 'opacity .2s, transform .1s',
              transform: !checked && on ? 'translateY(-1px)' : 'none',
            }}>
              {/* color-blind-safe status badge: ✓ correct / ✗ your wrong pick */}
              {status && (
                <span style={{
                  position: 'absolute', top: 8, left: 8, width: 22, height: 22, borderRadius: '50%',
                  background: status === 'correct' ? SPROUT.green : SPROUT.coral,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
                }}>
                  {status === 'correct' ? <Icon.Check size={13} color="#fff"/> : <Icon.X size={12} color="#fff"/>}
                </span>
              )}
              {/* leaf burst when this is the chosen correct card */}
              {checked && i === rightIdx && i === sel && (
                <div aria-hidden style={{ position: 'absolute', top: 30, left: '50%', width: 0, height: 0, pointerEvents: 'none' }}>
                  {Array.from({ length: 10 }).map((_, k) => {
                    const ang = (k / 10) * Math.PI * 2;
                    const dist = 40 + (k % 3) * 12;
                    const g = ['🌿', '🍃', '🌱', '🌸'];
                    return <span key={k} style={{ position: 'absolute', fontSize: 14,
                      ['--fx']: `${Math.cos(ang) * dist}px`, ['--fy']: `${Math.sin(ang) * dist}px`, ['--fr']: `${(k % 2 ? 1 : -1) * 140}deg`,
                      animation: `mcLeaf ${700 + (k % 4) * 110}ms cubic-bezier(.2,.7,.3,1) ${k * 16}ms both` }}>{g[k % g.length]}</span>;
                  })}
                </div>
              )}
              <div style={{ width: 72, height: 72, borderRadius: 14, background: SPROUT.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, position: 'relative', transform: speaking === i ? 'scale(1.06)' : 'scale(1)', transition: 'transform .15s' }}>
                {o.glyph}
                {/* tap-to-hear speaker chip on each card */}
                <span style={{ position: 'absolute', bottom: -6, right: -6, width: 24, height: 24, borderRadius: '50%', background: speaking === i ? SPROUT.green : '#fff', border: `1.5px solid ${SPROUT.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}>
                  <Icon.Volume size={12} color={speaking === i ? '#fff' : SPROUT.mute}/>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 6, fontWeight: 900, fontSize: 12,
                  background: SPROUT.paper, border: `1.5px solid ${!checked && on ? SPROUT.sky : SPROUT.line}`,
                  color: !checked && on ? '#2E8FB0' : SPROUT.mute,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{i + 1}</div>
                {/* tap the WORD to hear it — the photo chip is the single speaker affordance */}
                <span style={{ fontWeight: 800, fontSize: 15, color: SPROUT.ink }}>{o.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </ExerciseShell>
    {checked && (
      <FeedbackDrawer
        state={isCorrect ? 'correct' : 'wrong'}
        correctAnswer={'"a cat"'}
        highlight="cat"
        meaning="A cat is a small furry pet with whiskers."
        example="The cat sleeps on the chair."
        explanation={isCorrect
          ? 'Great listening — that "ka" sound is unique to cat.'
          : 'Listen again for the "ka" sound at the start.'}
        onContinue={() => { if (onDone) { onDone(isCorrect); } else { setChecked(false); setSel(null); } }}
      />
    )}
    {/* "Can't listen now?" — a gentle no-audio escape (commute, quiet room). No water lost. */}
    {escape && (
      <div onClick={() => setEscape(false)} style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', alignItems: 'flex-end', background: 'rgba(20,30,40,0.4)' }}>
        <style>{`@keyframes clnUpMc { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
        <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: SPROUT.bg, borderRadius: '22px 22px 0 0', padding: '16px 18px 26px', animation: 'clnUpMc 280ms cubic-bezier(.2,.8,.2,1) both' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: SPROUT.line, margin: '0 auto 14px' }}/>
          <div style={{ fontSize: 17, fontWeight: 900, color: SPROUT.ink, marginBottom: 4 }}>Can't listen right now?</div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: SPROUT.mute, lineHeight: 1.4, marginBottom: 16 }}>No problem — no water lost either way. Skip just this one, or pause listening exercises for a bit. 🌿</div>
          <button onClick={() => {
            try { localStorage.setItem('sprout.listenPausedUntil', String(Date.now() + 15 * 60 * 1000)); } catch (e) {}
            setEscape(false); if (onDone) onDone(true);
          }} style={{
            width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            background: SPROUT.sky, color: '#1F5F7A', fontSize: 15, fontWeight: 900,
            borderRadius: 14, padding: '14px 0', boxShadow: '0 3px 0 #7FB9D1', marginBottom: 10,
          }}>Pause listening for 15 min</button>
          <button onClick={() => { setEscape(false); if (onDone) onDone(true); }} style={{
            width: '100%', border: `1.5px solid ${SPROUT.line}`, cursor: 'pointer', fontFamily: 'inherit',
            background: SPROUT.paper, color: SPROUT.ink, fontSize: 15, fontWeight: 900,
            borderRadius: 14, padding: '13px 0',
          }}>Skip just this one</button>
        </div>
      </div>
    )}
    </div>
  );
}

// 2) Arrange words into sentence ────────────────────────────────
function ExArrange({ onDone, onExit, progress = 0.55 }) {
  // tapped words appear in the top well, untapped in the bank below.
  // The bank includes DECOY words (not in the answer) so the exercise tests real
  // understanding, not just ordering the exact tiles given.
  const allWords = ['I', 'drink', 'coffee', 'in', 'the', 'morning', 'every', 'red', 'sleep'];
  const correctOrder = [0, 1, 2, 3, 4, 5]; // "I drink coffee in the morning"
  const decoys = [6, 7, 8];                // 'every', 'red', 'sleep' — plausible distractors
  const [chosen, setChosen] = React.useState([]); // indices into allWords
  const [checked, setChecked] = React.useState(false);
  const [dragFrom, setDragFrom] = React.useState(null); // position in chosen
  const [overIdx, setOverIdx] = React.useState(null);
  const [hintUsed, setHintUsed] = React.useState(0);    // 0 none, 1 first word revealed
  const [hintTiles, setHintTiles] = React.useState([]); // word indices the hint locked in
  const [gloss, setGloss] = React.useState(null);       // tapped prompt word → meaning popover

  // tiny in-context glossary for the prompt sentence (English-only meanings/usage)
  const GLOSS = {
    drink: 'to take in a liquid — here, a verb',
    coffee: 'a hot caffeinated drink',
    morning: 'the early part of the day',
    the: 'points to a specific thing',
    in: 'tells you when or where',
    I: 'the person speaking',
  };

  const isCorrect = chosen.length === correctOrder.length &&
                    chosen.every((v, i) => v === correctOrder[i]);

  const tap = (i) => {
    if (checked) return;
    if (hintTiles.includes(i)) return; // hint-locked first word stays put
    if (chosen.includes(i)) setChosen(chosen.filter(x => x !== i));
    else setChosen([...chosen, i]);
  };

  // Hint: reveal just the FIRST word (rescues the stuck moment without giving the answer).
  // Free the first time, then a small water cost.
  const useHint = () => {
    if (checked || hintUsed) return;
    const firstIdx = correctOrder[0];
    setChosen(prev => [firstIdx, ...prev.filter(x => x !== firstIdx)]);
    setHintTiles([firstIdx]);
    setHintUsed(1);
  };

  const onDrop = (targetPos) => {
    if (dragFrom === null) return;
    const next = [...chosen];
    const [moved] = next.splice(dragFrom, 1);
    const insertAt = targetPos > dragFrom ? targetPos - 1 : targetPos;
    next.splice(insertAt, 0, moved);
    setChosen(next);
    setDragFrom(null);
    setOverIdx(null);
  };

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
    <style>{`@keyframes awTilePop { 0% { transform: scale(0.55) translateY(8px); opacity: 0; } 60% { transform: scale(1.12); } 100% { transform: scale(1) translateY(0); opacity: 1; } }`}</style>
    <ExerciseShell
      prompt="Build the sentence you hear"
      pipMood={checked ? (isCorrect ? 'cheer' : 'thinking') : 'happy'}
      pipText={checked ? (isCorrect ? 'Spot on!' : 'Tap each word in the order you hear them.') : '🔊 Listen, then arrange the words.'}
      progress={progress}
      onExit={onExit}
      footer={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <DontKnow onClick={() => { setChosen(correctOrder.slice()); setChecked(true); }}/>
          <button onClick={useHint} disabled={!!hintUsed} style={{
            display: 'flex', alignItems: 'center', gap: 5, cursor: hintUsed ? 'default' : 'pointer',
            border: `1.5px solid ${hintUsed ? SPROUT.line : SPROUT.sun}`, background: hintUsed ? 'transparent' : '#FFF7E4',
            color: hintUsed ? SPROUT.mute : '#C28A1C', fontFamily: 'inherit', fontWeight: 800, fontSize: 12.5,
            borderRadius: 999, padding: '7px 12px', minHeight: 36,
          }}>
            💡 {hintUsed ? 'Hint used' : 'Hint'}
            {!hintUsed && <span style={{ fontSize: 10, fontWeight: 900, color: SPROUT.green, background: '#E3F5DB', borderRadius: 6, padding: '1px 5px' }}>FREE</span>}
          </button>
          <div style={{ flex: 1 }}/>
          <PushButton size="lg" color={SPROUT.green} shadow={SPROUT.greenShadow} disabled={chosen.length === 0} onClick={() => setChecked(true)}>Check</PushButton>
        </div>
      }
    >
      {/* context anchor — a one-line café scene so the learner builds MEANING, not just order */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, padding: '9px 12px', borderRadius: 12, background: 'linear-gradient(90deg, #FBF1DC, #F4F8EC)', border: `1px solid ${SPROUT.line}` }}>
        <span style={{ fontSize: 26, flexShrink: 0 }}>☕</span>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: SPROUT.mute, lineHeight: 1.3 }}>
          <span style={{ fontWeight: 900, color: SPROUT.ink }}>At the café.</span> Tell Fern about your daily habit.
        </div>
      </div>
      {/* speaker + source */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: SPROUT.sky,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: `0 3px 0 #7FB9D1`,
        }}>
          <Icon.Play size={22} color="#fff"/>
        </div>
        <div style={{ background: SPROUT.paper, padding: '10px 12px', borderRadius: 12, border: `1px solid ${SPROUT.line}`, fontSize: 14, fontWeight: 700, flex: 1, position: 'relative' }}>
          {'I drink coffee in the morning'.split(' ').map((w, wi) => {
            const key = w.replace(/[^A-Za-z']/g, '');
            const hasGloss = GLOSS[key] != null;
            return (
              <React.Fragment key={wi}>
                <span
                  onClick={hasGloss ? (e) => { e.stopPropagation(); setGloss(gloss === key ? null : key); } : undefined}
                  style={{
                    cursor: hasGloss ? 'pointer' : 'default',
                    borderBottom: hasGloss ? `2px dotted ${SPROUT.sky}` : 'none',
                    color: gloss === key ? SPROUT.greenDark : 'inherit',
                  }}
                >{w}</span>
                {wi < 5 ? ' ' : ''}
              </React.Fragment>
            );
          })}
          {gloss && (
            <div style={{
              position: 'absolute', left: 12, bottom: 'calc(100% + 8px)', zIndex: 20, maxWidth: 220,
              background: SPROUT.ink, color: '#fff', borderRadius: 10, padding: '7px 11px',
              fontSize: 12, fontWeight: 700, lineHeight: 1.35, boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
            }}>
              <span style={{ fontWeight: 900 }}>{gloss}</span> — {GLOSS[gloss]}
              <div style={{ position: 'absolute', top: '100%', left: 18, width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: `7px solid ${SPROUT.ink}` }}/>
            </div>
          )}
          <div style={{ fontSize: 10, fontWeight: 800, color: SPROUT.mute, marginTop: 4, opacity: 0.8 }}>tap a word for its meaning</div>
        </div>
      </div>
      {/* ── ANSWER ROW ── visually distinct: green label, white panel, explicit underline slots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: 3, background: SPROUT.green }}/>
        <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.greenDark, textTransform: 'uppercase', letterSpacing: 0.8 }}>Your sentence</div>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${SPROUT.green}55, transparent)` }}/>
      </div>
      <div
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={() => onDrop(chosen.length)}
        style={{
          padding: '14px 12px 10px',
          background: SPROUT.paper,
          borderRadius: 14,
          border: `2px solid ${SPROUT.green}`,
          boxShadow: `0 0 0 4px rgba(111,191,94,0.15), inset 0 1px 0 rgba(255,255,255,0.6)`,
          minHeight: 112,
          position: 'relative',
        }}
      >
        {/* explicit underline slot rows — two rails so it always reads as a writing line */}
        <div style={{ position: 'absolute', inset: '14px 12px 10px', display: 'flex', flexDirection: 'column', gap: 12, pointerEvents: 'none' }}>
          {[0, 1].map(r => (
            <div key={r} style={{ height: 42, borderBottom: `2px dashed ${SPROUT.green}44` }}/>
          ))}
        </div>
        <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 8, alignContent: 'flex-start', minHeight: 96 }}>
          {/* Dotted placeholder slots — visible when no words placed, hint at where to drop */}
          {chosen.length === 0 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexWrap: 'wrap', gap: 8, alignContent: 'flex-start', pointerEvents: 'none' }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{
                  height: 42,
                  width: [62, 48, 58, 96][i],
                  borderRadius: 12,
                  border: `2px dashed ${SPROUT.green}66`,
                  background: 'rgba(111,191,94,0.06)',
                }}/>
              ))}
              <div style={{ width: '100%', textAlign: 'center', fontSize: 12, fontWeight: 700, color: SPROUT.green, opacity: 0.75, marginTop: 6 }}>
                ↓ tap a word below to drop it here
              </div>
            </div>
          )}
          {chosen.map((i, pos) => (
            <React.Fragment key={i}>
              <div
                onDragOver={(e) => { e.preventDefault(); setOverIdx(pos); }}
                onDrop={(e) => { e.stopPropagation(); onDrop(pos); }}
                style={{ width: overIdx === pos && dragFrom !== null ? 70 : 4, height: 42, borderRadius: 6, background: overIdx === pos && dragFrom !== null ? SPROUT.cream : 'transparent', transition: 'width 120ms ease' }}
              />
              <div
                draggable
                onDragStart={() => setDragFrom(pos)}
                onDragEnd={() => { setDragFrom(null); setOverIdx(null); }}
                style={{ opacity: dragFrom === pos ? 0.35 : 1, cursor: 'grab' }}
              >
                {/* placed tiles use the green accent so they read as "in the answer".
                    hint-locked tiles get a small 💡 and aren't draggable/removable */}
                <button onClick={() => tap(i)} style={{
                  height: 42, padding: hintTiles.includes(i) ? '0 12px 0 10px' : '0 14px', borderRadius: 12, border: 'none',
                  background: hintTiles.includes(i) ? '#FFF3D4' : '#EFF8E8',
                  boxShadow: hintTiles.includes(i) ? `0 0 0 1.5px ${SPROUT.sun}, 0 2px 0 #D7A52E` : `0 0 0 1.5px ${SPROUT.green}, 0 2px 0 ${SPROUT.greenShadow}`,
                  fontFamily: 'inherit', fontWeight: 800, fontSize: 15, color: hintTiles.includes(i) ? '#C28A1C' : SPROUT.greenDark,
                  cursor: hintTiles.includes(i) ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                  animation: 'awTilePop 280ms cubic-bezier(.3,1.5,.5,1) both',
                }}>{hintTiles.includes(i) && <span style={{ fontSize: 11 }}>💡</span>}{allWords[i]}</button>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── WORD BANK ── visually different: muted label, recessed cream tray, neutral chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '16px 0 6px' }}>
        <div style={{ width: 6, height: 6, borderRadius: 3, background: SPROUT.mute, opacity: 0.5 }}/>
        <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.8 }}>Word bank</div>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${SPROUT.mute}33, transparent)` }}/>
        <div style={{ fontSize: 10, fontWeight: 800, color: SPROUT.mute, opacity: 0.7 }}>some words aren’t needed</div>
      </div>
      <div style={{
        background: '#EFE6D2', borderRadius: 14, padding: '12px 10px',
        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(0,0,0,0.04)',
        display: 'flex', flexWrap: 'wrap', gap: 8, minHeight: 66, alignContent: 'flex-start',
      }}>
        {allWords.map((w, i) => chosen.includes(i) ? (
          <div key={i} style={{ height: 42, minWidth: 60, padding: '0 14px', borderRadius: 12, background: 'rgba(0,0,0,0.06)', boxShadow: 'inset 0 0 0 1.5px rgba(0,0,0,0.08)' }}/>
        ) : <WordTile key={i} onClick={() => tap(i)}>{w}</WordTile>)}
      </div>
    </ExerciseShell>
    {checked && (
      <FeedbackDrawer
        state={isCorrect ? 'correct' : 'wrong'}
        correctAnswer={'"I drink coffee in the morning"'}
        highlight="coffee"
        meaning="A daily routine — drinking coffee at the start of the day."
        example="Most adults drink coffee in the morning."
        explanation={isCorrect
          ? 'Perfect — that\u2019s exactly what you heard.'
          : 'Tap each word in the order you hear them.'}
        onContinue={() => { if (onDone) { onDone(isCorrect); } else { setChecked(false); setChosen([]); } }}
      />
    )}
    </div>
  );
}

function WordTile({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      height: 42, padding: '0 14px', borderRadius: 12, border: 'none',
      background: SPROUT.paper, boxShadow: `0 0 0 1px ${SPROUT.line}, 0 2px 0 ${SPROUT.cardShadow}`,
      fontFamily: 'inherit', fontWeight: 800, fontSize: 15, color: SPROUT.ink,
      cursor: 'pointer',
    }}>{children}</button>
  );
}

// 3) Type what you hear ─────────────────────────────────────────
function thLev(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
const thNorm = (s) => (s || '').toLowerCase().replace(/[^a-z']/g, '');

function ExTypeHear({ onDone, onExit, progress = 0.7, tiles = false, calm = false }) {
  const easy = tiles || calm;                  // tile-reconstruction "easy mode" for beginners / calm
  const targetTokens = ['Good', 'morning'];
  const bank = ['Good', 'morning', 'evening', 'Hello']; // [0,1] correct, [2,3] decoys
  const [playing, setPlaying] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  const [slow, setSlow] = React.useState(false);   // 0.5× audio aid
  const [escape, setEscape] = React.useState(false); // "Can't listen now?" sheet
  const [typed] = React.useState('Good mornin');   // demo: a near-miss (typo) to show typo-tolerance
  const [chosen, setChosen] = React.useState([]);  // easy mode: tile indices placed
  const [outcome, setOutcome] = React.useState(null); // { state, statuses }

  const evaluate = () => {
    const typedTokens = easy ? chosen.map(i => bank[i]) : typed.trim().split(/\s+/).filter(Boolean);
    const statuses = targetTokens.map((tw, i) => {
      const tn = thNorm(tw), gn = thNorm(typedTokens[i]);
      if (!gn) return 'missed';
      if (gn === tn) return 'ok';
      if (tn.length > 3 && thLev(gn, tn) <= 1) return 'typo';
      return 'wrong';
    });
    const hardMiss = statuses.some(s => s === 'missed' || s === 'wrong') || typedTokens.length > targetTokens.length;
    const anyTypo = statuses.some(s => s === 'typo');
    let state = 'wrong';
    if (statuses.every(s => s === 'ok') && typedTokens.length === targetTokens.length) state = 'correct';
    else if (!hardMiss && anyTypo) state = 'almost';
    setOutcome({ state, statuses });
  };

  // correct sentence with each word coloured by how the learner did on it
  const answerNode = outcome && (
    <span>
      {targetTokens.map((tw, i) => {
        const st = outcome.statuses[i];
        const sty = st === 'ok'
          ? { color: SPROUT.greenDark }
          : st === 'typo'
          ? { background: '#FBEFD6', color: '#94680E', borderRadius: 5, padding: '0 4px', boxShadow: 'inset 0 -2px 0 #E7C77F' }
          : { background: '#FDE5E5', color: '#9B3333', borderRadius: 5, padding: '0 4px', boxShadow: 'inset 0 -2px 0 #E0A59C' };
        return <span key={i} style={{ marginRight: 5, fontWeight: 800, ...sty }}>{tw}</span>;
      })}
    </span>
  );

  const plainAnswer = (
    <span>
      {targetTokens.map((tw, i) => (
        <span key={i} style={{ marginRight: 5, fontWeight: 800, color: SPROUT.greenDark }}>{tw}</span>
      ))}
    </span>
  );

  const tapTile = (i) => {
    if (outcome) return;
    setChosen(c => c.includes(i) ? c.filter(x => x !== i) : [...c, i]);
  };
  const play = () => {
    setPlaying(true);
    setTimeout(() => setPlaying(false), slow ? 2700 : 1600);
  };
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: SPROUT.bg, color: SPROUT.ink, fontFamily: '"Nunito", system-ui', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes sproutWave { 0%,100% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } }
        @keyframes sproutPulse { 0% { box-shadow: 0 0 0 0 rgba(168,216,234,0.7); } 100% { box-shadow: 0 0 0 24px rgba(168,216,234,0); } }
      `}</style>
      <div style={{ padding: `${LAYOUT.safeTop}px ${LAYOUT.padX}px 10px`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onExit} style={{ border: 'none', background: 'transparent', fontSize: 22, color: SPROUT.mute, cursor: 'pointer' }}>×</button>
        <div style={{ flex: 1, height: 14, borderRadius: 8, background: SPROUT.cream, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, right: `${(1 - progress) * 100}%`, background: `linear-gradient(180deg, #8AD577, ${SPROUT.green})`, borderRadius: 8 }}/>
        </div>
        <WaterGauge level={5} max={5}/>
      </div>

      <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flexShrink: 0, marginTop: 2 }}><Pip size={58} mood={outcome && (outcome.state === 'correct' || outcome.state === 'almost') ? 'cheer' : 'thinking'}/></div>
        <div style={{ flex: 1, position: 'relative', background: SPROUT.paper, border: `2px solid ${SPROUT.line}`, borderRadius: 14, padding: '10px 12px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}` }}>
          <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.3 }}>{easy ? 'Tap what you hear' : 'Type what you hear'}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute, marginTop: 4 }}>🔊 Tap play, then {easy ? 'build the sentence.' : 'type the sentence.'}</div>
          <span style={{ position: 'absolute', left: -10, top: 18, width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderRight: `10px solid ${SPROUT.line}` }}/>
          <span style={{ position: 'absolute', left: -7, top: 19, width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderRight: `9px solid #fff` }}/>
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* compact audio group — play button + waveform sit on one row, tightly grouped with the input */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <button
            onClick={play}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            style={{
              width: 72, height: 72, borderRadius: '50%',
              background: SPROUT.sky, border: 'none', cursor: 'pointer',
              boxShadow: pressed ? `0 2px 0 #7FB9D1` : `0 5px 0 #7FB9D1`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0,
              transform: pressed ? 'translateY(3px)' : 'none',
              transition: 'transform 80ms ease, box-shadow 80ms ease',
              animation: playing ? 'sproutPulse 1s ease-out infinite' : 'none',
            }}
          >
            {playing ? (
              <svg width="30" height="30" viewBox="0 0 40 40">
                <rect x="10" y="8" width="6" height="24" rx="2" fill="#fff"/>
                <rect x="24" y="8" width="6" height="24" rx="2" fill="#fff"/>
              </svg>
            ) : (
              <Icon.Play size={30} color="#fff"/>
            )}
          </button>
          {/* waveform — slim, sits directly under the play button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 18 }}>
            {[10, 18, 8, 22, 14, 20, 10, 16, 12].map((h, i) => (
              <div key={i} style={{
                width: 3, height: h, background: SPROUT.sky, borderRadius: 2,
                transformOrigin: 'center', opacity: 0.8,
                animation: playing ? `sproutWave 0.6s ease-in-out ${i * 0.08}s infinite` : 'none',
              }}/>
            ))}
          </div>
          {/* 0.5× slow-speed toggle — hear the sentence at half speed (Memrise pattern) */}
          <button onClick={() => setSlow(s => !s)} aria-pressed={slow} aria-label="Toggle slow audio" style={{
            border: 'none', cursor: 'pointer', borderRadius: 999, padding: '8px 14px', minHeight: 44,
            display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
            fontWeight: 900, fontSize: 13,
            background: slow ? SPROUT.sky : '#fff',
            color: slow ? '#1F5F7A' : SPROUT.mute,
            boxShadow: slow ? '0 2px 0 #7FB9D1' : `inset 0 0 0 1.5px ${SPROUT.line}`,
          }}>
            <span style={{ fontSize: 15 }}>🐢</span> 0.5× {slow ? 'on' : 'slow'}
          </button>
          {/* Can't listen now? — opens a gentle escape: skip this one, or pause ALL
              listening exercises for 15 min (Duolingo pattern). No water penalty. */}
          <button onClick={() => setEscape(true)} style={{
            border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
            marginTop: 2, padding: '6px 8px', minHeight: 34,
            fontSize: 11.5, fontWeight: 800, color: SPROUT.mute, textDecoration: 'underline', textUnderlineOffset: 2,
            textTransform: 'uppercase', letterSpacing: 0.5,
          }}>Can't listen now?</button>
        </div>

        {/* answer area — typed field, or a tile word-bank in easy mode */}
        {easy ? (
          <div style={{ width: '100%', marginTop: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: SPROUT.mute, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.7, textAlign: 'center' }}>↓ Tap the words you heard ↓</div>
            {/* placed-words well */}
            <div style={{ minHeight: 50, borderRadius: 12, border: `2px dashed ${SPROUT.green}66`, background: SPROUT.paper, padding: 8, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', justifyContent: chosen.length ? 'flex-start' : 'center' }}>
              {chosen.length === 0 && <span style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>Tap words below</span>}
              {chosen.map((i, k) => (
                <button key={k} onClick={() => tapTile(i)} style={{ height: 38, padding: '0 13px', borderRadius: 11, border: 'none', background: '#EFF8E8', boxShadow: `0 0 0 1.5px ${SPROUT.green}, 0 2px 0 ${SPROUT.greenShadow}`, fontFamily: 'inherit', fontWeight: 800, fontSize: 14, color: SPROUT.greenDark, cursor: 'pointer' }}>{bank[i]}</button>
              ))}
            </div>
            {/* bank */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12, justifyContent: 'center' }}>
              {bank.map((w, i) => chosen.includes(i)
                ? <div key={i} style={{ height: 38, minWidth: 56, padding: '0 13px', borderRadius: 11, background: 'rgba(0,0,0,0.06)', boxShadow: 'inset 0 0 0 1.5px rgba(0,0,0,0.08)' }}/>
                : <WordTile key={i} onClick={() => tapTile(i)}>{w}</WordTile>)}
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', marginTop: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: SPROUT.mute, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.7, textAlign: 'center' }}>↓ Type what you heard ↓</div>
            <div style={{
              padding: '14px 14px', background: SPROUT.paper, borderRadius: 14,
              border: `2px solid ${SPROUT.line}`, fontSize: 18, fontWeight: 700,
              minHeight: 56, color: SPROUT.ink, display: 'flex', alignItems: 'center',
            }}>
              {typed}<span style={{ display: 'inline-block', width: 2, height: 22, background: SPROUT.green, marginLeft: 2 }}/>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '12px 16px 28px', borderTop: `1px solid ${SPROUT.line}`, background: SPROUT.paper, display: 'flex', alignItems: 'center', gap: 10 }}>
        <DontKnow onClick={() => setOutcome({ state: 'wrong', statuses: targetTokens.map(() => 'missed') })}/>
        <button onClick={() => setOutcome({ state: 'reveal', statuses: [] })} style={{
          border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 4, padding: '8px 6px', minHeight: 44,
          fontSize: 12.5, fontWeight: 800, color: SPROUT.mute,
        }}>
          <span style={{ fontSize: 15 }}>👁</span> Reveal
        </button>
        <div style={{ flex: 1 }}/>
        <PushButton size="lg" color={SPROUT.green} shadow={SPROUT.greenShadow} disabled={easy && chosen.length === 0} onClick={evaluate}>Check</PushButton>
      </div>
      {outcome && (
        <FeedbackDrawer
          state={outcome.state === 'reveal' ? 'skip' : outcome.state}
          calm={calm}
          correctAnswer={outcome.state === 'skip' ? undefined : outcome.state === 'reveal' ? plainAnswer : answerNode}
          explanation={
            outcome.state === 'correct' ? 'Spot on — that’s exactly what you heard.'
            : outcome.state === 'almost' ? 'So close — just a small typo. We’ll count it.'
            : outcome.state === 'reveal' ? 'Here’s the sentence — give it a listen and try saying it. No water lost. 🌿'
            : outcome.state === 'skip' ? (outcome.paused ? 'Listening paused for 15 minutes — we’ll bring back audio exercises shortly. No water lost. 🌿' : 'No problem — skipped with no water lost. Catch the audio next time. 🌿')
            : 'The highlighted word is the one to listen for. Tap 🔊 to hear it again.'
          }
          onContinue={() => {
            const ok = outcome.state === 'correct' || outcome.state === 'almost';
            if (onDone) { onDone(ok); } else { setOutcome(null); setChosen([]); }
          }}
        />
      )}
      {escape && (
        <div onClick={() => setEscape(false)} style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', alignItems: 'flex-end', background: 'rgba(20,30,40,0.4)' }}>
          <style>{`@keyframes clnUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: SPROUT.bg, borderRadius: '22px 22px 0 0', padding: '16px 18px 26px', animation: 'clnUp 280ms cubic-bezier(.2,.8,.2,1) both', boxShadow: '0 -8px 26px rgba(0,0,0,0.16)' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: SPROUT.line, margin: '0 auto 14px' }}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 4 }}>
              <span style={{ fontSize: 26 }}>🔇</span>
              <div style={{ fontSize: 18, fontWeight: 900 }}>Can't listen right now?</div>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: SPROUT.mute, lineHeight: 1.4, marginBottom: 16 }}>No problem — no water lost either way. We can skip just this one, or pause listening exercises for a little while.</div>
            <button onClick={() => {
              try { localStorage.setItem('sprout.listenPausedUntil', String(Date.now() + 15 * 60 * 1000)); } catch (e) {}
              setEscape(false);
              setOutcome({ state: 'skip', statuses: [], paused: true });
            }} style={{
              width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: SPROUT.sky, color: '#1F5F7A', fontSize: 15, fontWeight: 900,
              borderRadius: 14, padding: '14px 0', boxShadow: '0 3px 0 #7FB9D1', marginBottom: 10,
            }}>Pause listening for 15 min</button>
            <button onClick={() => { setEscape(false); setOutcome({ state: 'skip', statuses: [] }); }} style={{
              width: '100%', border: `1.5px solid ${SPROUT.line}`, cursor: 'pointer', fontFamily: 'inherit',
              background: SPROUT.paper, color: SPROUT.ink, fontSize: 15, fontWeight: 900,
              borderRadius: 14, padding: '13px 0',
            }}>Just skip this one</button>
          </div>
        </div>
      )}
    </div>
  );
}

// 4) Match pairs ────────────────────────────────────────────────
function ExMatch({ onDone, onExit, progress = 0.85, audio = false, calm = false }) {
  // each item carries a pair id; left.id === right.id is a correct match.
  // Audio variant: the left column plays the spoken word (🔊 + waveform); you
  // match what you HEAR to its written form on the right (Duolingo spoken↔text).
  const leftCol  = audio
    ? [{ w: 'morning', id: 0 }, { w: 'coffee', id: 1 }, { w: 'water', id: 2 }, { w: 'please', id: 3 }]
    : [{ w: 'morning', id: 0 }, { w: 'big', id: 1 }, { w: 'fast', id: 2 }, { w: 'happy', id: 3 }];
  const rightCol = audio
    ? [{ w: 'coffee', id: 1 }, { w: 'morning', id: 0 }, { w: 'please', id: 3 }, { w: 'water', id: 2 }]
    : [{ w: 'large', id: 1 }, { w: '🌅', id: 0 }, { w: '🙂', id: 3 }, { w: 'quick', id: 2 }];
  const total = leftCol.length;

  const [matched, setMatched]   = React.useState([]);     // ids fully matched + faded out
  const [sel, setSel]           = React.useState(null);    // { col:'L'|'R', pos }
  const [vanishing, setVanish]  = React.useState(null);    // id currently animating out
  const [flash, setFlash]       = React.useState(null);    // { L:pos, R:pos } wrong pair
  const [checked, setChecked]   = React.useState(false);
  const [playing, setPlaying]   = React.useState(null);    // audio variant: pos currently "speaking"
  const [swapped, setSwapped]   = React.useState(false);   // audio variant: "can't listen now" → text fallback
  const isAudio = audio && !swapped;
  // combo — fast consecutive matches build a multiplier (Duolingo COMBO ×2)
  const [combo, setCombo]       = React.useState(0);
  const [comboPulse, setComboPulse] = React.useState(false);
  const lastMatchAt = React.useRef(0);
  const COMBO_WINDOW = 3500; // ms — match within this to keep the streak hot
  const multiplier = combo >= 6 ? 3 : combo >= 3 ? 2 : 1;

  const speak = (pos) => { setPlaying(pos); setTimeout(() => setPlaying(p => p === pos ? null : p), 650); };

  const pick = (col, pos) => {
    if (checked) return;
    const item = col === 'L' ? leftCol[pos] : rightCol[pos];
    if (matched.includes(item.id) || vanishing === item.id) return;
    // audio variant: tapping a left tile also plays it
    if (isAudio && col === 'L') speak(pos);
    if (!sel) { setSel({ col, pos }); return; }
    if (sel.col === col) { setSel({ col, pos }); return; }

    // we have one from each column → evaluate
    const lPos = col === 'L' ? pos : sel.pos;
    const rPos = col === 'R' ? pos : sel.pos;
    const correct = leftCol[lPos].id === rightCol[rPos].id;
    setSel(null);

    if (correct) {
      const id = leftCol[lPos].id;
      // combo: bump if this match landed quickly after the last one
      const now = Date.now();
      if (!calm) {
        setCombo(c => (now - lastMatchAt.current < COMBO_WINDOW ? c + 1 : 1));
        setComboPulse(true);
        setTimeout(() => setComboPulse(false), 420);
      }
      lastMatchAt.current = now;
      setVanish(id);
      setTimeout(() => {
        setVanish(null);
        setMatched(prev => {
          const next = [...prev, id];
          if (next.length === total) setTimeout(() => setChecked(true), 280); // empty board → feedback
          return next;
        });
      }, 380);
    } else {
      setCombo(0); // a miss breaks the streak
      setFlash({ L: lPos, R: rPos });
      setTimeout(() => setFlash(null), 600);
    }
  };

  const cell = (item, col, pos) => {
    const isMatched  = matched.includes(item.id);
    const isVanish   = vanishing === item.id;
    const isSel      = sel && sel.col === col && sel.pos === pos;
    const isFlash    = flash && ((col === 'L' && flash.L === pos) || (col === 'R' && flash.R === pos));

    if (isMatched) {
      // leave a quiet empty slot so the board layout stays stable
      return <div key={col + pos} style={{ height: 54, borderRadius: 14, border: `2px dashed ${SPROUT.line}`, background: 'rgba(0,0,0,0.015)' }}/>;
    }
    return (
      <button key={col + pos} onClick={() => pick(col, pos)} style={{
        height: 54, border: 'none', borderRadius: 14, background: SPROUT.paper,
        boxShadow: isSel ? `0 0 0 2.5px ${SPROUT.green}, 0 3px 0 ${SPROUT.greenShadow}`
                 : isVanish ? `0 0 0 2.5px ${SPROUT.green}, 0 0 18px rgba(111,191,94,0.6)`
                 : isFlash ? `0 0 0 2.5px ${SPROUT.coral}, 0 3px 0 #C85555`
                 : `0 0 0 1px ${SPROUT.line}, 0 3px 0 ${SPROUT.cardShadow}`,
        fontFamily: 'inherit', fontWeight: 800, fontSize: 17, color: SPROUT.ink,
        cursor: 'pointer', position: 'relative',
        transform: isVanish ? 'scale(0.6)' : (isFlash ? 'translateX(0)' : 'scale(1)'),
        opacity: isVanish ? 0 : 1,
        transition: 'transform 360ms cubic-bezier(.3,1.4,.5,1), opacity 360ms ease, box-shadow 120ms ease',
        animation: isFlash ? 'matchShake 400ms ease' : 'none',
        background: isVanish ? '#EAF7E3' : isFlash ? '#FDECEC' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
      }}>
        {/* leaf sparkle as the pair clears (hidden in calm) */}
        {isVanish && !calm && (
          <span style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
            {['🌿', '✨', '🍃'].map((g, k) => (
              <span key={k} style={{
                position: 'absolute', left: '50%', top: '50%', fontSize: 13,
                animation: `matchLeaf 460ms ease-out ${k * 40}ms both`,
                ['--ang']: `${-50 + k * 50}deg`,
              }}>{g}</span>
            ))}
          </span>
        )}
        {isAudio && col === 'L' ? (
          <React.Fragment>
            <span style={{ width: 30, height: 30, borderRadius: '50%', background: isSel ? SPROUT.green : SPROUT.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon.Volume size={15} color="#fff"/>
            </span>
            {/* waveform */}
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, height: 22 }}>
              {[0.5, 0.9, 0.65, 1, 0.55, 0.8].map((h, k) => (
                <span key={k} style={{
                  width: 3, borderRadius: 2, background: isSel ? SPROUT.greenDark : '#8FB7C8',
                  height: `${h * 100}%`,
                  animation: playing === pos ? `matchWave 560ms ease ${k * 70}ms infinite alternate` : 'none',
                }}/>
              ))}
            </span>
          </React.Fragment>
        ) : item.w}
      </button>
    );
  };

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
    <style>{`@keyframes matchShake { 25% { transform: translateX(-5px); } 50% { transform: translateX(5px); } 75% { transform: translateX(-3px); } } @keyframes matchWave { from { transform: scaleY(0.4); } to { transform: scaleY(1); } } @keyframes matchComboPop { 0% { transform: scale(0.6); opacity: 0; } 55% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } } @keyframes matchLeaf { 0% { transform: translate(-50%,-50%) rotate(0) translateY(0) scale(0.5); opacity: 0; } 30% { opacity: 1; } 100% { transform: translate(-50%,-50%) rotate(var(--ang)) translateY(-26px) scale(1); opacity: 0; } }`}</style>
    {/* combo multiplier — rewards fast, accurate matching (hidden in calm) */}
    {!calm && multiplier > 1 && (
      <div style={{
        position: 'absolute', top: 64, right: 14, zIndex: 6,
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'linear-gradient(180deg, #FFE9C2, #FFD085)', color: '#8A4E12',
        borderRadius: 999, padding: '5px 12px', border: '2px solid #fff',
        boxShadow: '0 3px 10px rgba(220,140,40,0.35)',
        fontSize: 14, fontWeight: 900, letterSpacing: 0.3,
        animation: comboPulse ? 'matchComboPop 380ms cubic-bezier(.3,1.5,.5,1)' : 'none',
      }}>
        <span style={{ fontSize: 15 }}>🔥</span> COMBO ×{multiplier}
      </div>
    )}
    <ExerciseShell
      prompt={isAudio ? 'Match what you hear' : (swapped ? 'Match the pairs' : 'Tap the matching pairs')}
      pipMood="happy"
      pipText={isAudio ? 'Tap a 🔊 tile to hear it, then tap its written word.' : 'Tap a word on the left, then its match on the right.'}
      progress={progress}
      onExit={onExit}
      footer={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: SPROUT.mute, fontWeight: 800 }}>{matched.length} of {total} matched</div>
          <div style={{ flex: 1, height: 8, borderRadius: 4, background: SPROUT.cream, overflow: 'hidden', maxWidth: 140 }}>
            <div style={{ height: '100%', width: `${(matched.length / total) * 100}%`, background: SPROUT.green, borderRadius: 4, transition: 'width 300ms ease' }}/>
          </div>
          <div style={{ flex: 1 }}/>
          {isAudio
            ? <button onClick={() => { setSwapped(true); setSel(null); setPlaying(null); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11.5, fontWeight: 800, color: SPROUT.mute, textDecoration: 'underline', textUnderlineOffset: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>Can't listen now?</button>
            : <span style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>{sel ? 'Now pick its match' : 'Tap a word'}</span>}
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ display: 'grid', gap: 10 }}>{leftCol.map((it, i) => cell(it, 'L', i))}</div>
        <div style={{ display: 'grid', gap: 10 }}>{rightCol.map((it, i) => cell(it, 'R', i))}</div>
      </div>
    </ExerciseShell>
    {checked && (
      <FeedbackDrawer
        state="correct"
        combo={!calm && combo >= 3 ? combo : 0}
        calm={calm}
        explanation={audio
          ? 'All four matched — great listening, connecting each sound to its spelling.'
          : 'All four pairs matched — nice work connecting the words.'}
        onContinue={() => { if (onDone) { onDone(true); } else { setMatched([]); setChecked(false); setCombo(0); } }}
      />
    )}
    </div>
  );
}

// 5) Speak out loud ─────────────────────────────────────────────
function ExSpeak({ onDone, onExit, progress = 0.8 }) {
  const [checked, setChecked] = React.useState(false);
  // mic state: 'ready' (resting, neutral) → 'listening' (active, coral + pulse)
  const [recording, setRecording] = React.useState(false);
  const [attempt, setAttempt] = React.useState(0);  // 0 first try → 'almost'; ≥1 → 'correct'
  const [slow, setSlow] = React.useState(false);   // 0.5× audio aid
  const [playing, setPlaying] = React.useState(false);
  const [escape, setEscape] = React.useState(false); // "Can't speak now" sheet
  const [paused, setPaused] = React.useState(false); // speaking paused for an hour
  // Per-word scoring on a near-miss — green = landed, amber = retry (Duolingo word highlighting).
  const TARGET_WORDS = ['Good', 'morning,', 'how', 'are', 'you?'];
  const wordScores = TARGET_WORDS.map((word, i) => ({ word, ok: i !== 1 }));  // demo: "morning" needs a retry
  const playAudio = () => {
    setPlaying(true);
    setTimeout(() => setPlaying(false), slow ? 2600 : 1500);
  };
  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
    <style>{`
      @keyframes sproutMicPulse { 0% { transform: scale(0.78); opacity: 0.5; } 100% { transform: scale(1.18); opacity: 0; } }
      @keyframes sproutMicWave { 0%,100% { transform: scaleY(0.35); } 50% { transform: scaleY(1); } }
    `}</style>
    <ExerciseShell
      prompt="Say this in English"
      pipMood={checked ? 'cheer' : (recording ? 'thinking' : 'happy')}
      pipText={recording ? 'Listening… speak clearly!' : 'Tap the mic, then read the sentence aloud.'}
      progress={progress}
      onExit={onExit}
      footer={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => setEscape(true)} style={{ border: 'none', background: 'transparent', fontWeight: 800, fontSize: 13, color: SPROUT.mute, padding: '0 6px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5, minHeight: 44, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icon.Volume size={14} color={SPROUT.mute}/> Can't speak now?
          </button>
          <div style={{ flex: 1 }}/>
          <PushButton size="lg" color={SPROUT.green} shadow={SPROUT.greenShadow} disabled={!recording} onClick={() => { setRecording(false); setChecked(attempt === 0 ? 'almost' : 'correct'); }}>Done</PushButton>
        </div>
      }
    >
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'flex-start' }}>
        <Pip size={72} mood="cheer"/>
        <div style={{ flex: 1, background: SPROUT.paper, padding: '14px 14px', borderRadius: 14, border: `1px solid ${SPROUT.line}`, position: 'relative', boxShadow: `0 2px 0 ${SPROUT.cardShadow}` }}>
          <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.3 }}>Good morning, how are you?</div>
          {/* phonetic hint — English spelling is irregular, so show the target sounds */}
          <div style={{ marginTop: 5, fontSize: 14, fontWeight: 700, color: SPROUT.sky === '#A8D8EA' ? '#3E8FB0' : SPROUT.mute, fontStyle: 'italic' }}>
            /ɡʊd ˈmɔːrnɪŋ haʊ ɑːr juː/
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute, marginTop: 1 }}>“gud MOR-ning, how ar yoo”</div>
          {/* audio row: play + 0.5× slow-speed toggle (Memrise pattern) */}
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={playAudio} aria-label="Hear the phrase" style={{
              display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
              border: 'none', background: playing ? '#EAF6FF' : '#F4FAFE', borderRadius: 999,
              padding: '6px 12px', color: '#3E8FB0', fontWeight: 800, fontSize: 12, fontFamily: 'inherit',
              boxShadow: `inset 0 0 0 1.5px ${SPROUT.sky}`,
            }}>
              <Icon.Play size={14} color="#3E8FB0"/> {playing ? 'Playing…' : 'Hear it'}
            </button>
            <button onClick={() => setSlow(s => !s)} aria-pressed={slow} aria-label="Toggle slow audio" style={{
              cursor: 'pointer', border: 'none', borderRadius: 999, padding: '6px 11px',
              fontWeight: 900, fontSize: 12, fontFamily: 'inherit',
              background: slow ? SPROUT.sky : '#fff',
              color: slow ? '#1F5F7A' : SPROUT.mute,
              boxShadow: slow ? `0 2px 0 #7FB9D1` : `inset 0 0 0 1.5px ${SPROUT.line}`,
              minHeight: 30, minWidth: 44,
            }}>0.5×</button>
          </div>
          <span style={{ position: 'absolute', left: -8, top: 20, width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderRight: '8px solid #fff' }}/>
        </div>
      </div>

      {/* big mic — neutral when ready, coral + pulsing when listening */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 20 }}>
        <button
          onClick={() => setRecording(r => !r)}
          aria-label={recording ? 'Stop recording' : 'Start recording'}
          style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', position: 'relative', width: 160, height: 160 }}
        >
          {/* pulse rings — only while listening */}
          {recording && (
            <React.Fragment>
              <div style={{ position: 'absolute', inset: 14, borderRadius: '50%', background: SPROUT.coral, animation: 'sproutMicPulse 1.4s ease-out infinite' }}/>
              <div style={{ position: 'absolute', inset: 14, borderRadius: '50%', background: SPROUT.coral, animation: 'sproutMicPulse 1.4s ease-out 0.7s infinite' }}/>
            </React.Fragment>
          )}
          <div style={{
            position: 'absolute', inset: 14, borderRadius: '50%',
            background: recording ? SPROUT.coral : '#fff',
            boxShadow: recording
              ? `0 6px 0 #C85555`
              : `inset 0 0 0 3px ${SPROUT.green}, 0 4px 0 #E8DFCE`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 140ms ease, box-shadow 140ms ease',
          }}>
            <Icon.Mic size={58} color={recording ? '#fff' : SPROUT.greenDark}/>
          </div>
        </button>

        {recording ? (
          <React.Fragment>
            {/* live waveform */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 18, height: 26 }}>
              {[14, 24, 10, 26, 16, 22, 12].map((h, i) => (
                <div key={i} style={{ width: 4, height: h, background: SPROUT.coral, borderRadius: 2, transformOrigin: 'center', animation: `sproutMicWave 0.6s ease-in-out ${i * 0.09}s infinite` }}/>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 14, fontWeight: 800, color: '#C85555' }}>Listening…</div>
            <div style={{ marginTop: 4, fontSize: 12, color: SPROUT.mute, fontWeight: 700 }}>Tap the mic when you're done</div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div style={{ marginTop: 20, fontSize: 15, fontWeight: 800, color: SPROUT.greenDark }}>Tap to speak</div>
            <div style={{ marginTop: 4, fontSize: 12, color: SPROUT.mute, fontWeight: 700 }}>Read the sentence out loud</div>
          </React.Fragment>
        )}
      </div>
    </ExerciseShell>
    {checked && (
      <FeedbackDrawer
        state={checked === 'almost' ? 'almost' : 'correct'}
        wordScores={checked === 'almost' ? wordScores : undefined}
        explanation={checked === 'almost'
          ? 'Close! “morning” slipped a little — tap 0.5× to hear it slowly, then give it another go. Speaking aloud is what counts.'
          : 'Great pronunciation. Pip heard you loud and clear.'}
        onRetry={checked === 'almost' ? () => { setChecked(false); setRecording(false); setAttempt(1); } : undefined}
        retryLabel="Try again"
        continueLabel={checked === 'almost' ? 'Skip for now' : 'Continue'}
        onContinue={() => { if (onDone) { onDone(checked !== 'almost'); } else { setChecked(false); setRecording(false); } }}
      />
    )}

    {/* "Can't speak now" escape — skip with no water lost, or pause speaking drills for an hour */}
    {escape && (
      <div onClick={() => setEscape(false)} style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(20,30,40,0.5)', display: 'flex', alignItems: 'flex-end', animation: 'fbSlide 0ms' }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: SPROUT.paper, borderRadius: '22px 22px 0 0', padding: '20px 18px 26px', boxShadow: '0 -8px 30px rgba(0,0,0,0.18)', animation: 'fbSlide 240ms cubic-bezier(.2,.8,.2,1) both' }}>
          <style>{`@keyframes fbSlide{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
          <div style={{ width: 38, height: 4, borderRadius: 2, background: SPROUT.line, margin: '0 auto 14px' }}/>
          <div style={{ fontSize: 18, fontWeight: 900, color: SPROUT.ink, textAlign: 'center' }}>Can't speak right now?</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: SPROUT.mute, textAlign: 'center', marginTop: 4, lineHeight: 1.4 }}>No problem — on a train or in a quiet room, speaking can wait. 🌿</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
            <button onClick={() => { setEscape(false); if (onDone) onDone(true); }} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', background: SPROUT.paper, border: `2px solid ${SPROUT.line}`, borderRadius: 16, padding: '13px 15px', boxShadow: `0 3px 0 ${SPROUT.cardShadow}` }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, background: '#EAF4FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>⏭️</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: 15, fontWeight: 900, color: SPROUT.ink }}>Skip this phrase</span>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>No water lost — come back to it later</span>
              </span>
            </button>
            <button onClick={() => { setPaused(true); setEscape(false); if (onDone) onDone(true); }} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', background: SPROUT.paper, border: `2px solid ${SPROUT.line}`, borderRadius: 16, padding: '13px 15px', boxShadow: `0 3px 0 ${SPROUT.cardShadow}` }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, background: '#F1EBFB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>🔕</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: 15, fontWeight: 900, color: SPROUT.ink }}>Pause speaking for 1 hour</span>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>We'll swap in typing exercises instead</span>
              </span>
            </button>
          </div>
          <button onClick={() => setEscape(false)} style={{ width: '100%', marginTop: 14, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 900, color: SPROUT.mute, padding: '8px 0', minHeight: 44 }}>Keep speaking</button>
        </div>
      </div>
    )}
    </div>
  );
}

// 6) Fill in the blank ──────────────────────────────────────────
function ExFillBlank({ onDone, onExit, progress = 0.95, hard = false }) {
  // grammar cloze: subject–verb agreement. Distractors are minimal pairs
  // (go / going) that test the exact point, not random words.
  // `hard` → recall tier: type the word into the gap instead of picking a tile.
  const options = ['goes', 'go', 'going'];
  const answer = 0;
  const ANSWER_WORD = 'goes';
  const [sel, setSel] = React.useState(null);
  const [typed, setTyped] = React.useState('');
  const [checked, setChecked] = React.useState(false);
  const isCorrect = hard ? typed.trim().toLowerCase() === ANSWER_WORD : sel === answer;
  const big = options.length <= 3; // few options → big full-width buttons (Speak); else tile bank

  // the word currently dropped into the blank
  const filled = hard ? (typed.trim() || null) : (sel == null ? null : options[sel]);
  const canCheck = hard ? typed.trim().length > 0 : sel != null;

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
    <style>{`@keyframes fbWordPop { 0% { transform: scale(0.4) translateY(-6px); opacity: 0; } 60% { transform: scale(1.18); } 100% { transform: scale(1); opacity: 1; } }`}</style>
    <ExerciseShell
      prompt="Fill in the blank"
      pipMood={checked && isCorrect ? 'cheer' : 'happy'}
      pipText={checked ? (isCorrect ? 'Nice — "goes" matches "she".' : 'Close — watch the verb ending.') : (hard ? 'Type the word that fits the gap.' : 'Pick the word that fits the gap.')}
      progress={progress}
      onExit={onExit}
      footer={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ flex: 1 }}/>
          <PushButton size="lg" color={SPROUT.green} shadow={SPROUT.greenShadow} disabled={!canCheck} onClick={() => setChecked(true)}>Check</PushButton>
        </div>
      }
    >
      {/* context anchor — a small scene so the sentence carries meaning */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '9px 12px', borderRadius: 12, background: 'linear-gradient(90deg, #EAF4FA, #F4F8EC)', border: `1px solid ${SPROUT.line}` }}>
        <span style={{ fontSize: 26, flexShrink: 0 }}>🚶‍♀️</span>
        <div style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: SPROUT.mute, lineHeight: 1.3 }}>
          <span style={{ fontWeight: 900, color: SPROUT.ink }}>Maria's routine.</span> She works in the city.
        </div>
        {/* difficulty badge — recall-level (Duolingo "HARD EXERCISE") */}
        {hard && <span style={{ flexShrink: 0, fontSize: 9.5, fontWeight: 900, letterSpacing: 0.6, textTransform: 'uppercase', color: '#9B5413', background: '#FBE3C6', border: '1px solid #F0C998', borderRadius: 999, padding: '3px 8px' }}>Hard</span>}
      </div>

      <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.6, marginBottom: 10 }}>
        She{' '}
        {hard ? (
          <input
            value={typed}
            onChange={(e) => !checked && setTyped(e.target.value)}
            placeholder="type…"
            autoFocus
            style={{
              display: 'inline-block', width: 130, padding: '0 8px', font: 'inherit',
              textAlign: 'center', color: SPROUT.greenDark, background: 'transparent',
              border: 'none', borderBottom: `3px solid ${filled ? SPROUT.green : SPROUT.cream2}`,
              outline: 'none',
            }}
          />
        ) : (
          <span style={{
            display: 'inline-block', minWidth: 96, padding: '0 8px',
            borderBottom: `3px solid ${filled ? SPROUT.green : SPROUT.cream2}`,
            textAlign: 'center', color: SPROUT.greenDark,
          }}>
            {filled
              ? <span key={sel} style={{ display: 'inline-block', animation: 'fbWordPop 320ms cubic-bezier(.3,1.5,.5,1) both' }}>{filled}</span>
              : '\u00A0'}
          </span>
        )}
        {' '}to work every morning.
      </div>

      {/* plain-English meaning, with the tested word highlighted (Speak's translation idea, English-only) */}
      <div style={{ fontSize: 13.5, fontWeight: 700, color: SPROUT.mute, marginBottom: 18, lineHeight: 1.4 }}>
        Meaning: Every morning, Maria{' '}
        <span style={{ background: '#FBF1D6', color: '#94680E', borderRadius: 5, padding: '0 5px', fontWeight: 800, boxShadow: 'inset 0 -2px 0 #E7C77F' }}>travels</span>{' '}
        to her job.
      </div>

      {!hard && <div style={{ fontSize: 11, color: SPROUT.mute, fontWeight: 900, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.6 }}>Choose the word</div>}

      {hard ? (
        <div style={{ fontSize: 12.5, fontWeight: 700, color: SPROUT.mute, lineHeight: 1.4 }}>
          Type the correct form of the verb. <span style={{ color: SPROUT.greenDark, fontWeight: 800 }}>Recall mode</span> — no word bank.
        </div>
      ) : big ? (
        // few options → large, easy-to-tap full-width buttons
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {options.map((w, i) => {
            const on = sel === i;
            const showRight = checked && i === answer;
            const showWrong = checked && on && i !== answer;
            return (
              <button key={i} onClick={() => !checked && setSel(i)} style={{
                height: 54, width: '100%', borderRadius: 14, border: 'none', cursor: checked ? 'default' : 'pointer',
                background: showRight ? '#E3F5DB' : showWrong ? '#FDE5E5' : on ? '#EFF8E8' : '#fff',
                boxShadow: showRight ? `0 0 0 2px ${SPROUT.green}, 0 3px 0 ${SPROUT.greenShadow}`
                         : showWrong ? `0 0 0 2px ${SPROUT.coral}, 0 3px 0 #C85555`
                         : on ? `0 0 0 2px ${SPROUT.green}, 0 3px 0 ${SPROUT.greenShadow}`
                         : `0 0 0 1px ${SPROUT.line}, 0 3px 0 ${SPROUT.cardShadow}`,
                fontFamily: 'inherit', fontWeight: 800, fontSize: 17,
                color: showWrong ? '#9B3333' : (on || showRight) ? SPROUT.greenDark : SPROUT.ink,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>{w}</button>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {options.map((w, i) => {
            const on = sel === i;
            return (
              <button key={i} onClick={() => !checked && setSel(i)} style={{
                height: 46, padding: '0 16px', borderRadius: 12, border: 'none',
                background: on ? '#E3F5DB' : '#fff',
                boxShadow: on ? `0 0 0 2px ${SPROUT.green}, 0 2px 0 ${SPROUT.greenShadow}` : `0 0 0 1px ${SPROUT.line}, 0 2px 0 ${SPROUT.cardShadow}`,
                fontFamily: 'inherit', fontWeight: 800, fontSize: 15,
                color: on ? SPROUT.greenDark : SPROUT.ink, cursor: 'pointer',
              }}>{w}</button>
            );
          })}
        </div>
      )}
    </ExerciseShell>
    {checked && (
      <FeedbackDrawer
        state={isCorrect ? 'correct' : 'wrong'}
        correctAnswer={isCorrect ? undefined : '"goes"'}
        meaning={'With "she/he/it", the verb takes an -s: she goes, he runs, it works.'}
        example="She goes to work, and he goes to school."
        explanation={isCorrect
          ? 'Right — "she goes" is correct subject–verb agreement.'
          : 'With "she", use "goes" — the -s ending matches a single person.'}
        onContinue={() => { if (onDone) { onDone(isCorrect); } else { setChecked(false); setSel(answer); } }}
      />
    )}
    </div>
  );
}

Object.assign(window, { ExMultipleChoice, ExArrange, ExTypeHear, ExMatch, ExSpeak, ExFillBlank });
