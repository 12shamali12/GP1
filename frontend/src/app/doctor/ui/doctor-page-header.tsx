"use client";

import { BrandMark } from "@/features/ui/components/brand-mark";
import { useTranslation } from "@/features/i18n/language-provider";

export type DoctorSurface =
  | "overview"
  | "profile"
  | "notifications"
  | "approvals"
  | "report"
  | "chat"
  | "game"
  | "leaderboard"
  | "settings";

export type DoctorSurfaceMeta = {
  eyebrow: string;
  title: string;
  description: string;
  badges: string[];
};

/**
 * Translation-key descriptors for each doctor surface. The visible strings are
 * resolved through `useTranslation()` inside the component, so this stays a
 * pure key map and never holds raw English.
 */
type DoctorSurfaceMetaKeys = {
  eyebrow: string;
  title: string;
  description: string;
  badges: string[];
};

export const doctorSurfaceMeta: Record<DoctorSurface, DoctorSurfaceMetaKeys> = {
  overview: {
    eyebrow: "doctor.surface.overview.eyebrow",
    title: "doctor.surface.overview.title",
    description: "doctor.surface.overview.description",
    badges: [
      "doctor.surface.overview.badge1",
      "doctor.surface.overview.badge2",
      "doctor.surface.overview.badge3",
    ],
  },
  profile: {
    eyebrow: "doctor.surface.profile.eyebrow",
    title: "doctor.surface.profile.title",
    description: "doctor.surface.profile.description",
    badges: [
      "doctor.surface.profile.badge1",
      "doctor.surface.profile.badge2",
      "doctor.surface.profile.badge3",
    ],
  },
  notifications: {
    eyebrow: "doctor.surface.notifications.eyebrow",
    title: "doctor.surface.notifications.title",
    description: "doctor.surface.notifications.description",
    badges: [
      "doctor.surface.notifications.badge1",
      "doctor.surface.notifications.badge2",
      "doctor.surface.notifications.badge3",
    ],
  },
  approvals: {
    eyebrow: "doctor.surface.approvals.eyebrow",
    title: "doctor.surface.approvals.title",
    description: "doctor.surface.approvals.description",
    badges: [
      "doctor.surface.approvals.badge1",
      "doctor.surface.approvals.badge2",
      "doctor.surface.approvals.badge3",
    ],
  },
  report: {
    eyebrow: "doctor.surface.report.eyebrow",
    title: "doctor.surface.report.title",
    description: "doctor.surface.report.description",
    badges: [
      "doctor.surface.report.badge1",
      "doctor.surface.report.badge2",
      "doctor.surface.report.badge3",
    ],
  },
  chat: {
    eyebrow: "doctor.surface.chat.eyebrow",
    title: "doctor.surface.chat.title",
    description: "doctor.surface.chat.description",
    badges: [
      "doctor.surface.chat.badge1",
      "doctor.surface.chat.badge2",
      "doctor.surface.chat.badge3",
    ],
  },
  leaderboard: {
    eyebrow: "doctor.surface.leaderboard.eyebrow",
    title: "doctor.surface.leaderboard.title",
    description: "doctor.surface.leaderboard.description",
    badges: [
      "doctor.surface.leaderboard.badge1",
      "doctor.surface.leaderboard.badge2",
      "doctor.surface.leaderboard.badge3",
    ],
  },
  game: {
    eyebrow: "doctor.surface.game.eyebrow",
    title: "doctor.surface.game.title",
    description: "doctor.surface.game.description",
    badges: [
      "doctor.surface.game.badge1",
      "doctor.surface.game.badge2",
      "doctor.surface.game.badge3",
      "doctor.surface.game.badge4",
      "doctor.surface.game.badge5",
    ],
  },
  settings: {
    eyebrow: "doctor.surface.settings.eyebrow",
    title: "doctor.surface.settings.title",
    description: "doctor.surface.settings.description",
    badges: [
      "doctor.surface.settings.badge1",
      "doctor.surface.settings.badge2",
      "doctor.surface.settings.badge3",
      "doctor.surface.settings.badge4",
    ],
  },
};

type DoctorPageHeaderProps = {
  meta: DoctorSurfaceMetaKeys;
};

export function DoctorPageHeader({ meta }: DoctorPageHeaderProps) {
  const t = useTranslation();

  return (
    <div className="overflow-hidden rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(249,252,255,0.78),rgba(222,233,241,0.34))] px-5 py-5 shadow-[0_28px_72px_rgba(7,18,34,0.16)] backdrop-blur-[24px] md:px-7 md:py-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <BrandMark className="h-14 w-14 frozen-float" />
            <span className="rounded-full border border-white/20 bg-white/26 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgba(10,22,40,0.64)]">
              {t("doctor.header.badge")}
            </span>
          </div>

          <div>
            <p className="denty-kicker">{t(meta.eyebrow)}</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold text-[var(--foreground)] md:text-3xl">
              {t(meta.title)}
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-[var(--muted-foreground)] md:text-base">
              {t(meta.description)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 xl:justify-end">
          {meta.badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-white/20 bg-white/26 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(10,22,40,0.62)]"
            >
              {t(badge)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
