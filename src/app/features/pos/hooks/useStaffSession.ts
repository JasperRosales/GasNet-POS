import { useEffect, useState } from "react";
import { supabase } from "../../../services/supabase/client";
import { normalizeSupabaseError, isSupabaseAuthError } from "../../../services/supabase/errors";
import { fetchStaffProfile } from "../services/posService";

type StaffSessionStatus = "loading" | "unauthorized" | "ready" | "error";

export function useStaffSession() {
  const [staffName, setStaffName] = useState("");
  const [branchId, setBranchId] = useState<number | null>(null);
  const [status, setStatus] = useState<StaffSessionStatus>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setStatus("loading");
      const session = await supabase.auth.getSession();
      if (!active) return;
      if (!session.data.session) {
        setStatus("unauthorized");
        return;
      }
      const profile = await fetchStaffProfile();
      if (!active) return;
      if (profile.error || !profile.data) {
        if (profile.error && isSupabaseAuthError(profile.error)) setStatus("unauthorized");
        else {
          setStatus("error");
          setError(normalizeSupabaseError(profile.error).message);
        }
        return;
      }
      setStaffName(profile.data.username);
      setBranchId(profile.data.branchId);
      setStatus("ready");
    };
    void load();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setStaffName("");
        setBranchId(null);
        setStatus("unauthorized");
      }
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return { staffName, branchId, status, error };
}
