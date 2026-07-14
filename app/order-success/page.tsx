"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, ListChecks } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { useStore } from "../../context/StoreContext";
import { apiClient } from "../../utils/apiClient";

// Inner component that uses useSearchParams — must be inside <Suspense>
function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orders, setSessionInfo } = useStore();
  const [countdown, setCountdown] = useState(10);
  const [orderDetail, setOrderDetail] = useState<any>(null);

  const urlOrderIds = searchParams.get("order_ids") || searchParams.get("order_id");
  const idArray = urlOrderIds ? urlOrderIds.split(",") : [];

  useEffect(() => {
    if (idArray.length > 0 && !orderDetail) {
      // Just fetch the first one for validation or rely on global state
      apiClient.get(`get-orders.php?order_id=${idArray[0]}`)
        .then((res) => {
          if (res.status === "success" && res.data) {
            const d = Array.isArray(res.data) ? res.data[0] : res.data;
            if (d) setOrderDetail(d);
          }
        })
        .catch(() => {});
    }
  }, [urlOrderIds]);

  // Find all matching orders from context
  const matchedOrders = idArray.length > 0 
    ? orders.filter(o => idArray.includes(o.id.toString()))
    : [orders[0]].filter(Boolean);
    
  // If we couldn't find them in context yet, fallback to orderDetail
  const displayOrders = matchedOrders.length > 0 ? matchedOrders : (orderDetail ? [orderDetail] : []);

  useEffect(() => {
    if (countdown <= 0) {
      router.replace("/orders");
      return;
    }
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown, router]);

  useEffect(() => {
    // Cleanup: clear session since Order More is removed
    return () => {
      setSessionInfo("default", "", "0");
    };
  }, [setSessionInfo]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-bgBase min-h-screen text-center relative overflow-hidden">
      {/* Decorative blurred rings */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.5 }}
        transition={{ duration: 0.8 }}
        className="absolute w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-20"
      />

      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative z-10 w-28 h-28 bg-[#F0FDF4] border-4 border-[#BBF7D0] rounded-full flex items-center justify-center mb-8 shadow-lg shadow-green-100"
      >
        <Check size={48} className="text-green-500" strokeWidth={3} />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 w-full max-w-sm"
      >
        <h1 className="text-4xl font-black text-ink tracking-tight mb-2">
          {displayOrders.length > 1 ? "Orders Placed!" : "Order Placed!"}
        </h1>
        <p className="text-inkMid text-base mb-10 leading-relaxed">
          {displayOrders.length > 1 ? "Orders " : "Order "}
          <strong className="text-ink">
            {displayOrders.length > 0 
              ? displayOrders.map(o => `#${o.id}`).join(" and ") 
              : "N/A"}
          </strong>{" "}
          have been sent to the kitchen.
        </p>

        {/* Receipt Miniature */}
        <div className="bg-white border border-borderLite rounded-2xl p-6 mb-10 shadow-sm text-left">
          <div className="flex justify-between items-center mb-4 text-sm">
            <span className="text-inkMid font-medium">Total Items</span>
            <span className="font-bold text-ink">
              {displayOrders.reduce((total, o) => total + (o.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0), 0)}
            </span>
          </div>
          <div className="h-px border-t border-dashed border-gray-300 w-full mb-4" />
          <div className="flex justify-between items-center text-base">
            <span className="text-inkMid font-medium">Amount Charged</span>
            <span className="font-black text-xl text-primary">
              £{displayOrders.reduce((total, o) => total + (o.grandTotal || o.total || 0), 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => router.push("/orders")}
            className="w-full flex items-center justify-center gap-2 py-4 bg-accentLight text-primary border-2 border-primary/20 hover:bg-primary/10 transition-colors font-bold rounded-2xl"
          >
            <ListChecks size={20} />
            View Order
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white hover:bg-primaryHover transition-colors font-bold rounded-2xl shadow-lg"
          >
            Go to Dashboard
            <ArrowRight size={20} />
          </button>
        </div>

        <p className="text-xs text-inkLight mt-10 font-medium">
          Redirecting to history in {countdown}s…
        </p>
      </motion.div>
    </div>
  );
}

// Outer page wraps the content in Suspense (required by Next.js for useSearchParams)
export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-screen bg-bgBase">
        <div className="text-inkMid text-sm">Loading…</div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
