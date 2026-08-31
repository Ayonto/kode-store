import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatTaka } from "@/lib/format";
import {
  PageHeader,
  Card,
  StatusBadge,
  SourceBadge,
  PrimaryLink,
} from "@/components/admin/ui";
import { OrderVerifiedToggle } from "@/components/admin/OrderVerifiedToggle";
import type { OrderStatus } from "@/lib/types";

const ZONE: Record<string, string> = {
  inside_dhaka: "Inside Dhaka",
  outside_dhaka: "Outside Dhaka",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  const unverified = orders.filter((o) => !o.verified).length;

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle={
          `${orders.length} order${orders.length === 1 ? "" : "s"} total` +
          (unverified ? ` · ${unverified} to verify` : "")
        }
        action={<PrimaryLink href="/admin/orders/new">+ New order</PrimaryLink>}
      />

      {orders.length === 0 ? (
        <Card>
          <p className="py-12 text-center text-sm text-ink-mute">
            No orders yet. Website checkouts appear here automatically — use
            <span className="font-medium text-ink"> + New order </span>
            to log Instagram, Facebook or phone orders.
          </p>
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-mute">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Channel</th>
                <th className="px-5 py-3">Zone</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Verified</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-line last:border-0 transition-colors hover:bg-sand/50"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-medium text-ink hover:text-gold-deep cursor-pointer"
                    >
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-ink-soft">
                    <div>{o.customerName}</div>
                    <div className="text-xs text-ink-mute">{o.phone}</div>
                  </td>
                  <td className="px-5 py-3">
                    <SourceBadge source={o.source} />
                  </td>
                  <td className="px-5 py-3 text-ink-soft">
                    {ZONE[o.deliveryZone] ?? o.deliveryZone}
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{o._count.items}</td>
                  <td className="px-5 py-3 font-medium tabular-nums">
                    {formatTaka(o.total)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={o.status as OrderStatus} />
                  </td>
                  <td className="px-5 py-3">
                    <OrderVerifiedToggle orderId={o.id} initial={o.verified} />
                  </td>
                  <td className="px-5 py-3 text-ink-mute">
                    {o.createdAt.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
