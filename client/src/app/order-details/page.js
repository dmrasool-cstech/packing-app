"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Package,
  CreditCard,
  MapPin,
  Truck,
  Home,
  User,
  Calendar,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { useEffect, useState } from "react";
import API from "../utils/api";
// import ProtectedRoute from "../components/ProtectedRoute";
// import Error from "../components/Error";
import AdminProtectedRoute from "../components/adminProtectedRoute";
import { useAuth } from "../context/adminContext";
// import { toast } from "sonner";

export default function OrderDetailsPage() {
  const router = useRouter();
  const { userInfo } = useAuth();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  // const orderId = searchParams.id;
  // console.log(orderId);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!!orderId);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError("Order ID not found. Please provide a valid Order ID.");
      return;
    }

    const fetchOrderDetails = async () => {
      if (!orderId || !userInfo) return;
      try {
        setLoading(true);
        const res = await API.get(`/orders/${orderId}`, {
          params: {
            role: userInfo.role,
            id: userInfo.id,
          },
        });
        console.log(res.data);
        setOrder(res.data);
      } catch (err) {
        console.error(err || err?.response?.data?.message);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, userInfo]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  if (loading) return <p>Loading...</p>;

  if (!orderId)
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-2">
        <h2 className="text-lg font-semibold">Order ID not found</h2>
        <p>Please provide a valid Order ID.</p>
        <Button
          className="bg-custom-primary text-white px-3 py-1.5 "
          onClick={(e) => {
            e.preventDefault();
            handleBack();
          }}
        >
          Go Back
        </Button>
      </div>
    );

  if (error) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong while fetching the order.";

    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-2">
        <h2 className="text-lg font-semibold">Error</h2>
        <p>{errorMsg}</p>
        <Button
          className="bg-custom-primary text-white px-3 py-1.5"
          onClick={(e) => {
            e.preventDefault();
            handleBack();
          }}
        >
          Go Back
        </Button>
      </div>
    );
  }

  const handleDeliver = () => {
    // Navigate to customer details page
    router.push(`/customer-details?orderId=${orderId}`);
  };

  return (
    <AdminProtectedRoute>
      <div className="flex flex-col h-screen bg-white">
        {/* Status Bar */}
        {/* <div className="bg-black text-white px-4 py-1 flex justify-between items-center text-xs">
        <span>{currentTime}</span>
        <div className="flex items-center gap-1">
          <Signal className="h-3 w-3" />
          <Wifi className="h-3 w-3" />
          <Battery className="h-3 w-3" />
        </div>
      </div> */}

        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:text-[#0f172a] hover:bg-[#f1f5f9] cursor-pointer"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium">Order Details</h1>
          <div className="w-9"></div> {/* Empty div for spacing */}
        </div>

        {/* Main Content */}
        <div className="flex-1 px-5 py-6 overflow-auto">
          {/* Order Header */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-xl font-bold">Order : {order.orderId}</h2>
                <div className="flex items-center gap-1 text-gray-500 mt-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-semibold">
                    {new Date(order.orderDate).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                    })}
                  </span>
                </div>
              </div>
              <div className="bg-custom-primary/10 text-custom-primary px-3 py-1 rounded-full text-sm font-medium capitalize">
                {order.status}
              </div>
            </div>
            <div className="text-gray-700 mt-3">
              <span className="text-lg font-semibold">
                ₹{order.price || order.orderItems?.split("-")[1] || "N/A"}
              </span>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-5">
            <h3 className="font-semibold text-gray-800">Order Information</h3>

            <div className="space-y-4">
              {/* Payment Status */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <p className="font-medium capitalize">
                      {order.paymentStatus}
                    </p>
                  </div>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>

              {/* Delivery Status */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-custom-primary/10 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-custom-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Delivery Status</p>
                    <p className="font-medium capitalize">
                      {order.deliveryStatus}
                    </p>
                  </div>
                </div>
                <Clock className="h-5 w-5 text-custom-primary" />
              </div>

              {/* Customer Address */}
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-100">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Delivery Address</p>
                  <p className="font-medium capitalize">
                    {order.customer?.name || "John Doe"}
                  </p>
                  <p className="text-gray-600 text-sm mt-1 ">
                    {order?.address}
                  </p>
                </div>
              </div>

              {/* Package Details with Product Image */}
              <div className="p-4 bg-white rounded-lg border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Package Details</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="relative w-[100px] h-[100px] shrink-0 rounded-md overflow-hidden border border-gray-200">
                        <Image
                          src={
                            order.packageDetails?.image ||
                            "/images/product-image.webp"
                          }
                          alt="Maroon Velvet Embroidered Suit"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">
                          {order.packageDetails?.title || "N/A"}
                        </p>
                        {/* {order.orderItems.split("-")[1]} */}
                        <p className="text-custom-primary font-semibold text-sm">
                          ₹
                          {order.price ||
                            order.orderItems?.split("-")[1] ||
                            "N/A"}
                        </p>
                        <p className="text-gray-600 text-xs mt-1">
                          Qty:{" "}
                          {order.packageDetails?.quantity ||
                            order.orderItems?.split("-")[0] ||
                            "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="border-t px-5 py-4">
          <Button
            className="w-full h-12 rounded-xl bg-custom-primary hover:bg-custom-primary-dark text-white flex items-center justify-center gap-2"
            onClick={handleDeliver}
            disabled={
              order.paymentStatus.toLowerCase() === "pending" ||
              order.deliveryStatus.toLowerCase() === "delivered"
            }
          >
            <Truck className="h-5 w-5" />
            <span className="text-base font-medium">
              {order.deliveryStatus.toLowerCase() === "delivered"
                ? "Delivered"
                : "Deliver Now"}
            </span>
          </Button>
        </div>

        {/* Bottom Navigation */}
        <div className="border-t px-2 py-3 flex justify-around">
          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col items-center h-auto gap-1 bg-transparent text-custom-primary hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            onClick={() => router.push("/dashboard")}
          >
            <Home className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-400">Home</span>
          </Button>
          {/* <Button
            variant="ghost"
            size="icon"
            className="flex flex-col items-center h-auto gap-1 bg-transparent text-custom-primary hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <Package className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-400">Deliveries</span>
          </Button> */}
          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col items-center h-auto gap-1 text-custom-primary bg-transparent text-custom-primary hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <Truck className="h-5 w-5 text-custom-primary" />
            <span className="text-xs font-medium">Current</span>
          </Button>
          <Button
            variant="ghost"
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
