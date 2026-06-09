// ─────────────────────────────────────────────────────────────
// Garden collection — the "collect-them-all" layer of the Garden.
// Grown plants are vivid; ungrown ones show as faint silhouette slots
// so you see what's LEFT to grow (Waterllama/Finch pattern). A next-plant
// spotlight gives every visit a near-term goal; themed shelves + a detail
// sheet give each plant a little story.
// ─────────────────────────────────────────────────────────────

const PLANT_RARITY = {
  common: { label: 'Common', color: '#6FBF5E', ink: '#4D9E3F', chip: '#E3F5DB' },
  rare:   { label: 'Rare',   color: '#A87ED9', ink: '#7A53A8', chip: '#EDE4F7' },
  golden: { label: 'Golden', color: '#E0B43A', ink: '#9A7A1E', chip: '#FBEFC9' },
};

// art: 'bloom' (BloomFlower, tinted) · 'streak' (MilestonePlant tier) · 'golden'
const PLANT_SHELVES = [
  {
    id: 'topic', title: 'Topic blooms', sub: 'Grow one for each unit you finish',
    plants: [
      { id: 'daisy',  name: 'Greeting Daisy', art: 'bloom', color: '#6FBF5E', rarity: 'common', grown: true,  via: 'Finished Unit 1 · Getting started', when: 'Apr 18' },
      { id: 'cafe',   name: 'Café Bloom',     art: 'bloom', color: '#F5C23D', rarity: 'common', grown: true,  via: 'Completed the café Garden Tale',     when: 'Apr 22' },
      { id: 'tulip',  name: 'Town Tulip',     art: 'bloom', color: '#E48A7C', rarity: 'common', grown: false, need: 'Finish Unit 3 · Around town' },
      { id: 'lily',   name: 'Home Lily',      art: 'bloom', color: '#5BA8C8', rarity: 'common', grown: false, need: 'Finish Unit 4 · Family & home' },
      { id: 'poppy',  name: 'Market Poppy',   art: 'bloom', color: '#E48A2B', rarity: 'common', grown: false, need: 'Finish Unit 6 · Shopping' },
    ],
  },
  {
    id: 'streak', title: 'Streak growers', sub: 'Earned at streak milestones',
    plants: [
      { id: 'sprout', name: 'First Sprout', art: 'streak', tier: 'sprout', rarity: 'common', grown: true,  via: 'Reached a 7-day streak',   when: 'Apr 14' },
      { id: 'bush',   name: 'Flowering Bush', art: 'streak', tier: 'bush', rarity: 'common', grown: true,  via: 'Reached a 12-day streak',  when: 'Apr 20' },
      { id: 'tree',   name: 'Strong Tree',  art: 'streak', tier: 'tree', rarity: 'rare',   grown: false, need: 'Reach a 30-day streak' },
      { id: 'oak',    name: 'Mighty Oak',   art: 'streak', tier: 'oak',  rarity: 'rare',   grown: false, need: 'Reach a 100-day streak' },
    ],
  },
  {
    id: 'golden', title: 'Golden blooms', sub: 'Master a whole unit to grow one',
    plants: [
      { id: 'g1', name: 'Golden Bloom · U1', art: 'golden', rarity: 'golden', grown: true,  via: 'Mastered Unit 1 — no hints', when: 'Apr 25' },
      { id: 'g2', name: 'Golden Bloom · U2', art: 'golden', rarity: 'golden', grown: true,  via: 'Mastered Unit 2 — flawless',  when: 'Apr 29' },
      { id: 'g3', name: 'Golden Bloom · U3', art: 'golden', rarity: 'golden', grown: false, need: 'Master Unit 3 to grow it' },
      { id: 'g4', name: 'Golden Bloom · U4', art: 'golden', rarity: 'golden', grown: false, need: 'Master Unit 4 to grow it' },
    ],
  },
  {
    id: 'rare', title: 'Rare finds', sub: 'From rare seed packs & events',
    plants: [
      { id: 'aurora', name: 'Aurora Orchid', art: 'bloom', color: '#A87ED9', rarity: 'rare', grown: false, need: 'Open a Rare seed pack in the Shop' },
      { id: 'star',   name: 'Starflower',    art: 'bloom', color: '#5B8DEF', rarity: 'rare', grown: false, need: 'Win a special event' },
      { id: 'moon',   name: 'Moonpetal',     art: 'bloom', color: '#7DC9A8', rarity: 'rare', grown: false, need: 'Practise 30 nights' },
    ],
  },
];

