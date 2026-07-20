import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getActiveProducts } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { ProductCard } from "@/components/shop/ProductCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product ? product.name : "Product",
    description: product?.description ?? undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getSettings(),
  ]);
  if (!product) notFound();

  const related = (
    await getActiveProducts({
      categorySlug: product.categorySlug ?? undefined,
      take: 5,
    })
  )
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <nav className="mb-8 text-xs text-ink-mute">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span className="px-1.5">/</span>
        <Link href="/shop" className="hover:text-ink">
          Shop
        </Link>
        {product.categoryName && product.categorySlug && (
          <>
            <span className="px-1.5">/</span>
            <Link
              href={`/category/${product.categorySlug}`}
              className="hover:text-ink"
            >
              {product.categoryName}
            </Link>
          </>
        )}
        <span className="px-1.5">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <ProductDetail product={product} settings={settings} />

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="font-display text-3xl" data-reveal>
            You may also like
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
