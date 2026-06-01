"use client";

import { useRouter } from "next/navigation";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { SettingsPanel } from "@/features/settings/components/settings-panel";
import { useTranslation } from "@/features/i18n/language-provider";

/**
 * Admin → Settings page. Mounts the shared SettingsPanel in "admin" mode so
 * the language toggle, theme picker and notification preferences land
 * inside the admin shell exactly like they do on the patient, doctor and
 * supervisor dashboards.
 */
export default function AdminSettingsPage() {
  const t = useTranslation();
  const router = useRouter();
  return (
    <AdminShell
      title={t("admin.settings.title")}
      description={t("admin.settings.description")}
    >
      <SettingsPanel
        role="admin"
        onEditProfile={() => router.push("/admin")}
      />
    </AdminShell>
  );
}
