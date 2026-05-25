import { createBrowserRouter, Navigate } from "react-router";
import { StaffLoginPage } from "./pages/StaffLoginPage";
import { StaffPOSPage } from "./pages/StaffPOSPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <StaffLoginPage />,
  },
  {
    path: "/staff-pos",
    element: (
      <ProtectedRoute requiredUserType="staff">
        <StaffPOSPage />
      </ProtectedRoute>
    ),
  },
]);
