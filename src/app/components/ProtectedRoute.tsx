import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { supabase } from "../utils/supabase";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType: "admin" | "staff";
}

export function ProtectedRoute({ children, requiredUserType }: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    let isActive = true;

    const checkAccess = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Failed to read Supabase session.", sessionError);
        if (isActive) {
          setIsAuthorized(false);
        }
        return;
      }

      if (!session?.user) {
        if (isActive) {
          setIsAuthorized(false);
        }
        return;
      }

      const { data: staffProfile, error: staffError } = await supabase
        .from("staff")
        .select("role")
        .eq("staff_id", session.user.id)
        .single();

      if (staffError) {
        console.error("Failed to load staff profile.", staffError);
        if (isActive) {
          setIsAuthorized(false);
        }
        return;
      }

      const normalizedRole = staffProfile?.role?.toLowerCase();
      if (isActive) {
        setIsAuthorized(normalizedRole === requiredUserType);
      }
    };

    checkAccess();

    return () => {
      isActive = false;
    };
  }, [requiredUserType]);

  if (isAuthorized === null) {
    return null;
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
