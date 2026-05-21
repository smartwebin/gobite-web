"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Plus,
  Store,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Header } from "../../components/ui/Header";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useStore } from "../../context/StoreContext";
import { Order } from "../../utils/types";

export default function OrdersPage() {
  const router = useRouter();
  const { orders, setActiveOrder, removeOrderItem, fetchOrders, updateOrderStatus } = useStore();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(
    orders[0]?.id || null,
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleAddItems = (orderId: string) => {
    setActiveOrder(orderId);
    router.push("/menu");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (orders.length === 0) {
    return (
      <div className="flex-1 flex flex-col bg-bgBase min-h-screen">
        <Header title="Your Orders" showBack />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Clock size={40} className="text-inkLight" />
          </div>
          <h2 className="text-2xl font-black text-ink tracking-tight mb-2">
            No past orders
          </h2>
          <p className="text-inkMid text-sm mb-8 leading-relaxed">
            It looks like you haven't placed any orders with us yet.
          </p>
          <button
            onClick={() => router.push("/menu")}
            className="bg-primary hover:bg-primaryHover text-white font-bold py-4 px-10 rounded-2xl shadow-lg transition-transform active:scale-[0.98]"
          >
            Start Ordering
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-bgBase min-h-screen">
      <Header title="Order History" showBack />

      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-4 pb-12">
        {orders.map((order, index) => {
          const isExpanded = expandedOrder === order.id;
          const isActive =
            order.status === "pending" ||
            order.status === "preparing" ||
            order.status === "ready";
          const d = new Date(order.date);
          const dateString = d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          const timeString = d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-2xl border transition-all overflow-hidden ${isActive ? "border-primary/30 shadow-[0_4px_20px_rgba(255,107,53,0.1)]" : "border-borderLite shadow-sm"} `}
            >
              {/* Order Header (Clickable) */}
              <div
                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                className="w-full text-left p-4 flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-primary mb-1">
                    <Store size={14} />
                    <span className="font-bold text-sm text-ink">
                      {order.restaurantName || "Restaurant"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-inkLight">#{order.id}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(order.id);
                      }}
                      className="text-primary hover:text-primaryHover p-1"
                      aria-label="Copy order ID"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                  <p className="text-xs text-inkLight">
                    {dateString} · Table{" "}
                    <strong className="text-ink">{order.tableNumber}</strong>
                  </p>

                  {isActive && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-primary">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                      Live Tracking
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 text-right">
                  <StatusBadge status={order.status} />
                  <span className="font-black text-lg text-ink">
                    £{(order.grandTotal || order.total).toFixed(2)}
                  </span>
                  <div className="text-inkLight mt-1">
                    {isExpanded ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </div>
                </div>
              </div>

              {/* Collapsible Details */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  className="px-4 pb-4 border-t border-borderLite pt-4 bg-[#FAFAFA]"
                >
                  <div className="space-y-3 mb-4">
                    {order.items.map((item) => {
                      const isRemoved =
                        item.status === "removed" ||
                        item.status === "unavailable";
                      return (
                        <div
                          key={item.cartId}
                          className="flex justify-between items-start"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center flex-shrink-0 text-xs font-bold text-inkMid mt-0.5">
                              {item.quantity}x
                            </div>
                            <div>
                              <p
                                className={`font-semibold text-sm truncate ${isRemoved ? "text-inkLight line-through" : "text-ink"}`}
                              >
                                {item.name}
                              </p>
                              {item.selectedVariant && (
                                <span className="text-[11px] text-inkMid bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                  {item.selectedVariant.variantName}
                                </span>
                              )}

                              {isRemoved && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                                    {item.status === "removed"
                                      ? "Removed"
                                      : "Unavailable"}
                                  </span>
                                  {item.staffNote && (
                                    <span className="text-[10px] text-red-500 italic">
                                      — {item.staffNote}
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2 items-center mt-1.5">
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${order.orderType === "Takeaway" ? "bg-blue-50 text-blue-500" : "bg-accentLight text-primary"} ${isRemoved ? "opacity-50" : ""}`}
                                >
                                  {order.orderType === "Takeaway" ? "Takeaway" : "Dine In"}
                                </span>
                                {item.instructions && (
                                  <span className="text-[11px] text-inkLight italic truncate max-w-[130px]">
                                    {item.instructions}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={`font-bold text-sm ${isRemoved ? "text-inkLight line-through" : "text-ink"}`}
                            >
                              £{(item.price * item.quantity).toFixed(2)}
                            </span>
                            <span className="text-[10px] text-inkLight">
                              £{item.price.toFixed(2)} ea
                            </span>
                            {order.status === "pending" &&
                              (!item.status || item.status === "active") && (
                                <button
                                  onClick={() =>
                                    removeOrderItem(order.id, item.cartId!)
                                  }
                                  className="mt-1 p-1 text-red-500 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Price Breakdown Footer */}
                  <div className="p-4 bg-[#FAFAF8] border-t border-borderLite -mx-4 -mb-4 mt-2 space-y-2">
                    <div className="flex justify-between items-center text-[13px] text-inkMid">
                      <span>Subtotal</span>
                      <span className="font-semibold">
                        £{Number(order.total || 0).toFixed(2)}
                      </span>
                    </div>
                    {!!order.serviceFee && (
                      <div className="flex justify-between items-center text-[13px] text-inkMid">
                        <span>Service Fee</span>
                        <span className="font-semibold">
                          £{Number(order.serviceFee || 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="h-px bg-borderLite my-1" />
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-[15px] text-ink">
                        Grand Total
                      </span>
                      <span className="font-extrabold text-lg text-primary">
                        £{Number(order.grandTotal || order.total).toFixed(2)}
                      </span>
                    </div>
                    
                    {order.status === "pending" && (
                      <div className="pt-3 border-t border-borderLite mt-2">
                        <button
                          onClick={() => updateOrderStatus(order.id, "cancelled")}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-500 font-bold rounded-xl hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={16} />
                          Cancel Order
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </main>
    </div>
  );
}
