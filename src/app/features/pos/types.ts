export interface Product {
  id: number;
  name: string;
  price: number;
  weight: string;
  stockQuantity?: number;
}

export type ActiveTab = "pos" | "transactions" | "pricing" | "return";

export interface CartItem extends Product {
  quantity: number;
  /** Per-transaction price override. Falls back to the branch price when unset. */
  customPrice?: number;
  /** Physical tracking number for this product in the cart (per product, not per customer). */
  trackingNo?: string;
}

export interface Transaction {
  transactionId: string;
  date: string;
  staff: string;
  customer: string;
  customerPhone?: string;
  type: "Instore" | "Commercial" | "Delivery";
  items: CartItem[];
  total: number;
}
