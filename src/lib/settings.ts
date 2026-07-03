import "server-only";
import { prisma } from "./db";
import type { StoreSettings } from "./types";

const DEFAULTS: StoreSettings = {
  storeName: "KODE",
  deliveryInsideDhaka: 60,
  deliveryOutsideDhaka: 120,
  freeDeliveryThreshold: null,
  currency: "৳",
};

/** Reads the singleton settings row, creating it with defaults if missing. */
export async function getSettings(): Promise<StoreSettings> {
  let row = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!row) {
    row = await prisma.settings.create({ data: { id: 1 } });
  }
  return {
    storeName: row.storeName,
    deliveryInsideDhaka: row.deliveryInsideDhaka,
    deliveryOutsideDhaka: row.deliveryOutsideDhaka,
    freeDeliveryThreshold: row.freeDeliveryThreshold ?? null,
    currency: row.currency,
  };
}
