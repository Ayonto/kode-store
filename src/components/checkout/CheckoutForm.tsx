"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart/CartContext";
import { deliveryCharge } from "@/lib/pricing";
import { formatTaka } from "@/lib/format";
import { Spinner, TruckIcon } from "@/components/ui/icons";
import type { DeliveryZone, StoreSettings } from "@/lib/types";

export function CheckoutForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const { items, subtotal, ready, clear } = useCart();

  const [zone, setZone] = useState<DeliveryZone>("inside_dhaka");
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { charge, isFree } = deliveryCharge(items, zone, settings);
  const total = subtotal + charge;

  function update(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          deliveryZone: zone,
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }
      clear();
      router.push(`/order/${data.orderNumber}`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  if (ready && items.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-dashed border-line bg-paper py-20 text-center">
        <p className="font-display text-2xl">Your bag is empty</p>
        <p className="mt-2 text-sm text-ink-soft">
          Add something you love before checking out.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream hover:bg-ink/90 cursor-pointer"
        >
          Browse the collection
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
      {/* details */}
      <div className="space-y-8">
        <section>
          <h2 className="font-display text-2xl">Delivery details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required>
              <input
                value={form.customerName}
                onChange={(e) => update("customerName", e.target.value)}
                required
                autoComplete="name"
                className="kode-input"
                placeholder="e.g. Tanvir Ahmed"
              />
            </Field>
            <Field label="Mobile number" required>
              <input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                required
                inputMode="numeric"
                autoComplete="tel"
                className="kode-input"
                placeholder="01XXXXXXXXX"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Full address" required>
                <textarea
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  required
                  rows={3}
                  className="kode-input resize-none"
                  placeholder="House, road, area, landmark…"
                />
              </Field>
            </div>
            <Field label="City / District">
              <input
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className="kode-input"
                placeholder="e.g. Dhaka"
              />
            </Field>
            <Field label="Order notes (optional)">
              <input
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                className="kode-input"
                placeholder="Anything we should know?"
              />
            </Field>
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl">Delivery area</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ZoneOption
              active={zone === "inside_dhaka"}
              onClick={() => setZone("inside_dhaka")}
              title="Inside Dhaka"
              price={formatTaka(settings.deliveryInsideDhaka)}
            />
            <ZoneOption
              active={zone === "outside_dhaka"}
              onClick={() => setZone("outside_dhaka")}
              title="Outside Dhaka"
              price={formatTaka(settings.deliveryOutsideDhaka)}
            />
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl">Payment</h2>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-ink bg-paper px-5 py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-cream">
              <TruckIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">Cash on Delivery</p>
              <p className="text-xs text-ink-soft">
                Pay in cash when your order is delivered. No advance payment.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* summary */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-line bg-paper p-6">
          <h2 className="font-display text-2xl">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {items.map((i) => (
              <li
                key={`${i.productId}-${i.size ?? "_"}`}
                className="flex gap-3"
              >
                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-sand">
                  {i.image && (
                    <Image
                      src={i.image}
                      alt={i.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-cream">
                    {i.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{i.name}</p>
                  {i.size && (
                    <p className="text-xs text-ink-mute">Size {i.size}</p>
                  )}
                </div>
                <span className="text-sm font-medium">
                  {formatTaka(i.unitPrice * i.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 space-y-2 border-t border-line pt-5 text-sm">
            <Row label="Subtotal" value={formatTaka(subtotal)} />
            <Row
              label="Delivery"
              value={isFree ? "Free" : formatTaka(charge)}
              accent={isFree}
            />
            <div className="flex items-center justify-between border-t border-line pt-3 text-base font-semibold">
              <span>Total</span>
              <span>{formatTaka(total)}</span>
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-sm font-medium text-cream transition-colors hover:bg-ink/90 disabled:opacity-70 cursor-pointer"
          >
            {submitting ? (
              <>
                <Spinner className="h-5 w-5" /> Placing order…
              </>
            ) : (
              <>Place order · {formatTaka(total)}</>
            )}
          </button>
          <p className="mt-3 text-center text-xs text-ink-mute">
            By placing this order you agree to pay {formatTaka(total)} in cash on
            delivery.
          </p>
        </div>
      </aside>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      {children}
    </label>
  );
}

function ZoneOption({
  active,
  onClick,
  title,
  price,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  price: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all cursor-pointer ${
        active
          ? "border-ink bg-sand"
          : "border-line bg-paper hover:border-ink"
      }`}
    >
      <span className="flex items-center gap-3">
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
            active ? "border-ink" : "border-ink-mute"
          }`}
        >
          {active && <span className="h-2.5 w-2.5 rounded-full bg-ink" />}
        </span>
        <span className="text-sm font-medium">{title}</span>
      </span>
      <span className="text-sm font-semibold">{price}</span>
    </button>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-soft">{label}</span>
      <span className={accent ? "font-medium text-success" : "text-ink"}>
        {value}
      </span>
    </div>
  );
}
