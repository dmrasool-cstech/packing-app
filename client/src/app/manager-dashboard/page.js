"use client";
import { TopNavigation } from "../components/ui/TopNavigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Users, ArrowRight, Package } from "lucide-react";
import Link from "next/link";
import API from "../utils/api";
import { useEffect, useState } from "react";
import { useAuth } from "../context/adminContext";
// import { useRouter } from "next/navigation";

import AdminProtectedRoute from "../components/adminProtectedRoute";

export default function Dashboard() {
  const { userInfo } = useAuth();
  // const router = useRouter();
  const [userStats, setUserStats] = useState({
    activeUsers: 0,
    percentageActive: "0%",
  });
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    paidOrders: 0,
    percentagePaid: "0%",
  });

  useEffect(() => {
    // Fetch active users count
    const fetchUserStats = async () => {
      try {
        const res = await API.get("/auth/users/active-count", {
          params: {
            role: userInfo.role,
            id: userInfo.id,
          },
        });
        // console.log(res);
        setUserStats(res.data);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };

    // Fetch active branches count

    const fetchOrderStats = async () => {
      try {
        const res = await API.get("/orders/order-count", {
          params: {
            role: userInfo.role,
            id: userInfo.id,
          },
        });
        setOrderStats(res.data);
      } catch (error) {
        console.error("Error fetching order stats:", error);
      }
    };

    fetchUserStats();
    fetchOrderStats();
  }, []);

  return (
    <AdminProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <TopNavigation />
        <main className="flex-1 container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-8">Welcome to Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Users Card */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-[#D84315]/10 p-3 rounded-full">
                  <Users className="h-8 w-8 text-[#D84315]" />
                </div>
                <div>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>Manage system users</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-bold text-[#D84315]">
                      {userStats.activeUsers}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      Active Users
                    </span>
                  </div>
                  <div className="bg-green-100 px-3 py-1 rounded-full">
                    <span className="text-sm text-green-800">
                      {userStats.percentageActive} Active
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  asChild
                >
                  <Link href="/users">
                    Manage Users
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Order Card */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-[#D84315]/10 p-3 rounded-full">
                  <Package className="h-8 w-8 text-[#D84315]" />
                </div>
                <div>
                  <CardTitle>Orders</CardTitle>
                  <CardDescription>Track all orders</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-bold text-[#D84315]">
                      {orderStats.paidOrders}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      Paid Orders
                    </span>
                  </div>
                  <div className="bg-green-100 px-3 py-1 rounded-full">
                    <span className="text-sm text-green-800">
                      {orderStats.percentagePaid} Paid
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  asChild
                >
                  <Link href="/orders">
                    View Orders
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
        <footer className="bg-gray-100 py-4 border-t">
          <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
            Copyright © 2025 Meenabazaar. All rights reserved.
          </div>
        </footer>
      </div>
    </AdminProtectedRoute>
  );
}
