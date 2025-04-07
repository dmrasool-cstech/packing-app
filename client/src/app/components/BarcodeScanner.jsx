"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { useRouter } from "next/navigation";
import { Button } from "./buttonv1";
import { RotateCcw, Upload } from "lucide-react";

export default function BarcodeScanner() {
  const router = useRouter();
  const [orderId, setOrderId] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const imgRef = useRef(null);

  const codeReader = useRef(
    new BrowserMultiFormatReader(
      new Map([[DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]]])
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
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        streamRef.current = stream;
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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // const handleImageUpload = async (event) => {
  //   setError(null);
  //   const file = event.target.files[0];
  //   if (!file) return;

  //   const imageUrl = URL.createObjectURL(file);

  //   const originalImg = new Image();
  //   originalImg.src = imageUrl;

  //   originalImg.onload = async () => {
  //     try {
  //       // Step 1: Auto scale small images using canvas
  //       const minWidth = 300;
  //       const scaleFactor = originalImg.width < minWidth ? 2 : 1;

  //       const canvas = document.createElement("canvas");
  //       canvas.width = originalImg.width * scaleFactor;
  //       canvas.height = originalImg.height * scaleFactor;

  //       const ctx = canvas.getContext("2d");
  //       ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);

  //       // Step 2: Convert canvas to image
  //       const scaledImg = new Image();
  //       scaledImg.src = canvas.toDataURL();
  //       console.log(scaledImg.src);
  //       scaledImg.onload = async () => {
  //         try {
  //           const result = await codeReader.current.decodeFromImageElement(
  //             scaledImg
  //           );
  //           console.log(result);
  //           processScannedCode(result.getText());
  //         } catch (error) {
  //           console.error("Error decoding barcode from scaled image:", error);
  //           setError("Could not detect a barcode. Please try another image.");
  //         } finally {
  //           URL.revokeObjectURL(imageUrl); // clean up
  //         }
  //       };

  //       scaledImg.onerror = () => {
  //         setError("Failed to process the uploaded image.");
  //       };
  //     } catch (error) {
  //       console.error("Error decoding barcode from image:", error);
  //       setError("Could not detect a barcode. Please try another image.");
  //       URL.revokeObjectURL(imageUrl);
  //     }
  //   };

  //   originalImg.onerror = () => {
  //     setError("Failed to load the uploaded image.");
  //   };
  // };
  const handleImageUpload = async (event) => {
    console.log("click");
    setError(null);
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      if (imgRef.current) {
        imgRef.current.src = reader.result;
        console.log(imgRef.current.src);
        imgRef.current.onload = async () => {
          try {
            const result = await codeReader.current.decodeFromImageElement(
              imgRef.current
            );
            // console.log(result);
            processScannedCode(result.getText());
          } catch (error) {
            console.error("Error decoding barcode from image:", error);
            setError("Could not detect a barcode. Please try another image.");
            // alert("Could not detect a barcode. Please try another image.");
          }
        };
      }
    };
    reader.readAsDataURL(file);
  };
  const processScannedCode = (scannedCode) => {
    console.log(scannedCode);
    if (scannedCode.length >= 6) {
      setOrderId(scannedCode);
      router.push(`/order-details?orderId=${scannedCode}`);
    } else {
      setError("Invalid barcode detected. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-xl font-bold mb-4">Scan Barcode (EAN-13)</h1>

      <div className="relative w-full h-60 max-w-md">
        <video
          ref={videoRef}
          className="w-full h-full border border-gray-300 rounded-md object-cover"
        />
        <div className="absolute inset-0 border-4 border-dashed border-blue-500 rounded-md pointer-events-none" />
      </div>

      <img ref={imgRef} alt="Uploaded barcode" className="hidden" />

      {orderId && (
        <p className="mt-4 text-green-600 text-sm">
          ✅ Scanned Order ID: {orderId}
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
