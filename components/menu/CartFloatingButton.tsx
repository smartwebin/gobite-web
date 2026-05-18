"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useStore } from "../../context/StoreContext";

export function CartFloatingButton() {
  const router = useRouter();
  const { cart } = useStore();

  if (cart.length === 0) return null;

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bottom-6 left-0 right-0 z-40 mx-auto px-4 w-full max-w-md"
      >
        <button
          onClick={() => router.push("/cart")}
          className="w-full bg-primary hover:bg-primaryHover text-white rounded-2xl p-4 shadow-[0_8px_30px_rgba(255,107,53,0.4)] flex items-center justify-between transition-transform active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="font-extrabold text-[15px]">{totalItems}</span>
            </div>
            <div className="text-left">
              <p className="font-bold text-base">View Cart</p>
              <p className="text-xs text-white/80 font-medium">Checkout now</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-black text-xl tracking-tight">
              £{totalPrice.toFixed(2)}
            </span>
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
