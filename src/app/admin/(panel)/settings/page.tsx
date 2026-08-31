import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHeader
        title="Delivery Settings"
        subtitle="Delivery charges and free-delivery rules."
      />
      <SettingsForm settings={settings} />
    </>
  );
}
