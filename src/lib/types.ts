// Shared types for KODE store

export type SizeChart = {
  columns: string[];
  rows: string[][];
};

export type StoreSettings = {
  storeName: string;
  deliveryInsideDhaka: number;
  deliveryOutsideDhaka: number;
  freeDeliveryThreshold: number | null;
  currency: string;
};

export type DeliveryZone = "inside_dhaka" | "outside_dhaka";

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_SOURCES = [
  "WEBSITE",
  "INSTAGRAM",
  "FACEBOOK",
  "PHONE",
  "OTHER",
] as const;

export type OrderSource = (typeof ORDER_SOURCES)[number];

// Plain product shape used across the storefront (serializable)
export type ProductDTO = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discountPercent: number;
  effectivePrice: number;
  freeDelivery: boolean;
  featured: boolean;
  active: boolean;
  images: string[];
  sizes: string[];
  sizeChart: SizeChart | null;
  categoryId: number | null;
  categoryName: string | null;
  categorySlug: string | null;
};

// A line item kept in the cart (localStorage)
export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  image: string | null;
  size: string | null;
  unitPrice: number; // effective (after discount)
  quantity: number;
  freeDelivery: boolean;
};
