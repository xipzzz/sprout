// ─────────────────────────────────────────────────────────────
// Account — "Save your garden" soft-gate shown AFTER the first lesson
// (Duolingo-style: create the account once there's progress worth saving).
// Continue with Google (primary) + Apple (iOS requirement) + email, with a
// Log in path. Calm-mode friendly. No real auth — buttons resolve the gate.
// ─────────────────────────────────────────────────────────────

// Brand glyphs (logos, kept simple). Google 4-color G + Apple silhouette.
function GoogleG({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.1-3.8 6.6-9.4 6.6-16.1z"/>
      <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.1 15.5 46 24 46z"/>
      <path fill="#FBBC05" d="M11.8 28.2c-.4-1.3-.7-2.7-.7-4.2s.2-2.9.7-4.2v-5.7H4.5C3 17.1 2.1 20.4 2.1 24s.9 6.9 2.4 9.9l7.3-5.7z"/>
      <path fill="#EA4335" d="M24 10.7c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.1 29.9 2 24 2 15.5 2 8.1 6.9 4.5 14.1l7.3 5.7c1.7-5.2 6.5-9.1 12.2-9.1z"/>
    </svg>
  );
}
function AppleLogo({ size = 20, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill={color} d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .7 1.1 1.6 2.3 2.7 2.2 1.1 0 1.5-.7 2.8-.7s1.7.7 2.8.7c1.2 0 1.9-1.1 2.6-2.1.8-1.2 1.2-2.3 1.2-2.4-.1 0-2.3-.9-2.3-3.5zM14.3 5.6c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.6.6-1.1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2z"/>
    </svg>
  );
}

// One provider button.
function AuthButton({ children, bg, color, border, onClick, icon }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', cursor: 'pointer', fontFamily: 'inherit',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 11,
      background: bg, color, border: border || 'none',
      fontSize: 16, fontWeight: 800, letterSpacing: 0.2,
      borderRadius: 14, padding: '14px 0', marginBottom: 11,
      boxShadow: bg === '#fff' ? '0 2px 0 #E2DAC9' : '0 3px 0 rgba(0,0,0,0.18)',
    }}>
      {icon}{children}
    </button>
  );
}

// The soft-gate sign-up screen.
function AccountGate({ calm = false, onAuthed, onLogin, onSkip }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: calm ? '#F1F6EC' : SPROUT.bg, display: 'flex', flexDirection: 'column', fontFamily: '"Nunito", system-ui' }}>
      <style>{`@keyframes agRise{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

      {/* skip — small, top-right (soft gate, not a wall) */}
      <div style={{ padding: '54px 18px 0', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
        <button onClick={onSkip} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 800, color: SPROUT.mute }}>Not now</button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 26px' }}>
        <div style={{ position: 'relative', animation: 'agRise .5s both' }}>
          <Pip size={120} mood="proud"/>
        </div>
        <div style={{ fontSize: 25, fontWeight: 900, color: SPROUT.ink, marginTop: 14, animation: 'agRise .5s .08s both' }}>Save your garden</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: SPROUT.mute, marginTop: 8, maxWidth: 290, lineHeight: 1.4, animation: 'agRise .5s .14s both' }}>
          You've already grown your first sprout. Create a free account so Pip can keep it — don't let your garden wilt. 🌱
        </div>

        {/* Loss-framing: show exactly what they'd lose — the plant + day-1 streak. */}
        <div style={{
          display: 'flex', gap: 10, marginTop: 18, animation: 'agRise .5s .18s both',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14, padding: '10px 13px 10px 11px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}` }}>
            <BloomFlower level={2} color={SPROUT.green} size={30}/>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: SPROUT.ink, lineHeight: 1 }}>1 plant</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: SPROUT.mute }}>grown today</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14, padding: '10px 13px 10px 11px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}` }}>
            <span style={{ fontSize: 24 }}>🔥</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: SPROUT.ink, lineHeight: 1 }}>Day 1</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: SPROUT.mute }}>streak started</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ flexShrink: 0, padding: '8px 22px 26px', animation: 'agRise .5s .2s both' }}>
        <AuthButton bg="#fff" color="#3C4043" border={`1px solid ${SPROUT.line}`} icon={<GoogleG size={20}/>} onClick={onAuthed}>Continue with Google</AuthButton>
        <AuthButton bg="#111" color="#fff" icon={<AppleLogo size={20}/>} onClick={onAuthed}>Continue with Apple</AuthButton>
        <AuthButton bg={SPROUT.green} color="#fff" icon={<Icon.Mail size={19} color="#fff"/>} onClick={onAuthed}>Sign up with email</AuthButton>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 14, fontWeight: 700, color: SPROUT.mute }}>
          Already have an account?{' '}
          <button onClick={onLogin} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 900, color: SPROUT.greenDark, padding: 0 }}>Log in</button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, fontWeight: 700, color: SPROUT.mute, opacity: 0.85 }}>
          Free forever · we'll never post anything
        </div>
      </div>
    </div>
  );
}

// The log-in screen (reached from the gate or the welcome screen).
function LogIn({ calm = false, onAuthed, onBack }) {
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: calm ? '#F1F6EC' : SPROUT.bg, display: 'flex', flexDirection: 'column', fontFamily: '"Nunito", system-ui' }}>
      <div style={{ padding: '54px 16px 6px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button onClick={onBack} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex', transform: 'scaleX(-1)' }}>
          <Icon.ChevR size={24} color={SPROUT.mute}/>
        </button>
        <div style={{ fontSize: 18, fontWeight: 900, color: SPROUT.ink }}>Welcome back</div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 0', display: 'flex', flexDirection: 'column' }}>
        <AuthButton bg="#fff" color="#3C4043" border={`1px solid ${SPROUT.line}`} icon={<GoogleG size={20}/>} onClick={onAuthed}>Continue with Google</AuthButton>
        <AuthButton bg="#111" color="#fff" icon={<AppleLogo size={20}/>} onClick={onAuthed}>Continue with Apple</AuthButton>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0 16px' }}>
          <div style={{ flex: 1, height: 1, background: SPROUT.line }}/>
          <div style={{ fontSize: 12, fontWeight: 800, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.6 }}>or</div>
          <div style={{ flex: 1, height: 1, background: SPROUT.line }}/>
        </div>

        <Field label="Email" value={email} onChange={setEmail} placeholder="you@email.com" type="email"/>
        <Field label="Password" value={pw} onChange={setPw} placeholder="••••••••" type="password"/>
        <button style={{ alignSelf: 'flex-end', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, color: SPROUT.greenDark, padding: '2px 0 0' }}>Forgot password?</button>
      </div>

      <div style={{ flexShrink: 0, padding: '12px 22px 30px' }}>
        <button onClick={onAuthed} style={{
          width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          background: SPROUT.green, color: '#fff', fontSize: 17, fontWeight: 900,
          letterSpacing: 0.4, textTransform: 'uppercase', borderRadius: 16, padding: '15px 0',
          boxShadow: `0 4px 0 ${SPROUT.greenShadow}`,
        }}>Log in</button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>{label}</div>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box', fontFamily: 'inherit',
          background: SPROUT.paper, border: `2px solid ${SPROUT.line}`, borderRadius: 13,
          padding: '13px 14px', fontSize: 16, fontWeight: 700, color: SPROUT.ink, outline: 'none',
        }}
      />
    </label>
  );
}

Object.assign(window, { AccountGate, LogIn, GoogleG, AppleLogo });
