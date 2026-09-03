// Ambient background music via the Web Audio API. Most tracks are
// procedurally generated (no external files, so the single-file
// `dist/index.html` build stays fully self-contained). The rain layer in
// "Rain & Waves" instead uses a real recorded rain clip, imported as a
// module asset so Vite/vite-plugin-singlefile base64-inline it into the
// bundle too — that keeps the "one HTML file, no other files" build intact,
// unlike putting it in `public/`, which Vite always copies out as a
// separate physical file regardless of inlining settings.
import raindropUrl from '../assets/raindrop.mp3';

// Decoding is a little expensive and the source file never changes, so
// cache the decoded buffer across track switches / player instances.
let raindropBufferPromise = null;
function getRaindropBuffer(ctx) {
  if (!raindropBufferPromise) {
    raindropBufferPromise = fetch(raindropUrl)
      .then((res) => res.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data));
  }
  return raindropBufferPromise;
}

function makeNoiseBuffer(ctx, seconds) {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function makeEntryGain(ctx, dest, level) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(level, ctx.currentTime + 1.5);
  gain.connect(dest);
  return gain;
}

// Fades a track's entry gain to silence, then tears down every node/timer
// it registered. Oscillators/sources are stopped defensively (some may
// already have stopped themselves).
function fadeOutAndTeardown(ctx, entryGain, nodes, timers) {
  timers.forEach((t) => clearInterval(t));
  entryGain.gain.cancelScheduledValues(ctx.currentTime);
  entryGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.15);
  setTimeout(() => {
    nodes.forEach((n) => {
      try { n.stop && n.stop(); } catch { /* already stopped */ }
      try { n.disconnect(); } catch { /* already disconnected */ }
    });
  }, 500);
}

// ---- Track 1: Lo-Fi Focus — warm detuned pad, slow filter sweep, soft hiss ----
function buildLoFiFocus(ctx, dest) {
  const nodes = [];
  const timers = [];
  const entry = makeEntryGain(ctx, dest, 0.55);
  nodes.push(entry);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1100;
  filter.Q.value = 0.6;
  filter.connect(entry);
  nodes.push(filter);

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.06;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 260;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();
  nodes.push(lfo, lfoGain);

  const chordA = [220.0, 261.63, 329.63, 392.0]; // Am7-ish
  const chordB = [174.61, 220.0, 261.63, 349.23]; // Fmaj7-ish
  const oscs = chordA.map((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.detune.value = i % 2 === 0 ? -5 : 5;
    const g = ctx.createGain();
    g.gain.value = 0.16;
    osc.connect(g);
    g.connect(filter);
    osc.start();
    nodes.push(osc, g);
    return osc;
  });

  let toggled = false;
  timers.push(setInterval(() => {
    toggled = !toggled;
    const target = toggled ? chordB : chordA;
    oscs.forEach((osc, i) => osc.frequency.linearRampToValueAtTime(target[i], ctx.currentTime + 3));
  }, 9000));

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = makeNoiseBuffer(ctx, 2);
  noiseSource.loop = true;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 2800;
  noiseFilter.Q.value = 0.5;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.012;
  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(entry);
  noiseSource.start();
  nodes.push(noiseSource, noiseFilter, noiseGain);

  return { stop: () => fadeOutAndTeardown(ctx, entry, nodes, timers) };
}

// ---- Track 2: Cyber-Chemistry Synth — sub drone + arpeggiated sci-fi scale ----
function buildCyberChemistrySynth(ctx, dest) {
  const nodes = [];
  const timers = [];
  const entry = makeEntryGain(ctx, dest, 0.4);
  nodes.push(entry);

  const sub = ctx.createOscillator();
  sub.type = 'sine';
  sub.frequency.value = 55; // A1
  const subGain = ctx.createGain();
  subGain.gain.value = 0.3;
  sub.connect(subGain);
  subGain.connect(entry);
  sub.start();
  nodes.push(sub, subGain);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1800;
  filter.Q.value = 6;
  filter.connect(entry);
  nodes.push(filter);

  // A minor-pentatonic-ish "sci-fi" scale, stepped by a lightweight scheduler.
  const scale = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
  let step = 0;
  timers.push(setInterval(() => {
    const freq = scale[step % scale.length];
    step += 1;
    const osc = ctx.createOscillator();
    osc.type = step % 3 === 0 ? 'square' : 'sawtooth';
    osc.frequency.value = freq;
    const g = ctx.createGain();
    const now = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.13, now + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
    osc.connect(g);
    g.connect(filter);
    osc.start(now);
    osc.stop(now + 0.35);
  }, 380));

  return { stop: () => fadeOutAndTeardown(ctx, entry, nodes, timers) };
}

