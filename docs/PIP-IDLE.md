# Pip idle

Neutral status only (`pip--idle` on the Today card and the current path node). Celebrate / correct / almost poses are unchanged.

Grok-inspired liveliness, Pip's own sprout art:

1. **Breathing squash/stretch** — body scale about `1.00` to `1.045` tall, with inverse width (`0.957`) so volume feels conserved. Pivot is the base (`transform-origin: center bottom`), not the center.
2. **Layered micro-motion** — three desynced ease-in-out loops: body breath `3.2s`, whole-plant tilt `4.7s`, leaf sway `5.35s`.
3. **Blink** — eyes scale on Y for about `100ms` once per `4.2s`, not on every breath.
4. **Easing** — `cubic-bezier` ease-in-out. No linear timing and no elastic overshoot.
5. **Low amplitude** — readable beside Today copy at 58–72px, without a bounce.
6. **Seamless loop** — every keyframe set matches at `0%` and `100%`.

`prefers-reduced-motion: reduce` skips the loops. `body.calm-motion` still forces a single non-repeating instant.
