# Design fidelity notes

**Source of truth:** [`design/Sprout-Viewer.html`](./Sprout-Viewer.html) — a self-contained
React/JSX design prototype (a "screen viewer"). The screens are coded components, not
images. Extract them with the unescape step below; they don't render in a headless iframe,
so fidelity comes from reading the code + the on-device review.

```bash
# dump the design's screen code + intent log to /tmp for reading
python3 - <<'PY'
import re; html=open('design/Sprout-Viewer.html',encoding='utf-8',errors='replace').read()
for a,b in [('\\u002F','/'),('\\n','\n'),('\\t','\t'),('\\"','"'),("\\'","'"),('\\\\','\\')]: html=html.replace(a,b)
open('/tmp/design-full.txt','w').write(html); print(len(html),'chars')
PY
grep -oE "summary: '[^']*'" /tmp/design-full.txt   # the design's own change/intent log
```

## Palette — matches `src/styles/tokens.css` ✅
ink `#2A2320` · bg `#F5F0E7` · surface `#FFFDF7` · green `#6FBF5E` · green-strong `#4D9E3F`
· gold `#F5C23D` · clay `#ff8a80` · water/sky `#5AA7C9`. (Design also references Duolingo
green `#58CC42` — used only as the viewer's own chrome, not the app.)

## Screen inventory (66 in the design) → build status
- **Built:** Launch splash · Winding path · Garden · Today card · Multiple choice · Arrange
  words · Type what you hear · Match pairs · Fill in blank · Correct/Wrong feedback · Daily
  goal met · Golden Bloom · Streak calendar · Shop · Out of water · Offline · Insights ·
  Monthly Blooms · Year in Bloom · Customize · Search · Invite a friend · Garden Tales ·
  Tale complete · Quests · Settings · Grove (calm league) · Lesson complete (basic)
- **Needs your input / backend:** Save your garden · Log in · Sprout Family (paywall) ·
  Grown-ups summary / parent dashboard · Speak out loud (mic)
- **Buildable, not yet:** Welcome flow (multi-step) · Reminder priming · Tap-what-you-hear
  (tile variant) · Match pairs · audio · Fill · type variant · Streak repair / saved /
  comeback · Streak milestones (7/30/100/365) · Golden Bloom gate/retry · Activity inbox ·
  iOS widgets · Loading screens (path/garden/Pip) · Practice offline · Lesson-complete tiers
- **Intentionally dropped (calm thesis):** competitive League w/ demotion (→ cooperative
  Grove) · Moonlit/dark mode (light only for now) · gambling "Garden Bet" / SAVE pressure

## Design intents already honored (from the viewer's update log)
wrong-answer = warm clay (not alarm red) + teach-the-miss + flag · MC **sky-tinted selection
+ ✓/✗ badges (color-blind-safe)** · calm streak (leaf dots, freeze shown kindly) · Home has
ONE start point (path node) · daily-goal celebration · tabular figures · light mode only ·
earned-gem economy w/ real money behind a parent gate · Garden living seedling hero.

## Known divergences to close next (fidelity backlog)
1. ✅ **Done** — Pip-led quit confirmation + segmented progress bar on the lesson chrome.
2. Path: active-node **pulsing halo** ✅ done · per-node **mastery petals** + dotted
   stepping-stone connectors within a unit — still open.
3. ✅ **Done** — Lesson Complete tiered headline + garden-tier chip (Lush / Healthy /
   Sprouting; kind at every level). Optional extra still open: an itemized seed ledger.
