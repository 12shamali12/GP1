"use client";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { useTranslation } from "@/features/i18n/language-provider";
import { useFeedbackToast } from "@/features/ui/hooks/use-feedback-toast";
import { useAdminNotificationsWorkspace } from "./hooks/use-admin-notifications-workspace";
import { NotificationsFilterPanel } from "./ui/notifications-filter-panel";
import { NotificationsStream } from "./ui/notifications-stream";

export default function AdminNotificationsPage() {
  const t = useTranslation();
  const {
    items,
    loading,
    error,
    setError,
    message,
    setMessage,
    filter,
    setFilter,
    unreadCount,
    filteredItems,
    updateItem,
    markAllRead,
    removeAll,
  } = useAdminNotificationsWorkspace();

  useFeedbackToast({
    message,
    error,
    clearMessage: () => setMessage(null),
    clearError: () => setError(null),
    messageTitle: t("admin.notif.toast_updated"),
    errorTitle: t("admin.notif.toast_issue"),
  });

  return (
    <AdminShell
      title={t("admin.notif.title")}
      description={t("admin.notif.description")}
    >
      <NotificationsFilterPanel
        itemsCount={items.length}
        unreadCount={unreadCount}
        filter={filter}
        onFilterChange={setFilter}
        onMarkAllRead={markAllRead}
        onRemoveAll={removeAll}
      />

      <NotificationsStream
        loading={loading}
        filteredItems={filteredItems}
        onUpdateItem={updateItem}
      />
    </AdminShell>
  );
}
