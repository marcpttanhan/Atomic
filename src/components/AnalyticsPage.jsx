import { motion } from 'framer-motion';
import { playClickSFX } from '../utils/sfx.js';
import { fadeUp } from '../utils/motionVariants.js';
import { secondaryButtonClass, glowCardClass, springHover } from '../utils/styles.js';

const statCards = (statsAsked, statsCorrect, accuracyPct, avgSec) => [
  { label: 'ตอบทั้งหมด', value: statsAsked },
  { label: 'ตอบถูก', value: statsCorrect },
  { label: 'ความแม่นยำ', value: accuracyPct },
  { label: 'เวลาเฉลี่ย/ข้อ', value: avgSec },
];

export default function AnalyticsPage({
  statsAsked, statsCorrect, accuracyPct, avgSec, missedList,
  hasBothAssess, preAccuracyLabel, postAccuracyLabel, preAcc, postAcc, deltaLabel, deltaPositive,
  onExport,
}) {
  return (
    <div className="flex-1 overflow-auto p-8">
      <motion.div {...fadeUp} className="max-w-[960px]">
        <div className="mb-6 font-heading text-2xl font-bold">สถิติ &amp; จุดอ่อน</div>

        <div className="mb-7 grid grid-cols-4 gap-4">
          {statCards(statsAsked, statsCorrect, accuracyPct, avgSec).map((c) => (
            <motion.div
              key={c.label}
              whileHover={{ y: -3, scale: 1.02 }}
              transition={springHover}
              className={`rounded-2xl border border-divider bg-surface p-5 shadow-md hover:border-accent-300 ${glowCardClass}`}
            >
              <div className="text-xs uppercase tracking-wide text-neutral-600">{c.label}</div>
              <div className="mt-1.5 font-heading text-3xl font-bold">{c.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="mb-6 h-px bg-divider" />
        <div className="mb-4 font-heading text-lg font-bold">คลังธาตุที่พลาด</div>
        {missedList.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-divider bg-surface shadow-md">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {['สัญลักษณ์', 'ชื่อธาตุ', 'เลขอะตอม', 'พลาดกี่ครั้ง', 'ตอบถูกติดต่อกัน'].map((h) => (
                    <th key={h} className="border-b-2 border-divider px-3 py-2.5 text-left text-[11px] uppercase tracking-wide text-neutral-600">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {missedList.map((m) => (
                  <tr key={m.z} className="hover:bg-neutral-100">
                    <td className="border-b border-divider px-3 py-2"><strong>{m.sym}</strong></td>
                    <td className="border-b border-divider px-3 py-2">{m.th}</td>
                    <td className="border-b border-divider px-3 py-2">{m.z}</td>
                    <td className="border-b border-divider px-3 py-2">{m.count}</td>
                    <td className="border-b border-divider px-3 py-2">{m.streakLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-[15px] text-neutral-600">ยังไม่มีข้อมูล เริ่มฝึกฝนเพื่อดูสถิติที่นี่</div>
        )}

        <div className="my-7 h-px bg-divider" />
        <div className="mb-4 font-heading text-lg font-bold">พัฒนาการเรียนรู้ (ก่อน–หลัง)</div>
        {hasBothAssess ? (
          <div className="max-w-[520px]">
            <div className="mb-1.5 text-[13px] text-neutral-600">
              ความแม่นยำ: ก่อนเรียน {preAccuracyLabel} → หลังเรียน {postAccuracyLabel}
            </div>
            <div className="mb-5 flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-20 text-xs text-neutral-600">ก่อนเรียน</div>
                <div className="h-4 flex-1 overflow-hidden rounded-full border border-divider bg-neutral-100">
                  <div className="h-full rounded-full bg-neutral-600" style={{ width: `${preAcc}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-20 text-xs text-neutral-600">หลังเรียน</div>
                <div className="h-4 flex-1 overflow-hidden rounded-full border border-divider bg-neutral-100">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${postAcc}%` }} />
                </div>
              </div>
            </div>
            <div className={`text-sm font-semibold ${deltaPositive ? 'text-good' : 'text-accent-700'}`}>{deltaLabel}</div>
          </div>
        ) : (
          <div className="text-[15px] text-neutral-600">
            ทำแบบทดสอบก่อนเรียนและหลังเรียนให้ครบเพื่อดูกราฟเปรียบเทียบ (ไปที่เมนู "ประเมินผล")
          </div>
        )}

        <div className="my-7 h-px bg-divider" />
        <motion.button
          type="button"
          onClick={() => { playClickSFX(); onExport(); }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={springHover}
          className={`px-4 py-2 ${secondaryButtonClass}`}
        >
          ส่งออกรายงานความคืบหน้า
        </motion.button>
      </motion.div>
    </div>
  );
}
