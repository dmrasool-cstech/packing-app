"use client"; // Ensure client-side execution

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import API from "../utils/api";
import { useRouter } from "next/navigation";
import { Button } from "./buttonv1";
import { RotateCcw } from "lucide-react";

export default function BarcodeScanner() {
  const router = useRouter();
  const [orderId, setOrderId] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    startScanning();
    return () => stopScanning();
  }, []);

  const startScanning = async () => {
    setOrderId(null);
    setIsScanning(true);

    try {
      const devices = await codeReader.current.listVideoInputDevices();
      if (devices.length === 0) {
        console.error("No camera found");
        setIsScanning(false);
        return;
      }

      await codeReader.current.decodeFromVideoDevice(
        devices[0].deviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
            const scannedCode = result.getText();
            if (scannedCode.length === 13) {
              setOrderId(scannedCode);
              handleWebhook(scannedCode);
              router.push(`/order-details?orderId=${scannedCode}`);
              stopScanning();
            }
          }
          if (err) {
            console.warn("Barcode not detected yet...");
          }
        }
      );
    } catch (error) {
      console.error("Error starting barcode scanner:", error);
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    codeReader.current.reset();
    setIsScanning(false);
  };

  const handleWebhook = async (orderId) => {
    try {
      const response = await API.post("/orders/webhook/barcode-scan", {
        orderId,
      });
      console.log("Webhook Response:", response.data);
    } catch (error) {
      console.error("🚨 Webhook Error:", error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-xl font-bold mb-4">Scan Barcode (EAN-13)</h1>
      <video
        ref={videoRef}
        className="mt-4 w-full h-60 border border-gray-300"
      ></video>
      {orderId && <p className="mt-4">Scanned Order ID: {orderId}</p>}
      <div className="flex justify-center gap-4 mb-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-gray-200 px-4"
          onClick={startScanning}
          disabled={isScanning}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Rescan
        </Button>
      </div>
    </div>
  );
}
