import { motion } from 'framer-motion';
import { GAME_MODES } from '../data/elements.js';
import { playClickSFX } from '../utils/sfx.js';
import { glowBadgeClass, springHover } from '../utils/styles.js';

// Compact labels for the segmented control — the full GAME_MODES.label
// strings are sized for the big card grid in GameModeSelector, not a
// single-line pill row.
const SHORT_LABEL = {
  basic20: 'Basic 20',
  posn: 'POSN Focus',
  alevel: 'A-Level Core',
  ranked: 'Ranked Mix',
};

export default function ModeSwitcherBar({ preset, onSelectPreset }) {
  const activeMode = GAME_MODES.find((m) => m.id === preset) || GAME_MODES[0];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-divider bg-surface/60 px-5 py-3 backdrop-blur-sm">
      <div
        role="radiogroup"
        aria-label="สลับโหมดการเล่นแบบด่วน"
        className="flex flex-wrap gap-1 rounded-full border border-divider bg-surface p-1 shadow-sm"
      >
        {GAME_MODES.map((m) => {
          const active = preset === m.id;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={active}
              title={m.desc}
              onClick={() => { if (!active) { playClickSFX(); onSelectPreset(m.id); } }}
              className={
                'relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold cursor-pointer ' +
                'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 ' +
                (active ? 'text-accent-700' : 'text-neutral-600 hover:text-ink')
              }
            >
              {active && (
                <motion.span
                  layoutId="modeswitcher-active-pill"
                  className="absolute inset-0 rounded-full bg-accent-100 shadow-[0_0_12px_color-mix(in_srgb,var(--color-accent)_25%,transparent)]"
                  transition={springHover}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <span aria-hidden="true">{m.emoji}</span>
                {SHORT_LABEL[m.id] || m.label}
              </span>
            </button>
          );
        })}
      </div>

      <motion.div
        key={activeMode.id}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        title={activeMode.desc}
        className={`flex items-center gap-2 rounded-full bg-accent-100 px-3.5 py-1.5 text-[12px] font-semibold text-accent-800 ${glowBadgeClass}`}
      >
        <span aria-hidden="true">{activeMode.emoji}</span>
        <span>{activeMode.label}</span>
        <span className="text-accent-700/70" aria-hidden="true">·</span>
        <span>{activeMode.badge}</span>
      </motion.div>
    </div>
  );
}
