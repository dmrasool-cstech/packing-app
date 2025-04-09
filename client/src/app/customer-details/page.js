"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  User,
  Mail,
  // Calendar,
  CheckCircle,
  Package,
  Truck,
  HomeIcon,
  Phone,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import API from "../utils/api";
// import ProtectedRoute from "../components/ProtectedRoute";
import AdminProtectedRoute from "../components/adminProtectedRoute";
// import ProtectedRoute from "../components/ProtectedRoute";

// Define validation schema using Zod
// const currentDate = new Date();
// const minDOB = new Date(
//   currentDate.getFullYear() - 16,
//   currentDate.getMonth(),
//   currentDate.getDate()
// );

const formSchema = z.object({
  name: z.string().min(3, "Full name must be at least 3 characters."),
  email: z
    .string()
    .email("Invalid email address.")
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Invalid email format."
    ),
  mobile: z
    .string()
    .regex(
      /^(\+91)?[6-9]\d{9}$/,
      "Invalid mobile number. Must be Indian format starting with +91 or without code."
    ),
});

export default function CustomerDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const handleBack = () => {
    router.push("/order-details");
  };

  const handleSaveDetails = async (data) => {
    if (!orderId) {
      console.error("Order ID is missing");
      return;
    }

    try {
      const response = await API.post(`/orders/update/${orderId}`, data);

      router.push("/dashboard");
    } catch (error) {
      console.log(error);
      console.error("Error updating order:", error);
    }
  };

  return (
    <AdminProtectedRoute>
      <div className="flex flex-col h-screen bg-white">
        <div className="px-4 py-3 flex items-center justify-between border-b">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:text-[#0f172a] hover:bg-[#f1f5f9] cursor-pointer"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium">Customer Details</h1>
          <div className="w-9"></div>
        </div>

        <div className="flex-1 px-5 py-6 overflow-auto">
          <form
            onSubmit={handleSubmit(handleSaveDetails)}
            className="space-y-5"
          >
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium ml-1 flex items-center gap-2"
              >
                <User className="h-4 w-4 text-gray-500" />
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter full name"
                {...register("name")}
                className="h-12 rounded-xl bg-white border border-gray-200 px-4"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium ml-1 flex items-center gap-2"
              >
                <Mail className="h-4 w-4 text-gray-500" />
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                {...register("email")}
                className="h-12 rounded-xl bg-white border border-gray-200 px-4"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* <div className="space-y-2">
              <label
                htmlFor="dob"
                className="text-sm font-medium ml-1 flex items-center gap-2"
              >
                <Calendar className="h-4 w-4 text-gray-500" />
                Date of Birth
              </label>
              <Input
                id="dob"
                type="date"
                {...register("dob")}
                className="h-12 rounded-xl bg-white border border-gray-200 px-4"
              />
              {errors.dob && (
                <p className="text-red-500 text-sm">{errors.dob.message}</p>
              )}
            </div> */}
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="text-sm font-medium ml-1 flex items-center gap-2"
              >
                <Phone className="h-4 w-4 text-gray-500" />
                Mobile Number
              </label>
              <Input
                id="phone"
                type="phone"
                placeholder="Enter mobile number"
                maxLength={13}
                {...register("mobile")}
                className="h-12 rounded-xl bg-white border border-gray-200 px-4"
              />
              {errors.mobile && (
                <p className="text-red-500 text-sm">{errors.mobile.message}</p>
              )}
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-custom-primary hover:bg-custom-primary-dark text-white flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
                <span className="text-base font-medium">
                  {isSubmitting
                    ? "Saving..."
                    : orderId
                    ? "Update & Continue"
                    : "Save & Continue"}
                </span>
              </Button>
            </div>
          </form>
        </div>
        <div className="border-t px-2 py-3 flex justify-around">
          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col items-center h-auto gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            onClick={() => router.push("/dashboard")}
          >
            <HomeIcon className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-400">Home</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col items-center h-auto gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <Package className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-400">Deliveries</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col items-center h-auto gap-1 text-custom-primary hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <Truck className="h-5 w-5 text-custom-primary" />
            <span className="text-xs font-medium">Current</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col items-center h-auto gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            onClick={() => router.push("/profile")}
          >
            <User className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-400">Profile</span>
          </Button>
        </div>

        {/* Home Indicator for iOS-style */}
        <div className="h-1 w-32 bg-gray-300 rounded-full mx-auto mb-2"></div>
      </div>
    </AdminProtectedRoute>
  );
}
