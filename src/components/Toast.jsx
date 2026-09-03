import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const onKey = (e) => { if (e.key === 'Escape') onDismiss(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toast, onDismiss]);

  const tone = toast && toast.tone === 'error'
    ? 'border-accent-700 bg-accent-100 text-accent-700 shadow-[0_0_16px_color-mix(in_srgb,var(--color-accent)_25%,transparent)]'
    : 'border-good bg-good-bg text-good shadow-[0_0_16px_color-mix(in_srgb,var(--color-good)_20%,transparent)]';
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 ${tone}`}
            role="status"
          >
            <span className="text-sm font-semibold">{toast.message}</span>
            <motion.button
              type="button"
              onClick={onDismiss}
              aria-label="ปิดการแจ้งเตือน"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="rounded-full px-1.5 text-xs font-bold opacity-70 transition-opacity duration-150 hover:opacity-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              ✕
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
