import Link from "next/link";
import Image from "next/image";
import { formatTaka } from "@/lib/format";
import type { ProductDTO } from "@/lib/types";

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductDTO;
  priority?: boolean;
}) {
  const hasDiscount = product.discountPercent > 0;
  const img = product.images[0] ?? null;
  const img2 = product.images[1] ?? null;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block cursor-pointer"
      data-reveal
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-sand">
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className="zoom-img object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-mute">
            <span className="font-display text-4xl tracking-widest">KODE</span>
          </div>
        )}
        {/* second image cross-fade on hover */}
        {img2 && (
          <Image
            src={img2}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        {/* badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {hasDiscount && (
            <span className="rounded-full bg-gold px-2.5 py-1 text-[11px] font-semibold text-white shadow-soft">
              −{product.discountPercent}%
            </span>
          )}
          {product.freeDelivery && (
            <span className="rounded-full bg-ink/90 px-2.5 py-1 text-[11px] font-medium text-cream shadow-soft">
              Free delivery
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 px-0.5">
        {product.categoryName && (
          <p className="text-[11px] uppercase tracking-luxe text-ink-mute">
            {product.categoryName}
          </p>
        )}
        <h3 className="mt-0.5 truncate text-sm font-medium text-ink transition-colors group-hover:text-gold-deep">
          {product.name}
        </h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-sm font-semibold text-ink">
            {formatTaka(product.effectivePrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-ink-mute line-through">
              {formatTaka(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
