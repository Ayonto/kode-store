"use client";

import { useState, useTransition } from "react";
import {
  saveExpenseCategory,
  deleteExpenseCategory,
} from "@/app/admin/actions";
import { Spinner, TrashIcon, PlusIcon } from "@/components/ui/icons";

type Cat = {
  id: number;
  name: string;
  color: string | null;
  sortOrder: number;
  count: number;
};

const PRESET_COLORS = [
  "#b7892f",
  "#15803d",
  "#1d4ed8",
  "#b91c1c",
  "#7c3aed",
  "#0891b2",
  "#c2410c",
  "#57534e",
];

export function ExpenseCategoryManager({ categories }: { categories: Cat[] }) {
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [sortOrder, setSortOrder] = useState("0");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setEditId(null);
    setName("");
    setColor(PRESET_COLORS[0]);
    setSortOrder("0");
    setError(null);
  }

  function startEdit(c: Cat) {
    setEditId(c.id);
    setName(c.name);
    setColor(c.color ?? PRESET_COLORS[0]);
    setSortOrder(String(c.sortOrder));
    setError(null);
  }

  function save() {
    if (!name.trim()) return setError("Category name is required.");
    startTransition(async () => {
      try {
        await saveExpenseCategory({
          id: editId ?? undefined,
          name,
          color,
          sortOrder: Number(sortOrder) || 0,
        });
        reset();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save category.");
      }
    });
  }

  function remove(c: Cat) {
    if (
      confirm(
        `Delete “${c.name}”? Its ${c.count} expense${
          c.count === 1 ? "" : "s"
        } will become uncategorised.`
      )
    ) {
      startTransition(() => deleteExpenseCategory(c.id));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* form */}
      <div className="rounded-2xl border border-line bg-paper p-6">
        <h2 className="font-display text-2xl">
          {editId ? "Edit category" : "New category"}
        </h2>
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="kode-input"
              placeholder="e.g. Raw materials"
            />
          </label>

          <div>
            <span className="mb-1.5 block text-sm font-medium">Colour</span>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Use colour ${c}`}
                  style={{ background: c }}
                  className={`h-8 w-8 rounded-full border-2 transition ${
                    color === c
                      ? "border-ink scale-110"
                      : "border-transparent hover:scale-105"
                  } cursor-pointer`}
                />
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Sort order</span>
            <input
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              inputMode="numeric"
              className="kode-input"
              placeholder="0"
            />
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-cream hover:bg-ink/90 disabled:opacity-70 cursor-pointer"
            >
              {pending ? (
                <Spinner className="h-5 w-5" />
              ) : editId ? (
                "Save changes"
              ) : (
                <>
                  <PlusIcon className="h-4 w-4" /> Add category
                </>
              )}
            </button>
            {editId && (
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-line px-5 py-3 text-sm font-medium hover:border-ink cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* list */}
      <div className="lg:col-span-2">
        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-paper py-16 text-center text-sm text-ink-mute">
            No expense categories yet. Create your first one.
          </div>
        ) : (
          <ul className="space-y-3">
            {categories.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-4 rounded-2xl border border-line bg-paper p-4"
              >
                <span
                  className="h-9 w-9 shrink-0 rounded-full"
                  style={{ background: c.color || "#b7892f" }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">{c.name}</p>
                  <p className="text-xs text-ink-mute">
                    {c.count} expense{c.count === 1 ? "" : "s"} · order{" "}
                    {c.sortOrder}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(c)}
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-sand hover:text-ink cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(c)}
                  disabled={pending}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-mute hover:bg-danger/10 hover:text-danger cursor-pointer disabled:opacity-50"
                  aria-label={`Delete ${c.name}`}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
