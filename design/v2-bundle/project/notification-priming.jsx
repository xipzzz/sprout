// ─────────────────────────────────────────────────────────────
// Notification priming — the soft screen shown AFTER the first lesson,
// BEFORE the iOS system permission dialog. Wins the one-shot opt-in with
// a real notification preview + calm, non-guilty Pip copy. Calm-mode default
// means Sprout owns "the calmest reminders in the category."
// English-only. Reuses Pip + garden art.
// ─────────────────────────────────────────────────────────────

// A rotating set of on-brand Pip notification lines — varied, never robotic.
// Tagged by type so timing logic can pick the right one (skip if practiced today).
const PIP_NOTIFS = [
  { tag: 'thirsty',   icon: '🌱', title: 'Sprout', body: 'Your garden\u2019s a little thirsty — 2 minutes keeps it growing.' },
  { tag: 'bloom',     icon: '🌸', title: 'Sprout', body: 'A bloom\u2019s about to open! Finish today\u2019s lesson to see it.' },
  { tag: 'friend',    icon: '👋', title: 'Sprout', body: 'Maya just practiced — want to grow together today?' },
  { tag: 'milestone', icon: '🔥', title: 'Sprout', body: 'You\u2019re 1 day from a 30-day garden. So close!' },
  { tag: 'winback',   icon: '🥀', title: 'Sprout', body: 'Your garden misses you. A little water brings it back. 🌱' },
];

// A faithful iOS lock-screen notification card — makes the opt-in concrete.
function NotifPreview({ data }) {
  return (
    <div style={{
      width: '100%', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
      borderRadius: 18, padding: '11px 13px', display: 'flex', alignItems: 'flex-start', gap: 11,
      boxShadow: '0 8px 24px rgba(40,60,50,0.16)', border: '1px solid rgba(255,255,255,0.6)',
    }}>
      <div style={{ width: 38, height: 38, borderRadius: 9, background: SPROUT.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.12)' }}>
        <span style={{ fontSize: 21 }}>{data.icon}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 13, fontWeight: 900, color: '#1B1B1B', textTransform: 'uppercase', letterSpacing: 0.3 }}>{data.title}</span>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: '#7A7A7A' }}>now</span>
        </div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#2A2A2A', lineHeight: 1.32, marginTop: 1 }}>{data.body}</div>
      </div>
    </div>
  );
}

function NotificationPriming({ calm = true, onAllow, onLater }) {
  // cycle the preview through the rotating lines so the user sees the variety
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % PIP_NOTIFS.length), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', fontFamily: '"Nunito", system-ui', color: SPROUT.ink,
      background: 'linear-gradient(180deg, #DCEBF7 0%, #EAF3E2 45%, ' + (calm ? '#F1F6EC' : SPROUT.bg) + ' 100%)' }}>

      {/* lock-screen-ish preview area */}
      <div style={{ paddingTop: 74, paddingLeft: 22, paddingRight: 22 }}>
        <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 800, color: '#5E7088', letterSpacing: 0.4, marginBottom: 12 }}>9:41</div>
        <div style={{ position: 'relative', minHeight: 64 }}>
          {PIP_NOTIFS.map((n, i) => (
            <div key={n.tag} style={{
              position: i === idx ? 'relative' : 'absolute', inset: i === idx ? 'auto' : 0,
              opacity: i === idx ? 1 : 0, transform: i === idx ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity .5s, transform .5s', pointerEvents: 'none',
            }}>
              <NotifPreview data={n} />
            </div>
          ))}
        </div>
        {/* dots showing the rotation */}
        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginTop: 12 }}>
          {PIP_NOTIFS.map((_, i) => (
            <span key={i} style={{ width: i === idx ? 16 : 6, height: 6, borderRadius: 999, background: i === idx ? SPROUT.green : 'rgba(90,110,90,0.3)', transition: 'all .3s' }}/>
          ))}
        </div>
      </div>

      {/* message + actions */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 22px 30px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <Pip size={88} mood="happy" wave={true} />
        </div>
        <div style={{ textAlign: 'center', fontSize: 23, fontWeight: 900, lineHeight: 1.18 }}>A tiny daily nudge?</div>
        <div style={{ textAlign: 'center', fontSize: 14.5, fontWeight: 700, color: SPROUT.mute, marginTop: 9, lineHeight: 1.45, maxWidth: 300, alignSelf: 'center' }}>
          No rush 🌱 — whenever you\u2019re ready, your garden\u2019s here. A gentle reminder so your streak and your blooms keep growing.
        </div>

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 11 }}>
          <PushButton size="lg" color={SPROUT.green} shadow={SPROUT.greenShadow} onClick={onAllow} style={{ width: '100%' }}>
            Turn on reminders
          </PushButton>
          <button onClick={onLater} style={{
            width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 15, fontWeight: 900, color: SPROUT.mute, padding: '10px 0', minHeight: 44,
          }}>Maybe later</button>
        </div>
        <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: SPROUT.mute, marginTop: 4, opacity: 0.85 }}>
          Adjust the time or turn it off anytime in Settings.
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { NotificationPriming, NotifPreview, PIP_NOTIFS });
