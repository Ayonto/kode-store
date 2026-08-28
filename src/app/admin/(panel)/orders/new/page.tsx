import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/ui";
import {
  ManualOrderForm,
  type OrderProduct,
} from "@/components/admin/ManualOrderForm";

export const metadata = { title: "New order · Admin" };

export default async function NewOrderPage() {
  const [products, settings] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    getSettings(),
  ]);

  const items: OrderProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    discountPercent: p.discountPercent,
    freeDelivery: p.freeDelivery,
    sizes: Array.isArray(p.sizes) ? (p.sizes as string[]) : [],
  }));

  return (
    <>
      <Link
        href="/admin/orders"
        className="mb-4 inline-block text-sm text-ink-soft hover:text-ink cursor-pointer"
      >
        ← Back to orders
      </Link>
      <PageHeader
        title="New order"
        subtitle="Log an order taken over Instagram, Facebook or the phone."
      />
      <ManualOrderForm products={items} settings={settings} />
    </>
  );
}
