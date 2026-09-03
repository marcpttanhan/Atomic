import { motion } from 'framer-motion';
import { GAME_MODES } from '../data/elements.js';
import { playClickSFX } from '../utils/sfx.js';
import { fadeUp } from '../utils/motionVariants.js';
import { glowBadgeClass, springHover } from '../utils/styles.js';

export default function GameModeSelector({ preset, onSelectPreset }) {
  return (
    <div role="radiogroup" aria-label="เลือกโหมดการเล่น" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {GAME_MODES.map((m, i) => {
        const active = preset === m.id;
        return (
          <motion.label
            key={m.id}
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: i * 0.05 }}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.99 }}
            className={
              'relative flex cursor-pointer flex-col gap-2.5 overflow-hidden rounded-2xl border p-5 backdrop-blur-md transition-all duration-150 ' +
              'has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2 ' +
              (active
                ? 'border-accent-700 bg-accent-100/60 shadow-[0_0_24px_color-mix(in_srgb,var(--color-accent)_25%,transparent)]'
                : 'border-divider bg-surface/70 hover:border-accent-300 hover:bg-surface/90')
            }
          >
            <input
              type="radio"
              name="gameMode"
              checked={active}
              onChange={() => { playClickSFX(); onSelectPreset(m.id); }}
              className="sr-only"
            />
            <div className="flex items-start justify-between gap-2">
              <span className="text-3xl" aria-hidden="true">{m.emoji}</span>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold text-accent-800 ${glowBadgeClass} bg-accent-100`}>
                {m.badge}
              </span>
            </div>
            <div>
              <div className="font-heading text-lg font-bold text-ink">{m.label}</div>
              <div className="mt-1 text-sm text-neutral-600">{m.desc}</div>
            </div>
            {active && (
              <motion.div
                layoutId="gamemode-active-check"
                transition={springHover}
                className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white shadow-sm"
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </motion.div>
            )}
          </motion.label>
        );
      })}
    </div>
  );
}
