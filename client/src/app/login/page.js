"use client";

import React, { useContext, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Smartphone, Loader } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

import API from "../utils/api";
import { useAuth } from "../context/adminContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    if (loading) return; // Prevent multiple clicks
    setLoading(true);

    try {
      const response = await API.post("/auth/login", data);
      const { token, user } = response.data;

      if (!user || !token) {
        throw new Error("Invalid response from server");
      }

      // Store user data in local storage
      localStorage.setItem("usertoken", token);
      localStorage.setItem("userrole", user.role);
      localStorage.setItem("userData", JSON.stringify(response.data.user));

      login(response.data);
      toast.success("Login successful!");

      // Role-based navigation
      // console.log(user.role);
      if (user.role === "admin") {
        router.push("/admin-dashboard");
      } else if (
        ["packing_agent", "branch_manager", "admin"].includes(user.role)
      ) {
        router.push("/dashboard");
      } else {
        router.push("/not-authorized");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Invalid Credentials");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* App Header */}
      <div className="px-4 py-3 flex items-center border-b text-center">
        <h1 className="text-lg font-medium">Sign In</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-5 pt-8 pb-4 overflow-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-full bg-custom-primary flex items-center justify-center mb-4">
            <Smartphone className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-1">
            <p className="text-sm font-medium mb-1 ml-1">Email</p>
            <Input
              type="email"
              placeholder="name@example.com"
              {...register("email")}
              className="h-12 rounded-xl bg-white border border-gray-200 px-4"
              required
            />
            <p className="text-red-500">{errors.email?.message}</p>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <p className="text-sm font-medium mb-1 ml-1">Password</p>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className="h-12 rounded-xl bg-white border border-gray-200 px-4"
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-red-500">{errors.password?.message}</p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 rounded-xl mt-6 text-base bg-custom-primary hover:bg-custom-primary-dark text-white flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          {/* Forgot Password */}
          <div className="text-center mt-4 text-sm text-custom-primary">
            <Link href={"/forgot-password"}>Forgot password?</Link>
          </div>
        </form>
      </div>

      <div className="h-1 w-32 bg-gray-300 rounded-full mx-auto mb-2"></div>
    </div>
  );
}
