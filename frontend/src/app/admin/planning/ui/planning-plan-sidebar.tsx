"use client";

import type { ChangeEvent } from "react";
import { useTranslation } from "@/features/i18n/language-provider";
import type { PlanningWorkspaceData, ShiftTemplateItem } from "@/features/supervision/types";

type PlanningPlan = PlanningWorkspaceData["plans"][number];
type PlanDraftMode = "create" | "edit";

type PlanningPlanSidebarProps = {
  panelClass: string;
  primaryAction: string;
  dangerAction: string;
  accentAction: string;
  smallDanger: string;
  planDraftMode: PlanDraftMode;
  selectedPlan: PlanningPlan | null;
  sortedPlans: PlanningPlan[];
  sortedShifts: ShiftTemplateItem[];
  selectedPlanId: string;
  planForm: {
    label: string;
    startsOn: string;
    shiftId: string;
  };
  onStartNewPlan: () => void;
  onSavePlanShell: () => void;
  onDeletePlan: (plan: { id: string; label: string }) => void;
  onSelectPlan: (planId: string) => void;
  onPlanFieldChange: (
    field: "label" | "startsOn" | "shiftId",
    value: string
  ) => void;
  formatDateLabel: (
    value: string,
    options?: Intl.DateTimeFormatOptions
  ) => string;
};

