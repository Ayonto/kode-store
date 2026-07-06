"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/admin/actions";
import { MenuIcon, CloseIcon } from "@/components/ui/icons";

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/expenses", label: "Expenses" },
  { href: "/admin/settings", label: "Delivery Settings" },
];

export function AdminShell({
  username,
  children,
}: {
  username: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
            isActive(item.href, item.exact)
              ? "bg-gold/15 text-gold-deep"
              : "text-cream/70 hover:bg-cream/10 hover:text-cream"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-cream lg:flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 flex-col bg-ink p-5 lg:flex">
        <Link href="/admin" className="px-2">
          <span className="font-display text-3xl tracking-[0.3em] text-cream">
            KODE
          </span>
          <span className="block text-[10px] uppercase tracking-luxe text-gold-soft">
            Admin
          </span>
        </Link>
        <div className="mt-8 flex-1">{nav}</div>
        <div className="border-t border-cream/10 pt-4">
          <Link
            href="/"
            className="block rounded-xl px-4 py-2.5 text-sm text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream cursor-pointer"
          >
            View store ↗
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="mt-1 w-full rounded-xl px-4 py-2.5 text-left text-sm text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream cursor-pointer"
            >
              Sign out
            </button>
          </form>
          <p className="mt-3 px-4 text-xs text-cream/40">
            Signed in as {username}
          </p>
        </div>
      </aside>

      {/* Topbar (mobile) */}
      <header className="flex items-center justify-between bg-ink px-4 py-3 lg:hidden">
        <Link href="/admin">
          <span className="font-display text-2xl tracking-[0.3em] text-cream">
            KODE
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-cream hover:bg-cream/10 cursor-pointer"
          aria-label="Open admin menu"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-ink p-5">
            <div className="flex items-center justify-between">
              <span className="font-display text-2xl tracking-[0.3em] text-cream">
                KODE
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-cream hover:bg-cream/10 cursor-pointer"
                aria-label="Close menu"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6">{nav}</div>
            <div className="mt-6 border-t border-cream/10 pt-4">
              <Link
                href="/"
                className="block rounded-xl px-4 py-2.5 text-sm text-cream/70 hover:bg-cream/10 hover:text-cream cursor-pointer"
              >
                View store ↗
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="mt-1 w-full rounded-xl px-4 py-2.5 text-left text-sm text-cream/70 hover:bg-cream/10 hover:text-cream cursor-pointer"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10">{children}</main>
    </div>
  );
}
