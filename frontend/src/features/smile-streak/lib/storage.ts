/**
 * Smile Streak — local-only persistence layer.
 *
 * The patient game stores all data in localStorage under a single key for
 * v1 (no backend coupling). We model the entries as an append-only ledger
 * of daily check-ins; streak and badges are derived on every save by
 * walking that ledger so the storage stays simple to inspect/debug.
 *
 * Date keys use the Asia/Amman (UTC+3) day boundary so a check-in performed
 * shortly after midnight local time counts toward "today" — matching the
 * doctor game backend's day rollover.
 */

const STORAGE_KEY = "denty-patient-smile-streak";

/** UTC+3 offset in milliseconds — Asia/Amman is UTC+3 year-round. */
const AMMAN_OFFSET_MS = 3 * 60 * 60 * 1000;

const isBrowser = typeof window !== "undefined";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type SmileHabits = {
  flossed: boolean;
  mouthwash: boolean;
  water: boolean;
};

export type SmileEntry = {
  /** YYYY-MM-DD in Asia/Amman timezone. */
  date: string;
  /** 0..100 — composite score for the day's check-in. */
  score: number;
  habits: SmileHabits;
};

export type SmileBadgeId =
  | "first-checkin"
  | "streak-3"
  | "streak-7"
  | "streak-30";

export type SmileStreakData = {
  entries: SmileEntry[];
  streak: number;
  bestStreak: number;
  badgesEarned: SmileBadgeId[];
};

export const ALL_BADGES: SmileBadgeId[] = [
  "first-checkin",
  "streak-3",
  "streak-7",
  "streak-30",
];

/* -------------------------------------------------------------------------- */
/* Date helpers                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Returns the "today" date key (YYYY-MM-DD) in Asia/Amman time. This is the
 * boundary used to dedupe check-ins per day and to compute streaks.
 */
