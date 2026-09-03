// Simplified SM-2 (SuperMemo-2) spaced-repetition engine, adapted from
// day-scheduled flashcard review to an instant-feedback quiz app: instead
// of a "review date," each element's `interval`/`easeFactor` are used to
// derive a live mastery score that biases which elements come up next in
// Practice/Recall, and to color the Mastery Heatmap.

import { safeGetItem, safeSetItem } from './safeStorage.js';

const STORAGE_KEY = 'atomicRecallSRSv1';

function createRecord(z) {
  return {
    z,
    easeFactor: 2.5,
    repetitions: 0,
    interval: 1,
    attempts: 0,
    correct: 0,
    totalMs: 0,
    lastQuality: null,
    lastSeen: null,
  };
}

export function loadSRSData() {
  try { return JSON.parse(safeGetItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}

export function saveSRSData(data) {
  safeSetItem(STORAGE_KEY, JSON.stringify(data));
}

// Derives an SM-2 "quality" (0-5) from objective signals instead of a
// self-reported rating: wrong answers are always low quality; correct
// answers scale up with how fast the recall was.
export function qualityFromAnswer(isCorrect, responseMs) {
  if (!isCorrect) return 1;
  if (responseMs <= 2000) return 5;
  if (responseMs <= 5000) return 4;
  return 3;
}

function applySM2(record, quality) {
  let { easeFactor, repetitions, interval } = record;
  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(interval * easeFactor);
  }
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;
  return { easeFactor, repetitions, interval };
}

// Reads current data, folds in one answer, persists, and returns the
// updated full data set — a self-contained read-modify-write so callers
// don't need to manage the data object themselves.
export function recordAnswer(z, isCorrect, responseMs) {
  const data = loadSRSData();
  const prev = data[z] || createRecord(z);
  const quality = qualityFromAnswer(isCorrect, responseMs);
  const { easeFactor, repetitions, interval } = applySM2(prev, quality);
  const next = {
    ...prev,
    easeFactor,
    repetitions,
    interval,
    attempts: prev.attempts + 1,
    correct: prev.correct + (isCorrect ? 1 : 0),
    totalMs: prev.totalMs + responseMs,
    lastQuality: quality,
    lastSeen: Date.now(),
  };
  const updated = { ...data, [z]: next };
  saveSRSData(updated);
  return updated;
}

// 0-100 composite: mostly raw accuracy, with SM-2's ease factor and
// consecutive-correct streak rewarding elements that are both correct
// *and* getting easier to recall.
export function getMasteryScore(record) {
  if (!record || record.attempts === 0) return null;
  const accuracy = record.correct / record.attempts;
  const easeNorm = Math.max(0, Math.min(1, (record.easeFactor - 1.3) / (2.5 - 1.3)));
  const repBonus = Math.min(1, record.repetitions / 5);
  return Math.round((accuracy * 0.55 + easeNorm * 0.25 + repBonus * 0.2) * 100);
}

export function getMasteryTier(record) {
  const score = getMasteryScore(record);
  if (score === null) return 'unattempted';
  if (score < 40) return 'weak';
  if (score < 70) return 'medium';
  return 'strong';
}

export function getAvgResponseMs(record) {
  if (!record || record.attempts === 0) return null;
  return Math.round(record.totalMs / record.attempts);
}

// Weak/unattempted elements get proportionally more likely to be picked;
// mastered elements are still eligible (never fully excluded) so review
// doesn't stop entirely once something is learned.
export function getPriorityWeight(record) {
  if (!record || record.attempts === 0) return 3;
  const mastery = getMasteryScore(record) ?? 0;
  return 1 + (100 - mastery) / 20;
}

export function pickWeightedElement(pool, srsData) {
  if (!pool.length) return null;
  const weights = pool.map((el) => getPriorityWeight(srsData[el.z]));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}
