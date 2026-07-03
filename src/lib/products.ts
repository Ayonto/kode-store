import "server-only";
import { prisma } from "./db";
import { discountedPrice } from "./format";
import type { ProductDTO, SizeChart } from "./types";
import type { Prisma } from "@prisma/client";

type ProductWithCategory = Prisma.ProductGetPayload<{
  include: { category: true };
}>;

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  return [];
}

function asSizeChart(v: unknown): SizeChart | null {
  if (
    v &&
    typeof v === "object" &&
    Array.isArray((v as SizeChart).columns) &&
    Array.isArray((v as SizeChart).rows)
  ) {
    const sc = v as SizeChart;
    return {
      columns: sc.columns.map(String),
      rows: sc.rows.map((r) => (Array.isArray(r) ? r.map(String) : [])),
    };
  }
  return null;
}

export function toProductDTO(p: ProductWithCategory): ProductDTO {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    discountPercent: p.discountPercent,
    effectivePrice: discountedPrice(p.price, p.discountPercent),
    freeDelivery: p.freeDelivery,
    featured: p.featured,
    active: p.active,
    images: asStringArray(p.images),
    sizes: asStringArray(p.sizes),
    sizeChart: asSizeChart(p.sizeChart),
    categoryId: p.categoryId,
    categoryName: p.category?.name ?? null,
    categorySlug: p.category?.slug ?? null,
  };
}

export async function getActiveProducts(opts?: {
  categorySlug?: string;
  featured?: boolean;
  take?: number;
}): Promise<ProductDTO[]> {
  const rows = await prisma.product.findMany({
    where: {
      active: true,
      ...(opts?.featured ? { featured: true } : {}),
      ...(opts?.categorySlug
        ? { category: { slug: opts.categorySlug } }
        : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    ...(opts?.take ? { take: opts.take } : {}),
  });
  return rows.map(toProductDTO);
}

export async function getProductBySlug(
  slug: string
): Promise<ProductDTO | null> {
  const row = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!row || !row.active) return null;
  return toProductDTO(row);
}

export async function getCategoriesWithCount() {
  const cats = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: { where: { active: true } } } } },
  });
  return cats.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    imageUrl: c.imageUrl,
    count: c._count.products,
  }));
}
