import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { toProductDTO } from "@/lib/products";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [row, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: Number(id) },
      include: { category: true },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!row) notFound();

  return (
    <>
      <Link
        href="/admin/products"
        className="mb-4 inline-block text-sm text-ink-soft hover:text-ink cursor-pointer"
      >
        ← Back to products
      </Link>
      <PageHeader title="Edit product" subtitle={row.name} />
      <ProductForm product={toProductDTO(row)} categories={categories} />
    </>
  );
}
