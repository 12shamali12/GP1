"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/features/i18n/language-provider";
import type { SemesterProgressionPreview } from "@/features/admin/types/admin";
import type {
  PlanningWorkspaceData,
  ShiftTemplateItem,
} from "@/features/supervision/types";

type PlanningClinic = PlanningWorkspaceData["clinics"][number];
type PlanningSemester = PlanningWorkspaceData["semesters"][number];
type PlanningClinicCase = PlanningSemester["clinicCases"][number];

type PlanningResourcesViewProps = {
  panelClass: string;
  secondaryAction: string;
  primaryAction: string;
  smallSecondary: string;
  smallDanger: string;
  showClinicForm: boolean;
  showShiftForm: boolean;
  showSemesterForm: boolean;
  showClinicCaseForm: boolean;
  editingClinicId: string | null;
  editingShiftId: string | null;
  editingSemesterId: string | null;
  editingClinicCaseId: string | null;
  clinicForm: {
    name: string;
    description: string;
  };
  shiftForm: {
    name: string;
    startsAt: string;
    endsAt: string;
    appointmentCapacity: string;
  };
  semesterForm: {
    label: string;
    sortOrder: string;
    endsOn: string;
  };
  clinicCaseForm: {
    semesterId: string;
    clinicId: string;
    title: string;
    description: string;
    requiredCount: string;
  };
  sortedClinics: PlanningClinic[];
  sortedShifts: ShiftTemplateItem[];
  sortedSemesters: PlanningSemester[];
  semesterProgression: SemesterProgressionPreview | null;
  progressingSemesters: boolean;
  studentSemesterSubmittingId: string | null;
  onToggleClinicForm: () => void;
  onToggleShiftForm: () => void;
  onToggleSemesterForm: () => void;
  onToggleClinicCaseForm: () => void;
  onResetClinicForm: () => void;
  onResetShiftForm: () => void;
  onResetSemesterForm: () => void;
  onResetClinicCaseForm: () => void;
  onClinicFieldChange: (field: "name" | "description", value: string) => void;
  onShiftFieldChange: (
    field: "name" | "startsAt" | "endsAt" | "appointmentCapacity",
    value: string
  ) => void;
  onSemesterFieldChange: (
    field: "label" | "sortOrder" | "endsOn",
    value: string
  ) => void;
  onClinicCaseFieldChange: (
    field: "semesterId" | "clinicId" | "title" | "description" | "requiredCount",
    value: string
  ) => void;
  onSaveClinic: () => void;
  onSaveShift: () => void;
  onSaveSemester: () => void;
  onSaveClinicCase: () => void;
  onAdvanceSemesterCohorts: () => void;
  onReassignStudentSemester: (userId: string, semesterId?: string | null) => void;
  onEditClinic: (clinic: PlanningClinic) => void;
  onEditShift: (shift: ShiftTemplateItem) => void;
  onEditSemester: (semester: PlanningSemester) => void;
  onEditClinicCase: (clinicCase: PlanningClinicCase, semester: PlanningSemester) => void;
  onDeleteClinic: (clinic: PlanningClinic) => void;
  onDeleteShift: (shift: ShiftTemplateItem) => void;
  onDeleteSemester: (semester: PlanningSemester) => void;
  onDeleteClinicCase: (clinicCase: PlanningClinicCase) => void;
};

