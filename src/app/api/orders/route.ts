import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { discountedPrice } from "@/lib/format";
import { deliveryCharge } from "@/lib/pricing";
import type { CartItem, DeliveryZone } from "@/lib/types";

type IncomingItem = {
  productId: number;
  size?: string | null;
  quantity: number;
};

function genOrderNumber() {
  const t = Date.now().toString(36).toUpperCase().slice(-5);
  const r = Math.floor(Math.random() * 36 ** 3)
    .toString(36)
    .toUpperCase()
    .padStart(3, "0");
  return `KODE-${t}${r}`;
}

export async function POST(req: Request) {
  let body: {
    customerName?: string;
    phone?: string;
    address?: string;
    city?: string;
    deliveryZone?: DeliveryZone;
    notes?: string;
    items?: IncomingItem[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const customerName = (body.customerName ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const address = (body.address ?? "").trim();
  const city = (body.city ?? "").trim();
  const notes = (body.notes ?? "").trim();
  const deliveryZone: DeliveryZone =
    body.deliveryZone === "outside_dhaka" ? "outside_dhaka" : "inside_dhaka";
  const items = Array.isArray(body.items) ? body.items : [];

  // ---- validation ----
  if (customerName.length < 2)
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!/^01[0-9]{9}$/.test(phone))
    return NextResponse.json(
      { error: "Enter a valid Bangladeshi mobile number (e.g. 01XXXXXXXXX)." },
      { status: 400 }
    );
  if (address.length < 6)
    return NextResponse.json(
      { error: "Please enter a complete delivery address." },
      { status: 400 }
    );
  if (items.length === 0)
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });

  // ---- recompute trusted prices from DB ----
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, active: true },
  });
  const map = new Map(products.map((p) => [p.id, p]));

  const cartForDelivery: CartItem[] = [];
  const orderItems = items.map((i) => {
    const p = map.get(i.productId);
    if (!p) throw new Error(`Product ${i.productId} unavailable`);
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

  // any unavailable product?
  if (orderItems.length !== items.length) {
    return NextResponse.json(
      { error: "Some items are no longer available." },
      { status: 409 }
    );
  }

  const settings = await getSettings();
  const subtotal = orderItems.reduce((s, i) => s + i.lineTotal, 0);
  const { charge } = deliveryCharge(cartForDelivery, deliveryZone, settings);
  const total = subtotal + charge;

  // ---- persist (retry on rare orderNumber collision) ----
  let created;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      created = await prisma.order.create({
        data: {
          orderNumber: genOrderNumber(),
          customerName,
          phone,
          address,
          city: city || null,
          deliveryZone,
          notes: notes || null,
          subtotal,
          deliveryCharge: charge,
          total,
          items: { create: orderItems },
        },
      });
      break;
    } catch (e: unknown) {
      const code = (e as { code?: string }).code;
      if (code === "P2002" && attempt < 3) continue; // unique collision -> retry
      console.error(e);
      return NextResponse.json(
        { error: "Could not place the order. Please try again." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    orderNumber: created!.orderNumber,
    total: created!.total,
  });
}
