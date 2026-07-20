"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useCart } from "./CartContext";
import { formatTaka } from "@/lib/format";
import {
  CloseIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  BagIcon,
  ArrowRight,
} from "@/components/ui/icons";
import type { StoreSettings } from "@/lib/types";

export function CartDrawer({ settings }: { settings: StoreSettings }) {
  const { items, isOpen, close, subtotal, updateQty, removeItem, count } =
    useCart();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const allFree = items.length > 0 && items.every((i) => i.freeDelivery);
  const meetsThreshold =
    !!settings.freeDeliveryThreshold &&
    settings.freeDeliveryThreshold > 0 &&
    subtotal >= settings.freeDeliveryThreshold;

  return (
    <div
      className={`fixed inset-0 z-50 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      {/* backdrop */}
      <div
        onClick={close}
        className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* panel */}
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-lift transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-2xl">
            Your Bag{" "}
            <span className="align-middle text-sm text-ink-mute">({count})</span>
          </h2>
          <button
            type="button"
            onClick={close}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-sand cursor-pointer"
            aria-label="Close cart"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sand text-ink-mute">
              <BagIcon className="h-8 w-8" />
            </div>
            <p className="text-ink-soft">Your bag is empty.</p>
            <button
              type="button"
              onClick={close}
              className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-ink/90 cursor-pointer"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="flex flex-col gap-5">
                {items.map((item) => (
                  <li
                    key={`${item.productId}-${item.size ?? "_"}`}
                    className="flex gap-4"
                  >
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={close}
                      className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-sand"
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : null}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={close}
                          className="truncate text-sm font-medium text-ink hover:text-gold-deep"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId, item.size)}
                          className="shrink-0 text-ink-mute transition-colors hover:text-danger cursor-pointer"
                          aria-label={`Remove ${item.name}`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                      {item.size && (
                        <span className="mt-0.5 text-xs text-ink-mute">
                          Size: {item.size}
                        </span>
                      )}
                      {item.freeDelivery && (
                        <span className="mt-0.5 text-xs font-medium text-success">
                          Free delivery
                        </span>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="inline-flex items-center rounded-full border border-line">
                          <button
                            type="button"
                            onClick={() =>
                              updateQty(
                                item.productId,
                                item.size,
                                item.quantity - 1
                              )
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:text-ink cursor-pointer disabled:opacity-40"
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="w-7 text-center text-sm tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQty(
                                item.productId,
                                item.size,
                                item.quantity + 1
                              )
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:text-ink cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold">
                          {formatTaka(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-line px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">Subtotal</span>
                <span className="font-semibold">{formatTaka(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-ink-mute">
                {allFree || meetsThreshold
                  ? "Free delivery applied at checkout."
                  : "Delivery calculated at checkout (Inside / Outside Dhaka)."}
              </p>
              <Link
                href="/checkout"
                onClick={close}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-sm font-medium text-cream transition-colors hover:bg-ink/90 cursor-pointer"
              >
                Checkout · Cash on Delivery
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={close}
                className="mt-2 w-full py-2 text-center text-xs text-ink-mute hover:text-ink cursor-pointer"
              >
                Continue shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
