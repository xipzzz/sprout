// Achievement "Blooms" — 6 categories × 4 levels.
// Seedling → Sprout → Bloom → Rare Bloom.
// Lives in the Me tab. Each card shows current level + progress to next.

const BLOOM_LEVELS = [
  { id: 'seedling', name: 'Seedling',   color: '#C8BEAC', shadow: '#A89E8B' },
  { id: 'sprout',   name: 'Sprout',     color: '#6FBF5E', shadow: '#4D9E3F' },
  { id: 'bloom',    name: 'Bloom',      color: '#F5C23D', shadow: '#C99016' },
  { id: 'rare',     name: 'Rare Bloom', color: '#A87ED9', shadow: '#7A53A8' },
];

// Each bloom: id, name, description, thresholds[4], currentValue, units, category, earned[] dates per reached tier
const BLOOM_CATEGORIES = [
  { id: 'streak', name: 'Streak blooms', icon: '🔥' },
  { id: 'skill', name: 'Skill blooms', icon: '🎯' },
  { id: 'social', name: 'Co-op blooms', icon: '🤝' },
  { id: 'explore', name: 'Exploration blooms', icon: '🧭' },
];

const BLOOMS = [
  {
    id: 'streak', name: 'Daystar', desc: 'Consecutive days practiced', category: 'streak',
    thresholds: [3, 7, 30, 100], current: 13, unit: 'days', petalColor: '#F5C23D',
    earned: ['Apr 14', 'Apr 18'],
  },
  {
    id: 'comeback', name: 'Comeback Kid', desc: 'Returned after a break', category: 'streak',
    thresholds: [1, 3, 7, 14], current: 1, unit: 'times', petalColor: '#E48A2B',
    earned: ['Apr 27'],
  },
  {
    id: 'accuracy', name: 'Flawless', desc: 'Lessons completed without mistakes', category: 'skill',
    thresholds: [1, 5, 25, 100], current: 7, unit: 'perfect', petalColor: '#6FBF5E',
    earned: ['Apr 15', 'Apr 21'],
  },
  {
    id: 'listening', name: 'Open Ear', desc: 'Listening exercises completed', category: 'skill',
    thresholds: [10, 50, 200, 1000], current: 64, unit: '', petalColor: '#5BA8C8',
    earned: ['Apr 16', 'Apr 24'],
  },
  {
    id: 'vocab', name: 'Wordsmith', desc: 'New words learned', category: 'skill',
    thresholds: [25, 100, 500, 2000], current: 128, unit: 'words', petalColor: '#A87ED9',
    earned: ['Apr 19', 'Apr 28'],
  },
  {
    id: 'coop', name: 'Good Company', desc: 'Co-op quests finished with a friend', category: 'social',
    thresholds: [1, 5, 15, 50], current: 2, unit: '', petalColor: '#E48A7C',
    earned: ['Apr 26'],
  },
  {
    id: 'cheer', name: 'Kind Gardener', desc: 'Cheers sent to friends', category: 'social',
    thresholds: [5, 25, 100, 500], current: 11, unit: '', petalColor: '#7DC9A8',
    earned: ['Apr 23'],
  },
  {
    id: 'variety', name: 'Whole Garden', desc: 'All exercise types in one day', category: 'explore',
    thresholds: [1, 5, 25, 100], current: 3, unit: 'days', petalColor: '#C9B8E3',
    earned: ['Apr 20'],
  },
  {
    id: 'tales', name: 'Storyteller', desc: 'Garden Tales completed', category: 'explore',
    thresholds: [1, 5, 15, 40], current: 4, unit: '', petalColor: '#F5B94A',
    earned: ['Apr 22'],
  },
];

function bloomLevelFor(bloom) {
  let level = 0;
  for (let i = 0; i < bloom.thresholds.length; i++) {
    if (bloom.current >= bloom.thresholds[i]) level = i + 1;
  }
  return level; // 0..4
}

