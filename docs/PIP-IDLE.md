# Pip idle

Neutral Pip on the Today card and the current path node breathes, leans, and blinks. Celebrate, correct, and almost poses are a different component (`PipPose`) and are not part of this loop.

The review page is `public/pip-idle-preview.html`. It plays the demo even when the operating system asks for reduced motion. The app does not.

## Why the last preview looked frozen

Three things stacked. Any one of them was enough to call the idle “static.”

1. **Reduce Motion removed the animation rules.** Every idle keyframe lived inside `@media (prefers-reduced-motion: no-preference)`. macOS Reduce Motion (`reduceMotion = 1` in Accessibility) makes the browser report `prefers-reduced-motion: reduce`. The media query does not match, so the rules are not applied. Pip paints the resting drawing and stays there. The previous HTML preview copied that gate and had no way to turn the demo back on, so a Mac with Reduce Motion on showed a still file at `pip-idle-preview.html` and on the phone URL that served it. iOS Reduce Motion does the same thing.

2. **The pivot did not survive Safari.** The loops used `transform-box: fill-box` and `transform-origin: center bottom` on SVG `<g>` elements. Chrome sizes that box from the group’s geometry. Safari often does not: a `<g>` has no shape of its own, and the leaves already carry SVG `transform` attributes, so the fill box is empty or ignores the origin. Safari then scales and rotates around the SVG origin, or drops the origin and keeps the transform visually tiny. Reports of this are old and still current: [Safari not honoring `transform-origin` with `fill-box`](https://stackoverflow.com/questions/60916474/safari-not-honoring-css-transform-origin-transform-box-fill-box-not-helping), [Safari ignores SVG `transform-origin`](https://stackoverflow.com/questions/67057190/safari-doesnt-respect-transform-origin-svg-attribute). The fix used here is a unitless `matrix()` in viewBox coordinates, with the pivot baked into the matrix (`transform-origin: 0 0`). Safari’s failure mode (origin stuck at 0,0) is the origin this matrix expects.

3. **The amplitude was about one pixel.** At the Today size (58px) a 4.5% breath is roughly a pixel of growth, and ±2.2° of tilt moves the crown about two pixels. A blink of the 6px eyes lasts about a tenth of a second every few seconds. A screenshot, a GitHub review, and a quick look on a phone all read as a still mascot.

Class wiring was not the bug. `idle` already adds `pip--idle` on the Today card and the current path node only.

## What plays where

| Surface | Motion |
| --- | --- |
| Today card (`HomeScreen`, 58px) | `pip--idle` |
| Current path node (`WindingPath`, 62px) | `pip--idle` |
| Other neutral Pips (garden, me, onboarding, …) | The older whole-sprite sway |
| Lesson celebrate / almost | `PipPose`, no idle class |

`body.calm-motion` (Settings → calmer motion) still forces every animation in the app to a single instant. That rule is global and unchanged.

## The loops

Periods are deliberately out of step. A shared duration turns a character into a metronome. Duolingo’s Lily idle is built the same way: separate head and body clips combined so the neutral state does not repeat on one beat ([Rive’s write-up of Lily](https://rive.app/blog/duolingo-s-ai-powered-video-call-brings-lily-to-life) describes eight head clips and eight body clips). Pip is CSS, not a state machine, so the mix is a set of coprime-ish durations.

| Layer | Element | Period | Pivot | What you should notice |
| --- | --- | --- | --- | --- |
| Sway and settle | `.pip.pip--idle` (the `<svg>`, an HTML box) | 4.6s | 50% 88%, the feet | A lean of about 5° and a small rise. This one does not depend on SVG group transforms, so it still reads if a browser drops the inner loops. |
| Breath | `.pip__body` | 2.9s | Feet at viewBox `(40, 71)` | Height ×1.14, width ×0.877 so the area stays about the same. The crown rises; the feet stay. |
| Stem lag | `.pip__leaves` | 5.5s | `(40, 46)`, where the stem enters the head | A couple of degrees, slower than the body. Follow-through. |
| Left leaf | `.pip__leaf--l` | 3.4s | Hinge `(40, 28)` | Up to about 8° off the resting leaf. |
| Right leaf | `.pip__leaf--r` | 3.95s, delayed | Same hinge, opposite direction | Does not match the left leaf. |
| Glance | `.pip__glance` | 7.3s | Translation only | Eyes shift a little more than one user unit, hold, then look the other way. |
| Blink | `.pip__eyes` | 9.2s | `(40, 50.5)` | One shut, later a double, then a long open. Closed time is about 90ms. Not once per breath. |
| Sheen | `.pip__sheen` | 4.2s | Opacity only | The white body wash moves between about 5% and 22%. No transform, so it cannot be broken by `transform-origin`. |

Easing on the body loops is `cubic-bezier(0.45, 0.05, 0.55, 0.95)` — slow in, slow out, no elastic overshoot. Sprout is a calm lesson app; the idle should feel like a plant, not a bounce. The blink track is `linear` only because it is a clock: the eyes stay open for most of the 9.2s and move in the short gaps.

Every keyframe list matches at 0% and 100%.

The outer sway uses a percentage `translateY`, so the rise grows with the rendered size. Inner `matrix()` values are viewBox user units, so the breath and the leaves also scale from 58px up to the large preview.

## Secondary motion

Primary action is the breath and the lean. Everything else is secondary, in the sense of the overlapping-action notes in Thomas and Johnston’s *The Illusion of Life*:

- Leaves keep moving after the body has started back the other way (different periods, plus a stem that lags).
- The face rides on the body squash, then the eyes do their own blink and glance on top. Blink and glance are nested groups because one element can only animate one `transform`.
- The sheen is a brightness change, not another position change, so the silhouette stays readable next to the Today title.

Duolingo’s lesson characters do the same split. Idle blinks, nods, and brow moves run beside the pose instead of being baked into one clip ([How Duolingo Animates Its World Characters](https://blog.duolingo.com/world-character-visemes/)). Pip does not lip-sync and does not celebrate here. Those stay on `PipPose`.

At 58px the motion has to be larger than “technically animating.” Duo is drawn so a small avatar still reads as alive. Pip’s earlier 4% scale did not. The breath is now about 14% taller, which is roughly three pixels of crown travel at Today size and obvious at the preview’s 220px. It is still a squash around the feet, not a jump.

## Accessibility

Two different policies, on purpose:

- **The app** only runs these loops when `prefers-reduced-motion: no-preference` matches. Reduce Motion on macOS or iOS, and the CSS media feature `reduce`, both skip them. Calm motion in Settings collapses them as well (`animation-duration: 0.001s` and a single iteration, so Pip ends on the resting frame). That lines up with WCAG 2.2’s guidance on animation from interaction (2.3.3) and with giving people a way to stop decorative motion (2.2.2). `prefers-reduced-motion` is the Media Queries Level 5 hook browsers already expose for the OS switch.
- **The preview** ignores that media query. Decorative motion that you are trying to review is the content. A checkbox labeled “Demo motion” is on by default and turns the loops off without reloading. If the OS setting is on, a banner says so, and says the app will stay still. A moving bar next to the checkbox is the control that the page itself is painting frames.

There is no vestibular motion: no full-screen zoom, no parallax, no flashing. The blink is a dark shape getting shorter, not a brightness flash.

## Safari notes for the next edit

- Animate the `<svg>` element when the motion must survive a bad SVG origin. It is an HTML box. Percentage origins work.
- Do not use `transform-box: fill-box` on a `<g>` whose children use SVG `transform` attributes.
- Prefer `matrix(a, b, c, d, e, f)` with unitless `e` and `f`. Those numbers are user units. `translate(40px, …)` is not safe: some engines treat `px` on an SVG child as CSS pixels, which shrinks the pivot when the icon is not 80×80 on screen.
- Set `transform-origin: 0 0` on those groups. The initial value is `50% 50%` (the viewBox center). Leaving it there applies the matrix around the wrong point. Baking the pivot into the matrix and pinning the origin at zero agrees with both Chrome and Safari’s “origin stuck at 0,0” behavior.
- `overflow: visible` on `.pip` so a leaf tip is not clipped by the SVG viewport.

## Preview

```bash
npm run dev
```

Open `http://localhost:5173/pip-idle-preview.html`. The dev server is pinned to port 5173 (`vite.config.ts`). From a phone on the same network, use the computer’s LAN address and the same path.

The page is one file. Opening `public/pip-idle-preview.html` directly also works. It does not load the app bundle.

What the page shows:

- **Old** and **New** at 220px, plus the real 58px Today chip and 62px path chip.
- **Rest / Inhale / Blink**, paused, so a screenshot of the page is three different drawings even if a reviewer never waits for a loop.
- A line that measures the live body box. If that height does not change, the loops are not painting.
- `pip-idle-demo.gif` beside the page — the same old-vs-new pair, recorded while Reduce Motion was on, so a review tool that does not run CSS still shows the motion.

Keyframes in the HTML mirror `src/styles/app.css`. If you change a period or a matrix, change both.

## Files

- `src/components/Pip.tsx` — groups for body, leaves, each leaf, glance, eyes, sheen
- `src/screens/HomeScreen.tsx` — `<Pip idle />` on Today
- `src/components/WindingPath.tsx` — `<Pip idle />` on the current node only
- `src/styles/app.css` — loops, gated on `prefers-reduced-motion: no-preference`
- `public/pip-idle-preview.html` — forced demo, old beside new, motion toggle
