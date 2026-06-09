# Sprout v2 Design — Implementation Backlog

Generated from `design/v2-bundle/` (Claude Design handoff, 2026-06-09).
Use this as the running todo list for v2 alignment.

## Phase 1 — Foundation
- [ ] **1.1 Color tokens** — refresh `tokens.css` to v2 palette
  - bg `#f5f0e7` → `#FDF8EE` (warmer cream)
  - surface `#fffdf7` → `#FFFFFF` (pure paper)
  - surface-2 `#f7f2e9` → `#F3E8D2`
  - gold `#f5c23d` → `#F5B94A` (deeper sun)
  - water `#5aa7c9` → `#5AB9D9`
  - clay `#ff8a80` → `#F47A7A`
  - NEW `--correct: #58A800` (darker green for "correct" feedback)
  - NEW `--lilac: #C9B8E3` (rare blooms)
- [ ] **1.2 Onboarding flow** — 3-step welcome with progress bar (currently single splash). See `project/onboarding.jsx`.
- [ ] **1.3 LessonComplete overhaul** — itemized ledger (Correct + Bonus separate), XP roll-up, dual-animation, calm variant. See `project/lesson-complete.jsx`.

## Phase 2 — Retention loop
- [ ] **2.1 Practice Hub** — weak-words, mistake review, listening/speaking drills (`practice.jsx`).
- [ ] **2.2 Words detail sheet** — IPA + audio + example + favorite; wilting plant visual (`words-detail.jsx`).
- [ ] **2.3 Insights period toggle + area chart** — week/month/all-time, gradient-fill (`insights.jsx`).

## Phase 3 — Social + monetization
- [ ] **3.1 Leagues** — weekly tiers Mist→Sunbeam→Rainbow→Aurora→Sky (`leagues.jsx`).
- [ ] **3.2 Friends** — co-op quests + friend list + profiles (`friends.jsx`).
- [ ] **3.3 Inbox** — activity hub (cheers, league results, bloom unlocks) (`inbox.jsx`).
- [ ] **3.4 Out-of-Water modal** — gentle shop prompt (`out-of-water.jsx`).

## Phase 4 — Polish
- [ ] **4.1 Golden Bloom tier medals** — Bronze/Silver/Gold visual progression (`golden-bloom.jsx`).
- [ ] **4.2 Search overlay** — type-ahead words/lessons/tales (`search.jsx`).
- [ ] **4.3 XP graph** — 7-day trend line with tappable points (`xp-graph.jsx`).
- [ ] **4.4 Garden collection** — bloom gallery (`garden-collection.jsx`).
- [ ] **4.5 Notification priming** — calm permission flow (`notification-priming.jsx`).

## Not recommended for v1
Family plan, moonlit (dark variant), widgets, splash variants, skeletons, account settings, profile-extras, streak-repair, streak-milestone (already done).

## Chat-derived intent (durable rules)
1. **HUD**: streak uses warm amber flame `#F5833E` (not droplet); all stats tappable.
2. **Water as core resource** (not hearts); "Don't know" costs 1 water.
3. **Calm mode**: dual-path animations; no timers; gentle praise at every tier; no red, only coral with icon pairing.
4. **Two-tier social**: competitive (Leagues) separate from supportive (Friends). Never mix ranking with encouragement.
5. **Garden metaphor consistent everywhere**: words wilt/grow, blooms are collectible, streaks grow seeds, lessons plant path nodes.
