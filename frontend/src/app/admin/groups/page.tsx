"use client";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { useTranslation } from "@/features/i18n/language-provider";
import { useFeedbackToast } from "@/features/ui/hooks/use-feedback-toast";
import { useAdminGroupsWorkspace } from "./hooks/use-admin-groups-workspace";
import { GroupCreatePanel } from "./ui/group-create-panel";
import { GroupDeleteDialog } from "./ui/group-delete-dialog";
import { GroupDetailModal } from "./ui/group-detail-modal";
import { GroupDirectoryPanel } from "./ui/group-directory-panel";

export default function AdminGroupsPage() {
  const t = useTranslation();
  const {
    loading,
    error,
    setError,
    message,
    setMessage,
    query,
    setQuery,
    setSelectedGroupId,
    groupForm,
    setGroupForm,
    groupEditor,
    setGroupEditor,
    doctors,
    filteredGroups,
    selectedGroup,
    doctorSelections,
    setDoctorSelections,
    deleteDialog,
    setDeleteDialog,
    deleteSubmitting,
    createGroup,
    saveGroupChanges,
    addDoctorToGroup,
    confirmDeleteGroup,
  } = useAdminGroupsWorkspace();

  useFeedbackToast({
    message,
    error,
    clearMessage: () => setMessage(null),
    clearError: () => setError(null),
    messageTitle: t("admin.groups.toast_updated"),
    errorTitle: t("admin.groups.toast_issue"),
  });

  return (
    <AdminShell
      title={t("admin.groups.title")}
      description={t("admin.groups.description")}
    >
      <div className="grid gap-5 xl:grid-cols-[0.74fr_1.26fr]">
        <GroupCreatePanel
          groupForm={groupForm}
          onFieldChange={(field, value) =>
            setGroupForm((prev) => ({ ...prev, [field]: value }))
          }
          onCreate={createGroup}
        />

        <GroupDirectoryPanel
          loading={loading}
          query={query}
          filteredGroups={filteredGroups}
          onQueryChange={setQuery}
          onSelectGroup={setSelectedGroupId}
        />
      </div>

      <GroupDetailModal
        selectedGroup={selectedGroup}
        groupEditor={groupEditor}
        doctors={doctors}
        doctorSelections={doctorSelections}
        onClose={() => setSelectedGroupId(null)}
        onDelete={({ id, label }) => setDeleteDialog({ id, label })}
        onGroupEditorChange={(field, value) =>
          setGroupEditor((prev) => ({ ...prev, [field]: value }))
        }
        onDoctorSelectionChange={(groupId, doctorId) =>
          setDoctorSelections((prev) => ({ ...prev, [groupId]: doctorId }))
        }
        onSaveGroupChanges={saveGroupChanges}
        onAddDoctorToGroup={addDoctorToGroup}
      />

      <GroupDeleteDialog
        deleteDialog={deleteDialog}
        deleteSubmitting={deleteSubmitting}
        onClose={() => !deleteSubmitting && setDeleteDialog(null)}
        onConfirm={confirmDeleteGroup}
      />
    </AdminShell>
  );
}
