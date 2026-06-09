// ─────────────────────────────────────────────────────────────
// Social layer — nested inside the Me tab (opens via "Friends" row).
// Co-op "Grow Together" quest with a SHARED contribution bar + nudge,
// friends list with streaks, friends-leaderboard, friend profiles,
// and an invite affordance. All data mocked.
// ─────────────────────────────────────────────────────────────

const FRIENDS = [
  { id: 'jane', name: 'Jane', hue: '#A8D8EA', streak: 21, xp: 640, learning: 'Spanish', joined: 'Jan 2026' },
  { id: 'omar', name: 'Omar', hue: '#C9B8E3', streak: 9,  xp: 410, learning: 'French',  joined: 'Feb 2026' },
  { id: 'mei',  name: 'Mei',  hue: '#F5B94A', streak: 47, xp: 880, learning: 'English', joined: 'Nov 2025' },
  { id: 'theo', name: 'Theo', hue: '#F47A7A', streak: 4,  xp: 220, learning: 'German',  joined: 'Apr 2026' },
];

function Avatar({ name, hue, size = 42 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: hue, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.42, fontWeight: 900, color: '#fff',
    }}>{name[0]}</div>
  );
}

function FriendsScreen({ tweaks, onBack, onStartLesson }) {
  const [nudged, setNudged] = React.useState(false);
  const [profile, setProfile] = React.useState(null);
  const [copied, setCopied] = React.useState(false);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [cheers, setCheers] = React.useState({}); // activity-feed cheers by index
  const [profileCheered, setProfileCheered] = React.useState(false);
  const [giftFor, setGiftFor] = React.useState(null); // friend being gifted
  const firstTime = tweaks && tweaks.firstTime;

  // Supportive activity feed — what friends grew lately, each with a one-tap cheer.
  // Deliberately encouraging (no ranking) — the opposite register to the League.
  const activity = [
    { who: 'Mei', hue: '#F5B94A', icon: '🌸', text: 'grew a Rare Bloom', when: 'just now' },
    { who: 'Jane', hue: '#A8D8EA', icon: '🍃', text: 'kept her 21-day streak', when: '2h' },
    { who: 'Theo', hue: '#F47A7A', icon: '✅', text: 'finished the Café unit', when: '5h' },
    { who: 'Omar', hue: '#C9B8E3', icon: '🌱', text: 'planted his first Tree', when: 'Yesterday' },
  ];

  // Co-op quest: shared goal of 15 lessons, split between you + Jane.
  const youPart = 7, friendPart = 4, goal = 15;
  const total = youPart + friendPart;

  // Friends leaderboard (this week, by XP) with "you" injected.
  const board = [...FRIENDS.map((f) => ({ name: f.name, hue: f.hue, xp: f.xp, you: false })),
    { name: 'You', hue: SPROUT.green, xp: 520, you: true }]
    .sort((a, b) => b.xp - a.xp);

  // ── FIRST-TIME / EMPTY FRIENDS ───────────────────────────────
  // 0 friends: Pip waits with a warm invite + a plain "here's how co-op
  // works" — warmth instead of a blank list (Discord "you don't have
  // to though!" tone). Co-op is opt-in, never nagging.
  if (firstTime) {
    return (
      <div style={{ height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', background: SPROUT.bg, color: SPROUT.ink, fontFamily: '"Nunito", system-ui' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 14px 12px', flexShrink: 0 }}>
          <button onClick={onBack} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex', transform: 'scaleX(-1)' }}>
            <Icon.ChevR size={24} color={SPROUT.ink}/>
          </button>
          <div style={{ fontSize: 20, fontWeight: 900 }}>Friends</div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 24px', display: 'flex', flexDirection: 'column' }}>
          {/* Pip-led empty hero */}
          <div style={{ textAlign: 'center', padding: '20px 8px 8px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <Pip size={104} mood="happy" wave/>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: SPROUT.ink, letterSpacing: -0.3 }}>No garden buddies yet 🌱</div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: SPROUT.mute, marginTop: 8, lineHeight: 1.45, maxWidth: 300, margin: '8px auto 0' }}>
              Invite a friend to grow together — you'll cheer each other on. You don't have to, though; Sprout is just as lovely solo.
            </div>
          </div>

          {/* Primary invite */}
          <button onClick={() => setInviteOpen(true)} style={{
            margin: '20px 0 8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            background: SPROUT.green, color: '#fff', borderRadius: 15, padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: `0 4px 0 ${SPROUT.greenShadow}`,
          }}>
            <Icon.Users size={20} color="#fff"/>
            <span style={{ fontSize: 16, fontWeight: 900 }}>Invite a friend</span>
          </button>

          {/* How co-op works — gentle, Lex-style guidance */}
          <div style={{ marginTop: 16, background: SPROUT.paper, borderRadius: 18, border: `1px solid ${SPROUT.line}`, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, padding: '16px 16px 6px' }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>How growing together works</div>
            {[
              { emoji: '🌻', title: 'Share a quest', body: 'Team up on a goal like “15 lessons together.” Both your lessons fill one shared bar.' },
              { emoji: '👋', title: 'Send a friendly nudge', body: 'A gentle wave to remind a friend to tend their garden — never a guilt trip.' },
              { emoji: '🏆', title: 'A small weekly board', body: 'See your friends’ XP for the week. Friendly, not fierce — Calm mode hides it.' },
            ].map((row, i) => (
              <div key={row.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: SPROUT.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{row.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 900, color: SPROUT.ink }}>{row.title}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: SPROUT.mute, lineHeight: 1.4, marginTop: 2 }}>{row.body}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 800, color: SPROUT.mute, marginTop: 18 }}>
            Your friends will show up here once they join 🌿
          </div>
        </div>
        {inviteOpen && <InviteScreen onClose={() => setInviteOpen(false)} />}
      </div>
    );
  }

  return (
    <div style={{ height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', background: SPROUT.bg, color: SPROUT.ink, fontFamily: '"Nunito", system-ui' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 14px 12px', flexShrink: 0 }}>
        <button onClick={onBack} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex', transform: 'scaleX(-1)' }}>
          <Icon.ChevR size={24} color={SPROUT.ink}/>
        </button>
        <div style={{ fontSize: 20, fontWeight: 900 }}>Friends</div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 24px' }}>
        {/* Co-op quest with shared bar */}
        <SectionTitle>Grow together</SectionTitle>
        <div style={{
          background: 'linear-gradient(135deg, #EFF7EA, #E7F1FA)', borderRadius: 18, padding: 16, marginBottom: 22,
          border: `1px solid ${SPROUT.line}`, boxShadow: '0 3px 0 #D6E2D0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ display: 'flex' }}>
              <Avatar name="You" hue={SPROUT.green} size={38}/>
              <div style={{ marginLeft: -10 }}><Avatar name="Jane" hue="#A8D8EA" size={38}/></div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 900 }}>Friends quest</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>Complete 15 lessons together</div>
            </div>
            <span style={{ fontSize: 22 }}>🌻</span>
          </div>

          {/* Shared contribution bar */}
          <div style={{ height: 16, borderRadius: 9, background: SPROUT.paper, overflow: 'hidden', display: 'flex', border: `1px solid ${SPROUT.line}` }}>
            <div style={{ width: `${(youPart / goal) * 100}%`, height: '100%', background: SPROUT.green }}/>
            <div style={{ width: `${(friendPart / goal) * 100}%`, height: '100%', background: SPROUT.sky }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, fontWeight: 800 }}>
            <span style={{ color: SPROUT.greenDark }}>● You {youPart}</span>
            <span style={{ color: '#5B9CB8' }}>Jane {friendPart} ●</span>
            <span style={{ color: SPROUT.mute }}>{total} of {goal}</span>
          </div>

          <button onClick={() => setNudged(true)} disabled={nudged} style={{
            width: '100%', marginTop: 13, border: 'none', cursor: nudged ? 'default' : 'pointer', fontFamily: 'inherit',
            background: nudged ? SPROUT.cream2 : SPROUT.sun, color: nudged ? SPROUT.mute : '#5B3E07',
            fontSize: 14, fontWeight: 900, borderRadius: 12, padding: '11px 0',
            boxShadow: nudged ? 'none' : `0 3px 0 ${SPROUT.sunShadow}`,
          }}>{nudged ? 'Nudge sent to Jane 👋' : 'Nudge Jane'}</button>
        </div>

        {/* Friend activity feed — supportive, cheer-only (distinct from the League) */}
        <SectionTitle>Lately in your friends' gardens</SectionTitle>
        <div style={{ background: SPROUT.paper, borderRadius: 16, border: `1px solid ${SPROUT.line}`, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, overflow: 'hidden', marginBottom: 22 }}>
          {activity.map((a, i) => {
            const cheered = !!cheers[i];
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px', borderTop: i === 0 ? 'none' : `1px solid ${SPROUT.line}` }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Avatar name={a.who} hue={a.hue} size={38}/>
                  <span style={{ position: 'absolute', bottom: -3, right: -3, fontSize: 13, background: SPROUT.paper, borderRadius: 999, lineHeight: 1 }}>{a.icon}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: SPROUT.ink, lineHeight: 1.3 }}>
                    <span style={{ fontWeight: 900 }}>{a.who}</span> {a.text}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: SPROUT.mute }}>{a.when}</div>
                </div>
                <button onClick={() => setCheers((c) => ({ ...c, [i]: true }))} disabled={cheered} aria-label={`Cheer ${a.who}`} style={{
                  flexShrink: 0, border: cheered ? 'none' : `1.5px solid ${SPROUT.line}`, cursor: cheered ? 'default' : 'pointer', fontFamily: 'inherit',
                  background: cheered ? '#E3F5DB' : '#fff', color: cheered ? SPROUT.greenDark : SPROUT.ink,
                  borderRadius: 999, padding: '7px 12px', minHeight: 36, fontSize: 12.5, fontWeight: 900,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>{cheered ? '👏 Cheered' : '👏 Cheer'}</button>
              </div>
            );
          })}
        </div>

        {/* Friends leaderboard */}
        <SectionTitle>Friends this week</SectionTitle>
        <div style={{ background: SPROUT.paper, borderRadius: 16, border: `1px solid ${SPROUT.line}`, boxShadow: `0 2px 0 ${SPROUT.cardShadow}`, overflow: 'hidden', marginBottom: 22 }}>
          {board.map((r, i) => (
            <div key={r.name} style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px',
              borderTop: i === 0 ? 'none' : `1px solid ${SPROUT.line}`,
              background: r.you ? '#EFF7EA' : '#fff',
            }}>
              <span style={{ width: 18, fontSize: 14, fontWeight: 900, color: SPROUT.mute, textAlign: 'center' }}>{i + 1}</span>
              <Avatar name={r.name} hue={r.hue} size={34}/>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 800 }}>
                {r.name}{r.you && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 900, color: SPROUT.greenDark, background: '#DCEFD2', padding: '2px 6px', borderRadius: 6, letterSpacing: 0.5 }}>YOU</span>}
              </span>
              <span style={{ fontSize: 14, fontWeight: 900, color: SPROUT.greenDark, fontVariantNumeric: 'tabular-nums' }}>{r.xp}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: SPROUT.mute }}>XP</span>
            </div>
          ))}
        </div>

        {/* Friend list */}
        <SectionTitle>Following</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
          {FRIENDS.map((f) => (
            <button key={f.id} onClick={() => { setProfile(f); setProfileCheered(false); }} style={{
              width: '100%', textAlign: 'left', border: `1px solid ${SPROUT.line}`, cursor: 'pointer', fontFamily: 'inherit',
              background: SPROUT.paper, borderRadius: 14, padding: '11px 13px', boxShadow: `0 2px 0 ${SPROUT.cardShadow}`,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <Avatar name={f.name} hue={f.hue}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 900 }}>{f.name}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>Learning {f.learning}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon.Flame size={17} color={SPROUT.coral}/>
                <span style={{ fontSize: 14, fontWeight: 900, color: SPROUT.coral }}>{f.streak}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Invite */}
        <button onClick={() => setInviteOpen(true)} style={{
          width: '100%', border: `1.5px dashed ${SPROUT.green}`, cursor: 'pointer', fontFamily: 'inherit',
          background: '#EFF7EA', borderRadius: 14, padding: '14px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: SPROUT.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon.Users size={22} color="#fff"/>
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: SPROUT.greenDark }}>Invite friends</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>You both grow a Rare Bloom 🌸</div>
          </div>
        </button>
      </div>

      {/* Friend profile overlay */}
      {profile && (
        <div onClick={() => setProfile(null)} style={{
          position: 'absolute', inset: 0, background: 'rgba(42,35,32,0.45)', zIndex: 30,
          display: 'flex', alignItems: 'flex-end',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: '100%', background: SPROUT.bg, borderRadius: '22px 22px 0 0', padding: '20px 18px 30px',
            animation: 'frSheet .3s cubic-bezier(.2,.8,.2,1) both',
          }}>
            <style>{`@keyframes frSheet { from{transform:translateY(100%)} to{transform:translateY(0)} }`}</style>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: SPROUT.cream2, margin: '0 auto 18px' }}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <Avatar name={profile.name} hue={profile.hue} size={64}/>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>{profile.name}'s garden</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: SPROUT.mute }}>Learning {profile.learning} · joined {profile.joined}</div>
              </div>
            </div>

            {/* Visit & admire their garden — Sprout's most visual social asset */}
            <div style={{ borderRadius: 18, overflow: 'hidden', border: `1px solid ${SPROUT.line}`, marginBottom: 14, background: 'linear-gradient(180deg, #DCEFF8 0%, #E9F4DF 100%)' }}>
              <div style={{ height: 120, background: 'linear-gradient(180deg, #CFE9F5, #E4F2D8)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10, padding: '0 14px 6px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 10, right: 14, fontSize: 22 }}>{['☀️', '🌤️', '🌙'][profile.streak % 3]}</div>
                <MilestonePlant tier="tree" size={84}/>
                <div style={{ alignSelf: 'flex-end' }}><MilestonePlant tier="bush" size={58}/></div>
                <div style={{ alignSelf: 'flex-end' }}><BloomFlower level={4} color={profile.hue} size={42}/></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: SPROUT.paper }}>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: SPROUT.mute }}>🌱 {Math.round(profile.xp / 12)} plants grown</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[profile.hue, SPROUT.sun, SPROUT.green].map((c, k) => <BloomFlower key={k} level={3} color={c} size={22}/>)}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ background: SPROUT.paper, borderRadius: 14, padding: '12px 8px', border: `1px solid ${SPROUT.line}`, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: SPROUT.coral }}>{profile.streak}</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.5 }}>Day streak</div>
              </div>
              <div style={{ background: SPROUT.paper, borderRadius: 14, padding: '12px 8px', border: `1px solid ${SPROUT.line}`, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: SPROUT.greenDark }}>{profile.xp}</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: SPROUT.mute, textTransform: 'uppercase', letterSpacing: 0.5 }}>XP this week</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setProfileCheered(true)} disabled={profileCheered} style={{
                flex: 1, border: 'none', cursor: profileCheered ? 'default' : 'pointer', fontFamily: 'inherit',
                background: profileCheered ? '#E3F5DB' : SPROUT.green, color: profileCheered ? SPROUT.greenDark : '#fff', fontSize: 14.5, fontWeight: 900,
                borderRadius: 14, padding: '13px 0', boxShadow: profileCheered ? 'none' : `0 3px 0 ${SPROUT.greenShadow}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              }}>{profileCheered ? `Watered 💧` : `💧 Water garden`}</button>
              <button onClick={() => setGiftFor(profile)} style={{
                flex: 1, border: `1.5px solid ${SPROUT.sun}`, cursor: 'pointer', fontFamily: 'inherit',
                background: '#FFF8E8', color: '#9A6A12', fontSize: 14.5, fontWeight: 900,
                borderRadius: 14, padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              }}>🎁 Send a gift</button>
            </div>
          </div>
        </div>
      )}
      {inviteOpen && <InviteScreen onClose={() => setInviteOpen(false)} />}
      {giftFor && <GiftSheet friend={giftFor} onClose={() => setGiftFor(null)} />}
    </div>
  );
}

// Send-a-gift flow — 3 steps (gift → note → sent), paid from YOUR earned gems.
// Gifts are garden-native: they touch the friend's garden (water / a planted seed /
// a rainy-day freeze) rather than an abstract boost. No real money — on-brand.
function GiftSheet({ friend, onClose }) {
  const [step, setStep] = React.useState('pick'); // 'pick' | 'note' | 'sent'
  const [pick, setPick] = React.useState(null);
  const [note, setNote] = React.useState('');
  const balance = 420;
  const gifts = [
    { id: 'water', icon: '🪣', title: 'Watering can', desc: 'Tops up their water', cost: 20, arrive: `tops up ${friend.name}'s water 💧` },
    { id: 'seed', icon: '🌰', title: 'A seed', desc: 'Grows a plant in their garden, from you', cost: 40, arrive: `grows a plant in ${friend.name}'s garden, labelled “a gift from you” 🌱` },
    { id: 'freeze', icon: '🧊', title: 'Rainy-day rest', desc: 'A streak freeze for a day off', cost: 30, arrive: `gives ${friend.name} a rainy-day rest ☔` },
  ];
  const sel = gifts.find((g) => g.id === pick);
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(42,35,32,0.5)', zIndex: 40, display: 'flex', alignItems: 'flex-end' }}>
      <style>{`@keyframes giftUp { from{transform:translateY(100%)} to{transform:translateY(0)} } @keyframes giftPop { 0%{transform:scale(.4);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }`}</style>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: SPROUT.bg, borderRadius: '22px 22px 0 0', padding: '16px 18px 28px', animation: 'giftUp .3s cubic-bezier(.2,.8,.2,1) both' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: SPROUT.cream2, margin: '0 auto 16px' }}/>

        {step === 'pick' && (
          <React.Fragment>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 19, fontWeight: 900 }}>Send {friend.name} a gift 🎁</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#2E8FB0', display: 'flex', alignItems: 'center', gap: 4 }}><Icon.Gem size={14} color="#5AB9D9"/>{balance}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 16 }}>
              {gifts.map((g) => {
                const on = pick === g.id;
                const afford = balance >= g.cost;
                return (
                  <button key={g.id} onClick={() => afford && setPick(g.id)} disabled={!afford} style={{
                    display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', fontFamily: 'inherit',
                    border: `2px solid ${on ? SPROUT.green : SPROUT.line}`, cursor: afford ? 'pointer' : 'default',
                    background: on ? '#EFF7EA' : '#fff', borderRadius: 15, padding: '12px 13px', opacity: afford ? 1 : 0.5,
                  }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: SPROUT.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 23, flexShrink: 0 }}>{g.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 900 }}>{g.title}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: SPROUT.mute }}>{g.desc}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 13, fontWeight: 900, color: '#2E8FB0', flexShrink: 0 }}><Icon.Gem size={13} color="#5AB9D9"/>{g.cost}</div>
                  </button>
                );
              })}
            </div>
            <PushButton size="lg" color={SPROUT.green} shadow={SPROUT.greenShadow} disabled={!pick} onClick={() => setStep('note')} style={{ width: '100%' }}>Next</PushButton>
            <button onClick={onClose} style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 900, color: SPROUT.mute, padding: '12px 0', minHeight: 44, marginTop: 4 }}>Maybe later</button>
          </React.Fragment>
        )}

        {step === 'note' && (
          <React.Fragment>
            <div style={{ fontSize: 19, fontWeight: 900, marginBottom: 4 }}>Add a note</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: SPROUT.mute, marginBottom: 14 }}>Optional — a little message for {friend.name}.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: SPROUT.paper, border: `1px solid ${SPROUT.line}`, borderRadius: 14, padding: '12px 13px', marginBottom: 14 }}>
              <span style={{ fontSize: 26 }}>{sel.icon}</span>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: SPROUT.ink }}>{sel.title}</div>
            </div>
            <textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 80))} placeholder="Keep growing! 🌱" rows={2} style={{
              width: '100%', border: `1.5px solid ${SPROUT.line}`, borderRadius: 14, padding: '12px 13px', fontFamily: 'inherit',
              fontSize: 14.5, fontWeight: 700, color: SPROUT.ink, resize: 'none', outline: 'none', marginBottom: 16,
            }}/>
            <PushButton size="lg" color={SPROUT.green} shadow={SPROUT.greenShadow} onClick={() => { setStep('sent'); if (typeof haptic === 'function') haptic('success'); }} style={{ width: '100%' }}>Send gift · {sel.cost} 💎</PushButton>
            <button onClick={() => setStep('pick')} style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 900, color: SPROUT.mute, padding: '12px 0', minHeight: 44, marginTop: 4 }}>Back</button>
          </React.Fragment>
        )}

        {step === 'sent' && (
          <div style={{ textAlign: 'center', padding: '8px 6px 0' }}>
            <div style={{ fontSize: 56, animation: 'giftPop .5s cubic-bezier(.3,1.5,.5,1) both' }}>{sel.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 900, marginTop: 10 }}>Gift on its way! 🎉</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: SPROUT.mute, marginTop: 8, lineHeight: 1.45, maxWidth: 290, margin: '8px auto 0' }}>
              Your {sel.title.toLowerCase()} {sel.arrive}{note ? ` — with “${note}”` : ''}.
            </div>
            <PushButton size="lg" color={SPROUT.green} shadow={SPROUT.greenShadow} onClick={onClose} style={{ width: '100%', marginTop: 22 }}>Lovely</PushButton>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { FriendsScreen, Avatar });
