import type { CartItem, DeliveryZone, StoreSettings } from "./types";

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

/**
 * Delivery charge rules (in priority order):
 *  1. Empty cart -> 0
 *  2. Subtotal meets the free-delivery threshold -> free
 *  3. Every item is marked free-delivery -> free
 *  4. Otherwise the zone rate (inside / outside Dhaka)
 */
export function deliveryCharge(
  items: CartItem[],
  zone: DeliveryZone,
  settings: StoreSettings
): { charge: number; isFree: boolean; reason: string } {
  if (items.length === 0) return { charge: 0, isFree: true, reason: "empty" };

  const subtotal = cartSubtotal(items);
  if (
    settings.freeDeliveryThreshold &&
    settings.freeDeliveryThreshold > 0 &&
    subtotal >= settings.freeDeliveryThreshold
  ) {
    return { charge: 0, isFree: true, reason: "threshold" };
  }

  if (items.every((i) => i.freeDelivery)) {
    return { charge: 0, isFree: true, reason: "all-free" };
  }

  const charge =
    zone === "inside_dhaka"
      ? settings.deliveryInsideDhaka
      : settings.deliveryOutsideDhaka;
  return { charge, isFree: charge === 0, reason: "zone" };
}

export function orderTotal(
  items: CartItem[],
  zone: DeliveryZone,
  settings: StoreSettings
): { subtotal: number; delivery: number; total: number; deliveryFree: boolean } {
  const subtotal = cartSubtotal(items);
  const { charge, isFree } = deliveryCharge(items, zone, settings);
  return {
    subtotal,
    delivery: charge,
    total: subtotal + charge,
    deliveryFree: isFree,
  };
}