export function PlanningResourcesView({
  panelClass,
  secondaryAction,
  primaryAction,
  smallSecondary,
  smallDanger,
  showClinicForm,
  showShiftForm,
  showSemesterForm,
  showClinicCaseForm,
  editingClinicId,
  editingShiftId,
  editingSemesterId,
  editingClinicCaseId,
  clinicForm,
  shiftForm,
  semesterForm,
  clinicCaseForm,
  sortedClinics,
  sortedShifts,
  sortedSemesters,
  semesterProgression,
  progressingSemesters,
  studentSemesterSubmittingId,
  onToggleClinicForm,
  onToggleShiftForm,
  onToggleSemesterForm,
  onToggleClinicCaseForm,
  onResetClinicForm,
  onResetShiftForm,
  onResetSemesterForm,
  onResetClinicCaseForm,
  onClinicFieldChange,
  onShiftFieldChange,
  onSemesterFieldChange,
  onClinicCaseFieldChange,
  onSaveClinic,
  onSaveShift,
  onSaveSemester,
  onSaveClinicCase,
  onAdvanceSemesterCohorts,
  onReassignStudentSemester,
  onEditClinic,
  onEditShift,
  onEditSemester,
  onEditClinicCase,
  onDeleteClinic,
  onDeleteShift,
  onDeleteSemester,
  onDeleteClinicCase,
}: PlanningResourcesViewProps) {
  const t = useTranslation();
  const [semesterSelections, setSemesterSelections] = useState<Record<string, string>>(
    {},
  );

  const semesterOptions = useMemo(
    () =>
      (semesterProgression?.semesters || []).map((semester) => ({
        id: semester.id,
        label: semester.label,
      })),
    [semesterProgression?.semesters],
  );

  useEffect(() => {
    const nextSelections: Record<string, string> = {};
    semesterProgression?.dueStudents.forEach((student) => {
      nextSelections[student.id] =
        semesterSelections[student.id] ||
        student.nextSemester?.id ||
        student.currentSemester.id;
    });
    setSemesterSelections(nextSelections);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semesterProgression?.dueStudents]);

  return (
    <div className="grid gap-5 xl:grid-cols-[0.68fr_1.32fr]">
      <div className={panelClass}>
        <p className="denty-kicker">{t("admin.plan.setup_wall")}</p>
        <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
          {t("admin.plan.clinics_shifts")}
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
          {t("admin.plan.setup_intro")}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onToggleClinicForm}
            className={secondaryAction}
          >
            {showClinicForm && !editingClinicId
              ? t("admin.plan.hide_clinic_form")
              : t("admin.plan.create_clinic")}
          </button>
          <button
            type="button"
            onClick={onToggleShiftForm}
            className={secondaryAction}
          >
            {showShiftForm && !editingShiftId
              ? t("admin.plan.hide_shift_form")
              : t("admin.plan.create_shift")}
          </button>
          <button
            type="button"
            onClick={onToggleSemesterForm}
            className={secondaryAction}
          >
            {showSemesterForm && !editingSemesterId
              ? t("admin.plan.hide_semester_form")
              : t("admin.plan.create_semester")}
          </button>
          <button
            type="button"
            onClick={onToggleClinicCaseForm}
            className={secondaryAction}
          >
            {showClinicCaseForm && !editingClinicCaseId
              ? t("admin.plan.hide_case_form")
              : t("admin.plan.create_clinic_case")}
          </button>
        </div>

        {showClinicForm ? (
          <div className="mt-5 space-y-3 rounded-[20px] border border-white/12 bg-white/34 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[rgba(10,22,40,0.62)]">
                {editingClinicId
                  ? t("admin.plan.edit_clinic")
                  : t("admin.plan.new_clinic")}
              </p>
              {editingClinicId ? (
                <button
                  type="button"
                  onClick={onResetClinicForm}
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgba(10,22,40,0.56)]"
                >
                  {t("admin.common.cancel")}
                </button>
              ) : null}
            </div>

            <input
              value={clinicForm.name}
              onChange={(e) => onClinicFieldChange("name", e.target.value)}
              className="denty-field text-sm"
              placeholder={t("admin.plan.clinic_name_placeholder")}
            />
            <textarea
              value={clinicForm.description}
              onChange={(e) =>
                onClinicFieldChange("description", e.target.value)
              }
              className="denty-field min-h-[100px] text-sm"
              placeholder={t("admin.plan.clinic_note_placeholder")}
            />
            <button
              type="button"
              onClick={onSaveClinic}
              className={primaryAction}
            >
              {editingClinicId
                ? t("admin.plan.save_clinic_changes")
                : t("admin.plan.save_clinic")}
            </button>
          </div>
        ) : null}

        {showShiftForm ? (
          <div className="mt-5 grid gap-3 rounded-[20px] border border-white/12 bg-white/34 p-4 md:grid-cols-2">
            <div className="flex items-center justify-between gap-3 md:col-span-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[rgba(10,22,40,0.62)]">
                {editingShiftId
                  ? t("admin.plan.edit_shift")
                  : t("admin.plan.new_shift")}
              </p>
              {editingShiftId ? (
                <button
                  type="button"
                  onClick={onResetShiftForm}
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgba(10,22,40,0.56)]"
                >
                  {t("admin.common.cancel")}
                </button>
              ) : null}
            </div>

            <input
              value={shiftForm.name}
              onChange={(e) => onShiftFieldChange("name", e.target.value)}
              className="denty-field text-sm md:col-span-2"
              placeholder={t("admin.plan.shift_name_placeholder")}
            />
            <input
              type="time"
              value={shiftForm.startsAt}
              onChange={(e) => onShiftFieldChange("startsAt", e.target.value)}
              className="denty-field text-sm"
            />
            <input
              type="time"
              value={shiftForm.endsAt}
              onChange={(e) => onShiftFieldChange("endsAt", e.target.value)}
              className="denty-field text-sm"
            />
            <input
              type="number"
              min={1}
              max={6}
              value={shiftForm.appointmentCapacity}
              onChange={(e) =>
                onShiftFieldChange("appointmentCapacity", e.target.value)
              }
              className="denty-field text-sm md:col-span-2"
              placeholder={t("admin.plan.shift_capacity_placeholder")}
            />
            <button
              type="button"
              onClick={onSaveShift}
              className={`${primaryAction} md:col-span-2`}
            >
              {editingShiftId
                ? t("admin.plan.save_shift_changes")
                : t("admin.plan.save_shift")}
            </button>
          </div>
        ) : null}

        {showSemesterForm ? (
          <div className="mt-5 grid gap-3 rounded-[20px] border border-white/12 bg-white/34 p-4 md:grid-cols-2">
            <div className="flex items-center justify-between gap-3 md:col-span-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[rgba(10,22,40,0.62)]">
                {editingSemesterId
                  ? t("admin.plan.edit_semester")
                  : t("admin.plan.new_semester")}
              </p>
              {editingSemesterId ? (
                <button
                  type="button"
                  onClick={onResetSemesterForm}
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgba(10,22,40,0.56)]"
                >
                  {t("admin.common.cancel")}
                </button>
              ) : null}
            </div>
            <input
              value={semesterForm.label}
              onChange={(e) => onSemesterFieldChange("label", e.target.value)}
              className="denty-field text-sm md:col-span-2"
              placeholder={t("admin.plan.semester_label_placeholder")}
            />
            <input
              type="number"
              value={semesterForm.sortOrder}
              onChange={(e) => onSemesterFieldChange("sortOrder", e.target.value)}
              className="denty-field text-sm"
              placeholder={t("admin.plan.sort_order_placeholder")}
            />
            <input
              type="date"
              value={semesterForm.endsOn}
              onChange={(e) => onSemesterFieldChange("endsOn", e.target.value)}
              className="denty-field text-sm"
            />
            <button
              type="button"
              onClick={onSaveSemester}
              className={`${primaryAction} md:col-span-2`}
            >
              {editingSemesterId
                ? t("admin.plan.save_semester_changes")
                : t("admin.plan.save_semester")}
            </button>
          </div>
        ) : null}

        {showClinicCaseForm ? (
          <div
            id="planning-clinic-case-form"
            className="mt-5 grid gap-3 rounded-[20px] border border-white/12 bg-white/34 p-4 md:grid-cols-2"
          >
            <div className="flex items-center justify-between gap-3 md:col-span-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[rgba(10,22,40,0.62)]">
                {editingClinicCaseId
                  ? t("admin.plan.edit_clinic_case")
                  : t("admin.plan.new_clinic_case")}
              </p>
              {editingClinicCaseId ? (
                <button
                  type="button"
                  onClick={onResetClinicCaseForm}
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgba(10,22,40,0.56)]"
                >
                  {t("admin.common.cancel")}
                </button>
              ) : null}
            </div>
            <select
              value={clinicCaseForm.semesterId}
              onChange={(e) => onClinicCaseFieldChange("semesterId", e.target.value)}
              className="denty-field cursor-pointer text-sm"
            >
              <option value="">{t("admin.plan.choose_semester")}</option>
              {sortedSemesters.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  {semester.label}
                </option>
              ))}
            </select>
            <select
              value={clinicCaseForm.clinicId}
              onChange={(e) => onClinicCaseFieldChange("clinicId", e.target.value)}
              className="denty-field cursor-pointer text-sm"
            >
              <option value="">{t("admin.plan.choose_clinic")}</option>
              {sortedClinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>
            <input
              value={clinicCaseForm.title}
              onChange={(e) => onClinicCaseFieldChange("title", e.target.value)}
              className="denty-field text-sm md:col-span-2"
              placeholder={t("admin.plan.case_title_placeholder")}
            />
            <textarea
              value={clinicCaseForm.description}
              onChange={(e) =>
                onClinicCaseFieldChange("description", e.target.value)
              }
              className="denty-field min-h-[100px] text-sm md:col-span-2"
              placeholder={t("admin.plan.case_note_placeholder")}
            />
            <input
              type="number"
              min={1}
              value={clinicCaseForm.requiredCount}
              onChange={(e) =>
                onClinicCaseFieldChange("requiredCount", e.target.value)
              }
              className="denty-field text-sm md:col-span-2"
              placeholder={t("admin.plan.required_count_placeholder")}
            />
            <button
              type="button"
              onClick={onSaveClinicCase}
              className={`${primaryAction} md:col-span-2`}
            >
              {editingClinicCaseId
                ? t("admin.plan.save_case_changes")
                : t("admin.plan.save_clinic_case")}
            </button>
          </div>
        ) : null}

        <div className="mt-5 rounded-[22px] border border-white/12 bg-[linear-gradient(180deg,rgba(8,18,34,0.84),rgba(12,30,51,0.64))] p-5 text-white shadow-[0_24px_48px_rgba(6,17,34,0.22)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/58">
                {t("admin.plan.progression_desk")}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-white">
                {t("admin.plan.semester_progression")}
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/70">
                {t("admin.plan.progression_intro")}
              </p>
            </div>
            <button
              type="button"
              onClick={onAdvanceSemesterCohorts}
              disabled={progressingSemesters}
              className={`${primaryAction} whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {progressingSemesters
                ? t("admin.plan.advancing")
                : t("admin.plan.advance_eligible")}
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {semesterProgression?.dueStudents.length ? (
              semesterProgression.dueStudents.map((student) => (
                <div
                  key={student.id}
                  className="rounded-[22px] border border-white/10 bg-white/8 p-4 backdrop-blur-[12px]"
                >
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {student.name}
                      </p>
                      <p className="mt-1 text-sm text-white/64">
                        @{student.username}
                        {student.doctorIdNumber
                          ? t("admin.plan.student_id_inline", {
                              value: student.doctorIdNumber,
                            })
                          : ""}
                      </p>
                      <p className="mt-3 text-sm text-white/74">
                        {student.currentSemester.label} {"->"}{" "}
                        {student.nextSemester?.label ||
                          t("admin.plan.no_next_semester")}
                      </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                      <select
                        value={semesterSelections[student.id] || ""}
                        onChange={(e) =>
                          setSemesterSelections((prev) => ({
                            ...prev,
                            [student.id]: e.target.value,
                          }))
                        }
                        className="denty-field cursor-pointer bg-white/90 text-sm text-[var(--foreground)]"
                      >
                        <option value="">
                          {t("admin.plan.clear_semester")}
                        </option>
                        {semesterOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          onReassignStudentSemester(
                            student.id,
                            semesterSelections[student.id] || null,
                          )
                        }
                        disabled={studentSemesterSubmittingId === student.id}
                        className={`${smallSecondary} whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {studentSemesterSubmittingId === student.id
                          ? t("admin.common.saving")
                          : t("admin.common.save")}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[22px] border border-dashed border-white/18 bg-white/6 p-4">
                <p className="text-sm leading-7 text-white/72">
                  {t("admin.plan.no_due_students")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={panelClass}>
        <div className="grid gap-5 xl:grid-cols-2">
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="denty-kicker">{t("admin.plan.clinics")}</p>
              <span className="denty-pill">
                {t("admin.plan.saved_count", { count: sortedClinics.length })}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {sortedClinics.map((clinic) => (
                <div
                  key={clinic.id}
                  className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.42),rgba(229,237,243,0.16))] p-4 shadow-[0_18px_42px_rgba(7,18,34,0.08)] backdrop-blur-[18px]"
                >
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
                    <div>
                      <p className="text-lg font-semibold text-[var(--foreground)]">
                        {clinic.name}
                      </p>
                      {clinic.description ? (
                        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                          {clinic.description}
                        </p>
                      ) : null}
                      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[rgba(10,22,40,0.52)]">
                        {t("admin.plan.clinic_tasks_count", {
                          count: clinic.tasks.length,
                        })}
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEditClinic(clinic)}
                        className={smallSecondary}
                      >
                        {t("admin.common.edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteClinic(clinic)}
                        className={smallDanger}
                      >
                        {t("admin.common.delete")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="denty-kicker">{t("admin.plan.shifts")}</p>
              <span className="denty-pill">
                {t("admin.plan.saved_count", { count: sortedShifts.length })}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {sortedShifts.map((shift) => (
                <div
                  key={shift.id}
                  className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.42),rgba(229,237,243,0.16))] p-4 shadow-[0_18px_42px_rgba(7,18,34,0.08)] backdrop-blur-[18px]"
                >
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
                    <div>
                      <p className="text-lg font-semibold text-[var(--foreground)]">
                        {shift.name}
                      </p>
                      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                        {shift.startsAt} - {shift.endsAt}
                      </p>
                      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[rgba(10,22,40,0.52)]">
                        {t("admin.plan.appointment_slots", {
                          count: shift.appointmentCapacity,
                        })}
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEditShift(shift)}
                        className={smallSecondary}
                      >
                        {t("admin.common.edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteShift(shift)}
                        className={smallDanger}
                      >
                        {t("admin.common.delete")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="denty-kicker">{t("admin.plan.semesters_catalog")}</p>
              <span className="denty-pill">
                {t("admin.plan.semesters_count", {
                  count: sortedSemesters.length,
                })}
              </span>
            </div>

            <div className="mt-4 max-h-[50rem] space-y-4 overflow-y-auto pr-1">
              {sortedSemesters.map((semester) => (
                <div
                  key={semester.id}
                  className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.42),rgba(229,237,243,0.16))] p-4 shadow-[0_18px_42px_rgba(7,18,34,0.08)] backdrop-blur-[18px]"
                >
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
                    <div>
                      <p className="text-lg font-semibold text-[var(--foreground)]">
                        {semester.label}
                      </p>
                      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                        {t("admin.plan.sort_value", {
                          value: semester.sortOrder,
                        })}
                        {semester.endsOn
                          ? t("admin.plan.ends_value", {
                              date: new Date(
                                semester.endsOn,
                              ).toLocaleDateString(),
                            })
                          : t("admin.plan.no_end_date")}
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEditSemester(semester)}
                        className={smallSecondary}
                      >
                        {t("admin.common.edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteSemester(semester)}
                        className={smallDanger}
                      >
                        {t("admin.common.delete")}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {semester.clinicCases.length === 0 ? (
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {t("admin.plan.no_cases")}
                      </p>
                    ) : null}
                    {semester.clinicCases.map((clinicCase) => (
                      <div
                        key={clinicCase.id}
                        className="rounded-[20px] border border-white/12 bg-white/28 px-4 py-3"
                      >
                        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
                          <div>
                            <p className="font-semibold text-[var(--foreground)]">
                              {clinicCase.title}
                            </p>
                            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                              {t("admin.plan.case_required", {
                                clinic: clinicCase.clinic.name,
                                count: clinicCase.requiredCount,
                              })}
                            </p>
                            {clinicCase.description ? (
                              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                                {clinicCase.description}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => onEditClinicCase(clinicCase, semester)}
                              className={smallSecondary}
                            >
                              {t("admin.common.edit")}
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteClinicCase(clinicCase)}
                              className={smallDanger}
                            >
                              {t("admin.common.delete")}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
