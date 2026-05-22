"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Armchair, Luggage, X, UserCheck, Lock } from "lucide-react";
import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";

interface TablePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TablePickerModal({ isOpen, onClose }: TablePickerModalProps) {
  const {
    setSessionInfo,
    tableNumber,
    availableTables,
    restaurantId,
    user,
    engageTable,
    unengageTable,
  } = useStore();

  const [selectedOption, setSelectedOption] = useState<string>(
    tableNumber || "Takeaway"
  );
  const [isApplying, setIsApplying] = useState(false);

  const isStaff =
    user?.role === "staff" ||
    user?.role === "admin" ||
    user?.role === "kitchen" ||
    user?.role === "manager" ||
    user?.role === "waiter";

  const handleApply = async () => {
    setIsApplying(true);
    try {
      if (selectedOption === "Takeaway") {
        // Release any previously engaged table
        const myOldTable = availableTables.find(
          (t) => t.engaged_by_user_id?.toString() === user?.id?.toString()
        );
        if (myOldTable) await unengageTable(myOldTable.id);
        setSessionInfo(restaurantId, "Takeaway", "0");
      } else {
        const found = availableTables.find(
          (t) => t.table_number === selectedOption
        );
        if (found) {
          const isEngaged = found.status !== "available";
          const isMine =
            found.engaged_by_user_id?.toString() === user?.id?.toString();

          if (isEngaged && !isMine) {
            // Another user's table — still allow selection (staff or customer choice),
            // just set session without engaging
            setSessionInfo(restaurantId, selectedOption, found.id ?? "0");
          } else {
            // Release old table if switching
            const myOldTable = availableTables.find(
              (t) =>
                t.engaged_by_user_id?.toString() === user?.id?.toString() &&
                t.id !== found.id
            );
            if (myOldTable) await unengageTable(myOldTable.id);

            // Engage new table (only if it's free)
            if (!isEngaged) {
              await engageTable(found.id);
            }
            setSessionInfo(restaurantId, selectedOption, found.id ?? "0");
          }
        }
      }
      onClose();
    } finally {
      setIsApplying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-5 border-b border-borderLite flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-ink">Where are you?</h2>
                <p className="text-sm text-inkMid mt-0.5">
                  Pick your table or choose Takeaway.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={18} className="text-inkMid" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* Takeaway option */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-inkLight uppercase tracking-widest">Option</p>
                <button
                  onClick={() => setSelectedOption("Takeaway")}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    selectedOption === "Takeaway"
                      ? "border-primary bg-accentLight"
                      : "border-borderLite bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    selectedOption === "Takeaway" ? "bg-primary/10" : "bg-gray-100"
                  }`}>
                    <Luggage size={18} className={selectedOption === "Takeaway" ? "text-primary" : "text-inkMid"} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-bold text-sm ${selectedOption === "Takeaway" ? "text-primary" : "text-ink"}`}>
                      Takeaway / Pickup
                    </p>
                    <p className="text-xs text-inkMid">Order to go</p>
                  </div>
                  {selectedOption === "Takeaway" && (
                    <div className="w-3 h-3 rounded-full bg-primary flex-shrink-0" />
                  )}
                </button>
              </div>

              {/* Tables grid */}
              {availableTables.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-inkLight uppercase tracking-widest">
                    Tables
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {availableTables.map((table) => {
                      const isEngaged = table.status !== "available";
                      const isMine =
                        table.engaged_by_user_id?.toString() ===
                        user?.id?.toString();
                      const isSelected = selectedOption === table.table_number;

                      let cardCls =
                        "relative flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl border-2 transition-all text-center cursor-pointer select-none ";
                      let labelCls = "font-bold text-sm leading-tight ";
                      let subCls = "text-[10px] font-semibold leading-tight ";

                      if (isSelected) {
                        cardCls += "border-primary bg-accentLight shadow-sm ";
                        labelCls += "text-primary ";
                        subCls += "text-primary/70 ";
                      } else if (isMine) {
                        cardCls += "border-primary/50 bg-accentLight/40 ";
                        labelCls += "text-primary ";
                        subCls += "text-primary/60 ";
                      } else if (isEngaged) {
                        cardCls += "border-borderLite bg-gray-50 opacity-70 ";
                        labelCls += "text-inkLight ";
                        subCls += "text-inkLight/70 ";
                      } else {
                        cardCls +=
                          "border-borderLite bg-white hover:border-primary/40 hover:bg-accentLight/20 ";
                        labelCls += "text-ink ";
                        subCls += "text-inkLight ";
                      }

                      return (
                        <button
                          key={table.id}
                          onClick={() => setSelectedOption(table.table_number)}
                          className={cardCls}
                          title={
                            isMine
                              ? "Your table"
                              : isEngaged
                              ? "Occupied by another guest"
                              : "Available"
                          }
                        >
                          {/* Status icon */}
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isMine
                              ? "bg-primary/10"
                              : isEngaged
                              ? "bg-gray-200"
                              : "bg-green-50"
                          }`}>
                            {isMine ? (
                              <UserCheck size={13} className="text-primary" />
                            ) : isEngaged ? (
                              <Lock size={11} className="text-inkLight" />
                            ) : (
                              <Armchair size={13} className="text-green-500" />
                            )}
                          </div>

                          <span className={labelCls}>{table.table_number}</span>

                          {/* Status label */}
                          <span className={subCls}>
                            {isMine ? "Your Table" : isEngaged ? "Occupied" : "Free"}
                          </span>

                          {/* Selected dot */}
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
                          )}

                          {/* Staff free-table button */}
                          {isStaff && isEngaged && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                await unengageTable(table.id);
                              }}
                              className="absolute -top-2 -left-2 bg-white border border-borderLite text-[9px] font-bold text-red-500 px-1.5 py-0.5 rounded-full shadow-sm hover:bg-red-50 transition-colors"
                            >
                              Free
                            </button>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer CTA */}
            <div className="p-4 bg-white border-t border-borderLite flex-shrink-0">
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="w-full bg-primary hover:bg-primaryHover disabled:opacity-60 text-white font-bold text-base py-4 rounded-2xl shadow-[0_6px_20px_rgba(255,107,53,0.3)] transition-all active:scale-[0.98]"
              >
                {isApplying ? "Confirming…" : "Confirm Selection"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
