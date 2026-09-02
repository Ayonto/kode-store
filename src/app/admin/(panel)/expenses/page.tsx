import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatTaka } from "@/lib/format";
import { PageHeader, Card } from "@/components/admin/ui";
import {
  ExpenseManager,
  type ExpenseRow,
  type ExpenseCat,
} from "@/components/admin/ExpenseManager";

export const metadata = { title: "Expenses · Admin" };

const toISO = (d: Date) => d.toISOString().slice(0, 10);

export default async function ExpensesPage() {
  const [expenses, categories, revenueAgg] = await Promise.all([
    prisma.expense.findMany({ orderBy: { date: "desc" } }),
    prisma.expenseCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { expenses: true } } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } },
    }),
  ]);

  const rows: ExpenseRow[] = expenses.map((e) => ({
    id: e.id,
    date: toISO(e.date),
    amount: e.amount,
    description: e.description,
    spentBy: e.spentBy,
    categoryId: e.categoryId,
  }));

  const cats: ExpenseCat[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
  }));

  // ---- summary maths ----
  const total = rows.reduce((s, r) => s + r.amount, 0);
  const revenue = revenueAgg._sum.total ?? 0;
  const net = revenue - total;

  const currentKey = toISO(new Date()).slice(0, 7);
  const thisMonth = rows
    .filter((r) => r.date.slice(0, 7) === currentKey)
    .reduce((s, r) => s + r.amount, 0);

  // spend by category
  const catMap = new Map<number | "none", number>();
  for (const r of rows) {
    const k = r.categoryId ?? "none";
    catMap.set(k, (catMap.get(k) ?? 0) + r.amount);
  }
  const breakdown = [...catMap.entries()]
    .map(([k, amount]) => {
      const c = k === "none" ? null : categories.find((x) => x.id === k);
      return {
        name: c ? c.name : "Uncategorised",
        color: c?.color ?? "#8a8279",
        amount,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const stats = [
    { label: "Total spent (all time)", value: formatTaka(total) },
    { label: "Spent this month", value: formatTaka(thisMonth) },
    { label: "Store revenue", value: formatTaka(revenue) },
    {
      label: "Net profit",
      value: formatTaka(net),
      tone: net >= 0 ? "text-success" : "text-danger",
    },
  ];

  return (
    <>
      <PageHeader
        title="Expenses"
        subtitle="Track factory & operational spending — click any cell to edit."
        action={
          <Link
            href="/admin/expenses/categories"
            className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink hover:border-ink hover:bg-sand cursor-pointer"
          >
            Manage categories
          </Link>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-xs uppercase tracking-luxe text-ink-mute">
              {s.label}
            </p>
            <p
              className={`mt-2 text-3xl font-semibold tabular-nums ${
                s.tone ?? "text-ink"
              }`}
            >
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      {/* spend by category */}
      <Card className="mt-6">
        <h2 className="font-display text-2xl">Spending by category</h2>
        {breakdown.length === 0 ? (
          <p className="mt-6 text-sm text-ink-mute">No spending recorded yet.</p>
        ) : (
          <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {breakdown.map((b) => (
              <li key={b.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: b.color }}
                    />
                    {b.name}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatTaka(b.amount)}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-sand">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${total ? (b.amount / total) * 100 : 0}%`,
                      background: b.color,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* the spreadsheet */}
      <div className="mt-6">
        <ExpenseManager expenses={rows} categories={cats} />
      </div>
    </>
  );
}
