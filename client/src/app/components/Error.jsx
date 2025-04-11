"use client";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ShieldAlert } from "lucide-react";

export default function Error({ message }) {
  const router = useRouter();
  useEffect(() => {
    router.prefetch("/scan");
  }, []);
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-sm border border-red-300 text-red-700 shadow-md rounded-xl">
        <CardHeader>
          <CardTitle className="text-center text-lg font-semibold text-red-800 flex items-center gap-2 justify-center">
            <ShieldAlert className="w-5 h-5" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4 text-sm text-gray-800">
            {message || "Something went wrong. Please try again later."}
          </p>
          <Button
            className="w-full bg-[#D84315] hover:bg-[#c53a11] text-white font-medium cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              if (typeof window !== "undefined") {
                if (
                  document.referrer &&
                  document.referrer !== window.location.href
                ) {
                  router.back();
                } else {
                  router.push("/scan");
                }
              }
            }}
          >
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
