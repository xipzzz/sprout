// ─────────────────────────────────────────────────────────────
// Pip & Garden customizer — self-expression. Live-preview Pip on a chosen
// backdrop in a chosen pot, with accessories. Earned-gem economy only (no IAP):
// a Closet (owned) vs Decorate (unlock with gems / earn from milestones) split,
// plus seasonal + milestone-locked looks. Reachable from the Me tab / Garden.
// English-only. Reuses Pip + the Sprout palette.
// ─────────────────────────────────────────────────────────────

// ── Accessory overlays drawn on top of Pip (viewBox matches Pip's 100×100) ──
function PipAccessory({ id }) {
  if (!id || id === 'none') return null;
  if (id === 'scarf') return (
    <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0 }}>
      <path d="M30 76 Q50 86 70 76 L70 82 Q50 92 30 82 Z" fill="#F57C7C"/>
      <path d="M64 79 L70 96 L60 92 L58 80 Z" fill="#E06666"/>
    </svg>
  );
  if (id === 'cap') return (
    <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0 }}>
      <path d="M30 30 Q50 10 70 30 Q50 24 30 30 Z" fill="#2A6FDB"/>
      <path d="M30 30 Q22 31 20 35 Q30 34 34 31 Z" fill="#1F58B0"/>
      <circle cx="50" cy="16" r="3" fill="#fff"/>
    </svg>
  );
  if (id === 'sunhat') return (
    <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0 }}>
      <ellipse cx="50" cy="30" rx="30" ry="7" fill="#F5C23D"/>
      <path d="M38 30 Q40 16 50 15 Q60 16 62 30 Z" fill="#F5C23D"/>
      <path d="M38 28 Q50 31 62 28" stroke="#D59428" strokeWidth="2.5" fill="none"/>
    </svg>
  );
  if (id === 'flower') return (
    <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0 }}>
      {[0,1,2,3,4].map((k) => <ellipse key={k} cx="68" cy="22" rx="4" ry="7" fill="#F57C7C" transform={`rotate(${k*72} 68 22)`}/>)}
      <circle cx="68" cy="22" r="3.5" fill="#F5C23D"/>
    </svg>
  );
  if (id === 'crown') return (
    <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0 }}>
      <path d="M34 26 L38 14 L44 22 L50 11 L56 22 L62 14 L66 26 Z" fill="#F5C23D" stroke="#D59428" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="50" cy="13" r="2" fill="#F57C7C"/>
    </svg>
  );
  return null;
}

// ── Pot styles ──
function Pot({ id = 'terra', size = 90 }) {
  const styleFor = { terra: ['#D98A5B', '#C2764A'], stone: ['#B9B3A6', '#9A9386'], glaze: ['#5BA8C8', '#4890B0'], gold: ['#E6C25A', '#C9A23A'] }[id] || ['#D98A5B', '#C2764A'];
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 100 50" style={{ display: 'block' }}>
      <path d="M14 6 H86 L78 46 Q50 52 22 46 Z" fill={styleFor[0]}/>
      <path d="M14 6 H86 L84 16 Q50 22 16 16 Z" fill={styleFor[1]}/>
      <rect x="10" y="2" width="80" height="8" rx="4" fill={styleFor[1]}/>
    </svg>
  );
}

const BACKDROPS = {
  meadow:    { name: 'Meadow',     grad: 'linear-gradient(180deg, #CDEBF7, #E6F4D8)' },
  greenhouse:{ name: 'Greenhouse', grad: 'linear-gradient(180deg, #E3F0E4, #D2E8D6)' },
  moonlit:   { name: 'Moonlit',    grad: 'linear-gradient(180deg, #2E4B63, #3E6B5A)', dark: true },
  zen:       { name: 'Zen',        grad: 'linear-gradient(180deg, #EDEAE0, #E0DBCB)' },
  sunset:    { name: 'Sunset',     grad: 'linear-gradient(180deg, #F8C98A, #F2A0A0)' },
};

