import { motion, AnimatePresence } from 'framer-motion';
import Numpad from './Numpad.jsx';
import { HintIcon, WarningIcon } from './icons.jsx';
import { playClickSFX, playSubmitSFX } from '../utils/sfx.js';
import { feedbackPulse, fadeUp, fadeUpFast } from '../utils/motionVariants.js';
import { primaryButtonClass, secondaryButtonClass, toggleClass, glowCardClass, springHover } from '../utils/styles.js';

export default function PracticeCard({
  mode, current, input, feedback, hintOpen, hint, mnemonic, examInfo, canSubmit, showEmpty,
  onDigit, onBackspace, onToggleHint, onSubmit, onBackToPractice,
}) {
  const modeLabel = mode === 'recall' ? 'ทบทวนข้อที่พลาด' : 'ฝึกฝน';

  const cardTone =
    feedback === 'correct'
      ? 'border-good bg-good-bg'
      : feedback === 'wrong'
        ? 'border-accent bg-accent-100'
        : 'border-neutral-200 bg-surface';

  return (
    <div className="min-w-0 flex-1 overflow-auto p-5">
      <div className="max-w-[560px]">
        <motion.div
          {...fadeUp}
          animate={{ ...fadeUp.animate, ...feedbackPulse(feedback) }}
          className={`rounded-2xl border p-8 shadow-md transition-colors ${glowCardClass} ${cardTone}`}
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-600">{modeLabel}</div>

          {current ? (
            <>
              <motion.div key={current.z} {...fadeUpFast}>
                <div className="mt-4 font-heading text-4xl font-bold leading-tight text-ink">
                  {current.th} ({current.sym})
                </div>
                <div className="mt-1.5 text-[17px] text-neutral-700">เลขอะตอมเท่าไร?</div>
              </motion.div>

              <AnimatePresence>
                {hintOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mt-4 rounded-xl border border-divider bg-neutral-100 p-3.5 text-sm text-neutral-700">
                      <div>{hint}</div>
                      <div className="mt-2 border-t border-divider pt-2 text-[13px]">
                        <strong>เทคนิคการจำ:</strong> {mnemonic}
                      </div>
                    </div>

                    {examInfo && (
                      <div className="mt-2 rounded-xl border border-cyan/40 bg-cyan-bg px-3.5 py-3 text-sm text-ink">
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-cyan">จุดที่ออกสอบบ่อย</div>
                        <div className="mt-1 font-semibold">{examInfo.tag}</div>
                        <div className="mt-1 text-[13px] text-neutral-700">{examInfo.examTip}</div>
                      </div>
                    )}

                    <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber/20 bg-amber-bg px-3 py-2 text-xs text-amber">
                      <WarningIcon className="mt-0.5 shrink-0" />
                      <span>คำเตือน: การเปิดดูคำตอบจากที่อื่น ถือเป็นการทำลายตัวเอง เพราะจะไม่ได้ฝึกฝนอะไร</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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
                <div className="flex w-24 flex-col gap-2.5">
                  <motion.button
                    type="button"
                    onClick={() => { playClickSFX(); onToggleHint(); }}
                    aria-pressed={hintOpen}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={springHover}
                    className={`flex flex-col items-center justify-center rounded-xl px-1 py-2.5 text-xs ${toggleClass(hintOpen)}`}
                  >
                    <HintIcon className="mb-1" />
                    <div>คำใบ้</div>
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => { playSubmitSFX(); onSubmit(); }}
                    disabled={!canSubmit}
                    whileHover={canSubmit ? { scale: 1.03 } : undefined}
                    whileTap={canSubmit ? { scale: 0.97 } : undefined}
                    transition={springHover}
                    className={`flex flex-1 items-center justify-center px-2 py-2 ${primaryButtonClass}`}
                  >
                    ตรวจ
                  </motion.button>
                </div>
              </div>
            </>
          ) : showEmpty ? (
            <div className="mt-5">
              <div className="text-lg font-semibold">ยังไม่มีธาตุที่ต้องทบทวน</div>
              <div className="mt-2 text-[15px] text-neutral-600">ตอบผิดข้อไหน ระบบจะเก็บไว้ให้ทบทวนที่นี่</div>
              <motion.button
                type="button"
                onClick={() => { playClickSFX(); onBackToPractice(); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={springHover}
                className={`mt-4 px-4 py-2 ${secondaryButtonClass}`}
              >
                กลับไปฝึกฝน
              </motion.button>
            </div>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}
