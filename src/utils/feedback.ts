/* playSproutFeedback — calm, soft Web Audio beeps for UI moments.
   Never throws; fails silently if AudioContext is blocked. */

export type FeedbackKind =
  | 'gardenGrowth'
  | 'waterOpen'
  | 'modalClose'
  | 'modalOpen'
  | 'correct'
  | 'complete'
  | (string & {});

// Lazy-init AudioContext (avoid blocking on load; respect autoplay policy)
let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (ctx) return ctx;
  try {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    return ctx;
  } catch {
    return null;
  }
}

// Map each feedback kind to a calm tone config: { frequency, duration, volume }
const TONES: Record<string, { freq: number; dur: number; vol: number }> = {
  gardenGrowth: { freq: 523, dur: 0.15, vol: 0.15 }, // C5 — gentle growth tick
  waterOpen: { freq: 659, dur: 0.12, vol: 0.12 },    // E5 — bright modal open
  modalClose: { freq: 440, dur: 0.08, vol: 0.1 },    // A4 — soft dismiss
  modalOpen: { freq: 523, dur: 0.1, vol: 0.12 },     // C5 — inviting open
  correct: { freq: 587, dur: 0.16, vol: 0.14 },      // D5 — warm "yes"
  complete: { freq: 659, dur: 0.18, vol: 0.16 },     // E5 — celebration
};

/**
 * Play a calm, kid-friendly beep for the given feedback moment.
 * Silent no-op if AudioContext is unavailable or blocked.
 * @param kind - The feedback moment (e.g. 'correct', 'gardenGrowth')
 */
export function playSproutFeedback(kind: FeedbackKind): void {
  try {
    const audio = getContext();
    if (!audio) return;

    // Resume context if needed (Safari/Chrome autoplay policy)
    if (audio.state === 'suspended') {
      audio.resume().catch(() => { /* ignore */ });
    }

    const tone = TONES[kind];
    if (!tone) return; // Unknown kind → silent

    const now = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();

    osc.type = 'sine'; // Soft, round sine wave (calmest)
    osc.frequency.value = tone.freq;

    // Gentle fade-in/fade-out envelope
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(tone.vol, now + 0.02); // 20ms attack
    gain.gain.linearRampToValueAtTime(0, now + tone.dur);    // fade out

    osc.connect(gain);
    gain.connect(audio.destination);

    osc.start(now);
    osc.stop(now + tone.dur);
  } catch {
    // Fail silently — feedback is optional polish, never critical
  }
}
