# Sprout — Feature Roadmap

Plan for building the full app, using **`design/Sprout-Viewer.html`** as the visual source of truth.
Principles stay sacred: **calm** (light mode, no red / streak-guilt / demotion; wrong = warm clay), **English class — English only**, content-as-data, small reusable components, each phase shippable and phone-tested.

Legend: ✅ done · 🔨 in progress · ⬜ to build

---

## ✅ Done
- Project scaffold (Vite + React + TypeScript), GitHub, CI-clean builds
- Design tokens (calm palette, Nunito) extracted from the real design file
- **Home**: winding path + HUD (🍃 leaves / 💎 gems / 💧 water)
- **Course**: 5 sections × 7–8 units (English), section banners, golden-bloom milestones
- **Lesson flow**: Multiple Choice → feedback drawer (green / warm-clay, Meaning · In use · Tip) → Lesson Complete
- Mobile: page-scroll so browser chrome hides, no sideways pan; LAN/Tailscale preview

## 🔨 Phase 1 — Navigation + Garden
- Tab navigation (Learn · Garden · Words · Grove · Me) + lesson overlay
- **Garden**: current seedling, blooms grid (grown vs not), Monthly Blooms, tap-a-bloom
- Golden Bloom milestone screen

## ⬜ Phase 2 — Deeper lessons (English)
- Exercise types: Arrange Words · Match Pairs · Fill in the Blank · Tap/Type What You Hear (listening) · Speak Out Loud (mic; stub first)
- Real English content for more units; several exercises per lesson
- Daily-goal moment (a separate calm celebration, not stacked on Lesson Complete)

## ⬜ Phase 3 — Habit & social (calm)
- **Streak calendar**: vine of soft leaf dots; missed days neutral (no red); auto-freeze shown warmly ("a leaf kept your garden safe")
- **Grove**: cooperative shared garden, no ranks; opt-in leaderboard only (no demotion zone)
- Quests

## ⬜ Phase 4 — Economy · Words · Profile
- **Shop** (gems, water refills, bundles)
- **Words** (vocab hub)
- **Profile / Me** + Settings
- Modals: Out of Water, Offline

## ⬜ Phase 5 — Onboarding & accounts
- Splash → **try a lesson before signup** → "save your garden" → log in / sign up → welcome → reminder priming
- Parent self-ID + one calm reassurance screen (parent gate); notification priming (calm, non-guilt copy)

## ⬜ Phase 6 — Monetization (parents pay)
- Plans / paywall — calm, no pressure. Revisit the parked `feat/accounts-payments-lessons` work, rebuilt in **English**.

## ⬜ Phase 7 — Content
- Garden Tales (story content)

## ⬜ Phase 8 — Ship
- Deploy to a public host (so parents can actually use it), QA pass, accessibility (WCAG AA, VoiceOver, Dynamic Type), design-review polish

---

## Notes
- **Parked branch** `feat/accounts-payments-lessons`: an uncoordinated agent's accounts/payments/parent-gate + Spanish arrange/fill lessons. Unmerged. Revisit (in English) in Phase 6 — don't merge as-is.
- Each phase ships via its own branch → PR → squash-merge.
