"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { saveProduct, type ProductInput } from "@/app/admin/actions";
import {
  PlusIcon,
  TrashIcon,
  CloseIcon,
  Spinner,
  RulerIcon,
} from "@/components/ui/icons";
import { formatTaka, discountedPrice } from "@/lib/format";
import type { ProductDTO, SizeChart } from "@/lib/types";

type CategoryOpt = { id: number; name: string };

export function ProductForm({
  product,
  categories,
}: {
  product: ProductDTO | null;
  categories: CategoryOpt[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [discount, setDiscount] = useState(
    product ? String(product.discountPercent) : "0"
  );
  const [categoryId, setCategoryId] = useState(
    product?.categoryId ? String(product.categoryId) : ""
  );
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [freeDelivery, setFreeDelivery] = useState(
    product?.freeDelivery ?? false
  );
  const [active, setActive] = useState(product?.active ?? true);

  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [imgUrl, setImgUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const [sizes, setSizes] = useState<string[]>(product?.sizes ?? []);
  const [sizeInput, setSizeInput] = useState("");

  const [chartEnabled, setChartEnabled] = useState(!!product?.sizeChart);
  const [columns, setColumns] = useState<string[]>(
    product?.sizeChart?.columns ?? ["Size", "Chest (in)", "Length (in)"]
  );
  const [rows, setRows] = useState<string[][]>(
    product?.sizeChart?.rows ?? [
      ["S", "", ""],
      ["M", "", ""],
      ["L", "", ""],
    ]
  );

  const priceNum = Number(price) || 0;
  const discountNum = Number(discount) || 0;
  const preview = discountedPrice(priceNum, discountNum);

  // ---- images ----
  function addImageUrl() {
    const u = imgUrl.trim();
    if (u) {
      setImages((p) => [...p, u]);
      setImgUrl("");
    }
  }
  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Upload failed.");
      else setImages((p) => [...p, data.url]);
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  // ---- sizes ----
  function addSize() {
    const s = sizeInput.trim();
    if (s && !sizes.includes(s)) setSizes((p) => [...p, s]);
    setSizeInput("");
  }

  // ---- size chart ----
  function addColumn() {
    setColumns((c) => [...c, ""]);
    setRows((r) => r.map((row) => [...row, ""]));
  }
  function removeColumn(ci: number) {
    setColumns((c) => c.filter((_, i) => i !== ci));
    setRows((r) => r.map((row) => row.filter((_, i) => i !== ci)));
  }
  function setColumn(ci: number, val: string) {
    setColumns((c) => c.map((col, i) => (i === ci ? val : col)));
  }
  function addRow() {
    setRows((r) => [...r, columns.map(() => "")]);
  }
  function removeRow(ri: number) {
    setRows((r) => r.filter((_, i) => i !== ri));
  }
  function setCell(ri: number, ci: number, val: string) {
    setRows((r) =>
      r.map((row, i) =>
        i === ri ? row.map((cell, j) => (j === ci ? val : cell)) : row
      )
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Product name is required.");
    if (priceNum <= 0) return setError("Enter a valid price.");

    let sizeChart: SizeChart | null = null;
    if (chartEnabled) {
      const cols = columns.map((c) => c.trim()).filter(Boolean);
      const cleanRows = rows
        .map((r) => r.map((c) => c.trim()))
        .filter((r) => r.some(Boolean));
      if (cols.length > 0 && cleanRows.length > 0) {
        sizeChart = { columns: cols, rows: cleanRows };
      }
    }

    const input: ProductInput = {
      id: product?.id,
      name,
      description,
      price: priceNum,
      discountPercent: discountNum,
      freeDelivery,
      featured,
      active,
      categoryId: categoryId ? Number(categoryId) : null,
      images,
      sizes,
      sizeChart,
    };

    startTransition(async () => {
      try {
        await saveProduct(input);
      } catch (err) {
        // redirect() throws NEXT_REDIRECT — let it pass through
        if ((err as Error)?.message === "NEXT_REDIRECT") throw err;
        setError("Could not save the product. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
      {/* main column */}
      <div className="space-y-6 lg:col-span-2">
        <Section title="Details">
          <Label text="Product name" required>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="kode-input"
              placeholder="e.g. Essential Oversized Tee"
            />
          </Label>
          <Label text="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="kode-input resize-none"
              placeholder="Fabric, fit, care…"
            />
          </Label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Label text="Price (৳)" required>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                inputMode="numeric"
                className="kode-input"
                placeholder="1290"
              />
            </Label>
            <Label text="Discount (%)">
              <input
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                inputMode="numeric"
                className="kode-input"
                placeholder="0"
              />
            </Label>
          </div>
          {discountNum > 0 && priceNum > 0 && (
            <p className="text-sm text-ink-soft">
              Sells for{" "}
              <span className="font-semibold text-ink">
                {formatTaka(preview)}
              </span>{" "}
              <span className="text-ink-mute line-through">
                {formatTaka(priceNum)}
              </span>
            </p>
          )}
        </Section>

        {/* Images */}
        <Section title="Images">
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((src, i) => (
                <div
                  key={i}
                  className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-sand"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImages((p) => p.filter((_, j) => j !== i))
                    }
                    className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink/80 text-cream opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                    aria-label="Remove image"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] text-cream">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={imgUrl}
              onChange={(e) => setImgUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addImageUrl();
                }
              }}
              className="kode-input flex-1"
              placeholder="Paste image URL…"
            />
            <button
              type="button"
              onClick={addImageUrl}
              className="rounded-full border border-line px-4 py-2.5 text-sm font-medium hover:border-ink cursor-pointer"
            >
              Add URL
            </button>
            <label className="cursor-pointer rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-cream hover:bg-ink/90">
              {uploading ? "Uploading…" : "Upload"}
              <input
                type="file"
                accept="image/*"
                onChange={onUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-ink-mute">
            The first image is used as the cover. Paste a URL or upload from your
            device.
          </p>
        </Section>

        {/* Sizes */}
        <Section title="Available sizes">
          <p className="text-xs text-ink-mute">
            These are the sizes a customer can select and order. Leave empty for
            one-size items.
          </p>
          {sizes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1.5 text-sm"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => setSizes((p) => p.filter((x) => x !== s))}
                    className="text-ink-mute hover:text-danger cursor-pointer"
                    aria-label={`Remove size ${s}`}
                  >
                    <CloseIcon className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSize();
                }
              }}
              className="kode-input flex-1"
              placeholder="e.g. S, M, L, XL or 40, 42…"
            />
            <button
              type="button"
              onClick={addSize}
              className="rounded-full border border-line px-4 py-2.5 text-sm font-medium hover:border-ink cursor-pointer"
            >
              Add size
            </button>
          </div>
        </Section>

        {/* Size chart */}
        <Section
          title={
            <span className="inline-flex items-center gap-2">
              <RulerIcon className="h-5 w-5 text-gold-deep" /> Custom size chart
            </span>
          }
        >
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={chartEnabled}
              onChange={(e) => setChartEnabled(e.target.checked)}
              className="h-4 w-4 accent-ink cursor-pointer"
            />
            Show a size chart for this product
          </label>

          {chartEnabled && (
            <div className="space-y-3">
              <p className="text-xs text-ink-mute">
                Add columns (e.g. Size, Chest, Length, Sleeve) and a row per
                size. Every product can have its own chart.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      {columns.map((col, ci) => (
                        <th key={ci} className="p-1">
                          <div className="flex items-center gap-1">
                            <input
                              value={col}
                              onChange={(e) => setColumn(ci, e.target.value)}
                              className="kode-input !py-2 text-sm font-semibold"
                              placeholder={`Column ${ci + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeColumn(ci)}
                              disabled={columns.length <= 1}
                              className="shrink-0 text-ink-mute hover:text-danger disabled:opacity-30 cursor-pointer"
                              aria-label="Remove column"
                            >
                              <CloseIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </th>
                      ))}
                      <th className="p-1 align-middle">
                        <button
                          type="button"
                          onClick={addColumn}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line hover:border-ink cursor-pointer"
                          aria-label="Add column"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, ri) => (
                      <tr key={ri}>
                        {columns.map((_, ci) => (
                          <td key={ci} className="p-1">
                            <input
                              value={row[ci] ?? ""}
                              onChange={(e) => setCell(ri, ci, e.target.value)}
                              className="kode-input !py-2 text-sm"
                              placeholder={ci === 0 ? "S" : "—"}
                            />
                          </td>
                        ))}
                        <td className="p-1 text-center">
                          <button
                            type="button"
                            onClick={() => removeRow(ri)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-mute hover:text-danger cursor-pointer"
                            aria-label="Remove row"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={addRow}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium hover:border-ink cursor-pointer"
              >
                <PlusIcon className="h-4 w-4" /> Add row
              </button>
            </div>
          )}
        </Section>
      </div>

      {/* sidebar */}
      <div className="space-y-6">
        <Section title="Organise">
          <Label text="Category">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="kode-input"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Label>
        </Section>

        <Section title="Status & delivery">
          <Toggle
            label="Active (visible in store)"
            checked={active}
            onChange={setActive}
          />
          <Toggle
            label="Featured on homepage"
            checked={featured}
            onChange={setFeatured}
          />
          <Toggle
            label="Free delivery on this item"
            checked={freeDelivery}
            onChange={setFreeDelivery}
          />
        </Section>

        {error && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-ink/90 disabled:opacity-70 cursor-pointer"
          >
            {pending ? (
              <>
                <Spinner className="h-5 w-5" /> Saving…
              </>
            ) : product ? (
              "Save changes"
            ) : (
              "Create product"
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="rounded-full border border-line px-5 py-3.5 text-sm font-medium hover:border-ink cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-paper p-6">
      <h2 className="mb-4 font-display text-2xl">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Label({
  text,
  required,
  children,
}: {
  text: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">
        {text}
        {required && <span className="text-danger"> *</span>}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
      <span className="text-ink">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${
          checked ? "bg-ink" : "bg-line"
        }`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}
