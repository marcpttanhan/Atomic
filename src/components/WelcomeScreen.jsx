import { Suspense, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { playClickSFX, playSubmitSFX } from '../utils/sfx.js';
import { SunIcon, MoonIcon } from './icons.jsx';
import AtomCanvas from './AtomCanvas.jsx';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function WelcomeScreen({ onSubmit, theme, onToggleTheme }) {
  const [name, setName] = useState('');
  const canSubmit = name.trim().length > 0;
  const shouldReduceMotion = useReducedMotion();

  const submit = () => {
    if (!canSubmit) return;
    playSubmitSFX();
    onSubmit(name);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg px-4 text-ink">
      <button
        type="button"
        onClick={() => { playClickSFX(); onToggleTheme(); }}
        aria-label="สลับธีม"
        title={theme === 'dark' ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
        className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-divider bg-surface text-ink shadow-sm transition-all duration-150 hover:bg-neutral-100 active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ opacity: 0, rotate: -45 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 45 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </motion.span>
        </AnimatePresence>
      </button>

      {/* Subtle grid, faded toward the edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--color-divider) 1px, transparent 1px), linear-gradient(to bottom, var(--color-divider) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 55% at 50% 35%, black, transparent)',
          maskImage: 'radial-gradient(ellipse 60% 55% at 50% 35%, black, transparent)',
        }}
      />

      {/* Ambient accent glow, breathing gently */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[32%] h-[45vh] w-[65vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-200 opacity-70 blur-[90px]"
        animate={shouldReduceMotion ? undefined : { scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 3D neon atom — replaces the old flat SVG orbit watermark with the
          same three-ring motif, rendered as a non-intrusive background layer. */}
      <Suspense fallback={null}>
        <AtomCanvas reducedMotion={!!shouldReduceMotion} className="z-0 opacity-90" />
      </Suspense>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-sm"
      >
        <motion.div variants={itemVariants} className="mb-8 text-center">
          <span className="mb-2 inline-block rounded-full border border-cyan/20 bg-cyan-bg px-3 py-1 text-xs text-cyan">
            ⚛️ POSN & A-Level Prep
          </span>
          <div className="font-heading text-3xl font-bold tracking-tight">ATOMIC RECALL</div>
          <div className="mt-2 text-sm text-neutral-600">ฝึกจำธาตุเคมี แข่งขัน และไต่แร้งค์ไปด้วยกัน</div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-divider bg-surface/90 p-8 shadow-sm backdrop-blur-sm"
        >
          <label htmlFor="player-name" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-600">
            ชื่อผู้เล่น
          </label>
          <input
            id="player-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
            placeholder="กรอกชื่อผู้เล่นของคุณ..."
            autoFocus
            maxLength={24}
            className="w-full rounded-xl border border-divider bg-bg px-4 py-3 text-base text-ink outline-none transition-all duration-150 placeholder:text-neutral-400 focus:border-accent focus:ring-2 focus:ring-accent"
          />

          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="mt-4 w-full cursor-pointer rounded-xl bg-accent px-6 py-3 font-heading text-base font-bold text-white shadow-[0_0_12px_color-mix(in_srgb,var(--color-accent)_35%,transparent)] transition-all duration-300 hover:bg-accent-600 hover:shadow-[0_0_20px_color-mix(in_srgb,var(--color-accent)_55%,transparent)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:active:scale-100 disabled:opacity-45 disabled:shadow-none"
          >
            เข้าสู่เกม / Start Game
          </button>

          <div className="mt-3 text-center text-xs text-neutral-500">
            กด Enter เพื่อเริ่มทันที ↵
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="absolute inset-x-0 bottom-4 z-10 text-center text-xs text-muted/60"
      >
        Made with ❤️ by Phathraphon Tanhan
      </motion.div>
    </main>
  );
}
