"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  // FlashlightOffIcon as FlashOff,
  // FlashlightIcon as Flash,
  Camera,
  // RotateCcw,
  Home,
  Package,
  User,
  QrCode,
  FileText,
  Search,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Separator } from "../components/ui/separator";
// import ProtectedRoute from "../components/ProtectedRoute";
import BarcodeScanner from "../components/BarcodeScanner";
import AdminProtectedRoute from "../components/adminProtectedRoute";
import { toast } from "sonner";
import API from "../utils/api";
import { useAuth } from "../context/adminContext";

export default function ScanPage() {
  const router = useRouter();
  const { userInfo } = useAuth();
  // const [flashOn, setFlashOn] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [scanned, setScanned] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (scanning) {
      const timer = setTimeout(() => {
        setScanning(false);
        setScanned(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [scanning]);

  const fetchOrderDetails = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await API.get(`/orders/${orderNumber}`, {
        params: {
          role: userInfo.role,
          id: userInfo.id,
        },
      });
      console.log(res);
      if (res?.data) {
        // Redirect to order details only if data is found
        router.push(`/order-details?orderId=${orderNumber}`);
      } else {
        toast.error("Order not found.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Order not found.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  return (
    <AdminProtectedRoute>
      <div className="flex flex-col h-screen bg-white">
        {/* <div className="bg-black text-white px-4 py-1 flex justify-between items-center text-xs">
        <span>{currentTime}</span>
        <div className="flex items-center gap-1">
          <Signal className="h-3 w-3" />
          <Wifi className="h-3 w-3" />
          <Battery className="h-3 w-3" />
        </div>
      </div> */}

        <div className="px-4 py-3 flex items-center justify-between border-b">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:text-[#0f172a] hover:bg-[#f1f5f9] cursor-pointer"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium">Find Order</h1>
          {/* <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:text-[#0f172a] hover:bg-[#f1f5f9] cursor-pointer"
            onClick={() => setFlashOn(!flashOn)}
          >
            {flashOn ? (
              <Flash className="h-5 w-5" />
            ) : (
              <FlashOff className="h-5 w-5" />
            )}
          </Button> */}
        </div>

        <div className="flex-1 overflow-auto">
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center gap-2 mb-3">
              <QrCode className="h-5 w-5 text-custom-primary" />
              <h2 className="font-medium">Scan Barcode</h2>
            </div>
            <p className="text-gray-500 text-sm text-center mb-2">
              Position the barcode within the frame to scan
            </p>
            {/* <QRScanner /> */}
            <BarcodeScanner />
            {/* <div className="relative w-full aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden border border-gray-100 mb-3">
            <div className="absolute inset-0 overflow-hidden">
              {scanning && (
                <div
                  className="absolute left-0 right-0 h-0.5 bg-custom-primary animate-[scan_2s_ease-in-out_infinite]"
                  style={{ boxShadow: "0 0 10px 2px rgba(200, 61, 21, 0.7)" }}
                />
              )}

              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-custom-primary" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-custom-primary" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-custom-primary" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-custom-primary" />
            </div>

            {scanned && (
              <div className="absolute inset-0 bg-white/90 flex items-center justify-center flex-col">
                <div className="h-14 w-14 rounded-full bg-custom-primary flex items-center justify-center mb-3">
                  <Camera className="h-7 w-7 text-white" />
                </div>
                <p className="text-gray-900 text-base font-bold mb-1">
                  Barcode Detected!
                </p>
                <p className="text-gray-600 text-sm mb-4">Package #A12345678</p>
                <Button
                  className="bg-custom-primary hover:bg-custom-primary-dark text-white"
                  onClick={() => router.push("/order-details")}
                >
                  Continue
                </Button>
              </div>
            )}
          </div> */}

            {/* <div className="flex justify-center gap-4 mb-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-gray-200 px-4"
                onClick={handleRescan}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Rescan
              </Button>
            </div> */}
          </div>

          <Separator className="my-2" />

          <div className="px-5 pt-3 pb-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-custom-primary" />
              <h2 className="font-medium">Manual Entry</h2>
            </div>

            <form onSubmit={fetchOrderDetails} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="orderNumber"
                  className="text-sm font-medium ml-1"
                >
                  Order Number
                </label>
                <Input
                  id="orderNumber"
                  placeholder="e.g., A12345678"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="h-12 rounded-xl bg-white border border-gray-200 px-4"
                  required
                />
                <p className="text-xs text-gray-500 ml-1">
                  Enter the order number printed on the package or invoice
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-custom-primary hover:bg-custom-primary-dark text-white flex items-center justify-center gap-2"
                disabled={isSubmitting || !orderNumber}
              >
                {isSubmitting ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <Search className="h-5 w-5" />
                )}
                <span className="text-base font-medium">
                  {isSubmitting ? "Searching..." : "Find Order"}
                </span>
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t px-2 py-3 flex justify-around">
          <Button
            className="bg-transparent text-custom-primary hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            size="icon"
            onClick={() => router.push("/dashboard")}
          >
            <Home className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-400">Home</span>
          </Button>
          <Button
            className="bg-transparent text-custom-primary hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            size="icon"
          >
            <Camera className="h-5 w-5 text-custom-primary" />
            <span className="text-xs font-medium">Scan</span>
          </Button>
          {/* <Button
            className="bg-transparent text-custom-primary hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            size="icon"
          >
            <Package className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-400">Deliveries</span>
          </Button> */}
          <Button
            className="bg-transparent text-custom-primary hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            size="icon"
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
