import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ELEMENTS } from '../data/elements.js';
import Numpad from './Numpad.jsx';
import { FlameIcon } from './icons.jsx';
import {
  calculateNewElo, getEloRank, getSearchTolerance, findClosestOpponent,
  generateOpponentPool, botAnswerDelayMs, botAnswersCorrectly,
} from '../utils/elo.js';
import { playClickSFX, playSubmitSFX } from '../utils/sfx.js';
import { recordAnswer } from '../utils/spacedRepetition.js';
import { feedbackPulse, fadeUp, fadeUpFast } from '../utils/motionVariants.js';
import { primaryButtonClass, secondaryButtonClass, glowCardClass, springHover } from '../utils/styles.js';

const QUESTION_COUNT = 10;

function pickBattleQueue() {
  return [...ELEMENTS].sort(() => Math.random() - 0.5).slice(0, QUESTION_COUNT);
}

function createInitialBattle() {
  return {
    queue: pickBattleQueue(),
    startTime: Date.now(),
    player: { idx: 0, correct: 0, streak: 0, bestStreak: 0, input: '', feedback: null, qStart: Date.now(), done: false, finishTime: null },
    opp: { idx: 0, correct: 0, streak: 0, bestStreak: 0, done: false, finishTime: null },
  };
}

function SidePanel({ label, name, elo, idx, correct, streak, isPlayer }) {
  const answered = idx;
  const accuracyPct = answered ? Math.round((correct / answered) * 100) : 0;
  const progressPct = Math.round((idx / QUESTION_COUNT) * 100);
  return (
    <div className={`flex-1 rounded-2xl border p-5 shadow-md ${glowCardClass} ${isPlayer ? 'border-accent-700 bg-accent-100' : 'border-divider bg-surface'}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-600">{label}</div>
          <div className="font-heading text-lg font-bold">{name}</div>
        </div>
        <div className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">{elo} Elo</div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full border border-divider bg-neutral-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isPlayer ? 'bg-accent' : 'bg-neutral-600'}`}
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <div className="mt-1.5 text-xs text-neutral-600">โจทย์ {Math.min(idx + (idx < QUESTION_COUNT ? 1 : 0), QUESTION_COUNT)}/{QUESTION_COUNT}</div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-divider bg-surface p-2.5 text-center">
          <div className="font-heading text-xl font-bold">{accuracyPct}%</div>
          <div className="text-[11px] text-neutral-600">ความแม่นยำ</div>
        </div>
        <div className="flex items-center justify-center gap-1.5 rounded-xl border border-divider bg-surface p-2.5">
          <FlameIcon active={streak > 0} />
          <span className="font-heading text-xl font-bold">{streak}</span>
        </div>
      </div>
    </div>
  );
}

