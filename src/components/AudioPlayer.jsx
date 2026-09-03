import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createAmbientPlayer, TRACKS } from '../utils/audio.js';
import { safeGetItem, safeSetItem } from '../utils/safeStorage.js';
import { MusicIcon, PlayIcon, PauseIcon, FocusIcon } from './icons.jsx';
import { playClickSFX } from '../utils/sfx.js';
import { toggleClass, springHover } from '../utils/styles.js';

export const AUDIO_STORAGE_KEY = 'atomicRecallAudioV1';

function loadAudioPrefs() {
  try {
    const saved = JSON.parse(safeGetItem(AUDIO_STORAGE_KEY) || '{}');
    return {
      volume: typeof saved.volume === 'number' ? saved.volume : 0.5,
      muted: !!saved.muted,
      trackId: TRACKS.some((t) => t.id === saved.trackId) ? saved.trackId : TRACKS[0].id,
    };
  } catch {
    return { volume: 0.5, muted: false, trackId: TRACKS[0].id };
  }
}

export default function AudioPlayer({ focusMode, onToggleFocusMode }) {
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs] = useState(loadAudioPrefs);
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    playerRef.current = createAmbientPlayer();
    return () => { playerRef.current?.destroy(); };
  }, []);

  useEffect(() => {
    safeSetItem(AUDIO_STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  useEffect(() => { playerRef.current?.setMuted(prefs.muted); }, [prefs.muted]);
  useEffect(() => { playerRef.current?.setVolume(prefs.volume); }, [prefs.volume]);
  useEffect(() => { playerRef.current?.setFocusMode(!!focusMode); }, [focusMode]);

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (playing) {
      p.pause();
      setPlaying(false);
    } else {
      p.play(prefs.trackId);
      setPlaying(true);
    }
  }, [playing, prefs.trackId]);

  const selectTrack = useCallback((trackId) => {
    setPrefs((s) => ({ ...s, trackId }));
    if (playing) playerRef.current?.play(trackId);
  }, [playing]);

  const onVolumeChange = useCallback((e) => {
    const v = Number(e.target.value) / 100;
    setPrefs((s) => ({ ...s, volume: v }));
  }, []);

  const toggleMuted = useCallback(() => {
    setPrefs((s) => ({ ...s, muted: !s.muted }));
  }, []);

  // Escape closes the popover, matching standard disclosure/dialog behavior.
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e) => { if (e.key === 'Escape') setExpanded(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);

  const currentTrack = TRACKS.find((t) => t.id === prefs.trackId) || TRACKS[0];

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={() => { playClickSFX(); setExpanded((v) => !v); }}
        title="เพลงพื้นหลัง"
        aria-label="เพลงพื้นหลัง"
        aria-haspopup="true"
        aria-expanded={expanded}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        transition={springHover}
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 ${toggleClass(expanded || playing)}`}
      >
        <MusicIcon />
        {playing && <span className="h-1.5 w-1.5 rounded-full bg-accent-700" />}
      </motion.button>

      <AnimatePresence>
      {expanded && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 top-[calc(100%+8px)] z-10 w-72 rounded-2xl border border-divider bg-surface p-4 shadow-md">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-600">เพลงพื้นหลังโฟกัส</div>
            <motion.button
              type="button"
              onClick={togglePlay}
              title={playing ? 'หยุดชั่วคราว' : 'เล่น'}
              aria-label={playing ? 'หยุดเพลงชั่วคราว' : 'เล่นเพลง'}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              transition={springHover}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white shadow-[0_0_12px_color-mix(in_srgb,var(--color-accent)_30%,transparent)] transition-colors duration-150 cursor-pointer hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </motion.button>
          </div>

          <div className="mb-3 flex flex-col gap-1.5">
            {TRACKS.map((t) => (
              <motion.button
                key={t.id}
                type="button"
                onClick={() => { playClickSFX(); selectTrack(t.id); }}
                aria-pressed={t.id === prefs.trackId}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={springHover}
                className={`rounded-xl px-3 py-2 text-left text-sm font-medium ${toggleClass(t.id === prefs.trackId)}`}
              >
                {t.name}
              </motion.button>
            ))}
          </div>

          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-xs text-neutral-600">
              <span>ระดับเสียง</span>
              <span>{prefs.muted ? 'ปิดเสียง' : `${Math.round(prefs.volume * 100)}%`}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(prefs.volume * 100)}
              onChange={onVolumeChange}
              disabled={prefs.muted}
              aria-label="ระดับเสียงเพลงพื้นหลัง"
              className="w-full cursor-pointer accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
            />
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              onClick={() => { playClickSFX(); toggleMuted(); }}
              aria-pressed={prefs.muted}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={springHover}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${toggleClass(prefs.muted)}`}
            >
              {prefs.muted ? 'เปิดเสียงเพลง' : 'ปิดเสียงเพลง'}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => { playClickSFX(); onToggleFocusMode(); }}
              title="ปิดเสียง SFX และลดเสียงแหลมของเพลง"
              aria-pressed={focusMode}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={springHover}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold ${toggleClass(focusMode)}`}
            >
              <FocusIcon />
              โหมดโฟกัส
            </motion.button>
          </div>
          <div className="mt-2 text-[11px] text-neutral-600">เพลง{currentTrack.name} · เล่นต่อเนื่องแม้เปลี่ยนโหมด</div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
