"use client";

import { useTranslation } from "@/features/i18n/language-provider";

type PlanningTab = "resources" | "plans" | "assignments" | "supervisors";

type PlanningTabNavProps = {
  tab: PlanningTab;
  onChange: (tab: PlanningTab) => void;
  baseClass: string;
  activeClass: string;
  inactiveClass: string;
};

const tabKeys: Array<{ key: PlanningTab; labelKey: string }> = [
  { key: "resources", labelKey: "admin.plan.tab_resources" },
  { key: "plans", labelKey: "admin.plan.tab_plans" },
  { key: "assignments", labelKey: "admin.plan.tab_assignments" },
  { key: "supervisors", labelKey: "admin.plan.tab_supervisors" },
];

export function PlanningTabNav({
  tab,
  onChange,
  baseClass,
  activeClass,
  inactiveClass,
}: PlanningTabNavProps) {
  const t = useTranslation();
  return (
    <div className="inline-flex flex-wrap gap-2 rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.14)] p-2 shadow-[0_18px_44px_rgba(7,18,34,0.08)] backdrop-blur-[18px]">
      {tabKeys.map(({ key, labelKey }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`${baseClass} ${
            tab === key ? activeClass : inactiveClass
          }`}
        >
          {t(labelKey)}
        </button>
      ))}
    </div>
  );
}
