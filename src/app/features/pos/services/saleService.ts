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
          item.quantity <= 0
      )
    ) {
      throw new Error("Sale items must have positive whole-number quantities.");
    }

    const staff = await this.staffAuth.getCurrentStaff();
    const requestedIds = [...new Set(input.items.map((item) => item.productId))];
    const prices = await this.productCatalog.getBranchPrices(requestedIds);

    if (prices.size !== requestedIds.length) {
      throw new Error("One or more products do not have a price for your branch.");
    }

    const subtotal = input.items.reduce(
      (sum, item) => sum + (prices.get(item.productId) ?? 0) * item.quantity,
      0
    );
    if (!Number.isSafeInteger(subtotal) || subtotal < 0) throw new Error("Sale total is invalid.");

    await this.stockService.validateAndDecrement(input.items);

    const insert = await supabase
      .from("sales_transactions")
      .insert({
        idempotency_key: input.idempotencyKey,
        guest_name: input.customer,
        branch_id: staff.branchId,
        staff_id: staff.staffId,
        transaction_type: input.transactionType,
        subtotal,
        total: subtotal,
      })
      .select("sales_id, transaction_date, guest_name, transaction_type, total")
      .single();

    if (insert.error?.code === "23505") {
      const existing = await supabase
        .from("sales_transactions")
        .select("sales_id, transaction_date, guest_name, transaction_type, total")
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
          unit_price_at_sale: prices.get(item.productId) ?? 0,
        }))
      );
    if (itemInsert.error) throw error(itemInsert.error);

    const productDetails = await this.productCatalog.getProductDetails(requestedIds);
    const receiptItems: CartItem[] = input.items.map((item) => {
      const product = productDetails.get(item.productId);
      return {
        id: item.productId,
        name: product?.name ?? "",
        price: prices.get(item.productId) ?? 0,
        weight: product ? `${product.weightKg}kg` : "",
        quantity: item.quantity,
      };
    });

    return adaptTransaction(
      { ...record(insert.data), staff: { username: staff.username } },
      0,
      receiptItems
    );
  }
}
