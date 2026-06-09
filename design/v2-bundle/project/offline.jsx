// ─────────────────────────────────────────────────────────────
// Offline / connection-lost states — the resilience the happy path never shows.
//  • OfflineScreen   — warm Pip-branded "can't reach your garden" full screen
//  • OfflineBanner   — gentle "progress saved, will sync" strip (mid-lesson loss)
//  • OfflineDownloads— per-unit "Available offline ⬇" toggles → a lost signal is a non-event
// English-only copy; reuses Pip + garden art so an error never feels cold.
// ─────────────────────────────────────────────────────────────

// Pip beside a thirsty sprout, holding an empty watering can — the offline mascot moment.
function ThirstyScene({ size = 150 }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <Pip size={size * 0.78} mood="thinking" />
      {/* a little wilting sprout in dry soil beside Pip */}
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 60 60" style={{ position: 'absolute', right: -6, bottom: 0 }}>
        <ellipse cx="30" cy="50" rx="20" ry="6" fill="#E7D8BE" />
        <path d="M30 50 Q30 38 30 30" stroke="#C9A86B" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* wilted leaves drooping down */}
        <path d="M30 33 Q20 33 15 40 Q24 40 30 35 Z" fill="#A9C98E" />
        <path d="M30 30 Q40 31 45 39 Q36 38 30 33 Z" fill="#B7D29C" />
        {/* dashed 'no water' marks */}
        <g opacity="0.5">
          <line x1="44" y1="14" x2="48" y2="18" stroke="#C7BCA8" strokeWidth="2" strokeLinecap="round" />
          <line x1="48" y1="14" x2="44" y2="18" stroke="#C7BCA8" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

function OfflineScreen({ calm, onRetry, onSettings }) {
  const [trying, setTrying] = React.useState(false);
  const retry = () => { setTrying(true); setTimeout(() => setTrying(false), 1400); };
  return (
    <div style={{ position: 'absolute', inset: 0, background: calm ? '#F1F6EC' : SPROUT.bg, display: 'flex', flexDirection: 'column', fontFamily: '"Nunito", system-ui', color: SPROUT.ink }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 30px' }}>
        <ThirstyScene size={156} />
        <div style={{ fontSize: 23, fontWeight: 900, marginTop: 18, lineHeight: 1.2 }}>Pip can't reach your garden</div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: SPROUT.mute, marginTop: 9, lineHeight: 1.45, maxWidth: 280 }}>
          You look offline right now. Check your connection — your garden's safe and waiting. 🌱
        </div>
      </div>
      <div style={{ padding: '0 22px 30px', display: 'flex', flexDirection: 'column', gap: 11 }}>
        <PushButton size="lg" color={SPROUT.green} shadow={SPROUT.greenShadow} onClick={() => { retry(); onRetry && onRetry(); }} style={{ width: '100%' }}>
          {trying ? 'Reaching…' : 'Try again'}
        </PushButton>
      </div>
    </div>
  );
}

// Gentle sync banner — shown when a lesson finishes offline; progress is queued.
// `state`: 'offline' (queued, waiting) | 'syncing' | 'synced'
function OfflineBanner({ state = 'offline' }) {
  const cfg = {
    offline: { bg: '#FBF1D6', border: '#EAD79B', ink: '#8A6A12', icon: '☁️', text: "You're offline — progress saved, syncs when you're back." },
    syncing: { bg: '#E7F1FA', border: '#BFD8E4', ink: '#2E6F8E', icon: '🔄', text: 'Back online — syncing your garden…' },
    synced:  { bg: '#E3F5DB', border: '#BBE3A8', ink: SPROUT.greenDark, icon: '✓', text: 'All synced — your lesson and streak are safe. 🌱' },
  }[state];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 9, margin: '0 12px',
      background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 13,
      padding: '10px 13px', fontSize: 12.5, fontWeight: 800, color: cfg.ink,
    }}>
      <span style={{ fontSize: 15, flexShrink: 0 }}>{cfg.icon}</span>
      <span style={{ lineHeight: 1.3 }}>{cfg.text}</span>
    </div>
  );
}

