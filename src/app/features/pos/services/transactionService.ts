import { supabase } from "../../../services/supabase/client";
import { normalizeSupabaseError } from "../../../services/supabase/errors";
import type { IStaffAuth, ITransactionHistory } from "./interfaces";
import type { Transaction } from "../types";
import { adaptTransactions } from "./adapters";

type SupabaseServiceErrorLike = Error & { code?: string; status?: number };

function error(value: unknown): SupabaseServiceErrorLike {
  return normalizeSupabaseError(value);
}

export class TransactionHistoryService implements ITransactionHistory {
  constructor(private readonly staffAuth: IStaffAuth) {}

  async getTransactions(): Promise<{ data: Transaction[]; error: Error | null }> {
    try {
      const staff = await this.staffAuth.getCurrentStaff();
      const result = await supabase
        .from("sales_transactions")
        .select(
          "sales_id, transaction_date, guest_name, guest_phone, transaction_type, total, sales_transaction_items(quantity, unit_price_at_sale, tracking_no, products(product_name, weight_kg))"
        )
        .eq("branch_id", staff.branchId)
        .order("transaction_date", { ascending: false });
      if (result.error) return { data: [] as Transaction[], error: error(result.error) };
      return { data: adaptTransactions(result.data), error: null };
    } catch (caught) {
      return { data: [] as Transaction[], error: error(caught) };
    }
  }
}
