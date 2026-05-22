"use client";

import { ChevronLeft, Clock, ShoppingBag, User, FileText, Shield, Info, LifeBuoy, X, Menu } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../../context/StoreContext";


interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showCart?: boolean;
  onSubtitleClick?: () => void;
  rightAction?: React.ReactNode;
  showMenu?: boolean;
}

export function Header({
  title,
  subtitle,
  showBack,
  showCart,
  onSubtitleClick,
  rightAction,
}: HeaderProps) {
  const router = useRouter();
  const { cart, user, logout } = useStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const closeDrawer = () => setIsDrawerOpen(false);
  const openDrawer = () => setIsDrawerOpen(true);

  return (
    <>
      <div className="bg-white border-b border-borderLite sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-bgBase hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft size={20} className="text-ink" />
            </button>
          )}

          <div className="flex items-center gap-3">
            {!title && (
              <>
                <button
                  onClick={openDrawer}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-bgBase hover:bg-gray-200 transition-colors focus:outline-none"
                >
                  <Menu size={22} className="text-ink" />
                </button>
                <Image 
                  src="/logo.png" 
                  alt={"Gobite"} 
                  width={66} 
                  height={66} 
                  className="object-contain"
                  priority
                />
              </>
            )}
            <div>
              {title && (
                <h1 className="text-base font-bold text-ink">{title}</h1>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user && !user.is_guest && (
            <button
              onClick={() => router.push("/dashboard")}
              className={`flex items-center gap-1.5 bg-accentLight px-2.5 py-1.5 rounded-full mr-1 hover:bg-[#FFDAC8] transition-colors cursor-pointer`}
            >
              <div className="w-5 h-5 rounded-full bg-[#FFD9C8] flex items-center justify-center text-primary">
                <User size={12} />
              </div>
              <span className="text-xs font-semibold text-primary max-w-[72px] truncate">
                {user.name.split(" ")[0]}
              </span>
            </button>
          )}

          {rightAction}

          {/* Orders if logged in, Login if not */}
          {user && !user.is_guest ? (
            <button
              onClick={() => router.push("/orders")}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-bgBase hover:bg-gray-200 transition-colors"
              title="Order History"
            >
              <Clock size={20} className="text-inkMid" />
            </button>
          ) : (
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primaryHover text-white text-xs font-bold rounded-full transition-colors"
            >
              Login
            </button>
          )}

          {showCart && (
            <button
              onClick={() => router.push("/cart")}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-bgBase relative hover:bg-gray-200 transition-colors"
            >
              <ShoppingBag size={18} className="text-ink" />
              {cartItemCount > 0 && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-[9px] font-bold text-white">
                    {cartItemCount}
                  </span>
                </div>
              )}
            </button>
          )}
        </div>
      </div>
    </div>

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[60] shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-8 border-b border-borderLite flex flex-col items-center bg-[#F7F5F2] rounded-b-[2rem] shadow-sm">
                <div className="w-full flex justify-end mb-2">
                  <button onClick={closeDrawer} className="p-2 hover:bg-white rounded-full text-inkMid transition-colors shadow-sm">
                    <X size={20} />
                  </button>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Image src="/logo.png" alt="Gobite" width={80} height={80} className="object-contain" />
                  <span className="text-2xl font-black text-primary tracking-tighter uppercase">Gobite</span>
                </div>
              </div>

              {/* Drawer Links */}
              <div className="flex-1 py-4 flex flex-col">
                <button onClick={() => { closeDrawer(); router.push("/legal/terms"); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-bgBase transition-colors text-left">
                  <FileText size={22} className="text-inkMid" />
                  <span className="text-base font-semibold text-ink">Terms & Conditions</span>
                </button>
                <button onClick={() => { closeDrawer(); router.push("/legal/privacy"); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-bgBase transition-colors text-left">
                  <Shield size={22} className="text-inkMid" />
                  <span className="text-base font-semibold text-ink">Privacy Policy</span>
                </button>
                <button onClick={() => { closeDrawer(); router.push("/legal/about"); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-bgBase transition-colors text-left">
                  <Info size={22} className="text-inkMid" />
                  <span className="text-base font-semibold text-ink">About Us</span>
                </button>
                <button onClick={() => { closeDrawer(); router.push("/support"); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-bgBase transition-colors text-left">
                  <LifeBuoy size={22} className="text-inkMid" />
                  <span className="text-base font-semibold text-ink">Support</span>
                </button>
                {user && (
                  <button onClick={() => { closeDrawer(); router.push("/dashboard"); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-bgBase transition-colors text-left">
                    <User size={22} className="text-inkMid" />
                    <span className="text-base font-semibold text-ink">Dashboard</span>
                  </button>
                )}
                
                {user && (
                  <div className="mt-auto border-t border-borderLite p-4">
                    <button 
                      onClick={() => { logout(); closeDrawer(); router.replace("/"); }} 
                      className="w-full flex items-center gap-4 px-6 py-4 bg-red-50 hover:bg-red-100 transition-colors text-left rounded-2xl"
                    >
                      <X size={22} className="text-red-500" />
                      <span className="text-base font-bold text-red-600">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
