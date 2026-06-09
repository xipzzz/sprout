// Out-of-water modal — shown when the user runs out of water (previously "hearts").
// Offers: (1) upgrade to Sprout Plus (unlimited water), (2) practice to earn water back,
// (3) wait for refill, or (4) use a water refill item.

function OutOfWaterModal({ variant = 'standard', onClose, level = 0 }) {
  // variant: 'standard' | 'calm' — calm mode reframes as "Pip needs rest"
  const calm = variant === 'calm';
  const empty = level === 0;

  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end',
      background: 'rgba(20, 30, 40, 0.5)',
      fontFamily: '"Nunito", system-ui',
      animation: 'owFade 200ms ease both',
    }}>
      <style>{`
        @keyframes owFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes owSlide { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes owDrip { 0% { transform: translateY(-4px); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(32px); opacity: 0; } }
        @keyframes owGlassShake { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-3deg); } 75% { transform: rotate(3deg); } }
        @keyframes owShimmer { 0%,100% { opacity: 0.3; } 50% { opacity: 0.6; } }
      `}</style>

      <div style={{
        width: '100%', background: SPROUT.bg,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '22px 20px 28px',
        animation: 'owSlide 320ms cubic-bezier(.2,.8,.2,1) both',
        position: 'relative',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.15)',
      }}>
        {/* drag handle */}
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: SPROUT.line,
          margin: '0 auto 12px',
        }}/>

        {/* close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14,
          border: 'none', background: 'transparent',
          fontSize: 22, color: SPROUT.mute, cursor: 'pointer',
          width: 32, height: 32, borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          lineHeight: 1,
        }}>×</button>

        {/* Hero: gauge + Pip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginTop: 4, marginBottom: 14, minHeight: 96, position: 'relative' }}>
          <Pip size={84} mood={empty ? 'neutral' : 'happy'}/>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <WaterGauge level={level} max={5} size={52} plus={false} showNumber={false}/>
            <div style={{ fontSize: 11, fontWeight: 800, color: empty ? '#C85555' : '#2B8FAF', textTransform: 'uppercase', letterSpacing: 1 }}>{empty ? 'Empty' : `${level} of 5`}</div>
          </div>
        </div>

        {/* Title + subtitle */}
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: SPROUT.ink, letterSpacing: -0.3 }}>
            {empty
              ? (calm ? 'Pip needs a rest' : 'You ran out of water!')
              : (calm ? 'Pip\u2019s water' : 'Your water')}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: SPROUT.mute, marginTop: 4, lineHeight: 1.4 }}>
            {empty
              ? (calm
                ? 'Take a breath. Come back when you\'re ready — no pressure.'
                : 'Refill to keep learning, or earn water back with practice.')
              : 'Refills as you learn (+1 per lesson). Go Plus for unlimited water.'}
          </div>
        </div>

        {/* Regen reassurance — recovery is always coming, so low/empty never feels permanent */}
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            margin: '0 auto 16px', padding: '9px 14px', borderRadius: 12, maxWidth: 320,
            background: empty ? '#FDECEC' : '#EAF4FA',
            border: `1px solid ${empty ? '#F2C9C9' : '#CDE6F0'}`,
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{calm ? '🌙' : '💧'}</span>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: empty ? '#9B3333' : '#1F5F7A', lineHeight: 1.3, textAlign: 'center' }}>
              {calm
                ? 'Your water returns gently — rest as long as you like.'
                : <>Next drop in <span style={{ color: empty ? '#C85555' : '#2E8FB0' }}>2h 15m</span> · or earn 1 per lesson</>}
            </div>
          </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
          {/* Primary: Sprout Plus — paywall */}
          <OptionCard
            gradient={`linear-gradient(135deg, ${SPROUT.sun} 0%, #EDA635 100%)`}
            icon={<svg width="32" height="32" viewBox="0 0 32 32"><path d="M16 3l3.7 7.4 8.3 1.2-6 5.8 1.4 8.2L16 21.8 8.6 25.6 10 17.4 4 11.6l8.3-1.2L16 3z" fill="#fff"/></svg>}
            title="Get Sprout Plus"
            subtitle="Unlimited water · Free 14-day trial"
            badge="BEST"
            accent="#fff"
            textColor="#fff"
            titleSize={16}
          />

          {/* Practice to earn water */}
          <OptionCard
            bg="#fff"
            border={`1.5px solid ${SPROUT.line}`}
            icon={
              <div style={{ position: 'relative', width: 36, height: 36 }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: 10, background: '#E3F5DB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.WaterGlass size={22} color={SPROUT.sky}/>
                </div>
                <div style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: SPROUT.green, color: '#fff', fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>+1</div>
              </div>
            }
            title="Earn water"
            subtitle="Review past lesson · 5 questions"
            chevron
            titleColor={SPROUT.ink}
            subtitleColor={SPROUT.mute}
          />

          {/* Use a refill (from inventory) */}
          <OptionCard
            bg="#fff"
            border={`1.5px solid ${SPROUT.line}`}
            icon={
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#E8F4FA', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <Icon.WaterGlass size={22} color={SPROUT.sky}/>
                <div style={{ position: 'absolute', top: -4, right: -4, background: SPROUT.sun, color: '#fff', fontSize: 10, fontWeight: 900, borderRadius: 6, padding: '0 4px', border: '2px solid #fff' }}>×2</div>
              </div>
            }
            title="Use Watering Can"
            subtitle="Full refill · 2 in inventory"
            chevron
            titleColor={SPROUT.ink}
            subtitleColor={SPROUT.mute}
          />
        </div>

        {/* Timer: next free refill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', background: 'rgba(168,216,234,0.25)',
          borderRadius: 12, marginBottom: 16,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: SPROUT.sky, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 6v6l4 2M12 22a10 10 0 100-20 10 10 0 000 20z" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div style={{ flex: 1, fontSize: 12, fontWeight: 700, color: '#2D6880' }}>
            Next free refill in <b>1h 48m</b>
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#2D6880', opacity: 0.6, letterSpacing: 0.5 }}>AUTO</div>
        </div>

        {/* Free path — continue without refilling */}
        <button onClick={onClose} style={{
          width: '100%', border: `2px solid ${SPROUT.line}`, background: SPROUT.paper,
          padding: '12px 0', fontWeight: 800, fontSize: 14, borderRadius: 12,
          color: SPROUT.greenDark, letterSpacing: 0.3,
          cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          {calm ? 'Come back later' : 'Continue slowly'}
          <span style={{ fontSize: 11, fontWeight: 800, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.5 }}>· free</span>
        </button>
      </div>
    </div>
  );
}

// Row-style option card used inside the modal
function OptionCard({ bg, gradient, border, icon, title, subtitle, badge, chevron, titleColor = SPROUT.ink, subtitleColor = SPROUT.mute, textColor, accent, titleSize = 15 }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      background: gradient || bg,
      border: border || 'none',
      borderRadius: 14,
      position: 'relative',
      cursor: 'pointer',
      boxShadow: gradient ? '0 3px 0 rgba(0,0,0,0.1)' : 'none',
    }}>
      <div style={{ flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: titleSize, fontWeight: 800, color: textColor || titleColor, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{title}</div>
          {badge && (
            <span style={{
              fontSize: 9, fontWeight: 900, letterSpacing: 0.5,
              padding: '2px 6px', borderRadius: 6,
              background: 'rgba(255,255,255,0.25)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.4)',
              flexShrink: 0,
            }}>{badge}</span>
          )}
        </div>
        {subtitle && (
          <div style={{ fontSize: 12, fontWeight: 700, color: textColor ? 'rgba(255,255,255,0.85)' : subtitleColor, marginTop: 3, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {subtitle}
          </div>
        )}
      </div>
      {chevron && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <path d="M9 6l6 6-6 6" stroke={SPROUT.mute} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {textColor === '#fff' && !chevron && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <path d="M9 6l6 6-6 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );
}

// Demo: exercise behind the modal, showing full context
function ExWithOutOfWater({ variant = 'standard' }) {
  const [open, setOpen] = React.useState(true);

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      {/* Faded exercise behind */}
      <ExerciseShell
        prompt={'Which one is "the cat"?'}
        progress={0.55}
        hearts={0}
        footer={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button style={{ border: 'none', background: 'transparent', fontWeight: 800, fontSize: 13, color: SPROUT.mute, padding: '0 6px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5 }}>Skip</button>
            <div style={{ flex: 1 }}/>
            <PushButton size="lg" color={SPROUT.green} shadow={SPROUT.greenShadow}>Check</PushButton>
          </div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'a dog', glyph: '🐕' },
            { label: 'a cat', glyph: '🐈' },
            { label: 'a bird', glyph: '🐦' },
            { label: 'a fish', glyph: '🐟' },
          ].map((o, i) => (
            <div key={i} style={{
              background: SPROUT.paper, borderRadius: 16,
              boxShadow: `0 0 0 1px ${SPROUT.line}, 0 3px 0 ${SPROUT.cardShadow}`,
              padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}>
              <div style={{ width: 72, height: 72, borderRadius: 14, background: SPROUT.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>{o.glyph}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 6, fontWeight: 900, fontSize: 12,
                  background: SPROUT.paper, border: `1.5px solid ${SPROUT.line}`, color: SPROUT.mute,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{i + 1}</div>
                <div style={{ fontWeight: 800, fontSize: 15, color: SPROUT.ink }}>{o.label}</div>
              </div>
            </div>
          ))}
        </div>
      </ExerciseShell>

      {open && <OutOfWaterModal variant={variant} onClose={() => setOpen(false)}/>}
    </div>
  );
}

Object.assign(window, { OutOfWaterModal, ExWithOutOfWater });
