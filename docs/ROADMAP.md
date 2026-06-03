# Sprout — Feature Roadmap

Built from **`design/Sprout-Viewer.html`** (the 39-screen inventory) as the visual source of truth.
Principles stay sacred: **calm** (light mode, no red / streak-guilt / demotion; wrong = warm clay), **English only**, content-as-data, small reusable components, each feature shipped via branch → PR → squash-merge and phone-tested.

Legend: ✅ done · 🔨 partial · ⬜ to build

---

## ✅ Built so far (21 PRs, all green, live on the dev server)
- **Foundation** — Vite + React + TS, GitHub, exact design tokens (calm palette, Nunito)
- **Onboarding** — branded Launch Splash (shown once) ✅ · *Welcome / Save-your-garden / Log in / Reminder priming / parent gate* ⬜
- **Home** — winding path, HUD (🍃/💎/💧 — gems→Shop, water→sheet), **5 sections × 7–8 units**, real **progression** (units unlock + persist) · **Today Card** (calm pointer to the next lesson)
- **Lessons** — **4 exercise types**: Multiple Choice · Arrange Words · Match Pairs · Fill in the Blank → warm feedback drawer (green / clay · Meaning · In use · Tip · working Flag) → Lesson Complete · **Daily-goal** celebration · **per-unit content** (all of Section 1 authored: Hello / Around the Home / Family / Colors / Numbers / Food / Animals) with a gentle fallback so every other unit is playable too · **Sections 1–2 fully authored** (15 units, choice/arrange/match/fill) — 60 words now · **Golden Bloom** milestone when a whole section is finished
- **Garden** — seedling (Pip) · Monthly Blooms (one per section, tied to real progress) · **Year in Bloom** (calm yearly overview) · **Garden Tales** (3-story reader + Tale Complete)
- **Words** — vocab hub (vocabulary derived from the real lessons) · **Search** (filter as you type)
- **Grove** — cooperative shared garden (no ranks; opt-in leaderboard noted)
- **Me** — profile, stat tiles, links · **Customize Pip** (accessories) · **Invite a friend** (share sheet) · **Insights** (calm progress + weekly chart) · **Settings** (calm prefs + start-over)
- **Streak calendar** — calm leaf-dot grid; auto-freeze shown warmly
- **Shop** — gem-priced extras (gems never required)
- **Modals** — Water sheet, Offline notice (reusable Modal)
- **Quests** — gentle goals with progress + rewards
- **Mobile** — page-scroll (browser chrome hides), no sideways pan, LAN/Tailscale preview

## ✅ Remaining — buildable
- _All buildable design screens are shipped._ 🎉 Remaining work needs your input (below).

## ⬜ Remaining — needs your input / integration
- **Audio exercises** — ✅ **Type what you hear** built (free built-in browser speech, woven into 3 Section-1 lessons); **Speak out loud** still needs a mic-permission decision
- **Accounts + payments** (Save your garden, Log in, Plans/paywall) — needs a backend + payment provider; the parked `feat/accounts-payments-lessons` branch has a Spanish draft to revisit (in English)
- **Deploy** — one decision from you: make the repo public (free GitHub Pages) or a free Vercel/Netlify token (private). Build is ready.

---

## Notes
- **Parked branch** `feat/accounts-payments-lessons`: an uncoordinated agent's accounts/payments/parent-gate + Spanish lessons. Unmerged — revisit in English; don't merge as-is.
- Design screens don't render in a headless browser, so fidelity comes from the exact tokens + the documented inventory + on-device review.
