// ─────────────────────────────────────────────────────────────
// SproutApp — the wired, playable flow.
// Home (winding path / garden / today) → tap a lesson or warm-up →
// run a queue of exercises → feedback after each → lesson complete →
// back home. Bottom nav routes between Learn / Words / League / Me.
// ─────────────────────────────────────────────────────────────

const EX_MAP = {
  'ex-mc':      'ExMultipleChoice',
  'ex-arrange': 'ExArrange',
  'ex-hear':    'ExTypeHear',
  'ex-match':   'ExMatch',
  'ex-speak':   'ExSpeak',
  'ex-fill':    'ExFillBlank',
};

// Runs a single lesson: a queue of exercise types, ending in LessonComplete.
function LessonRunner({ lesson, tweaks, onExit, onFinished }) {
  const [index, setIndex] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const [correctCount, setCorrectCount] = React.useState(0);

  const queue = lesson.queue || ['ex-mc'];
  const advance = (wasCorrect) => {
    if (wasCorrect) setCorrectCount((c) => c + 1);
    if (index + 1 < queue.length) setIndex(index + 1);
    else if (lesson.golden) { onFinished(); } // golden replay → GoldenBloomResult is the completion screen
    else setDone(true);
  };

  if (done) {
    return (
      <LessonComplete
        tweaks={tweaks}
        firstLesson={lesson.firstLesson}
        onContinue={onFinished}
        onReview={() => { setIndex(0); setDone(false); setCorrectCount(0); }}
      />
    );
  }

  const Cmp = window[EX_MAP[queue[index]]];
  const progress = (index + 1) / (queue.length + 1); // leaves headroom; completes at lesson end

  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <style>{`@keyframes exSlideIn { from { transform: translateX(28px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
      <div key={index} style={{ height: '100%', animation: 'exSlideIn 280ms cubic-bezier(.2,.8,.2,1) both' }}>
        {Cmp
          ? <Cmp onDone={advance} onExit={onExit} progress={progress} />
          : <div style={{ padding: 80, textAlign: 'center', fontFamily: '"Nunito", system-ui' }}>Unknown exercise: {queue[index]}</div>}
      </div>
    </div>
  );
}

// ── Simple tab screens so nav routing is meaningful ──────────────
function ScreenScaffold({ tweaks, tab, onTab, onStreakTap, onWaterTap, onGemsTap, children }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: SPROUT.bg, color: SPROUT.ink, fontFamily: '"Nunito", system-ui' }}>
      <TopBar tweaks={tweaks} onStreakTap={onStreakTap} onWaterTap={onWaterTap} onGemsTap={onGemsTap}/>
      <div style={{ flex: 1, overflow: 'auto', padding: `16px ${LAYOUT.padX}px ${LAYOUT.scrollBottom}px` }}>{children}</div>
      <BottomNav active={tab} onChange={onTab}/>
    </div>
  );
}

function SectionTitle({ children }) {
  return <div style={{ fontSize: 12, fontWeight: 800, color: SPROUT.mute, letterSpacing: 1, textTransform: 'uppercase', margin: '8px 4px 10px' }}>{children}</div>;
}

function WordsScreen({ tweaks, tab, onTab, onStartLesson, onOpenTale, onStreakTap, onWaterTap, onGemsTap }) {
  const [view, setView] = React.useState('words'); // 'words' | 'practice'
  const [searchOpen, setSearchOpen] = React.useState(false);
  const wordCount = (window.VOCAB || []).length;
  const weakCount = (window.VOCAB || []).filter((w) => w.strength <= 2).length;
  if (view === 'practice') {
    return <PracticeHub tweaks={tweaks} onBack={() => setView('words')} onStartLesson={onStartLesson} />;
  }
  return (
    <ScreenScaffold tweaks={tweaks} tab={tab} onTab={onTab} onStreakTap={onStreakTap} onWaterTap={onWaterTap} onGemsTap={onGemsTap}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', margin: '0 4px 4px' }}>
        <div style={{ fontSize: 24, fontWeight: 900 }}>Your words</div>
        <button onClick={() => setSearchOpen(true)} aria-label="Search words, lessons & tales" style={{
          width: 40, height: 40, marginTop: -2, marginRight: -4, borderRadius: 12, border: `1px solid ${SPROUT.line}`,
          background: SPROUT.paper, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={SPROUT.ink} strokeWidth="2" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M16 16l-3.5-3.5"/></svg>
        </button>
      </div>
      <div style={{ fontSize: 14, color: SPROUT.mute, fontWeight: 700, margin: '0 4px 16px' }}>{wordCount} words growing · {weakCount} need water</div>

      <button onClick={() => setView('practice')} style={{
        width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        background: '#EFF7EA', borderRadius: 16, padding: 14, marginBottom: 18,
        display: 'flex', alignItems: 'center', gap: 12, boxShadow: `0 3px 0 #CEE2C0`,
      }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: SPROUT.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon.Leaf size={22} color="#fff"/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>Practice Hub</div>
          <div style={{ fontSize: 12, color: SPROUT.mute, fontWeight: 700 }}>Review mistakes, weak words & drills</div>
        </div>
        <div style={{ fontSize: 20, color: SPROUT.greenDark }}>→</div>
      </button>

      <SectionTitle>Garden Tales</SectionTitle>
      <div style={{ marginBottom: 20 }}>
        <GardenTalesShelf onOpenTale={onOpenTale}/>
      </div>

      <WordsReview onStartLesson={onStartLesson}/>
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} onStartLesson={(m) => { setSearchOpen(false); onStartLesson && onStartLesson(m); }} onOpenTale={(t) => { setSearchOpen(false); onOpenTale && onOpenTale(t); }}/>}
    </ScreenScaffold>
  );
}

// LeagueScreen is provided by leagues.jsx (window.LeagueScreen)

