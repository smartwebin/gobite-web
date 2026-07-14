"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Camera, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

export default function QRScannerPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [error, setError] = useState<string>("");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrameId: number;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        
        setHasPermission(true);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Play inline required for iOS
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.play();
          
          requestAnimationFrame(tick);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setHasPermission(false);
        setError("Camera access was denied or is unavailable.");
      }
    };

    const tick = () => {
      if (!scanning) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        // Match canvas dimensions to video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Use jsQR to decode
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          
          if (code && code.data) {
            handleScan(code.data);
            return; // Stop scanning once we get a result
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(tick);
    };

    startCamera();

    return () => {
      setScanning(false);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [scanning]);

  const handleScan = (data: string) => {
    setScanning(false);
    try {
      // The scanned data might be a full URL like: https://gobite.com/?token=XYZ
      // Or just a token string
      let token = data;
      
      try {
        const url = new URL(data);
        const urlToken = url.searchParams.get("token") || url.searchParams.get("t");
        if (urlToken) {
          token = urlToken;
        } else {
          // If it's a URL but doesn't have a token, maybe it's our base url with restaurant_id?
          const restId = url.searchParams.get("restaurant_id");
          const table = url.searchParams.get("table");
          if (restId) {
            router.replace(`/?restaurant_id=${restId}${table ? `&table=${table}` : ''}`);
            return;
          }
        }
      } catch (e) {
        // Not a valid URL, treat as raw token
      }

      // Redirect back to home with the token so the initStore/verify logic can handle it
      router.replace(`/?token=${token}`);
    } catch (e) {
      console.error("Scan error", e);
      setError("Invalid QR code format.");
      setTimeout(() => setScanning(true), 2000); // Resume scanning after error
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-bgBase min-h-screen relative">
      {/* Header */}
      <div className="pt-6 pb-4 px-6 flex items-center justify-between z-10 relative bg-bgBase">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-borderLite hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={20} className="text-ink" />
        </button>
        <h1 className="text-lg font-black text-ink tracking-tight">Scan QR</h1>
        <div className="w-10 h-10" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 pb-8 items-center pt-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl font-black text-ink">Scan Table QR</h2>
          <p className="text-sm text-inkMid">Center the QR code on your table inside the frame</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-sm aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
        >
          {/* Video Stream */}
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover"
            muted
            playsInline
          />
          
          {/* Hidden Canvas for processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanner Overlay UI */}
          <div className="absolute inset-0 border-[40px] border-black/40" />
          
          {/* Corner brackets */}
          <div className="absolute top-10 left-10 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-xl" />
          <div className="absolute top-10 right-10 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-xl" />
          <div className="absolute bottom-10 left-10 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-xl" />
          <div className="absolute bottom-10 right-10 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-xl" />

          {/* Scanning line animation */}
          {scanning && !error && hasPermission && (
            <motion.div 
              animate={{ y: ["0%", "300%", "0%"] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
              className="absolute top-[20%] left-[15%] right-[15%] h-0.5 bg-primary shadow-[0_0_8px_2px_rgba(255,107,53,0.6)]"
            />
          )}

          {/* Permission or Error states */}
          {hasPermission === false && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-6 text-center space-y-4">
              <Camera size={40} className="text-white/50" />
              <p className="text-white font-medium">Camera access required</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-primary text-white rounded-full font-bold text-sm"
              >
                Enable Camera
              </button>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-6 text-center space-y-4">
              <ShieldAlert size={40} className="text-red-500" />
              <p className="text-white font-medium text-sm">{error}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
