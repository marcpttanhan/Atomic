// Standard Elo rating math ---------------------------------------------

export function calculateExpectedScore(playerElo, opponentElo) {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

export function calculateNewElo(playerElo, opponentElo, actualScore, kFactor = 32) {
  const expected = calculateExpectedScore(playerElo, opponentElo);
  return Math.round(playerElo + kFactor * (actualScore - expected));
}

// Rank tiers -------------------------------------------------------------

export const ELO_TIERS = [
  { id: 0, name: 'Novice Reactor', min: 0, color: 'oklch(60% 0.02 260)', text: 'oklch(38% 0.02 260)' },
  { id: 1, name: 'Stable Compound', min: 900, color: 'oklch(58% 0.11 150)', text: 'oklch(38% 0.11 150)' },
  { id: 2, name: 'Catalyst', min: 1100, color: 'oklch(60% 0.13 230)', text: 'oklch(40% 0.13 230)' },
  { id: 3, name: 'Bonded Expert', min: 1300, color: 'oklch(62% 0.15 300)', text: 'oklch(42% 0.15 300)' },
  { id: 4, name: 'Molecular Master', min: 1500, color: 'oklch(70% 0.15 85)', text: 'oklch(45% 0.14 80)' },
  { id: 5, name: 'Nobel Laureate', min: 1800, color: 'oklch(58% 0.20 25)', text: 'oklch(40% 0.18 25)' },
];

export function getEloRank(elo) {
  let tier = ELO_TIERS[0];
  for (const t of ELO_TIERS) { if (elo >= t.min) tier = t; }
  const next = ELO_TIERS[tier.id + 1] || null;
  const span = next ? (next.min - tier.min) : 1;
  const progressPct = next ? Math.max(0, Math.min(100, Math.round(((elo - tier.min) / span) * 100))) : 100;
  const pointsToNext = next ? Math.max(0, next.min - elo) : 0;
  return { tier, next, progressPct, pointsToNext };
}

// Matchmaking -------------------------------------------------------------

// Expanding search tolerance: +/-50 at the start, widening to +/-200 the
// longer the queue has been searching.
export function getSearchTolerance(elapsedSeconds) {
  const steps = [50, 75, 100, 150, 200];
  const idx = Math.min(steps.length - 1, Math.floor(elapsedSeconds / 2));
  return steps[idx];
}

// Finds the closest-Elo opponent from a candidate pool that falls inside
// the current search tolerance window. Returns null if nobody qualifies yet.
export function findClosestOpponent(playerElo, candidates, elapsedSeconds) {
  const tolerance = getSearchTolerance(elapsedSeconds);
  const inRange = candidates.filter((c) => Math.abs(c.elo - playerElo) <= tolerance);
  if (!inRange.length) return null;
  inRange.sort((a, b) => Math.abs(a.elo - playerElo) - Math.abs(b.elo - playerElo));
  return inRange[0];
}

// Mock opponent generation -------------------------------------------------

const NAME_PARTS = [
  'Curie', 'Bohr', 'Proton', 'Neutron', 'Mendeleev', 'Lavoisier', 'Faraday',
  'Avogadro', 'Dalton', 'Rutherford', 'Pauling', 'Ionic', 'Covalent',
  'Catalyst', 'Quantum', 'Photon', 'Electron', 'Isotope', 'Nobel', 'Periodic',
];
const NAME_SUFFIXES = [
  'Master', 'Slayer', '99', 'X', 'Prime', 'Genius', 'Whiz', 'Pro', '007', 'Elite', 'Sensei', '42',
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

export function randomChemistName() {
  const first = pick(NAME_PARTS);
  const suffix = pick(NAME_SUFFIXES);
  return Math.random() < 0.5 ? `${first}_${suffix}` : `${first}${suffix}`;
}

export function generateOpponentPool(playerElo, count = 8) {
  const used = new Set();
  const pool = [];
  while (pool.length < count) {
    const name = randomChemistName();
    if (used.has(name)) continue;
    used.add(name);
    pool.push({
      id: `${Date.now()}-${pool.length}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      elo: Math.max(400, playerElo + randomInt(-100, 100)),
    });
  }
  return pool;
}

// Simulated opponent play, scaled by their Elo -----------------------------

// Higher-Elo opponents answer faster (lower ms) and more accurately.
export function botAnswerDelayMs(opponentElo) {
  const base = 4200 - (opponentElo - 1000) * 1.8;
  const jitter = (Math.random() - 0.5) * 1600;
  return Math.round(Math.max(900, Math.min(6500, base + jitter)));
}

export function botAccuracy(opponentElo) {
  const acc = 0.5 + (opponentElo - 1000) / 2500;
  return Math.max(0.32, Math.min(0.95, acc));
}

export function botAnswersCorrectly(opponentElo) {
  return Math.random() < botAccuracy(opponentElo);
}
