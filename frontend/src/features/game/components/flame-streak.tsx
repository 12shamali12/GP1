"use client";

/**
 * Animated flame + streak count pill.
 *
 * Used in the doctor game lobby, results screen, and the patient smile-streak
 * surface. Pure SVG + global CSS keyframes (declared in `globals.css`) — no
 * animation libraries. The flame body gently pulses; when `onFire` is true
 * (default once `count >= 3`) the wrapper bounces and an "ON FIRE" badge
 * appears next to the label.
 */

import { useTranslation } from "@/features/i18n/language-provider";

export type FlameStreakProps = {
  /** Current consecutive-day streak. 0 hides the on-fire badge. */
  count: number;
  /** Visual size of the flame and pill. */
  size?: "sm" | "md" | "lg";
  /** Optional override of the displayed text — defaults to "{n}-day streak". */
  label?: string;
  /**
   * When undefined, the badge auto-derives from `count >= 3`. Pass `false`
   * to force the calmer (non-bouncing) variant in side rails.
   */
  onFire?: boolean;
  className?: string;
};

const SIZE_MAP = {
  sm: {
    flame: "h-5 w-5",
    text: "text-xs",
    pad: "px-3 py-1",
    badge: "text-[9px]",
  },
  md: {
    flame: "h-7 w-7",
    text: "text-sm",
    pad: "px-4 py-2",
    badge: "text-[10px]",
  },
  lg: {
    flame: "h-12 w-12",
    text: "text-lg",
    pad: "px-5 py-3",
    badge: "text-xs",
  },
} as const;

export function FlameStreak({
  count,
  size = "md",
  label,
  onFire,
  className = "",
}: FlameStreakProps) {
  const t = useTranslation();
  const sizes = SIZE_MAP[size];
  const isOnFire = onFire ?? count >= 3;
  const display = label ?? t("game.streak", { n: count });

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-[rgba(234,88,12,0.32)] bg-[linear-gradient(135deg,rgba(254,215,170,0.65),rgba(253,186,116,0.45))] font-semibold text-[rgba(124,45,18,0.95)] shadow-[0_12px_28px_rgba(124,45,18,0.18)] ${sizes.pad} ${sizes.text} ${
        isOnFire ? "denty-flame-bounce" : ""
      } ${className}`}
      aria-label={display}
    >
      <FlameSvg className={`${sizes.flame} denty-flame-pulse`} />
      <span>{display}</span>
      {isOnFire ? (
        <span
          className={`ml-1 inline-flex items-center rounded-full bg-[rgba(220,38,38,0.92)] px-2 py-[2px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_6px_16px_rgba(127,29,29,0.4)] ${sizes.badge}`}
        >
          {t("game.on_fire")}
        </span>
      ) : null}
    </span>
  );
}

function FlameSvg({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="flame-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="40%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id="flame-core" x1="50%" y1="20%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <path
        d="M16 2c2 4 6 6 6 11 0 2-1 3.5-2.5 4.5C20 16 19 14 18 13c0 4-4 5-4 9 0 3 2 6 5 6-5 1-11-2-11-9 0-6 5-9 5-13 0 2 1 3 3 2-1-2 0-4 0-6Z"
        fill="url(#flame-grad)"
        stroke="rgba(124,45,18,0.5)"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <path
        d="M16 14c1 2 3 3 3 6 0 2-1.5 4-3.5 4-2 0-3.5-1.5-3.5-3.5 0-2 2-3 2-5 0 1 1 1.5 2-1.5Z"
        fill="url(#flame-core)"
      />
    </svg>
  );
}
