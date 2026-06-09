// Feedback drawer — slides up after Check. Two states: correct / wrong.
// Reshapes the exercise footer: the drawer replaces Skip/Check with a full-width Continue.

// Tiny inline speaker — lets the learner hear the word/example right in the drawer.
function FBSpeaker({ accent, label }) {
  const [on, setOn] = React.useState(false);
  return (
    <button
      onClick={() => { setOn(true); setTimeout(() => setOn(false), 620); }}
      aria-label={`Hear ${label || 'audio'}`}
      style={{
        flexShrink: 0, border: 'none', cursor: 'pointer', padding: 0, marginLeft: 6,
        width: 24, height: 24, borderRadius: '50%', background: accent,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', verticalAlign: 'middle',
        transform: on ? 'scale(1.18)' : 'scale(1)', transition: 'transform .15s',
      }}>
      <Icon.Volume size={13} color="#fff"/>
    </button>
  );
}

// Renders the correct answer, bolding/underlining just the corrected token so the
// eye lands on what changed (Duolingo pattern). `highlight` is the word to emphasize.
function HighlightedAnswer({ text, highlight, accent }) {
  if (!highlight || typeof text !== 'string') return text;
  // case-insensitive, keep surrounding quotes/punctuation intact
  const idx = text.toLowerCase().indexOf(String(highlight).toLowerCase());
  if (idx < 0) return text;
  const before = text.slice(0, idx);
  const hit = text.slice(idx, idx + highlight.length);
  const after = text.slice(idx + highlight.length);
  return (
    <React.Fragment>
      {before}
      <span style={{ fontWeight: 900, textDecoration: 'underline', textDecorationColor: accent, textUnderlineOffset: 3, textDecorationThickness: 2 }}>{hit}</span>
      {after}
    </React.Fragment>
  );
}

