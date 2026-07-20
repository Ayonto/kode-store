"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/cart/CartContext";
import { SizeChartModal } from "./SizeChartModal";
import { formatTaka } from "@/lib/format";
import {
  RulerIcon,
  TruckIcon,
  CheckIcon,
  PlusIcon,
  MinusIcon,
  ChevronRight,
} from "@/components/ui/icons";
import type { ProductDTO, StoreSettings } from "@/lib/types";

export function ProductDetail({
  product,
  settings,
}: {
  product: ProductDTO;
  settings: StoreSettings;
}) {
  const { addItem } = useCart();
  const images = product.images.length
    ? product.images
    : [`https://picsum.photos/seed/kode-${product.slug}/800/1000`];

  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState<string | null>(
    product.sizes.length ? null : null
  );
  const [qty, setQty] = useState(1);
  const [chartOpen, setChartOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasDiscount = product.discountPercent > 0;
  const needsSize = product.sizes.length > 0;

  function handleAdd() {
    if (needsSize && !size) {
      setError("Please select a size.");
      return;
    }
    setError(null);
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: images[0],
      size,
      unitPrice: product.effectivePrice,
      quantity: qty,
      freeDelivery: product.freeDelivery,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      {/* Gallery */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand">
          <Image
            key={activeImg}
            src={images[activeImg]}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="animate-fade-in object-cover"
          />
          {hasDiscount && (
            <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-white shadow-soft">
              −{product.discountPercent}% off
            </span>
          )}
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImg(i)}
                className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-sand transition-all cursor-pointer ${
                  i === activeImg
                    ? "ring-2 ring-ink ring-offset-2 ring-offset-cream"
                    : "opacity-70 hover:opacity-100"
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col">
        {product.categoryName && (
          <p className="text-xs uppercase tracking-luxe text-gold-deep">
            {product.categoryName}
          </p>
        )}
        <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">
          {product.name}
        </h1>

        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-2xl font-semibold text-ink">
            {formatTaka(product.effectivePrice)}
          </span>
          {hasDiscount && (
            <span className="text-lg text-ink-mute line-through">
              {formatTaka(product.price)}
            </span>
          )}
        </div>

        {product.freeDelivery && (
          <div className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-success/10 px-3 py-1.5 text-sm font-medium text-success">
            <TruckIcon className="h-4 w-4" />
            Free delivery on this item
          </div>
        )}

        {product.description && (
          <p className="mt-5 max-w-prose text-sm leading-relaxed text-ink-soft">
            {product.description}
          </p>
        )}

        {/* Sizes */}
        {needsSize && (
          <div className="mt-7">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink">Select size</span>
              {product.sizeChart && (
                <button
                  type="button"
                  onClick={() => setChartOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gold-deep hover:text-ink cursor-pointer"
                >
                  <RulerIcon className="h-4 w-4" />
                  Size guide
                </button>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSize(s);
                    setError(null);
                  }}
                  className={`min-w-12 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                    size === s
                      ? "border-ink bg-ink text-cream"
                      : "border-line bg-paper text-ink hover:border-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Size chart card (clickable) — also shown when no orderable sizes */}
        {product.sizeChart && (
          <button
            type="button"
            onClick={() => setChartOpen(true)}
            className="group mt-6 flex items-center justify-between rounded-2xl border border-line bg-paper px-5 py-4 text-left transition-all hover:border-gold hover:shadow-soft cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sand text-gold-deep">
                <RulerIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">Size Chart</p>
                <p className="text-xs text-ink-mute">
                  Tap to view detailed measurements
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-ink-mute transition-transform group-hover:translate-x-1 group-hover:text-ink" />
          </button>
        )}

        {/* Quantity + add */}
        <div className="mt-7 flex items-stretch gap-3">
          <div className="inline-flex items-center rounded-full border border-line bg-paper">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full text-ink-soft hover:text-ink cursor-pointer disabled:opacity-40"
              disabled={qty <= 1}
              aria-label="Decrease quantity"
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-sm font-medium tabular-nums">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full text-ink-soft hover:text-ink cursor-pointer"
              aria-label="Increase quantity"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-medium text-cream transition-colors cursor-pointer ${
              added ? "bg-success" : "bg-ink hover:bg-ink/90"
            }`}
          >
            {added ? (
              <>
                <CheckIcon className="h-5 w-5" /> Added to bag
              </>
            ) : (
              <>Add to Bag · {formatTaka(product.effectivePrice * qty)}</>
            )}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}

        {/* assurances */}
        <ul className="mt-8 space-y-2 border-t border-line pt-6 text-sm text-ink-soft">
          <li className="flex items-center gap-2">
            <CheckIcon className="h-4 w-4 text-gold-deep" /> Cash on delivery —
            pay when it arrives
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon className="h-4 w-4 text-gold-deep" /> Delivery inside
            Dhaka {formatTaka(settings.deliveryInsideDhaka)}, outside{" "}
            {formatTaka(settings.deliveryOutsideDhaka)}
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon className="h-4 w-4 text-gold-deep" /> 7-day easy returns
          </li>
        </ul>
      </div>

      {chartOpen && product.sizeChart && (
        <SizeChartModal
          chart={product.sizeChart}
          title={product.name}
          onClose={() => setChartOpen(false)}
        />
      )}
    </div>
  );
}
