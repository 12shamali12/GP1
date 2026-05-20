"use client";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { useTranslation } from "@/features/i18n/language-provider";
import { useAdminDoctorRequestsWorkspace } from "./hooks/use-admin-doctor-requests-workspace";
import { DoctorAccountsLane } from "./ui/doctor-accounts-lane";
import { DoctorRequestLane } from "./ui/doctor-request-lane";

export default function AdminDoctorRequestsPage() {
  const t = useTranslation();
  const {
    error,
    loading,
    requestQuery,
    setRequestQuery,
    doctorQuery,
    setDoctorQuery,
    filteredRequests,
    filteredDoctors,
    requestSections,
    doctorSections,
    decide,
    toggleBlock,
    reapproveDoctor,
  } = useAdminDoctorRequestsWorkspace();

  return (
    <AdminShell
      title={t("admin.doc_req.title")}
      description={t("admin.doc_req.description")}
    >
      <div className="grid gap-5 xl:grid-cols-2">
        <DoctorRequestLane
          error={error}
          loading={loading}
          requestQuery={requestQuery}
          filteredCount={filteredRequests.length}
          sections={requestSections}
          onRequestQueryChange={setRequestQuery}
          onDecide={decide}
        />

        <DoctorAccountsLane
          doctorQuery={doctorQuery}
          filteredCount={filteredDoctors.length}
          sections={doctorSections}
          onDoctorQueryChange={setDoctorQuery}
          onReapproveDoctor={reapproveDoctor}
          onToggleBlock={toggleBlock}
        />
      </div>
    </AdminShell>
  );
}
