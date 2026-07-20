"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { saveCategory, deleteCategory } from "@/app/admin/actions";
import { Spinner, TrashIcon, PlusIcon } from "@/components/ui/icons";

type Cat = {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  sortOrder: number;
  count: number;
};

export function CategoryManager({ categories }: { categories: Cat[] }) {
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setEditId(null);
    setName("");
    setImageUrl("");
    setSortOrder("0");
    setError(null);
  }

  function startEdit(c: Cat) {
    setEditId(c.id);
    setName(c.name);
    setImageUrl(c.imageUrl ?? "");
    setSortOrder(String(c.sortOrder));
    setError(null);
  }

  function save() {
    if (!name.trim()) return setError("Category name is required.");
    startTransition(async () => {
      try {
        await saveCategory({
          id: editId ?? undefined,
          name,
          imageUrl,
          sortOrder: Number(sortOrder) || 0,
        });
        reset();
      } catch {
        setError("Could not save category.");
      }
    });
  }

  function remove(c: Cat) {
    if (
      confirm(
        `Delete “${c.name}”? Products in it will become uncategorised.`
      )
    ) {
      startTransition(() => deleteCategory(c.id));
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
              placeholder="e.g. T-Shirts"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">
              Image URL (optional)
            </span>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="kode-input"
              placeholder="https://…"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">
              Sort order
            </span>
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
            No categories yet. Create your first one.
          </div>
        ) : (
          <ul className="space-y-3">
            {categories.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-4 rounded-2xl border border-line bg-paper p-3"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-sand">
                  {c.imageUrl && (
                    <Image
                      src={c.imageUrl}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">{c.name}</p>
                  <p className="text-xs text-ink-mute">
                    /{c.slug} · {c.count} product{c.count === 1 ? "" : "s"} ·
                    order {c.sortOrder}
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
