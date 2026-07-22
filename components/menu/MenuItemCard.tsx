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
  const hasVariants = item.variants && item.variants.length > 0;
  const lowestVariantPrice = hasVariants 
    ? Math.min(...item.variants!.map(v => v.offerPrice ?? v.price)) 
    : 0;
  console.log(`[MenuItemCard] Image for ${item.name}:`, item.image);

  return (
    <div
      className={`group flex flex-col bg-white rounded-2xl border border-borderLite transition-all duration-300 overflow-hidden ${
        isAvailable
          ? "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer"
          : "opacity-55 grayscale-[40%]"
      }`}
      onClick={isAvailable ? onClick : undefined}
    >
      {/* Image Wrap */}
      <div className="relative aspect-square w-full bg-gray-100 overflow-hidden shrink-0">
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
      <div className="p-2.5 flex flex-col flex-1 min-w-0">
        <div className="flex flex-col gap-0.5 w-full">
          <div className="flex items-center gap-1.5 w-full">
            {item.itemType === "na" ? (
              <div className="w-2.5 h-2.5 border rounded-[1px] flex items-center justify-center shrink-0 border-blue-500">
                <div className="w-1 h-1 rounded-full bg-blue-500" />
              </div>
            ) : (
              <div className={`w-2.5 h-2.5 border rounded-[1px] flex items-center justify-center shrink-0 ${item.itemType === "veg" ? "border-green-500" : "border-red-500"}`}>
                <div className={`w-1 h-1 rounded-full ${item.itemType === "veg" ? "bg-green-500" : "bg-red-500"}`} />
              </div>
            )}
            <h3 className="font-bold text-ink text-[14px] line-clamp-1 w-full">{item.name}</h3>
          </div>
          
          <div className="flex items-center gap-1.5 min-h-[20px]">
            {hasVariants ? (
              <span className="text-primary font-extrabold text-[14px]">
                From £{lowestVariantPrice.toFixed(2)}
              </span>
            ) : (
              <>
                <span className="text-primary font-extrabold text-[14px]">
                  £{(item.offerPrice ?? item.price).toFixed(2)}
                </span>
                {item.offerPrice && (
                  <span className="text-[11px] text-inkLight line-through mt-[1px]">
                    £{item.price.toFixed(2)}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        <p className="text-inkLight text-[12px] line-clamp-2 leading-[16px] mt-0.5">
          {item.description}
        </p>

        <div className="mt-auto pt-1.5 flex items-center justify-between gap-2">

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isAvailable) onClick();
            }}
            disabled={!isAvailable}
            className={`flex items-center justify-center gap-1 w-full py-1.5 rounded-[10px] transition-all ${
              isAvailable 
                ? "bg-accentLight text-primary hover:bg-primary hover:text-white"
                : "bg-[#F0F0F0] text-inkLight"
            }`}
          >
            <Plus size={16} />
            <span className="text-[12px] font-semibold">{isAvailable ? "Add to order" : "Unavailable"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
