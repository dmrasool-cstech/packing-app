import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export function useAuth(allowedRoles = []) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("user.token");
    const userRole = localStorage.getItem("user.role");

    if (
      !token ||
      (allowedRoles.length > 0 && !allowedRoles.includes(userRole))
    ) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  return isAuthenticated;
}
