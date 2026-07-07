import Link from "next/link";
import Image from "next/image";
import { getActiveProducts, getCategoriesWithCount } from "@/lib/products";
import { ProductCard } from "@/components/shop/ProductCard";
import { ArrowRight, TruckIcon, StarIcon } from "@/components/ui/icons";

export default async function HomePage() {
  const [featuredRaw, latest, categories] = await Promise.all([
    getActiveProducts({ featured: true, take: 8 }),
    getActiveProducts({ take: 8 }),
    getCategoriesWithCount(),
  ]);
  const featured = featuredRaw.length > 0 ? featuredRaw : latest;
  const heroImg = "https://picsum.photos/seed/kode-hero-look/1200/1500";

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 pb-10 pt-10 sm:pt-16 lg:grid-cols-2 lg:gap-16 lg:pb-20">
          <div className="order-2 lg:order-1">
            <p className="animate-fade-up text-xs uppercase tracking-luxe text-gold-deep [animation-delay:80ms]">
              New Season · Made in Bangladesh
            </p>
            <h1 className="animate-fade-up mt-4 font-display text-5xl font-medium leading-[1.04] text-ink sm:text-6xl lg:text-7xl [animation-delay:160ms]">
              Wear the
              <br />
              <span className="italic text-gold-deep">quiet</span> confidence.
            </h1>
            <p className="animate-fade-up mt-6 max-w-md text-base leading-relaxed text-ink-soft [animation-delay:260ms]">
              KODE makes modern, considered essentials for everyday life —
              honest fabrics, clean lines, fair prices. Delivered to your door,
              cash on delivery.
            </p>
            <div className="animate-fade-up mt-8 flex flex-wrap items-center gap-3 [animation-delay:360ms]">
              <Link
                href="/shop"
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 text-sm font-medium text-cream transition-colors hover:bg-ink/90 cursor-pointer"
              >
                Shop the collection
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full border border-line px-7 py-4 text-sm font-medium text-ink transition-colors hover:bg-sand cursor-pointer"
              >
                Our story
              </Link>
            </div>
            <div className="animate-fade-up mt-8 flex items-center gap-6 text-xs text-ink-soft [animation-delay:460ms]">
              <span className="inline-flex items-center gap-2">
                <TruckIcon className="h-4 w-4 text-gold-deep" />
                Nationwide COD
              </span>
              <span className="inline-flex items-center gap-2">
                <StarIcon className="h-4 w-4 text-gold-deep" />
                Loved by 5,000+ customers
              </span>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="animate-scale-in relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] bg-sand shadow-lift">
              <Image
                src={heroImg}
                alt="KODE seasonal lookbook"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-cream/85 px-5 py-4 backdrop-blur-md">
                <p className="font-display text-xl">The Everyday Edit</p>
                <p className="text-xs text-ink-soft">
                  Staples designed to be reached for first.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* marquee */}
        <div className="border-y border-line bg-paper py-3">
          <div className="flex overflow-hidden">
            <div className="animate-marquee flex shrink-0 items-center gap-8 whitespace-nowrap pr-8 text-sm uppercase tracking-luxe text-ink-mute">
              {Array.from({ length: 2 }).map((_, i) => (
                <span key={i} className="flex items-center gap-8">
                  <span>Free delivery offers</span>
                  <span className="text-gold">✦</span>
                  <span>Cash on delivery</span>
                  <span className="text-gold">✦</span>
                  <span>Made in Bangladesh</span>
                  <span className="text-gold">✦</span>
                  <span>7-day easy returns</span>
                  <span className="text-gold">✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex items-end justify-between" data-reveal>
            <div>
              <p className="text-xs uppercase tracking-luxe text-gold-deep">
                Hand-picked
              </p>
              <h2 className="mt-2 font-display text-4xl">New Arrivals</h2>
            </div>
            <Link
              href="/shop"
              className="hidden items-center gap-1 text-sm text-ink-soft hover:text-ink sm:inline-flex cursor-pointer"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        </section>
      )}

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="text-center" data-reveal>
            <p className="text-xs uppercase tracking-luxe text-gold-deep">
              Find your fit
            </p>
            <h2 className="mt-2 font-display text-4xl">Shop by Category</h2>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand cursor-pointer"
                data-reveal
              >
                <Image
                  src={
                    c.imageUrl ||
                    `https://picsum.photos/seed/kode-cat-${c.slug}/600/750`
                  }
                  alt={c.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="zoom-img object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-display text-2xl text-cream">{c.name}</h3>
                  <p className="text-xs text-cream/80">{c.count} pieces</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* PROMISE */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div
          className="overflow-hidden rounded-[2rem] bg-ink px-8 py-14 text-center text-cream sm:px-16"
          data-reveal
        >
          <p className="text-xs uppercase tracking-luxe text-gold-soft">
            The KODE promise
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl leading-snug sm:text-4xl">
            Try it on at home. Pay only when it arrives.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-cream/70">
            Every KODE order is cash on delivery. No advance payment, no risk —
            inspect your pieces at your doorstep before you pay.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-gold-deep cursor-pointer"
          >
            Start shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
