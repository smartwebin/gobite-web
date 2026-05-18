"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Mail,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { CartItemCard } from "../../components/menu/CartItemCard";
import { Header } from "../../components/ui/Header";
import { useStore } from "../../context/StoreContext";
import { apiClient } from "../../utils/apiClient";

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    addOrder,
    setActiveOrder,
    restaurantId,
    tableId,
    tableNumber,
    user,
    restaurantInfo,
  } = useStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [error, setError] = useState("");

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const serviceFee = subtotal * 0.1;
  const grandTotal = subtotal + serviceFee;

  const handleInitialCheckout = () => {
    setShowEmailModal(true);
  };

  const finalizeCheckout = async () => {
    setIsProcessing(true);
    setError("");

    try {
      // Find table ID from tableNumber if possible, or just send the table info
      // Our API expects table_id (int). We might need a small mapping or just use id.
      // For now, I'll send restaurantId and cart items.
      
      const orderData = {
        restaurant_id: parseInt(restaurantId),
        user_id: user?.id ? parseInt(user.id) : null,
        table_id: tableId && tableId !== "0" ? parseInt(tableId) : null,
        order_type: tableNumber === "Takeaway" ? "takeaway" : "dine-in",
        items: cart.map(item => ({
          id: parseInt(item.id),
          quantity: item.quantity,
          instructions: item.instructions || "",
          variant_id: item.selectedVariant ? parseInt(item.selectedVariant.id) : null,
          allergies: item.allergies || [],
          customAllergy: item.customAllergy || "",
        }))
      };

      const resp = await apiClient.post("place-order.php", orderData);

      if (resp.status === "success") {
        clearCart();
        setIsProcessing(false);
        setShowEmailModal(false);
        router.push(`/order-success?order_id=${resp.data.order_id}`);
      } else {
        setError(resp.message || "Failed to place order.");
        setIsProcessing(false);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during checkout.");
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex-1 flex flex-col bg-bgBase min-h-screen">
        <Header title="Your Order" showBack />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
          <div className="w-24 h-24 bg-gray-100/80 rounded-full flex items-center justify-center mb-2 shadow-sm border border-borderLite">
            <ShoppingBag size={40} className="text-inkLight" />
          </div>
          <h2 className="text-2xl font-extrabold text-ink tracking-tight">
            Your cart is empty
          </h2>
          <p className="text-inkMid text-sm mb-4">
            Pick something delicious from the menu!
          </p>
          <button
            onClick={() => router.back()}
            className="bg-primary hover:bg-primaryHover text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg transition-colors"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-bgBase min-h-screen relative pb-32">
      <Header title="Your Order" showBack />

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Table / Location Info */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-borderLite shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accentLight rounded-full flex items-center justify-center text-primary">
                <MapPin size={18} />
              </div>
              <div>
                <p className="font-bold text-ink text-sm">
                  {tableNumber === "Takeaway"
                    ? "Takeaway Order"
                    : `Table ${tableNumber?.split("-")[1] || tableNumber}`}
                </p>
                <p className="text-xs text-inkMid">{restaurantInfo?.name || "GoBite"}</p>
              </div>
            </div>
            <button
              onClick={() => {
                clearCart();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">
                Clear
              </span>
            </button>
          </div>

          {/* Cart Items */}
          <div className="space-y-3">
            {cart.map((item) => (
              <CartItemCard
                key={item.cartId}
                item={item}
                onUpdate={(qty) => updateQuantity(item.cartId, qty)}
                onRemove={() => removeFromCart(item.cartId)}
              />
            ))}
          </div>

          {/* Allergy Warning */}
          <div className="bg-[#FEF2F2] p-4 rounded-2xl border border-red-100 flex items-start gap-3 shadow-sm">
            <ShieldCheck size={18} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs text-inkMid leading-relaxed">
              If you have food allergies, please inform{" "}
              <strong className="text-ink">{restaurantInfo?.name || "GoBite"}</strong> before
              checkout.
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-24 mt-4 lg:mt-0">
          <div className="bg-white p-5 rounded-2xl border border-borderLite shadow-sm space-y-3">
            <h3 className="font-bold text-ink text-base mb-1">Order Summary</h3>
            <div className="flex justify-between text-sm">
              <span className="text-inkMid">
                Items ({cart.reduce((a, b) => a + b.quantity, 0)})
              </span>
              <span className="font-semibold text-ink">
                £{subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-inkMid">Service Fee (10%)</span>
              <span className="font-semibold text-ink">£{serviceFee.toFixed(2)}</span>
            </div>
            <div className="h-px w-full bg-borderLite my-2" />
            <div className="flex justify-between items-center pt-1">
              <span className="font-bold text-lg text-ink">Total</span>
              <span className="font-black text-2xl text-primary">
                £{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <p className="text-center text-xs text-inkLight pt-2 lg:hidden">
            All prices include GST where applicable
          </p>

          <div className="fixed bottom-0 left-0 right-0 z-40 mx-auto w-full max-w-md bg-white border-t border-borderLite p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] lg:static lg:max-w-none lg:bg-transparent lg:border-none lg:p-0 lg:shadow-none">
            <button
              onClick={handleInitialCheckout}
              disabled={isProcessing}
              className="w-full bg-primary hover:bg-primaryHover text-white font-bold text-base py-4 rounded-2xl shadow-[0_6px_20px_rgba(255,107,53,0.3)] transition-transform active:scale-[0.98] disabled:opacity-70 flex items-center justify-between px-6"
            >
              <span>
                {isProcessing ? "Processing..." : "Confirm Order"}
              </span>
              {!isProcessing && (
                <span className="font-black tracking-tight">
                  £{grandTotal.toFixed(2)}
                </span>
              )}
            </button>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showEmailModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowEmailModal(false)}
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-accentLight rounded-full flex items-center justify-center text-primary">
                  <Mail size={24} />
                </div>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  <X size={18} className="text-inkMid" />
                </button>
              </div>

              <h2 className="text-2xl font-extrabold text-ink mb-2">
                Order Details
              </h2>
              <p className="text-sm text-inkMid mb-8 leading-relaxed">
                Confirming your order for table <strong>{tableNumber}</strong>.
              </p>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 mb-4">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between bg-[#F9F9F9] p-4 rounded-2xl mb-8 border border-borderLite">
                <p className="text-xs text-inkMid leading-relaxed pr-4 flex-1">
                  I accept the{" "}
                  <button onClick={() => router.push("/legal/terms")} className="text-primary font-semibold hover:underline">Terms</button> and <button onClick={() => router.push("/legal/privacy")} className="text-primary font-semibold hover:underline">Privacy</button>
                </p>

                <button
                  onClick={() => setAcceptTerms(!acceptTerms)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${acceptTerms ? "bg-primary" : "bg-gray-300"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${acceptTerms ? "translate-x-6" : "translate-x-0"}`}
                  />
                </button>
              </div>

              <div className="space-y-3 pb-safe">
                <button
                  onClick={finalizeCheckout}
                  disabled={!acceptTerms || isProcessing}
                  className="w-full bg-primary hover:bg-primaryHover text-white font-bold text-base py-4 rounded-2xl shadow-lg transition-transform active:scale-[0.98] disabled:opacity-50"
                >
                  {isProcessing ? "Placing Order..." : "Place Order Now"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