export function getAmmanDateKey(date: Date = new Date()): string {
  const local = new Date(date.getTime() + AMMAN_OFFSET_MS);
  const year = local.getUTCFullYear();
  const month = String(local.getUTCMonth() + 1).padStart(2, "0");
  const day = String(local.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns the timestamp (ms since epoch) for the next Asia/Amman midnight
 * after `from`. Used to render the "next check-in unlocks in" countdown.
 */
export function getNextAmmanMidnight(from: Date = new Date()): number {
  const local = new Date(from.getTime() + AMMAN_OFFSET_MS);
  // Round to UTC midnight of the following day, then translate back.
  local.setUTCHours(24, 0, 0, 0);
  return local.getTime() - AMMAN_OFFSET_MS;
}

/** Returns the date string for the day BEFORE `dateKey` (YYYY-MM-DD). */
function previousDay(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  // Construct a UTC date so DST/local-zone shifts don't trip us.
  const date = new Date(Date.UTC(y, (m ?? 1) - 1, d));
  date.setUTCDate(date.getUTCDate() - 1);
  const ny = date.getUTCFullYear();
  const nm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const nd = String(date.getUTCDate()).padStart(2, "0");
  return `${ny}-${nm}-${nd}`;
}

/* -------------------------------------------------------------------------- */
/* Pure derivation helpers                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Walks the entries (chronological) and returns the current consecutive
 * streak ending at the most recent entry. Skips/gaps reset the streak.
 *
 * Note: a "current streak" is only considered active if the most recent
 * entry is today OR yesterday in Amman time — otherwise the chain has
 * already broken and the badge UI should reflect 0.
 */
export function computeStreak(entries: SmileEntry[]): number {
  if (entries.length === 0) return 0;
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const today = getAmmanDateKey();
  const yesterday = previousDay(today);
  const latest = sorted[sorted.length - 1].date;
  if (latest !== today && latest !== yesterday) return 0;

  let streak = 1;
  for (let i = sorted.length - 1; i > 0; i--) {
    const cur = sorted[i].date;
    const prev = sorted[i - 1].date;
    if (prev === previousDay(cur)) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

/** Best streak ever achieved across the entries history. */
export function computeBestStreak(entries: SmileEntry[]): number {
  if (entries.length === 0) return 0;
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1].date === previousDay(sorted[i].date)) {
      run += 1;
      if (run > best) best = run;
    } else if (sorted[i - 1].date !== sorted[i].date) {
      run = 1;
    }
  }
  return best;
}

/** Derive the full set of unlocked badges for a given history. */
export function computeBadges(entries: SmileEntry[]): SmileBadgeId[] {
  const unlocked: SmileBadgeId[] = [];
  if (entries.length >= 1) unlocked.push("first-checkin");
  const best = computeBestStreak(entries);
  if (best >= 3) unlocked.push("streak-3");
  if (best >= 7) unlocked.push("streak-7");
  if (best >= 30) unlocked.push("streak-30");
  return unlocked;
}

/** Lifetime cumulative score (sum across every check-in). */
export function computeCumulative(entries: SmileEntry[]): number {
  return entries.reduce((acc, entry) => acc + entry.score, 0);
}

/**
 * Score a single day's ritual:
 *   - brushing pattern completed  → 40
 *   - flossed                     → 20
 *   - mouthwash                   → 20
 *   - water                       → 20
 *
 * Range: 0..100.
 */
export function scoreCheckin(
  brushingPatternDone: boolean,
  habits: SmileHabits,
): number {
  let total = 0;
  if (brushingPatternDone) total += 40;
  if (habits.flossed) total += 20;
  if (habits.mouthwash) total += 20;
  if (habits.water) total += 20;
  return total;
}

/* -------------------------------------------------------------------------- */
/* Storage                                                                    */
/* -------------------------------------------------------------------------- */

const empty = (): SmileStreakData => ({
  entries: [],
  streak: 0,
  bestStreak: 0,
  badgesEarned: [],
});

function isValidEntry(value: unknown): value is SmileEntry {
  if (!value || typeof value !== "object") return false;
  const e = value as Record<string, unknown>;
  if (typeof e.date !== "string") return false;
  if (typeof e.score !== "number") return false;
  if (!e.habits || typeof e.habits !== "object") return false;
  const h = e.habits as Record<string, unknown>;
  return (
    typeof h.flossed === "boolean" &&
    typeof h.mouthwash === "boolean" &&
    typeof h.water === "boolean"
  );
}

/**
 * Read the saved data, returning a freshly-derived view (streak / badges
 * recomputed from `entries`). Tolerates missing or malformed storage.
 */
export function loadSmileData(): SmileStreakData {
  if (!isBrowser) return empty();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<SmileStreakData> | null;
    if (!parsed || !Array.isArray(parsed.entries)) return empty();
    const entries = parsed.entries.filter(isValidEntry);
    const streak = computeStreak(entries);
    const bestStreak = Math.max(computeBestStreak(entries), parsed.bestStreak ?? 0);
    const badgesEarned = computeBadges(entries);
    return { entries, streak, bestStreak, badgesEarned };
  } catch {
    return empty();
  }
}

/**
 * Persist the data — caller is expected to derive `streak/bestStreak/badges`
 * via the helpers above before calling.
 */
function writeSmileData(data: SmileStreakData): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore — storage quota, private mode, etc. */
  }
}

/** Returns true if there is already a check-in for today (Amman). */
export function hasCheckedInToday(data: SmileStreakData): boolean {
  const today = getAmmanDateKey();
  return data.entries.some((entry) => entry.date === today);
}

/**
 * Save a new check-in for today. If there's already an entry for today,
 * it is replaced (so we don't double-count). Returns the next snapshot
 * along with the IDs of any badges that were newly unlocked, useful for
 * "you just earned X" celebration UI.
 */
export function saveCheckin(
  brushingPatternDone: boolean,
  habits: SmileHabits,
): { data: SmileStreakData; newlyEarned: SmileBadgeId[]; score: number } {
  const today = getAmmanDateKey();
  const previous = loadSmileData();
  const score = scoreCheckin(brushingPatternDone, habits);

  const filtered = previous.entries.filter((entry) => entry.date !== today);
  const nextEntries: SmileEntry[] = [
    ...filtered,
    { date: today, score, habits },
  ].sort((a, b) => a.date.localeCompare(b.date));

  const streak = computeStreak(nextEntries);
  const bestStreak = Math.max(previous.bestStreak, computeBestStreak(nextEntries));
  const badgesEarned = computeBadges(nextEntries);

  const newlyEarned = badgesEarned.filter(
    (badge) => !previous.badgesEarned.includes(badge),
  );

  const next: SmileStreakData = {
    entries: nextEntries,
    streak,
    bestStreak,
    badgesEarned,
  };
  writeSmileData(next);
  return { data: next, newlyEarned, score };
}