// SVG bloom — a stylized flower whose petals "fill in" by level
function BloomFlower({ level, color, size = 64 }) {
  // level 0 = seed in dirt; 1 = sprout; 2 = bud; 3 = bloom; 4 = rare bloom (extra petals/glow)
  const s = size;
  const cx = s / 2;
  const cy = s / 2 + 4;

  if (level === 0) {
    return (
      <svg width={s} height={s} viewBox="0 0 64 64">
        <ellipse cx="32" cy="50" rx="22" ry="6" fill="#7A5832" opacity="0.8"/>
        <ellipse cx="32" cy="46" rx="3" ry="4" fill="#3F2A0F"/>
      </svg>
    );
  }
  if (level === 1) {
    return (
      <svg width={s} height={s} viewBox="0 0 64 64">
        <ellipse cx="32" cy="54" rx="22" ry="5" fill="#7A5832" opacity="0.8"/>
        <line x1="32" y1="54" x2="32" y2="36" stroke="#4D9E3F" strokeWidth="2.5" strokeLinecap="round"/>
        <ellipse cx="26" cy="38" rx="6" ry="3.5" fill="#8AD577" transform="rotate(-30 26 38)"/>
        <ellipse cx="38" cy="34" rx="6" ry="3.5" fill="#8AD577" transform="rotate(30 38 34)"/>
      </svg>
    );
  }
  if (level === 2) {
    return (
      <svg width={s} height={s} viewBox="0 0 64 64">
        <ellipse cx="32" cy="58" rx="22" ry="4" fill="#7A5832" opacity="0.6"/>
        <line x1="32" y1="58" x2="32" y2="32" stroke="#4D9E3F" strokeWidth="2.5" strokeLinecap="round"/>
        <ellipse cx="24" cy="44" rx="6" ry="3" fill="#8AD577" transform="rotate(-30 24 44)"/>
        <ellipse cx="40" cy="44" rx="6" ry="3" fill="#8AD577" transform="rotate(30 40 44)"/>
        {/* closed bud */}
        <ellipse cx="32" cy="24" rx="7" ry="10" fill={color}/>
        <ellipse cx="29" cy="22" rx="2" ry="6" fill="#fff" opacity="0.3"/>
      </svg>
    );
  }
  // level 3 or 4 — open bloom
  const petalCount = level === 4 ? 8 : 6;
  return (
    <svg width={s} height={s} viewBox="0 0 64 64">
      {level === 4 && (
        <circle cx="32" cy="26" r="22" fill={color} opacity="0.18"/>
      )}
      <ellipse cx="32" cy="58" rx="22" ry="4" fill="#7A5832" opacity="0.6"/>
      <line x1="32" y1="58" x2="32" y2="32" stroke="#4D9E3F" strokeWidth="2.5" strokeLinecap="round"/>
      <ellipse cx="24" cy="46" rx="6" ry="3" fill="#8AD577" transform="rotate(-30 24 46)"/>
      <ellipse cx="40" cy="46" rx="6" ry="3" fill="#8AD577" transform="rotate(30 40 46)"/>
      {/* petals */}
      {Array.from({length: petalCount}).map((_, i) => {
        const a = (i * 360) / petalCount;
        return (
          <ellipse key={i} cx="32" cy="14" rx="5" ry="9" fill={color} transform={`rotate(${a} 32 26)`}/>
        );
      })}
      {/* center */}
      <circle cx="32" cy="26" r="5" fill="#FFE6A6"/>
      <circle cx="32" cy="26" r="2.5" fill="#C99016"/>
      {/* rare sparkles */}
      {level === 4 && (
        <g>
          <circle cx="14" cy="18" r="1.5" fill="#fff"/>
          <circle cx="50" cy="14" r="2" fill="#fff"/>
          <circle cx="52" cy="36" r="1.2" fill="#fff"/>
        </g>
      )}
    </svg>
  );
}

