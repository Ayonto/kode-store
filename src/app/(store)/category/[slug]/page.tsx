import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getActiveProducts, getCategoriesWithCount } from "@/lib/products";
import { ProductCard } from "@/components/shop/ProductCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = await prisma.category.findUnique({ where: { slug } });
  return { title: cat ? cat.name : "Category" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const [products, categories] = await Promise.all([
    getActiveProducts({ categorySlug: slug }),
    getCategoriesWithCount(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <nav className="mb-6 text-xs text-ink-mute" data-reveal>
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span className="px-1.5">/</span>
        <Link href="/shop" className="hover:text-ink">
          Shop
        </Link>
        <span className="px-1.5">/</span>
        <span className="text-ink">{category.name}</span>
      </nav>

      <header className="text-center" data-reveal>
        <p className="text-xs uppercase tracking-luxe text-gold-deep">
          Category
        </p>
        <h1 className="mt-2 font-display text-5xl">{category.name}</h1>
        <p className="mt-3 text-sm text-ink-soft">
          {products.length} piece{products.length === 1 ? "" : "s"}
        </p>
      </header>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Link
          href="/shop"
          className="rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink cursor-pointer"
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className={`rounded-full px-4 py-2 text-sm transition-colors cursor-pointer ${
              c.slug === slug
                ? "bg-ink text-cream"
                : "border border-line bg-paper text-ink-soft hover:border-ink hover:text-ink"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-line bg-paper py-20 text-center">
          <p className="font-display text-2xl">Nothing here yet</p>
          <p className="mt-2 text-sm text-ink-soft">
            Check back soon — new {category.name.toLowerCase()} are on the way.
          </p>
        </div>
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
