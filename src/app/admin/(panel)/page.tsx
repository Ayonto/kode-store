import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatTaka } from "@/lib/format";
import { PageHeader, Card, StatusBadge } from "@/components/admin/ui";
import type { OrderStatus } from "@/lib/types";

export default async function AdminDashboard() {
  const [
    totalOrders,
    pendingOrders,
    deliveredAgg,
    expenseAgg,
    productCount,
    recent,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.product.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { _count: { select: { items: true } } },
    }),
  ]);

  const revenue = deliveredAgg._sum.total ?? 0;
  const expenses = expenseAgg._sum.amount ?? 0;
  const net = revenue - expenses;

  const stats: { label: string; value: string; tone?: string }[] = [
    { label: "Total orders", value: totalOrders.toString() },
    { label: "Pending", value: pendingOrders.toString() },
    { label: "Revenue (excl. cancelled)", value: formatTaka(revenue) },
    { label: "Expenses", value: formatTaka(expenses) },
    {
      label: "Net profit",
      value: formatTaka(net),
      tone: net >= 0 ? "text-success" : "text-danger",
    },
    { label: "Products", value: productCount.toString() },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="An overview of your KODE store."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-xs uppercase tracking-luxe text-ink-mute">
              {s.label}
            </p>
            <p
              className={`mt-2 text-3xl font-semibold tabular-nums ${
                s.tone ?? "text-ink"
              }`}
            >
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-gold-deep hover:text-ink cursor-pointer"
            >
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-mute">
              No orders yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-ink-mute">
                    <th className="pb-2">Order</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2">Total</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o) => (
                    <tr
                      key={o.id}
                      className="border-t border-line"
                    >
                      <td className="py-3">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-medium text-ink hover:text-gold-deep cursor-pointer"
                        >
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 text-ink-soft">{o.customerName}</td>
                      <td className="py-3 font-medium">
                        {formatTaka(o.total)}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={o.status as OrderStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
