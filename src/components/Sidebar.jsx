import { motion } from 'framer-motion';
import { PracticeIcon, RecallIcon, AssessmentIcon, TimeAttackIcon, MatchIcon, HeatmapIcon, StatsIcon, SettingsIcon, GameModeIcon } from './icons.jsx';
import { playClickSFX } from '../utils/sfx.js';
import { springHover } from '../utils/styles.js';

const ITEMS = [
  { mode: 'gamemode', label: 'โหมดการเล่น', Icon: GameModeIcon },
  { mode: 'practice', label: 'ฝึกฝน', Icon: PracticeIcon },
  { mode: 'recall', label: 'ทบทวนข้อที่พลาด', Icon: RecallIcon },
  { mode: 'assessment', label: 'ประเมินผล', Icon: AssessmentIcon },
  { mode: 'timeattack', label: 'ไทม์แอทแทค', Icon: TimeAttackIcon },
  { mode: 'matchmaking', label: 'แข่งขัน 1v1', Icon: MatchIcon },
  { mode: 'heatmap', label: 'แผนที่ความจำ', Icon: HeatmapIcon },
  { mode: 'stats', label: 'สถิติ & จุดอ่อน', Icon: StatsIcon },
  { mode: 'settings', label: 'ตั้งค่า', Icon: SettingsIcon },
];

export default function Sidebar({ mode, onSetMode }) {
  return (
    <nav className="relative z-10 flex w-[190px] shrink-0 flex-col gap-1 border-r border-divider p-3">
      {ITEMS.map(({ mode: m, label, Icon }, i) => {
        const active = mode === m;
        return (
          <motion.button
            key={m}
            type="button"
            onClick={() => { playClickSFX(); onSetMode(m); }}
            aria-current={active ? 'page' : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.35, delay: i * 0.035 }}
            className={
              'relative flex w-full items-center rounded-xl px-3 py-2.5 ' +
              'text-left text-sm font-medium ' +
              'transition-colors duration-150 cursor-pointer ' +
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ' +
              (active ? 'font-semibold text-accent-700' : 'text-ink hover:bg-accent-100/60')
            }
          >
            {active && (
              <motion.span
                layoutId="sidebar-active-pill"
                className="absolute inset-0 rounded-xl bg-accent-100 shadow-[0_0_14px_color-mix(in_srgb,var(--color-accent)_25%,transparent)]"
                transition={{ type: 'spring', stiffness: 480, damping: 34 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2.5">
              <Icon />
              {label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
}
