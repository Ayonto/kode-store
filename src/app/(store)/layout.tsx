import { CartProvider } from "@/components/cart/CartContext";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { getCategoriesWithCount } from "@/lib/products";
import { getSettings } from "@/lib/settings";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, settings] = await Promise.all([
    getCategoriesWithCount().catch(() => []),
    getSettings().catch(() => ({
      storeName: "KODE",
      deliveryInsideDhaka: 60,
      deliveryOutsideDhaka: 120,
      freeDeliveryThreshold: null,
      currency: "৳",
    })),
  ]);

  return (
    <CartProvider>
      <Header categories={categories} settings={settings} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer categories={categories} />
      <CartDrawer settings={settings} />
    </CartProvider>
  );
}
