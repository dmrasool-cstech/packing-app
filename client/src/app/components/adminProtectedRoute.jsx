"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/adminContext";

const rolePermissions = {
  admin: ["*"], // full access
  packing_agent: [
    "/dashboard",
    "/scan",
    "/order-details",
    "/customer-details",
    "/reset-password",
    "/profile",
  ],
  branch_manager: [
    "/dashboard",
    "/scan",
    "/order-details",
    "/customer-details",
    "/reset-password",
    "/profile",
  ],
};

export default function AdminProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (!loading && checkingAuth) {
      if (!user || !user.token) {
        router.replace("/login");
      } else {
        const allowedRoutes = rolePermissions[user.role] || [];

        const isAllowed =
          allowedRoutes.includes("*") || allowedRoutes.includes(pathname);

        if (!isAllowed) {
          router.replace("/not-authorized");
        }

        setCheckingAuth(false);
      }
    }
  }, [user, loading, checkingAuth, pathname, router]);

  if (loading || checkingAuth) {
    return <p>Loading...</p>;
  }

  return <>{children}</>;
}
