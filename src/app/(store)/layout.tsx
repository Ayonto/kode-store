import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getCategoriesWithCount } from "@/lib/products";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategoriesWithCount().catch(() => []);
  return (
    <>
      <Header categories={categories} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer categories={categories} />
    </>
  );
}
