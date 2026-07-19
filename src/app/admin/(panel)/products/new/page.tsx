import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <>
      <Link
        href="/admin/products"
        className="mb-4 inline-block text-sm text-ink-soft hover:text-ink cursor-pointer"
      >
        ← Back to products
      </Link>
      <PageHeader title="Add product" subtitle="Create a new product listing." />
      <ProductForm product={null} categories={categories} />
    </>
  );
}
