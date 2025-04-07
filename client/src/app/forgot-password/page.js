"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import API from "../utils/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Handle password reset logic here
    try {
      const res = await API.post("/auth/forgot-password", { email });
      console.log(res);
      toast.success(res.data.message);
      setIsSubmitted(true);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
    // console.log("Password reset requested for:", email);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* App Header */}
      <div className="px-4 py-3 flex items-center border-b">
        <Link href="/login">
          <Button variant="ghost" size="icon" className="rounded-full mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-lg font-medium">Forgot Password</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-5 pt-8 pb-4 overflow-auto">
        {!isSubmitted ? (
          <>
            <div className="flex flex-col items-center mb-8">
              <div className="h-16 w-16 rounded-full bg-custom-primary flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold">Reset Password</h2>
              <p className="text-sm text-gray-500 mt-1 text-center">
                Enter your email address and we'll send you a link to reset your
                password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <p className="text-sm font-medium mb-1 ml-1">Email</p>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl bg-white border border-gray-200 px-4"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl mt-6 text-base bg-custom-primary text-white"
              >
                {loading ? "Reseting..." : "Reset Password"}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="h-16 w-16 rounded-full bg-custom-primary flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Check Your Email</h2>
            <p className="text-gray-600">
              We've sent a password reset link to{" "}
              <span className="font-medium">{email}</span>
            </p>
            <p className="text-gray-500 text-sm mt-4">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              className="mt-6 text-custom-primary text-white"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Area */}
      <div className="px-5 py-6 border-t text-center">
        <p className="text-sm text-gray-600">
          Remember your password?{" "}
          <Link href="/login" className="text-custom-primary font-medium">
            Sign In
          </Link>
        </p>
      </div>

      {/* Home Indicator for iOS-style */}
      <div className="h-1 w-32 bg-gray-300 rounded-full mx-auto mb-2"></div>
    </div>
  );
}
