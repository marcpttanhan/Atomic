// Lightweight, procedural UI sound-effects engine (Web Audio API).
// Separate from the ambient background music engine (utils/audio.js) and
// from the practice-answer feedback tones in App.jsx: this one is for
// general interaction feedback (button taps, nav, numpad, cards) and is
// meant to be imported directly wherever a click handler needs it, with
// no props or context plumbing.

import { safeGetItem } from './safeStorage.js';

const STORAGE_KEY = 'atomicRecallV1';

let ctx = null;
function getContext() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  // AudioContext must be resumed from within a user-gesture handler to
  // satisfy autoplay policy; every exported play*SFX function below is
  // only ever called from onClick handlers, so this is always safe.
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

// SFX are gated by the same sound toggles the rest of the app already
// persists (Settings > "เสียงเอฟเฟกต์") and by Focus Mode, read fresh from
// localStorage on every call since this module has no React state of its
// own. If the user has muted every existing sound category, general UI
// clicks stay silent too.
function isSfxEnabled() {
  try {
    const saved = JSON.parse(safeGetItem(STORAGE_KEY) || '{}');
    if (saved.focusMode) return false;
    const sound = saved.sound || { correct: true, wrong: true, combo: true };
    return !!(sound.correct || sound.wrong || sound.combo);
  } catch {
    return true;
  }
}

function tone(audioCtx, { freq, freqEnd, type = 'sine', start = 0, duration = 0.1, gain = 0.08 }) {
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.connect(g);
  g.connect(audioCtx.destination);
  osc.type = type;
  const t0 = audioCtx.currentTime + start;
  osc.frequency.setValueAtTime(freq, t0);
  if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, t0 + duration);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

function safePlay(fn) {
  if (!isSfxEnabled()) return;
  try {
    fn(getContext());
  } catch { /* Web Audio unavailable */ }
}

// Soft, snappy tap for general buttons, tabs, nav, and option cards.
export function playClickSFX() {
  safePlay((c) => tone(c, { freq: 720, freqEnd: 840, type: 'sine', duration: 0.045, gain: 0.06 }));
}

// Bright, positive two-note rise for key confirmations (submit, start, save).
export function playSubmitSFX() {
  safePlay((c) => {
    tone(c, { freq: 660, type: 'sine', duration: 0.08, gain: 0.09 });
    tone(c, { freq: 1000, type: 'sine', duration: 0.12, gain: 0.08, start: 0.05 });
  });
}

// Low double-beep buzz for wrong answers or invalid actions.
export function playErrorSFX() {
  safePlay((c) => {
    tone(c, { freq: 220, type: 'square', duration: 0.09, gain: 0.06 });
    tone(c, { freq: 180, type: 'square', duration: 0.12, gain: 0.06, start: 0.11 });
  });
}
