import { motion } from 'framer-motion';
import { BENEFITS } from '../data/guideContent.js';
import { fadeUp } from '../utils/motionVariants.js';
import { glowCardClass, springHover } from '../utils/styles.js';

export default function BenefitsShowcase() {
  return (
    <div>
      <div className="mb-4 text-sm text-neutral-600">
        การจำเลขอะตอมได้แม่นยำไม่ใช่แค่ท่องจำ แต่เป็นทางลัดที่ช่วยประหยัดเวลาและลดความผิดพลาดทั้งในห้องเรียนและห้องสอบ
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {BENEFITS.map((b, i) => (
          <motion.div
            key={b.title}
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            transition={{ ...fadeUp.transition, delay: i * 0.04 }}
            whileHover={{ y: -2, scale: 1.01, transition: springHover }}
            className={`rounded-xl border border-divider bg-surface/80 p-4 backdrop-blur-sm transition-colors duration-150 hover:border-accent-300 ${glowCardClass}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl leading-none" aria-hidden="true">{b.emoji}</span>
              <div>
                <div className="font-heading text-[15px] font-bold leading-snug text-ink">{b.title}</div>
                <div className="mt-1 text-[13px] leading-relaxed text-neutral-600">{b.desc}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
