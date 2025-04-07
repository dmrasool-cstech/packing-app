"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
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
// import { Button } from "../components/ui/button";
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

  //   console.log(userInfo);
  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/all", {
        params: {
          role: userInfo.role,
          id: userInfo.id,
        },
      });
      const data = res.data;
      console.log(res.data);
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = orders.filter(
      (order) =>
        order.orderId.toLowerCase().includes(term) ||
        order.deliveryStatus.toLowerCase().includes(term) ||
        order.paymentStatus.toLowerCase().includes(term)
    );
    setFilteredOrders(filtered);
  }, [searchTerm, orders]);

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
              <div className="flex items-center mt-2">
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
                    <TableHead>Branch</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Delivery Status</TableHead>
                    <TableHead>Payment Status</TableHead>
                    {/* <TableHead className="text-right">Actions</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>{order.orderId}</TableCell>
                      <TableCell>{order.branch || "N/A"}</TableCell>
                      <TableCell>
                        {/* <ul className="list-disc pl-4"> */}
                        {order.orderItems || 0}

                        {/* </ul> */}
                      </TableCell>

                      <TableCell>{formatDate(order.orderDate)}</TableCell>
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
                      <TableCell>
                        <select
                          value={order.paymentStatus}
                          onChange={(e) =>
                            handlePaymentStatusChange(order._id, e.target.value)
                          }
                          className="border px-2 py-1 rounded text-sm"
                        >
                          <option value="paid">Paid</option>
                          <option value="pending">Pending</option>
                        </select>
                      </TableCell>
                      {/* <TableCell className="text-right text-sm text-gray-500"> */}
                      {/* Optional Actions */}
                      {/* <Link href={`/orders/view/${order._id}`}>
                          View Details
                        </Link> */}
                      {/* </TableCell> */}
                    </TableRow>
                  ))}
                  {filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
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
