// ─────────────────────────────────────────────────────────────
// Activity inbox — one gentle home for everything that happened to YOU
// (cheers, co-op nudges, league results, Bloom unlocks, friend requests,
// streak reminders). Distinct from the Friends feed (what friends are doing).
// Calm by design: soft unread dots (no angry red counts), batched/bundled
// rows, inline quick actions, Pip's warm voice. English-only.
// ─────────────────────────────────────────────────────────────

// row types carry an icon treatment + optional inline action.
const INBOX_SEED = [
  { id: 'n1', group: 'today', kind: 'cheer-bundle', icon: '👏', tint: '#FBF1D6', who: '3 friends', text: 'cheered your garden', time: '2h', unread: true, action: 'cheerback' },
  { id: 'n2', group: 'today', kind: 'coop', icon: '🤝', tint: '#E7F1FA', who: 'Leo', text: 'sent a co-op nudge — your turn to grow!', time: '4h', unread: true, action: 'coop' },
  { id: 'n3', group: 'today', kind: 'bloom', icon: '🌸', tint: '#EDE4F7', who: '', text: 'You grew a Café Bloom — added to your garden', time: '6h', unread: true, action: 'viewbloom' },
  { id: 'n4', group: 'week', kind: 'league', icon: '🌈', tint: '#E3F5DB', who: '', text: 'You finished #4 last week — promoted to Sunbeam!', time: '2d', unread: false, action: 'league' },
  { id: 'n5', group: 'week', kind: 'request', icon: '🌱', tint: '#FBE9EC', who: 'Priya', text: 'wants to be garden buddies', time: '3d', unread: false, action: 'accept' },
  { id: 'n6', group: 'week', kind: 'reminder', icon: '💧', tint: '#E7F1FA', who: '', text: 'Your garden was a little thirsty — nice job watering it', time: '4d', unread: false, action: null },
  { id: 'n7', group: 'week', kind: 'milestone', icon: '🔥', tint: '#FBF1D6', who: '', text: 'You reached a 13-day streak — your longest yet', time: '5d', unread: false, action: null },
];

function actionLabel(a) {
  return {
    cheerback: 'Cheer back 👏', coop: 'Open quest', viewbloom: 'View bloom',
    league: 'See results', accept: 'Accept',
  }[a];
}

function InboxScreen({ tweaks = {}, onClose, onGoTo }) {
  const calm = tweaks.calm;
  const [items, setItems] = React.useState(INBOX_SEED);
  const [done, setDone] = React.useState({}); // inline actions taken

  const markAllRead = () => setItems((arr) => arr.map((n) => ({ ...n, unread: false })));
  const readOne = (id) => setItems((arr) => arr.map((n) => n.id === id ? { ...n, unread: false } : n));
  const unread = items.filter((n) => n.unread).length;

  const groups = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This week' },
  ];

  const takeAction = (n) => {
    readOne(n.id);
    if (n.action === 'accept' || n.action === 'cheerback') { setDone((d) => ({ ...d, [n.id]: true })); return; }
    if (onGoTo) onGoTo(n.action);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: SPROUT.bg, display: 'flex', flexDirection: 'column', fontFamily: '"Nunito", system-ui', color: SPROUT.ink, zIndex: 30 }}>
      {/* header */}
      <div style={{ padding: '56px 14px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${SPROUT.line}` }}>
        {onClose && (
          <button onClick={onClose} aria-label="Close" style={{ width: 40, height: 40, marginLeft: -6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.ChevL size={24} color={SPROUT.ink}/>
          </button>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.1 }}>Activity</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>{unread ? `${unread} new` : 'All caught up 🌱'}</div>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 900, color: SPROUT.greenDark, padding: '8px 6px' }}>Mark all read</button>
        )}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 14px 24px' }}>
        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: SPROUT.mute }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><PipMini size={56}/></div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>Nothing new yet 🌱</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>Cheers, blooms & co-op updates will land here.</div>
          </div>
        )}
        {groups.map((g) => {
          const rows = items.filter((n) => n.group === g.id);
          if (!rows.length) return null;
          return (
            <div key={g.id} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.6, margin: '6px 2px 8px' }}>{g.label}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {rows.map((n) => (
                  <div key={n.id} onClick={() => readOne(n.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                    background: n.unread ? '#FCFAF4' : '#fff',
                    border: `1px solid ${n.unread ? '#E7DcC2' : SPROUT.line}`, borderRadius: 15,
                    padding: '12px 13px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, position: 'relative',
                  }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: n.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, flexShrink: 0 }}>{n.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: SPROUT.ink, lineHeight: 1.32 }}>
                        {n.who && <span style={{ fontWeight: 900 }}>{n.who} </span>}{n.text}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: SPROUT.mute, marginTop: 3 }}>{n.time} ago</div>
                      {n.action && (
                        <button onClick={(e) => { e.stopPropagation(); takeAction(n); }} disabled={done[n.id]} style={{
                          marginTop: 9, border: done[n.id] ? 'none' : `1.5px solid ${SPROUT.green}`, cursor: done[n.id] ? 'default' : 'pointer', fontFamily: 'inherit',
                          background: done[n.id] ? '#E3F5DB' : '#fff', color: done[n.id] ? SPROUT.greenDark : SPROUT.greenDark,
                          fontSize: 12, fontWeight: 900, borderRadius: 9, padding: '7px 13px', minHeight: 36,
                        }}>{done[n.id] ? (n.action === 'accept' ? 'Added 🌱' : 'Sent 👏') : actionLabel(n.action)}</button>
                      )}
                    </div>
                    {n.unread && <span style={{ position: 'absolute', top: 13, right: 13, width: 9, height: 9, borderRadius: '50%', background: SPROUT.green }}/>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Bell button with a soft unread dot — sits in a screen's top area.
function InboxBell({ count = 0, onClick }) {
  return (
    <button onClick={onClick} aria-label={`Activity${count ? `, ${count} new` : ''}`} style={{
      position: 'relative', width: 44, height: 44, borderRadius: 12, border: 'none',
      background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon.Bell size={23} color={SPROUT.ink}/>
      {count > 0 && (
        <span style={{ position: 'absolute', top: 7, right: 8, minWidth: 9, height: 9, borderRadius: '50%', background: SPROUT.green, border: `2px solid ${SPROUT.bg}` }}/>
      )}
    </button>
  );
}

Object.assign(window, { InboxScreen, InboxBell, INBOX_SEED });
