/**
 * Per-level feature summaries shown on the cinematic intro card before each
 * round. Level 1 includes a full "how to play" rundown; subsequent levels
 * list only what's NEW at that level so the patient sees the difference.
 *
 * Each entry is one short string with an optional emoji prefix — kept short
 * so the intro card stays readable at a glance during the 3-second countdown.
 */

import type { ArcadeGameType } from "@/features/arcade/services/arcade-api";

export type LevelFeature = {
  icon: string;
  text: string;
};

export type LevelBrief = {
  /** Headline shown above the feature list (e.g. "What's new"). */
  headline: string;
  features: LevelFeature[];
  /** Optional one-liner under the headline. */
  blurb?: string;
};

const PB_LEVELS: Record<number, LevelBrief> = {
  1: {
    headline: "How to play",
    blurb: "Tap targets as they appear. You have 30 seconds.",
    features: [
      { icon: "🦠", text: "Tap plaque — +10 points" },
      { icon: "✨", text: "Tap cavities — +50 points" },
      { icon: "❌", text: "Empty taps cost -5 and break combo" },
      { icon: "⏱️", text: "Every target has a decay ring — be quick" },
    ],
  },
  2: {
    headline: "New at Level 2",
    features: [
      { icon: "🪥", text: "Brushes appear — clean hit, +20 points" },
      { icon: "⚡", text: "Slightly faster spawn cadence" },
    ],
  },
  3: {
    headline: "New at Level 3",
    features: [
      { icon: "🍭", text: "Lollipops appear — DON'T tap, -50 if you do" },
      { icon: "🔥", text: "Combo broken on sugar or empty taps" },
    ],
  },
  4: {
    headline: "New at Level 4",
    features: [
      { icon: "⚡", text: "Spawn rate 30% faster" },
      { icon: "⏳", text: "Targets disappear sooner" },
    ],
  },
  5: {
    headline: "New at Level 5",
    features: [
      { icon: "💣", text: "Bombs appear — tap one and the round ENDS" },
      { icon: "🟥", text: "Bombs wobble with red glow — easy to spot" },
    ],
  },
  6: {
    headline: "New at Level 6",
    features: [
      { icon: "⏳", text: "Lifetimes shrink — react faster" },
      { icon: "🍬", text: "More sugar, more bombs" },
    ],
  },
  7: {
    headline: "New at Level 7",
    features: [
      { icon: "✌️", text: "Double-spawn — two targets land at once" },
      { icon: "⚡", text: "Even tighter spawn cadence" },
    ],
  },
  8: {
    headline: "New at Level 8",
    features: [
      { icon: "🌀", text: "Targets jitter on the grid — harder to focus" },
      { icon: "🍭", text: "Sugar share climbs to ~37%" },
    ],
  },
  9: {
    headline: "New at Level 9",
    features: [
      { icon: "🤘", text: "Triple-spawn — three targets at once possible" },
      { icon: "🔥", text: "Spawns every 300ms" },
    ],
  },
  10: {
    headline: "Maximum chaos",
    blurb: "Last fixed level. Everything cranked.",
    features: [
      { icon: "⚡", text: "230ms spawn cadence — relentless" },
      { icon: "⏳", text: "Half-second lifetimes" },
      { icon: "💣", text: "12% bomb share, 47% sugar share" },
      { icon: "🤘", text: "Triple-spawns are common" },
    ],
  },
  11: {
    headline: "♾️ Endless mode",
    blurb: "No timer. Difficulty climbs every 20 seconds. Bomb = game over.",
    features: [
      { icon: "♾️", text: "Open run — no fixed round duration" },
      { icon: "⚡", text: "Spawn cadence tightens with time" },
      { icon: "💣", text: "One bomb ends the run" },
      { icon: "🏆", text: "Push your best score as long as you can survive" },
    ],
  },
};

