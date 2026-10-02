import { useCallback, useEffect, useState } from "react";
import { normalizeSupabaseError } from "../../../services/supabase/errors";
import { fetchBranchTarget } from "../services/posService";
import type { BranchTarget } from "../services/targetService";

export function useBranchTarget(branchId: number | null, refreshIndex = 0) {
  const [target, setTarget] = useState<BranchTarget | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      if (branchId === null) {
        setTarget(null);
        setLoading(false);
        setError("");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const result = await fetchBranchTarget();
        if (!isActive) return;
        if (result.error) {
          setTarget(null);
          setError(result.error.message || "Unable to load branch target.");
        } else {
          setTarget(result.data);
        }
      } catch (loadError) {
        if (!isActive) return;
        setTarget(null);
        setError(normalizeSupabaseError(loadError).message || "Unable to load branch target.");
      } finally {
        if (isActive) setLoading(false);
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, [branchId, refreshIndex]);

  return { target, loading, error };
}
