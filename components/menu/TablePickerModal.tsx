"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X } from "lucide-react";
import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";

interface TablePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TablePickerModal({ isOpen, onClose }: TablePickerModalProps) {
  const { setSessionInfo, tableNumber, availableTables, restaurantId, user } = useStore();
  const [selectedOption, setSelectedOption] = useState<string>(
    tableNumber || "Takeaway",
  );


  const handleApply = () => {
    if (selectedOption === "Takeaway") {
      setSessionInfo(restaurantId, "Takeaway", "0");
    } else {
      const found = availableTables.find((t) => t.table_number === selectedOption);
      setSessionInfo(restaurantId, selectedOption, found?.id ?? "0");
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="p-5 border-b border-borderLite flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-ink">Where are you?</h2>
                <p className="text-sm text-inkMid mt-0.5">
                  Select a table or choose Takeaway.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <X size={18} className="text-inkMid" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
                  Option
                </h3>
                <button
                  onClick={() => setSelectedOption("Takeaway")}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all font-semibold ${
                    selectedOption === "Takeaway"
                      ? "border-primary bg-accentLight text-primary"
                      : "border-borderLite bg-white text-inkMid hover:bg-gray-50"
                  }`}
                >
                  <span>Takeaway Order</span>
                  {selectedOption === "Takeaway" && (
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  )}
                </button>
              </div>

              {availableTables.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
                    Available Tables
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {availableTables.map((table) => {
                      const isEngaged = table.status !== "available";
                      const isMine =
                        table.engaged_by_user_id?.toString() ===
                        user?.id?.toString();
                      const isSelected = selectedOption === table.table_number;

                      return (
                        <button
                          key={table.id}
                          onClick={() => setSelectedOption(table.table_number)}
                          className={`py-3 rounded-xl border-2 transition-all font-semibold text-center ${
                            isSelected
                              ? "border-primary bg-accentLight text-primary"
                              : isEngaged && !isMine
                                ? "border-borderLite bg-gray-50 text-inkLight/70 opacity-80"
                                : "border-borderLite bg-white text-inkMid hover:bg-gray-50"
                          }`}
                        >
                          {table.table_number}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-borderLite">
              <button
                onClick={handleApply}
                className="w-full bg-primary hover:bg-primaryHover text-white font-bold text-base py-4 rounded-2xl shadow-[0_6px_20px_rgba(255,107,53,0.3)] transition-all"
              >
                Apply Selection
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