const ALL_PLANTS = PLANT_SHELVES.flatMap(s => s.plants);

function plantCounts() {
  const grown = ALL_PLANTS.filter(p => p.grown).length;
  return { grown, total: ALL_PLANTS.length };
}
// First ungrown plant, walking shelves in order — the next thing to chase.
function nextUngrown() {
  for (const s of PLANT_SHELVES) {
    const p = s.plants.find(pl => !pl.grown);
    if (p) return p;
  }
  return null;
}

// One plant's art — vivid when grown, a faint silhouette slot when not.
function PlantGlyph({ plant, size = 52 }) {
  const grown = plant.grown;
  let art;
  if (plant.art === 'streak') {
    art = <MilestonePlant tier={plant.tier} size={size}/>;
  } else if (plant.art === 'golden') {
    art = <BloomFlower level={4} color="#E0B43A" size={size}/>;
  } else {
    art = <BloomFlower level={plant.rarity === 'rare' ? 4 : 3} color={plant.color} size={size}/>;
  }
  if (grown) return <div style={{ lineHeight: 0 }}>{art}</div>;
  // ungrown → desaturated, faded silhouette so the shape still teases the reward
  return (
    <div style={{ lineHeight: 0, filter: 'grayscale(1) brightness(1.25)', opacity: 0.34 }}>{art}</div>
  );
}

function rarityDot(rarity) {
  const r = PLANT_RARITY[rarity];
  return <span style={{ width: 7, height: 7, borderRadius: 999, background: r.color, display: 'inline-block', flexShrink: 0 }}/>;
}

// Detail sheet — each plant's little story (or how to unlock it).
function PlantDetailSheet({ plant, onClose }) {
  if (!plant) return null;
  const r = PLANT_RARITY[plant.rarity];
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', background: 'rgba(20,30,40,0.45)', animation: 'pdFade 180ms ease both', fontFamily: '"Nunito", system-ui' }}>
      <style>{`@keyframes pdFade{from{opacity:0}to{opacity:1}} @keyframes pdSlide{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: SPROUT.bg, borderRadius: '24px 24px 0 0', padding: '18px 18px 26px', animation: 'pdSlide 300ms cubic-bezier(.2,.8,.2,1) both', boxShadow: '0 -10px 30px rgba(0,0,0,0.15)' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: SPROUT.line, margin: '0 auto 14px' }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 78, height: 78, borderRadius: 18, background: plant.grown ? r.chip : SPROUT.cream2, border: `1px solid ${SPROUT.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <PlantGlyph plant={plant} size={58}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 900, color: r.ink, background: r.chip, padding: '3px 9px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {rarityDot(plant.rarity)} {r.label}
            </div>
            <div style={{ fontSize: 19, fontWeight: 900, color: SPROUT.ink, marginTop: 6, lineHeight: 1.1 }}>{plant.grown ? plant.name : '???'}</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: SPROUT.mute, marginTop: 2 }}>
              {plant.grown ? `Grown ${plant.when}` : 'Not grown yet'}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 14, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14, padding: '12px 13px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}` }}>
          <div style={{ fontSize: 10.5, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>
            {plant.grown ? 'How you grew it' : 'How to grow it'}
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: plant.grown ? SPROUT.ink : SPROUT.greenDark, lineHeight: 1.35 }}>
            {plant.grown ? plant.via : plant.need}
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact next-plant spotlight — sits high in the Garden so every visit has a goal.
function NextPlantSpotlight() {
  const [open, setOpen] = React.useState(false);
  const next = nextUngrown();
  if (!next) return null;
  const r = PLANT_RARITY[next.rarity];
  return (
    <React.Fragment>
      <button onClick={() => setOpen(true)} style={{
        margin: '0 16px 18px', width: 'calc(100% - 32px)', display: 'flex', alignItems: 'center', gap: 13,
        background: 'linear-gradient(100deg, #FFF8E6 0%, #EDF8E7 100%)', border: `1px solid #DCEBD0`,
        borderRadius: 18, padding: '12px 14px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
        boxShadow: '0 3px 0 #E3E0D2',
      }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <PlantGlyph plant={next} size={44}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: SPROUT.greenDark, textTransform: 'uppercase', letterSpacing: 0.6 }}>Next to grow</div>
          <div style={{ fontSize: 15.5, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.15, marginTop: 1 }}>{next.name}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{next.need}</div>
        </div>
        <span style={{ fontSize: 18, color: SPROUT.greenDark, flexShrink: 0 }}>›</span>
      </button>
      {open && <PlantDetailSheet plant={next} onClose={() => setOpen(false)}/>}
    </React.Fragment>
  );
}

