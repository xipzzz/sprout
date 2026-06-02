# Sprout — Feature Roadmap

Built from **`design/Sprout-Viewer.html`** (the 39-screen inventory) as the visual source of truth.
Principles stay sacred: **calm** (light mode, no red / streak-guilt / demotion; wrong = warm clay), **English only**, content-as-data, small reusable components, each feature shipped via branch → PR → squash-merge and phone-tested.

Legend: ✅ done · 🔨 partial · ⬜ to build

---

## ✅ Built so far (21 PRs, all green, live on the dev server)
- **Foundation** — Vite + React + TS, GitHub, exact design tokens (calm palette, Nunito)
- **Onboarding** — branded Launch Splash (shown once) ✅ · *Welcome / Save-your-garden / Log in / Reminder priming / parent gate* ⬜
- **Home** — winding path, HUD (🍃/💎/💧 — gems→Shop, water→sheet), **5 sections × 7–8 units**, real **progression** (units unlock + persist)
- **Lessons** — **4 exercise types**: Multiple Choice · Arrange Words · Match Pairs · Fill in the Blank → warm feedback drawer (green / clay · Meaning · In use · Tip · working Flag) → Lesson Complete · **Daily-goal** celebration · **per-unit content** (Hello / Around the Home / Family / Colors / Animals) with a gentle fallback so every unit is playable
- **Garden** — seedling (Pip) + Monthly Blooms grid
- **Words** — vocab hub
- **Grove** — cooperative shared garden (no ranks; opt-in leaderboard noted)
- **Me** — profile, stat tiles, links · **Customize Pip** (accessories) · **Invite a friend** (share sheet)
- **Streak calendar** — calm leaf-dot grid; auto-freeze shown warmly
- **Shop** — gem-priced extras (gems never required)
- **Modals** — Water sheet, Offline notice (reusable Modal)
- **Quests** — gentle goals with progress + rewards
- **Mobile** — page-scroll (browser chrome hides), no sideways pan, LAN/Tailscale preview

## ⬜ Remaining — buildable
- **Golden Bloom** milestone moment
- **Today Card** (home variant); **Garden depth** (Monthly Blooms detail / Year in Bloom)
- **Garden Tales** (story content) · Insights · Search

## ⬜ Remaining — needs your input / integration
- **Audio exercises** (Type / Speak What You Hear) — needs text-to-speech + microphone
- **Accounts + payments** (Save your garden, Log in, Plans/paywall) — needs a backend + payment provider; the parked `feat/accounts-payments-lessons` branch has a Spanish draft to revisit (in English)
- **Deploy** — one decision from you: make the repo public (free GitHub Pages) or a free Vercel/Netlify token (private). Build is ready.

---

## Notes
- **Parked branch** `feat/accounts-payments-lessons`: an uncoordinated agent's accounts/payments/parent-gate + Spanish lessons. Unmerged — revisit in English; don't merge as-is.
- Design screens don't render in a headless browser, so fidelity comes from the exact tokens + the documented inventory + on-device review.
