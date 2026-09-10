import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playClickSFX } from '../utils/sfx.js';
import { glowBadgeClass, glowBadgeGoodClass, springHover } from '../utils/styles.js';

export default function ModeStatsDrawer({ modeLabel, accuracyPct, attemptedCount, totalCount, mastered, needReview }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-divider bg-surface/40 px-5">
      <button
        type="button"
        onClick={() => { playClickSFX(); setOpen((o) => !o); }}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded py-2.5 text-left text-[13px] font-semibold text-neutral-700 transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
      >
        <span className="flex flex-wrap items-center gap-2">
          สถิติโหมด: {modeLabel}
          <span className={`rounded-full bg-accent-100 px-2 py-0.5 text-[11px] text-accent-800 ${glowBadgeClass}`}>
            ความแม่นยำ {accuracyPct === null ? '—' : `${accuracyPct}%`}
          </span>
          <span className="text-xs font-normal text-neutral-500">ฝึกแล้ว {attemptedCount}/{totalCount}</span>
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={springHover} aria-hidden="true">
          ▾
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="grid gap-4 pb-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-600">
                  ตอบถูกบ่อย ({mastered.length})
                </div>
                {mastered.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {mastered.map((m) => (
                      <span
                        key={m.z}
                        title={`${m.accuracyPct}% แม่นยำ`}
                        className={`rounded-full bg-good-bg px-2.5 py-1 text-[12px] font-semibold text-good ${glowBadgeGoodClass}`}
                      >
                        {m.sym} · {m.th}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-neutral-500">ยังไม่มีธาตุที่แม่นยำ ≥80% ในโหมดนี้</div>
                )}
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-600">
                  ต้องทบทวน ({needReview.length})
                </div>
                {needReview.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {needReview.map((m) => (
                      <span
                        key={m.z}
                        title={`ผิด ${m.count} ครั้ง`}
                        className={`rounded-full bg-accent-100 px-2.5 py-1 text-[12px] font-semibold text-accent-800 ${glowBadgeClass}`}
                      >
                        {m.sym} · {m.th}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-neutral-500">ยังไม่มีธาตุที่ต้องทบทวนในโหมดนี้</div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
