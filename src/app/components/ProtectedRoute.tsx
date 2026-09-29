import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { supabase } from "../services/supabase/client";
import { fetchStaffProfile } from "../features/pos/services/posService";

export function ProtectedRoute({
  children,
  requiredUserType,
}: {
  children: React.ReactNode;
  requiredUserType: "admin" | "staff";
}) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    void (async () => {
      const session = await supabase.auth.getSession();
      if (!active) return;
      if (!session.data.session) {
        setAuthorized(false);
        return;
      }
      const profile = await fetchStaffProfile();
      if (active)
        setAuthorized(!profile.error && profile.data?.role?.toLowerCase() === requiredUserType);
    })();
    return () => {
      active = false;
    };
  }, [requiredUserType]);
  if (authorized === null) return null;
  if (!authorized) return <Navigate to="/" replace />;
  return <>{children}</>;
}
