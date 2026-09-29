import { supabase } from "../../../services/supabase/client";
import { normalizeSupabaseError } from "../../../services/supabase/errors";
import type { IProductCatalog, IStaffAuth } from "./interfaces";
import type { Product } from "../types";
import { adaptProduct, number, record, text } from "./adapters";

type SupabaseServiceErrorLike = Error & { code?: string; status?: number };

function error(value: unknown): SupabaseServiceErrorLike {
  return normalizeSupabaseError(value);
}

export class ProductCatalogService implements IProductCatalog {
  constructor(private readonly staffAuth: IStaffAuth) {}

  async getBranchProducts(): Promise<{ data: Product[]; error: Error | null }> {
    try {
      const staff = await this.staffAuth.getCurrentStaff();

      const [pricesResult, stockResult] = await Promise.all([
        supabase
          .from("branch_product_prices")
          .select("product_id, price")
          .eq("branch_id", staff.branchId),
        supabase
          .from("branch_stock")
          .select("product_id, quantity")
          .eq("branch_id", staff.branchId),
      ]);

      if (pricesResult.error) throw error(pricesResult.error);
      if (stockResult.error) throw error(stockResult.error);
      if (!pricesResult.data?.length) return { data: [], error: null };

      const priceByProduct = new Map(
        pricesResult.data.map((item) => {
          const row = record(item);
          return [number(row.product_id), number(row.price)] as const;
        })
      );

      const stockByProduct = new Map(
        (stockResult.data ?? []).map((item) => {
          const row = record(item);
          return [number(row.product_id), number(row.quantity)] as const;
        })
      );

      const productIds = [...priceByProduct.keys()];
      const productsResult = await supabase
        .from("products")
        .select("product_id, product_name, weight_kg")
        .in("product_id", productIds)
        .eq("active", true);
      if (productsResult.error) throw error(productsResult.error);

      return {
        data: (productsResult.data ?? []).map((item) => {
          const row = record(item);
          const productId = number(row.product_id);
          return {
            ...adaptProduct(row, priceByProduct.get(productId)),
            stockQuantity: stockByProduct.get(productId) ?? 0,
          };
        }),
        error: null,
      };
    } catch (caught) {
      return { data: [], error: error(caught) };
    }
  }

  async updatePrice(productId: number, price: number): Promise<{ error: Error | null }> {
    try {
      if (!Number.isInteger(price) || price < 0) {
        return { error: new Error("Price must be a non-negative whole number.") };
      }
      const staff = await this.staffAuth.getCurrentStaff();
      const result = await supabase
        .from("branch_product_prices")
        .upsert(
          { branch_id: staff.branchId, product_id: productId, price },
          { onConflict: "branch_id,product_id" }
        );
      return { error: result.error ? error(result.error) : null };
    } catch (caught) {
      return { error: error(caught) };
    }
  }

  async getBranchPrices(productIds: number[]): Promise<Map<number, number>> {
    const staff = await this.staffAuth.getCurrentStaff();
    const result = await supabase
      .from("branch_product_prices")
      .select("product_id, price")
      .eq("branch_id", staff.branchId)
      .in("product_id", productIds);
    if (result.error) throw error(result.error);

    return new Map(
      (result.data ?? []).map((item) => {
        const row = record(item);
        return [number(row.product_id), number(row.price)] as const;
      })
    );
  }

  async getProductDetails(
    productIds: number[]
  ): Promise<Map<number, { name: string; weightKg: number }>> {
    const result = await supabase
      .from("products")
      .select("product_id, product_name, weight_kg")
      .in("product_id", productIds);
    if (result.error) throw error(result.error);

    return new Map(
      (result.data ?? []).map((item) => {
        const row = record(item);
        return [
          number(row.product_id),
          { name: text(row.product_name), weightKg: number(row.weight_kg) },
        ] as const;
      })
    );
  }
}
