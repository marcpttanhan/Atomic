import { motion } from 'framer-motion';
import { HOWTO_STEPS } from '../data/guideContent.js';
import { fadeUp } from '../utils/motionVariants.js';

export default function HowToPlayGuide() {
  return (
    <div>
      <div className="mb-5 text-sm text-neutral-600">
        เริ่มเล่นได้ใน 4 ขั้นตอน — เลือกโหมด ป้อนคำตอบ ใช้คำใบ้เมื่อจำเป็น แล้วติดตามพัฒนาการของตัวเอง
      </div>
      <div className="flex flex-col">
        {HOWTO_STEPS.map((s, i) => (
          <motion.div
            key={s.n}
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            transition={{ ...fadeUp.transition, delay: i * 0.06 }}
            className="flex gap-4"
          >
            <div className="flex flex-col items-center">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent font-heading text-sm font-bold text-white shadow-[0_0_14px_color-mix(in_srgb,var(--color-accent)_30%,transparent)]">
                {s.n}
              </div>
              {i < HOWTO_STEPS.length - 1 && <div className="w-px flex-1 bg-divider" aria-hidden="true" />}
            </div>
            <div className={i < HOWTO_STEPS.length - 1 ? 'pb-6' : ''}>
              <div className="pt-1 font-heading text-base font-bold text-ink">{s.title}</div>
              <div className="mt-1 text-sm leading-relaxed text-neutral-600">{s.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
