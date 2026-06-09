// ─────────────────────────────────────────────────────────────
// Invite a friend / referral — a calm, on-brand growth loop.
//  • Double-sided EARNED reward (Rare Bloom + 50 💧), no cash / no IAP
//  • Invite code + share + tap-to-copy "Copied! ✓" + invite contacts
//  • Co-op on-ramp + a gentle "1 joined → invite 2 more for a Golden Seed" ladder
//  • A warm "[Name] invited you to grow a garden" landing screen
// English-only. Reuses Pip + BloomFlower + Avatar.
// ─────────────────────────────────────────────────────────────

// Two little gardens side by side — the mutual-reward hero illustration.
function TwoGardens({ size = 150 }) {
  return (
    <div style={{ position: 'relative', width: size * 1.5, height: size * 0.78, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: size * 0.16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <MilestonePlant tier="bush" size={size * 0.5}/>
        <Pip size={size * 0.3} mood="happy"/>
      </div>
      {/* connecting hearts/leaves */}
      <div style={{ position: 'absolute', top: size * 0.1, left: '50%', transform: 'translateX(-50%)', fontSize: size * 0.16 }}>🌿</div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <MilestonePlant tier="sprout" size={size * 0.42}/>
        <Avatar name="Friend" hue={SPROUT.sky} size={size * 0.28}/>
      </div>
    </div>
  );
}

function InviteScreen({ onClose }) {
  const code = 'PIP-GROW-7K2';
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    try { navigator.clipboard && navigator.clipboard.writeText('sprout.app/i/' + code); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const invited = [
    { name: 'Maya', hue: '#A8D8EA', state: 'joined' },
    { name: 'Leo', hue: '#F5C23D', state: 'pending' },
  ];
  const joinedCount = invited.filter((i) => i.state === 'joined').length;

  return (
    <div style={{ position: 'absolute', inset: 0, background: SPROUT.bg, display: 'flex', flexDirection: 'column', fontFamily: '"Nunito", system-ui', color: SPROUT.ink, overflow: 'auto' }}>
      {/* header */}
      <div style={{ padding: '56px 16px 8px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {onClose && (
          <button onClick={onClose} aria-label="Back" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, marginLeft: -4, minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center' }}>
            <Icon.ChevL size={24} color={SPROUT.ink}/>
          </button>
        )}
        <div style={{ fontSize: 20, fontWeight: 900 }}>Invite a friend</div>
      </div>

      <div style={{ padding: '6px 18px 28px' }}>
        {/* hero: mutual reward */}
        <div style={{ background: 'linear-gradient(165deg, #EAF4FB, #EAF6E2)', borderRadius: 22, padding: '20px 16px 18px', textAlign: 'center', border: `1px solid ${SPROUT.line}`, marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <TwoGardens size={140}/>
          </div>
          <div style={{ fontSize: 21, fontWeight: 900, lineHeight: 1.2 }}>You both grow a Rare Bloom 🌸</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: SPROUT.mute, marginTop: 6, lineHeight: 1.4 }}>
            When a friend joins and finishes their first lesson, you each get a Rare Bloom <strong style={{ color: SPROUT.greenDark }}>+ 50 💧</strong>. No cash, ever — just more garden.
          </div>
        </div>

        {/* code + copy */}
        <div style={{ display: 'flex', gap: 9, marginBottom: 11 }}>
          <div style={{ flex: 1, background: SPROUT.paper, border: `2px dashed ${SPROUT.line}`, borderRadius: 14, padding: '13px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: 1, color: SPROUT.greenDark }}>{code}</span>
            <button onClick={copy} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 900, color: copied ? SPROUT.greenDark : SPROUT.mute, display: 'flex', alignItems: 'center', gap: 4 }}>
              {copied ? '✓ Copied' : '⧉ Copy'}
            </button>
          </div>
        </div>

        {/* share + contacts */}
        <PushButton size="lg" color={SPROUT.green} shadow={SPROUT.greenShadow} onClick={() => {}} style={{ width: '100%', marginBottom: 9 }}>
          Share invite link
        </PushButton>
        <button onClick={() => {}} style={{
          width: '100%', border: `1.5px solid ${SPROUT.line}`, background: SPROUT.paper, cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 15, fontWeight: 900, color: SPROUT.ink, borderRadius: 16, padding: '13px 0', minHeight: 44,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 22,
        }}>
          <span style={{ fontSize: 17 }}>👥</span> Invite contacts
        </button>

        {/* co-op on-ramp + gentle ladder */}
        <div style={{ background: SPROUT.paper, borderRadius: 18, border: `1px solid ${SPROUT.line}`, padding: 16, boxShadow: `0 2px 0 ${SPROUT.cardShadow}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 19 }}>🌱</span>
            <div style={{ fontSize: 15, fontWeight: 900 }}>{joinedCount} friend joined</div>
            <div style={{ flex: 1 }}/>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: SPROUT.mute }}>invite 2 more for a Golden Seed</div>
          </div>
          {/* ladder */}
          <div style={{ position: 'relative', height: 8, borderRadius: 5, background: SPROUT.cream2, marginBottom: 26 }}>
            <div style={{ position: 'absolute', inset: 0, width: `${(joinedCount / 3) * 100}%`, background: SPROUT.green, borderRadius: 5 }}/>
            {[1, 2, 3].map((n) => {
              const reached = joinedCount >= n;
              return (
                <div key={n} style={{ position: 'absolute', top: '50%', left: `${(n / 3) * 100}%`, transform: 'translate(-50%,-50%)' }}>
                  <div style={{ width: n === 3 ? 26 : 20, height: n === 3 ? 26 : 20, borderRadius: '50%', fontSize: n === 3 ? 14 : 11,
                    background: reached ? (n === 3 ? SPROUT.sun : '#EFF7EA') : '#fff', border: `2px solid ${reached ? (n === 3 ? SPROUT.sunShadow : SPROUT.green) : SPROUT.line}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n === 3 ? '🌟' : (reached ? '🌸' : '')}</div>
                  <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 4, fontSize: 9.5, fontWeight: 800, color: SPROUT.mute, whiteSpace: 'nowrap' }}>{n === 3 ? 'Golden Seed' : `${n}`}</div>
                </div>
              );
            })}
          </div>
          {/* who you invited */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {invited.map((f) => (
              <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={f.name} hue={f.hue} size={32}/>
                <span style={{ fontSize: 14, fontWeight: 800, flex: 1 }}>{f.name}</span>
                {f.state === 'joined'
                  ? <span style={{ fontSize: 11.5, fontWeight: 900, color: SPROUT.greenDark, background: '#E3F5DB', padding: '3px 10px', borderRadius: 999 }}>Joined 🌱</span>
                  : <span style={{ fontSize: 11.5, fontWeight: 900, color: SPROUT.mute, background: SPROUT.cream2, padding: '3px 10px', borderRadius: 999 }}>Invited</span>}
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 11.5, fontWeight: 700, color: SPROUT.mute, textAlign: 'center', marginTop: 14, lineHeight: 1.4 }}>
          Invites start a co-op quest together. Friendly nudges only — never spam. 🌿
        </div>
      </div>
    </div>
  );
}

