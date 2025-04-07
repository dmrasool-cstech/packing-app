"use client";

import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";

export default function NotAuthorized() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-bold custom-text-primary">Access Denied</h1>
      <p className="text-gray-700 mt-2">
        You do not have permission to access this page.
      </p>
      <Button
        onClick={() => router.push("/login")}
        className="custom-bg-primary px-4 py-2 mt-4"
      >
        Go Home
      </Button>
    </div>
  );
}