function MeScreen({ tweaks, tab, onTab, onStreakTap, onStartLesson, onWaterTap, onGemsTap, onRestartOnboarding }) {
  const [view, setView] = React.useState(tweaks._startSettings ? 'settings' : 'profile'); // 'profile' | 'friends' | 'settings' | 'insights'
  const [shareOpen, setShareOpen] = React.useState(false);
  const [yib, setYib] = React.useState(false);
  const [parentHub, setParentHub] = React.useState(false); // gated grown-ups dashboard
  const calm = tweaks.calm;
  const stats = calm
    ? [{ k: 'Days grown', v: '34' }, { k: 'Words', v: '128' }, { k: 'Lessons', v: '46' }]
    : [{ k: 'Streak', v: '12' }, { k: 'Gems', v: '420' }, { k: 'Words', v: '128' }];
  const tier = (window.SKY_TIERS || []).find((t) => t.id === 'rainbow') || { name: 'Rainbow', color: '#E48A7C', shadow: '#B25F52', textColor: '#5A1F18', glyph: 'rainbow' };

  if (view === 'friends') {
    return <FriendsScreen tweaks={tweaks} onBack={() => setView('profile')} onStartLesson={onStartLesson} />;
  }
  if (view === 'settings') {
    return <SettingsScreen tweaks={tweaks} tab={tab} onTab={onTab} onStreakTap={onStreakTap} onWaterTap={onWaterTap} onGemsTap={onGemsTap} onBack={() => setView('profile')} onRestartOnboarding={onRestartOnboarding} />;
  }
  if (view === 'insights') {
    return (
      <div style={{ height: '100%', position: 'relative' }}>
        <InsightsScreen tweaks={tweaks} onBack={() => setView('profile')} onYearInBloom={() => setYib(true)} />
        {yib && <YearInBloom onClose={() => setYib(false)} />}
      </div>
    );
  }
  if (view === 'monthly') {
    return (
      <ScreenScaffold tweaks={tweaks} tab="me" onTab={onTab} onStreakTap={onStreakTap} onWaterTap={onWaterTap} onGemsTap={onGemsTap}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 16px' }}>
          <button onClick={() => setView('profile')} aria-label="Back to profile" style={{ width: 44, height: 44, marginLeft: -8, borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.ChevL size={24} color={SPROUT.ink}/>
          </button>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>Monthly Blooms</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: SPROUT.mute }}>A flower for every month 🌸</div>
          </div>
        </div>
        <MonthlyBloomsGrid/>
      </ScreenScaffold>
    );
  }
  if (view === 'customize') {
    return <Customizer tweaks={tweaks} onBack={() => setView('profile')} />;
  }

  return (
    <ScreenScaffold tweaks={tweaks} tab={tab} onTab={onTab} onStreakTap={onStreakTap} onWaterTap={onWaterTap} onGemsTap={onGemsTap}>
      {/* Header — avatar + name, gear top-right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '4px 4px 18px' }}>
        <button onClick={() => setView('customize')} aria-label="Style your garden" style={{
          width: 72, height: 72, borderRadius: '50%', background: '#EFF7EA', border: `2px solid ${SPROUT.green}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer',
          padding: 0, position: 'relative',
        }}>
          <Pip size={58} mood="happy"/>
          <span style={{ position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: '50%', background: SPROUT.green, border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>🎨</span>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 900 }}>Alex</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: SPROUT.mute }}>Learning English · joined Mar 2026</div>
        </div>
        <button onClick={() => setView('settings')} aria-label="Settings" style={{
          width: 44, height: 44, flexShrink: 0, borderRadius: 12, cursor: 'pointer',
          border: `1px solid ${SPROUT.line}`, background: SPROUT.paper, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon.Gear size={22} color={SPROUT.mute}/>
        </button>
      </div>

      {/* Garden case — collectibles earned by growing, never a rank. */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        {/* Days tended — gentle consistency, not a streak-as-identity flex */}
        <div style={{
          background: '#EAF4FA', color: '#1F5F7A', borderRadius: 16, padding: '12px 13px',
          boxShadow: '0 3px 0 #BFD8E4', position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon.Leaf size={22} color="#3E88A8"/>
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 0.8, opacity: 0.75, textTransform: 'uppercase' }}>Days tended</div>
            <div style={{ fontSize: 15, fontWeight: 900, lineHeight: 1.1 }}>{calm ? '34' : '12'} days</div>
          </div>
        </div>

        {/* Golden Blooms tile */}
        <div style={{
          background: SPROUT.paper, borderRadius: 16, padding: '12px 13px', border: `1px solid ${SPROUT.line}`,
          boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#FCEFC7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon.Flower size={24} color="#E0A21C"/>
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 0.8, color: SPROUT.mute, textTransform: 'uppercase' }}>Golden blooms</div>
            <div style={{ fontSize: 15, fontWeight: 900, lineHeight: 1.1, color: '#C28A1C' }}>2 <span style={{ color: SPROUT.mute, fontWeight: 800 }}>/ 8</span></div>
          </div>
        </div>
      </div>

      {/* Core stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 18 }}>
        {stats.map((s) => (
          <div key={s.k} style={{ background: SPROUT.paper, borderRadius: 14, padding: '12px 8px', border: `1px solid ${SPROUT.line}`, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: SPROUT.greenDark }}>{s.v}</div>
            <div style={{ fontSize: 10, fontWeight: 800, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>{s.k}</div>
          </div>
        ))}
      </div>

      {/* Share my garden — always-available, not just at milestones */}
      <button onClick={() => setShareOpen(true)} style={{
        width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        background: 'linear-gradient(150deg, #EFF7EA, #FBF1DC)', borderRadius: 16, padding: 14, marginBottom: 18,
        display: 'flex', alignItems: 'center', gap: 12, boxShadow: `0 3px 0 ${SPROUT.greenShadow}`,
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: SPROUT.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 2px 0 ${SPROUT.greenShadow}` }}>
          <Icon.Share size={22} color="#fff"/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 900 }}>Share my garden</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>{calm ? 'Your plant + days grown' : 'Your plant, streak & league'}</div>
        </div>
        <Icon.ChevR size={20} color={SPROUT.mute}/>
      </button>

      {/* What you're learning — mastery by area, not a single score. Answers "am I growing?" */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 2px 8px' }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: SPROUT.mute, letterSpacing: 1, textTransform: 'uppercase' }}>What you're learning</span>
        <button onClick={() => setView('insights')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 900, color: SPROUT.greenDark, padding: 0 }}>See insights ›</button>
      </div>
      <div style={{ marginBottom: 20 }}>
        <MasteryByArea/>
      </div>

      <button onClick={() => setView('friends')} style={{
        width: '100%', border: `1px solid ${SPROUT.line}`, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        background: SPROUT.paper, borderRadius: 16, padding: 14, marginBottom: 22,
        display: 'flex', alignItems: 'center', gap: 12, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
      }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: SPROUT.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon.Users size={22} color="#fff"/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 900 }}>Friends</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>4 friends · 1 co-op quest active</div>
        </div>
        <Icon.ChevR size={20} color={SPROUT.mute}/>
      </button>

      <SectionTitle>Your blooms</SectionTitle>
      <div style={{ marginBottom: 12 }}>
        <GoldenBloomCounter earned={2} total={8}/>
      </div>
      {/* Monthly seasonal collectibles — a Duolingo-style yearly grid */}
      <button onClick={() => setView('monthly')} style={{
        width: '100%', textAlign: 'left', border: `1px solid ${SPROUT.line}`, cursor: 'pointer', fontFamily: 'inherit',
        background: 'linear-gradient(100deg, #EFF7EA, #F7F1E2)', borderRadius: 16, padding: '13px 14px',
        marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
      }}>
        <div style={{ display: 'flex', flexShrink: 0 }}>
          {MONTH_BLOOMS.slice(3, 6).map((b, i) => (
            <div key={b.m} style={{ marginLeft: i ? -10 : 0 }}><SeasonBloom data={b} size={34} lit={true}/></div>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 900 }}>Monthly Blooms</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>A new seasonal flower each month · 5/12 this year</div>
        </div>
        <Icon.ChevR size={18} color={SPROUT.mute}/>
      </button>
      <div style={{ marginBottom: 22 }}>
        <BloomsGrid/>
      </div>

      {/* For grown-ups — the parent's door: gated summary, account, privacy, Family plan. */}
      <button onClick={() => setParentHub(true)} style={{
        width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
        background: SPROUT.paper, border: `1px dashed ${SPROUT.mute}66`, borderRadius: 16, padding: '13px 14px',
        marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: '#EFF7EA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>🌿</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 900, color: SPROUT.ink }}>For grown-ups</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>Progress summary, account & plan — behind a parent check</div>
        </div>
        <Icon.ChevR size={18} color={SPROUT.mute}/>
      </button>

      {shareOpen && (
        <ShareCardOverlay days={calm ? 34 : 12} tier="sprout" onClose={() => setShareOpen(false)}/>
      )}
      {parentHub && typeof ParentHub === 'function' && <ParentHub onClose={() => setParentHub(false)} childName="Alex"/>}
    </ScreenScaffold>
  );
}

// ── Settings — pulled off the profile, behind the gear (Duolingo/Mimo/Balance pattern) ──
function SettingsScreen({ tweaks, tab, onTab, onStreakTap, onWaterTap, onGemsTap, onBack, onRestartOnboarding }) {
  // Named commitment tiers — choosing a "personality" reads kinder than a bare number.
  const GOAL_TIERS = [
    { id: 'casual', label: 'Casual', xp: 10, blurb: 'A gentle daily touch' },
    { id: 'regular', label: 'Regular', xp: 20, blurb: 'A steady habit 🌱', leaf: true },
    { id: 'committed', label: 'Committed', xp: 30, blurb: 'Real momentum' },
    { id: 'intense', label: 'Intense', xp: 50, blurb: 'Grow fast' },
  ];
  const [goalId, setGoalId] = React.useState('regular');
  const [goalPicker, setGoalPicker] = React.useState(false);
  // Reminder cadence — user-owned, calm defaults: ONE gentle daily nudge.
  const REMIND_TIMES = ['8:00 AM', '9:00 AM', '12:30 PM', '6:00 PM', '8:30 PM'];
  const [remindOn, setRemindOn] = React.useState(true);
  const [remindTime, setRemindTime] = React.useState('9:00 AM');
  const [remindFreq, setRemindFreq] = React.useState('gentle'); // 'gentle' | 'daily' | 'off'
  const [quietHours, setQuietHours] = React.useState(true);
  const [reminderSheet, setReminderSheet] = React.useState(false);
  const [logoutSheet, setLogoutSheet] = React.useState(false);
  const [deleteSheet, setDeleteSheet] = React.useState(false);
  const [emailSheet, setEmailSheet] = React.useState(false);
  const [loginSheet, setLoginSheet] = React.useState(false);
  const [exportState, setExportState] = React.useState('idle'); // idle | preparing | ready
  const [offlineOpen, setOfflineOpen] = React.useState(false);
  const [parentHub, setParentHub] = React.useState(false); // gated grown-ups area
  const [appearance, setAppearance] = React.useState(() => { try { return localStorage.getItem('sprout.theme') || 'system'; } catch (e) { return 'system'; } });
  const [autoEvening, setAutoEvening] = React.useState(() => { try { return localStorage.getItem('sprout.autoEvening') === 'on'; } catch (e) { return false; } });
  // Re-theme the WHOLE app: persist + broadcast to the App-root listener.
  const changeTheme = (pref) => {
    setAppearance(pref);
    try { localStorage.setItem('sprout.theme', pref); } catch (e) {}
    try { window.dispatchEvent(new CustomEvent('sprout-theme', { detail: { pref } })); } catch (e) {}
    if (typeof haptic === 'function') haptic('select');
  };
  const changeEvening = (on) => {
    setAutoEvening(on);
    try { localStorage.setItem('sprout.autoEvening', on ? 'on' : 'off'); } catch (e) {}
    try { window.dispatchEvent(new CustomEvent('sprout-theme', { detail: { autoEvening: on } })); } catch (e) {}
  };
  const [motionPrefs, setMotionPrefs] = React.useState(() => {
    const read = (k) => { try { const v = localStorage.getItem(k); return v == null ? null : v === 'on'; } catch (e) { return null; } };
    return {
      'sprout.haptics': read('sprout.haptics'),
      'sprout.reduceMotion': read('sprout.reduceMotion'),
      'sprout.highContrast': read('sprout.highContrast'),
      'sprout.colorSafe': read('sprout.colorSafe'),
      'sprout.voiceover': read('sprout.voiceover'),
    };
  });
  const [textSize, setTextSize] = React.useState(() => { try { return +(localStorage.getItem('sprout.textSize') || 1); } catch (e) { return 1; } });
  const [soundPrefs, setSoundPrefs] = React.useState(() => {
    const read = (k) => { try { const v = localStorage.getItem(k); return v == null ? null : v === 'on'; } catch (e) { return null; } };
    return { 'sprout.sound': read('sprout.sound'), 'sprout.soundFx': read('sprout.soundFx'), 'sprout.soundPip': read('sprout.soundPip'), 'sprout.haptics': read('sprout.haptics') };
  });
  const [ambientOn, setAmbientOn] = React.useState(() => { try { return localStorage.getItem('sprout.ambient') === 'on'; } catch (e) { return false; } });
  const goal = GOAL_TIERS.find((g) => g.id === goalId);

  const learning = [
    { label: 'Calm mode', value: tweaks.calm ? 'On' : 'Off' },
    { label: 'Daily goal', value: tweaks.calm ? 'Gentle' : `${goal.label} · ${goal.xp} XP`, onTap: () => setGoalPicker(true) },
    { label: 'Practice offline', value: '2 ready', onTap: () => setOfflineOpen(true) },
    { label: 'Reminders', value: remindOn ? `${remindFreq === 'gentle' ? 'Gentle' : 'Daily'} · ${remindTime}` : 'Off', onTap: () => setReminderSheet(true) },
  ];
  const account = [
    { label: 'Profile', value: 'Alex' },
    { label: 'Email', value: 'alex@email.com', onTap: () => setEmailSheet(true) },
    { label: 'Login methods', value: 'Google', onTap: () => setLoginSheet(true) },
    { label: 'Notifications', value: 'On' },
  ];
  const card = {
    background: SPROUT.paper, borderRadius: 16, border: `1px solid ${SPROUT.line}`,
    boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, overflow: 'hidden', marginBottom: 18,
  };
  const rowStyle = (i) => ({
    display: 'flex', alignItems: 'center', minHeight: 48, padding: '13px 14px',
    borderTop: i === 0 ? 'none' : `1px solid ${SPROUT.line}`,
  });
  const Row = ({ r, i }) => r.onTap ? (
    <button onClick={r.onTap} style={{ ...rowStyle(i), width: '100%', textAlign: 'left', border: 'none', background: SPROUT.paper, cursor: 'pointer', fontFamily: 'inherit' }}>
      <div style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>{r.label}</div>
      <span style={{ fontSize: 14, fontWeight: 800, color: SPROUT.mute }}>{r.value}</span>
      <span style={{ marginLeft: 6, display: 'flex' }}><Icon.ChevR size={16} color={SPROUT.mute}/></span>
    </button>
  ) : (
    <div style={rowStyle(i)}>
      <div style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>{r.label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {r.value && <span style={{ fontSize: 14, fontWeight: 800, color: SPROUT.mute }}>{r.value}</span>}
        <Icon.ChevR size={16} color={SPROUT.mute}/>
      </div>
    </div>
  );

  return (
    <div style={{ height: '100%', position: 'relative' }}>
    <ScreenScaffold tweaks={tweaks} tab={tab} onTab={onTab} onStreakTap={onStreakTap} onWaterTap={onWaterTap} onGemsTap={onGemsTap}>
      {/* Back header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 18px' }}>
        <button onClick={onBack} aria-label="Back to profile" style={{
          width: 44, height: 44, marginLeft: -8, borderRadius: 12, border: 'none', background: 'transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon.ChevL size={24} color={SPROUT.ink}/>
        </button>
        <div style={{ fontSize: 24, fontWeight: 900 }}>Settings</div>
      </div>

      <SectionTitle>Learning</SectionTitle>
      <div style={card}>
        {learning.map((r, i) => <Row key={r.label} r={r} i={i}/>)}
      </div>

      {/* For grown-ups — surfaces the parent gate → dashboard / Family plan in the
          place a parent naturally looks for controls (not just shop/profile). */}
      <SectionTitle>For grown-ups</SectionTitle>
      <button onClick={() => setParentHub(true)} style={{
        width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
        background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 16, padding: '13px 14px',
        marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
      }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: '#EFF7EA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>🌿</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: SPROUT.ink }}>Parents &amp; plan</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>Progress summary, Family plan, privacy — behind a quick parent check</div>
        </div>
        <Icon.ChevR size={18} color={SPROUT.mute}/>
      </button>

      {/* Appearance — TEMP hidden while light-mode only. Re-enable by flipping ALLOW_DARK in shared.jsx. */}
      {(typeof ALLOW_DARK === 'undefined' || ALLOW_DARK) && (
        <React.Fragment>
          <SectionTitle>Appearance</SectionTitle>
          <div style={{ marginBottom: 18 }}>
            <AppearanceControl value={appearance} onChange={changeTheme} autoEvening={autoEvening} onAutoEvening={changeEvening} dark={false}/>
          </div>
        </React.Fragment>
      )}

      <SectionTitle>Accessibility</SectionTitle>
      {/* Dynamic Type — text size that honors the reader's needs */}
      <div style={{ ...card, padding: '13px 14px', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 9 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>Text size</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: SPROUT.greenDark }}>{['Small', 'Default', 'Large', 'Larger', 'Largest'][textSize]}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 900, color: SPROUT.mute }}>A</span>
          <input type="range" min={0} max={4} step={1} value={textSize}
            onChange={(e) => { const v = +e.target.value; setTextSize(v); try { localStorage.setItem('sprout.textSize', String(v)); } catch (er) {} if (typeof haptic === 'function') haptic('select'); }}
            aria-label="Text size" style={{ flex: 1, accentColor: SPROUT.green, height: 30 }}/>
          <span style={{ fontSize: 22, fontWeight: 900, color: SPROUT.ink }}>A</span>
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: SPROUT.mute, marginTop: 6 }}>Follows your iOS Dynamic Type setting. Layouts stay readable at the largest size.</div>
      </div>
      <div style={card}>
        {[
          { label: 'High contrast', key: 'sprout.highContrast', desc: 'Stronger borders & text contrast', def: false },
          { label: 'Color-safe feedback', key: 'sprout.colorSafe', desc: 'Adds ✓/✗ icons + labels, never color alone', def: true },
          { label: 'Reduce motion', key: 'sprout.reduceMotion', desc: 'Calmer cross-fades instead of big celebrations', def: false },
          { label: 'Haptics', key: 'sprout.haptics', desc: 'Gentle taps on correct, complete & more', def: true },
          { label: 'VoiceOver hints', key: 'sprout.voiceover', desc: 'Spoken labels for icons & stats ("12-day streak")', def: true },
        ].map((r, i, arr) => {
          const stored = motionPrefs[r.key];
          const on = stored != null ? stored : r.def;
          return (
            <div key={r.key} style={{ ...rowStyle(i), cursor: 'default', borderBottom: i < arr.length - 1 ? `1px solid ${SPROUT.line}` : 'none' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800 }}>{r.label}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>{r.desc}</div>
              </div>
              <button onClick={() => {
                const next = !on;
                try { localStorage.setItem(r.key, next ? 'on' : 'off'); } catch (e) {}
                setMotionPrefs((p) => ({ ...p, [r.key]: next }));
                if (typeof haptic === 'function' && next && r.key === 'sprout.haptics') haptic('medium');
              }} role="switch" aria-checked={on} aria-label={r.label} style={{
                width: 46, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0,
                background: on ? SPROUT.green : SPROUT.line, position: 'relative', transition: 'background .2s',
              }}>
                <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 22, height: 22, borderRadius: '50%', background: SPROUT.paper, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}/>
              </button>
            </div>
          );
        })}
      </div>

      <SectionTitle>Sound &amp; haptics</SectionTitle>
      <div style={card}>
        {[
          { label: 'Sounds', key: 'sprout.sound', desc: 'Master switch for all audio', def: true, demo: 'tap' },
          { label: 'Sound effects', key: 'sprout.soundFx', desc: 'Gentle chimes on correct, wrong & taps', def: true, demo: 'correct' },
          { label: 'Pip’s sounds', key: 'sprout.soundPip', desc: 'A soft bloom at lessons & goals', def: true, demo: 'complete' },
          { label: 'Haptics', key: 'sprout.haptics', desc: 'Gentle taps paired with sounds', def: true },
        ].map((r, i, arr) => {
          const stored = soundPrefs[r.key];
          const on = stored != null ? stored : r.def;
          return (
            <div key={r.key} style={{ ...rowStyle(i), cursor: 'default', borderBottom: i < arr.length - 1 ? `1px solid ${SPROUT.line}` : 'none' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800 }}>{r.label}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>{r.desc}</div>
              </div>
              <button onClick={() => {
                const next = !on;
                if (typeof setSoundPref === 'function') setSoundPref(r.key, next); else { try { localStorage.setItem(r.key, next ? 'on' : 'off'); } catch (e) {} }
                setSoundPrefs((p) => ({ ...p, [r.key]: next }));
                if (next && r.demo && typeof sproutSound === 'function') sproutSound(r.demo);
                if (next && r.key === 'sprout.haptics' && typeof haptic === 'function') haptic('medium');
              }} role="switch" aria-checked={on} aria-label={r.label} style={{
                width: 46, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0,
                background: on ? SPROUT.green : SPROUT.line, position: 'relative', transition: 'background .2s',
              }}>
                <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}/>
              </button>
            </div>
          );
        })}
      </div>
      {/* Ambient garden soundscape — off by default; a gentle bed during practice */}
      <button onClick={() => {
        const next = !ambientOn;
        setAmbientOn(next);
        if (typeof setSoundPref === 'function') setSoundPref('sprout.ambient', next);
        if (next && typeof startAmbient === 'function') startAmbient();
        else if (typeof stopAmbient === 'function') stopAmbient();
      }} style={{
        width: '100%', marginTop: 10, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        background: ambientOn ? '#EFF7EA' : SPROUT.paper, border: `1px solid ${ambientOn ? SPROUT.green : SPROUT.line}`, borderRadius: 16, padding: '13px 14px',
        boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
      }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: ambientOn ? SPROUT.green : SPROUT.cream2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{ambientOn ? '🐦' : '🍃'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 900 }}>Garden soundscape</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>{ambientOn ? 'Playing — soft breeze & birdsong 🌿' : 'A gentle ambient bed during practice'}</div>
        </div>
        <div style={{ width: 46, height: 28, borderRadius: 999, background: ambientOn ? SPROUT.green : SPROUT.line, position: 'relative', flexShrink: 0, transition: 'background .2s' }}>
          <span style={{ position: 'absolute', top: 3, left: ambientOn ? 21 : 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}/>
        </div>
      </button>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: SPROUT.mute, margin: '8px 4px 0', lineHeight: 1.4 }}>Sounds follow your phone’s silent switch. 🌱</div>

      <SectionTitle>Account</SectionTitle>
      <div style={card}>
        {account.map((r, i) => <Row key={r.label} r={r} i={i}/>)}
        {onRestartOnboarding && (
          <button onClick={onRestartOnboarding} style={{
            width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', minHeight: 48, padding: '13px 14px', borderTop: `1px solid ${SPROUT.line}`, background: SPROUT.paper,
          }}>
            <div style={{ flex: 1, fontSize: 15, fontWeight: 700, color: SPROUT.greenDark }}>Replay welcome flow</div>
            <Icon.ChevR size={18} color={SPROUT.mute}/>
          </button>
        )}
      </div>

      <SectionTitle>Data &amp; privacy</SectionTitle>
      {/* Plain-language summary — privacy by simplicity (we collect little, no IAP) */}
      <div style={{ ...card, padding: '14px', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>🌱</span>
          <div style={{ fontSize: 13, fontWeight: 700, color: SPROUT.ink, lineHeight: 1.45 }}>
            <strong style={{ fontWeight: 900 }}>What we keep:</strong> your progress, streak, and email. That’s it — we don’t sell your data, and there are no purchases.
          </div>
        </div>
      </div>
      <div style={card}>
        <Row r={{ label: 'Privacy Policy', value: '' }} i={0}/>
        <Row r={{ label: 'Terms of Service', value: '' }} i={1}/>
        <button onClick={() => {
          if (exportState !== 'idle') return;
          setExportState('preparing');
          setTimeout(() => setExportState('ready'), 1500);
        }} style={{
          width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', minHeight: 48, padding: '13px 14px', borderTop: `1px solid ${SPROUT.line}`, background: SPROUT.paper,
        }}>
          <div style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>Export my data</div>
          <span style={{ fontSize: 13, fontWeight: 800, color: exportState === 'ready' ? SPROUT.greenDark : SPROUT.mute }}>
            {exportState === 'preparing' ? 'Preparing…' : exportState === 'ready' ? 'Sent to your email ✓' : 'Progress, words & garden'}
          </span>
          {exportState === 'idle' && <span style={{ marginLeft: 6, display: 'flex' }}><Icon.ChevR size={16} color={SPROUT.mute}/></span>}
        </button>
        {/* In-app account deletion — App Store Guideline 5.1.1(v) requirement */}
        <button onClick={() => setDeleteSheet(true)} style={{
          width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', minHeight: 48, padding: '13px 14px', borderTop: `1px solid ${SPROUT.line}`, background: SPROUT.paper,
        }}>
          <div style={{ flex: 1, fontSize: 15, fontWeight: 700, color: SPROUT.coral }}>Delete account</div>
          <Icon.ChevR size={18} color={SPROUT.mute}/>
        </button>
      </div>

      <SectionTitle>Support &amp; about</SectionTitle>
      <div style={card}>
        <Row r={{ label: 'Help center', value: '' }} i={0}/>
      </div>

      <button onClick={() => setLogoutSheet(true)} style={{
        width: '100%', border: `1px solid ${SPROUT.line}`, cursor: 'pointer', fontFamily: 'inherit',
        background: SPROUT.paper, borderRadius: 16, padding: '14px', marginBottom: 10, color: SPROUT.coral,
        fontSize: 15, fontWeight: 900, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
      }}>Log out</button>

      <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 800, color: SPROUT.mute, marginBottom: 8 }}>Sprout v1.0 🌱</div>

      {/* ── Reminder settings sheet — user-owned cadence + quiet hours ── */}
      {reminderSheet && (
        <SettingsSheet onClose={() => setReminderSheet(false)} title="Reminders" sub="A gentle nudge to tend your garden — yours to shape. Pip never guilt-trips.">
          {/* master on/off */}
          <button onClick={() => setRemindOn((v) => !v)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
            background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14, padding: '13px 14px', marginBottom: 12,
          }}>
            <span style={{ fontSize: 20 }}>🔔</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 900 }}>Daily reminder</div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: SPROUT.mute }}>{remindOn ? 'On — one gentle nudge a day' : 'Off — no reminders'}</div>
            </div>
            <div style={{ width: 46, height: 28, borderRadius: 999, background: remindOn ? SPROUT.green : SPROUT.line, position: 'relative', flexShrink: 0, transition: 'background .2s' }}>
              <div style={{ position: 'absolute', top: 3, left: remindOn ? 21 : 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}/>
            </div>
          </button>

          {remindOn && (
            <React.Fragment>
              {/* time */}
              <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.6, margin: '4px 2px 8px' }}>When should Pip say hi?</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
                {REMIND_TIMES.map((t) => {
                  const on = remindTime === t;
                  return (
                    <button key={t} onClick={() => setRemindTime(t)} style={{
                      border: `1.5px solid ${on ? SPROUT.green : SPROUT.line}`, cursor: 'pointer', fontFamily: 'inherit',
                      background: on ? '#EFF7EA' : SPROUT.paper, color: on ? SPROUT.greenDark : SPROUT.ink,
                      fontSize: 13, fontWeight: 900, borderRadius: 999, padding: '9px 14px', minHeight: 40,
                    }}>{t}</button>
                  );
                })}
              </div>

              {/* frequency — gentle is the calm default */}
              <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.6, margin: '0 2px 8px' }}>How often</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {[
                  { id: 'gentle', label: 'Gentle', sub: 'One soft nudge — only if you haven’t practised', rec: true },
                  { id: 'daily', label: 'Daily', sub: 'A friendly reminder every day at your time' },
                ].map((f) => {
                  const on = remindFreq === f.id;
                  return (
                    <button key={f.id} onClick={() => setRemindFreq(f.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                      padding: '12px 14px', borderRadius: 14, background: on ? '#EFF7EA' : SPROUT.paper,
                      border: `1.5px solid ${on ? SPROUT.green : SPROUT.line}`,
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14.5, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 7 }}>
                          {f.label}
                          {f.rec && <span style={{ fontSize: 9.5, fontWeight: 900, color: SPROUT.greenDark, background: '#DCEFCF', padding: '2px 7px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: 0.4 }}>Recommended</span>}
                        </div>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: SPROUT.mute, marginTop: 2 }}>{f.sub}</div>
                      </div>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${on ? SPROUT.green : SPROUT.line}`, background: on ? SPROUT.green : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {on && <Icon.Check size={13} color="#fff"/>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* quiet hours */}
              <button onClick={() => setQuietHours((v) => !v)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14, padding: '12px 14px',
              }}>
                <span style={{ fontSize: 19 }}>🌙</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 900 }}>Respect quiet hours</div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: SPROUT.mute }}>Never nudge 9 PM–8 AM or during Do Not Disturb</div>
                </div>
                <div style={{ width: 46, height: 28, borderRadius: 999, background: quietHours ? SPROUT.green : SPROUT.line, position: 'relative', flexShrink: 0, transition: 'background .2s' }}>
                  <div style={{ position: 'absolute', top: 3, left: quietHours ? 21 : 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}/>
                </div>
              </button>

              <div style={{ fontSize: 11.5, fontWeight: 700, color: SPROUT.mute, textAlign: 'center', marginTop: 14, lineHeight: 1.4, padding: '0 8px' }}>
                We’ll never spam you after a missed day — just a warm “welcome back” when you return. 🌱
              </div>
            </React.Fragment>
          )}
        </SettingsSheet>
      )}

      {/* ── Daily-goal picker sheet — named tiers ── */}
      {goalPicker && (
        <SettingsSheet onClose={() => setGoalPicker(false)} title="Daily goal" sub="How much do you want to grow each day? You can change this anytime.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {GOAL_TIERS.map((g) => {
              const on = g.id === goalId;
              return (
                <button key={g.id} onClick={() => { setGoalId(g.id); setTimeout(() => setGoalPicker(false), 180); }} style={{
                  display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                  padding: '13px 14px', borderRadius: 14, background: on ? '#EFF7EA' : '#fff',
                  border: `2px solid ${on ? SPROUT.green : SPROUT.line}`,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 900, color: SPROUT.ink }}>{g.label} {g.leaf && '🌱'}</div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: SPROUT.mute, marginTop: 1 }}>{g.blurb}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: on ? SPROUT.greenDark : SPROUT.mute }}>{g.xp} XP</div>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${on ? SPROUT.green : SPROUT.line}`, background: on ? SPROUT.green : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {on && <Icon.Check size={13} color="#fff"/>}
                  </div>
                </button>
              );
            })}
          </div>
        </SettingsSheet>
      )}

      {/* ── Log-out confirm sheet — guards a mis-tap, reassures progress is saved ── */}
      {logoutSheet && (
        <SettingsSheet onClose={() => setLogoutSheet(false)} title="Log out of Sprout?" sub="Your garden, streak &amp; gems are safely saved ☁️ — they'll be right here when you come back.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 2 }}>
            <button style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: SPROUT.coral, color: '#fff', fontSize: 15.5, fontWeight: 900, borderRadius: 14, padding: '15px', boxShadow: '0 3px 0 #D9655F' }}>Log out</button>
            <button onClick={() => setLogoutSheet(false)} style={{ border: `1px solid ${SPROUT.line}`, cursor: 'pointer', fontFamily: 'inherit', background: SPROUT.paper, color: SPROUT.ink, fontSize: 15.5, fontWeight: 900, borderRadius: 14, padding: '14px' }}>Stay</button>
          </div>
        </SettingsSheet>
      )}

      {/* ── Email management sheet ── */}
      {emailSheet && (
        <SettingsSheet onClose={() => setEmailSheet(false)} title="Your email" sub="Used to save your garden and send your daily reminder.">
          <div style={{ background: SPROUT.bg, border: `1px solid ${SPROUT.line}`, borderRadius: 13, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 12px' }}>
            <span style={{ fontSize: 18 }}>✉️</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 900 }}>alex@email.com</div>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: SPROUT.greenDark }}>Verified ✓</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <button onClick={() => setEmailSheet(false)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: SPROUT.green, color: '#fff', fontSize: 15, fontWeight: 900, borderRadius: 14, padding: '14px', boxShadow: `0 3px 0 ${SPROUT.greenShadow}` }}>Change email</button>
            <button onClick={() => setEmailSheet(false)} style={{ border: `1px solid ${SPROUT.line}`, cursor: 'pointer', fontFamily: 'inherit', background: SPROUT.paper, color: SPROUT.ink, fontSize: 15, fontWeight: 900, borderRadius: 14, padding: '13px' }}>Cancel</button>
          </div>
        </SettingsSheet>
      )}

      {/* ── Login methods sheet ── */}
      {loginSheet && (
        <SettingsSheet onClose={() => setLoginSheet(false)} title="Login methods" sub="How you sign in to Sprout. Keep at least one connected.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, margin: '4px 0 12px' }}>
            <div style={{ background: SPROUT.bg, border: `1px solid ${SPROUT.line}`, borderRadius: 13, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 17 }}>🔵</span>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14.5, fontWeight: 900 }}>Google</div><div style={{ fontSize: 11.5, fontWeight: 800, color: SPROUT.greenDark }}>Connected ✓</div></div>
            </div>
            <div style={{ background: SPROUT.bg, border: `1px solid ${SPROUT.line}`, borderRadius: 13, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, opacity: 0.7 }}>
              <span style={{ fontSize: 17 }}></span>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14.5, fontWeight: 900 }}>Apple</div><div style={{ fontSize: 11.5, fontWeight: 800, color: SPROUT.mute }}>Not connected</div></div>
              <span style={{ fontSize: 12.5, fontWeight: 900, color: SPROUT.greenDark }}>Add</span>
            </div>
          </div>
          <button onClick={() => setLoginSheet(false)} style={{ width: '100%', border: `1px solid ${SPROUT.line}`, cursor: 'pointer', fontFamily: 'inherit', background: SPROUT.paper, color: SPROUT.ink, fontSize: 15, fontWeight: 900, borderRadius: 14, padding: '13px' }}>Done</button>
        </SettingsSheet>
      )}

      {/* ── Delete-account confirm sheet ── */}
      {deleteSheet && (
        <SettingsSheet onClose={() => setDeleteSheet(false)} title="Delete your account?" sub="This removes your garden, streak, gems and progress for good 🌱 — this can't be undone.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 2 }}>
            <button style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: SPROUT.coral, color: '#fff', fontSize: 15.5, fontWeight: 900, borderRadius: 14, padding: '15px', boxShadow: '0 3px 0 #D9655F' }}>Delete account</button>
            <button onClick={() => setDeleteSheet(false)} style={{ border: `1px solid ${SPROUT.line}`, cursor: 'pointer', fontFamily: 'inherit', background: SPROUT.paper, color: SPROUT.ink, fontSize: 15.5, fontWeight: 900, borderRadius: 14, padding: '14px' }}>Keep my garden</button>
          </div>
        </SettingsSheet>
      )}
    </ScreenScaffold>
    {offlineOpen && <OfflineDownloads onClose={() => setOfflineOpen(false)} />}
    {parentHub && typeof ParentHub === 'function' && <ParentHub onClose={() => setParentHub(false)} childName="Alex"/>}
    </div>
  );
}

// Bottom-sheet shell for settings confirmations + pickers.
function SettingsSheet({ title, sub, children, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(40,32,20,0.34)',
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', background: SPROUT.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '10px 18px 22px', boxShadow: '0 -8px 28px rgba(0,0,0,0.16)',
      }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: SPROUT.line, margin: '0 auto 16px' }}/>
        <div style={{ fontSize: 19, fontWeight: 900, color: SPROUT.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13.5, fontWeight: 700, color: SPROUT.mute, lineHeight: 1.45, marginTop: 6, marginBottom: 16 }}>{sub}</div>}
        {children}
      </div>
    </div>
  );
}

// ── The app shell ───────────────────────────────────────────────
function SproutApp({ tweaks = {}, homeVariant = 'a', initialOnboarded = false }) {
  const [tab, setTab] = React.useState('home');
  const [lesson, setLesson] = React.useState(null);
  const [streakOpen, setStreakOpen] = React.useState(false);
  const [waterOpen, setWaterOpen] = React.useState(false);
  const [gemsOpen, setGemsOpen] = React.useState(false);
  const [milestone, setMilestone] = React.useState(null); // day number when a milestone fires
  const [tale, setTale] = React.useState(null); // tale id when a Garden Tale is open
  const [taleLoading, setTaleLoading] = React.useState(false); // brief on-brand loader before a tale
  const [prime, setPrime] = React.useState(false); // notification priming after first lesson
  const [primeSeen, setPrimeSeen] = React.useState(() => {
    try { return localStorage.getItem('sprout-notif-primed-v1') === '1'; } catch (e) { return false; }
  });
  // "Save your garden" account gate — deferred until AFTER the first bloom (try-before-signup).
  const [saveGate, setSaveGate] = React.useState(false);
  const [saveGateSeen, setSaveGateSeen] = React.useState(() => {
    try { return localStorage.getItem('sprout-savegate-v1') === '1'; } catch (e) { return false; }
  });
  const [golden, setGolden] = React.useState(null); // { title, phase: 'gate'|'result', outcome }
  const [onboarded, setOnboarded] = React.useState(() => {
    if (initialOnboarded) return true; // Play-mode preview boots straight to the home/loop
    try { return localStorage.getItem('sprout-onboarded-v1') === '1'; } catch (e) { return false; }
  });
  // one-time coach-mark teaching that the HUD stats are tappable
  // signature sprouting splash on cold start (skipped in Play-mode preview boots)
  const [splash, setSplash] = React.useState(!initialOnboarded ? false : true);

  // Streak milestones fire after a lesson completes (and would also be checked on
  // app open). The `milestoneDemo` tweak forces one so it's reviewable in Play mode.
  const MILESTONE_DAYS = [7, 30, 100, 365];
  const checkMilestone = () => {
    const demo = tweaks.milestoneDemo;
    if (demo === true) { setMilestone(30); return true; } // toggle → showcase the 30-day tier
    if (demo && MILESTONE_DAYS.includes(Number(demo))) { setMilestone(Number(demo)); return true; }
    return false;
  };

  const finishOnboarding = () => {
    try { localStorage.setItem('sprout-onboarded-v1', '1'); } catch (e) {}
    setOnboarded(true);
    setTab('home');
    // Hand straight off into the first lesson — the win + Day 1 streak happen
    // in the first 60s, before the user ever sees a cold home screen.
    setLesson({ title: 'Your first sprout', queue: ['ex-mc', 'ex-fill', 'ex-arrange'], firstLesson: true });
  };
  const restartOnboarding = () => {
    try { localStorage.removeItem('sprout-onboarded-v1'); } catch (e) {}
    setOnboarded(false);
  };

  const startLesson = (meta) => setLesson(meta);
  const exitLesson = () => setLesson(null);
  const finishLesson = () => {
    const wasGolden = lesson && lesson.golden;
    const wasFirst = lesson && lesson.firstLesson;
    setLesson(null);
    if (wasGolden) { setGolden((g) => ({ ...(g || {}), phase: 'result', outcome: 'pass' })); }
    else if (wasFirst && !saveGateSeen) {
      // First bloom is in the bag — now offer to save the garden (account), then prime notifications.
      setSaveGate(true);
    }
    else if (wasFirst && !primeSeen) {
      // Prime notifications right after the first lesson win — before the system dialog.
      setPrime(true);
    }
    else { checkMilestone(); }
    // The active unit's seedling just earned a growth step — flag it so the Garden
    // plays one gentle grow animation on return (cause→effect, no competing celebration).
    try { localStorage.setItem('sprout.justGrew', '1'); } catch (e) {}
    // animate earned rewards on the HUD the moment we land back home
    setTimeout(() => { if (window.emitEarn) window.emitEarn({ gems: 5, water: 1, streak: true }); }, 420);
  };
  const closePrime = () => {
    try { localStorage.setItem('sprout-notif-primed-v1', '1'); } catch (e) {}
    setPrimeSeen(true);
    setPrime(false);
  };
  // Resolve the post-bloom "Save your garden" gate, then continue to notification priming.
  const closeSaveGate = () => {
    try { localStorage.setItem('sprout-savegate-v1', '1'); } catch (e) {}
    setSaveGateSeen(true);
    setSaveGate(false);
    if (!primeSeen) setPrime(true); else checkMilestone();
  };
  const openGolden = (meta) => setGolden({ title: (meta && meta.title) || 'Getting started', phase: 'gate' });
  const startGoldenRun = () => {
    setGolden((g) => ({ ...(g || {}), phase: 'playing' }));
    setLesson({ title: `${golden ? golden.title : 'Unit'} · Golden Bloom`, golden: true, unitTitle: golden ? golden.title : 'Unit', queue: ['ex-mc', 'ex-arrange', 'ex-hear', 'ex-fill'] });
  };
  const openTale = (id) => {
    // Generating a tale is a genuinely longer wait — show the on-brand Pip loader briefly.
    setTaleLoading(true);
    setTimeout(() => { setTaleLoading(false); setTale(id || 'cafe'); }, 1100);
  };
  const openStreak = () => setStreakOpen(true);
  const openWater = () => setWaterOpen(true);
  const openGems = () => setGemsOpen(true);
  const hud = { onStreakTap: openStreak, onWaterTap: openWater, onGemsTap: openGems };
  const waterLevel = tweaks.plus ? 5 : (tweaks.lowWater ? 2 : 5);

  let screen;
  if (!onboarded) {
    screen = <OnboardingFlow onComplete={finishOnboarding} />;
  } else if (lesson) {
    screen = (
      <LessonRunner
        lesson={lesson}
        tweaks={tweaks}
        onExit={exitLesson}
        onFinished={finishLesson}
      />
    );
  } else {
    const nav = { active: tab, onChange: setTab };
    if (tab === 'home') {
      const Home = homeVariant === 'b' ? VariantB : homeVariant === 'c' ? VariantC : VariantA;
      screen = <Home tweaks={tweaks} nav={nav} onStartLesson={startLesson} onOpenTale={openTale} onOpenGolden={openGolden} {...hud} />;
    } else if (tab === 'book') {
      screen = <WordsScreen  tweaks={tweaks} tab={tab} onTab={setTab} onStartLesson={startLesson} onOpenTale={openTale} {...hud} />;
    } else if (tab === 'quests') {
      screen = <QuestsScreen tweaks={tweaks} tab={tab} onTab={setTab} onStartLesson={startLesson} {...hud} />;
    } else if (tab === 'trophy') {
      screen = <LeagueScreen tweaks={tweaks} tab={tab} onTab={setTab} {...hud} />;
    } else if (tab === 'me') {
      screen = <MeScreen     tweaks={tweaks} tab={tab} onTab={setTab} onStartLesson={startLesson} onRestartOnboarding={restartOnboarding} {...hud} />;
    }
  }

  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      {screen}
      {splash && <LaunchSplash dark={!tweaks.lightMode} returning={onboarded} onDone={() => setSplash(false)} />}
      {streakOpen && <StreakCalendar onClose={() => setStreakOpen(false)} tweaks={tweaks} />}
      {waterOpen && <OutOfWaterModal variant={tweaks.calm ? 'calm' : 'standard'} level={waterLevel} onClose={() => setWaterOpen(false)} />}
      {gemsOpen && <GemsShop calm={!!tweaks.calm} onClose={() => setGemsOpen(false)} />}
      {milestone && <StreakMilestone days={milestone} calm={!!tweaks.calm} onContinue={() => setMilestone(null)} onShare={() => {}} />}
      {/* One-time coach-mark: the HUD stats are tappable but not obviously so */}
      {taleLoading && <PipLoading calm={!!tweaks.calm} label="Growing your tale…" />}
      {tale && <GardenTale tale={tale} calm={!!tweaks.calm} onExit={() => setTale(null)} onComplete={() => setTale(null)} />}
      {prime && <NotificationPriming calm={!!tweaks.calm} onAllow={() => { closePrime(); checkMilestone(); }} onLater={() => { closePrime(); checkMilestone(); }} />}
      {saveGate && <AccountGate calm={!!tweaks.calm} onAuthed={closeSaveGate} onLogin={closeSaveGate} onSkip={closeSaveGate} />}
      {golden && golden.phase === 'gate' && <GoldenBloomGate unit={{ title: golden.title }} calm={!!tweaks.calm} onStart={startGoldenRun} onClose={() => setGolden(null)} />}
      {golden && golden.phase === 'result' && <GoldenBloomResult outcome={golden.outcome || 'pass'} unit={{ title: golden.title }} calm={!!tweaks.calm} onContinue={() => setGolden(null)} onRetry={startGoldenRun} />}
    </div>
  );
}

Object.assign(window, { SproutApp, LessonRunner, ScreenScaffold, WordsScreen, MeScreen, SectionTitle });
