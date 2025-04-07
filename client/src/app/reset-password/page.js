"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import API from "../utils/api";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // Get token from URL
  console.log(token);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post(`/auth/reset-password/${token}`, {
        token,
        password,
      });

      toast.success(res.data.message);
      setIsSubmitted(true);

      // Redirect to login after a delay
      setTimeout(() => router.push("/login"), 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-3 flex items-center border-b">
        <Link href="/login">
          <Button variant="ghost" size="icon" className="rounded-full mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-lg font-medium">Reset Password</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-5 pt-8 pb-4 overflow-auto">
        {!isSubmitted ? (
          <>
            <div className="flex flex-col items-center mb-8">
              <div className="h-16 w-16 rounded-full bg-custom-primary flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold">Set New Password</h2>
              <p className="text-sm text-gray-500 mt-1 text-center">
                Enter your new password below
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <p className="text-sm font-medium mb-1 ml-1">New Password</p>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl bg-white border border-gray-200 px-4"
                  required
                />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium mb-1 ml-1">
                  Confirm Password
                </p>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 rounded-xl bg-white border border-gray-200 px-4"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl mt-6 text-base bg-custom-primary text-white"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="h-16 w-16 rounded-full bg-custom-primary flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">
              Password Reset Successfully
            </h2>
            <p className="text-gray-600">
              You can now log in with your new password.
            </p>
            <Button
              onClick={() => router.push("/login")}
              className="mt-6 text-custom-primary text-white"
            >
              Go to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
