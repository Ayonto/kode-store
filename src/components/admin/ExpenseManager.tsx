"use client";

import { useMemo, useState, useTransition } from "react";
import { saveExpense, deleteExpense } from "@/app/admin/actions";
import { formatTaka, formatDate, todayISO } from "@/lib/format";
import {
  TrashIcon,
  PlusIcon,
  DownloadIcon,
  Spinner,
  CloseIcon,
} from "@/components/ui/icons";

export type ExpenseRow = {
  id: number;
  date: string; // yyyy-mm-dd
  amount: number;
  description: string;
  spentBy: string;
  categoryId: number | null;
};

export type ExpenseCat = {
  id: number;
  name: string;
  color: string | null;
};

type SortField = "date" | "category" | "spentBy" | "amount";
type Sort = { field: SortField; dir: "asc" | "desc" };

export function ExpenseManager({
  expenses,
  categories,
}: {
  expenses: ExpenseRow[];
  categories: ExpenseCat[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // inline cell editing
  const [editing, setEditing] = useState<{ id: number; field: string } | null>(
    null
  );
  const [draft, setDraft] = useState("");

  // filters + sort
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [catFilter, setCatFilter] = useState("all"); // "all" | "none" | id
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>({ field: "date", dir: "desc" });

  // new-entry row
  const [nDate, setNDate] = useState(todayISO());
  const [nAmount, setNAmount] = useState("");
  const [nDesc, setNDesc] = useState("");
  const [nBy, setNBy] = useState("");
  const [nCat, setNCat] = useState("");

  const catName = (id: number | null) =>
    id == null ? "" : categories.find((c) => c.id === id)?.name ?? "";

  const filtersActive =
    from !== "" || to !== "" || catFilter !== "all" || q.trim() !== "";

  const visible = useMemo(() => {
    const rows = expenses.filter((r) => {
      if (from && r.date < from) return false;
      if (to && r.date > to) return false;
      if (catFilter === "none" && r.categoryId !== null) return false;
      if (catFilter !== "all" && catFilter !== "none") {
        if (String(r.categoryId) !== catFilter) return false;
      }
      if (q.trim()) {
        const hay = `${r.description} ${r.spentBy}`.toLowerCase();
        if (!hay.includes(q.trim().toLowerCase())) return false;
      }
      return true;
    });

    rows.sort((a, b) => {
      let cmp = 0;
      if (sort.field === "date") cmp = a.date.localeCompare(b.date);
      else if (sort.field === "amount") cmp = a.amount - b.amount;
      else if (sort.field === "category")
        cmp = catName(a.categoryId).localeCompare(catName(b.categoryId));
      else cmp = a.spentBy.localeCompare(b.spentBy);
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, from, to, catFilter, q, sort]);

  const totalVisible = visible.reduce((s, r) => s + r.amount, 0);

  // ---- mutations -------------------------------------------------------
  function persist(updated: ExpenseRow) {
    startTransition(async () => {
      try {
        await saveExpense(updated);
        setEditing(null);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save change.");
        setEditing(null);
      }
    });
  }

  function commitText(
    row: ExpenseRow,
    field: "description" | "spentBy" | "date",
    value: string
  ) {
    if (field === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return setEditing(null);
    }
    if (row[field] === value) return setEditing(null);
    persist({ ...row, [field]: value });
  }

  function commitAmount(row: ExpenseRow, value: string) {
    const amt = Math.round(Number(value) || 0);
    if (amt <= 0 || amt === row.amount) return setEditing(null);
    persist({ ...row, amount: amt });
  }

  function commitCategory(row: ExpenseRow, value: string) {
    const categoryId = value === "" ? null : Number(value);
    if (categoryId === row.categoryId) return setEditing(null);
    persist({ ...row, categoryId });
  }

  function addExpense() {
    if (!nDate) return setError("Pick a date for the new expense.");
    const amt = Math.round(Number(nAmount) || 0);
    if (amt <= 0) return setError("Enter an amount greater than zero.");
    startTransition(async () => {
      try {
        await saveExpense({
          date: nDate,
          amount: amt,
          description: nDesc,
          spentBy: nBy,
          categoryId: nCat === "" ? null : Number(nCat),
        });
        // keep date + category for fast repeated entry, clear the rest
        setNAmount("");
        setNDesc("");
        setNBy("");
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not add the expense.");
      }
    });
  }

  function remove(row: ExpenseRow) {
    if (confirm(`Delete this ${formatTaka(row.amount)} expense?`)) {
      startTransition(() => deleteExpense(row.id));
    }
  }

  function clearFilters() {
    setFrom("");
    setTo("");
    setCatFilter("all");
    setQ("");
  }

  function toggleSort(field: SortField) {
    setSort((s) =>
      s.field === field
        ? { field, dir: s.dir === "asc" ? "desc" : "asc" }
        : { field, dir: field === "spentBy" || field === "category" ? "asc" : "desc" }
    );
  }

  function exportCsv() {
    const cell = (v: string | number) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = ["Date,Description,Category,Spent by,Amount (BDT)"];
    for (const r of visible) {
      lines.push(
        [
          cell(r.date),
          cell(r.description),
          cell(catName(r.categoryId)),
          cell(r.spentBy),
          cell(r.amount),
        ].join(",")
      );
    }
    lines.push(["", "", "", "Total", cell(totalVisible)].join(","));
    const blob = new Blob(["﻿" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kode-expenses-${todayISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---- cell helpers ----------------------------------------------------
  const isEditing = (id: number, field: string) =>
    editing?.id === id && editing.field === field;

  const enterEdit = (id: number, field: string, value: string) => {
    setEditing({ id, field });
    setDraft(value);
  };

  const cellInputBase =
    "w-full rounded-md border border-gold bg-paper px-2 py-1 text-sm outline-none";

  const sortArrow = (field: SortField) =>
    sort.field === field ? (sort.dir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div>
      {/* toolbar */}
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-paper p-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink-mute">From</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="kode-input !py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink-mute">To</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="kode-input !py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink-mute">
            Category
          </span>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="kode-input !py-2 text-sm"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value="none">Uncategorised</option>
          </select>
        </label>
        <label className="block min-w-[180px] flex-1">
          <span className="mb-1 block text-xs font-medium text-ink-mute">
            Search
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Description or person…"
            className="kode-input !py-2 text-sm"
          />
        </label>

        {filtersActive && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-2 text-sm text-ink-soft hover:border-ink hover:text-ink cursor-pointer"
          >
            <CloseIcon className="h-4 w-4" /> Clear
          </button>
        )}

        <button
          type="button"
          onClick={exportCsv}
          className="ml-auto inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream hover:bg-ink/90 cursor-pointer"
        >
          <DownloadIcon className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {/* spreadsheet */}
      <div className="overflow-x-auto rounded-2xl border border-line bg-paper">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="bg-sand text-left text-xs uppercase tracking-wide text-ink-soft">
              <Th onClick={() => toggleSort("date")} className="w-[130px]">
                Date{sortArrow("date")}
              </Th>
              <Th>Description</Th>
              <Th onClick={() => toggleSort("category")} className="w-[150px]">
                Category{sortArrow("category")}
              </Th>
              <Th onClick={() => toggleSort("spentBy")} className="w-[150px]">
                Spent by{sortArrow("spentBy")}
              </Th>
              <Th
                onClick={() => toggleSort("amount")}
                className="w-[130px] text-right"
              >
                Amount{sortArrow("amount")}
              </Th>
              <th className="w-[44px] border-b border-line px-2 py-2.5" />
            </tr>
          </thead>

          <tbody>
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-ink-mute"
                >
                  {expenses.length === 0
                    ? "No expenses yet — add your first one in the row below."
                    : "No expenses match these filters."}
                </td>
              </tr>
            )}

            {visible.map((r) => (
              <tr
                key={r.id}
                className="group border-b border-line last:border-0 hover:bg-cream/60"
              >
                {/* date */}
                <Td onClick={() => enterEdit(r.id, "date", r.date)}>
                  {isEditing(r.id, "date") ? (
                    <input
                      type="date"
                      value={draft}
                      autoFocus
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={() => commitText(r, "date", draft)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitText(r, "date", draft);
                        if (e.key === "Escape") setEditing(null);
                      }}
                      className={cellInputBase}
                    />
                  ) : (
                    <span className="text-ink-soft">{formatDate(r.date)}</span>
                  )}
                </Td>

                {/* description */}
                <Td onClick={() => enterEdit(r.id, "description", r.description)}>
                  {isEditing(r.id, "description") ? (
                    <input
                      value={draft}
                      autoFocus
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={() => commitText(r, "description", draft)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          commitText(r, "description", draft);
                        if (e.key === "Escape") setEditing(null);
                      }}
                      className={cellInputBase}
                    />
                  ) : (
                    <span className={r.description ? "" : "text-ink-mute"}>
                      {r.description || "—"}
                    </span>
                  )}
                </Td>

                {/* category */}
                <Td onClick={() => enterEdit(r.id, "category", "")}>
                  {isEditing(r.id, "category") ? (
                    <select
                      autoFocus
                      defaultValue={r.categoryId ?? ""}
                      onChange={(e) => commitCategory(r, e.target.value)}
                      onBlur={() => setEditing(null)}
                      className={cellInputBase}
                    >
                      <option value="">— None —</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <CategoryChip
                      name={catName(r.categoryId)}
                      color={
                        categories.find((c) => c.id === r.categoryId)?.color ??
                        null
                      }
                    />
                  )}
                </Td>

                {/* spent by */}
                <Td onClick={() => enterEdit(r.id, "spentBy", r.spentBy)}>
                  {isEditing(r.id, "spentBy") ? (
                    <input
                      value={draft}
                      autoFocus
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={() => commitText(r, "spentBy", draft)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitText(r, "spentBy", draft);
                        if (e.key === "Escape") setEditing(null);
                      }}
                      className={cellInputBase}
                    />
                  ) : (
                    <span className={r.spentBy ? "" : "text-ink-mute"}>
                      {r.spentBy || "—"}
                    </span>
                  )}
                </Td>

                {/* amount */}
                <Td
                  className="text-right"
                  onClick={() => enterEdit(r.id, "amount", String(r.amount))}
                >
                  {isEditing(r.id, "amount") ? (
                    <input
                      inputMode="numeric"
                      value={draft}
                      autoFocus
                      onChange={(e) =>
                        setDraft(e.target.value.replace(/[^\d]/g, ""))
                      }
                      onBlur={() => commitAmount(r, draft)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitAmount(r, draft);
                        if (e.key === "Escape") setEditing(null);
                      }}
                      className={`${cellInputBase} text-right`}
                    />
                  ) : (
                    <span className="font-medium tabular-nums">
                      {formatTaka(r.amount)}
                    </span>
                  )}
                </Td>

                {/* delete */}
                <td className="border-b border-line px-2 py-1 text-center align-middle">
                  <button
                    type="button"
                    onClick={() => remove(r)}
                    disabled={pending}
                    aria-label="Delete expense"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-mute opacity-0 transition hover:bg-danger/10 hover:text-danger group-hover:opacity-100 disabled:opacity-50 cursor-pointer"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

          {/* new-entry row (Excel-style empty row) */}
          <tbody>
            <tr className="border-t-2 border-line bg-cream/40">
              <td className="px-3 py-2">
                <input
                  type="date"
                  value={nDate}
                  onChange={(e) => setNDate(e.target.value)}
                  className="kode-input !py-1.5 text-sm"
                />
              </td>
              <td className="px-3 py-2">
                <input
                  value={nDesc}
                  onChange={(e) => setNDesc(e.target.value)}
                  placeholder="What was it for?"
                  onKeyDown={(e) => e.key === "Enter" && addExpense()}
                  className="kode-input !py-1.5 text-sm"
                />
              </td>
              <td className="px-3 py-2">
                <select
                  value={nCat}
                  onChange={(e) => setNCat(e.target.value)}
                  className="kode-input !py-1.5 text-sm"
                >
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-2">
                <input
                  value={nBy}
                  onChange={(e) => setNBy(e.target.value)}
                  placeholder="Who spent it?"
                  onKeyDown={(e) => e.key === "Enter" && addExpense()}
                  className="kode-input !py-1.5 text-sm"
                />
              </td>
              <td className="px-3 py-2">
                <input
                  inputMode="numeric"
                  value={nAmount}
                  onChange={(e) =>
                    setNAmount(e.target.value.replace(/[^\d]/g, ""))
                  }
                  placeholder="0"
                  onKeyDown={(e) => e.key === "Enter" && addExpense()}
                  className="kode-input !py-1.5 text-right text-sm"
                />
              </td>
              <td className="px-2 py-2 text-center">
                <button
                  type="button"
                  onClick={addExpense}
                  disabled={pending}
                  aria-label="Add expense"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink text-cream hover:bg-ink/90 disabled:opacity-60 cursor-pointer"
                >
                  {pending ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <PlusIcon className="h-4 w-4" />
                  )}
                </button>
              </td>
            </tr>
          </tbody>

          {/* total row */}
          <tfoot>
            <tr className="bg-ink text-cream">
              <td className="px-4 py-3 text-xs uppercase tracking-luxe" colSpan={4}>
                {visible.length} {visible.length === 1 ? "entry" : "entries"}
                {filtersActive ? " (filtered)" : ""} · Total
              </td>
              <td className="px-4 py-3 text-right text-xl font-semibold tabular-nums">
                {formatTaka(totalVisible)}
              </td>
              <td className="border-b border-line" />
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="mt-3 text-xs text-ink-mute">
        Tip: click any cell to edit it inline. Press Enter to save, Esc to
        cancel.
      </p>
    </div>
  );
}

function Th({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <th
      onClick={onClick}
      className={`border-b border-line px-3 py-2.5 font-semibold ${
        onClick ? "cursor-pointer select-none hover:text-ink" : ""
      } ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <td
      onClick={onClick}
      className={`border-b border-line px-3 py-1.5 align-middle ${
        onClick ? "cursor-text" : ""
      } ${className}`}
    >
      {children}
    </td>
  );
}

function CategoryChip({
  name,
  color,
}: {
  name: string;
  color: string | null;
}) {
  if (!name) return <span className="text-ink-mute">—</span>;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sand px-2.5 py-1 text-xs font-medium text-ink-soft">
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: color || "#b7892f" }}
      />
      {name}
    </span>
  );
}
