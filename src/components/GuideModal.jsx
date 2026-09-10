import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BenefitsShowcase from './BenefitsShowcase.jsx';
import HowToPlayGuide from './HowToPlayGuide.jsx';
import { playClickSFX } from '../utils/sfx.js';
import { springHover } from '../utils/styles.js';

const TABS = [
  { id: 'benefits', label: 'ประโยชน์ของการจำเลขอะตอม' },
  { id: 'howto', label: 'วิธีการเล่น' },
];

export default function GuideModal({ open, onClose }) {
  const [tab, setTab] = useState('benefits');

  // onClose is typically a fresh inline arrow function from the caller on
  // every render (see App.jsx/WelcomeScreen.jsx) — reading it via a ref keeps
  // this effect's dependency array to just `open`, instead of tearing down
  // and re-attaching the window listener on every unrelated parent re-render.
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; });

  // Escape closes, matching every other dismissible overlay in this app
  // (AudioPlayer's popover, Toast).
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onCloseRef.current(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Lock background scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="คู่มือการใช้งานและประโยชน์"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={springHover}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-divider bg-surface/95 shadow-md backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-divider px-6 py-4">
              <div className="font-heading text-lg font-bold text-ink">คู่มือและประโยชน์ของแอป</div>
              <button
                type="button"
                onClick={() => { playClickSFX(); onClose(); }}
                aria-label="ปิดหน้าต่าง"
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 transition-colors duration-150 cursor-pointer hover:bg-neutral-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                ✕
              </button>
            </div>

            <div role="tablist" aria-label="แท็บคู่มือ" className="flex gap-1 border-b border-divider px-4 pt-3">
              {TABS.map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => { playClickSFX(); setTab(t.id); }}
                    className={
                      'relative cursor-pointer rounded-t-lg px-4 py-2 text-sm font-semibold ' +
                      'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 ' +
                      (active ? 'text-accent-700' : 'text-neutral-600 hover:text-ink')
                    }
                  >
                    {active && (
                      <motion.span
                        layoutId="guide-tab-underline"
                        className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-accent"
                        transition={springHover}
                      />
                    )}
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-auto p-6">
              {tab === 'benefits' ? <BenefitsShowcase /> : <HowToPlayGuide />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
