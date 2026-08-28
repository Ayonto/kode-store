import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatTaka } from "@/lib/format";
import { PageHeader, Card, SourceBadge } from "@/components/admin/ui";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { OrderVerifiedToggle } from "@/components/admin/OrderVerifiedToggle";
import type { OrderStatus } from "@/lib/types";

const ZONE: Record<string, string> = {
  inside_dhaka: "Inside Dhaka",
  outside_dhaka: "Outside Dhaka",
};

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <>
      <Link
        href="/admin/orders"
        className="mb-4 inline-block text-sm text-ink-soft hover:text-ink cursor-pointer"
      >
        ← Back to orders
      </Link>
      <PageHeader
        title={order.orderNumber}
        subtitle={`Placed ${order.createdAt.toLocaleString("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
        })}`}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <OrderVerifiedToggle
              orderId={order.id}
              initial={order.verified}
              size="md"
            />
            <OrderStatusControl
              orderId={order.id}
              current={order.status as OrderStatus}
            />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="font-display text-2xl">Items</h2>
          <div className="mt-4 divide-y divide-line">
            {order.items.map((i) => (
              <div
                key={i.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-ink">{i.productName}</p>
                  <p className="text-xs text-ink-mute">
                    {i.size ? `Size ${i.size} · ` : ""}
                    {formatTaka(i.unitPrice)} × {i.quantity}
                  </p>
                </div>
                <span className="font-medium">{formatTaka(i.lineTotal)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <Row label="Subtotal" value={formatTaka(order.subtotal)} />
            <Row
              label={`Delivery · ${ZONE[order.deliveryZone] ?? order.deliveryZone}`}
              value={
                order.deliveryCharge === 0
                  ? "Free"
                  : formatTaka(order.deliveryCharge)
              }
            />
            <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
              <span>Total (Cash on Delivery)</span>
              <span>{formatTaka(order.total)}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-2xl">Delivery details</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Detail label="Channel" value={<SourceBadge source={order.source} />} />
            <Detail label="Customer" value={order.customerName} />
            <Detail
              label="Phone"
              value={
                <a
                  href={`tel:${order.phone}`}
                  className="text-gold-deep hover:underline"
                >
                  {order.phone}
                </a>
              }
            />
            <Detail label="Address" value={order.address} />
            {order.city && <Detail label="City / District" value={order.city} />}
            <Detail
              label="Delivery area"
              value={ZONE[order.deliveryZone] ?? order.deliveryZone}
            />
            {order.notes && <Detail label="Notes" value={order.notes} />}
          </dl>
        </Card>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-soft">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-mute">{label}</dt>
      <dd className="mt-0.5 text-ink">{value}</dd>
    </div>
  );
}