// The warm "you've been invited" landing screen the shared link opens.
function InviteLanding({ inviter = 'Maya', onAccept, onClose }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', fontFamily: '"Nunito", system-ui', color: SPROUT.ink,
      background: 'linear-gradient(180deg, #CFE9F5 0%, #E3F1DA 50%, ' + SPROUT.bg + ' 100%)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 28px' }}>
        <TwoGardens size={150}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 12, background: 'rgba(255,255,255,0.6)', borderRadius: 999, padding: '6px 14px' }}>
          <Avatar name={inviter} hue="#A8D8EA" size={26}/>
          <span style={{ fontSize: 13.5, fontWeight: 800 }}>{inviter} invited you</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, marginTop: 16, lineHeight: 1.15 }}>Come grow a garden 🌱</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: SPROUT.mute, marginTop: 10, lineHeight: 1.45, maxWidth: 290 }}>
          Learn English a few minutes a day and grow a garden as you go. You and {inviter} both start with a <strong style={{ color: SPROUT.greenDark }}>Rare Bloom 🌸</strong>.
        </div>
      </div>
      <div style={{ padding: '0 22px 30px', display: 'flex', flexDirection: 'column', gap: 11 }}>
        <PushButton size="lg" color={SPROUT.green} shadow={SPROUT.greenShadow} onClick={onAccept} style={{ width: '100%' }}>
          Start growing — it's free
        </PushButton>
        <button onClick={onClose} style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 900, color: SPROUT.mute, padding: '10px 0', minHeight: 44 }}>
          Maybe later
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { InviteScreen, InviteLanding, TwoGardens });
