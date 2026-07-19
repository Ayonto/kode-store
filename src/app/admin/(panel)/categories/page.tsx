import { getCategoriesWithCount } from "@/lib/products";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { CategoryManager } from "@/components/admin/CategoryManager";

export default async function AdminCategoriesPage() {
  const [withCount, full] = await Promise.all([
    getCategoriesWithCount(),
    prisma.category.findMany({ select: { id: true, sortOrder: true } }),
  ]);
  const sortMap = new Map(full.map((c) => [c.id, c.sortOrder]));
  const categories = withCount.map((c) => ({
    ...c,
    sortOrder: sortMap.get(c.id) ?? 0,
  }));

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Group products so customers can browse by type."
      />
      <CategoryManager categories={categories} />
    </>
  );
}
