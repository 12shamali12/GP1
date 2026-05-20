"use client";

import { useTranslation } from "@/features/i18n/language-provider";
import { type DoctorWorkspaceViewKey } from "./doctor-workspace-types";

type Props = {
  view: DoctorWorkspaceViewKey;
  onChange: (view: DoctorWorkspaceViewKey) => void;
  tabBaseClass: string;
  tabActiveClass: string;
  tabInactiveClass: string;
};

const VIEW_KEYS: DoctorWorkspaceViewKey[] = ["desk", "plan", "tasks", "community"];

export function DoctorWorkspaceViewSwitch({
  view,
  onChange,
  tabBaseClass,
  tabActiveClass,
  tabInactiveClass,
}: Props) {
  const t = useTranslation();
  return (
    <section className="denty-panel-strong px-5 py-5 md:px-6 md:py-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="denty-kicker">{t("supervision.doctor.switch.eyebrow")}</p>
          <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
            {t("supervision.doctor.switch.title")}
          </h3>
        </div>
        <span className="denty-pill">{t(`supervision.doctor.view.${view}`)}</span>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        {VIEW_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`${tabBaseClass} ${view === key ? tabActiveClass : tabInactiveClass}`}
          >
            {t(`supervision.doctor.view.${key}`)}
          </button>
        ))}
      </div>
    </section>
  );
}
