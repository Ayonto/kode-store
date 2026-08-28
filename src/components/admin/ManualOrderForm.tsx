"use client";

import { useMemo, useState, useTransition } from "react";
import { createManualOrder } from "@/app/admin/actions";
import { discountedPrice, formatTaka } from "@/lib/format";
import { deliveryCharge } from "@/lib/pricing";
import {
  ORDER_SOURCES,
  type OrderSource,
  type DeliveryZone,
  type CartItem,
  type StoreSettings,
} from "@/lib/types";
import { Spinner, PlusIcon, TrashIcon } from "@/components/ui/icons";

export type OrderProduct = {
  id: number;
  name: string;
  price: number;
  discountPercent: number;
  freeDelivery: boolean;
  sizes: string[];
};

type Line = { key: number; productId: number; size: string; quantity: number };

const SOURCE_LABELS: Record<OrderSource, string> = {
  WEBSITE: "Website",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  PHONE: "Phone",
  OTHER: "Other",
};

let nextKey = 1;

export function ManualOrderForm({
  products,
  settings,
}: {
  products: OrderProduct[];
  settings: StoreSettings;
}) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zone, setZone] = useState<DeliveryZone>("inside_dhaka");
  const [notes, setNotes] = useState("");
  const [source, setSource] = useState<OrderSource>("INSTAGRAM");
  const [verified, setVerified] = useState(true);
  const [lines, setLines] = useState<Line[]>([
    { key: nextKey++, productId: 0, size: "", quantity: 1 },
  ]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  );

  function updateLine(key: number, patch: Partial<Line>) {
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }
  function addLine() {
    setLines((ls) => [
      ...ls,
      { key: nextKey++, productId: 0, size: "", quantity: 1 },
    ]);
  }
  function removeLine(key: number) {
    setLines((ls) => (ls.length === 1 ? ls : ls.filter((l) => l.key !== key)));
  }

  // live totals (server recomputes authoritatively on submit)
  const { cartItems, subtotal } = useMemo(() => {
    const cart: CartItem[] = [];
    let sub = 0;
    for (const l of lines) {
      const p = productMap.get(l.productId);
      if (!p) continue;
      const unit = discountedPrice(p.price, p.discountPercent);
      const qty = Math.max(1, l.quantity || 1);
      sub += unit * qty;
      cart.push({
        productId: p.id,
        slug: "",
        name: p.name,
        image: null,
        size: l.size || null,
        unitPrice: unit,
        quantity: qty,
        freeDelivery: p.freeDelivery,
      });
    }
    return { cartItems: cart, subtotal: sub };
  }, [lines, productMap]);

  const delivery = deliveryCharge(cartItems, zone, settings).charge;
  const total = subtotal + delivery;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const items = lines
      .filter((l) => l.productId > 0 && l.quantity > 0)
      .map((l) => ({
        productId: l.productId,
        size: l.size || null,
        quantity: l.quantity,
      }));
    if (items.length === 0)
      return setError("Add at least one product to the order.");
    if (customerName.trim().length < 2)
      return setError("Enter the customer's name.");
    if (phone.trim().length < 6)
      return setError("Enter a contact phone number.");
    if (address.trim().length < 4)
      return setError("Enter a delivery address.");

    startTransition(async () => {
      try {
        await createManualOrder({
          customerName,
          phone,
          address,
          city,
          deliveryZone: zone,
          notes,
          source,
          verified,
          items,
        });
        // on success the action redirects to the new order
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not create the order."
        );
      }
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
      {/* left column */}
      <div className="space-y-6 lg:col-span-2">
        {/* channel */}
        <div className="rounded-2xl border border-line bg-paper p-6">
          <h2 className="font-display text-2xl">Channel</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">
                Order came from
              </span>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as OrderSource)}
                className="kode-input"
              >
                {ORDER_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {SOURCE_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-3 sm:pt-7">
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
                className="h-5 w-5 rounded border-line accent-ink cursor-pointer"
              />
              <span className="text-sm font-medium">
                Already verified with customer
              </span>
            </label>
          </div>
        </div>

        {/* products */}
        <div className="rounded-2xl border border-line bg-paper p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Products</h2>
            <button
              type="button"
              onClick={addLine}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-medium hover:border-ink cursor-pointer"
            >
              <PlusIcon className="h-4 w-4" /> Add product
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {lines.map((l) => {
              const p = productMap.get(l.productId);
              const unit = p ? discountedPrice(p.price, p.discountPercent) : 0;
              return (
                <div key={l.key} className="grid grid-cols-12 items-end gap-2">
                  <label className="col-span-5">
                    <span className="mb-1 block text-xs text-ink-mute">
                      Product
                    </span>
                    <select
                      value={l.productId}
                      onChange={(e) =>
                        updateLine(l.key, {
                          productId: Number(e.target.value),
                          size: "",
                        })
                      }
                      className="kode-input !py-2 text-sm"
                    >
                      <option value={0}>Select…</option>
                      {products.map((pr) => (
                        <option key={pr.id} value={pr.id}>
                          {pr.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="col-span-3">
                    <span className="mb-1 block text-xs text-ink-mute">Size</span>
                    <select
                      value={l.size}
                      onChange={(e) => updateLine(l.key, { size: e.target.value })}
                      disabled={!p || p.sizes.length === 0}
                      className="kode-input !py-2 text-sm disabled:opacity-50"
                    >
                      <option value="">
                        {p && p.sizes.length ? "—" : "N/A"}
                      </option>
                      {p?.sizes.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="col-span-2">
                    <span className="mb-1 block text-xs text-ink-mute">Qty</span>
                    <input
                      inputMode="numeric"
                      value={l.quantity}
                      onChange={(e) =>
                        updateLine(l.key, {
                          quantity: Math.max(
                            1,
                            Number(e.target.value.replace(/[^\d]/g, "")) || 1
                          ),
                        })
                      }
                      className="kode-input !py-2 text-sm"
                    />
                  </label>
                  <div className="col-span-2 flex items-center justify-between gap-1 pb-2">
                    <span className="text-sm font-medium tabular-nums">
                      {formatTaka(unit * Math.max(1, l.quantity || 1))}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLine(l.key)}
                      disabled={lines.length === 1}
                      aria-label="Remove product"
                      className="text-ink-mute hover:text-danger disabled:opacity-30 cursor-pointer"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* customer */}
        <div className="rounded-2xl border border-line bg-paper p-6">
          <h2 className="font-display text-2xl">Customer &amp; delivery</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Name</span>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="kode-input"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Phone</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="kode-input"
                placeholder="01XXXXXXXXX"
              />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium">Address</span>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="kode-input"
            />
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">
                City / District (optional)
              </span>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="kode-input"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">
                Delivery area
              </span>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value as DeliveryZone)}
                className="kode-input"
              >
                <option value="inside_dhaka">Inside Dhaka</option>
                <option value="outside_dhaka">Outside Dhaka</option>
              </select>
            </label>
          </div>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium">
              Notes (optional)
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="kode-input"
            />
          </label>
        </div>
      </div>

      {/* right column: summary */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 rounded-2xl border border-line bg-paper p-6">
          <h2 className="font-display text-2xl">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Subtotal</dt>
              <dd className="tabular-nums">{formatTaka(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Delivery</dt>
              <dd className="tabular-nums">
                {delivery === 0 ? "Free" : formatTaka(delivery)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatTaka(total)}</dd>
            </div>
          </dl>

          {error && (
            <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-cream hover:bg-ink/90 disabled:opacity-70 cursor-pointer"
          >
            {pending ? (
              <>
                <Spinner className="h-5 w-5" /> Creating…
              </>
            ) : (
              "Create order"
            )}
          </button>
          <p className="mt-2 text-center text-xs text-ink-mute">
            Payment is Cash on Delivery.
          </p>
        </div>
      </div>
    </form>
  );
}
