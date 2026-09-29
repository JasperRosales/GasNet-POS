import { supabase } from "../../../services/supabase/client";
import { normalizeSupabaseError } from "../../../services/supabase/errors";
import type { IStaffAuth } from "./interfaces";
import type { StaffProfile } from "./types";
import { number, record, text } from "./adapters";

type SupabaseServiceErrorLike = Error & { code?: string; status?: number };

function error(value: unknown): SupabaseServiceErrorLike {
  return normalizeSupabaseError(value);
}

export class StaffAuthService implements IStaffAuth {
  async login(username: string, password: string): Promise<void> {
    const result = await supabase.auth.signInWithPassword({ email: username, password });
    if (result.error) throw error(result.error);
  }

  async logout(): Promise<void> {
    const result = await supabase.auth.signOut();
    if (result.error) throw error(result.error);
  }

  async getProfile(): Promise<{ data: StaffProfile | null; error: Error | null }> {
    try {
      return { data: await this.getCurrentStaff(), error: null };
    } catch (caught) {
      return { data: null, error: error(caught) };
    }
  }

  async getCurrentStaff(): Promise<StaffProfile> {
    const userResult = await supabase.auth.getUser();
    if (userResult.error || !userResult.data.user) {
      throw error(userResult.error ?? new Error("Not signed in"));
    }

    const result = await supabase
      .from("staff")
      .select("staff_id, username, branch_id, role, branches(branch_name)")
      .eq("staff_id", userResult.data.user.id)
      .single();
    if (result.error) throw error(result.error);

    const row = record(result.data);
    const branch = Array.isArray(row.branches) ? record(row.branches[0]) : record(row.branches);
    const staffId = text(row.staff_id);
    const branchId = number(row.branch_id);
    if (!staffId || !branchId) throw new Error("Authenticated staff profile is incomplete.");

    return {
      staffId,
      branchId,
      username: text(row.username),
      role: text(row.role),
      branchName: text(branch.branch_name),
    };
  }
}
