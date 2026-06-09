// ─────────────────────────────────────────────────────────────
// VARIATION B — "Sprout Garden"
// Lessons as plants in a garden. Each row is a unit (garden bed).
// Visual story: seeds → sprouts → full plants. Mascot tends the garden.
// ─────────────────────────────────────────────────────────────

// Streak → centerpiece plant tier (reuses MilestonePlant art).
// Mirrors the milestone ladder: sprout 7 · bush 30 · tree 100 · oak 365.
function streakTier(days) {
  if (days >= 365) return { tier: 'oak',    next: null, nextLabel: null,                grown: 'a mighty oak' };
  if (days >= 100) return { tier: 'tree',   next: 365,  nextLabel: 'a mighty oak',      grown: 'a strong tree' };
  if (days >= 30)  return { tier: 'tree',   next: 100,  nextLabel: 'a strong tree',     grown: 'a flowering bush' };
  if (days >= 7)   return { tier: 'bush',   next: 30,   nextLabel: 'a flowering bush',  grown: 'a sprout' };
  return            { tier: 'sprout', next: 7,    nextLabel: 'a sprout',          grown: 'a seedling' };
}

// Device-clock → garden sky. sunrise / midday / sunset / night.
function gardenSky(hour) {
  if (hour >= 5 && hour < 9)   return { id: 'sunrise', sky: 'linear-gradient(180deg, #FBD9A8 0%, #F7C99B 45%, #D9E6B5 100%)', sun: '#F7B05B', sunGlow: 'rgba(247,176,91,0.28)', sunTop: 22, ground1: '#CFA877', ground2: '#A8814F', hill: '#A8C77F', star: false, label: 'Good morning' };
  if (hour >= 9 && hour < 17)  return { id: 'midday',  sky: 'linear-gradient(180deg, #D8ECFA 0%, #CFE8BE 100%)', sun: '#F5C23D', sunGlow: 'rgba(245,185,74,0.22)', sunTop: 16, ground1: '#C89F6F', ground2: '#A17B4F', hill: '#A0C385', star: false, label: 'Good afternoon' };
  if (hour >= 17 && hour < 20) return { id: 'sunset',  sky: 'linear-gradient(180deg, #F6C6A0 0%, #E9A98F 40%, #C8C58F 100%)', sun: '#F2884E', sunGlow: 'rgba(242,136,78,0.30)', sunTop: 30, ground1: '#B68B5E', ground2: '#8E6B42', hill: '#9CB079', star: false, label: 'Good evening' };
  return { id: 'night', sky: 'linear-gradient(180deg, #2E3A66 0%, #45507F 55%, #6A6E8A 100%)', sun: '#EDEFC0', sunGlow: 'rgba(237,239,192,0.22)', sunTop: 18, ground1: '#5E5742', ground2: '#423D30', hill: '#3C4569', star: true, label: 'Good night' };
}

// Each unit grows one signature "seedling" bloom (mirrors the collection's topic shelf).
const UNIT_SEEDLINGS = {
  1: { name: 'Greeting Daisy', color: SPROUT.green,  grewVia: 'finishing Greetings & basics' },
  2: { name: 'Café Bloom',     color: SPROUT.sun,    grewVia: 'finishing Food & drink' },
  3: { name: 'Town Tulip',     color: SPROUT.coral,  grewVia: 'finishing Around town' },
};

// The unit you're actively growing — first with an 'active' lesson, else first unfinished.
function activeUnitInfo() {
  const u = UNITS.find(un => un.lessons.some(l => l.status === 'active'))
         || UNITS.find(un => un.lessons.some(l => l.status !== 'done'))
         || UNITS[UNITS.length - 1];
  const total = u.lessons.length;
  const doneCount = u.lessons.filter(l => l.status === 'done').length;
  const active = u.lessons.find(l => l.status === 'active');
  const pct = Math.min(1, (doneCount + (active ? (active.progress || 0) : 0)) / total);
  const remain = total - doneCount;
  return { unit: u.unit, title: u.title, desc: u.desc, total, doneCount, remain, pct, seed: UNIT_SEEDLINGS[u.unit] || UNIT_SEEDLINGS[1] };
}

