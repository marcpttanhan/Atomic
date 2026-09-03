import { motion } from 'framer-motion';
import Numpad from './Numpad.jsx';
import { playSubmitSFX } from '../utils/sfx.js';
import { fadeUp, fadeUpFast } from '../utils/motionVariants.js';
import { primaryButtonClass, glowCardClass, glowBadgeClass, glowBadgeCyanClass, springHover } from '../utils/styles.js';

export default function TimeAttack({
  stage, high, onStart, timeLeft, score, current, input, canSubmit, onDigit, onBackspace, onSubmit,
}) {
  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-[620px]">
        {stage === 'ready' && (
          <motion.div {...fadeUp}>
            <div className="mb-2 font-heading text-2xl font-bold">ไทม์แอทแทค 60 วินาที</div>
            <div className="mb-5 text-[15px] text-neutral-600">ตอบให้ถูกให้ได้มากที่สุดภายในเวลา 60 วินาที</div>
            <div className={`mb-5 inline-block rounded-2xl border border-divider bg-surface p-5 shadow-md ${glowCardClass}`}>
              <div className="text-xs uppercase text-neutral-600">คะแนนสูงสุด</div>
              <div className="font-heading text-3xl font-bold">{high}</div>
            </div>
            <div>
              <motion.button
                type="button"
                onClick={() => { playSubmitSFX(); onStart(); }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={springHover}
                className={`px-5 py-2.5 ${primaryButtonClass}`}
              >
                เริ่มจับเวลา
              </motion.button>
            </div>
          </motion.div>
        )}

        {stage === 'running' && current && (
          <motion.div {...fadeUp} className={`rounded-2xl border border-neutral-200 bg-surface p-8 shadow-md ${glowCardClass}`}>
            <div className="flex items-center justify-between">
              <span className={`rounded-full bg-accent-100 px-2.5 py-0.5 text-[11px] text-accent-800 ${glowBadgeClass}`}>{timeLeft} วินาที</span>
              <span className={`rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] text-neutral-800 ${glowBadgeCyanClass}`}>คะแนน {score}</span>
            </div>
            <motion.div key={current.z} {...fadeUpFast}>
              <div className="mt-4 font-heading text-4xl font-bold leading-tight">{current.th} ({current.sym})</div>
              <div className="mt-1.5 text-[17px] text-neutral-700">เลขอะตอมเท่าไร?</div>
            </motion.div>
            <div className="mt-6 flex h-14 items-center rounded-xl border border-divider bg-surface px-4 font-heading text-2xl tracking-wide shadow-sm">
              {input || '—'}
            </div>
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
            <div className="mb-4 font-heading text-xl font-bold">หมดเวลา!</div>
            <div className="mb-5 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-divider p-4">
                <div className="text-xs uppercase text-neutral-600">คะแนน</div>
                <div className="font-heading text-2xl font-bold">{score}</div>
              </div>
              <div className="rounded-xl border border-divider p-4">
                <div className="text-xs uppercase text-neutral-600">คะแนนสูงสุด</div>
                <div className="font-heading text-2xl font-bold">{high}</div>
              </div>
            </div>
            <motion.button
              type="button"
              onClick={() => { playSubmitSFX(); onStart(); }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={springHover}
              className={`px-5 py-2.5 ${primaryButtonClass}`}
            >
              เล่นอีกครั้ง
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
