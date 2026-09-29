import { supabase } from "../../../services/supabase/client";
import { normalizeSupabaseError } from "../../../services/supabase/errors";
import type { IStaffAuth, IStockService } from "./interfaces";
import { number, record } from "./adapters";

type SupabaseServiceErrorLike = Error & { code?: string; status?: number };

function error(value: unknown): SupabaseServiceErrorLike {
  return normalizeSupabaseError(value);
}

export class StockService implements IStockService {
  constructor(private readonly staffAuth: IStaffAuth) {}

  async getBranchStock(): Promise<{ data: Map<number, number>; error: Error | null }> {
    try {
      const staff = await this.staffAuth.getCurrentStaff();
      const result = await supabase
        .from("branch_stock")
        .select("product_id, quantity")
        .eq("branch_id", staff.branchId);

      if (result.error) return { data: new Map(), error: error(result.error) };

      const stockMap = new Map<number, number>();
      for (const item of result.data ?? []) {
        const row = record(item);
        stockMap.set(number(row.product_id), number(row.quantity));
      }

      return { data: stockMap, error: null };
    } catch (caught) {
      return { data: new Map(), error: error(caught) };
    }
  }

  async getStockForProducts(productIds: number[]): Promise<Map<number, number>> {
    const staff = await this.staffAuth.getCurrentStaff();
    const result = await supabase
      .from("branch_stock")
      .select("product_id, quantity")
      .eq("branch_id", staff.branchId)
      .in("product_id", productIds);
    if (result.error) throw error(result.error);

    return new Map(
      (result.data ?? []).map((item) => {
        const row = record(item);
        return [number(row.product_id), number(row.quantity)] as const;
      })
    );
  }

  async validateAndDecrement(items: Array<{ productId: number; quantity: number }>): Promise<void> {
    const staff = await this.staffAuth.getCurrentStaff();
    const productIds = items.map((item) => item.productId);
    const stockByProduct = await this.getStockForProducts(productIds);

    for (const item of items) {
      const available = stockByProduct.get(item.productId);
      if (available === undefined) {
        throw new Error(
          "No stock record found for one or more products. Please contact your administrator."
        );
      }
      if (available < item.quantity) {
        throw new Error(
          `Insufficient stock. Available: ${available}, Requested: ${item.quantity}.`
        );
      }
    }

    for (const item of items) {
      const currentStock = stockByProduct.get(item.productId) ?? 0;
      const newStock = currentStock - item.quantity;

      const { error: stockError } = await supabase
        .from("branch_stock")
        .update({ quantity: newStock })
        .eq("branch_id", staff.branchId)
        .eq("product_id", item.productId);

      if (stockError) {
        console.error("Failed to decrement stock after sale.", stockError);
      }
    }
  }
}
