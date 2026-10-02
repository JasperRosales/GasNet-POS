import { supabase } from "../../../services/supabase/client";
import { normalizeSupabaseError } from "../../../services/supabase/errors";
import type { IProductCatalog, ISaleProcessor, IStaffAuth, IStockService } from "./interfaces";
import type { SaleRequest } from "./types";
import type { CartItem, Transaction } from "../types";
import { adaptTransaction, number, record } from "./adapters";

type SupabaseServiceErrorLike = Error & { code?: string; status?: number };

function error(value: unknown): SupabaseServiceErrorLike {
  return normalizeSupabaseError(value);
}

export class SaleService implements ISaleProcessor {
  constructor(
    private readonly staffAuth: IStaffAuth,
    private readonly productCatalog: IProductCatalog,
    private readonly stockService: IStockService
  ) {}

  async createSale(input: SaleRequest): Promise<Transaction> {
    if (!input.idempotencyKey || input.idempotencyKey.length > 80) {
      throw new Error("A valid idempotency key is required.");
    }
    if (
      !input.items.length ||
      input.items.some(
        (item) =>
          !Number.isInteger(item.productId) ||
          !Number.isInteger(item.quantity) ||
          item.quantity <= 0 ||
          (item.unitPrice !== undefined &&
            (!Number.isSafeInteger(item.unitPrice) || item.unitPrice < 0))
      )
    ) {
      throw new Error(
        "Sale items must have positive whole-number quantities and non-negative whole-number prices."
      );
    }

    const unitPrice = (item: { productId: number; unitPrice?: number }) =>
      item.unitPrice ?? prices.get(item.productId) ?? 0;

    const staff = await this.staffAuth.getCurrentStaff();
    const requestedIds = [...new Set(input.items.map((item) => item.productId))];
    const prices = await this.productCatalog.getBranchPrices(requestedIds);

    if (
      requestedIds.some(
        (id) =>
          !prices.has(id) &&
          !input.items.some((item) => item.productId === id && item.unitPrice !== undefined)
      )
    ) {
      throw new Error("One or more products do not have a price for your branch.");
    }

    const subtotal = input.items.reduce(
      (sum, item) => sum + unitPrice(item) * item.quantity,
      0
    );
    if (!Number.isSafeInteger(subtotal) || subtotal < 0) throw new Error("Sale total is invalid.");

    await this.stockService.validateAndDecrement(input.items);

    const insert = await supabase
      .from("sales_transactions")
      .insert({
        idempotency_key: input.idempotencyKey,
        guest_name: input.customer,
        guest_phone: input.guestPhone ?? null,
        branch_id: staff.branchId,
        staff_id: staff.staffId,
        transaction_type: input.transactionType,
        subtotal,
        total: subtotal,
      })
      .select("sales_id, transaction_date, guest_name, guest_phone, transaction_type, total")
      .single();

    if (insert.error?.code === "23505") {
      const existing = await supabase
        .from("sales_transactions")
        .select("sales_id, transaction_date, guest_name, guest_phone, transaction_type, tracking_no, total")
        .eq("branch_id", staff.branchId)
        .eq("idempotency_key", input.idempotencyKey)
        .single();
      if (existing.error) throw error(existing.error);
      return adaptTransaction(existing.data);
    }
    if (insert.error) throw error(insert.error);

    const salesId = number(insert.data.sales_id);
    const itemInsert = await supabase
      .from("sales_transaction_items")
      .insert(
        input.items.map((item) => ({
          sales_id: salesId,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price_at_sale: unitPrice(item),
          tracking_no: item.trackingNo ?? null,
        }))
      );
    if (itemInsert.error) throw error(itemInsert.error);

    if (input.transactionType === "Instore") {
      const purchasedInsert = await supabase.from("purchased").insert(
        input.items.map((item) => ({
          sales_id: salesId,
          branch_id: staff.branchId,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price_at_sale: unitPrice(item),
        }))
      );
      if (purchasedInsert.error) {
        console.error("Failed to record purchased instore items.", purchasedInsert.error);
      }
    }

    if (input.transactionType === "Delivery") {
      const deliveryInsert = await supabase.from("delivery").insert(
        input.items.map((item) => ({
          sales_id: salesId,
          branch_id: staff.branchId,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price_at_sale: unitPrice(item),
        }))
      );
      if (deliveryInsert.error) {
        console.error("Failed to record delivery items.", deliveryInsert.error);
      }
    }

    const productDetails = await this.productCatalog.getProductDetails(requestedIds);
    const receiptItems: CartItem[] = input.items.map((item) => {
      const product = productDetails.get(item.productId);
      return {
        id: item.productId,
        name: product?.name ?? "",
        price: unitPrice(item),
        weight: product ? `${product.weightKg}kg` : "",
        quantity: item.quantity,
        trackingNo: item.trackingNo,
      };
    });

    return adaptTransaction(
      { ...record(insert.data), staff: { username: staff.username } },
      0,
      receiptItems
    );
  }
}
