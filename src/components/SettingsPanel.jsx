import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { playClickSFX, playSubmitSFX } from '../utils/sfx.js';
import { fadeUp } from '../utils/motionVariants.js';
import { primaryButtonClass, secondaryButtonClass, toggleClass, springHover } from '../utils/styles.js';

function SoundToggle({ label, on, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={springHover}
      className={`rounded-xl px-3.5 py-2.5 ${toggleClass(on)}`}
    >
      {label}: {on ? 'เปิด' : 'ปิด'}
    </motion.button>
  );
}

export default function SettingsPanel({ sound, onToggleSound, onReset, onExportSave, onImportSave, playerName, onSaveName, theme, onSetTheme }) {
  const fileInputRef = useRef(null);
  const [nameInput, setNameInput] = useState(playerName || '');

  const handleImportClick = () => {
    playClickSFX();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) onImportSave?.(file);
    e.target.value = '';
  };

  const nameChanged = nameInput.trim().length > 0 && nameInput.trim() !== playerName;

  const handleSaveName = () => {
    if (!nameChanged) return;
    playSubmitSFX();
    onSaveName?.(nameInput);
  };

  return (
    <div className="flex-1 overflow-auto p-8">
      <motion.div {...fadeUp} className="max-w-[600px]">
        <div className="mb-6 font-heading text-2xl font-bold">ตั้งค่า</div>

        <div className="mb-3 font-semibold">โปรไฟล์ผู้เล่น</div>
        <div className="mb-6 flex flex-wrap items-center gap-2.5">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); }}
            maxLength={24}
            placeholder="กรอกชื่อผู้เล่นของคุณ..."
            aria-label="ชื่อผู้เล่น"
            className="min-w-0 flex-1 rounded-xl border border-divider bg-surface px-4 py-2.5 text-sm shadow-sm outline-none transition-all duration-150 focus:border-accent-700 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          />
          <motion.button
            type="button"
            onClick={handleSaveName}
            disabled={!nameChanged}
            whileHover={nameChanged ? { scale: 1.03 } : undefined}
            whileTap={nameChanged ? { scale: 0.97 } : undefined}
            transition={springHover}
            className={`px-4 py-2.5 ${primaryButtonClass}`}
          >
            บันทึกชื่อ
          </motion.button>
        </div>

        <div className="my-6 h-px bg-divider" />
        <div className="mb-3 font-semibold">ธีม</div>
        <div className="mb-6 flex gap-2.5" role="group" aria-label="เลือกธีมสี">
          <motion.button
            type="button"
            onClick={() => { playClickSFX(); onSetTheme('light'); }}
            aria-pressed={theme === 'light'}
            aria-label="โหมดสว่าง"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={springHover}
            className={`rounded-xl px-3.5 py-2.5 ${toggleClass(theme === 'light')}`}
          >
            โหมดสว่าง (Light)
          </motion.button>
          <motion.button
            type="button"
            onClick={() => { playClickSFX(); onSetTheme('dark'); }}
            aria-pressed={theme === 'dark'}
            aria-label="โหมดมืด"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={springHover}
            className={`rounded-xl px-3.5 py-2.5 ${toggleClass(theme === 'dark')}`}
          >
            โหมดมืด (Dark)
          </motion.button>
        </div>

        <div className="my-6 h-px bg-divider" />
        <div className="mb-3 font-semibold">เสียงเอฟเฟกต์</div>
        <div className="mb-6 flex gap-2.5">
          <SoundToggle label="เสียงตอบถูก" on={sound.correct} onClick={() => { playClickSFX(); onToggleSound('correct'); }} />
          <SoundToggle label="เสียงตอบผิด" on={sound.wrong} onClick={() => { playClickSFX(); onToggleSound('wrong'); }} />
          <SoundToggle label="เสียงคอมโบ" on={sound.combo} onClick={() => { playClickSFX(); onToggleSound('combo'); }} />
        </div>

        <div className="my-6 h-px bg-divider" />
        <div className="mb-3 font-semibold">ข้อมูลบันทึก</div>
        <div className="mb-1.5 text-sm text-neutral-600">
          ดาวน์โหลดไฟล์บันทึกความคืบหน้า (แร้งค์ Elo, ประวัติการแข่งขัน, สถิติการฝึกฝน, การตั้งค่า) เพื่อเก็บสำรอง หรือย้ายไปเครื่องอื่น
        </div>
        <div className="mb-6 flex flex-wrap gap-2.5">
          <motion.button
            type="button"
            onClick={() => { playSubmitSFX(); onExportSave(); }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={springHover}
            className={`px-4 py-2.5 ${primaryButtonClass}`}
          >
            ดาวน์โหลดไฟล์บันทึก
          </motion.button>
          <motion.button
            type="button"
            onClick={handleImportClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={springHover}
            className={`px-4 py-2.5 ${secondaryButtonClass}`}
          >
            นำเข้าไฟล์บันทึก
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="my-6 h-px bg-divider" />
        <motion.button
          type="button"
          onClick={() => { playClickSFX(); onReset(); }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={springHover}
          className="rounded-xl px-2 py-1.5 font-heading font-bold text-accent transition-colors duration-150 hover:bg-accent-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          ล้างข้อมูลความคืบหน้าทั้งหมด
        </motion.button>
      </motion.div>
    </div>
  );
}
