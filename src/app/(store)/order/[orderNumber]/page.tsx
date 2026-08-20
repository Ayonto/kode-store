import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatTaka } from "@/lib/format";
import { CheckIcon, TruckIcon } from "@/components/ui/icons";

export const metadata = { title: "Order Confirmed" };

const ZONE_LABEL: Record<string, string> = {
  inside_dhaka: "Inside Dhaka",
  outside_dhaka: "Outside Dhaka",
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="text-center" data-reveal>
        <div className="mx-auto flex h-16 w-16 animate-scale-in items-center justify-center rounded-full bg-success/12 text-success">
          <CheckIcon className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-4xl">Order confirmed</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Thank you, {order.customerName.split(" ")[0]}! We&apos;ve received your
          order and will call to confirm shortly.
        </p>
        <p className="mt-4 inline-block rounded-full bg-sand px-4 py-2 text-sm font-medium">
          Order #{order.orderNumber}
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-line bg-paper p-6">
        <div className="flex items-center gap-3 rounded-xl bg-sand px-4 py-3">
          <TruckIcon className="h-5 w-5 text-gold-deep" />
          <p className="text-sm text-ink-soft">
            <span className="font-medium text-ink">Cash on Delivery</span> — pay{" "}
            {formatTaka(order.total)} when your order arrives.
          </p>
        </div>

        <ul className="mt-5 space-y-3">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3 text-sm">
              <span className="text-ink">
                {i.productName}
                {i.size ? ` · ${i.size}` : ""}{" "}
                <span className="text-ink-mute">× {i.quantity}</span>
              </span>
              <span className="font-medium">{formatTaka(i.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 space-y-2 border-t border-line pt-5 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-soft">Subtotal</span>
            <span>{formatTaka(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">
              Delivery · {ZONE_LABEL[order.deliveryZone] ?? order.deliveryZone}
            </span>
            <span>
              {order.deliveryCharge === 0
                ? "Free"
                : formatTaka(order.deliveryCharge)}
            </span>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
            <span>Total</span>
            <span>{formatTaka(order.total)}</span>
          </div>
        </div>

        <div className="mt-6 border-t border-line pt-5 text-sm text-ink-soft">
          <p className="font-medium text-ink">Delivering to</p>
          <p className="mt-1">{order.customerName} · {order.phone}</p>
          <p>{order.address}</p>
          {order.city && <p>{order.city}</p>}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/shop"
          className="inline-block rounded-full bg-ink px-7 py-4 text-sm font-medium text-cream hover:bg-ink/90 cursor-pointer"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
