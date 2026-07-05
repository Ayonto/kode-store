"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MenuIcon, CloseIcon, ChevronRight } from "@/components/ui/icons";

export type CategoryNav = {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  count: number;
};

export function Header({
  categories = [],
}: {
  categories?: CategoryNav[];
}) {
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
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <div className="bg-ink text-cream text-[11px] sm:text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center tracking-wide">
          <span className="font-medium">Cash on Delivery nationwide</span>
        </div>
      </div>
      <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? "bg-cream/85 backdrop-blur-md" : "bg-cream"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex flex-1 items-center gap-1">
            <button type="button" onClick={() => setMenuOpen(true)}
              className="-ml-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-sand md:hidden cursor-pointer"
              aria-label="Open menu">
              <MenuIcon className="h-6 w-6" />
            </button>
            <nav className="hidden items-center gap-7 text-sm md:flex">
              {categories.slice(0, 4).map((c) => (
                <Link key={c.id} href={`/category/${c.slug}`} className="text-ink-soft hover:text-ink">
                  {c.name}
                </Link>
              ))}
            </nav>
          </div>
          <Link href="/" className="select-none text-center" aria-label="KODE home">
            <span className="font-display text-3xl font-semibold leading-none tracking-[0.35em] text-ink">KODE</span>
            <span className="mt-0.5 block text-[9px] uppercase tracking-[0.22em] text-ink-mute">Bangladesh</span>
          </Link>
          <div className="flex flex-1 items-center justify-end" />
        </div>
      </header>
      <div className={`fixed inset-0 z-50 md:hidden ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!menuOpen}>
        <div onClick={() => setMenuOpen(false)} className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${menuOpen ? "opacity-100" : "opacity-0"}`} />
        <div className={`absolute left-0 top-0 h-full w-[82%] max-w-sm bg-cream transition-transform duration-400 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <span className="font-display text-2xl tracking-[0.3em]">KODE</span>
            <button type="button" onClick={() => setMenuOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-sand cursor-pointer" aria-label="Close menu">
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col px-2 py-3">
            {categories.map((c) => (
              <Link key={c.id} href={`/category/${c.slug}`} onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-4 py-3.5 text-base text-ink hover:bg-sand cursor-pointer">
                <span>{c.name}</span>
                <ChevronRight className="h-4 w-4 text-ink-mute" />
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
