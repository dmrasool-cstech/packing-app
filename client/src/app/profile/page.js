"use client";

import { useContext } from "react";

import {
  User,
  Mail,
  Shield,
  ArrowLeft,
  HomeIcon,
  Package,
  Truck,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/adminContext";
// import ProtectedRoute from "../components/ProtectedRoute";
import AdminProtectedRoute from "../components/adminProtectedRoute";

export default function Profile() {
  const { userInfo } = useAuth();
  // console.log(userInfo);
  const router = useRouter();
  //   console.log(user);
  function handleBack() {
    // console.log("History Length:", window.history.length);
    if (window.history.length > 1) {
      router.back(); // Go back only if there's a previous page
    } else {
      router.push("/dashboard"); // Fallback if there's no history
    }
  }
  console.log("Name:", userInfo.name);
  return (
    <AdminProtectedRoute>
      <div className="flex flex-col h-screen bg-white">
        {/* Top Bar */}
        <div className="px-4 py-3 flex items-center justify-between border-b">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:text-[#0f172a] hover:bg-[#f1f5f9] cursor-pointer"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium">Profile</h1>
          <div className="w-9"></div>
        </div>

        {/* Profile Form */}
        <div className="flex-1 px-5 py-6 overflow-auto">
          <form className="space-y-5">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium ml-1 flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                Full Name
              </label>
              <Input
                type="text"
                value={userInfo.name || ""}
                disabled
                className="h-12 rounded-xl bg-gray-100 border border-gray-200 px-4 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium ml-1 flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                Email Address
              </label>
              <Input
                type="email"
                value={userInfo?.email || ""}
                disabled
                className="h-12 rounded-xl bg-gray-100 border border-gray-200 px-4 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Role Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium ml-1 flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-500" />
                Role
              </label>
              <Input
                type="text"
                value={userInfo?.role || ""}
                disabled
                className="h-12 rounded-xl bg-gray-100 border border-gray-200 px-4 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Edit Profile Button */}
            <div className="pt-4">
              <Button
                // size="icon"
                className="w-full h-12 rounded-xl bg-custom-primary text-white flex items-center justify-center gap-2"
                onClick={handleBack}
              >
                Close Profile
              </Button>
            </div>
          </form>
        </div>

        {/* Bottom Navigation */}
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
            className="flex flex-col items-center h-auto gap-1 text-[#c83d15] hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            // onClick={h}
          >
            <User className="h-5 w-5 text-[#c83d15]" />
            <span className="text-xs font-medium">Profile</span>
          </Button>
          {/* <Button
          variant="ghost"
          size="icon"
          className="flex flex-col items-center h-auto gap-1 text-[#c83d15]"
        >
          <User className="h-5 w-5 text-gray-400" />
          <span className="text-xs text-gray-400">Profile</span>
        </Button> */}
        </div>

        {/* Home Indicator (for iOS-style) */}
        <div className="h-1 w-32 bg-gray-300 rounded-full mx-auto mb-2"></div>
      </div>
    </AdminProtectedRoute>
  );
}