export default function MatchmakingPanel({ playerName, playerElo, matchHistory, onMatchComplete }) {
  const [phase, setPhase] = useState('idle'); // idle | searching | found | battle | result
  const [searchSeconds, setSearchSeconds] = useState(0);
  const [opponent, setOpponent] = useState(null);
  const [battle, setBattle] = useState(null);
  const [result, setResult] = useState(null);

  const battleRef = useRef(battle);
  useEffect(() => { battleRef.current = battle; }, [battle]);

  const poolRef = useRef([]);
  const searchTimerRef = useRef(null);
  const foundTimerRef = useRef(null);
  const oppTimerRef = useRef(null);
  const submitTimerRef = useRef(null);

  const clearAllTimers = useCallback(() => {
    if (searchTimerRef.current) clearInterval(searchTimerRef.current);
    if (foundTimerRef.current) clearTimeout(foundTimerRef.current);
    if (oppTimerRef.current) clearTimeout(oppTimerRef.current);
    if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
    searchTimerRef.current = null;
    foundTimerRef.current = null;
    oppTimerRef.current = null;
    submitTimerRef.current = null;
  }, []);

  useEffect(() => () => clearAllTimers(), [clearAllTimers]);

  const startSearch = useCallback(() => {
    clearAllTimers();
    poolRef.current = generateOpponentPool(playerElo, 8);
    setOpponent(null);
    setResult(null);
    setBattle(null);
    setSearchSeconds(0);
    setPhase('searching');
    let elapsed = 0;
    searchTimerRef.current = setInterval(() => {
      elapsed += 0.4;
      setSearchSeconds(elapsed);
      const found = findClosestOpponent(playerElo, poolRef.current, elapsed);
      if (found) {
        clearInterval(searchTimerRef.current);
        searchTimerRef.current = null;
        setOpponent(found);
        setPhase('found');
      }
    }, 400);
  }, [playerElo, clearAllTimers]);

  const cancelSearch = useCallback(() => {
    clearAllTimers();
    setPhase('idle');
  }, [clearAllTimers]);

  // Opponent found -> brief animation, then the battle begins.
  useEffect(() => {
    if (phase !== 'found') return;
    foundTimerRef.current = setTimeout(() => {
      setBattle(createInitialBattle());
      setPhase('battle');
    }, 1700);
    return () => { if (foundTimerRef.current) clearTimeout(foundTimerRef.current); };
  }, [phase]);

  // Opponent's simulated answering loop, paced by their Elo.
  useEffect(() => {
    if (phase !== 'battle' || !opponent) return;
    let cancelled = false;

    function scheduleNext() {
      const delay = botAnswerDelayMs(opponent.elo);
      oppTimerRef.current = setTimeout(() => {
        if (cancelled) return;
        const b = battleRef.current;
        if (!b || b.opp.done) return;
        const isCorrect = botAnswersCorrectly(opponent.elo);
        const idx = b.opp.idx + 1;
        const streak = isCorrect ? b.opp.streak + 1 : 0;
        const newOpp = {
          idx,
          correct: b.opp.correct + (isCorrect ? 1 : 0),
          streak,
          bestStreak: Math.max(b.opp.bestStreak, streak),
          done: idx >= b.queue.length,
          finishTime: idx >= b.queue.length ? Date.now() : null,
        };
        setBattle((prev) => (prev ? { ...prev, opp: newOpp } : prev));
        if (!newOpp.done) scheduleNext();
      }, delay);
    }
    scheduleNext();
    return () => { cancelled = true; if (oppTimerRef.current) clearTimeout(oppTimerRef.current); };
  }, [phase, opponent]);

  const appendDigit = useCallback((d) => {
    setBattle((b) => (!b || b.player.done || b.player.feedback || b.player.input.length >= 3)
      ? b
      : { ...b, player: { ...b.player, input: b.player.input + d } });
  }, []);

  const backspacePlayer = useCallback(() => {
    setBattle((b) => (!b || b.player.done || b.player.feedback) ? b : { ...b, player: { ...b.player, input: b.player.input.slice(0, -1) } });
  }, []);

  const submitPlayer = useCallback(() => {
    const b = battleRef.current;
    if (!b || b.player.done || b.player.feedback || !b.player.input) return;
    const current = b.queue[b.player.idx];
    const isCorrect = parseInt(b.player.input, 10) === current.z;
    const streak = isCorrect ? b.player.streak + 1 : 0;
    recordAnswer(current.z, isCorrect, Date.now() - b.player.qStart);
    setBattle((prev) => ({
      ...prev,
      player: {
        ...prev.player,
        feedback: isCorrect ? 'correct' : 'wrong',
        streak,
        bestStreak: Math.max(prev.player.bestStreak, streak),
        correct: prev.player.correct + (isCorrect ? 1 : 0),
      },
    }));
    submitTimerRef.current = setTimeout(() => {
      setBattle((prev) => {
        const idx = prev.player.idx + 1;
        const done = idx >= prev.queue.length;
        return {
          ...prev,
          player: { ...prev.player, idx, input: '', feedback: null, done, finishTime: done ? Date.now() : prev.player.finishTime, qStart: Date.now() },
        };
      });
    }, 650);
  }, []);

  // Keyboard entry, active only while a battle is in progress.
  useEffect(() => {
    if (phase !== 'battle') return;
    const onKey = (e) => {
      const b = battleRef.current;
      if (!b || b.player.done || b.player.feedback) return;
      if (e.key >= '0' && e.key <= '9') appendDigit(e.key);
      else if (e.key === 'Backspace') backspacePlayer();
      else if (e.key === 'Enter') submitPlayer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, appendDigit, backspacePlayer, submitPlayer]);

  // Once both sides finish all questions, settle the match.
  useEffect(() => {
    if (phase !== 'battle' || !battle) return;
    if (!(battle.player.done && battle.opp.done)) return;

    const playerScore = battle.player.correct;
    const oppScore = battle.opp.correct;
    let actualScore;
    let outcome;
    if (playerScore > oppScore) { actualScore = 1; outcome = 'win'; }
    else if (playerScore < oppScore) { actualScore = 0; outcome = 'loss'; }
    else {
      const playerTime = battle.player.finishTime - battle.startTime;
      const oppTime = battle.opp.finishTime - battle.startTime;
      if (playerTime < oppTime) { actualScore = 1; outcome = 'win'; }
      else if (playerTime > oppTime) { actualScore = 0; outcome = 'loss'; }
      else { actualScore = 0.5; outcome = 'draw'; }
    }

    const newElo = calculateNewElo(playerElo, opponent.elo, actualScore);
    const eloChange = newElo - playerElo;
    const rankBefore = getEloRank(playerElo).tier;
    const rankAfter = getEloRank(newElo).tier;

    const record = {
      id: `match-${Date.now()}`,
      date: new Date().toISOString(),
      opponentName: opponent.name,
      opponentElo: opponent.elo,
      outcome,
      playerScore,
      opponentScore: oppScore,
      eloBefore: playerElo,
      eloChange,
      newElo,
      rankBefore: rankBefore.name,
      rankAfter: rankAfter.name,
    };

    setResult({ record, rankBefore, rankAfter });
    onMatchComplete(record);
    setPhase('result');
  }, [phase, battle, playerElo, opponent, onMatchComplete]);

  const rankInfo = getEloRank(playerElo);

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-[820px]">
        {phase === 'idle' && (
          <motion.div {...fadeUp}>
            <div className="mb-1.5 font-heading text-2xl font-bold">แข่งขัน 1v1</div>
            <div className="mb-6 text-[15px] text-neutral-600">จับคู่กับคู่แข่งที่มีเรตติ้งใกล้เคียงกัน ตอบให้เร็วและแม่นยำกว่าเพื่อชนะและได้ Elo เพิ่ม</div>

            <div className="mb-6 flex flex-col items-center gap-4 rounded-2xl border border-divider bg-surface p-6 text-center shadow-md sm:flex-row sm:text-left">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold"
                style={{ border: `3px solid ${rankInfo.tier.color}`, color: rankInfo.tier.text, background: '#fff', boxShadow: `0 0 16px ${rankInfo.tier.color}4d` }}
              >
                {playerElo}
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-neutral-600">แร้งค์ปัจจุบัน</div>
                <div
                  className="inline-block rounded-full px-2.5 py-0.5 font-heading text-xl font-bold"
                  style={{ color: rankInfo.tier.text, background: '#fff' }}
                >
                  {rankInfo.tier.name}
                </div>
                <div className="text-xs text-neutral-600">
                  {rankInfo.next ? `อีก ${rankInfo.pointsToNext} Elo ถึง ${rankInfo.next.name}` : 'ระดับสูงสุดแล้ว'}
                </div>
              </div>
            </div>

            <motion.button
              type="button"
              onClick={() => { playSubmitSFX(); startSearch(); }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={springHover}
              className={`px-6 py-3 text-lg ${primaryButtonClass}`}
            >
              ค้นหาคู่แข่ง
            </motion.button>

            {matchHistory && matchHistory.length > 0 && (
              <div className="mt-8">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-600">ประวัติการแข่งขันล่าสุด</div>
                <div className="flex flex-col gap-2">
                  {matchHistory.slice(0, 5).map((m) => (
                    <div key={m.id} className="flex items-center justify-between rounded-xl border border-divider bg-surface px-4 py-2.5 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span
                          className={
                            'rounded-full border px-2 py-0.5 text-[11px] font-bold ' +
                            (m.outcome === 'win'
                              ? 'border-good/40 bg-good-bg text-good shadow-[0_0_8px_color-mix(in_srgb,var(--color-good)_25%,transparent)]'
                              : m.outcome === 'loss'
                                ? 'border-accent-300/60 bg-accent-100 text-accent-700 shadow-[0_0_8px_color-mix(in_srgb,var(--color-accent)_20%,transparent)]'
                                : 'border-divider bg-neutral-100 text-neutral-700')
                          }
                        >
                          {m.outcome === 'win' ? 'ชนะ' : m.outcome === 'loss' ? 'แพ้' : 'เสมอ'}
                        </span>
                        <span className="text-sm">vs <strong>{m.opponentName}</strong> ({m.opponentElo})</span>
                      </div>
                      <span className={`text-sm font-semibold ${m.eloChange >= 0 ? 'text-good' : 'text-accent-700'}`}>
                        {m.eloChange >= 0 ? '+' : ''}{m.eloChange} Elo
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {phase === 'searching' && (
          <motion.div {...fadeUp} className="flex flex-col items-center rounded-2xl border border-divider bg-surface p-12 text-center shadow-md">
            <div className="mb-5 h-14 w-14 animate-spin rounded-full border-4 border-accent-200 border-t-accent" />
            <div className="font-heading text-xl font-bold">กำลังค้นหาคู่แข่งที่มีเรตติ้งใกล้ {playerElo}...</div>
            <div className="mt-2 text-sm text-neutral-600">
              เวลาค้นหา {searchSeconds.toFixed(1)} วิ · ช่วงเรตติ้ง ±{getSearchTolerance(searchSeconds)}
            </div>
            <motion.button
              type="button"
              onClick={() => { playClickSFX(); cancelSearch(); }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={springHover}
              className={`mt-6 px-4 py-2 ${secondaryButtonClass}`}
            >
              ยกเลิก
            </motion.button>
          </motion.div>
        )}

        {phase === 'found' && opponent && (
          <motion.div {...fadeUp} className="flex flex-col items-center rounded-2xl border border-good bg-good-bg p-12 text-center shadow-md">
            <div className="mb-4 font-heading text-2xl font-bold text-good">พบคู่แข่งแล้ว!</div>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
              <div className="rounded-2xl border border-divider bg-surface px-6 py-4 shadow-sm">
                <div className="text-xs text-neutral-600">{playerName}</div>
                <div className="font-heading text-lg font-bold">{playerElo} Elo</div>
              </div>
              <div className="font-heading text-2xl font-bold text-neutral-400">VS</div>
              <div className="rounded-2xl border border-divider bg-surface px-6 py-4 shadow-sm">
                <div className="text-xs text-neutral-600">{opponent.name}</div>
                <div className="font-heading text-lg font-bold">{opponent.elo} Elo</div>
              </div>
            </div>
            <div className="mt-5 text-sm text-neutral-600">กำลังเริ่มการแข่งขัน...</div>
          </motion.div>
        )}

        {phase === 'battle' && battle && (
          <motion.div {...fadeUp}>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:gap-5">
              <SidePanel label="คุณ" name={playerName} elo={playerElo} idx={battle.player.idx} correct={battle.player.correct} streak={battle.player.streak} isPlayer />
              <SidePanel label="คู่แข่ง" name={opponent.name} elo={opponent.elo} idx={battle.opp.idx} correct={battle.opp.correct} streak={battle.opp.streak} isPlayer={false} />
            </div>

            {!battle.player.done ? (
              <motion.div
                animate={feedbackPulse(battle.player.feedback)}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={`rounded-2xl border p-8 shadow-md transition-colors ${glowCardClass} ${
                battle.player.feedback === 'correct' ? 'border-good bg-good-bg' :
                battle.player.feedback === 'wrong' ? 'border-accent bg-accent-100' : 'border-neutral-200 bg-surface'
              }`}>
                <div className="text-xs font-semibold uppercase tracking-wide text-neutral-600">โจทย์ {battle.player.idx + 1}/{QUESTION_COUNT}</div>
                <motion.div key={battle.player.idx} {...fadeUpFast}>
                  <div className="mt-3 font-heading text-4xl font-bold leading-tight">
                    {battle.queue[battle.player.idx].th} ({battle.queue[battle.player.idx].sym})
                  </div>
                  <div className="mt-1.5 text-[17px] text-neutral-700">เลขอะตอมเท่าไร?</div>
                </motion.div>
                <div className="mt-5 flex h-14 items-center rounded-xl border border-divider bg-surface px-4 font-heading text-2xl tracking-wide shadow-sm">
                  {battle.player.input || '—'}
                </div>
                {battle.player.feedback && (
                  <div className={`mt-2.5 text-[15px] font-semibold ${battle.player.feedback === 'correct' ? 'text-good' : 'text-accent-700'}`}>
                    {battle.player.feedback === 'correct' ? 'ถูกต้อง!' : `ไม่ถูกต้อง — คำตอบคือ ${battle.queue[battle.player.idx].z}`}
                  </div>
                )}
                <div className="mt-6 flex flex-wrap gap-3.5">
                  <Numpad onDigit={appendDigit} onBackspace={backspacePlayer} />
                  <motion.button
                    type="button"
                    onClick={() => { playSubmitSFX(); submitPlayer(); }}
                    disabled={!battle.player.input || !!battle.player.feedback}
                    whileHover={battle.player.input && !battle.player.feedback ? { scale: 1.03 } : undefined}
                    whileTap={battle.player.input && !battle.player.feedback ? { scale: 0.97 } : undefined}
                    transition={springHover}
                    className={`h-12 self-end px-5 ${primaryButtonClass}`}
                  >
                    ตรวจ
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <div className="rounded-2xl border border-divider bg-surface p-8 text-center shadow-md">
                <div className="font-heading text-xl font-bold">คุณตอบครบแล้ว!</div>
                <div className="mt-2 text-sm text-neutral-600">รอผลของ {opponent.name} ให้ตอบให้ครบ...</div>
              </div>
            )}
          </motion.div>
        )}

        {phase === 'result' && result && (
          <motion.div {...fadeUp} className={`rounded-2xl border border-divider bg-surface p-8 shadow-md ${glowCardClass}`}>
            <div className={
              'mb-1 font-heading text-3xl font-bold ' +
              (result.record.outcome === 'win' ? 'text-good' : result.record.outcome === 'loss' ? 'text-accent-700' : 'text-neutral-700')
            }>
              {result.record.outcome === 'win' ? 'ชัยชนะ!' : result.record.outcome === 'loss' ? 'พ่ายแพ้' : 'เสมอ'}
            </div>
            <div className="mb-6 text-sm text-neutral-600">
              <strong className="text-ink">{playerName}</strong> VS <strong className="text-ink">{result.record.opponentName}</strong> ({result.record.opponentElo} Elo)
            </div>

            <div className="mb-6 flex items-center gap-4">
              <div className={`rounded-xl px-4 py-2.5 font-heading text-2xl font-bold ${result.record.eloChange >= 0 ? 'bg-good-bg text-good' : 'bg-accent-100 text-accent-700'}`}>
                {result.record.eloChange >= 0 ? '+' : ''}{result.record.eloChange} Elo
              </div>
              <div className="text-sm text-neutral-600">Elo ใหม่: <strong className="text-ink">{result.record.newElo}</strong></div>
            </div>

            {result.rankBefore.id !== result.rankAfter.id && (
              <div className="mb-6 rounded-xl border border-divider p-4" style={{ background: result.rankAfter.id > result.rankBefore.id ? 'var(--color-good-bg)' : 'var(--color-accent-100)' }}>
                {result.rankAfter.id > result.rankBefore.id ? 'เลื่อนระดับ! ' : 'ตกระดับ '}
                <strong>{result.rankBefore.name}</strong> → <strong>{result.rankAfter.name}</strong>
              </div>
            )}

            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-divider p-4">
                <div className="text-xs uppercase text-neutral-600">คะแนนของ {playerName}</div>
                <div className="font-heading text-2xl font-bold">{result.record.playerScore}/{QUESTION_COUNT}</div>
              </div>
              <div className="rounded-xl border border-divider p-4">
                <div className="text-xs uppercase text-neutral-600">คะแนนคู่แข่ง</div>
                <div className="font-heading text-2xl font-bold">{result.record.opponentScore}/{QUESTION_COUNT}</div>
              </div>
            </div>

            <motion.button
              type="button"
              onClick={() => { playSubmitSFX(); startSearch(); }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={springHover}
              className={`px-5 py-2.5 ${primaryButtonClass}`}
            >
              หาคู่แข่งใหม่
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