// The full collection — counter + themed shelves with silhouette slots.
function GardenCollection() {
  const [selected, setSelected] = React.useState(null);
  const { grown, total } = plantCounts();
  const pct = Math.round((grown / total) * 100);

  return (
    <div style={{ margin: '6px 16px 0' }}>
      {/* counter header — "X of Y grown" flips the screen to what's LEFT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 16, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, padding: '13px 14px', marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F6ECD3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <BloomFlower level={4} color={SPROUT.sun} size={42}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.mute, letterSpacing: 0.6, textTransform: 'uppercase' }}>Your collection</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: SPROUT.ink, lineHeight: 1.1 }}>{grown} of {total} plants grown 🌱</div>
          <div style={{ height: 7, borderRadius: 4, background: SPROUT.cream, overflow: 'hidden', marginTop: 6 }}>
            <div style={{ width: `${pct}%`, height: '100%', background: SPROUT.green, borderRadius: 4, boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.12)' }}/>
          </div>
        </div>
      </div>

      {/* themed shelves */}
      {PLANT_SHELVES.map((shelf) => {
        const sg = shelf.plants.filter(p => p.grown).length;
        return (
          <div key={shelf.id} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 2px 8px' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 900, color: SPROUT.ink }}>{shelf.title}</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: SPROUT.mute }}>{shelf.sub}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 900, color: SPROUT.greenDark, background: '#E3F5DB', padding: '3px 9px', borderRadius: 999, flexShrink: 0 }}>{sg}/{shelf.plants.length}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {shelf.plants.map((p) => {
                const r = PLANT_RARITY[p.rarity];
                return (
                  <button key={p.id} onClick={() => setSelected(p)} style={{
                    border: p.grown ? `1px solid ${r.color}55` : `1px dashed ${SPROUT.line}`,
                    background: p.grown ? '#fff' : SPROUT.cream, borderRadius: 14, padding: '12px 6px 10px',
                    cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 6, position: 'relative',
                    boxShadow: p.grown ? `0 2px 0 ${SPROUT.cardShadow}` : 'none',
                  }}>
                    <div style={{ height: 52, display: 'flex', alignItems: 'flex-end' }}>
                      <PlantGlyph plant={p} size={48}/>
                    </div>
                    <div style={{ fontSize: 10.5, fontWeight: 800, color: p.grown ? SPROUT.ink : SPROUT.mute, textAlign: 'center', lineHeight: 1.15, minHeight: 24, display: 'flex', alignItems: 'center' }}>
                      {p.grown ? p.name : 'Locked'}
                    </div>
                    {p.grown
                      ? <span style={{ position: 'absolute', top: 7, right: 7 }}>{rarityDot(p.rarity)}</span>
                      : <span style={{ position: 'absolute', top: 6, right: 6 }}><Icon.Lock size={12} color="#B7AC99"/></span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {selected && <PlantDetailSheet plant={selected} onClose={() => setSelected(null)}/>}
    </div>
  );
}

Object.assign(window, { GardenCollection, NextPlantSpotlight, PlantDetailSheet, PLANT_SHELVES, ALL_PLANTS });
