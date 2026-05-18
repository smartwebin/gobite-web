import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import React from "react";
import { CartItem } from "../../utils/types";

export function CartItemCard({
  item,
  onUpdate,
  onRemove,
}: {
  item: CartItem;
  onUpdate: (qty: number) => void;
  onRemove: () => void;
}) {
  const isInactive = item.status === "removed" || item.status === "unavailable";

  return (
    <div
      className={`flex bg-white p-3.5 rounded-2xl border border-borderLite gap-3 ${isInactive ? "opacity-60 grayscale-[40%]" : ""}`}
    >
      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-borderLite">
        <Image
          src={item.image || "/placeholder.png"}
          alt={item.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h4
              className={`font-bold text-ink text-sm ${isInactive ? "line-through" : ""}`}
            >
              {item.name}
            </h4>
            <span
              className={`font-bold text-ink text-sm ${isInactive ? "line-through" : ""}`}
            >
              £{(item.price * item.quantity).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                item.orderType === "Takeaway"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-accentLight text-primary"
              }`}
            >
              {item.orderType}
            </span>
            {item.instructions && (
              <span className="text-[10px] text-inkLight italic truncate max-w-[100px]">
                {item.instructions}
              </span>
            )}
          </div>

          {isInactive && (
            <div className="mt-1 flex items-center gap-1">
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded uppercase">
                {item.status === "removed" ? "Removed" : "Unavailable"}
              </span>
              {item.staffNote && (
                <span className="text-[10px] text-red-500 italic">
                  — {item.staffNote}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          {!isInactive ? (
            <div className="flex items-center gap-3 bg-[#F9F9F9] border border-borderLite rounded-lg p-0.5">
              <button
                onClick={() => onUpdate(item.quantity - 1)}
                className="w-7 h-7 rounded-md bg-white flex items-center justify-center text-ink shadow-sm"
              >
                <Minus size={14} />
              </button>
              <span className="text-sm font-bold w-4 text-center">
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdate(item.quantity + 1)}
                className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-white shadow-sm"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg px-3 py-1 text-xs font-bold text-gray-500">
              Qty: {item.quantity}
            </div>
          )}

          {!isInactive && (
            <button
              onClick={onRemove}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
