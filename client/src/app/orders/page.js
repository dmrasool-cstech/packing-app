"use client";
import { useEffect, useState } from "react";
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
import { Search } from "lucide-react";
import { toast } from "sonner";
import AdminProtectedRoute from "../components/adminProtectedRoute";
import API from "../utils/api";
import { TopNavigation } from "../components/ui/TopNavigation";
import { useAuth } from "../context/adminContext";

const formatDate = (dateString) =>
  new Date(dateString)
    .toISOString()
    .split("T")[0]
    .split("-")
    .reverse()
    .join("-");

export default function OrdersPage() {
  const { userInfo } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    period: "",
    deliveryStatus: "",
    paymentStatus: "",
    branchCode: "",
  });
  // console.log("hello");
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get("/orders/all", {
        params: {
          role: userInfo.role,
          id: userInfo.id,
        },
      });
      const data = res.data;
      // console.log("data", data);
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      // toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
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
  }, [searchTerm, orders, filters]);

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

  return (
    <AdminProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <TopNavigation />
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
                {userInfo?.role === "packing_agent" ? (
                  ""
                ) : (
                  <>
                    {/* Filters */}
                    <select
                      className="border px-3 text-sm py-2 rounded-md"
                      value={filters.period}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          period: e.target.value,
                        }))
                      }
                    >
                      <option value="">All Time</option>
                      <option value="last7days">Last 7 Days</option>
                      <option value="thisMonth">This Month</option>
                    </select>
                    <select
                      className="border text-sm px-3 py-2 rounded-md"
                      value={filters.deliveryStatus}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          deliveryStatus: e.target.value,
                        }))
                      }
                    >
                      <option value="">All Delivery Status</option>
                      <option value="delivered">Delivered</option>
                      <option value="not delivered">Not Delivered</option>
                    </select>
                    <select
                      className="border text-sm px-3 py-2 rounded-md"
                      value={filters.paymentStatus}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          paymentStatus: e.target.value,
                        }))
                      }
                    >
                      <option value="">All Payment Status</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                    </select>
                  </>
                )}
                {userInfo?.role === "branch_manager" ||
                userInfo?.role === "packing_agent" ? (
                  ""
                ) : (
                  <select
                    className="border text-sm px-3 py-2 rounded-md"
                    value={filters.branchCode}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        branchCode: e.target.value,
                      }))
                    }
                  >
                    <option value="">All Branches</option>
                    {[
                      ...new Set(
                        orders.map((o) => o.branchCode).filter(Boolean)
                      ),
                    ].map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                )}
                {userInfo?.role === "packing_agent" ? (
                  ""
                ) : (
                  <button
                    className="text-sm text-[#c83d15]  border border-[#c83d15] px-3 py-2 rounded-md"
                    onClick={() =>
                      setFilters({
                        period: "",
                        deliveryStatus: "",
                        paymentStatus: "",
                        branchCode: "",
                      })
                    }
                  >
                    Reset Filters
                  </button>
                )}
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
                            className="border px-2 py-1 rounded text-sm"
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