const TD_LEVELS: Record<number, LevelBrief> = {
  1: {
    headline: "How to play",
    blurb: "Click bacteria before they reach the tooth.",
    features: [
      { icon: "🦠", text: "Each kill scores points (25+ per kill)" },
      { icon: "❤️", text: "You start with 3 lives" },
      { icon: "💥", text: "If a bacteria hits the tooth: -1 life, -50 score" },
      { icon: "⭐", text: "First-shot kills earn a bonus +10" },
    ],
  },
  2: {
    headline: "New at Level 2",
    features: [
      { icon: "⚡", text: "Bacteria spawn faster" },
      { icon: "🏃", text: "Slightly quicker movement" },
    ],
  },
  3: {
    headline: "New at Level 3",
    features: [
      { icon: "💪", text: "Some bacteria take 2 shots to kill" },
      { icon: "⚡", text: "Faster spawn rate" },
    ],
  },
  4: {
    headline: "New at Level 4",
    features: [
      { icon: "🏃", text: "Bacteria move noticeably faster" },
      { icon: "🎯", text: "Tighter aim required" },
    ],
  },
  5: {
    headline: "New at Level 5",
    features: [
      { icon: "💪", text: "3-HP bacteria appear" },
      { icon: "⚡", text: "Spawn cadence 50% faster than Lv 1" },
    ],
  },
  6: {
    headline: "New at Level 6",
    features: [
      { icon: "🌀", text: "Bacteria approach in varied angles" },
      { icon: "🏃", text: "Movement speed climbs again" },
    ],
  },
  7: {
    headline: "New at Level 7",
    features: [
      { icon: "💪", text: "Tougher bacteria everywhere" },
      { icon: "⚡", text: "Rapid spawn rate" },
    ],
  },
  8: {
    headline: "New at Level 8",
    features: [
      { icon: "🤘", text: "Sustained waves — keep clicking" },
      { icon: "💪", text: "4-HP bacteria appear" },
    ],
  },
  9: {
    headline: "New at Level 9",
    features: [
      { icon: "🌪️", text: "Bacteria barely give breathing room" },
      { icon: "🏃", text: "Top-tier movement speed" },
    ],
  },
  10: {
    headline: "Maximum chaos",
    blurb: "Last fixed level. The swarm never stops.",
    features: [
      { icon: "💪", text: "Up to 5-HP bacteria" },
      { icon: "🏃", text: "Maximum speed + maximum spawn rate" },
      { icon: "🌪️", text: "Endless waves until you lose all 3 hearts" },
    ],
  },
  11: {
    headline: "♾️ Endless mode",
    blurb: "No level cap. Spawns + HP escalate every 25 seconds.",
    features: [
      { icon: "♾️", text: "Difficulty keeps climbing until you fall" },
      { icon: "💪", text: "Bacteria HP rises beyond Lv 10 max" },
      { icon: "❤️", text: "Still 3 lives — make them count" },
      { icon: "🏆", text: "Score as much as you can before the breach" },
    ],
  },
};

const FR_LEVELS: Record<number, LevelBrief> = {
  1: {
    headline: "How to play",
    blurb: "Switch lanes to collect items. Don't touch sugar.",
    features: [
      { icon: "↕️", text: "Arrow keys / WS / tap upper-middle-lower" },
      { icon: "🧵", text: "Collect floss for points" },
      { icon: "💧", text: "Water for points too" },
      { icon: "🍬", text: "Sugar = instant game over" },
    ],
  },
  2: {
    headline: "New at Level 2",
    features: [
      { icon: "🏃", text: "Lane scroll +20% faster" },
      { icon: "🦷", text: "Gold-tooth bonus pickups appear" },
    ],
  },
  3: {
    headline: "New at Level 3",
    features: [
      { icon: "🍬", text: "Sugar appears more often" },
      { icon: "⚡", text: "Quicker pickups" },
    ],
  },
  4: {
    headline: "New at Level 4",
    features: [
      { icon: "🏃", text: "Scroll speed climbs again" },
      { icon: "🎯", text: "Tighter dodge windows" },
    ],
  },
  5: {
    headline: "New at Level 5",
    features: [
      { icon: "🏃", text: "Scroll 50% faster than Lv 1" },
      { icon: "🍬", text: "Sugar share climbs sharply" },
    ],
  },
  6: {
    headline: "New at Level 6",
    features: [
      { icon: "🦷", text: "Gold-tooth gets rarer" },
      { icon: "🍬", text: "Sugar pairs in same lane" },
    ],
  },
  7: {
    headline: "New at Level 7",
    features: [
      { icon: "🏃", text: "Speed climbs into the danger zone" },
      { icon: "🌀", text: "Items spawn in patterns" },
    ],
  },
  8: {
    headline: "New at Level 8",
    features: [
      { icon: "🍬", text: "Chained sugar — multiple lanes blocked" },
      { icon: "🏃", text: "Reaction window tightens" },
    ],
  },
  9: {
    headline: "New at Level 9",
    features: [
      { icon: "🏃", text: "Near-max scroll speed" },
      { icon: "🤘", text: "Items come in dense rapid bursts" },
    ],
  },
  10: {
    headline: "Maximum chaos",
    blurb: "Last fixed level. Run for your life.",
    features: [
      { icon: "🏃", text: "Maximum scroll speed" },
      { icon: "🍬", text: "Sugar share peaks" },
      { icon: "⚡", text: "Items spawn in rapid-fire bursts" },
    ],
  },
  11: {
    headline: "♾️ Endless mode",
    blurb: "No level cap. Scroll speed climbs every 25 seconds.",
    features: [
      { icon: "♾️", text: "Open run — go as far as you can" },
      { icon: "🏃", text: "Scroll keeps accelerating" },
      { icon: "🍬", text: "Sugar density keeps climbing" },
      { icon: "🏆", text: "Distance + collectibles compound your score" },
    ],
  },
};

