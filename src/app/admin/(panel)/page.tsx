import { PageHeader, Card } from "@/components/admin/ui";

export default function AdminWelcome() {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Welcome to the KODE admin panel." />
      <Card>
        <p className="text-sm text-ink-soft">
          Use the sidebar to manage your store. Live business metrics will land
          here once the operations module ships in Sprint 4.
        </p>
      </Card>
    </>
  );
}
