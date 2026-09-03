import { useState } from 'react';
import { motion } from 'framer-motion';
import { ELEMENTS } from '../data/elements.js';
import { loadSRSData, getMasteryScore, getMasteryTier, getAvgResponseMs } from '../utils/spacedRepetition.js';
import { playClickSFX } from '../utils/sfx.js';
import { fadeUp } from '../utils/motionVariants.js';
import { glowCardClass, springHover } from '../utils/styles.js';

const TIER_CLASS = {
  unattempted: 'border-divider bg-neutral-100 text-neutral-400',
  weak: 'border-accent-700 bg-accent text-white',
  medium: 'border-amber bg-amber text-white',
  strong: 'border-good bg-good text-white',
};

const TIER_LABEL = {
  unattempted: 'ยังไม่เคยฝึก',
  weak: 'อ่อน — พลาดบ่อย',
  medium: 'ปานกลาง',
  strong: 'แม่นยำ',
};

function gridPosition(el) {
  if (el.group === 'f') {
    const isLanthanide = el.period === 6;
    const startZ = isLanthanide ? 57 : 89;
    return { row: isLanthanide ? 9 : 10, col: 3 + (el.z - startZ) };
  }
  return { row: el.period, col: el.group };
}

export default function MasteryHeatmap() {
  const [srsData] = useState(loadSRSData);
  const [activeZ, setActiveZ] = useState(null);

  const cells = ELEMENTS.map((el) => {
    const record = srsData[el.z];
    const tier = getMasteryTier(record);
    const { row, col } = gridPosition(el);
    return { el, record, tier, row, col };
  });

  const attemptedCount = cells.filter((c) => c.tier !== 'unattempted').length;
  const strongCount = cells.filter((c) => c.tier === 'strong').length;
  const weakCount = cells.filter((c) => c.tier === 'weak').length;

  const active = activeZ ? cells.find((c) => c.el.z === activeZ) : null;
  const activeAccuracy = active && active.record && active.record.attempts
    ? Math.round((active.record.correct / active.record.attempts) * 100)
    : null;
  const activeAvgMs = active ? getAvgResponseMs(active.record) : null;

  return (
    <div className="flex-1 overflow-auto p-8">
      <motion.div {...fadeUp} className="max-w-[1100px]">
        <div className="mb-1.5 font-heading text-2xl font-bold">แผนที่ความจำ</div>
        <div className="mb-6 text-[15px] text-neutral-600">
          สีของแต่ละธาตุสะท้อนความแม่นยำในการจำ — ระบบจะเลือกธาตุที่ยังอ่อนมาให้ฝึกบ่อยขึ้นโดยอัตโนมัติในโหมดฝึกฝน
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <motion.div whileHover={{ y: -3, scale: 1.02 }} transition={springHover} className={`rounded-2xl border border-divider bg-surface p-4 shadow-md hover:border-accent-300 ${glowCardClass}`}>
            <div className="text-xs uppercase tracking-wide text-neutral-600">ฝึกแล้ว</div>
            <div className="mt-1 font-heading text-2xl font-bold">{attemptedCount}/{ELEMENTS.length}</div>
          </motion.div>
          <motion.div whileHover={{ y: -3, scale: 1.02 }} transition={springHover} className={`rounded-2xl border border-divider bg-surface p-4 shadow-md hover:border-good ${glowCardClass}`}>
            <div className="text-xs uppercase tracking-wide text-neutral-600">แม่นยำ</div>
            <div className="mt-1 font-heading text-2xl font-bold text-good">{strongCount}</div>
          </motion.div>
          <motion.div whileHover={{ y: -3, scale: 1.02 }} transition={springHover} className={`rounded-2xl border border-divider bg-surface p-4 shadow-md hover:border-accent-300 ${glowCardClass}`}>
            <div className="text-xs uppercase tracking-wide text-neutral-600">ต้องฝึกเพิ่ม</div>
            <div className="mt-1 font-heading text-2xl font-bold text-accent-700">{weakCount}</div>
          </motion.div>
          <motion.div whileHover={{ y: -3, scale: 1.02 }} transition={springHover} className={`rounded-2xl border border-divider bg-surface p-4 shadow-md hover:border-cyan/40 ${glowCardClass}`}>
            <div className="mb-1 text-xs uppercase tracking-wide text-neutral-600">ธาตุที่เลือก</div>
            {active ? (
              <div>
                <div className="font-heading text-lg font-bold leading-tight">{active.el.sym} · {active.el.th}</div>
                <div className="text-xs text-neutral-600">
                  {TIER_LABEL[active.tier]}
                  {activeAccuracy !== null && ` · แม่นยำ ${activeAccuracy}%`}
                  {activeAvgMs !== null && ` · เฉลี่ย ${(activeAvgMs / 1000).toFixed(1)} วิ`}
                </div>
              </div>
            ) : (
              <div className="text-sm text-neutral-600">วางเมาส์หรือคลิกที่ธาตุ</div>
            )}
          </motion.div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-neutral-600">
          {['unattempted', 'weak', 'medium', 'strong'].map((tier) => (
            <div key={tier} className="flex items-center gap-1.5">
              <span className={`h-3 w-3 rounded-sm border ${TIER_CLASS[tier]}`} />
              {TIER_LABEL[tier]}
            </div>
          ))}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-divider bg-surface p-4 shadow-md">
          <div
            className="grid w-fit gap-1"
            style={{ gridTemplateColumns: 'repeat(18, minmax(34px, 1fr))', gridTemplateRows: 'repeat(10, minmax(34px, 1fr))' }}
          >
            {cells.map(({ el, tier, row, col }) => (
              <motion.button
                key={el.z}
                type="button"
                onMouseEnter={() => setActiveZ(el.z)}
                onClick={() => { playClickSFX(); setActiveZ(el.z); }}
                title={`${el.sym} (${el.z}) — ${el.th} — ${TIER_LABEL[tier]}`}
                aria-label={`${el.th}, เลขอะตอม ${el.z}, ${TIER_LABEL[tier]}`}
                style={{ gridRow: row, gridColumn: col }}
                whileHover={{ scale: 1.15, zIndex: 10 }}
                whileTap={{ scale: 0.92 }}
                transition={springHover}
                className={
                  'flex aspect-square flex-col items-center justify-center rounded-md border ' +
                  'text-[11px] font-semibold ' +
                  'transition-shadow duration-150 cursor-pointer hover:shadow-md ' +
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 ' +
                  TIER_CLASS[tier] +
                  (activeZ === el.z ? ' ring-2 ring-ink ring-offset-1' : '')
                }
              >
                {el.sym}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
