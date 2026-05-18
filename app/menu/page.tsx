"use client";

import { ShieldCheck, UtensilsCrossed, MapPin, ChevronDown } from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import { CartFloatingButton } from "../../components/menu/CartFloatingButton";
import { CategoryTabs } from "../../components/menu/CategoryTabs";
import { ItemDetailModal } from "../../components/menu/ItemDetailModal";
import { MenuItemCard } from "../../components/menu/MenuItemCard";
import { Header } from "../../components/ui/Header";
import { TablePickerModal } from "../../components/menu/TablePickerModal";
import { useStore } from "../../context/StoreContext";
import { MenuItem } from "../../utils/types";

export default function MenuPage() {
  const { tableNumber, setSessionInfo, menuItems, restaurantInfo, restaurantId, user, availableTables } = useStore();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showTablePicker, setShowTablePicker] = useState(false);

  // Derive dynamic categories from menuItems
  const categories = useMemo(() => {
    const cats = ["All", ...new Set(menuItems.map(item => item.category))];
    return cats;
  }, [menuItems]);

  const hotelName = restaurantInfo?.name || "GoBite";

  useEffect(() => {
    if (restaurantId && restaurantId !== "default" && !tableNumber && (!user || user.role === "customer")) {
      const myEngagedTable = availableTables.find((t: any) => t.engaged_by_user_id?.toString() === user?.id?.toString());
      if (myEngagedTable) {
        setSessionInfo(restaurantId, myEngagedTable.table_number, myEngagedTable.id);
        setShowTablePicker(false);
      } else {
        setShowTablePicker(true);
      }
    } else if (!tableNumber) {
      // Fallback if no restaurantId yet
      setShowTablePicker(true);
    }
  }, [tableNumber, restaurantId, user, availableTables, setSessionInfo]);

  const filteredItems =
    activeCategory === "All"
      ? menuItems
      : menuItems.filter((i) => i.category === activeCategory);

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
