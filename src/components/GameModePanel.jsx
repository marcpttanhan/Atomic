import { motion } from 'framer-motion';
import GameModeSelector from './GameModeSelector.jsx';
import CreditsSection from './CreditsSection.jsx';
import { fadeUp } from '../utils/motionVariants.js';

export default function GameModePanel({ preset, onSelectPreset }) {
  return (
    <div className="flex-1 overflow-auto p-8">
      <motion.div {...fadeUp} className="max-w-[780px]">
        <div className="mb-1 font-heading text-2xl font-bold">โหมดการเล่น</div>
        <div className="mb-6 text-sm text-neutral-600">เลือกกลุ่มธาตุให้ตรงกับเป้าหมายการสอบของคุณ</div>

        <GameModeSelector preset={preset} onSelectPreset={onSelectPreset} />

        <div className="my-8 h-px bg-divider" />

        <CreditsSection />
      </motion.div>
    </div>
  );
}
