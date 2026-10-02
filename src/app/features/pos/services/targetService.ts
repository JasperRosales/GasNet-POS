import { supabase } from "../../../services/supabase/client";
import { normalizeSupabaseError } from "../../../services/supabase/errors";
import type { IStaffAuth } from "./interfaces";
import { number, record, text } from "./adapters";

export interface BranchTarget {
  targetId: number;
  branchId: number;
  periodStart: string;
  periodEnd: string;
  targetRevenue: number;
  salesThisPeriod: number;
}

type SupabaseServiceErrorLike = Error & { code?: string; status?: number };

function error(value: unknown): SupabaseServiceErrorLike {
  return normalizeSupabaseError(value);
}

export class TargetService {
  constructor(private readonly staffAuth: IStaffAuth) {}

  async getCurrentBranchTarget(): Promise<{ data: BranchTarget | null; error: Error | null }> {
    try {
      const staff = await this.staffAuth.getCurrentStaff();

      const targets = await supabase
        .from("revenue_targets")
        .select("target_id, branch_id, period_start, period_end, target_revenue")
        .eq("branch_id", staff.branchId)
        .order("period_start", { ascending: false })
        .limit(1);

      if (targets.error) throw error(targets.error);
      const row = targets.data?.[0] ? record(targets.data[0]) : null;
      if (!row) return { data: null, error: null };

      const sales = await supabase
        .from("sales_transactions")
        .select("total")
        .eq("branch_id", staff.branchId)
        .gte("transaction_date", text(row.period_start))
        .lte("transaction_date", text(row.period_end));

      if (sales.error) throw error(sales.error);
      const salesThisPeriod = (sales.data ?? []).reduce(
        (sum, item) => sum + number(record(item).total),
        0
      );

      return {
        data: {
          targetId: number(row.target_id),
          branchId: number(row.branch_id),
          periodStart: text(row.period_start),
          periodEnd: text(row.period_end),
          targetRevenue: number(row.target_revenue),
          salesThisPeriod,
        },
        error: null,
      };
    } catch (caught) {
      return { data: null, error: error(caught) };
    }
  }
}
