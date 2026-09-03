import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ELEMENTS, getPool, getRank, getMnemonic, hintText, getExamInfo } from './data/elements.js';
import { getEloRank } from './utils/elo.js';
import { safeGetItem, safeSetItem } from './utils/safeStorage.js';
import { playClickSFX, playErrorSFX } from './utils/sfx.js';
import { loadSRSData, pickWeightedElement, recordAnswer } from './utils/spacedRepetition.js';
import Sidebar from './components/Sidebar.jsx';
import PracticeCard from './components/PracticeCard.jsx';
import StatsPanel from './components/StatsPanel.jsx';
import AssessmentPanel from './components/AssessmentPanel.jsx';
import TimeAttack from './components/TimeAttack.jsx';
import MatchmakingPanel from './components/MatchmakingPanel.jsx';
import MasteryHeatmap from './components/MasteryHeatmap.jsx';
import AnalyticsPage from './components/AnalyticsPage.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import GameModePanel from './components/GameModePanel.jsx';
import AudioPlayer, { AUDIO_STORAGE_KEY } from './components/AudioPlayer.jsx';
import Toast from './components/Toast.jsx';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import AmbientGlow from './components/AmbientGlow.jsx';
import { FlameIcon, SunIcon, MoonIcon } from './components/icons.jsx';
import { springHover } from './utils/styles.js';

const STORAGE_KEY = 'atomicRecallV1';
const PLAYER_NAME_KEY = 'atomicRecallPlayerName';
const THEME_KEY = 'atomicRecallTheme';
const DAY_SHORT = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];

