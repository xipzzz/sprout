// ─────────────────────────────────────────────────────────────
// Gems shop — bottom sheet opened by tapping the gems stat in the HUD.
// Spend gems on garden-themed power-ups. On-brand with the cream UI.
// ─────────────────────────────────────────────────────────────

function GemsShop({ onClose, calm = false }) {
  // Grouped by purpose — scans like shelves rather than a flat list.
  const sections = [
    { id: 'powerups', label: 'Power-ups', items: [
      { id: 'freeze', icon: '🧊', tint: '#E7F1FA', title: 'Streak Freeze', desc: 'Protects your streak for one missed day', cost: 200, owned: 2, armed: true },
      { id: 'double', icon: '⚡', tint: '#FBF1DC', title: 'XP boost', desc: 'Double XP for 15 minutes', cost: 150, active: true },
    ]},
    { id: 'refills', label: 'Refills', items: [
      { id: 'refill', icon: '💧', tint: '#E4F4FA', title: 'Water refill', desc: 'Top your water back to full', cost: 120 },
    ]},
    { id: 'garden', label: 'Garden', items: [
      { id: 'seeds', icon: '🌱', tint: '#EFF7EA', title: 'Rare seed pack', desc: 'Unlock 3 bonus garden plants', cost: 300 },
    ]},
  ];
  // Cosmetics — a long-term gem sink. Bought once, then equipped. The garden is the canvas.
  const cosmetics = [
    { id: 'pot-terra', icon: '🪴', tint: '#F4E6D6', title: 'Terracotta pot', desc: 'Classic warm clay planter', cost: 150 },
    { id: 'theme-night', icon: '🌙', tint: '#E7E3F4', title: 'Night garden', desc: 'A moonlit backdrop for your plants', cost: 250 },
    { id: 'pip-scarf', icon: '🧣', tint: '#FBE6E6', title: 'Pip’s scarf', desc: 'Dress Pip up cosy', cost: 200 },
    { id: 'theme-green', icon: '🪟', tint: '#E3F5DB', title: 'Greenhouse', desc: 'Glass-house glow', cost: 400, lockStreak: 50 },
    { id: 'theme-zen', icon: '🍵', tint: '#EDEFE6', title: 'Zen garden', desc: 'Raked sand & calm', cost: 600, lockStreak: 100 },
  ];
  const allItems = [...sections.flatMap(s => s.items), ...cosmetics];
  const [bought, setBought] = React.useState({});
  const [equipped, setEquipped] = React.useState('pot-terra');
  const [claimed, setClaimed] = React.useState(false);
  const [grownUps, setGrownUps] = React.useState(false); // parent-gated "For grown-ups" area
  const balance = 420 + (claimed ? 15 : 0)
    - Object.keys(bought).reduce((s, id) => s + (allItems.find(i => i.id === id)?.cost || 0), 0);
  const currentStreak = 13; // gates the locked cosmetics

  // Live XP-boost countdown — a bought boost visibly ticks down (Duolingo-style),
  // shown both in the shed strip AND on its for-sale card so an owned item changes.
  const [boostSecs, setBoostSecs] = React.useState(12 * 60 + 4);
  React.useEffect(() => {
    const iv = setInterval(() => setBoostSecs((s) => (s <= 0 ? 0 : s - 1)), 1000);
    return () => clearInterval(iv);
  }, []);
  const boostActive = boostSecs > 0;
  const boostClock = `${Math.floor(boostSecs / 60)}:${String(boostSecs % 60).padStart(2, '0')}`;
  const freezeOwned = 2; // armed streak-freezes on hand

  // mock "hours until next free gift"
  const hoursLeft = 14;
  // 7-day daily-gift ladder
  const ladder = [
    { d: 1, icon: '💎', label: '5' },
    { d: 2, icon: '💧', label: '+1' },
    { d: 3, icon: '💎', label: '10' },
    { d: 4, icon: '🧊', label: '×1' },
    { d: 5, icon: '💎', label: '15' },
    { d: 6, icon: '⚡', label: '15m' },
    { d: 7, icon: '🌱', label: 'seed' },
  ];
  const todayIdx = 4; // day 5 is today (0-based)

  const itemCard = (it) => {
    const isBought = !!bought[it.id];
    const canAfford = balance >= it.cost;
    return (
      <div key={it.id} style={{
        background: SPROUT.paper, borderRadius: 16, padding: '12px 13px',
        border: `1px solid ${SPROUT.line}`,
        boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
        display: 'flex', alignItems: 'center', gap: 13, position: 'relative',
      }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: it.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 24, position: 'relative' }}>
          {it.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15, fontWeight: 900 }}>{it.title}</span>
            {it.owned != null && <span style={{ fontSize: 11, fontWeight: 800, color: SPROUT.mute }}>· own {it.owned + (isBought ? 1 : 0)}</span>}
            {it.armed && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 9.5, fontWeight: 900, color: SPROUT.greenDark, background: '#E3F5DB', borderRadius: 999, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                <span style={{ width: 5, height: 5, borderRadius: 999, background: SPROUT.green }}/> Armed
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>{it.desc}</div>
        </div>
        {it.active && boostActive ? (
          // Active boost reads as a live state, not a purchasable button.
          <div style={{
            flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3,
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 900, color: SPROUT.sunShadow, background: '#FBF1DC', border: '1px solid #F0D9A0', borderRadius: 999, padding: '7px 11px', fontVariantNumeric: 'tabular-nums' }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: SPROUT.sun }}/> Active · {boostClock}
            </span>
          </div>
        ) : (
        <button onClick={() => !isBought && canAfford && setBought(b => ({ ...b, [it.id]: true }))}
          disabled={isBought || !canAfford}
          style={{
            border: 'none', cursor: isBought || !canAfford ? 'default' : 'pointer', fontFamily: 'inherit', flexShrink: 0,
            background: isBought ? SPROUT.cream2 : canAfford ? SPROUT.green : SPROUT.cream2,
            color: isBought ? SPROUT.mute : canAfford ? '#fff' : SPROUT.mute,
            fontSize: 13, fontWeight: 900, borderRadius: 11, padding: '9px 12px',
            boxShadow: isBought || !canAfford ? 'none' : `0 2px 0 ${SPROUT.greenShadow}`,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
          {isBought ? 'Bought' : (it.armed ? <>Add 1</> : <><Icon.Gem size={14} color={canAfford ? '#fff' : SPROUT.mute}/>{it.cost}</>)}
        </button>
        )}
      </div>
    );
  };

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end',
      background: 'rgba(20,30,40,0.5)', fontFamily: '"Nunito", system-ui',
      animation: 'gsFade 200ms ease both', zIndex: 40,
    }}>
      <style>{`
        @keyframes gsFade { from{opacity:0} to{opacity:1} }
        @keyframes gsSlide { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes gsPop { 0%{transform:scale(1)} 50%{transform:scale(1.12)} 100%{transform:scale(1)} }
      `}</style>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxHeight: '92%', overflowY: 'auto', background: SPROUT.bg, borderRadius: '24px 24px 0 0',
        padding: '20px 18px 28px', animation: 'gsSlide 320ms cubic-bezier(.2,.8,.2,1) both',
        position: 'relative', boxShadow: '0 -10px 30px rgba(0,0,0,0.15)',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: SPROUT.line, margin: '0 auto 14px' }}/>
        <button onClick={onClose} aria-label="Close shop" style={{
          position: 'absolute', top: 14, right: 14, border: 'none', background: 'transparent',
          fontSize: 22, color: SPROUT.mute, cursor: 'pointer', width: 32, height: 32, lineHeight: 1,
        }}>×</button>

        {/* header + balance */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, padding: '0 2px' }}>
          <div style={{ fontSize: 22, fontWeight: 900 }}>Shop</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 999, padding: '6px 12px' }}>
            <Icon.Gem size={18} color="#5AB9D9"/>
            <span style={{ fontSize: 16, fontWeight: 900, color: '#2E8FB0', fontVariantNumeric: 'tabular-nums' }}>{balance}</span>
          </div>
        </div>

        {/* YOUR ITEMS — backpack at a glance: what you own & what's armed/active. */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 2px 8px' }}>Your items</div>
          <div style={{ display: 'flex', gap: 9 }}>
            <div style={{ flex: 1, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14, padding: '10px 11px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: '#E7F1FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, position: 'relative' }}>
                🧊
                <span style={{ position: 'absolute', top: -5, right: -5, minWidth: 16, height: 16, padding: '0 3px', borderRadius: 999, background: SPROUT.green, color: '#fff', fontSize: 9.5, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${SPROUT.paper}` }}>×{freezeOwned}</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 900, whiteSpace: 'nowrap' }}>Streak Freeze</div>
                <div style={{ fontSize: 10.5, fontWeight: 900, color: SPROUT.greenDark, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: SPROUT.green, display: 'inline-block' }}/>Armed · auto-applies
                </div>
              </div>
            </div>
            <div style={{ flex: 1, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14, padding: '10px 11px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, display: 'flex', alignItems: 'center', gap: 9, opacity: boostActive ? 1 : 0.6 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: '#FBF1DC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>⚡</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 900, whiteSpace: 'nowrap' }}>XP boost</div>
                <div style={{ fontSize: 10.5, fontWeight: 900, color: boostActive ? SPROUT.sunShadow : SPROUT.mute, fontVariantNumeric: 'tabular-nums' }}>{boostActive ? `Active · ${boostClock} left` : 'Ended'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* DAILY GIFT — one free reward a day, no ads, no money. The daily-return hook. */}
        <div style={{
          background: claimed ? '#fff' : 'linear-gradient(135deg, #EFF7EA 0%, #FBF1DC 100%)',
          borderRadius: 18, padding: 14, marginBottom: 18,
          border: `1.5px solid ${claimed ? SPROUT.line : SPROUT.green}`,
          boxShadow: claimed ? `0 2px 0 ${SPROUT.cardShadow}` : `0 3px 0 ${SPROUT.greenShadow}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: claimed ? SPROUT.cream2 : SPROUT.sun, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, animation: claimed ? 'none' : 'gsPop 1.8s ease-in-out infinite' }}>🎁</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 900 }}>Daily gift</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>
                {claimed ? `Come back in ${hoursLeft}h for your next gift` : 'A little something to grow with — free every day'}
              </div>
            </div>
            <button onClick={() => !claimed && setClaimed(true)} disabled={claimed} style={{
              border: 'none', cursor: claimed ? 'default' : 'pointer', fontFamily: 'inherit', flexShrink: 0,
              background: claimed ? SPROUT.cream2 : SPROUT.green, color: claimed ? SPROUT.mute : '#fff',
              fontSize: 13, fontWeight: 900, borderRadius: 12, padding: '11px 16px',
              boxShadow: claimed ? 'none' : `0 3px 0 ${SPROUT.greenShadow}`,
            }}>{claimed ? `${hoursLeft}h` : 'Open'}</button>
          </div>

          {/* 7-day ladder */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5, marginTop: 13 }}>
            {ladder.map((g, i) => {
              const isToday = i === todayIdx;
              const isPast = i < todayIdx || (isToday && claimed);
              return (
                <div key={g.d} style={{
                  borderRadius: 10, padding: '7px 2px 5px', textAlign: 'center',
                  background: isToday && !claimed ? '#fff' : isPast ? '#E3F5DB' : 'rgba(255,255,255,0.5)',
                  border: isToday ? `1.5px solid ${SPROUT.green}` : `1px solid ${SPROUT.line}`,
                  opacity: isPast && !isToday ? 0.65 : 1, position: 'relative',
                }}>
                  <div style={{ fontSize: 8, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase' }}>D{g.d}</div>
                  <div style={{ fontSize: 16, lineHeight: 1.2 }}>{g.icon}</div>
                  <div style={{ fontSize: 8.5, fontWeight: 900, color: SPROUT.greenDark }}>{g.label}</div>
                  {isPast && !isToday && <span style={{ position: 'absolute', top: 2, right: 3, fontSize: 8, color: SPROUT.green }}>✓</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* grouped shelves */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sections.map((sec) => (
            <div key={sec.id}>
              <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 2px 8px' }}>{sec.label}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sec.items.map(itemCard)}
              </div>
            </div>
          ))}
        </div>

        {/* DECORATE — cosmetics. A long-term gem sink; buy once then equip. */}
        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 2px 8px' }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.8 }}>Decorate</div>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: SPROUT.mute }}>Make your garden yours</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 9 }}>
            {cosmetics.map((c) => {
              const isBought = !!bought[c.id];
              const isEquipped = equipped === c.id;
              const locked = c.lockStreak && currentStreak < c.lockStreak;
              const canAfford = balance >= c.cost;
              return (
                <div key={c.id} style={{
                  background: SPROUT.paper, borderRadius: 14, padding: '11px 8px 9px', textAlign: 'center',
                  border: isEquipped ? `1.5px solid ${SPROUT.green}` : `1px solid ${SPROUT.line}`,
                  boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, position: 'relative', opacity: locked ? 0.92 : 1,
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: locked ? SPROUT.cream2 : c.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 23, margin: '0 auto 7px', filter: locked ? 'grayscale(0.7)' : 'none' }}>{locked ? '🔒' : c.icon}</div>
                  <div style={{ fontSize: 11.5, fontWeight: 900, lineHeight: 1.15 }}>{c.title}</div>
                  {locked ? (
                    <div style={{ fontSize: 9.5, fontWeight: 900, color: SPROUT.mute, marginTop: 5, lineHeight: 1.25 }}>🔥 {c.lockStreak}-day streak</div>
                  ) : (
                    <button onClick={() => {
                      if (isBought) { setEquipped(c.id); }
                      else if (canAfford) { setBought(b => ({ ...b, [c.id]: true })); setEquipped(c.id); }
                    }} disabled={isEquipped || (!isBought && !canAfford)}
                      style={{
                        marginTop: 7, width: '100%', border: 'none', cursor: isEquipped || (!isBought && !canAfford) ? 'default' : 'pointer', fontFamily: 'inherit',
                        background: isEquipped ? '#E3F5DB' : isBought ? SPROUT.green : canAfford ? SPROUT.cream2 : SPROUT.cream2,
                        color: isEquipped ? SPROUT.greenDark : isBought ? '#fff' : canAfford ? SPROUT.ink : SPROUT.mute,
                        fontSize: 11, fontWeight: 900, borderRadius: 9, padding: '6px 4px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
                      }}>
                      {isEquipped ? '✓ On' : isBought ? 'Wear' : (<><Icon.Gem size={11} color={canAfford ? '#5AB9D9' : SPROUT.mute}/>{c.cost}</>)}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* GARDEN GOAL — a gentle, no-stakes commitment (no wager, no gems risked). */}
        <div style={{
          marginTop: 18, borderRadius: 18, padding: 14,
          background: 'linear-gradient(135deg, #EFF7EA 0%, #E7F1FA 100%)',
          border: `1.5px solid ${SPROUT.sky}`, boxShadow: '0 3px 0 #BFD8E4',
          display: 'flex', alignItems: 'center', gap: 13,
        }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 27, flexShrink: 0 }}>🌱</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15.5, fontWeight: 900 }}>This week's gentle goal</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute, lineHeight: 1.3 }}>Tend your garden 5 days → earn a bonus bloom. No stakes, just growth.</div>
          </div>
        </div>

        {/* For grown-ups — real-money plans live behind a parent gate, never in the kid shop. */}
        <button onClick={() => setGrownUps(true)} style={{
          marginTop: 14, width: '100%', cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
          background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14,
          boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, textAlign: 'left',
        }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: '#EFF7EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>🌿</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 900, color: SPROUT.ink }}>For grown-ups</div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: SPROUT.mute }}>Plans & settings — behind a parent check</div>
          </div>
          <Icon.ChevR size={18} color={SPROUT.mute}/>
        </button>

        <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: SPROUT.mute, textAlign: 'center', lineHeight: 1.4 }}>
          Everything here is bought with gems you earn by learning.<br/>No real money is ever spent in your garden. 🌱
        </div>
      </div>
      {grownUps && <GrownUpsArea onClose={() => setGrownUps(false)} />}
    </div>
  );
}

Object.assign(window, { GemsShop });