function BloomCard({ bloom }) {
  const level = bloomLevelFor(bloom);
  const levelMeta = BLOOM_LEVELS[Math.max(0, level - 1)] || BLOOM_LEVELS[0];
  const isMaxed = level >= 4;
  const nextThreshold = !isMaxed ? bloom.thresholds[level] : bloom.thresholds[3];
  const prevThreshold = level > 0 ? bloom.thresholds[level - 1] : 0;
  const pct = isMaxed ? 1 : Math.max(0, Math.min(1, (bloom.current - prevThreshold) / (nextThreshold - prevThreshold)));
  // date the CURRENT (highest reached) tier was grown — a little keepsake
  const lastEarned = bloom.earned && bloom.earned.length ? bloom.earned[Math.min(level, bloom.earned.length) - 1] : null;
  const locked = level === 0;

  return (
    <div style={{
      background: SPROUT.paper, borderRadius: 16,
      border: `1px solid ${SPROUT.line}`,
      boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
      overflow: 'hidden',
      opacity: locked ? 0.82 : 1,
    }}>
      {/* header tinted by level */}
      <div style={{
        background: level === 0 ? '#F0E8D4' : `${bloom.petalColor}22`,
        padding: '10px 12px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: `1px solid ${SPROUT.line}`,
      }}>
        <div style={{ filter: locked ? 'grayscale(0.8) brightness(1.15)' : 'none', opacity: locked ? 0.5 : 1 }}>
          <BloomFlower level={level} color={bloom.petalColor} size={52}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.1 }}>{bloom.name}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: SPROUT.mute, marginTop: 2, lineHeight: 1.3 }}>{bloom.desc}</div>
        </div>
        {/* level chip */}
        <div style={{
          padding: '4px 8px', borderRadius: 8,
          background: levelMeta.color, color: '#fff',
          fontSize: 9, fontWeight: 900, letterSpacing: 0.6, whiteSpace: 'nowrap',
          boxShadow: `0 2px 0 ${levelMeta.shadow}`,
          flexShrink: 0,
        }}>LVL {level}</div>
      </div>
      {/* progress */}
      <div style={{ padding: '10px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.6 }}>
            {isMaxed ? 'Max level reached' : `${BLOOM_LEVELS[level].name}`}
          </div>
          <div style={{ fontSize: 12, fontWeight: 900, color: SPROUT.ink, fontVariantNumeric: 'tabular-nums' }}>
            {bloom.current} / {nextThreshold}{bloom.unit ? ' ' + bloom.unit : ''}
          </div>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: SPROUT.cream, overflow: 'hidden' }}>
          <div style={{
            width: `${pct * 100}%`, height: '100%',
            background: bloom.petalColor,
            borderRadius: 4,
            boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.12)',
            transition: 'width 320ms ease',
          }}/>
        </div>
        {/* tier dots */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          {bloom.thresholds.map((t, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: 4,
              background: i < level ? bloom.petalColor : SPROUT.cream2,
              border: i === level ? `1.5px solid ${bloom.petalColor}` : 'none',
            }}/>
          ))}
        </div>
        {/* keepsake: when the current tier was grown, or the unlock hint if still a seed */}
        <div style={{ marginTop: 9, paddingTop: 8, borderTop: `1px solid ${SPROUT.line}`, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800 }}>
          {level > 0 ? (
            <React.Fragment>
              <Icon.Check size={12} color={SPROUT.greenDark}/>
              <span style={{ color: SPROUT.greenDark }}>{levelMeta.name} grown {lastEarned || '—'}</span>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <span style={{ opacity: 0.6 }}>🌰</span>
              <span style={{ color: SPROUT.mute }}>Grow {bloom.thresholds[0]}{bloom.unit ? ' ' + bloom.unit : ''} to plant this</span>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
}

// Full grid — used in MeScreen
function BloomsGrid({ blooms = BLOOMS }) {
  // Tally totals for the header
  const total = blooms.length;
  const totalLevels = blooms.reduce((s, b) => s + bloomLevelFor(b), 0);
  const maxLevels = total * 4;

  return (
    <div>
      {/* summary row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px', borderRadius: 16, marginBottom: 12,
        background: SPROUT.paper, border: `1px solid ${SPROUT.line}`,
        boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, background: '#F6ECD3',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <BloomFlower level={3} color={SPROUT.sun} size={44}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.mute, letterSpacing: 0.6 }}>YOUR GARDEN</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.1 }}>
            {totalLevels} of {maxLevels} bloom levels
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: SPROUT.mute, marginTop: 2 }}>
            {total} blooms · {blooms.filter(b => bloomLevelFor(b) >= 4).length} rare
          </div>
        </div>
      </div>

      {/* grid grouped into garden-native categories */}
      {BLOOM_CATEGORIES.map((cat) => {
        const items = blooms.filter((b) => b.category === cat.id);
        if (!items.length) return null;
        const grown = items.filter((b) => bloomLevelFor(b) > 0).length;
        return (
          <div key={cat.id} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 2px 8px' }}>
              <span style={{ fontSize: 15 }}>{cat.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 900, color: SPROUT.ink }}>{cat.name}</span>
              <span style={{ fontSize: 11, fontWeight: 900, color: SPROUT.greenDark, background: '#E3F5DB', padding: '2px 8px', borderRadius: 999, marginLeft: 'auto' }}>{grown}/{items.length}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
              {items.map((b) => <BloomCard key={b.id} bloom={b}/>)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { BloomsGrid, BloomCard, BloomFlower, BLOOMS, BLOOM_LEVELS, BLOOM_CATEGORIES, bloomLevelFor });
