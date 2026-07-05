import Link from "next/link";
import type { CategoryNav } from "./Header";
import { TruckIcon, ShieldIcon, LeafIcon } from "@/components/ui/icons";

export function Footer({ categories }: { categories: CategoryNav[] }) {
  return (
    <footer className="mt-24 border-t border-line bg-paper">
      {/* assurances */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-12 sm:grid-cols-3">
        <Assurance
          icon={<TruckIcon className="h-6 w-6" />}
          title="Nationwide Delivery"
          body="Cash on delivery all over Bangladesh."
        />
        <Assurance
          icon={<ShieldIcon className="h-6 w-6" />}
          title="Quality Promise"
          body="Honest fabrics and finishing, checked before every dispatch."
        />
        <Assurance
          icon={<LeafIcon className="h-6 w-6" />}
          title="Made Locally"
          body="Designed and crafted in Bangladesh."
        />
      </div>

      <div className="border-t border-line">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 py-14 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <span className="font-display text-3xl tracking-[0.3em]">KODE</span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
              Modern essentials, made in Bangladesh.

            </p>
          </div>

          <FooterCol title="Shop">
            <FooterLink href="/shop">All Products</FooterLink>
            {categories.slice(0, 5).map((c) => (
              <FooterLink key={c.id} href={`/category/${c.slug}`}>
                {c.name}
              </FooterLink>
            ))}
          </FooterCol>

          <FooterCol title="Help">
            <FooterLink href="/shipping">Shipping & Delivery</FooterLink>
            <FooterLink href="/about">Our Story</FooterLink>
            <span className="text-sm text-ink-soft">Returns within 7 days</span>
          </FooterCol>

          <FooterCol title="Payment">
            <span className="text-sm text-ink-soft">
              Cash on Delivery only — pay when your order arrives at your door.
            </span>
          </FooterCol>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-ink-mute sm:flex-row">
          <span>© {new Date().getFullYear()} KODE. All rights reserved.</span>
          <span className="tracking-wide">Crafted in Dhaka, Bangladesh</span>
        </div>
      </div>
    </footer>
  );
}

function Assurance({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-4" data-reveal>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sand text-gold-deep">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{body}</p>
      </div>
    </div>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-luxe text-ink-mute">
        {title}
      </h4>
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm text-ink-soft transition-colors hover:text-ink"
    >
      {children}
    </Link>
  );
}