// Growth fraction → BloomFlower stage (1 sprout · 2 bud · 3 bloom · 4 full).
function seedlingLevel(pct) {
  if (pct >= 1) return 4;
  if (pct >= 0.6) return 3;
  if (pct >= 0.3) return 2;
  return 1;
}
const STAGE_WORD = ['just planted', 'sprouting', 'budding', 'blooming', 'in full bloom'];

// Provenance sheet for the current seedling — what it is + how it grew / grows.
function SeedlingSheet({ info, level, onClose }) {
  const done = info.pct >= 1;
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', background: 'rgba(20,30,40,0.45)', fontFamily: '"Nunito", system-ui' }}>
      <style>{`@keyframes sdFade{from{opacity:0}to{opacity:1}}@keyframes sdSlide{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: SPROUT.bg, borderRadius: '24px 24px 0 0', padding: '18px 18px 26px', animation: 'sdSlide 300ms cubic-bezier(.2,.8,.2,1) both', boxShadow: '0 -10px 30px rgba(0,0,0,0.15)' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: SPROUT.line, margin: '0 auto 14px' }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 78, height: 78, borderRadius: 18, background: '#EAF6E2', border: `1px solid ${SPROUT.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BloomFlower level={level} color={info.seed.color} size={58}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 900, color: SPROUT.greenDark, background: '#E3F5DB', padding: '3px 9px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: 0.5 }}>{done ? 'Grown' : 'Growing now'}</div>
            <div style={{ fontSize: 19, fontWeight: 900, color: SPROUT.ink, marginTop: 6, lineHeight: 1.1 }}>{info.seed.name}</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: SPROUT.mute, marginTop: 2 }}>Unit {info.unit} · {info.title} — {STAGE_WORD[level]}</div>
          </div>
        </div>
        <div style={{ marginTop: 14, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14, padding: '12px 13px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}` }}>
          <div style={{ fontSize: 10.5, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>{done ? 'How you grew it' : 'How it grows'}</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: SPROUT.ink, lineHeight: 1.4 }}>
            {done
              ? `Grew when you finished all ${info.total} lessons in ${info.title}. It now stays in your garden as a keepsake of the unit.`
              : `Every lesson in ${info.title} waters it one stage. ${info.remain} more ${info.remain === 1 ? 'lesson' : 'lessons'} brings it into full bloom.`}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
            {[1, 2, 3, 4].map(s => (
              <div key={s} style={{ flex: 1, height: 6, borderRadius: 3, background: s <= level ? info.seed.color : SPROUT.cream, boxShadow: s <= level ? 'inset 0 -1px 0 rgba(0,0,0,0.12)' : 'none' }}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// One-time, dismissible explainer — states the effort→growth link once, then never again.
function GardenMetaphorNote() {
  const [show, setShow] = React.useState(() => { try { return localStorage.getItem('sprout.gardenMetaphorSeen') !== '1'; } catch (e) { return true; } });
  if (!show) return null;
  const dismiss = () => { try { localStorage.setItem('sprout.gardenMetaphorSeen', '1'); } catch (e) {} setShow(false); };
  return (
    <div style={{ margin: '0 16px 16px', display: 'flex', alignItems: 'center', gap: 10, background: '#EFF7E8', border: '1px solid #D7E9C8', borderRadius: 14, padding: '11px 13px' }}>
      <span style={{ fontSize: 17, flexShrink: 0 }}>🌱</span>
      <div style={{ flex: 1, fontSize: 12.5, fontWeight: 800, color: SPROUT.greenDark, lineHeight: 1.35 }}>Every lesson waters your garden — finish one and watch your seedling grow.</div>
      <button onClick={dismiss} aria-label="Got it" style={{ flexShrink: 0, border: 'none', background: 'rgba(77,158,63,0.12)', color: SPROUT.greenDark, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11.5, fontWeight: 900, borderRadius: 999, padding: '6px 11px' }}>Got it</button>
    </div>
  );
}

function VariantB({ tweaks, onStartLesson, nav, onStreakTap, onWaterTap, onGemsTap }) {
  const { calm, firstTime } = tweaks;
  const [localTab, setLocalTab] = React.useState('home');
  const activeTab = nav ? nav.active : localTab;
  const onTab = nav ? nav.onChange : setLocalTab;
  const launch = onStartLesson || (() => {});

  const streak = calm ? 34 : 12;
  const sky = gardenSky(new Date().getHours());

  // ── CURRENT SEEDLING — the living anchor tied to your active unit ──
  const seedInfo = activeUnitInfo();
  const seedLevel = seedlingLevel(seedInfo.pct);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  // Returning from a finished lesson? Play ONE gentle grow step (cause→effect), then clear.
  const [justGrew, setJustGrew] = React.useState(false);
  React.useEffect(() => {
    let flag = false;
    try { flag = localStorage.getItem('sprout.justGrew') === '1'; } catch (e) {}
    if (flag) {
      setJustGrew(true);
      try { localStorage.removeItem('sprout.justGrew'); } catch (e) {}
      const t = setTimeout(() => setJustGrew(false), 2200);
      return () => clearTimeout(t);
    }
  }, []);

  // ── FIRST-TIME / EMPTY GARDEN ────────────────────────────────
  // A brand-new user has 0 plants. Instead of a bare grid, Pip stands
  // beside an empty bed and invites the first lesson (Discord/Twitch
  // mascot empty-state pattern) — emptiness becomes a clear first step.
  if (firstTime) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: SPROUT.bg, color: SPROUT.ink, fontFamily: '"Nunito", system-ui' }}>
        <TopBar tweaks={tweaks} onStreakTap={onStreakTap} onWaterTap={onWaterTap} onGemsTap={onGemsTap}/>
        <div style={{ flex: 1, overflow: 'auto', padding: '0 0 24px' }}>
          {/* Hero — same living sky, but the bed is bare soil waiting for a first seed */}
          <div style={{
            margin: '14px 16px 18px', borderRadius: 24, overflow: 'hidden',
            background: sky.sky, border: `1px solid ${sky.id === 'night' ? '#2A335C' : '#A0C385'}`,
            position: 'relative', height: 196,
          }}>
            {sky.star && [[40,28],[110,18],[150,40],[250,24],[300,16],[340,38]].map(([sx, sy], i) => (
              <span key={i} style={{ position: 'absolute', left: sx, top: sy, width: 2, height: 2, borderRadius: '50%', background: SPROUT.paper, opacity: 0.85 }}/>
            ))}
            <div style={{ position: 'absolute', top: sky.sunTop, right: 26, width: 44, height: 44, borderRadius: '50%', background: sky.sun, boxShadow: `0 0 0 8px ${sky.sunGlow}` }}/>
            <svg style={{ position: 'absolute', bottom: 50, left: 0, width: '100%', height: 64 }} viewBox="0 0 400 64" preserveAspectRatio="none">
              <path d="M0 44 Q80 12 160 32 T320 27 T400 37 L400 64 L0 64z" fill={sky.hill} opacity="0.6"/>
            </svg>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, background: `linear-gradient(180deg, ${sky.ground1} 0%, ${sky.ground2} 100%)` }}/>
            {/* a single empty plot marker in the soil */}
            <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 14, alignItems: 'flex-end' }}>
              {[0,1,2].map((i) => (
                <div key={i} style={{ width: 26, height: 8, borderRadius: '50%', background: 'rgba(0,0,0,0.18)' }}/>
              ))}
            </div>
            {/* Pip, gently waving by the empty bed */}
            <div style={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)' }}>
              <Pip size={92} mood="cheer" wave/>
            </div>
            {/* 0-streak framing — never a cold "0" */}
            <div style={{
              position: 'absolute', top: 14, left: 14, background: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: 14,
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <Icon.Flame size={18} color="#F5833E"/>
              <div style={{ fontSize: 12.5, fontWeight: 900, color: SPROUT.ink }}>{calm ? 'Plant your first seed today' : 'Start your streak today'}</div>
            </div>
          </div>

          {/* Invitation card — one clear first step */}
          <div style={{ margin: '0 16px', background: SPROUT.paper, borderRadius: 20, border: `1px solid ${SPROUT.line}`, boxShadow: `0 3px 0 ${SPROUT.cardShadow}`, padding: '22px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: SPROUT.ink, letterSpacing: -0.3 }}>Your garden's waiting 🌱</div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: SPROUT.mute, marginTop: 8, lineHeight: 1.45, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>
              Finish your first lesson to grow your very first plant. Every lesson you complete plants something new here.
            </div>
            <button onClick={() => launch({ title: 'Your first lesson', queue: lessonQueueFor({ id: 'u1l1', label: 'Your first lesson' }) })} style={{
              marginTop: 18, width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: SPROUT.green, color: '#fff', fontSize: 16, fontWeight: 900,
              borderRadius: 15, padding: '15px 0', boxShadow: `0 4px 0 ${SPROUT.greenShadow}`,
            }}>Start growing</button>
            <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute, marginTop: 12 }}>Takes about 3 minutes · no rush 🌿</div>
          </div>

          {/* tiny preview of what's to come — three faded future beds */}
          <div style={{ margin: '18px 16px 0', display: 'flex', gap: 10, opacity: 0.55 }}>
            {['Getting started','Greetings','Café'].map((label, i) => (
              <div key={label} style={{ flex: 1, background: SPROUT.paper, borderRadius: 14, border: `1px dashed ${SPROUT.line}`, padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ width: 18, height: 24, margin: '0 auto 6px', background: '#6B4F2E', borderRadius: '50% 50% 40% 40%', opacity: 0.5 }}/>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: SPROUT.mute }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 800, color: SPROUT.mute, marginTop: 10 }}>Unlocks as you grow</div>

          <div style={{ height: 16 }}/>
        </div>
        <BottomNav active={activeTab} onChange={onTab}/>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: SPROUT.bg, color: SPROUT.ink, fontFamily: '"Nunito", system-ui' }}>
      <TopBar tweaks={tweaks} onStreakTap={onStreakTap} onWaterTap={onWaterTap} onGemsTap={onGemsTap}/>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 0 24px' }}>
        {/* Hero: living garden — centerpiece plant grows with the streak, sky tracks the time of day */}
        <div style={{
          margin: '14px 16px 20px', borderRadius: 24, overflow: 'hidden',
          background: sky.sky,
          border: `1px solid ${sky.id === 'night' ? '#2A335C' : '#A0C385'}`,
          position: 'relative', height: 196,
          transition: 'background .6s ease',
        }}>
          {/* stars at night */}
          {sky.star && [[40,28],[110,18],[150,40],[250,24],[300,16],[340,38],[210,50]].map(([sx, sy], i) => (
            <span key={i} style={{ position: 'absolute', left: sx, top: sy, width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2, borderRadius: '50%', background: SPROUT.paper, opacity: 0.85 }}/>
          ))}
          {/* sun / moon */}
          <div style={{ position: 'absolute', top: sky.sunTop, right: 26, width: 44, height: 44, borderRadius: '50%', background: sky.sun, boxShadow: `0 0 0 8px ${sky.sunGlow}, 0 0 0 16px ${sky.sunGlow.replace(/[\d.]+\)$/,'0.10)')}`, transition: 'background .6s ease' }}/>
          {/* hills */}
          <svg style={{ position: 'absolute', bottom: 50, left: 0, width: '100%', height: 64 }} viewBox="0 0 400 64" preserveAspectRatio="none">
            <path d="M0 44 Q80 12 160 32 T320 27 T400 37 L400 64 L0 64z" fill={sky.hill} opacity="0.6"/>
          </svg>
          {/* ground */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, background: `linear-gradient(180deg, ${sky.ground1} 0%, ${sky.ground2} 100%)`, transition: 'background .6s ease' }}/>

          {/* CURRENT SEEDLING — living anchor; grows with your active unit. Tap → provenance. */}
          <style>{`@keyframes sproutGrow{0%{transform:scale(.84);}55%{transform:scale(1.08);}100%{transform:scale(1);}}@keyframes sproutGlow{0%,100%{opacity:0;}40%{opacity:.55;}}`}</style>
          <button onClick={() => setSheetOpen(true)} aria-label={`${seedInfo.seed.name} — ${STAGE_WORD[seedLevel]}. Tap to see how it grows.`} style={{
            position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
            border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            filter: sky.id === 'night' ? 'brightness(0.92)' : 'none',
          }}>
            <div style={{ position: 'relative', width: 132, height: 132, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              {justGrew && <div style={{ position: 'absolute', inset: '8% 0 6%', borderRadius: '50%', background: `radial-gradient(circle, ${seedInfo.seed.color}55 0%, transparent 68%)`, animation: 'sproutGlow 2000ms ease both', pointerEvents: 'none' }}/>}
              <div style={{ animation: justGrew ? 'sproutGrow 1100ms cubic-bezier(.34,1.4,.5,1) both' : 'none', transformOrigin: 'bottom center' }}>
                <BloomFlower level={seedLevel} color={seedInfo.seed.color} size={132}/>
              </div>
            </div>
            <div style={{
              marginTop: -4, fontSize: 11, fontWeight: 900, color: '#fff',
              background: 'rgba(60,80,55,0.55)', backdropFilter: 'blur(2px)',
              padding: '3px 11px', borderRadius: 999, letterSpacing: 0.2,
            }}>{justGrew ? 'grew a little 🌱' : seedInfo.seed.name}</div>
          </button>

          {/* mascot, smaller, to the side */}
          <div style={{ position: 'absolute', bottom: 20, left: 18 }}>
            <Pip size={64} mood="cheer" wave/>
          </div>

          {/* streak badge */}
          <button onClick={onStreakTap} style={{
            position: 'absolute', top: 14, left: 14, background: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: 14,
            display: 'flex', alignItems: 'center', gap: 7, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <Icon.Flame size={20} color="#F5833E"/>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: SPROUT.mute, textTransform: 'uppercase' }}>{calm ? 'Days grown' : 'Day streak'}</div>
              <div style={{ fontSize: 14, fontWeight: 900 }}>{streak} days</div>
            </div>
          </button>

          {/* growth caption — ties the seedling to real effort (cause→effect) */}
          <div style={{
            position: 'absolute', bottom: 8, right: 14, maxWidth: 168, textAlign: 'right',
            fontSize: 11.5, fontWeight: 800, lineHeight: 1.25,
            color: sky.id === 'night' ? '#EAEAF2' : '#5C4A2E',
            textShadow: sky.id === 'night' ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 2px rgba(255,255,255,0.5)',
          }}>
            {seedInfo.remain > 0
              ? `${seedInfo.remain} more ${seedInfo.remain === 1 ? 'lesson' : 'lessons'} to full bloom`
              : 'This unit is in full bloom 🌸'}
          </div>
        </div>

        {/* States the effort→growth metaphor once, then never again */}
        <GardenMetaphorNote/>

        {/* Legend — explains the garden's visual states for first-time users */}
        <div style={{
          margin: '0 16px 18px', padding: '10px 12px',
          background: SPROUT.paper, borderRadius: 14, border: `1px solid ${SPROUT.line}`,
          display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 10, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.6 }}>Key</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 20, height: 20, borderRadius: 6, background: '#FFD466', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 2px ${SPROUT.sun}` }}>
              <svg width="11" height="13" viewBox="0 0 20 24"><path d="M10 24 L10 12" stroke="#4D9E3F" strokeWidth="2" strokeLinecap="round"/><ellipse cx="5" cy="13" rx="3.5" ry="2" fill="#8AD577" transform="rotate(-30 5 13)"/><ellipse cx="15" cy="13" rx="3.5" ry="2" fill="#8AD577" transform="rotate(30 15 13)"/></svg>
            </span>
            <span style={{ fontSize: 12, fontWeight: 800, color: SPROUT.ink }}>Ready to grow</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(122,88,50,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ width: 8, height: 11, background: '#5C401F', borderRadius: '50% 50% 40% 40%' }}/>
            </span>
            <span style={{ fontSize: 12, fontWeight: 800, color: SPROUT.mute }}>Seed · finish earlier lessons</span>
          </div>
        </div>

        {UNITS.map((u, ui) => (
          <GardenBed key={u.unit} unit={u} onStart={launch}/>
        ))}

        {/* Next-plant spotlight — a near-term collection goal, sitting with the collection it belongs to */}
        <NextPlantSpotlight/>

        {/* Plant collection — silhouette slots + counter + themed shelves */}
        <GardenCollection/>

        <div style={{ height: 16 }}/>
      </div>

      <BottomNav active={activeTab} onChange={onTab}/>
      {sheetOpen && <SeedlingSheet info={seedInfo} level={seedLevel} onClose={() => setSheetOpen(false)}/>}
    </div>
  );
}

function Plant({ x, y, kind }) {
  // kind: done (tall flower), sprout (small leaves), seed (mound)
  return (
    <div style={{ position: 'absolute', left: x, bottom: y }}>
      {kind === 'done' && (
        <svg width="24" height="38" viewBox="0 0 24 38">
          <path d="M12 38 L12 16" stroke="#4D9E3F" strokeWidth="2.5" strokeLinecap="round"/>
          <ellipse cx="6" cy="22" rx="5" ry="3" fill="#6FBF5E" transform="rotate(-25 6 22)"/>
          <ellipse cx="18" cy="22" rx="5" ry="3" fill="#6FBF5E" transform="rotate(25 18 22)"/>
          <circle cx="12" cy="10" r="7" fill="#F47A7A"/>
          <circle cx="12" cy="10" r="2.5" fill="#F5B94A"/>
        </svg>
      )}
      {kind === 'sprout' && (
        <svg width="20" height="22" viewBox="0 0 20 22">
          <path d="M10 22 L10 14" stroke="#4D9E3F" strokeWidth="2" strokeLinecap="round"/>
          <ellipse cx="5" cy="12" rx="4" ry="2.5" fill="#8AD577" transform="rotate(-30 5 12)"/>
          <ellipse cx="15" cy="12" rx="4" ry="2.5" fill="#8AD577" transform="rotate(30 15 12)"/>
        </svg>
      )}
      {kind === 'seed' && (
        <svg width="16" height="8" viewBox="0 0 16 8">
          <ellipse cx="8" cy="6" rx="7" ry="2" fill="#7A5832"/>
        </svg>
      )}
    </div>
  );
}

function GardenBed({ unit, onStart }) {
  return (
    <div style={{ margin: '0 16px 18px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        padding: '0 4px 8px',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: unit.color, textTransform: 'uppercase', letterSpacing: 1 }}>UNIT {unit.unit}</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{unit.title}</div>
        </div>
        <div style={{ fontSize: 12, color: SPROUT.mute, fontWeight: 700 }}>
          {unit.lessons.filter(l => l.status === 'done').length}/{unit.lessons.length}
        </div>
      </div>

      {/* the bed */}
      <div style={{
        borderRadius: 20, overflow: 'hidden',
        background: 'linear-gradient(180deg, #C89F6F 0%, #A17B4F 100%)',
        padding: '14px 12px 12px', position: 'relative',
        boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.15)',
      }}>
        {/* rows of dirt texture */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(180deg, rgba(0,0,0,0.06) 0 2px, transparent 2px 14px)', pointerEvents: 'none' }}/>

        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {unit.lessons.map((l, i) => <GardenTile key={l.id} lesson={l} color={unit.color} shadow={unit.shadow} onStart={onStart}/>)}
        </div>
      </div>
    </div>
  );
}

function GardenTile({ lesson, color, shadow, onStart }) {
  const isLocked = lesson.status === 'locked';
  const isActive = lesson.status === 'active';
  const isDone = lesson.status === 'done';

  const [down, setDown] = React.useState(false);
  const tappable = !isLocked && !!onStart;
  const handleTap = () => { if (tappable) onStart({ title: lesson.label, queue: lessonQueueFor(lesson) }); };

  return (
    <div
      onClick={handleTap}
      onMouseDown={() => tappable && setDown(true)}
      onMouseUp={() => setDown(false)}
      onMouseLeave={() => setDown(false)}
      role={tappable ? 'button' : undefined}
      style={{
        background: isLocked ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.9)',
        borderRadius: 14, padding: 8, minHeight: 112,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative',
        cursor: tappable ? 'pointer' : (isLocked ? 'not-allowed' : 'default'),
        transform: down ? 'translateY(2px)' : 'none',
        transition: 'transform 80ms ease',
        boxShadow: isActive ? `0 0 0 3px ${SPROUT.sun}, 0 4px 0 ${shadow}` : (isLocked ? 'none' : '0 3px 0 rgba(0,0,0,0.1)'),
      }}
    >
      {/* plant visual */}
      <div style={{ height: 56, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        {isDone && (
          <svg width="44" height="56" viewBox="0 0 44 56">
            <path d="M22 56 L22 26" stroke="#4D9E3F" strokeWidth="3" strokeLinecap="round"/>
            <ellipse cx="10" cy="34" rx="7" ry="4" fill="#6FBF5E" transform="rotate(-30 10 34)"/>
            <ellipse cx="34" cy="34" rx="7" ry="4" fill="#6FBF5E" transform="rotate(30 34 34)"/>
            <circle cx="22" cy="18" r="12" fill={lesson.kind === 'chest' ? SPROUT.sun : SPROUT.coral}/>
            <circle cx="22" cy="18" r="4" fill={SPROUT.sun}/>
          </svg>
        )}
        {isActive && (
          <svg width="40" height="48" viewBox="0 0 40 48">
            <path d="M20 48 L20 26" stroke="#4D9E3F" strokeWidth="2.5" strokeLinecap="round"/>
            <ellipse cx="10" cy="28" rx="7" ry="3.5" fill="#8AD577" transform="rotate(-30 10 28)"/>
            <ellipse cx="30" cy="28" rx="7" ry="3.5" fill="#8AD577" transform="rotate(30 30 28)"/>
            <circle cx="20" cy="18" r="6" fill="#FFD466"/>
          </svg>
        )}
        {isLocked && (
          <div style={{ width: 20, height: 28, background: '#6B4F2E', borderRadius: '50% 50% 40% 40%', opacity: 0.8 }}/>
        )}
      </div>
      <div style={{
        fontSize: 11, fontWeight: 800, color: isLocked ? 'rgba(255,255,255,0.7)' : SPROUT.ink,
        textAlign: 'center', lineHeight: 1.2,
      }}>{lesson.label}</div>

      {isActive && (
        <div style={{
          position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
          background: SPROUT.greenDark, color: '#fff',
          fontSize: 11, fontWeight: 900, letterSpacing: 0.6,
          padding: '4px 10px', borderRadius: 999, textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          border: '2px solid #fff',
          boxShadow: '0 3px 0 ' + SPROUT.greenShadow,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <Icon.Leaf size={11} color="#fff"/> Grow
        </div>
      )}
      {/* Goal-gated bloom payoff — concrete "N more to bloom" pulls the learner back to finish (Finch egg-hatch) */}
      {isActive && (() => {
        const need = lesson.bloomIn || 2;
        const total = lesson.bloomGoal || 3;
        const doneCount = Math.max(0, total - need);
        return (
          <div style={{ width: '100%', marginTop: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, fontSize: 9.5, fontWeight: 900, color: SPROUT.greenDark, lineHeight: 1, marginBottom: 4 }}>
              {need} more to bloom
              <span style={{ fontSize: 10 }}>🌸</span>
            </div>
            <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
              {Array.from({ length: total }).map((_, i) => (
                <span key={i} style={{
                  width: 14, height: 5, borderRadius: 3,
                  background: i < doneCount ? SPROUT.green : 'rgba(0,0,0,0.14)',
                }}/>
              ))}
            </div>
          </div>
        );
      })()}
      {isDone && (
        <div style={{
          position: 'absolute', top: -6, right: -6,
          width: 22, height: 22, borderRadius: '50%',
          background: SPROUT.greenDark,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 0 ' + SPROUT.greenShadow,
        }}>
          <Icon.Check size={14} color="#fff"/>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { VariantB });