function loadSaved() {
  try { return JSON.parse(safeGetItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}

// Practice/Recall bias toward elements with low spaced-repetition mastery;
// other modes (Time Attack, Assessment) keep uniform random sampling so
// their scoring stays fair/comparable.
function pickCurrent(pool, mode) {
  if (!pool.length) return null;
  if (mode === 'practice' || mode === 'recall') {
    return pickWeightedElement(pool, loadSRSData());
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function todayStr() {
  return new Date().toLocaleDateString('en-CA');
}

function buildProgressPayload(s) {
  return {
    missed: s.missed, stats: s.stats, preset: s.preset,
    points: s.points, streak: s.streak, sound: s.sound,
    assessments: s.assessments, timeAttackHigh: s.timeAttack.high,
    playerElo: s.playerElo, matchHistory: s.matchHistory,
    focusMode: s.focusMode,
  };
}

function computeDailyStreak(streak) {
  const today = todayStr();
  if (streak.activity[today]) return streak;
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');
  const count = streak.lastDate === yesterday ? streak.count + 1 : 1;
  return { count, lastDate: today, activity: { ...streak.activity, [today]: true } };
}

function buildInitialState() {
  const saved = loadSaved();
  const preset = saved.preset || 'basic20';
  const missed = saved.missed || {};
  const pool = getPool(ELEMENTS, preset, 'practice', missed);
  return {
    mode: 'practice',
    preset,
    pool,
    current: pickCurrent(pool, 'practice'),
    input: '',
    feedback: null,
    hintOpen: false,
    missed,
    stats: saved.stats || { asked: 0, correct: 0, totalMs: 0 },
    qStart: Date.now(),
    points: saved.points || 0,
    combo: 0,
    streak: saved.streak || { count: 0, lastDate: null, activity: {} },
    sound: saved.sound || { correct: true, wrong: true, combo: true },
    assessments: saved.assessments || { pre: null, post: null },
    assessment: { stage: 'select', type: null, queue: [], idx: 0, correct: 0, times: [] },
    timeAttack: { stage: 'ready', timeLeft: 60, score: 0, asked: 0, correct: 0, high: saved.timeAttackHigh || 0 },
    playerElo: saved.playerElo || 1000,
    matchHistory: saved.matchHistory || [],
    focusMode: !!saved.focusMode,
  };
}

export default function App() {
  const [playerName, setPlayerNameState] = useState(() => safeGetItem(PLAYER_NAME_KEY) || '');
  const setPlayerName = useCallback((name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    safeSetItem(PLAYER_NAME_KEY, trimmed);
    setPlayerNameState(trimmed);
  }, []);

  const [theme, setThemeState] = useState(() => (safeGetItem(THEME_KEY) === 'dark' ? 'dark' : 'light'));
  const setTheme = useCallback((next) => {
    const value = next === 'dark' ? 'dark' : 'light';
    safeSetItem(THEME_KEY, value);
    setThemeState(value);
  }, []);
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const value = prev === 'dark' ? 'light' : 'dark';
      safeSetItem(THEME_KEY, value);
      return value;
    });
  }, []);
  // useLayoutEffect (not useEffect) so the class is applied before the
  // browser paints, avoiding a flash of the other theme on load/switch.
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const [state, setState] = useState(buildInitialState);

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; });

  const timerRef = useRef(null);
  const taIntervalRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Persist the durable slices of progress whenever they change.
  useEffect(() => {
    safeSetItem(STORAGE_KEY, JSON.stringify(buildProgressPayload(state)));
  }, [state.missed, state.stats, state.preset, state.points, state.streak, state.sound, state.assessments, state.timeAttack.high, state.playerElo, state.matchHistory, state.focusMode]);

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const showToast = useCallback((message, tone = 'success') => {
    setToast({ message, tone, id: Date.now() });
    if (tone === 'error') playErrorSFX();
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (taIntervalRef.current) clearInterval(taIntervalRef.current);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  const playSound = useCallback((type) => {
    const s = stateRef.current;
    if (s.focusMode || !s.sound[type]) return;
    try {
      const ctx = audioCtxRef.current || (audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)());
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = type === 'correct' ? 880 : type === 'combo' ? 1320 : 220;
      o.type = 'sine';
      g.gain.setValueAtTime(0.15, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      o.start();
      o.stop(ctx.currentTime + 0.2);
    } catch { /* audio unavailable */ }
  }, []);

  const rebuildPool = useCallback((mode, preset, missed) => {
    const pool = getPool(ELEMENTS, preset, mode, missed);
    const current = pickCurrent(pool, mode);
    setState((s) => ({ ...s, pool, current, input: '', feedback: null, hintOpen: false, qStart: Date.now() }));
  }, []);

  const setMode = useCallback((mode) => {
    const s = stateRef.current;
    if (mode === s.mode) return;
    if (taIntervalRef.current) { clearInterval(taIntervalRef.current); taIntervalRef.current = null; }
    if (mode === 'assessment') {
      setState((prev) => ({ ...prev, mode, assessment: { stage: 'select', type: null, queue: [], idx: 0, correct: 0, times: [] } }));
      return;
    }
    if (mode === 'timeattack') {
      setState((prev) => ({ ...prev, mode, timeAttack: { ...prev.timeAttack, stage: 'ready', timeLeft: 60, score: 0, asked: 0, correct: 0 } }));
      return;
    }
    setState((prev) => ({ ...prev, mode }));
    rebuildPool(mode, s.preset, s.missed);
  }, [rebuildPool]);

  const setPreset = useCallback((preset) => {
    const s = stateRef.current;
    setState((prev) => ({ ...prev, preset }));
    rebuildPool(s.mode, preset, s.missed);
  }, [rebuildPool]);

  const startAssessment = useCallback((type) => {
    const shuffled = ELEMENTS.slice().sort(() => Math.random() - 0.5).slice(0, 20);
    setState((s) => ({
      ...s,
      assessment: { stage: 'running', type, queue: shuffled, idx: 0, correct: 0, times: [] },
      current: shuffled[0], input: '', feedback: null, qStart: Date.now(),
    }));
  }, []);

  const backToAssessSelect = useCallback(() => {
    setState((s) => ({ ...s, assessment: { stage: 'select', type: null, queue: [], idx: 0, correct: 0, times: [] } }));
  }, []);

  const startTimeAttack = useCallback(() => {
    if (taIntervalRef.current) { clearInterval(taIntervalRef.current); taIntervalRef.current = null; }
    const pool = getPool(ELEMENTS, stateRef.current.preset, 'timeattack', {});
    const current = pickCurrent(pool, 'timeattack');
    setState((s) => ({
      ...s,
      timeAttack: { ...s.timeAttack, stage: 'running', timeLeft: 60, score: 0, asked: 0, correct: 0 },
      pool, current, input: '', feedback: null, qStart: Date.now(),
    }));
    taIntervalRef.current = setInterval(() => {
      const t = stateRef.current.timeAttack.timeLeft - 1;
      if (t <= 0) {
        clearInterval(taIntervalRef.current);
        taIntervalRef.current = null;
        setState((s) => ({ ...s, timeAttack: { ...s.timeAttack, timeLeft: 0, stage: 'done', high: Math.max(s.timeAttack.high, s.timeAttack.score) } }));
      } else {
        setState((s) => ({ ...s, timeAttack: { ...s.timeAttack, timeLeft: t } }));
      }
    }, 1000);
  }, []);

  const exportProgress = useCallback(() => {
    const s = stateRef.current;
    const accuracyPct = s.stats.asked ? Math.round((s.stats.correct / s.stats.asked) * 100) + '%' : '—';
    const avgSec = s.stats.asked ? (s.stats.totalMs / s.stats.asked / 1000).toFixed(1) + ' วิ' : '—';
    const lines = [
      'รายงานความคืบหน้า Atomic Recall',
      'วันที่: ' + new Date().toLocaleString('th-TH'),
      '',
      'สรุปการฝึกฝน',
      '- ตอบทั้งหมด: ' + s.stats.asked,
      '- ตอบถูก: ' + s.stats.correct,
      '- ความแม่นยำ: ' + accuracyPct,
      '- เวลาเฉลี่ยต่อข้อ: ' + avgSec,
      '- คะแนนสะสม: ' + s.points,
      '- สตรีครายวัน: ' + s.streak.count + ' วัน',
      '- ธาตุที่ยังพลาดอยู่: ' + Object.keys(s.missed).length,
      '',
      'แบบทดสอบก่อนเรียน: ' + (s.assessments.pre ? (s.assessments.pre.accuracy + '% ถูกต้อง, เฉลี่ย ' + s.assessments.pre.avgSec + ' วิ/ข้อ (' + s.assessments.pre.date + ')') : 'ยังไม่ได้ทำ'),
      'แบบทดสอบหลังเรียน: ' + (s.assessments.post ? (s.assessments.post.accuracy + '% ถูกต้อง, เฉลี่ย ' + s.assessments.post.avgSec + ' วิ/ข้อ (' + s.assessments.post.date + ')') : 'ยังไม่ได้ทำ'),
      '',
      'คะแนนสูงสุดไทม์แอทแทค: ' + s.timeAttack.high,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'atomic-recall-progress.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const exportSaveData = useCallback(() => {
    let audio = null;
    try { audio = JSON.parse(safeGetItem(AUDIO_STORAGE_KEY) || 'null'); } catch { audio = null; }
    const payload = {
      app: 'Atomic Recall',
      exportVersion: 1,
      exportedAt: new Date().toISOString(),
      progress: buildProgressPayload(stateRef.current),
      audio,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'atomic_recall_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('ดาวน์โหลดไฟล์บันทึกสำเร็จ', 'success');
  }, [showToast]);

  const importSaveData = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!data || typeof data !== 'object' || data.app !== 'Atomic Recall' || typeof data.progress !== 'object' || data.progress === null) {
          throw new Error('unrecognized save file format');
        }
        safeSetItem(STORAGE_KEY, JSON.stringify(data.progress));
        if (data.audio && typeof data.audio === 'object') {
          safeSetItem(AUDIO_STORAGE_KEY, JSON.stringify(data.audio));
        }
        showToast('นำเข้าข้อมูลสำเร็จ กำลังโหลดหน้าใหม่...', 'success');
        setTimeout(() => window.location.reload(), 1100);
      } catch {
        showToast('ไฟล์ไม่ถูกต้อง ไม่สามารถนำเข้าข้อมูลได้', 'error');
      }
    };
    reader.onerror = () => showToast('ไม่สามารถอ่านไฟล์ได้', 'error');
    reader.readAsText(file);
  }, [showToast]);

  const appendDigit = useCallback((d) => {
    setState((s) => (s.feedback || s.input.length >= 3) ? s : { ...s, input: s.input + d });
  }, []);

  const backspace = useCallback(() => {
    setState((s) => (s.feedback ? s : { ...s, input: s.input.slice(0, -1) }));
  }, []);

  const toggleHint = useCallback(() => {
    setState((s) => ({ ...s, hintOpen: !s.hintOpen }));
  }, []);

  const toggleSound = useCallback((key) => {
    setState((s) => ({ ...s, sound: { ...s.sound, [key]: !s.sound[key] } }));
  }, []);

  const toggleFocusMode = useCallback(() => {
    setState((s) => ({ ...s, focusMode: !s.focusMode }));
  }, []);

  const submitAssessment = useCallback(() => {
    const s = stateRef.current;
    const { current, input, assessment } = s;
    const isCorrect = parseInt(input, 10) === current.z;
    const elapsed = Date.now() - s.qStart;
    const times = [...assessment.times, elapsed];
    const correct = assessment.correct + (isCorrect ? 1 : 0);
    recordAnswer(current.z, isCorrect, elapsed);
    playSound(isCorrect ? 'correct' : 'wrong');
    setState((prev) => ({ ...prev, feedback: isCorrect ? 'correct' : 'wrong', assessment: { ...prev.assessment, times, correct } }));
    timerRef.current = setTimeout(() => {
      const idx = assessment.idx + 1;
      if (idx >= assessment.queue.length) {
        const accuracy = Math.round((correct / assessment.queue.length) * 100);
        const avgSec = (times.reduce((a, b) => a + b, 0) / times.length / 1000).toFixed(1);
        const record = { accuracy, avgSec, date: todayStr() };
        setState((prev) => ({
          ...prev,
          assessments: { ...prev.assessments, [assessment.type]: record },
          assessment: { stage: 'done', type: assessment.type, queue: assessment.queue, idx, correct, times },
        }));
      } else {
        setState((prev) => ({ ...prev, assessment: { ...prev.assessment, idx }, current: assessment.queue[idx], input: '', feedback: null, qStart: Date.now() }));
      }
    }, 700);
  }, [playSound]);

  const submitTimeAttack = useCallback(() => {
    const s = stateRef.current;
    const { current, input, timeAttack, pool } = s;
    const isCorrect = parseInt(input, 10) === current.z;
    const elapsed = Date.now() - s.qStart;
    const asked = timeAttack.asked + 1;
    const correct = timeAttack.correct + (isCorrect ? 1 : 0);
    const score = timeAttack.score + (isCorrect ? 1 : 0);
    recordAnswer(current.z, isCorrect, elapsed);
    playSound(isCorrect ? 'correct' : 'wrong');
    setState((prev) => ({ ...prev, feedback: isCorrect ? 'correct' : 'wrong', timeAttack: { ...prev.timeAttack, asked, correct, score } }));
    timerRef.current = setTimeout(() => {
      if (stateRef.current.timeAttack.stage !== 'running') return;
      const next = pickCurrent(pool, 'timeattack');
      setState((prev) => ({ ...prev, current: next, input: '', feedback: null, qStart: Date.now() }));
    }, 400);
  }, [playSound]);

  const submit = useCallback(() => {
    const s = stateRef.current;
    const { mode, input, current, feedback } = s;
    if (!input || !current || feedback) return;
    if (mode === 'assessment') return submitAssessment();
    if (mode === 'timeattack') return submitTimeAttack();

    const { missed, stats } = s;
    const isCorrect = parseInt(input, 10) === current.z;
    const elapsed = Date.now() - s.qStart;
    recordAnswer(current.z, isCorrect, elapsed);
    const newStats = { asked: stats.asked + 1, correct: stats.correct + (isCorrect ? 1 : 0), totalMs: stats.totalMs + elapsed };
    const newMissed = { ...missed };
    if (isCorrect) {
      if (newMissed[current.z]) {
        const ms = (newMissed[current.z].streak || 0) + 1;
        if (ms >= 2) delete newMissed[current.z];
        else newMissed[current.z] = { count: newMissed[current.z].count, streak: ms };
      }
    } else {
      const prevCount = newMissed[current.z] ? newMissed[current.z].count : 0;
      newMissed[current.z] = { count: prevCount + 1, streak: 0 };
    }

    const newDayStreak = computeDailyStreak(s.streak);
    const boostActive = newDayStreak.count >= 5;
    let newCombo = s.combo;
    let newPoints = s.points;
    if (isCorrect) {
      newCombo = s.combo + 1;
      const base = 10;
      const speedBonus = elapsed <= 3000 ? 5 : 0;
      const comboBonus = newCombo >= 3 ? Math.min(newCombo, 10) * 2 : 0;
      const gain = Math.round((base + speedBonus + comboBonus) * (boostActive ? 1.2 : 1));
      newPoints = s.points + gain;
    } else {
      newCombo = 0;
    }

    setState((prev) => ({ ...prev, feedback: isCorrect ? 'correct' : 'wrong', stats: newStats, missed: newMissed, combo: newCombo, points: newPoints, streak: newDayStreak }));
    playSound(isCorrect ? 'correct' : 'wrong');
    if (isCorrect && newCombo > 0 && newCombo % 3 === 0) setTimeout(() => playSound('combo'), 150);
    timerRef.current = setTimeout(() => {
      rebuildPool(stateRef.current.mode, stateRef.current.preset, newMissed);
    }, 1000);
  }, [submitAssessment, submitTimeAttack, playSound, rebuildPool]);

  const resetProgress = useCallback(() => {
    if (!window.confirm('ล้างสถิติและธาตุที่พลาดทั้งหมด?')) return;
    const stats = { asked: 0, correct: 0, totalMs: 0 };
    const streak = { count: 0, lastDate: null, activity: {} };
    setState((s) => ({ ...s, missed: {}, stats, points: 0, combo: 0, streak }));
    rebuildPool(stateRef.current.mode, stateRef.current.preset, {});
  }, [rebuildPool]);

  const handleMatchComplete = useCallback((matchRecord) => {
    setState((s) => ({ ...s, playerElo: matchRecord.newElo, matchHistory: [matchRecord, ...s.matchHistory].slice(0, 50) }));
  }, []);

  // Keyboard entry mirrors the on-screen numpad; registered once and always
  // reads fresh state via stateRef so it never goes stale.
  useEffect(() => {
    const onKey = (e) => {
      const s = stateRef.current;
      if (s.feedback) return;
      const isEntryMode = s.mode === 'practice' || s.mode === 'recall' ||
        (s.mode === 'assessment' && s.assessment.stage === 'running') ||
        (s.mode === 'timeattack' && s.timeAttack.stage === 'running');
      if (!isEntryMode) return;
      if (e.key >= '0' && e.key <= '9') appendDigit(e.key);
      else if (e.key === 'Backspace') backspace();
      else if (e.key === 'Enter') submit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [appendDigit, backspace, submit]);

  // ---- Derived render values ----
  const missedCount = Object.keys(state.missed).length;
  const accuracyPct = state.stats.asked ? Math.round((state.stats.correct / state.stats.asked) * 100) + '%' : '—';
  const avgSec = state.stats.asked ? (state.stats.totalMs / state.stats.asked / 1000).toFixed(1) + ' วิ' : '—';

  const byZ = {};
  ELEMENTS.forEach((e) => { byZ[e.z] = e; });
  const missedEntries = Object.keys(state.missed).map((z) => ({
    z: parseInt(z, 10),
    count: state.missed[z].count,
    streak: state.missed[z].streak || 0,
    sym: byZ[z] ? byZ[z].sym : '',
    th: byZ[z] ? byZ[z].th : '',
  })).sort((a, b) => b.count - a.count);
  const topMissed = missedEntries.slice(0, 5);
  const missedList = missedEntries.map((m) => ({ ...m, streakLabel: `${m.streak}/2` }));

  const hint = state.current ? hintText(state.current) : '';
  const mnemonic = state.current ? getMnemonic(state.current) : '';
  const examInfo = state.current ? getExamInfo(state.current) : null;

  const rankInfo = getRank(state.points);
  const rank = rankInfo.rank;
  const currentRank = getEloRank(state.playerElo).tier;
  const rankPointsLabel = rankInfo.next
    ? `${state.points} คะแนน · อีก ${rankInfo.pointsToNext} คะแนนถึง ${rankInfo.next.name}`
    : `${state.points} คะแนน · ระดับสูงสุดแล้ว`;

  const dayStreak = state.streak;
  const streakMultiplierActive = dayStreak.count >= 5;
  const streakText = `${dayStreak.count} วันติด`;

  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);
  const todayIso = today.toLocaleDateString('en-CA');
  const weekDots = DAY_SHORT.map((short, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dStr = d.toLocaleDateString('en-CA');
    return { short, title: dStr, active: !!dayStreak.activity[dStr], isToday: dStr === todayIso };
  });

  const fmtAssess = (r) => (r ? `${r.accuracy}% ถูก · เฉลี่ย ${r.avgSec} วิ/ข้อ · ${r.date}` : '');
  const assessProgress = `${state.assessment.idx + 1} / ${state.assessment.queue.length}`;
  const assessTitle = state.assessment.type === 'pre' ? 'แบบทดสอบก่อนเรียน' : 'แบบทดสอบหลังเรียน';
  const assessResultAccuracy = state.assessment.queue.length
    ? Math.round((state.assessment.correct / state.assessment.queue.length) * 100) + '%'
    : '—';
  const assessResultAvgSec = state.assessment.times.length
    ? (state.assessment.times.reduce((a, b) => a + b, 0) / state.assessment.times.length / 1000).toFixed(1) + ' วิ'
    : '—';

  const hasPre = !!state.assessments.pre;
  const hasPost = !!state.assessments.post;
  const hasBothAssess = hasPre && hasPost;
  const preAcc = hasPre ? state.assessments.pre.accuracy : 0;
  const postAcc = hasPost ? state.assessments.post.accuracy : 0;
  const delta = postAcc - preAcc;

  const isCardMode = state.mode === 'practice' || state.mode === 'recall';
  const canSubmit = state.input.length > 0 && !state.feedback;

  const ctaLabel = state.mode === 'recall' ? 'กลับไปฝึกฝนทั้งหมด' : 'ทบทวนเฉพาะข้อที่พลาด';
  const ctaAction = state.mode === 'recall' ? () => setMode('practice') : () => setMode('recall');
  const ctaDisabled = state.mode === 'recall' ? false : missedCount === 0;
  const ctaPrimary = state.mode !== 'recall';

  if (!playerName) {
    return <WelcomeScreen onSubmit={setPlayerName} theme={theme} onToggleTheme={toggleTheme} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-20 flex items-center justify-between border-b border-divider bg-surface/80 px-7 py-4 backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          <span className="font-heading text-xl font-bold tracking-wide">ATOMIC RECALL</span>
          <span className="rounded-full border border-divider bg-surface px-3 py-1 text-[13px] font-semibold text-ink shadow-sm">
            {playerName}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-shadow duration-200"
            style={{ border: `2px solid ${rank.color}`, color: rank.text, background: '#fff', boxShadow: `0 0 10px ${rank.color}4d` }}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: rank.color }} />
            <span>{rank.name} · {rank.sub}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-divider px-2.5 py-1.5 shadow-sm">
            <FlameIcon active={dayStreak.count > 0} />
            <span className="text-sm font-semibold">{streakText}</span>
          </div>
          <span className="rounded-full border border-accent-300/70 bg-accent-100 px-2.5 py-1 text-[11px] text-accent-800 shadow-[0_0_10px_color-mix(in_srgb,var(--color-accent)_20%,transparent)]">
            ความแม่นยำ {accuracyPct}
          </span>
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-shadow duration-200"
            style={{ border: `2px solid ${currentRank.color}`, color: currentRank.text, background: '#fff', boxShadow: `0 0 10px ${currentRank.color}4d` }}
            title={`${currentRank.name} · ${state.playerElo} Elo`}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: currentRank.color }} />
            <span>{state.playerElo} Elo</span>
          </div>
          <AudioPlayer focusMode={state.focusMode} onToggleFocusMode={toggleFocusMode} />
          <motion.button
            type="button"
            onClick={() => { playClickSFX(); toggleTheme(); }}
            aria-label="สลับธีม"
            title={theme === 'dark' ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            transition={springHover}
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-divider bg-surface text-ink shadow-sm transition-colors duration-150 hover:bg-neutral-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ opacity: 0, rotate: -45 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 45 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.header>

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <AmbientGlow />
        <Sidebar mode={state.mode} onSetMode={setMode} />

        <main className="relative z-10 flex min-h-0 min-w-0 flex-1">
          {isCardMode && (
            <>
              <PracticeCard
                mode={state.mode}
                current={state.current}
                input={state.input}
                feedback={state.feedback}
                hintOpen={state.hintOpen}
                hint={hint}
                mnemonic={mnemonic}
                examInfo={examInfo}
                canSubmit={canSubmit}
                showEmpty={state.mode === 'recall' && !state.current}
                onDigit={appendDigit}
                onBackspace={backspace}
                onToggleHint={toggleHint}
                onSubmit={submit}
                onBackToPractice={() => setMode('practice')}
              />
              <StatsPanel
                accuracyPct={accuracyPct}
                avgSec={avgSec}
                rank={rank}
                rankProgressPct={rankInfo.progressPct}
                rankPointsLabel={rankPointsLabel}
                weekDots={weekDots}
                streakMultiplierActive={streakMultiplierActive}
                topMissed={topMissed}
                ctaLabel={ctaLabel}
                onCta={ctaAction}
                ctaDisabled={ctaDisabled}
                ctaPrimary={ctaPrimary}
              />
            </>
          )}

          {state.mode === 'assessment' && (
            <AssessmentPanel
              stage={state.assessment.stage}
              hasPre={hasPre}
              hasPost={hasPost}
              preSummary={fmtAssess(state.assessments.pre)}
              postSummary={fmtAssess(state.assessments.post)}
              onStartPre={() => startAssessment('pre')}
              onStartPost={() => startAssessment('post')}
              assessTitle={assessTitle}
              assessProgress={assessProgress}
              current={state.current}
              input={state.input}
              feedback={state.feedback}
              canSubmit={canSubmit}
              onDigit={appendDigit}
              onBackspace={backspace}
              onSubmit={submit}
              assessResultAccuracy={assessResultAccuracy}
              assessResultAvgSec={assessResultAvgSec}
              onBackToSelect={backToAssessSelect}
            />
          )}

          {state.mode === 'timeattack' && (
            <TimeAttack
              stage={state.timeAttack.stage}
              high={state.timeAttack.high}
              onStart={startTimeAttack}
              timeLeft={state.timeAttack.timeLeft}
              score={state.timeAttack.score}
              current={state.current}
              input={state.input}
              canSubmit={canSubmit}
              onDigit={appendDigit}
              onBackspace={backspace}
              onSubmit={submit}
            />
          )}

          {state.mode === 'matchmaking' && (
            <MatchmakingPanel
              playerName={playerName}
              playerElo={state.playerElo}
              matchHistory={state.matchHistory}
              onMatchComplete={handleMatchComplete}
            />
          )}

          {state.mode === 'heatmap' && <MasteryHeatmap />}

          {state.mode === 'stats' && (
            <AnalyticsPage
              statsAsked={state.stats.asked}
              statsCorrect={state.stats.correct}
              accuracyPct={accuracyPct}
              avgSec={avgSec}
              missedList={missedList}
              hasBothAssess={hasBothAssess}
              preAccuracyLabel={hasPre ? `${preAcc}%` : '—'}
              postAccuracyLabel={hasPost ? `${postAcc}%` : '—'}
              preAcc={preAcc}
              postAcc={postAcc}
              deltaLabel={delta >= 0 ? `พัฒนาการเพิ่มขึ้น ${delta} จุด` : `ลดลง ${Math.abs(delta)} จุด`}
              deltaPositive={delta >= 0}
              onExport={exportProgress}
            />
          )}

          {state.mode === 'gamemode' && (
            <GameModePanel preset={state.preset} onSelectPreset={setPreset} />
          )}

          {state.mode === 'settings' && (
            <SettingsPanel
              sound={state.sound}
              onToggleSound={toggleSound}
              onReset={resetProgress}
              onExportSave={exportSaveData}
              onImportSave={importSaveData}
              playerName={playerName}
              onSaveName={setPlayerName}
              theme={theme}
              onSetTheme={setTheme}
            />
          )}
        </main>
      </div>
    </div>
  );
}
