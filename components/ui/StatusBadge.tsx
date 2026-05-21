import React from "react";
import { OrderStatus } from "../../utils/types";
// test
export function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { bg: string; text: string; label: string }> =
  {
    pending: { bg: "bg-amber-50", text: "text-amber-600", label: "Pending" },
    received: { bg: "bg-blue-100", text: "text-blue-700", label: "Received" },
    preparing: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      label: "Cooking",
    },
    ready: { bg: "bg-green-50", text: "text-green-600", label: "Ready" },
    delivered: {
      bg: "bg-green-100",
      text: "text-green-700",
      label: "Delivered",
    },
    completed: {
      bg: "bg-gray-100",
      text: "text-gray-600",
      label: "Completed",
    },
    cancelled: { bg: "bg-red-50", text: "text-red-600", label: "Cancelled" },
  };

  const s = map[status] || map.pending;

  return (
    <div className={`px-2.5 py-1 rounded border border-black/5 ${s.bg}`}>
      <span
        className={`text-[10px] uppercase font-bold tracking-wider ${s.text}`}
      >
        {s.label}
      </span>
    </div>
  );
}
