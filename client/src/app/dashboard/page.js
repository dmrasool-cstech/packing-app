"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  TrendingUp,
  // Bell,
  User,
  Home,
  // List,
  Plus,
  LogOut,
  // Link,
} from "lucide-react";
import { Button } from "../components/ui/button";
import API from "../utils/api";
// import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/adminContext";
import AdminProtectedRoute from "../components/adminProtectedRoute";

export default function DashboardPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [todaysOrders, setTodaysOrders] = useState([]); // Stores today's orders
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  // const [showOrders, setShowOrders] = useState(true); // Toggle state

  // Get current date for greeting
  const today = new Date();
  const dateOptions = { weekday: "long", month: "long", day: "numeric" };
  const formattedDate = today.toLocaleDateString("en-US", dateOptions);

  // Fetch today's orders on mount
  useEffect(() => {
    async function fetchTodaysOrders() {
      try {
        const res = await API.get("/orders/today");
        setTodaysOrders(res.data);
        // console.log(res.data);
      } catch (error) {
        console.error("Error fetching today's orders:", error);
      }
    }
    fetchTodaysOrders();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <AdminProtectedRoute>
      <div className="flex flex-col h-screen bg-white">
        {/* App Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b">
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <div className="flex items-center gap-2">
            {/* <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:text-[#0f172a] hover:bg-[#f1f5f9] cursor-pointer"
            >
              <Bell className="h-5 w-5" />
            </Button> */}
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:text-[#0f172a] hover:bg-[#f1f5f9] cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <User className="h-5 w-5" />
              </Button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg">
                  <button
                    onClick={() => {
                      logout();
                      router.push("/login");
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-5 pt-6 pb-4 overflow-auto">
          {/* Greeting Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Welcome Back</h2>
            <p className="text-gray-500 font-semibold">{formattedDate}</p>
          </div>

          {/* Stats Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Today's Overview</h3>
              {/* <TrendingUp className="h-4 w-4 text-custom-primary" /> */}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-gray-500 text-sm">Total Orders</p>
                <p className="text-xl font-bold">{todaysOrders.length}</p>
              </div>
              {/* <div className="flex-1">
                <p className="text-gray-500 text-sm">Earnings</p>
                <p className="text-xl font-bold">₹120</p>
              </div> */}
              <div className="flex-1">
                <p className="text-gray-500 text-sm">Rating</p>
                <p className="text-xl font-bold">4.8</p>
              </div>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="space-y-4">
            {/* <Button
            className="w-full h-16 rounded-xl bg-white border-2 border-custom-primary text-custom-primary hover:bg-gray-50 flex items-center justify-center gap-3"
            // onClick={() => setShowOrders(!showOrders)}
          >
            <List className="h-5 w-5" />
            <span className="text-base font-medium">View Today's Orders</span>
          </Button> */}

            <Button
              className="w-full h-16 rounded-xl bg-custom-primary text-white flex items-center justify-center gap-3"
              onClick={() => router.push("/scan")}
            >
              <Plus className="h-5 w-5" />
              <span className="text-base font-medium">Deliver Now</span>
            </Button>
          </div>

          {/* Orders List (Only Today's Orders) */}
        </div>

        {/* Bottom Navigation */}
        <div className="border-t px-2 py-3 flex justify-around">
          <Button
            size="icon"
            className="flex flex-col items-center h-auto gap-1 bg-transparent text-custom-primary hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <Home className="h-5 w-5 text-custom-primary" />
            <span className="text-xs font-medium text-custom-primary">
              Home
            </span>
          </Button>
          <Button
            size="icon"
            className="flex flex-col items-center h-auto gap-1 bg-transparent text-custom-primary hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            // onClick={() => router.push("/orders")}
          >
            <Package className="h-5 w-5 text-gray-400" />
            <span to="/orders" className="text-xs text-gray-400">
              Orders
            </span>
          </Button>
          <Button
            size="icon"
            className="flex flex-col items-center h-auto gap-1 bg-transparent text-custom-primary hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
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
