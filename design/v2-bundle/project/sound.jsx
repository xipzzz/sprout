// ─────────────────────────────────────────────────────────────
// Sound — Sprout's calm garden audio palette. Synthesized with Web Audio
// (no asset files) so it's playable in the prototype. Gentle + natural,
// never arcade — the sonic twin of Calm mode. Pairs with the haptics layer.
//   correct → soft rising chime · wrong → gentle low note (never a buzzer)
//   complete → a little bloom arpeggio · tap → soft leaf-rustle blip
// Granular, persisted prefs; respects a master toggle. Off-by-default ambient bed.
// ─────────────────────────────────────────────────────────────

let _actx = null;
function _ctx() {
  if (typeof window === 'undefined') return null;
  try {
    if (!_actx) _actx = new (window.AudioContext || window.webkitAudioContext)();
    if (_actx.state === 'suspended') _actx.resume();
    return _actx;
  } catch (e) { return null; }
}

// pref helpers — default ON for effects/pip, OFF for ambient
function soundPref(key, def) {
  try { const v = localStorage.getItem(key); return v == null ? def : v === 'on'; } catch (e) { return def; }
}
function setSoundPref(key, on) { try { localStorage.setItem(key, on ? 'on' : 'off'); } catch (e) {} }

// one gentle voice: a sine/triangle note with a soft attack + long release
function _note(ctx, freq, t0, dur, gain, type) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(ctx.destination);
  o.start(t0); o.stop(t0 + dur + 0.05);
}

// soft filtered-noise blip for the leaf-rustle tap
function _rustle(ctx, t0) {
  const dur = 0.13;
  const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = ctx.createBufferSource(); src.buffer = buf;
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3200; bp.Q.value = 0.7;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.06, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(bp); bp.connect(g); g.connect(ctx.destination);
  src.start(t0); src.stop(t0 + dur);
}

// The palette. kind: 'correct' | 'wrong' | 'complete' | 'tap' | 'goal'
function sproutSound(kind) {
  // master + per-channel gating
  if (!soundPref('sprout.sound', true)) return;
  const isPip = kind === 'complete' || kind === 'goal';
  if (isPip && !soundPref('sprout.soundPip', true)) return;
  if (!isPip && !soundPref('sprout.soundFx', true)) return;
  const ctx = _ctx(); if (!ctx) return;
  const t = ctx.currentTime;
  switch (kind) {
    case 'correct': // soft rising two-note chime
      _note(ctx, 660, t, 0.5, 0.10, 'sine');
      _note(ctx, 880, t + 0.09, 0.6, 0.09, 'sine');
      break;
    case 'wrong': // gentle low note, never harsh
      _note(ctx, 240, t, 0.45, 0.08, 'triangle');
      _note(ctx, 200, t + 0.06, 0.5, 0.06, 'sine');
      break;
    case 'complete': // a little bloom arpeggio
      [523, 659, 784, 1046].forEach((f, i) => _note(ctx, f, t + i * 0.11, 0.7, 0.09, 'sine'));
      break;
    case 'goal': // brighter, fuller bloom for the daily goal
      [523, 659, 784].forEach((f, i) => _note(ctx, f, t + i * 0.08, 0.8, 0.10, 'sine'));
      _note(ctx, 1046, t + 0.26, 1.0, 0.08, 'triangle');
      break;
    case 'tap':
    default:
      _rustle(ctx, t);
  }
}

// ── Ambient garden soundscape (off by default; gentle looping bed) ──
let _ambient = null;
function ambientPlaying() { return !!_ambient; }
function startAmbient() {
  const ctx = _ctx(); if (!ctx || _ambient) return;
  const master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
  // soft wind: filtered brown noise
  const dur = 2;
  const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const d = buf.getChannelData(0); let last = 0;
  for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; d[i] = (last + 0.02 * w) / 1.02; last = d[i]; d[i] *= 3.5; }
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700;
  const wg = ctx.createGain(); wg.gain.value = 0.5;
  src.connect(lp); lp.connect(wg); wg.connect(master);
  src.start();
  // occasional gentle birdsong chirps
  const chirp = () => {
    if (!_ambient) return;
    const t = ctx.currentTime;
    const base = 1800 + Math.random() * 1400;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(base, t);
    o.frequency.linearRampToValueAtTime(base * 1.18, t + 0.08);
    o.frequency.linearRampToValueAtTime(base * 0.9, t + 0.16);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.05, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.25);
    _ambient.timer = setTimeout(chirp, 2200 + Math.random() * 4000);
  };
  master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.5); // gentle fade-in
  _ambient = { src, master };
  _ambient.timer = setTimeout(chirp, 1500);
}
function stopAmbient() {
  if (!_ambient) return;
  const ctx = _ctx();
  try {
    _ambient.master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    clearTimeout(_ambient.timer);
    const a = _ambient; setTimeout(() => { try { a.src.stop(); } catch (e) {} }, 700);
  } catch (e) {}
  _ambient = null;
}

Object.assign(window, { sproutSound, soundPref, setSoundPref, startAmbient, stopAmbient, ambientPlaying });