// ── Catalog. owned=in Closet; else cost (gems) or lock (milestone). season optional. ──
const COSMETICS = {
  pip: [
    { id: 'none', name: 'No hat', owned: true },
    { id: 'scarf', name: 'Cosy scarf', owned: true },
    { id: 'cap', name: 'Ball cap', cost: 150 },
    { id: 'sunhat', name: 'Sun hat', cost: 200, season: 'Summer' },
    { id: 'flower', name: 'Flower crown', cost: 250, season: 'Spring' },
    { id: 'crown', name: 'Golden crown', lock: 'Golden Bloom' },
  ],
  pot: [
    { id: 'terra', name: 'Terracotta', owned: true },
    { id: 'stone', name: 'Stoneware', owned: true },
    { id: 'glaze', name: 'Blue glaze', cost: 180 },
    { id: 'gold', name: 'Gilded pot', lock: '100-day streak' },
  ],
  backdrop: [
    { id: 'meadow', name: 'Meadow', owned: true },
    { id: 'greenhouse', name: 'Greenhouse', cost: 400 },
    { id: 'sunset', name: 'Sunset', cost: 300, season: 'Autumn' },
    { id: 'moonlit', name: 'Moonlit', lock: '30-day streak' },
    { id: 'zen', name: 'Zen', cost: 600 },
  ],
};

