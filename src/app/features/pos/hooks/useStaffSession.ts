import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase";
import { fetchStaffProfile } from "../services/posService";

type StaffSessionStatus = "loading" | "unauthorized" | "ready" | "error";

export function useStaffSession() {
  const [staffName, setStaffName] = useState(() => localStorage.getItem("staffName") ?? "");
  const [branchId, setBranchId] = useState<number | null>(null);
  const [status, setStatus] = useState<StaffSessionStatus>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadStaff = async () => {
      setStatus("loading");
      setError("");

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (!isActive) {
        return;
      }

      if (sessionError) {
        console.error("Failed to read Supabase session.", sessionError);
        setStatus("error");
        setError("Unable to load your session.");
        return;
      }

      if (!session?.user) {
        setStatus("unauthorized");
        return;
      }

      const cachedName = localStorage.getItem("staffName") ?? "";
      const fallbackName = cachedName || session.user.email || "Staff";
      if (!cachedName) {
        setStaffName(fallbackName);
      }

      const { data: staffProfile, error: staffError } = await fetchStaffProfile(session.user.id);

      if (!isActive) {
        return;
      }

      if (staffError || !staffProfile) {
        console.error("Failed to load staff profile.", staffError);
        setStaffName(fallbackName);
        setStatus("error");
        setError("Unable to load staff profile.");
        return;
      }

      setStaffName(staffProfile.username);
      localStorage.setItem("staffName", staffProfile.username);
      setBranchId(staffProfile.branchId);
      setStatus("ready");
    };

    loadStaff();

    return () => {
      isActive = false;
    };
  }, []);

  return {
    staffName,
    branchId,
    status,
    error,
  };
}
