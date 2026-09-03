import { motion } from 'framer-motion';
import Numpad from './Numpad.jsx';
import { playClickSFX, playSubmitSFX } from '../utils/sfx.js';
import { feedbackPulse, fadeUp, fadeUpFast } from '../utils/motionVariants.js';
import { primaryButtonClass, secondaryButtonClass, glowCardClass, springHover } from '../utils/styles.js';

export default function AssessmentPanel({
  stage, hasPre, hasPost, preSummary, postSummary, onStartPre, onStartPost,
  assessTitle, assessProgress, current, input, feedback, canSubmit,
  onDigit, onBackspace, onSubmit, assessResultAccuracy, assessResultAvgSec, onBackToSelect,
}) {
  const cardTone =
    feedback === 'correct'
      ? 'border-good bg-good-bg'
      : feedback === 'wrong'
        ? 'border-accent bg-accent-100'
        : 'border-neutral-200 bg-surface';

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-[620px]">
        {stage === 'select' && (
          <motion.div {...fadeUp}>
            <div className="mb-2 font-heading text-2xl font-bold">ประเมินผล</div>
            <div className="mb-6 text-[15px] text-neutral-600">
              แบบทดสอบ 20 ข้อแบบสุ่มจากธาตุทั้งหมด 118 ธาตุ ใช้เปรียบเทียบผลก่อนและหลังเรียน
            </div>
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ y: -3 }}
                transition={springHover}
                className={`rounded-2xl border border-divider bg-surface p-5 shadow-md ${glowCardClass}`}
              >
                <div className="mb-1.5 text-base font-bold">แบบทดสอบก่อนเรียน</div>
                <div className="mb-3 text-[13px] text-neutral-600">{hasPre ? `ล่าสุด: ${preSummary}` : 'ยังไม่เคยทำ'}</div>
                <motion.button
                  type="button"
                  onClick={() => { playSubmitSFX(); onStartPre(); }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={springHover}
                  className={`w-full justify-center px-4 py-2.5 text-center ${primaryButtonClass}`}
                >
                  เริ่มทำ
                </motion.button>
              </motion.div>
              <motion.div
                whileHover={{ y: -3 }}
                transition={springHover}
                className={`rounded-2xl border border-divider bg-surface p-5 shadow-md ${glowCardClass}`}
              >
                <div className="mb-1.5 text-base font-bold">แบบทดสอบหลังเรียน</div>
                <div className="mb-3 text-[13px] text-neutral-600">{hasPost ? `ล่าสุด: ${postSummary}` : 'ยังไม่เคยทำ'}</div>
                <motion.button
                  type="button"
                  onClick={() => { playSubmitSFX(); onStartPost(); }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={springHover}
                  className={`w-full justify-center px-4 py-2.5 text-center ${secondaryButtonClass}`}
                >
                  เริ่มทำ
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {stage === 'running' && current && (
          <motion.div
            {...fadeUp}
            animate={{ ...fadeUp.animate, ...feedbackPulse(feedback) }}
            className={`rounded-2xl border p-8 shadow-md transition-colors ${glowCardClass} ${cardTone}`}
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-600">{assessTitle}</div>
              <span className="rounded-full border border-cyan/40 bg-neutral-100 px-2.5 py-0.5 text-[11px] text-neutral-800">{assessProgress}</span>
            </div>
            <motion.div key={current.z} {...fadeUpFast}>
              <div className="mt-4 font-heading text-4xl font-bold leading-tight">{current.th} ({current.sym})</div>
              <div className="mt-1.5 text-[17px] text-neutral-700">เลขอะตอมเท่าไร?</div>
            </motion.div>
            <div className="mt-6 flex h-14 items-center rounded-xl border border-divider bg-surface px-4 font-heading text-2xl tracking-wide shadow-sm">
              {input || '—'}
            </div>
            {feedback && (
              <div className={`mt-2.5 text-[15px] font-semibold ${feedback === 'correct' ? 'text-good' : 'text-accent-700'}`}>
                {feedback === 'correct' ? 'ถูกต้อง!' : `ไม่ถูกต้อง — คำตอบคือ ${current.z}`}
              </div>
            )}
            <div className="mt-6 flex gap-3.5">
              <Numpad onDigit={onDigit} onBackspace={onBackspace} />
              <motion.button
                type="button"
                onClick={() => { playSubmitSFX(); onSubmit(); }}
                disabled={!canSubmit}
                whileHover={canSubmit ? { scale: 1.03 } : undefined}
                whileTap={canSubmit ? { scale: 0.97 } : undefined}
                transition={springHover}
                className={`h-12 self-end px-5 ${primaryButtonClass}`}
              >
                ตรวจ
              </motion.button>
            </div>
          </motion.div>
        )}

        {stage === 'done' && (
          <motion.div {...fadeUp} className="rounded-2xl border border-divider bg-surface p-8 shadow-md">
            <div className="mb-4 font-heading text-xl font-bold">{assessTitle} — เสร็จสิ้น</div>
            <div className="mb-5 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-divider p-4">
                <div className="text-xs uppercase text-neutral-600">ความแม่นยำ</div>
                <div className="font-heading text-2xl font-bold">{assessResultAccuracy}</div>
              </div>
              <div className="rounded-xl border border-divider p-4">
                <div className="text-xs uppercase text-neutral-600">เวลาเฉลี่ย/ข้อ</div>
                <div className="font-heading text-2xl font-bold">{assessResultAvgSec}</div>
              </div>
            </div>
            <motion.button
              type="button"
              onClick={() => { playClickSFX(); onBackToSelect(); }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={springHover}
              className={`px-4 py-2 ${secondaryButtonClass}`}
            >
              กลับหน้าประเมินผล
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
