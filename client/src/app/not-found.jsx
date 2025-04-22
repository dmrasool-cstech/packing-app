"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/adminContext";

export default function NotFound() {
  const router = useRouter();
  const { userInfo } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("usertoken");

    if (!token) {
      router.replace("/login");
      return;
    }

    // Wait for userInfo to be available (if it's async)
    if (userInfo?.role) {
      switch (userInfo.role) {
        case "admin":
          router.replace("/admin-dashboard");
          break;
        case "agent":
          router.replace("/agent-dashboard");
          break;
        case "user":
        default:
          router.replace("/dashboard");
      }
    }
  }, [userInfo]); // Make sure it re-runs when userInfo changes

  return <p>Redirecting...</p>;
}
