import { PageHeader, Card } from "@/components/admin/ui";

export default function AdminWelcome() {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Welcome to the KODE admin panel." />
      <Card>
        <p className="text-sm text-ink-soft">
          From here your business management begins! Welcome! 🗿
        </p>
      </Card>
    </>
  );
}
