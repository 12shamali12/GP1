"use client";

/**
 * Small reusable badge chip for the Smile Streak summary.
 *
 * Each badge has its own glyph + colour family. Earned badges render in
 * full colour; unearned ones grey out so the patient can see progress
 * toward the next milestone.
 */

import { useTranslation } from "@/features/i18n/language-provider";
import type { SmileBadgeId } from "@/features/smile-streak/lib/storage";

export type BadgeCardProps = {
  id: SmileBadgeId;
  earned: boolean;
  /** When true, gently bounces — used in summary view for freshly-earned. */
  fresh?: boolean;
};

const BADGE_GLYPH: Record<SmileBadgeId, string> = {
  "first-checkin": "🌱",
  "streak-3": "🔥",
  "streak-7": "💎",
  "streak-30": "👑",
};

const BADGE_CLASSES: Record<SmileBadgeId, { bg: string; border: string; text: string }> = {
  "first-checkin": {
    bg: "bg-[linear-gradient(135deg,rgba(187,247,208,0.7),rgba(134,239,172,0.42))]",
    border: "border-[rgba(22,163,74,0.4)]",
    text: "text-[rgba(20,83,45,0.95)]",
  },
  "streak-3": {
    bg: "bg-[linear-gradient(135deg,rgba(254,215,170,0.7),rgba(253,186,116,0.45))]",
    border: "border-[rgba(234,88,12,0.42)]",
    text: "text-[rgba(124,45,18,0.95)]",
  },
  "streak-7": {
    bg: "bg-[linear-gradient(135deg,rgba(196,224,251,0.7),rgba(147,197,253,0.45))]",
    border: "border-[rgba(37,99,235,0.4)]",
    text: "text-[rgba(30,58,138,0.95)]",
  },
  "streak-30": {
    bg: "bg-[linear-gradient(135deg,rgba(252,231,243,0.75),rgba(244,114,182,0.45))]",
    border: "border-[rgba(190,24,93,0.42)]",
    text: "text-[rgba(112,26,69,0.95)]",
  },
};

export function BadgeCard({ id, earned, fresh = false }: BadgeCardProps) {
  const t = useTranslation();
  const classes = BADGE_CLASSES[id];

  if (!earned) {
    return (
      <span
        className="inline-flex items-center gap-2 rounded-full border border-dashed border-white/30 bg-white/14 px-3 py-1.5 text-xs font-semibold text-[rgba(10,22,40,0.45)]"
        aria-label={`Locked: ${t(`smile.badge.${id}`)}`}
      >
        <span aria-hidden className="opacity-50">
          {BADGE_GLYPH[id]}
        </span>
        <span>{t(`smile.badge.${id}`)}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold shadow-[0_6px_18px_rgba(10,22,40,0.08)] ${classes.bg} ${classes.border} ${classes.text} ${
        fresh ? "denty-flame-bounce" : ""
      }`}
    >
      <span aria-hidden className="text-sm">
        {BADGE_GLYPH[id]}
      </span>
      <span>{t(`smile.badge.${id}`)}</span>
    </span>
  );
}