// Per-unit offline download list — turns the worst failure state into a feature.
function OfflineDownloads({ onClose }) {
  const [units, setUnits] = React.useState([
    { id: 1, title: 'Getting started', section: 1, state: 'ready', size: '2.4 MB' },
    { id: 2, title: 'Food & drink',    section: 1, state: 'ready', size: '3.1 MB' },
    { id: 3, title: 'Around town',     section: 1, state: 'idle',  size: '2.8 MB' },
    { id: 4, title: 'Family & home',   section: 2, state: 'idle',  size: '2.6 MB' },
    { id: 'travel', title: 'Travel pack', section: '★', state: 'idle', size: '5.0 MB', pack: true },
  ]);
  const setU = (id, patch) => setUnits((arr) => arr.map((u) => u.id === id ? { ...u, ...patch } : u));
  const toggle = (u) => {
    if (u.state === 'ready') { setU(u.id, { state: 'idle' }); return; }
    if (u.state === 'idle') {
      setU(u.id, { state: 'downloading' });
      setTimeout(() => setU(u.id, { state: 'ready' }), 1600);
    }
  };
  const readyCount = units.filter((u) => u.state === 'ready').length;
  return (
    <div style={{ position: 'absolute', inset: 0, background: SPROUT.bg, display: 'flex', flexDirection: 'column', fontFamily: '"Nunito", system-ui', color: SPROUT.ink }}>
      <div style={{ padding: '58px 16px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${SPROUT.line}` }}>
        {onClose && (
          <button onClick={onClose} aria-label="Back" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, marginLeft: -4 }}>
            <Icon.ChevL size={22} color={SPROUT.ink} />
          </button>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 19, fontWeight: 900 }}>Practice offline</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>{readyCount} ready · learn on planes & commutes</div>
        </div>
        <span style={{ fontSize: 22 }}>⬇</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 16px 24px' }}>
        <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.6, margin: '0 2px 9px' }}>Your units</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {units.map((u) => {
            const ready = u.state === 'ready';
            const downloading = u.state === 'downloading';
            return (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, background: SPROUT.paper,
                border: `1px solid ${ready ? '#BBE3A8' : SPROUT.line}`, borderRadius: 15, padding: '12px 13px',
                boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, background: u.pack ? '#FBF1D6' : '#EFF7EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19 }}>
                  {u.pack ? '✈️' : (ready ? '🌱' : '🌰')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 900, lineHeight: 1.15 }}>{u.title}</div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: ready ? SPROUT.greenDark : SPROUT.mute }}>
                    {downloading ? 'Downloading…' : ready ? 'Offline ready ✓' : `${u.size}`}
                  </div>
                </div>
                <button onClick={() => toggle(u)} disabled={downloading} style={{
                  flexShrink: 0, border: ready ? 'none' : `1.5px solid ${SPROUT.green}`,
                  background: ready ? '#E3F5DB' : downloading ? SPROUT.cream2 : '#fff',
                  color: ready ? SPROUT.greenDark : downloading ? SPROUT.mute : SPROUT.greenDark,
                  cursor: downloading ? 'default' : 'pointer', fontFamily: 'inherit',
                  fontSize: 12.5, fontWeight: 900, borderRadius: 999, padding: '8px 14px', minHeight: 36,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  {downloading ? '…' : ready ? '✓ Saved' : <><span style={{ fontSize: 14 }}>⬇</span> Get</>}
                </button>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: SPROUT.mute, textAlign: 'center', marginTop: 16, lineHeight: 1.4, padding: '0 12px' }}>
          Downloaded units work with no connection. Your progress syncs automatically next time you're online. 🌱
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { OfflineScreen, OfflineBanner, OfflineDownloads });
