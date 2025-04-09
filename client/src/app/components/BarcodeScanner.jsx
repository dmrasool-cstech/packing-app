"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { useRouter } from "next/navigation";
import { RotateCcw, Upload, ZoomIn } from "lucide-react";
import { Button } from "./buttonv1"; // Replace with your button or use <button>
import { toast } from "sonner";
import API from "../utils/api";
import { useAuth } from "../context/adminContext";

export default function BarcodeScanner() {
  const router = useRouter();
  const { userInfo } = useAuth();
  const [orderId, setOrderId] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [zoomRange, setZoomRange] = useState({ min: 1, max: 1, step: 0.1 });
  const [hasProcessed, setHasProcessed] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const imgRef = useRef(null);
  const zoomTrackRef = useRef(null);

  const codeReader = useRef(
    new BrowserMultiFormatReader(
      new Map([
        [
          DecodeHintType.POSSIBLE_FORMATS,
          [
            BarcodeFormat.CODE_128,
            BarcodeFormat.CODE_39,
            BarcodeFormat.EAN_13,
            BarcodeFormat.QR_CODE,
          ],
        ],
      ])
    )
  );

  useEffect(() => {
    startScanning();
    return () => stopScanning();
  }, []);

  const startScanning = async () => {
    setOrderId(null);
    setError(null);
    setIsScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          zoom: true,
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        streamRef.current = stream;
      }

      // Check for zoom support
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();
      const settings = videoTrack.getSettings();
      zoomTrackRef.current = videoTrack;

      if (capabilities.zoom) {
        setZoomRange({
          min: capabilities.zoom.min,
          max: capabilities.zoom.max,
          step: capabilities.zoom.step || 0.1,
        });
        setZoom(settings.zoom || 1);
      }

      codeReader.current.decodeFromVideoElement(
        videoRef.current,
        (result, err) => {
          if (result) {
            processScannedCode(result.getText());
            stopScanning();
          } else if (err) {
            console.warn("Scanning...");
          }
        }
      );
    } catch (error) {
      console.error("Error starting barcode scanner:", error);
      setError("Camera access denied. Please allow camera permissions.");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setHasProcessed(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleZoomChange = async (e) => {
    const newZoom = parseFloat(e.target.value);
    setZoom(newZoom);
    try {
      await zoomTrackRef.current?.applyConstraints({
        advanced: [{ zoom: newZoom }],
      });
    } catch (err) {
      console.warn("Zoom adjustment failed:", err);
    }
  };

  const handleImageUpload = async (event) => {
    setError(null);
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      if (imgRef.current) {
        imgRef.current.src = reader.result;
        imgRef.current.onload = async () => {
          try {
            const result = await codeReader.current.decodeFromImageElement(
              imgRef.current
            );
            processScannedCode(result.getText());
          } catch (error) {
            console.error("Error decoding barcode from image:", error);
            setError("Could not detect a barcode. Please try another image.");
          }
        };
      }
    };
    reader.readAsDataURL(file);
  };

  const processScannedCode = (scannedCode) => {
    // console.log(scannedCode);
    if (hasProcessed) return;
    if (scannedCode.length >= 6) {
      setOrderId(scannedCode);
      setHasProcessed(true);
      fetchOrderDetails(scannedCode);
    } else {
      setError("Invalid barcode detected. Please try again.");
    }
  };

  const fetchOrderDetails = async (code) => {
    // e.preventDefault();
    // setIsSubmitting(true);

    try {
      const res = await API.get(`/orders/${code}`, {
        params: {
          role: userInfo.role,
          id: userInfo.id,
        },
      });

      if (res?.data) {
        // Redirect to order details only if data is found
        router.push(`/order-details?orderId=${code}`);
      } else {
        toast.error("Order not found.");
        setHasProcessed(false);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Order not found.");
      setHasProcessed(false);
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-xl font-bold mb-4">Scan Barcode (EAN-13, QR etc.)</h1>

      <div className="relative w-full h-60 max-w-md">
        <video
          ref={videoRef}
          className="w-full h-full border border-gray-300 rounded-md object-cover"
        />
        <div className="absolute inset-0 border-4 border-dashed border-blue-500 rounded-md pointer-events-none" />
      </div>

      {zoomRange.max > zoomRange.min && (
        <div className="flex items-center gap-2 mt-4 w-full max-w-md">
          <ZoomIn className="w-4 h-4" />
          <input
            type="range"
            min={zoomRange.min}
            max={zoomRange.max}
            step={zoomRange.step}
            value={zoom}
            onChange={handleZoomChange}
            className="w-full"
          />
        </div>
      )}

      <img ref={imgRef} alt="Uploaded barcode" className="hidden" />

      {orderId && (
        <p className="mt-4 text-green-600 text-sm">
          Scanned Order ID: {orderId}
        </p>
      )}
      {error && (
        <div className="text-center mt-2 p-2 text-[#c83d15] text-sm rounded-md">
          {error}
        </div>
      )}
      {isScanning && (
        <div className="mt-2 text-sm text-gray-500 animate-pulse">
          Looking for barcode...
        </div>
      )}

      <div className="flex justify-center gap-4 mb-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-gray-200 px-4 cursor-pointer"
          onClick={startScanning}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Rescan
        </Button>

        <label className="relative cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-gray-200 px-4"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Barcode
          </Button>
        </label>
      </div>
    </div>
  );
}