function Customizer({ tweaks = {}, onBack }) {
  const [tab, setTab] = React.useState('pip');      // pip | pot | backdrop
  const [shelf, setShelf] = React.useState('closet'); // closet | decorate
  const [look, setLook] = React.useState({ pip: 'scarf', pot: 'terra', backdrop: 'meadow' });
  const [owned, setOwned] = React.useState(() => {
    const o = {};
    Object.keys(COSMETICS).forEach((k) => COSMETICS[k].forEach((it) => { if (it.owned) o[k + ':' + it.id] = true; }));
    return o;
  });
  const [gems, setGems] = React.useState(420);

  const items = COSMETICS[tab].filter((it) => {
    const isOwned = owned[tab + ':' + it.id];
    return shelf === 'closet' ? isOwned : !isOwned;
  });
  const bd = BACKDROPS[look.backdrop];

  const onItem = (it) => {
    const key = tab + ':' + it.id;
    if (owned[key]) { setLook((l) => ({ ...l, [tab]: it.id })); return; }
    if (it.lock) return; // milestone-locked
    if (it.cost && gems >= it.cost) { setGems((g) => g - it.cost); setOwned((o) => ({ ...o, [key]: true })); setLook((l) => ({ ...l, [tab]: it.id })); if (typeof haptic === 'function') haptic('success'); }
  };

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: SPROUT.bg, color: SPROUT.ink, fontFamily: '"Nunito", system-ui' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '54px 14px 10px', flexShrink: 0 }}>
        {onBack && (
          <button onClick={onBack} aria-label="Back" style={{ width: 44, height: 44, marginLeft: -8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.ChevL size={24} color={SPROUT.ink}/>
          </button>
        )}
        <div style={{ flex: 1, fontSize: 20, fontWeight: 900 }}>Style your garden</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#E7F1FA', borderRadius: 999, padding: '5px 11px' }}>
          <Icon.Gem size={15} color="#5AB9D9"/>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#2E8FB0', fontVariantNumeric: 'tabular-nums' }}>{gems}</span>
        </div>
      </div>

      {/* live preview */}
      <div style={{ margin: '0 16px', borderRadius: 22, background: bd.grad, position: 'relative', height: 210, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden', flexShrink: 0 }}>
        {bd.dark && <React.Fragment>
          <div style={{ position: 'absolute', top: 18, right: 26, width: 34, height: 34, borderRadius: '50%', background: 'radial-gradient(circle at 38% 38%, #FBF8E6, #EBE2B4)', boxShadow: '0 0 22px #F4EFD2aa' }}/>
          {[[30,28],[70,22],[110,40],[150,30]].map(([x,y],i) => <div key={i} style={{ position: 'absolute', left: x, top: y, width: 4, height: 4, borderRadius: '50%', background: '#FBF8E6', opacity: 0.8 }}/>)}
        </React.Fragment>}
        {/* Pip + accessory */}
        <div style={{ position: 'relative', width: 130, height: 130, marginBottom: -6 }}>
          <Pip size={130} mood="happy"/>
          <PipAccessory id={look.pip}/>
        </div>
        {/* pot */}
        <div style={{ marginBottom: 18, zIndex: 1 }}><Pot id={look.pot} size={104}/></div>
      </div>

      {/* category tabs */}
      <div style={{ display: 'flex', gap: 4, background: SPROUT.cream2, borderRadius: 13, padding: 4, margin: '14px 16px 0', flexShrink: 0 }}>
        {[['pip', 'Pip'], ['pot', 'Pot'], ['backdrop', 'Backdrop']].map(([id, label]) => {
          const on = tab === id;
          return <button key={id} onClick={() => setTab(id)} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 10, padding: '9px 0', minHeight: 40, background: on ? '#fff' : 'transparent', color: on ? SPROUT.ink : SPROUT.mute, fontSize: 13.5, fontWeight: 900, boxShadow: on ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>{label}</button>;
        })}
      </div>

      {/* closet / decorate split */}
      <div style={{ display: 'flex', gap: 16, padding: '12px 18px 8px', flexShrink: 0 }}>
        {[['closet', 'Closet'], ['decorate', 'Decorate']].map(([id, label]) => {
          const on = shelf === id;
          return <button key={id} onClick={() => setShelf(id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 900, color: on ? SPROUT.greenDark : SPROUT.mute, padding: '2px 0', borderBottom: on ? `2.5px solid ${SPROUT.green}` : '2.5px solid transparent' }}>{label}</button>;
        })}
      </div>

      {/* item grid */}
      <div style={{ flex: 1, overflow: 'auto', padding: '4px 16px 24px' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: SPROUT.mute, padding: '30px 20px' }}>
            {shelf === 'closet' ? 'Nothing here yet — unlock looks in Decorate 🌱' : 'You own them all here! 🌸'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {items.map((it) => {
              const key = tab + ':' + it.id;
              const isOwned = owned[key];
              const isOn = look[tab] === it.id;
              const locked = !!it.lock;
              const canAfford = it.cost && gems >= it.cost;
              return (
                <button key={it.id} onClick={() => onItem(it)} disabled={locked || (!isOwned && it.cost && !canAfford)} style={{
                  border: isOn ? `2px solid ${SPROUT.green}` : `1px solid ${SPROUT.line}`,
                  background: SPROUT.paper, borderRadius: 15, padding: '10px 7px 9px', cursor: locked ? 'default' : 'pointer',
                  fontFamily: 'inherit', position: 'relative', boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, opacity: locked ? 0.9 : 1,
                }}>
                  {/* thumbnail */}
                  <div style={{ height: 56, borderRadius: 11, background: tab === 'backdrop' ? (BACKDROPS[it.id] || {}).grad : SPROUT.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 7, position: 'relative', overflow: 'hidden' }}>
                    {tab === 'pip' && <div style={{ position: 'relative', width: 50, height: 50 }}><Pip size={50} mood="happy"/><PipAccessory id={it.id}/></div>}
                    {tab === 'pot' && <Pot id={it.id} size={48}/>}
                    {tab === 'backdrop' && (BACKDROPS[it.id] || {}).dark && <span style={{ fontSize: 20 }}>🌙</span>}
                    {locked && <div style={{ position: 'absolute', inset: 0, background: 'rgba(40,40,40,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Lock size={18} color="#fff"/></div>}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 900, lineHeight: 1.1, minHeight: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: SPROUT.ink }}>{it.name}</div>
                  {/* status line */}
                  <div style={{ marginTop: 4, fontSize: 10.5, fontWeight: 900, textAlign: 'center', color: isOn ? SPROUT.greenDark : locked ? SPROUT.mute : isOwned ? SPROUT.mute : (canAfford ? '#2E8FB0' : SPROUT.mute) }}>
                    {isOn ? '✓ Wearing' : locked ? `🔒 ${it.lock}` : isOwned ? 'Wear' : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}><Icon.Gem size={10} color={canAfford ? '#5AB9D9' : SPROUT.mute}/>{it.cost}</span>}
                  </div>
                  {it.season && !isOwned && !locked && <div style={{ position: 'absolute', top: 6, left: 6, fontSize: 8.5, fontWeight: 900, color: '#fff', background: SPROUT.sun, borderRadius: 6, padding: '2px 5px' }}>{it.season}</div>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { Customizer, PipAccessory, Pot, COSMETICS, BACKDROPS });
