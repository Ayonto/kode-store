import Link from "next/link";
import { getActiveProducts, getCategoriesWithCount } from "@/lib/products";
import { ProductCard } from "@/components/shop/ProductCard";

export const metadata = { title: "Shop All" };

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getActiveProducts(),
    getCategoriesWithCount(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <header className="text-center" data-reveal>
        <p className="text-xs uppercase tracking-luxe text-gold-deep">
          The full collection
        </p>
        <h1 className="mt-2 font-display text-5xl">Shop All</h1>
        <p className="mt-3 text-sm text-ink-soft">
          {products.length} piece{products.length === 1 ? "" : "s"} · Cash on
          delivery nationwide
        </p>
      </header>

      {/* category filter pills */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <span className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream">
          All
        </span>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className="rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink cursor-pointer"
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-16 rounded-2xl border border-dashed border-line bg-paper py-20 text-center">
      <p className="font-display text-2xl text-ink">No products yet</p>
      <p className="mt-2 text-sm text-ink-soft">
        Add products from the{" "}
        <Link href="/admin" className="text-gold-deep underline">
          admin panel
        </Link>{" "}
        to see them here.
      </p>
    </div>
  );
}