// ---- Track 3: Rain & Waves — filtered noise rain bed + slow wave swell ----
function buildRainAndWaves(ctx, dest) {
  const nodes = [];
  const timers = [];
  const entry = makeEntryGain(ctx, dest, 0.5);
  nodes.push(entry);

  // Rain: real recorded rain audio, decoded once and looped seamlessly via
  // an AudioBufferSourceNode (sample-accurate looping, unlike an
  // HTMLAudioElement, so there's no audible seam at the loop point).
  const rainGain = ctx.createGain();
  rainGain.gain.value = 0.55;
  rainGain.connect(entry);
  nodes.push(rainGain);

  let rainCancelled = false;
  getRaindropBuffer(ctx).then((buffer) => {
    if (rainCancelled) return;
    const rainSource = ctx.createBufferSource();
    rainSource.buffer = buffer;
    rainSource.loop = true;
    rainSource.connect(rainGain);
    rainSource.start();
    nodes.push(rainSource);
  }).catch(() => { /* fall back to the wave layer only if decoding fails */ });

  // Waves: low rumbling noise with a slow swell in and out.
  const waveSource = ctx.createBufferSource();
  waveSource.buffer = makeNoiseBuffer(ctx, 4);
  waveSource.loop = true;
  const waveFilter = ctx.createBiquadFilter();
  waveFilter.type = 'lowpass';
  waveFilter.frequency.value = 420;
  const waveGain = ctx.createGain();
  waveGain.gain.value = 0.12;
  waveSource.connect(waveFilter);
  waveFilter.connect(waveGain);
  waveGain.connect(entry);
  waveSource.start();
  nodes.push(waveSource, waveFilter, waveGain);

  const waveLfo = ctx.createOscillator();
  waveLfo.frequency.value = 0.09;
  const waveLfoGain = ctx.createGain();
  waveLfoGain.gain.value = 0.09;
  waveLfo.connect(waveLfoGain);
  waveLfoGain.connect(waveGain.gain);
  waveLfo.start();
  nodes.push(waveLfo, waveLfoGain);

  return {
    stop: () => {
      rainCancelled = true;
      fadeOutAndTeardown(ctx, entry, nodes, timers);
    },
  };
}

export const TRACKS = [
  { id: 'lofi', name: 'Lo-Fi Focus', build: buildLoFiFocus },
  { id: 'cyber', name: 'Cyber-Chemistry Synth', build: buildCyberChemistrySynth },
  { id: 'rain', name: 'Rain & Waves', build: buildRainAndWaves },
];

export function createAmbientPlayer() {
  let ctx = null;
  let masterGain = null;
  let focusFilter = null;
  let activeTrack = null; // { id, stop }
  let volume = 0.5;
  let muted = false;
  let focusMode = false;
  let playing = false;

  function ensureGraph() {
    if (ctx) return ctx;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    focusFilter = ctx.createBiquadFilter();
    focusFilter.type = 'lowpass';
    focusFilter.frequency.value = 20000;
    masterGain.connect(focusFilter);
    focusFilter.connect(ctx.destination);
    applyVolume();
    applyFocus();
    return ctx;
  }

  function applyVolume() {
    if (!masterGain || !ctx) return;
    masterGain.gain.setTargetAtTime(muted ? 0 : volume, ctx.currentTime, 0.06);
  }

  function applyFocus() {
    if (!focusFilter || !ctx) return;
    focusFilter.frequency.setTargetAtTime(focusMode ? 800 : 20000, ctx.currentTime, 0.3);
  }

  function selectTrack(trackId) {
    const c = ensureGraph();
    if (activeTrack) { activeTrack.stop(); activeTrack = null; }
    const def = TRACKS.find((t) => t.id === trackId) || TRACKS[0];
    const handle = def.build(c, masterGain);
    activeTrack = { id: def.id, stop: handle.stop };
  }

  function play(trackId) {
    const c = ensureGraph();
    if (c.state === 'suspended') c.resume().catch(() => {});
    const wantId = trackId || (activeTrack ? activeTrack.id : TRACKS[0].id);
    if (!activeTrack || activeTrack.id !== wantId) selectTrack(wantId);
    playing = true;
  }

  function pause() {
    if (ctx && ctx.state === 'running') ctx.suspend().catch(() => {});
    playing = false;
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    applyVolume();
  }

  function setMuted(m) {
    muted = !!m;
    applyVolume();
  }

  function setFocusMode(on) {
    focusMode = !!on;
    applyFocus();
  }

  function getState() {
    return { playing, trackId: activeTrack ? activeTrack.id : null, volume, muted, focusMode };
  }

  function destroy() {
    if (activeTrack) { activeTrack.stop(); activeTrack = null; }
    if (ctx) { try { ctx.close(); } catch { /* already closed */ } ctx = null; }
  }

  return { play, pause, selectTrack, setVolume, setMuted, setFocusMode, getState, destroy };
}
