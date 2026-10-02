import { supabase } from "../../../services/supabase/client";
import { normalizeSupabaseError } from "../../../services/supabase/errors";
import type { IStaffAuth } from "./interfaces";
import { number, record } from "./adapters";

type SupabaseServiceErrorLike = Error & { code?: string; status?: number };

function error(value: unknown): SupabaseServiceErrorLike {
  return normalizeSupabaseError(value);
}

export class ReturnService {
  constructor(private readonly staffAuth: IStaffAuth) {}

  async searchItems(trackingNo: string): Promise<Array<{
    trackingNo: string;
    productName: string;
    quantity: number;
    branchName: string;
    transactionDate: string;
  }>> {
    const query = trackingNo.trim();
    if (!query) return [];

    const result = await supabase
      .from("sales_transaction_items")
      .select(
        "tracking_no, quantity, products(product_name), sales_transactions(transaction_date, branches(branch_name))"
      )
      .ilike("tracking_no", `%${query}%`)
      .order("created_at", { ascending: false })
      .limit(10);

    if (result.error) throw error(result.error);

    return (result.data ?? []).map((row) => {
      const item = record(row);
      const product = Array.isArray(item.products) ? record(item.products[0]) : record(item.products);
      const sale = Array.isArray(item.sales_transactions)
        ? record(item.sales_transactions[0])
        : record(item.sales_transactions);
      const branch = Array.isArray(sale.branches) ? record(sale.branches[0]) : record(sale.branches);
      return {
        trackingNo: String(item.tracking_no ?? ""),
        productName: String(product.product_name ?? "Unknown"),
        quantity: Number(item.quantity ?? 0),
        branchName: String(branch.branch_name ?? "Unknown"),
        transactionDate: String(sale.transaction_date ?? ""),
      };
    });
  }

  async recordReturn(input: {
    trackingNo: string;
    quantity: number;
    reason?: string;
  }): Promise<{ error: Error | null }> {
    try {
      if (!input.trackingNo.trim()) {
        return { error: new Error("Tracking number is required to process a return.") };
      }
      if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
        return { error: new Error("Quantity must be a positive whole number.") };
      }

      const staff = await this.staffAuth.getCurrentStaff();

      // The tracking number identifies the specific product line on the original sale.
      const itemResult = await supabase
        .from("sales_transaction_items")
        .select("sales_id, product_id, quantity")
        .eq("tracking_no", input.trackingNo.trim())
        .maybeSingle();

      if (itemResult.error) throw error(itemResult.error);
      if (!itemResult.data) {
        return { error: new Error("No sale item found with this tracking number.") };
      }

      const itemRow = record(itemResult.data);
      const salesId = number(itemRow.sales_id);
      const productId = number(itemRow.product_id);
      const purchasedQuantity = number(itemRow.quantity);

      const returnedResult = await supabase
        .from("returned")
        .select("quantity")
        .eq("tracking_no", input.trackingNo.trim());

      if (returnedResult.error) throw error(returnedResult.error);
      const alreadyReturned = (returnedResult.data ?? []).reduce(
        (sum, row) => sum + number(record(row).quantity),
        0
      );

      if (alreadyReturned + input.quantity > purchasedQuantity) {
        return {
          error: new Error(
            `Only ${purchasedQuantity - alreadyReturned} unit(s) remain returnable for that tracking number.`
          ),
        };
      }

      const stockResult = await supabase
        .from("branch_stock")
        .select("quantity")
        .eq("branch_id", staff.branchId)
        .eq("product_id", productId)
        .maybeSingle();

      if (stockResult.error) throw error(stockResult.error);
      if (!stockResult.data) {
        return { error: new Error("No stock record found for that product in this branch.") };
      }

      const newQuantity = number(record(stockResult.data).quantity) + input.quantity;

      const { error: stockError } = await supabase
        .from("branch_stock")
        .update({ quantity: newQuantity })
        .eq("branch_id", staff.branchId)
        .eq("product_id", productId);

      if (stockError) throw error(stockError);

      const { error: insertError } = await supabase.from("returned").insert({
        sales_id: salesId,
        branch_id: staff.branchId,
        product_id: productId,
        quantity: input.quantity,
        tracking_no: input.trackingNo.trim(),
        reason: input.reason?.trim() || null,
      });

      if (insertError) throw error(insertError);
      return { error: null };
    } catch (caught) {
      return { error: error(caught) };
    }
  }
}
