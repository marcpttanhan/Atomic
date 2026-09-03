import { motion } from 'framer-motion';
import { playClickSFX } from '../utils/sfx.js';
import { fadeUp } from '../utils/motionVariants.js';
import { primaryButtonClass, secondaryButtonClass, glowBadgeClass, springHover } from '../utils/styles.js';

export default function StatsPanel({
  accuracyPct, avgSec, rank, rankProgressPct, rankPointsLabel, weekDots, streakMultiplierActive,
  topMissed, ctaLabel, onCta, ctaDisabled, ctaPrimary,
}) {
  return (
    <motion.div {...fadeUp} className="flex w-60 shrink-0 flex-col gap-5 overflow-auto border-l border-divider p-4">
      <div>
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-600">สรุปการเล่น</div>
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            whileHover={{ scale: 1.03, y: -2 }}
            transition={springHover}
            className="rounded-xl border border-divider bg-surface p-3 shadow-sm hover:border-accent-300 hover:shadow-[0_0_14px_color-mix(in_srgb,var(--color-accent)_16%,transparent)]"
          >
            <div className="font-heading text-xl font-bold">{accuracyPct}</div>
            <div className="text-xs text-neutral-600">ความแม่นยำ</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.03, y: -2 }}
            transition={springHover}
            className="rounded-xl border border-divider bg-surface p-3 shadow-sm hover:border-accent-300 hover:shadow-[0_0_14px_color-mix(in_srgb,var(--color-accent)_16%,transparent)]"
          >
            <div className="font-heading text-xl font-bold">{avgSec}</div>
            <div className="text-xs text-neutral-600">เวลาเฉลี่ย/ข้อ</div>
          </motion.div>
        </div>
      </div>

      <div className="h-px bg-divider" />

      <div>
        <div className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-600">แร้งค์</div>
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: rank.color }} />
          <span className="text-sm font-semibold">{rank.name} · {rank.sub}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full border border-divider bg-neutral-100">
          <motion.div
            className="h-full rounded-full"
            style={{ background: rank.color }}
            animate={{ width: `${rankProgressPct}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <div className="mt-1.5 text-xs text-neutral-600">{rankPointsLabel}</div>
      </div>

      <div className="h-px bg-divider" />

      <div>
        <div className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-600">สัปดาห์นี้</div>
        <div className="flex gap-1.5">
          {weekDots.map((d) => (
            <div
              key={d.title}
              title={d.title}
              className={
                'flex h-6 w-6 items-center justify-center rounded-md border text-[10px] font-semibold ' +
                (d.isToday ? 'border-accent-700' : 'border-divider')
              }
              style={{ background: d.active ? 'var(--color-accent)' : 'var(--color-surface)', color: d.active ? '#fff' : 'var(--color-neutral-600)' }}
            >
              {d.short}
            </div>
          ))}
        </div>
        {streakMultiplierActive && (
          <div className="mt-2 text-xs text-accent-700">สตรีค 5 วัน+ ได้โบนัสคะแนน ×1.2</div>
        )}
      </div>

      <div className="h-px bg-divider" />

      <div>
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-600">ธาตุที่พลาดบ่อย</div>
        {topMissed.length > 0 ? (
          topMissed.map((m) => (
            <div key={m.z} className="flex items-center justify-between border-b border-divider py-2 text-sm">
              <span><strong>{m.sym}</strong> — {m.th}</span>
              <span className={`rounded-full bg-accent-100 px-2.5 py-0.5 text-[11px] text-accent-800 ${glowBadgeClass}`}>ผิด {m.count}</span>
            </div>
          ))
        ) : (
          <div className="text-sm text-neutral-600">ยังไม่มีข้อผิดพลาด</div>
        )}
      </div>

      <motion.button
        type="button"
        onClick={() => { playClickSFX(); onCta(); }}
        disabled={ctaDisabled}
        whileHover={!ctaDisabled ? { scale: 1.02 } : undefined}
        whileTap={!ctaDisabled ? { scale: 0.98 } : undefined}
        transition={springHover}
        className={`w-full justify-center px-4 py-2.5 text-center ${ctaPrimary ? primaryButtonClass : secondaryButtonClass}`}
      >
        {ctaLabel}
      </motion.button>
    </motion.div>
  );
}