const IQ_LEVELS: Record<number, LevelBrief> = {
  1: {
    headline: "How to play",
    blurb: "10 multiple-choice questions about your teeth. 15s each.",
    features: [
      { icon: "🦷", text: "Tap the right answer — +100 base points" },
      { icon: "⏱️", text: "Answer fast — bigger time bonus" },
      { icon: "🔥", text: "Chain correct answers — streak multiplier" },
      { icon: "📚", text: "Wrong answers show the right one + a tip" },
    ],
  },
  2: { headline: "New at Level 2", features: [{ icon: "🪥", text: "Questions cover daily brushing technique" }, { icon: "⏱️", text: "13s per question — answer a touch faster" }] },
  3: { headline: "New at Level 3", features: [{ icon: "🧵", text: "Flossing, mouthwash and inter-dental care" }, { icon: "⚡", text: "Streak multiplier kicks in earlier" }] },
  4: { headline: "New at Level 4", features: [{ icon: "🦠", text: "Cavities, plaque and how decay forms" }, { icon: "⏱️", text: "12s per question" }] },
  5: { headline: "New at Level 5", features: [{ icon: "🫧", text: "Gum health, gingivitis vs periodontitis" }, { icon: "❓", text: "Some questions get a 4th harder option" }] },
  6: { headline: "New at Level 6", features: [{ icon: "🍎", text: "Diet, sugar timing and tooth-friendly foods" }, { icon: "⏱️", text: "11s per question" }] },
  7: { headline: "New at Level 7", features: [{ icon: "👶", text: "Baby teeth, eruption and pediatric dental care" }, { icon: "🔥", text: "Streak bonus doubled past 5 correct in a row" }] },
  8: { headline: "New at Level 8", features: [{ icon: "🪥", text: "Fluoride science and toothpaste chemistry" }, { icon: "⏱️", text: "10s per question" }] },
  9: { headline: "New at Level 9", features: [{ icon: "🏥", text: "Procedures: fillings, root canals, crowns, extractions" }] },
  10: { headline: "New at Level 10", features: [{ icon: "🦴", text: "Oral anatomy — names of teeth, jaws and tissues" }, { icon: "⏱️", text: "9s per question, no easy hints" }] },
  11: { headline: "Endless mode", blurb: "Questions cycle from across all topics; harder, faster, no warmup.", features: [{ icon: "♾️", text: "Endless rounds until you stop — best run wins" }, { icon: "🏆", text: "Streak multipliers carry across the run" }] },
};

