import { motion } from 'framer-motion';
import { playClickSFX } from '../utils/sfx.js';
import { springHover } from '../utils/styles.js';

const keyClass =
  'w-[52px] h-12 ' +
  'rounded-xl border border-neutral-300 bg-surface font-heading text-lg font-semibold text-ink shadow-sm ' +
  'transition-colors duration-150 cursor-pointer hover:bg-neutral-100 hover:border-accent-300 ' +
  'hover:shadow-[0_0_10px_color-mix(in_srgb,var(--color-accent)_16%,transparent)] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2';

function Key({ children, ...props }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      transition={springHover}
      className={keyClass}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export default function Numpad({ onDigit, onBackspace }) {
  return (
    <div className="grid grid-cols-3 auto-rows-[48px] gap-1.5">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
        <Key key={d} onClick={() => { playClickSFX(); onDigit(String(d)); }}>
          {d}
        </Key>
      ))}
      <div />
      <Key onClick={() => { playClickSFX(); onDigit('0'); }}>0</Key>
      <Key aria-label="ลบตัวอักษร" onClick={() => { playClickSFX(); onBackspace(); }}>⌫</Key>
    </div>
  );
}