export function PlanningPlanSidebar({
  panelClass,
  primaryAction,
  dangerAction,
  accentAction,
  smallDanger,
  planDraftMode,
  selectedPlan,
  sortedPlans,
  sortedShifts,
  selectedPlanId,
  planForm,
  onStartNewPlan,
  onSavePlanShell,
  onDeletePlan,
  onSelectPlan,
  onPlanFieldChange,
  formatDateLabel,
}: PlanningPlanSidebarProps) {
  const t = useTranslation();
  const handleInputChange =
    (field: "label" | "startsOn" | "shiftId") =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onPlanFieldChange(field, event.target.value);
    };

  return (
    <div className="space-y-5">
      <div className={panelClass}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="denty-kicker">
              {planDraftMode === "edit"
                ? t("admin.plan.selected_plan")
                : t("admin.plan.new_plan")}
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
              {planDraftMode === "edit"
                ? t("admin.plan.edit_two_week")
                : t("admin.plan.create_two_week")}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
              {t("admin.plan.plan_intro")}
            </p>
          </div>
          {planDraftMode === "edit" ? (
            <button
              type="button"
              onClick={onStartNewPlan}
              className={accentAction}
            >
              {t("admin.plan.new_plan")}
            </button>
          ) : null}
        </div>

        {planDraftMode === "edit" && selectedPlan ? (
          <div className="mt-5 rounded-[22px] border border-white/12 bg-[linear-gradient(180deg,rgba(9,20,38,0.82),rgba(11,30,52,0.56))] p-5 text-white shadow-[0_20px_54px_rgba(4,11,26,0.26)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/56">
                  {t("admin.plan.published_window")}
                </p>
                <p className="mt-3 text-xl font-semibold text-white">
                  {selectedPlan.label}
                </p>
              </div>
              <span className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/74">
                {t("admin.plan.duty_days_count", {
                  count: selectedPlan.days.filter((day) => !day.isVacation)
                    .length,
                })}
              </span>
            </div>
            <p className="mt-3 text-sm text-white/70">
              {formatDateLabel(selectedPlan.startsOn, {
                weekday: "long",
                day: "numeric",
                month: "short",
              })}{" "}
              to{" "}
              {formatDateLabel(selectedPlan.endsOn, {
                weekday: "long",
                day: "numeric",
                month: "short",
              })}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/72">
                {t("admin.plan.free_days_count", {
                  count: selectedPlan.days.filter((day) => day.isVacation)
                    .length,
                })}
              </span>
              <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/72">
                {t("admin.plan.group_views_count", {
                  count: selectedPlan.assignedGroups.length,
                })}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-[20px] border border-dashed border-white/18 bg-white/18 p-5">
            <p className="text-sm text-[var(--muted-foreground)]">
              {t("admin.plan.shell_hint")}
            </p>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <input
            value={planForm.label}
            onChange={handleInputChange("label")}
            className="denty-field text-sm"
            placeholder={t("admin.plan.label_placeholder")}
          />
          <input
            type="date"
            value={planForm.startsOn}
            onChange={handleInputChange("startsOn")}
            className="denty-field text-sm"
          />
          <select
            value={planForm.shiftId}
            onChange={handleInputChange("shiftId")}
            className="denty-field cursor-pointer text-sm"
          >
            <option value="">{t("admin.plan.choose_fixed_shift")}</option>
            {sortedShifts.map((shift) => (
              <option key={shift.id} value={shift.id}>
                {shift.name} | {shift.startsAt} - {shift.endsAt}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={onSavePlanShell} className={primaryAction}>
            {planDraftMode === "edit"
              ? t("admin.plan.save_shell_changes")
              : t("admin.plan.create_shell")}
          </button>
          {planDraftMode === "edit" && selectedPlan ? (
            <button
              type="button"
              onClick={() =>
                onDeletePlan({ id: selectedPlan.id, label: selectedPlan.label })
              }
              className={dangerAction}
            >
              {t("admin.plan.delete_plan")}
            </button>
          ) : null}
        </div>
      </div>

      <div className={panelClass}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="denty-kicker">{t("admin.plan.plan_library")}</p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {t("admin.plan.library_intro")}
            </p>
          </div>
          <span className="denty-pill">
            {t("admin.plan.saved_count", { count: sortedPlans.length })}
          </span>
        </div>

        <div className="mt-4 max-h-[26rem] min-h-[26rem] space-y-3 overflow-y-auto pr-2">
          {sortedPlans.map((plan) => (
            <div
              key={plan.id}
              className={`w-full rounded-[24px] border p-4 text-left transition ${
                selectedPlanId === plan.id
                  ? "border-[rgba(137,219,255,0.24)] bg-[linear-gradient(180deg,rgba(9,20,38,0.82),rgba(11,30,52,0.56))] text-white shadow-[0_20px_44px_rgba(6,17,34,0.22)]"
                  : "border-white/12 bg-white/28 hover:bg-white/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onSelectPlan(plan.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className={`text-lg font-semibold ${selectedPlanId === plan.id ? "text-white" : "text-[var(--foreground)]"}`}>
                        {plan.label}
                      </p>
                      <p className={`mt-1 text-sm ${selectedPlanId === plan.id ? "text-white/68" : "text-[var(--muted-foreground)]"}`}>
                        {formatDateLabel(plan.startsOn)} -{" "}
                        {formatDateLabel(plan.endsOn)}
                      </p>
                    </div>
                    {plan.shift ? (
                      <span className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${selectedPlanId === plan.id ? "border-white/12 bg-white/10 text-white/76" : "border-white/12 bg-white/24 text-[rgba(10,22,40,0.56)]"}`}>
                        {plan.shift.name} - {plan.shift.startsAt} -{" "}
                        {plan.shift.endsAt}
                      </span>
                    ) : null}
                  </div>
                  <div className={`mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em] ${selectedPlanId === plan.id ? "text-white/58" : "text-[rgba(10,22,40,0.48)]"}`}>
                    <span>
                      {t("admin.plan.clinic_days_count", {
                        count: plan.days.filter((day) => !day.isVacation)
                          .length,
                      })}
                    </span>
                    <span>
                      {t("admin.plan.free_days_count", {
                        count: plan.days.filter((day) => day.isVacation).length,
                      })}
                    </span>
                    <span>
                      {t("admin.plan.assigned_groups_count", {
                        count: plan.assignedGroups.length,
                      })}
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onDeletePlan({ id: plan.id, label: plan.label })}
                  className={smallDanger}
                >
                  {t("admin.common.delete")}
                </button>
              </div>
            </div>
          ))}
          {!sortedPlans.length ? (
            <div className="denty-placeholder p-4">
              <p className="text-sm text-[var(--muted-foreground)]">
                {t("admin.plan.no_plans_created")}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
