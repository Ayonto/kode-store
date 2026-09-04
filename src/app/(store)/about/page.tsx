import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";

export const metadata = { title: "Our Story" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header className="text-center" data-reveal>
        <p className="text-xs uppercase tracking-luxe text-gold-deep">
          Our story
        </p>
        <h1 className="mt-3 font-display text-5xl leading-tight">
          Clothing with a quiet point of view.
        </h1>
      </header>

      <div className="mt-10 space-y-6 text-base leading-relaxed text-ink-soft">
        <p data-reveal>
          KODE began in Dhaka with a simple frustration: good, modern basics were
          either overpriced imports or compromised in quality. We wanted pieces
          that felt considered — clean cuts, honest fabric, and finishing you can
          trust — at a price that respects the people who wear them.
        </p>
        <p data-reveal>
          Everything we make is designed and produced locally, in partnership
          with workshops we know by name. We keep our range tight on purpose:
          fewer, better things you&apos;ll actually reach for.
        </p>
        <p data-reveal>
          And because trying clothes matters, every KODE order is cash on
          delivery. Inspect your pieces at your doorstep, and only pay when
          you&apos;re happy.
        </p>
      </div>

      <div className="mt-12 text-center" data-reveal>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 text-sm font-medium text-cream hover:bg-ink/90 cursor-pointer"
        >
          Explore the collection <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
