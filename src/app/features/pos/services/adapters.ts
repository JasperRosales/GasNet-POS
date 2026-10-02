import type { CartItem, Product, Transaction } from "../types";

type RecordValue = Record<string, unknown>;

export const record = (value: unknown): RecordValue =>
  value && typeof value === "object" ? (value as RecordValue) : {};

export const text = (value: unknown): string => (value == null ? "" : String(value));

export const number = (value: unknown): number => {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
};

export function adaptProduct(row: RecordValue, price: unknown): Product {
  return {
    id: number(row.product_id ?? row.id),
    name: text(row.product_name ?? row.name),
    price: number(price),
    weight: `${text(row.weight_kg ?? row.weight)}kg`,
  };
}

export function adaptProducts(value: unknown): Product[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = record(item);
    return adaptProduct(row, record(row.branch_product_prices).price ?? row.price);
  });
}

export function adaptTransaction(
  value: unknown,
  index = 0,
  submittedItems?: CartItem[]
): Transaction {
  const row = record(value);
  const items =
    submittedItems ??
    (Array.isArray(row.sales_transaction_items)
      ? row.sales_transaction_items
      : Array.isArray(row.items)
        ? row.items
        : []);
  const cartItems: CartItem[] = items.map((item) => {
    const source = record(item);
    const product = Array.isArray(source.products)
      ? record(source.products[0])
      : record(source.products);
    const name = source.product_name ?? source.name ?? product.product_name;
    return {
      id: number(source.product_id ?? source.id),
      name: text(name),
      price: number(source.unit_price_at_sale ?? source.unit_price ?? source.price),
      weight:
        source.weight_kg != null || product.weight_kg != null
          ? `${text(source.weight_kg ?? product.weight_kg)}kg`
          : text(source.weight) || '',
      quantity: number(source.quantity),
      trackingNo: source.tracking_no != null ? text(source.tracking_no) : undefined,
    };
  });
  return {
    transactionId: text(row.sales_id ?? row.transaction_id ?? `TXN-${index + 1}`),
    date: text(row.transaction_date ?? row.created_at),
    staff: text(record(row.staff).username ?? row.staff_username),
    customer: text(row.guest_name ?? row.customer) || "Guest",
    customerPhone: row.guest_phone ? text(row.guest_phone) : undefined,
    type:
      text(row.transaction_type).toLowerCase() === "commercial"
        ? "Commercial"
        : text(row.transaction_type).toLowerCase() === "delivery"
          ? "Delivery"
          : "Instore",
    items: cartItems,
    total: number(row.total),
  };
}

export function adaptTransactions(value: unknown): Transaction[] {
  return Array.isArray(value) ? value.map((item, index) => adaptTransaction(item, index)) : [];
}