const ML_LEVELS: Record<number, LevelBrief> = {
  1: {
    headline: "How to play",
    blurb: "Flip cards and match pairs. 3 misses ends the run.",
    features: [
      { icon: "👀", text: "Cards flash open for a few seconds — memorize fast" },
      { icon: "🃏", text: "Tap two — if they match they stay open" },
      { icon: "❌", text: "3 wrong matches and the round ends" },
      { icon: "⏱️", text: "Faster clears + fewer misses = higher score" },
    ],
  },
  2: { headline: "New at Level 2", features: [{ icon: "➕", text: "+1 pair to remember" }, { icon: "👀", text: "Preview time trimmed" }] },
  3: { headline: "New at Level 3", features: [{ icon: "🦷", text: "Anatomy cards: incisors, canines, molars" }, { icon: "👀", text: "Even less preview time" }] },
  4: { headline: "New at Level 4", features: [{ icon: "🪥", text: "Tool cards added — brushes, floss, scaler" }] },
  5: { headline: "New at Level 5", features: [{ icon: "🍎", text: "Healthy + sugary food cards added" }, { icon: "👀", text: "Preview blink — just 3 seconds" }] },
  6: { headline: "New at Level 6", features: [{ icon: "🦠", text: "Condition cards: cavity, gingivitis, abscess" }] },
  7: { headline: "New at Level 7", features: [{ icon: "🃏", text: "Bigger grid — more pairs in play" }, { icon: "👀", text: "Preview 2.5s" }] },
  8: { headline: "New at Level 8", features: [{ icon: "🌀", text: "Cards subtly shuffle once mid-preview" }] },
  9: { headline: "New at Level 9", features: [{ icon: "💎", text: "Bonus pair flashes — match it fast for double points" }] },
  10: { headline: "New at Level 10", features: [{ icon: "👀", text: "Preview only 1.5s — pure recall" }, { icon: "🃏", text: "Largest grid yet" }] },
  11: { headline: "Endless mode", blurb: "Boards keep coming back-to-back. Three misses across the run end it.", features: [{ icon: "♾️", text: "No round end — only a miss limit" }, { icon: "🏆", text: "Score compounds across boards" }] },
};

const BB_LEVELS: Record<number, LevelBrief> = {
  1: {
    headline: "How to play",
    blurb: "Watch the brush light up your teeth — then repeat the pattern.",
    features: [
      { icon: "👀", text: "Starts with just 2 steps — easy warm-up" },
      { icon: "🪥", text: "Tap the same quadrants in the same order" },
      { icon: "❌", text: "3 misses and the round ends" },
      { icon: "📈", text: "Each correct round adds one more step (5 rounds total)" },
    ],
  },
  2: { headline: "New at Level 2", features: [{ icon: "⚡", text: "Pattern plays slightly faster" }] },
  3: { headline: "New at Level 3", features: [{ icon: "📈", text: "Starts at 3 steps instead of 2" }, { icon: "💎", text: "Clean-round bonus added" }] },
  4: { headline: "New at Level 4", features: [{ icon: "⚡", text: "Pattern playback noticeably quicker" }] },
  5: { headline: "New at Level 5", features: [{ icon: "🪥", text: "Inner surfaces matter — 6 zones, not 4" }, { icon: "📈", text: "Starts at 4 steps" }] },
  6: { headline: "New at Level 6", features: [{ icon: "⚡", text: "Faster cadence, less reaction time" }] },
  7: { headline: "New at Level 7", features: [{ icon: "👅", text: "Tongue + cheek zones added — full mouth coverage" }, { icon: "📈", text: "Starts at 5 steps" }] },
  8: { headline: "New at Level 8", features: [{ icon: "🌀", text: "Brief misdirection flicker between steps" }] },
  9: { headline: "New at Level 9", features: [{ icon: "📈", text: "Starts at 6 steps and each round adds 2 instead of 1" }] },
  10: { headline: "New at Level 10", features: [{ icon: "🚀", text: "Top speed, longest patterns — full Bass-technique cycle" }] },
  11: { headline: "Endless mode", blurb: "Patterns keep growing until you miss 3 times.", features: [{ icon: "♾️", text: "No round cap — keep extending the chain" }, { icon: "🏆", text: "Chain bonus compounds — long runs are worth a lot" }] },
};

const TABLES: Record<ArcadeGameType, Record<number, LevelBrief>> = {
  PLAQUE_BLASTER: PB_LEVELS,
  TOOTH_DEFENDER: TD_LEVELS,
  FLOSS_RUSH: FR_LEVELS,
  TOOTH_IQ: IQ_LEVELS,
  MATCH_LAB: ML_LEVELS,
  BRUSH_BUDDY: BB_LEVELS,
};

/**
 * Returns the intro brief for a given game + level. Falls back to a generic
 * "tougher" brief if the level isn't explicitly defined (shouldn't happen,
 * but keeps the intro card defensive).
 */
export function getLevelBrief(
  gameType: ArcadeGameType,
  level: number,
): LevelBrief {
  const table = TABLES[gameType];
  return (
    table[level] ?? {
      headline: `Level ${level}`,
      features: [
        { icon: "⚡", text: "Tougher spawns, faster cadence" },
      ],
    }
  );
}
