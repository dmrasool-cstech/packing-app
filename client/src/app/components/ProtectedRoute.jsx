"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../context/authContext";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { user, loading } = useContext(AuthContext);
  const [checkingAuth, setCheckingAuth] = useState(true); // Avoids flickering

  useEffect(() => {
    if (!loading) {
      if (!user || !user.token) {
        router.push("/login");
      } else {
        setCheckingAuth(false);
      }
    }
  }, [user, loading]);

  if (loading || checkingAuth) {
    return <p>Loading...</p>; // Prevent flickering
  }

  return <>{children}</>;
}
