import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { ExpenseCategoryManager } from "@/components/admin/ExpenseCategoryManager";

export const metadata = { title: "Expense categories · Admin" };

export default async function ExpenseCategoriesPage() {
  const categories = await prisma.expenseCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { expenses: true } } },
  });

  const data = categories.map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
    sortOrder: c.sortOrder,
    count: c._count.expenses,
  }));

  return (
    <>
      <PageHeader
        title="Expense categories"
        subtitle="Group your spending — factory, materials, salaries, utilities…"
        action={
          <Link
            href="/admin/expenses"
            className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink hover:border-ink hover:bg-sand cursor-pointer"
          >
            ← Back to expenses
          </Link>
        }
      />
      <ExpenseCategoryManager categories={data} />
    </>
  );
}
