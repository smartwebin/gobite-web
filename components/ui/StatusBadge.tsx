import React from "react";
import { OrderStatus } from "../../utils/types";
// test
export function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { bg: string; text: string; label: string }> = {
    pending: { bg: "bg-amber-50", text: "text-amber-600", label: "Received" },
    accepted: { bg: "bg-green-50", text: "text-green-600", label: "Paid" },
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
