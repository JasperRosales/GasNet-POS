import { supabase } from "../../../services/supabase/client";
import { normalizeSupabaseError } from "../../../services/supabase/errors";
import type { ITransactionHistory } from "./interfaces";
import type { Transaction } from "../types";
import { adaptTransactions } from "./adapters";

type SupabaseServiceErrorLike = Error & { code?: string; status?: number };

function error(value: unknown): SupabaseServiceErrorLike {
  return normalizeSupabaseError(value);
}

export class TransactionHistoryService implements ITransactionHistory {
  async getTransactions(): Promise<{ data: Transaction[]; error: Error | null }> {
    const result = await supabase
      .from("sales_transactions")
      .select(
        "sales_id, transaction_date, guest_name, transaction_type, total, sales_transaction_items(quantity, unit_price_at_sale, products(product_name, weight_kg))"
      )
      .order("transaction_date", { ascending: false });
    if (result.error) return { data: [] as Transaction[], error: error(result.error) };
    return { data: adaptTransactions(result.data), error: null };
  }
}
