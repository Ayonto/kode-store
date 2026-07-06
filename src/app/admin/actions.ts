"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession, login, logout } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import type {
  SizeChart,
  CartItem,
  DeliveryZone,
  OrderSource,
} from "@/lib/types";
import { discountedPrice } from "@/lib/format";
import { deliveryCharge } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";
import { Prisma, type OrderStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

async function uniqueSlug(
  base: string,
  model: "product" | "category",
  ignoreId?: number
): Promise<string> {
  const root = slugify(base);
  let candidate = root;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing =
      model === "product"
        ? await prisma.product.findUnique({ where: { slug: candidate } })
        : await prisma.category.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === ignoreId) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
}

// ---------------------------------------------------------------- auth
export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!username || !password) return { error: "Enter username and password." };
  const err = await login(username, password);
  if (err) return { error: err };
  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

// ---------------------------------------------------------------- products
export type ProductInput = {
  id?: number;
  name: string;
  description: string;
  price: number;
  discountPercent: number;
  freeDelivery: boolean;
  featured: boolean;
  active: boolean;
  categoryId: number | null;
  images: string[];
  sizes: string[];
  sizeChart: SizeChart | null;
};

export async function saveProduct(input: ProductInput) {
  await requireAdmin();

  const name = input.name.trim();
  if (!name) throw new Error("Product name is required.");
  const price = Math.max(0, Math.round(input.price || 0));
  const discountPercent = Math.max(
    0,
    Math.min(100, Math.round(input.discountPercent || 0))
  );
  const images = input.images.map((s) => s.trim()).filter(Boolean);
  const sizes = input.sizes.map((s) => s.trim()).filter(Boolean);

  let sizeChart: SizeChart | null = null;
  if (
    input.sizeChart &&
    input.sizeChart.columns.length > 0 &&
    input.sizeChart.rows.length > 0
  ) {
    sizeChart = {
      columns: input.sizeChart.columns.map((c) => c.trim()),
      rows: input.sizeChart.rows.map((r) => r.map((c) => c.trim())),
    };
  }

  const data = {
    name,
    description: input.description.trim() || null,
    price,
    discountPercent,
    freeDelivery: input.freeDelivery,
    featured: input.featured,
    active: input.active,
    categoryId: input.categoryId,
    images,
    sizes,
    // JsonNull clears the column; an object stores the chart
    sizeChart: sizeChart ?? Prisma.JsonNull,
  };

  if (input.id) {
    await prisma.product.update({ where: { id: input.id }, data });
  } else {
    const slug = await uniqueSlug(name, "product");
    await prisma.product.create({ data: { ...data, slug } });
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function deleteProduct(id: number) {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function toggleProductActive(id: number, active: boolean) {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { active } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

// ---------------------------------------------------------------- categories
export async function saveCategory(input: {
  id?: number;
  name: string;
  imageUrl: string;
  sortOrder: number;
}) {
  await requireAdmin();
  const name = input.name.trim();
  if (!name) throw new Error("Category name is required.");
  const imageUrl = input.imageUrl.trim() || null;
  const sortOrder = Math.round(input.sortOrder || 0);

  if (input.id) {
    await prisma.category.update({
      where: { id: input.id },
      data: { name, imageUrl, sortOrder },
    });
  } else {
    const slug = await uniqueSlug(name, "category");
    await prisma.category.create({ data: { name, slug, imageUrl, sortOrder } });
  }
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function deleteCategory(id: number) {
  await requireAdmin();
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

// ---------------------------------------------------------------- settings
export async function saveSettings(input: {
  storeName: string;
  deliveryInsideDhaka: number;
  deliveryOutsideDhaka: number;
  freeDeliveryThreshold: number | null;
}) {
  await requireAdmin();
  const data = {
    storeName: input.storeName.trim() || "KODE",
    deliveryInsideDhaka: Math.max(0, Math.round(input.deliveryInsideDhaka || 0)),
    deliveryOutsideDhaka: Math.max(
      0,
      Math.round(input.deliveryOutsideDhaka || 0)
    ),
    freeDeliveryThreshold:
      input.freeDeliveryThreshold && input.freeDeliveryThreshold > 0
        ? Math.round(input.freeDeliveryThreshold)
        : null,
  };
  await prisma.settings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------- orders
export async function updateOrderStatus(id: number, status: OrderStatus) {
  await requireAdmin();
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

// ---------------------------------------------------------------- expenses
/** Parse a strict yyyy-mm-dd string into a UTC-midnight Date (or null). */
function parseISODate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const d = new Date(`${iso}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export type ExpenseInput = {
  id?: number;
  date: string; // yyyy-mm-dd
  amount: number;
  description: string;
  spentBy: string;
  categoryId: number | null;
};

export async function saveExpense(input: ExpenseInput) {
  await requireAdmin();

  const date = parseISODate(input.date);
  if (!date) throw new Error("A valid date is required.");
  const amount = Math.max(0, Math.round(input.amount || 0));
  if (amount <= 0) throw new Error("Amount must be greater than zero.");

  const data = {
    date,
    amount,
    description: input.description.trim(),
    spentBy: input.spentBy.trim(),
    categoryId: input.categoryId ?? null,
  };

  if (input.id) {
    await prisma.expense.update({ where: { id: input.id }, data });
  } else {
    await prisma.expense.create({ data });
  }
  revalidatePath("/admin/expenses");
  revalidatePath("/admin");
}

export async function deleteExpense(id: number) {
  await requireAdmin();
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/admin/expenses");
  revalidatePath("/admin");
}

// ---------------------------------------------------------------- expense categories
export async function saveExpenseCategory(input: {
  id?: number;
  name: string;
  color: string;
  sortOrder: number;
}) {
  await requireAdmin();
  const name = input.name.trim();
  if (!name) throw new Error("Category name is required.");
  const data = {
    name,
    color: input.color.trim() || null,
    sortOrder: Math.round(input.sortOrder || 0),
  };

  try {
    if (input.id) {
      await prisma.expenseCategory.update({ where: { id: input.id }, data });
    } else {
      await prisma.expenseCategory.create({ data });
    }
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new Error("A category with that name already exists.");
    }
    throw e;
  }
  revalidatePath("/admin/expenses");
  revalidatePath("/admin/expenses/categories");
}

export async function deleteExpenseCategory(id: number) {
  await requireAdmin();
  // onDelete: SetNull keeps the expenses, just clears their category.
  await prisma.expenseCategory.delete({ where: { id } });
  revalidatePath("/admin/expenses");
  revalidatePath("/admin/expenses/categories");
}

// ---------------------------------------------------------------- manual orders
function genOrderNumber() {
  const t = Date.now().toString(36).toUpperCase().slice(-5);
  const r = Math.floor(Math.random() * 36 ** 3)
    .toString(36)
    .toUpperCase()
    .padStart(3, "0");
  return `KODE-${t}${r}`;
}

export type ManualOrderInput = {
  customerName: string;
  phone: string;
  address: string;
  city: string;
  deliveryZone: DeliveryZone;
  notes: string;
  source: OrderSource;
  verified: boolean;
  items: { productId: number; size: string | null; quantity: number }[];
};

/** Log an order placed off-site (Instagram, Facebook, phone…). Prices are
 *  recomputed from the database — never trusted from the client. */
export async function createManualOrder(input: ManualOrderInput) {
  await requireAdmin();

  const customerName = input.customerName.trim();
  const phone = input.phone.trim();
  const address = input.address.trim();
  if (customerName.length < 2) throw new Error("Customer name is required.");
  if (phone.length < 6) throw new Error("A contact phone number is required.");
  if (address.length < 4) throw new Error("A delivery address is required.");

  const items = input.items.filter((i) => i.productId > 0 && i.quantity > 0);
  if (items.length === 0) throw new Error("Add at least one product.");

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  });
  const map = new Map(products.map((p) => [p.id, p]));

  const cartForDelivery: CartItem[] = [];
  const orderItems = items.map((i) => {
    const p = map.get(i.productId);
    if (!p) throw new Error("One of the selected products no longer exists.");
    const qty = Math.max(1, Math.min(99, Math.floor(i.quantity || 1)));
    const unit = discountedPrice(p.price, p.discountPercent);
    cartForDelivery.push({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      image: null,
      size: i.size ?? null,
      unitPrice: unit,
      quantity: qty,
      freeDelivery: p.freeDelivery,
    });
    return {
      productId: p.id,
      productName: p.name,
      size: i.size ?? null,
      unitPrice: unit,
      quantity: qty,
      lineTotal: unit * qty,
    };
  });

  const deliveryZone: DeliveryZone =
    input.deliveryZone === "outside_dhaka" ? "outside_dhaka" : "inside_dhaka";
  const settings = await getSettings();
  const subtotal = orderItems.reduce((s, i) => s + i.lineTotal, 0);
  const { charge } = deliveryCharge(cartForDelivery, deliveryZone, settings);
  const total = subtotal + charge;

  let created;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      created = await prisma.order.create({
        data: {
          orderNumber: genOrderNumber(),
          customerName,
          phone,
          address,
          city: input.city.trim() || null,
          deliveryZone,
          notes: input.notes.trim() || null,
          subtotal,
          deliveryCharge: charge,
          total,
          source: input.source,
          verified: input.verified,
          items: { create: orderItems },
        },
      });
      break;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002" &&
        attempt < 3
      ) {
        continue; // order-number collision, retry
      }
      throw e;
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  redirect(`/admin/orders/${created!.id}`);
}

export async function setOrderVerified(id: number, verified: boolean) {
  await requireAdmin();
  await prisma.order.update({ where: { id }, data: { verified } });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}
