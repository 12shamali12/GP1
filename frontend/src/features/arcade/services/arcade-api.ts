import { httpJson } from "@/lib/api/http";
import { authHeaders } from "@/lib/api/auth";

/**
 * Arcade API client — patient competitive games.
 *
 * Three games share this client; the backend disambiguates with `gameType`.
 * Daily lock is enforced server-side; the client just renders state.
 */

export type ArcadeGameType =
  | "PLAQUE_BLASTER"
  | "TOOTH_DEFENDER"
  | "FLOSS_RUSH";

export type ArcadeTodayEntry = {
  gameType: ArcadeGameType;
  canPlay: boolean;
  bestScore: number;
  /** Best score the patient ever achieved at each level — index 0 = Lv 1. */
  bestScorePerLevel: number[];
  streak: number;
  /** Highest level the patient is currently allowed to play (1..10). */
  unlockedLevel: number;
  /** Score needed to unlock the NEXT level, or null at Level 10. */
  nextThreshold: number | null;
  /** Full threshold array for displaying lock requirements per level. */
  thresholds: number[];
};

export type SubmitArcadeScorePayload = {
  gameType: ArcadeGameType;
  score: number;
  /** Level the patient picked from the dropdown (1..unlockedLevel). */
  level?: number;
  durationMs?: number;
};

export type SubmitArcadeScoreResponse = {
  attemptId: string;
  score: number;
  isNewBest: boolean;
  bestScore: number;
  playedAtLevel: number;
  unlockedLevel: number;
  newLevelUnlocked: boolean;
  nextThreshold: number | null;
};

export type ArcadeLeaderboardEntry = {
  rank: number;
  patient: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  };
  bestScore: number;
  attempts: number;
  streak: number;
  lastPlayedAt: string | null;
};

export type ArcadeLeaderboardSnapshot = {
  gameType: ArcadeGameType;
  /** Level filter that was applied to this snapshot — null = all levels. */
  level: number | null;
  generatedAt: string;
  entries: ArcadeLeaderboardEntry[];
};

export const getArcadeToday = (): Promise<ArcadeTodayEntry[]> =>
  httpJson<ArcadeTodayEntry[]>("/arcade/today", { headers: authHeaders() });

export const submitArcadeScore = (
  payload: SubmitArcadeScorePayload,
): Promise<SubmitArcadeScoreResponse> =>
  httpJson<SubmitArcadeScoreResponse>("/arcade/score", {
    method: "POST",
    headers: authHeaders(),
    body: payload,
  });

export const getArcadeLeaderboard = (
  gameType: ArcadeGameType,
  level?: number,
): Promise<ArcadeLeaderboardSnapshot> =>
  httpJson<ArcadeLeaderboardSnapshot>("/arcade/leaderboard", {
    headers: authHeaders(),
    query: level ? { game: gameType, level } : { game: gameType },
  });
