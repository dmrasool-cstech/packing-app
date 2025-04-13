"use client";
import { useEffect, useRef, useState } from "react";
// import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { LogOut, Search, User } from "lucide-react";
import { toast } from "sonner";
import AdminProtectedRoute from "../components/adminProtectedRoute";
import API from "../utils/api";
// import { To pNavigation } from "../components/ui/TopNavigation";
import { useAuth } from "../context/adminContext";
import Image from "next/image";
import { Button } from "../components/ui/button";
import Link from "next/link";

const formatDate = (dateString) =>
  new Date(dateString)
    .toISOString()
    .split("T")[0]
    .split("-")
    .reverse()
    .join("-");

export default function TodayOrderspage() {
  const { userInfo, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [filters, setFilters] = useState({
    period: "",
    deliveryStatus: "",
    paymentStatus: "",
    branchCode: "",
  });

  useEffect(() => {
    async function fetchTodaysOrders() {
      setLoading(true);
      try {
        const res = await API.get("/orders/today", {
          params: {
            role: userInfo.role,
            id: userInfo.id,
          },
        });
        // console.log(res.data);
        setOrders(res.data.todayOrders);
        // console.log(res.data);
      } catch (error) {
        console.error("Error fetching today's orders:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTodaysOrders();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const now = new Date();

    const filtered = orders.filter((order) => {
      const orderDate = new Date(order.orderDate);

      let isWithinPeriod = true;
      if (filters.period === "last7days") {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        isWithinPeriod = orderDate >= sevenDaysAgo;
      } else if (filters.period === "thisMonth") {
        isWithinPeriod =
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear();
      }

      return (
        (order.orderId.toLowerCase().includes(term) ||
          order.branchName.toLowerCase().includes(term) ||
          order.branchCode.toLowerCase().includes(term) ||
          order.deliveryStatus.toLowerCase().includes(term) ||
          order.paymentStatus.toLowerCase().includes(term)) &&
        (!filters.deliveryStatus ||
          order.deliveryStatus === filters.deliveryStatus) &&
        (!filters.paymentStatus ||
          order.paymentStatus === filters.paymentStatus) &&
        (!filters.branchCode || order.branchCode === filters.branchCode) &&
        isWithinPeriod
      );
    });

    setFilteredOrders(filtered);
  }, [searchTerm, orders, filters]); //filters will be there here

  const handlePaymentStatusChange = async (id, newStatus) => {
    try {
      await API.patch(`/orders/update/${id}`, { paymentStatus: newStatus });
      const updated = orders.map((order) =>
        order._id === id ? { ...order, paymentStatus: newStatus } : order
      );
      setOrders(updated);
      setFilteredOrders(updated);
      toast.success("Payment status updated.");
    } catch (error) {
      console.error("Failed to update payment status:", error);
      toast.error("Update failed.");
    }
  };

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
  const formatToIST = (utcDateTime) => {
    if (!utcDateTime) return "N/A";

    const date = new Date(utcDateTime);
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
  };
  return (
    <AdminProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <div className="px-4 py-3 flex items-center justify-between border-b bg-[#c83d15] text-white">
          {/* <h1 className="text-lg font-semibold">Dashboard</h1> */}
          <div className="relative h-10 w-auto">
            <Link href="/dashboard">
              <Image
                src="/images/meena-bazaar-logo.png"
                alt="Meena Bazaar"
                className="h-10 w-auto"
                width={100} // or actual pixel width
                height={40} // adjust according to your design
              />
            </Link>
          </div>
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
                <User className="h-10 w-10" />
              </Button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg">
                  <button
                    onClick={() => {
                      logout();
                      router.push("/login");
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Manage Orders</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
              <div className="flex items-center mt-2 flex-wrap gap-4">
                {/* Search Input */}
                <div className="relative max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-[300px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Order Info</TableHead>
                    <TableHead>Branch Info</TableHead>
                    {/* <TableHead>Customer Info</TableHead> */}
                    <TableHead>Delivery Status</TableHead>
                    <TableHead>Delivery Info</TableHead>
                    <TableHead>Payment Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-6 text-gray-500"
                      >
                        Loading orders...
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id || order._id}>
                        <TableCell>{order.orderId || "N/A"}</TableCell>
                        <TableCell className="text-sm leading-relaxed space-y-1">
                          <div>
                            <strong>Items:</strong> {order.orderItems || 0}
                          </div>
                          <div>
                            <strong>Amount:</strong> ₹
                            {order.orderAmount ||
                              order.orderItems.split("-")[1] ||
                              "N/A"}
                          </div>
                          <div>
                            <strong>Date:</strong> {order.orderDate || "N/A"}
                          </div>
                          <div>
                            <strong>Time:</strong> {order.orderTime || "N/A"}
                          </div>
                          <div>
                            <strong>Name:</strong> {order.orderName || "N/A"}
                          </div>
                          <div>
                            <strong>Email:</strong> {order.orderEmail || "N/A"}
                          </div>
                          <div>
                            <strong>Mobile:</strong> {order.orderPhone || "N/A"}
                          </div>
                        </TableCell>

                        <TableCell className="text-sm leading-relaxed space-y-1">
                          <div>
                            <strong>Name:</strong> {order.branchName || "N/A"}
                          </div>
                          <div>
                            <strong>Code:</strong> {order.branchCode || "N/A"}
                          </div>
                        </TableCell>

                        {/* <TableCell className="text-sm leading-relaxed space-y-1">
                        <div>
                          <strong>Name:</strong> {order.orderName || "N/A"}
                        </div>
                        <div>
                          <strong>Email:</strong> {order.orderEmail || "N/A"}
                        </div>
                        <div>
                          <strong>Mobile:</strong> {order.orderPhone || "N/A"}
                        </div>
                      </TableCell> */}
                        <TableCell>
                          <Badge
                            className={`capitalize ${
                              order.deliveryStatus === "delivered"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.deliveryStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm leading-relaxed space-y-1">
                          {/* <div>
                          <strong>Status:</strong>{" "}
                          <Badge
                            className={`capitalize ${
                              order.deliveryStatus === "delivered"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.deliveryStatus}
                          </Badge>
                        </div> */}
                          <div>
                            <strong>By:</strong> {order.deliveredBy || "N/A"}
                          </div>
                          <div>
                            <strong>Date:</strong> {order.deliveryDate || "N/A"}
                          </div>
                          <div>
                            <strong>Time:</strong> {order.deliveryTime || "N/A"}
                          </div>
                          <div>
                            <strong>Name:</strong> {order.deliveryName || "N/A"}
                          </div>
                          <div>
                            <strong>Email:</strong>{" "}
                            {order.deliveryEmail || "N/A"}
                          </div>
                          <div>
                            <strong>Mobile:</strong>{" "}
                            {order.deliveryMobile || "N/A"}
                          </div>
                        </TableCell>

                        <TableCell>
                          <select
                            value={order.paymentStatus}
                            onChange={(e) =>
                              handlePaymentStatusChange(
                                order._id,
                                e.target.value
                              )
                            }
                            className="border px-2 py-1 rounded text-sm cursor-not-allowed"
                            disabled={userInfo?.role === "packing_agent"}
                          >
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                          </select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}

                  {filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-6 text-gray-500"
                      >
                        No orders found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
        <footer className="bg-gray-100 py-4 border-t">
          <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
            © 2025 Meenabazaar. All rights reserved.
          </div>
        </footer>
      </div>
    </AdminProtectedRoute>
  );
}
