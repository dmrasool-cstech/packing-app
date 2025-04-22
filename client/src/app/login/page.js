"use client";

import React, { useContext, useState, useEffect } from "react";
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
  const { userInfo, login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ Zod schema
  const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(3, "Password must be at least 3 characters"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // 🔄 Centralized role-based redirect
  const redirectUser = (role) => {
    if (role === "admin") {
      router.replace("/admin-dashboard");
    } else if (role === "branch_manager") {
      router.replace("/manager-dashboard");
    } else if (role === "packing_agent") {
      router.replace("/dashboard");
    } else {
      router.replace("/not-authorized");
    }
  };

  // 🔐 If already logged in, redirect based on role
  useEffect(() => {
    if (userInfo?.role) {
      redirectUser(userInfo.role);
    }
  }, [userInfo]);

  // Prevent login page from showing if already logged in
  if (userInfo?.role) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin w-6 h-6 text-custom-primary" />
      </div>
    );
  }

  //if (userInfo?.role) return null; // Prevent login page from showing

  const onSubmit = async (data) => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await API.post("/auth/login", data);
      const { token, user } = response.data;

      if (!user || !token) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem("usertoken", token);
      localStorage.setItem("userrole", user.role);
      localStorage.setItem("userData", JSON.stringify(user));

      login(response.data);
      toast.success("Login successful!");
      redirectUser(user.role); // 🔁 Redirect based on role
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-3 flex items-center border-b text-center">
        <h1 className="text-lg font-medium">Sign In</h1>
      </div>

      {/* Body */}
      <div className="flex-1 px-5 pt-8 pb-4 overflow-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-full bg-custom-primary flex items-center justify-center mb-4">
            <Smartphone className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
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

          {/* Password */}
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

          {/* Submit */}
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

      {/* Bottom indicator */}
      <div className="h-1 w-32 bg-gray-300 rounded-full mx-auto mb-2"></div>
    </div>
  );
}
