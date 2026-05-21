"use client";

import { AnimatePresence, motion } from "framer-motion";
import jsQR from "jsqr";
import { X, Camera, QrCode, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type ScanState = "idle" | "requesting" | "scanning" | "found" | "error";

export function QrScannerModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const [scanState, setScanState] = useState<ScanState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [foundToken, setFoundToken] = useState("");

  /* ── Stop camera & cancel RAF loop ── */
  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  /* ── Close handler ── */
  const handleClose = useCallback(() => {
    stopCamera();
    setScanState("idle");
    setErrorMsg("");
    setFoundToken("");
    onClose();
  }, [stopCamera, onClose]);

  /* ── Extract token from QR text ──
     Supports:
       https://gobite-web.vercel.app/?token=abc123
       https://gobite-web.vercel.app/?t=abc123
       Any URL with ?token= or ?t=
       Raw token string (no slashes)
  */
  const extractToken = (text: string): string | null => {
    try {
      const url = new URL(text);
      return url.searchParams.get("token") || url.searchParams.get("t");
    } catch {
      // Not a URL — treat as raw token if it looks like one
      if (/^[a-zA-Z0-9_-]{8,}$/.test(text.trim())) return text.trim();
      return null;
    }
  };

  /* ── Handle a decoded QR string ── */
  const handleQrResult = useCallback(
    (text: string) => {
      const token = extractToken(text);
      if (!token) return; // not a valid GoBite QR
      if (scanState === "found") return; // already handled

      setScanState("found");
      setFoundToken(token);
      stopCamera();

      // Short delay for the "found" animation, then navigate
      setTimeout(() => {
        handleClose();
        router.push(`/?token=${encodeURIComponent(token)}`);
      }, 700);
    },
    [scanState, stopCamera, handleClose, router]
  );

  /* ── jsQR canvas scanning loop ── */
  const startJsQrLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const tick = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        if (code?.data) {
          handleQrResult(code.data);
          return; // stop loop
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [handleQrResult]);

  /* ── Start camera ── */
  const startCamera = useCallback(async () => {
    setScanState("requesting");
    setErrorMsg("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setScanState("scanning");
      startJsQrLoop();
    } catch (err: any) {
      setScanState("error");
      if (err.name === "NotAllowedError") {
        setErrorMsg("Camera permission denied. Please allow camera access and try again.");
      } else if (err.name === "NotFoundError") {
        setErrorMsg("No camera found on this device.");
      } else {
        setErrorMsg("Could not start camera: " + (err.message || "Unknown error"));
      }
    }
  }, [startJsQrLoop]);

  /* ── Start/stop on open/close ── */
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setScanState("idle");
      setErrorMsg("");
      setFoundToken("");
    }
    return () => stopCamera();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#111] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
            style={{ maxHeight: "90vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-2">
                <QrCode size={20} className="text-primary" />
                <span className="text-white font-bold text-base">Scan Table QR</span>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X size={16} className="text-white" />
              </button>
            </div>

            {/* Viewfinder */}
            <div className="relative mx-4 mb-4 rounded-2xl overflow-hidden bg-black aspect-[4/3]">
              {/* Video feed */}
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
                muted
                autoPlay
              />

              {/* Hidden canvas for jsQR processing */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Overlay — scanning crosshair */}
              {scanState === "scanning" && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Corner guides */}
                  <div className="relative w-52 h-52">
                    {/* Top-left */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                    {/* Top-right */}
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                    {/* Bottom-left */}
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                    {/* Bottom-right */}
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />

                    {/* Scanning line */}
                    <motion.div
                      className="absolute left-2 right-2 h-0.5 bg-primary shadow-[0_0_8px_rgba(255,107,53,0.8)]"
                      animate={{ top: ["8px", "calc(100% - 8px)", "8px"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              )}

              {/* Found flash */}
              {scanState === "found" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-primary/30 flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring" }}
                    className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg"
                  >
                    <QrCode size={36} className="text-white" />
                  </motion.div>
                </motion.div>
              )}

              {/* Requesting permission overlay */}
              {scanState === "requesting" && (
                <div className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-white/60 text-sm">Requesting camera access…</p>
                </div>
              )}

              {/* Error overlay */}
              {scanState === "error" && (
                <div className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <AlertCircle size={36} className="text-red-400" />
                  <p className="text-white/80 text-sm leading-relaxed">{errorMsg}</p>
                  <button
                    onClick={startCamera}
                    className="mt-2 bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-primaryHover transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>

            {/* Hint */}
            <div className="px-5 pb-6 text-center">
              {scanState === "scanning" && (
                <p className="text-white/50 text-xs">
                  Point the camera at the <span className="text-primary font-semibold">Web App QR</span> on your table to get started
                </p>
              )}
              {scanState === "found" && (
                <p className="text-primary font-semibold text-sm animate-pulse">
                  QR detected — loading your table…
                </p>
              )}
              {scanState === "idle" && (
                <p className="text-white/40 text-xs">Initialising…</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
