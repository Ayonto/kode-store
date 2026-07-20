"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartContext";
import { BagIcon, MenuIcon, CloseIcon, ChevronRight } from "@/components/ui/icons";
import type { StoreSettings } from "@/lib/types";

export type CategoryNav = {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  count: number;
};

export function Header({
  categories,
  settings,
}: {
  categories: CategoryNav[];
  settings: StoreSettings;
}) {
  const { count, open, ready } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const freeOver =
    settings.freeDeliveryThreshold && settings.freeDeliveryThreshold > 0
      ? `Free delivery over ${settings.currency}${settings.freeDeliveryThreshold}`
      : "Inside & outside Dhaka delivery";

  return (
    <>
      {/* Announcement */}
      <div className="bg-ink text-cream text-[11px] sm:text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center tracking-wide">
          <span className="font-medium">Cash on Delivery nationwide</span>
          <span className="text-gold-soft">·</span>
          <span className="text-cream/80">{freeOver}</span>
        </div>
      </div>

      {/* Main bar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-cream/85 backdrop-blur-md shadow-[0_1px_0_0_var(--color-line)]"
            : "bg-cream"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          {/* Left: mobile menu + desktop nav */}
          <div className="flex flex-1 items-center gap-1">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="-ml-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-sand md:hidden cursor-pointer"
              aria-label="Open menu"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            <nav className="hidden items-center gap-7 text-sm md:flex">
              <Link
                href="/shop"
                className="text-ink-soft transition-colors hover:text-ink"
              >
                Shop All
              </Link>
              {categories.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  className="text-ink-soft transition-colors hover:text-ink"
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center: logo */}
          <Link
            href="/"
            className="select-none text-center"
            aria-label="KODE home"
          >
            <span className="font-display text-3xl font-semibold leading-none tracking-[0.35em] text-ink">
              KODE
            </span>
            <span className="mt-0.5 block text-[9px] uppercase tracking-luxe text-ink-mute">
              Bangladesh
            </span>
          </Link>

          {/* Right: cart */}
          <div className="flex flex-1 items-center justify-end">
            <button
              type="button"
              onClick={open}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-sand cursor-pointer"
              aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
            >
              <BagIcon className="h-6 w-6" />
              {ready && count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-white animate-scale-in">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${
          menuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!menuOpen}
      >
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute left-0 top-0 h-full w-[82%] max-w-sm bg-cream shadow-lift transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <span className="font-display text-2xl tracking-[0.3em]">KODE</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-sand cursor-pointer"
              aria-label="Close menu"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col px-2 py-3">
            <MobileLink href="/shop" onClick={() => setMenuOpen(false)}>
              Shop All
            </MobileLink>
            {categories.map((c) => (
              <MobileLink
                key={c.id}
                href={`/category/${c.slug}`}
                onClick={() => setMenuOpen(false)}
              >
                {c.name}
                <span className="text-xs text-ink-mute">{c.count}</span>
              </MobileLink>
            ))}
            <MobileLink href="/about" onClick={() => setMenuOpen(false)}>
              Our Story
            </MobileLink>
          </nav>
        </div>
      </div>
    </>
  );
}

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between rounded-xl px-4 py-3.5 text-base text-ink transition-colors hover:bg-sand cursor-pointer"
    >
      <span className="flex items-center gap-2">{children}</span>
      <ChevronRight className="h-4 w-4 text-ink-mute" />
    </Link>
  );
}