function FeedbackDrawer({ state, correctAnswer, highlight, meaning, example, explanation, onContinue, onRetry, retryLabel, continueLabel, calm = false, combo = 0, audioWord, wordScores }) {
  // state: 'correct' | 'wrong' | 'almost' (gentle, for pronunciation — encouraging, never punishing)
  const correct = state === 'correct';
  const almost = state === 'almost';
  const skip = state === 'skip';
  // Flag-an-issue flow — gives learners a voice when a question's off (builds trust + feeds quality).
  const [reportOpen, setReportOpen] = React.useState(false);
  const [reported, setReported] = React.useState(false);
  // Haptic beat — light tap on correct, soft error buzz on wrong (never harsh).
  // Gated by the in-app haptics setting + reduce-motion inside haptic().
  React.useEffect(() => {
    if (typeof haptic === 'function') {
      if (correct) haptic('light');
      else if (state === 'wrong') haptic('error');
    }
    if (typeof sproutSound === 'function') {
      if (correct) sproutSound('correct');
      else if (state === 'wrong') sproutSound('wrong');
    }
  }, [state]);
  // Correct-state praise rotates so a streak of right answers never feels robotic.
  const PRAISE = ['Nicely done!', 'Blooming!', 'Fresh sprout!', 'That one took root!', 'In full bloom!'];
  const praiseTitle = React.useMemo(() => PRAISE[Math.floor(Math.random() * PRAISE.length)], [state]);
  const palette = correct
    ? { bg: '#E3F5DB', accent: SPROUT.green, shadow: SPROUT.greenShadow, ink: SPROUT.greenDark, title: praiseTitle }
    : almost
    ? { bg: '#FBEFD6', accent: SPROUT.sun, shadow: '#D7A52E', ink: '#94680E', title: 'Mmm… almost!' }
    : skip
    ? { bg: '#EAF4FA', accent: '#5AB9D9', shadow: '#7FB9D1', ink: '#1F5F7A', title: 'No worries' }
    // wrong → warm CLAY, never alarm red. A gentle nudge, not a buzzer. (✗ icon stays for color-independence.)
    : { bg: '#F4E7DB', accent: '#C77F57', shadow: '#A4613C', ink: '#7C4A2E', title: 'Good try!' };

  // combo milestones get a bigger burst; 5/10/15… award a small bonus
  const comboMilestone = correct && combo >= 5 && combo % 5 === 0;
  const burst = correct && !calm;

  const Speaker = ({ label }) => <FBSpeaker accent={palette.accent} label={label}/>;

  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      background: palette.bg, borderTop: `1px solid ${palette.accent}33`,
      animation: 'fbSlide 260ms cubic-bezier(.2,.8,.2,1) both',
      padding: '16px 16px 28px',
      boxShadow: '0 -8px 24px rgba(0,0,0,0.08)',
    }}>
      <style>{`
        @keyframes fbSlide { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fbBadgePop { 0% { transform: scale(0.3) rotate(-20deg); opacity: 0; } 60% { transform: scale(1.15) rotate(8deg); } 100% { transform: scale(1) rotate(0); opacity: 1; } }
        @keyframes fbShake { 10%,90% { transform: translateX(-2px); } 20%,80% { transform: translateX(3px); } 30%,50%,70% { transform: translateX(-5px); } 40%,60% { transform: translateX(5px); } }
        @keyframes fbLeaf { 0% { transform: translateY(0) rotate(0) scale(.4); opacity: 0; } 18% { opacity: 1; } 100% { transform: translateY(var(--fy)) translateX(var(--fx)) rotate(var(--fr)) scale(1); opacity: 0; } }
        @keyframes fbComboIn { 0% { transform: translateY(8px) scale(.9); opacity: 0; } 60% { transform: translateY(0) scale(1.04); } 100% { transform: translateY(0) scale(1); opacity: 1; } }
      `}</style>

      {/* leaf / petal burst on correct (Alan-style micro-celebration; off in calm mode) */}
      {burst && (
        <div aria-hidden style={{ position: 'absolute', top: 18, left: 34, width: 0, height: 0, pointerEvents: 'none' }}>
          {Array.from({ length: comboMilestone ? 16 : 9 }).map((_, i) => {
            const ang = (i / (comboMilestone ? 16 : 9)) * Math.PI * 2;
            const dist = 38 + (i % 3) * 16;
            const glyphs = ['🌿', '🍃', '🌱', '🌸'];
            return (
              <span key={i} style={{
                position: 'absolute', fontSize: comboMilestone ? 16 : 13,
                ['--fx']: `${Math.cos(ang) * dist}px`,
                ['--fy']: `${Math.sin(ang) * dist + 20}px`,
                ['--fr']: `${(i % 2 ? 1 : -1) * (120 + i * 18)}deg`,
                animation: `fbLeaf ${720 + (i % 4) * 120}ms cubic-bezier(.2,.7,.3,1) ${i * 18}ms both`,
              }}>{glyphs[i % glyphs.length]}</span>
            );
          })}
        </div>
      )}

      {/* Header row: badge + title + report */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: correct ? 4 : 8 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: palette.accent,
          boxShadow: `0 3px 0 ${palette.shadow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          animation: correct ? 'fbBadgePop 420ms cubic-bezier(.3,1.6,.5,1) both' : 'fbShake 500ms ease both',
        }}>
          {correct ? (
            <Icon.Check size={26} color="#fff"/>
          ) : almost ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 7v6" stroke="#fff" strokeWidth="3" strokeLinecap="round"/><circle cx="12" cy="17" r="1.6" fill="#fff"/></svg>
          ) : skip ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 5l10 7-10 7z" fill="#fff"/><rect x="17" y="5" width="3" height="14" rx="1.2" fill="#fff"/></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: palette.ink, letterSpacing: -0.2 }}>{palette.title}</div>
          {correct && <div style={{ fontSize: 12, fontWeight: 700, color: palette.ink, opacity: 0.7 }}>+10 XP{comboMilestone ? ' · +2 bonus' : ''}</div>}
          {(almost || skip) && <div style={{ fontSize: 12, fontWeight: 700, color: palette.ink, opacity: 0.7 }}>No water lost — keep going!</div>}
          {state === 'wrong' && <div style={{ fontSize: 12, fontWeight: 700, color: palette.ink, opacity: 0.75 }}>Mistakes help you grow 🌱</div>}
        </div>
        <button onClick={() => { if (!reported) setReportOpen((v) => !v); }} aria-label="Report an issue with this question" style={{
          border: 'none', background: reportOpen ? `${palette.accent}22` : 'transparent',
          fontSize: 11, fontWeight: 800, color: palette.ink, opacity: reported ? 0.5 : 0.7,
          textTransform: 'uppercase', letterSpacing: 0.5, cursor: reported ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 4, borderRadius: 8, padding: '5px 7px',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 4v16M4 4h12l-2 4 2 4H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {reported ? 'Thanks' : 'Report'}
        </button>
      </div>

      {/* Flag-an-issue panel — quiet, opens from Report; one tap files it, then thanks. */}
      {(reportOpen || reported) && (
        <div style={{
          background: 'rgba(255,255,255,0.7)', border: `1px solid ${palette.accent}40`,
          borderRadius: 12, padding: '10px 11px', marginBottom: 12,
          animation: 'fbComboIn 240ms cubic-bezier(.3,1.3,.5,1) both',
        }}>
          {reported ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: palette.ink }}>
              <span style={{ fontSize: 15 }}>🌿</span> Thanks — we'll take a look at this one.
            </div>
          ) : (
            <React.Fragment>
              <div style={{ fontSize: 9, fontWeight: 900, color: palette.ink, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 7 }}>What's off about this?</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['My answer was also right', 'The audio was unclear', "This doesn't make sense"].map((label) => (
                  <button key={label} onClick={() => { setReported(true); setReportOpen(false); }} style={{
                    textAlign: 'left', border: `1px solid ${palette.accent}33`, background: '#fff',
                    cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
                    color: palette.ink, borderRadius: 10, padding: '9px 11px',
                  }}>{label}</button>
                ))}
              </div>
            </React.Fragment>
          )}
        </div>
      )}

      {/* Combo callout — rewards momentum within a lesson (gentle, off in calm mode) */}
      {correct && !calm && combo >= 3 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
          padding: '8px 11px', borderRadius: 11,
          background: comboMilestone ? 'linear-gradient(90deg, #FFE9C2, #FFD79A)' : 'rgba(255,255,255,0.6)',
          border: `1px solid ${comboMilestone ? '#F0B85A' : palette.accent + '33'}`,
          animation: 'fbComboIn 360ms cubic-bezier(.3,1.4,.5,1) both',
        }}>
          <span style={{ fontSize: 17 }}>🔥</span>
          <span style={{ fontSize: 13.5, fontWeight: 900, color: comboMilestone ? '#8A5A1E' : palette.ink }}>
            {combo} in a row!{comboMilestone ? ' +2 bonus XP' : ''}
          </span>
        </div>
      )}

      {/* Correct answer callout — only when wrong; speaker lets them hear what they missed */}
      {!correct && !skip && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: palette.ink, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Correct answer:</div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 15, fontWeight: 800, color: palette.ink }}>
            <HighlightedAnswer text={correctAnswer} highlight={highlight} accent={palette.accent}/>
            {audioWord !== false && <Speaker label={typeof correctAnswer === 'string' ? correctAnswer : 'answer'}/>}
          </div>
        </div>
      )}

      {/* Meaning + example — context reinforcement (English-only learning) */}
      {(meaning || example) && (
        <div style={{
          background: 'rgba(255,255,255,0.55)',
          border: `1px solid ${palette.accent}33`,
          borderRadius: 12,
          padding: '8px 10px',
          marginBottom: 10,
        }}>
          {meaning && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: example ? 4 : 0 }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: palette.ink, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.6, flexShrink: 0 }}>Meaning</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: palette.ink, lineHeight: 1.35 }}>{meaning}</span>
            </div>
          )}
          {example && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: palette.ink, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.6, flexShrink: 0 }}>In use</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: palette.ink, opacity: 0.85, fontStyle: 'italic', lineHeight: 1.35 }}>{example}</span>
              {audioWord !== false && <Speaker label="example sentence"/>}
            </div>
          )}
        </div>
      )}

      {/* Per-word pronunciation breakdown — which words landed (green) vs to retry (amber).
          Lets the speaker see exactly what to fix instead of a binary pass/fail. */}
      {wordScores && wordScores.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.55)', border: `1px solid ${palette.accent}33`,
          borderRadius: 12, padding: '9px 10px 10px', marginBottom: 10,
        }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: palette.ink, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 7 }}>How each word landed</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {wordScores.map((w, i) => {
              const ok = w.ok;
              return (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '4px 9px', borderRadius: 999, fontSize: 13, fontWeight: 800,
                  background: ok ? '#E3F5DB' : '#FBEFD6',
                  color: ok ? SPROUT.greenDark : '#94680E',
                  border: `1px solid ${ok ? SPROUT.green + '66' : '#E6BE68'}`,
                }}>
                  <span style={{ fontSize: 10 }}>{ok ? '✓' : '↻'}</span>{w.word}
                </span>
              );
            })}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: palette.ink, opacity: 0.7, marginTop: 7 }}>
            {wordScores.filter(w => w.ok).length}/{wordScores.length} clear — amber ones just need another pass.
          </div>
        </div>
      )}

      {/* Explanation — a distinct "Why" teaching beat on a miss (Acorns/Alan pattern);
          plain reinforcing line when correct. Turns every wrong answer into a micro-lesson. */}
      {explanation && (!correct ? (
        <div style={{
          display: 'flex', gap: 9, alignItems: 'flex-start',
          background: 'rgba(255,255,255,0.7)', border: `1px solid ${palette.accent}40`,
          borderRadius: 12, padding: '10px 11px', marginBottom: 14,
        }}>
          <span style={{ fontSize: 15, lineHeight: 1.2, flexShrink: 0 }}>💡</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: palette.ink, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 }}>Why</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: palette.ink, lineHeight: 1.4 }}>{explanation}</div>
          </div>
        </div>
      ) : (
        <div style={{
          fontSize: 13, fontWeight: 600, color: palette.ink, opacity: 0.85,
          lineHeight: 1.4, marginBottom: 14,
        }}>
          {explanation}
        </div>
      ))}

      {/* Continue (+ optional gentle Try again) */}
      <div style={{ display: 'flex', gap: 10 }}>
        {onRetry && (
          <PushButton
            size="lg"
            color="#fff"
            shadow="#E8DFCE"
            onClick={onRetry}
            style={{ flex: 1, color: palette.ink, boxShadow: `inset 0 0 0 1.5px ${palette.accent}66, 0 3px 0 ${SPROUT.cardShadow}` }}
          >
            {retryLabel || 'Try again'}
          </PushButton>
        )}
        <PushButton
          size="lg"
          color={palette.accent}
          shadow={palette.shadow}
          onClick={onContinue}
          style={{ flex: 1 }}
        >
          {continueLabel || 'Continue'}
        </PushButton>
      </div>
    </div>
  );
}

// Demo: Multiple choice that shows the feedback flow.
// Start state: answer selected (wrong or right depending on variant), user can tap Check to see drawer.
function ExWithFeedback({ variant = 'correct' }) {
  // 'correct' → pre-select the right answer; 'wrong' → pre-select a wrong answer; drawer opens on mount
  const rightIdx = 1; // "a cat"
  const [sel, setSel] = React.useState(variant === 'correct' ? rightIdx : 2); // 2 = "a bird"
  const [checked, setChecked] = React.useState(true); // show drawer immediately for demo

  const options = [
    { label: 'a dog', glyph: '🐕' },
    { label: 'a cat', glyph: '🐈' },
    { label: 'a bird', glyph: '🐦' },
    { label: 'a fish', glyph: '🐟' },
  ];

  const isCorrect = sel === rightIdx;

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      <ExerciseShell
        prompt={'Which one is "the cat"?'}
        progress={0.55}
        footer={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button style={{ border: 'none', background: 'transparent', fontWeight: 800, fontSize: 13, color: SPROUT.mute, padding: '0 6px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5 }}>Skip</button>
            <div style={{ flex: 1 }}/>
            <PushButton size="lg" color={SPROUT.green} shadow={SPROUT.greenShadow} disabled={sel === null} onClick={() => setChecked(true)}>Check</PushButton>
          </div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {options.map((o, i) => {
            const on = i === sel;
            // highlight after check: correct=green, chosen-wrong=red, right answer when wrong=green outline
            let ring = `0 0 0 1px ${SPROUT.line}, 0 3px 0 ${SPROUT.cardShadow}`;
            let bg = '#fff';
            if (checked) {
              if (i === rightIdx) {
                ring = `0 0 0 2px ${SPROUT.green}, 0 3px 0 ${SPROUT.greenShadow}`;
                bg = '#E3F5DB';
              } else if (on) {
                ring = `0 0 0 2px ${SPROUT.coral}, 0 3px 0 #C85555`;
                bg = '#FDE5E5';
              }
            } else if (on) {
              ring = `0 0 0 2px ${SPROUT.green}, 0 3px 0 ${SPROUT.greenShadow}`;
              bg = '#E3F5DB';
            }
            return (
              <button key={i} onClick={() => !checked && setSel(i)} style={{
                border: 'none', cursor: checked ? 'default' : 'pointer', padding: 14,
                background: bg, borderRadius: 16, boxShadow: ring,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                fontFamily: 'inherit',
              }}>
                <div style={{ width: 72, height: 72, borderRadius: 14, background: SPROUT.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>{o.glyph}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, fontWeight: 900, fontSize: 12,
                    background: SPROUT.paper, border: `1.5px solid ${on ? (checked && !isCorrect ? SPROUT.coral : SPROUT.green) : SPROUT.line}`,
                    color: on ? (checked && !isCorrect ? '#C85555' : SPROUT.greenDark) : SPROUT.mute,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{i + 1}</div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: SPROUT.ink }}>{o.label}</div>
                </div>
              </button>
            );
          })}
        </div>
      </ExerciseShell>

      {checked && (
        <FeedbackDrawer
          state={isCorrect ? 'correct' : 'wrong'}
          correctAnswer='"a cat"'
          highlight="cat"
          meaning="A cat is a small furry pet with whiskers."
          example="The cat sleeps on the chair."
          combo={isCorrect ? 5 : 0}
          explanation={isCorrect
            ? 'Great listening — that "ka" sound is unique to cat.'
            : 'Listen again for the "ka" sound at the start.'}
          onContinue={() => {
            // reset: clear check, select the right answer so user can advance
            setChecked(false);
            setSel(rightIdx);
          }}
        />
      )}
    </div>
  );
}

Object.assign(window, { FeedbackDrawer, ExWithFeedback });
