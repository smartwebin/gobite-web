import { Plus, Flame } from "lucide-react";
import Image from "next/image";
import React from "react";
import { MenuItem } from "../../utils/types";

export function MenuItemCard({
  item,
  onClick,
}: {
  item: MenuItem;
  onClick: () => void;
}) {
  const isAvailable = item.available !== false;
  console.log(`[MenuItemCard] Image for ${item.name}:`, item.image);

  return (
    <div
      className={`group flex flex-row sm:flex-col bg-white rounded-3xl border border-borderLite transition-all duration-300 overflow-hidden ${
        isAvailable
          ? "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer"
          : "opacity-70 grayscale-[40%]"
      }`}
      onClick={isAvailable ? onClick : undefined}
    >
      {/* Image Wrap */}
      <div className="relative aspect-square w-32 sm:w-full bg-gray-100 overflow-hidden shrink-0">
        <Image
          src={item.image || "/placeholder.png"}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 128px, (max-width: 1024px) 50vw, 25vw"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {item.popular && (
            <div className="flex items-center gap-1 bg-primary text-white px-2 py-0.5 rounded-full shadow-lg">
              <Flame size={10} className="fill-current" />
              <span className="text-[8px] font-bold uppercase tracking-tight">Popular</span>
            </div>
          )}
        </div>

        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white/90 text-ink font-black text-[10px] px-2 py-1 rounded-full shadow-lg uppercase tracking-wider text-center">
              Sold Out
            </span>
          </div>
        )}

        {isAvailable && item.stockType === "limited" && (
          <div className={`absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md text-[8px] font-black shadow-lg backdrop-blur-md ${
            item.stockQuantity! <= 5 ? "bg-red-500 text-white" : "bg-white/90 text-ink"
          }`}>
            {item.stockQuantity! > 0 ? `${item.stockQuantity} LEFT` : "OUT"}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 min-w-0 justify-center sm:justify-start">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-3 h-3 border rounded-sm flex items-center justify-center bg-white shrink-0 ${item.itemType === "veg" ? "border-green-500" : "border-red-500"}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${item.itemType === "veg" ? "bg-green-500" : "bg-red-500"}`} />
          </div>
          <h3 className="font-bold text-ink text-[15px] line-clamp-1">{item.name}</h3>
        </div>

        <p className="text-inkLight text-xs line-clamp-2 leading-relaxed h-8 mb-2">
          {item.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-primary font-black text-base sm:text-lg">
              £{(item.offerPrice ?? item.price).toFixed(2)}
            </span>
            {item.offerPrice && (
              <span className="text-[10px] text-inkLight line-through font-bold">
                £{item.price.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isAvailable) onClick();
            }}
            disabled={!isAvailable}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
              isAvailable 
                ? "bg-accentLight text-primary hover:bg-primary hover:text-white shadow-sm"
                : "bg-gray-100 text-inkLight"
            }`}
          >
            <Plus size={14} />
            <span>{isAvailable ? "ADD" : "OFF"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
