"use client";

import { ShieldCheck, UtensilsCrossed, MapPin, ChevronDown } from "lucide-react";
import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CartFloatingButton } from "../../components/menu/CartFloatingButton";
import { CategoryTabs } from "../../components/menu/CategoryTabs";
import { ItemDetailModal } from "../../components/menu/ItemDetailModal";
import { MenuItemCard } from "../../components/menu/MenuItemCard";
import { Header } from "../../components/ui/Header";
import { TablePickerModal } from "../../components/menu/TablePickerModal";
import { useStore } from "../../context/StoreContext";
import { MenuItem } from "../../utils/types";

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-screen bg-[#F7F5F2]"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <MenuContent />
    </Suspense>
  );
}

function MenuContent() {
  const searchParams = useSearchParams();
  const fromScan = searchParams.get("from_scan") === "1";
  const { tableNumber, setSessionInfo, menuItems, restaurantInfo, restaurantId, user, availableTables } = useStore();
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeType, setActiveType] = useState<"all" | "veg" | "non-veg">("all");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showTablePicker, setShowTablePicker] = useState(false);

  // Derive dynamic categories from menuItems
  const categories = useMemo(() => {
    const cats = ["All", ...new Set(menuItems.map(item => item.category))];
    return cats;
  }, [menuItems]);

  const hotelName = restaurantInfo?.name || "GoBite";

  // If arrived via QR scan, ALWAYS force the table picker open
  useEffect(() => {
    if (fromScan) {
      setShowTablePicker(true);
    }
  }, [fromScan]);

  useEffect(() => {
    // Skip if fromScan already triggered the picker
    if (fromScan) return;
    if (restaurantId && restaurantId !== "default" && !tableNumber && (!user || user.role === "customer")) {
      const myEngagedTable = availableTables.find((t: any) => t.engaged_by_user_id?.toString() === user?.id?.toString());
      if (myEngagedTable) {
        setSessionInfo(restaurantId, myEngagedTable.table_number, myEngagedTable.id);
        setShowTablePicker(false);
      } else {
        setShowTablePicker(true);
      }
    }
  }, [tableNumber, restaurantId, user, availableTables, setSessionInfo, fromScan]);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesType = activeType === "all" || item.itemType === activeType;
    return matchesCategory && matchesType;
  });

  const getSubtitle = () => {
    if (tableNumber === "Takeaway") return `Takeaway`;
    return `Table ${tableNumber || "?"}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-bgBase relative pb-28">
      <Header showCart />

      <button 
      onClick={() => setShowTablePicker(true)}
      className="w-full bg-white border-b border-borderLite px-4 py-3.5 flex items-center gap-2 hover:bg-gray-50 transition-colors"
      >
        <MapPin size={18} className="text-primary flex-shrink-0" />
        <span className="text-sm font-bold text-ink flex-1 text-left">
          {hotelName} &bull; <span className="text-primary">{getSubtitle()}</span>
        </span>
        <ChevronDown size={16} className="text-inkLight flex-shrink-0" />
      </button>

      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      {/* Veg / Non-Veg Type Filters */}
      <div className="bg-bgBase py-3 px-4 md:px-8 border-b border-borderLite/50 flex gap-2 overflow-x-auto scrollbar-none">
        {[
          { label: "All", value: "all" },
          { label: "Veg", value: "veg" },
          { label: "Non-Veg", value: "non-veg" },
        ].map((t) => {
          const active = activeType === t.value;
          let activeColorClass = "border-primary bg-accentLight text-primary";
          let vegOrNonVegIndicator = null;
          
          if (t.value === "veg") {
            activeColorClass = "border-green-500 bg-green-50 text-green-600";
            vegOrNonVegIndicator = (
              <div className="w-2.5 h-2.5 border border-green-500 flex items-center justify-center rounded-[1px] mr-1.5 shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              </div>
            );
          } else if (t.value === "non-veg") {
            activeColorClass = "border-red-500 bg-red-50 text-red-600";
            vegOrNonVegIndicator = (
              <div className="w-2.5 h-2.5 border border-red-500 flex items-center justify-center rounded-[1px] mr-1.5 shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              </div>
            );
          }

          return (
            <button
              key={t.value}
              onClick={() => setActiveType(t.value as any)}
              className={`flex items-center px-4 py-1.5 rounded-full bg-white border border-borderLite text-xs font-semibold text-inkMid hover:bg-gray-50 transition-all ${
                active ? activeColorClass : ""
              }`}
            >
              {vegOrNonVegIndicator}
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onClick={() => setSelectedItem(item)}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-60">
              <UtensilsCrossed size={40} className="text-inkLight mb-4" />
              <p className="text-sm font-medium text-inkLight">
                No items in this category
              </p>
            </div>
          )}
        </div>

        {filteredItems.length > 0 && (
          <div className="mt-8 mb-4 bg-accentLight p-4 rounded-2xl flex items-start gap-3 border border-red-100">
            <ShieldCheck className="text-primary mt-0.5 shrink-0" size={20} />
            <p className="text-xs text-inkMid leading-relaxed">
              Please inform <strong className="text-ink">{hotelName}</strong>{" "}
              of any food allergies before placing your order.
            </p>
          </div>
        )}
      </div>

      <ItemDetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
      <TablePickerModal
        isOpen={showTablePicker}
        onClose={() => setShowTablePicker(false)}
      />
      <CartFloatingButton />
    </div>
  );
}
