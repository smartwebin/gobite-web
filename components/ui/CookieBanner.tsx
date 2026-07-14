"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import React, { useEffect, useState } from "react";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("clickbite_cookie_consent");
    if (!consent) {
      // Delay showing it slightly for better UX
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("clickbite_cookie_consent", "accepted");
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem("clickbite_cookie_consent", "declined");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[400px] z-[100] bg-white border border-borderLite rounded-2xl shadow-2xl overflow-hidden p-5 flex flex-col gap-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-ink">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Cookie size={18} />
              </div>
              <h3 className="font-bold text-lg">Cookie Policy</h3>
            </div>
            <button 
              onClick={handleDecline}
              className="text-inkLight hover:text-ink transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <p className="text-sm text-inkMid leading-relaxed">
            We use essential cookies to keep you logged in and remember your order. 
            We also use optional cookies to improve our services.
          </p>
          
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleDecline}
              className="flex-1 py-2.5 rounded-xl border border-borderLite text-inkMid font-semibold hover:bg-gray-50 transition-colors text-sm"
            >
              Essential Only
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primaryHover transition-colors shadow-sm text-sm"
            >
              Accept All
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
