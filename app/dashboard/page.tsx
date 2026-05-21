"use client";

import { motion } from "framer-motion";
import { 
  QrCode, 
  Receipt, 
  Settings, 
  LogOut, 
  MapPin, 
  ChevronRight,
  Utensils,
  ShoppingBag
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Header } from "../../components/ui/Header";
import { QrScannerModal } from "../../components/ui/QrScannerModal";
import { useStore } from "../../context/StoreContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, restaurantInfo, tableNumber, restaurantId, isLoading } = useStore();
  const [isScanning, setIsScanning] = React.useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F7F5F2] min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const NAV_ITEMS: { id: string; title: string; sub: string; icon: JSX.Element; color: string; bg: string; route: string | null; action?: () => void; hide?: boolean }[] = [
    {
      id: "scan",
      title: "Scan QR Code",
      sub: "Scan a table QR to start ordering",
      icon: <QrCode size={24} />,
      color: "text-primary",
      bg: "bg-accentLight",
      route: null,
      action: () => setIsScanning(true),
    },
    {
      id: "menu",
      title: "View Menu",
      sub: "Browse items and place orders",
      icon: <Utensils size={24} />,
      color: "text-orange-500",
      bg: "bg-orange-50",
      route: "/menu",
      hide: restaurantId === "default" || !restaurantInfo,
    },

    {
      id: "orders",
      title: "My Orders",
      sub: "Track your active & past orders",
      icon: <Receipt size={24} />,
      color: "text-blue-500",
      bg: "bg-blue-50",
      route: "/orders",
    },
    {
      id: "settings",
      title: "Settings",
      sub: "Edit profile and account",
      icon: <Settings size={24} />,
      color: "text-gray-700",
      bg: "bg-gray-200",
      route: "/settings",
      hide: user?.is_guest,
    },
  ].filter(i => !i.hide);

  return (
    <div className="flex flex-col bg-bgBase min-h-screen">
      <Header title="Dashboard" />

      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-8">
        {/* User Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-borderLite flex items-center gap-4"
        >
          <div className="w-16 h-16 bg-accentLight rounded-2xl flex items-center justify-center text-primary text-2xl font-black shadow-inner">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-ink tracking-tight">
              Hello, {user.name.split(" ")[0]}!
            </h2>
            <p className="text-sm text-inkMid">
              {user.is_guest ? "Guest Session" : user.email || user.phone}
            </p>
          </div>
          {!user.is_guest && (
            <button 
              onClick={() => router.push("/settings")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight size={20} className="text-inkLight" />
            </button>
          )}
        </motion.div>

        {/* Restaurant Status Card */}
        {restaurantId !== "default" && restaurantInfo && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-primary rounded-3xl p-6 shadow-[0_10px_30px_rgba(255,107,53,0.2)] text-white relative overflow-hidden"
          >
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 opacity-90">
                  <MapPin size={14} />
                  <span className="text-xs font-bold uppercase tracking-wider">Current Location</span>
                </div>
                <h3 className="text-2xl font-black tracking-tight">
                  {restaurantInfo.name}
                </h3>
                <p className="text-white/80 font-medium">
                  {tableNumber === "Takeaway" ? "Takeaway Order" : `Table ${tableNumber || "Not Selected"}`}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <ShoppingBag size={24} />
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          </motion.div>
        )}

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {NAV_ITEMS.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              onClick={() => item.action ? item.action() : item.route && router.push(item.route)}
              className="bg-white p-5 rounded-2xl border border-borderLite shadow-sm hover:shadow-md transition-all flex items-center gap-4 text-left group active:scale-[0.98]"
            >
              <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-ink">{item.title}</h4>
                <p className="text-xs text-inkMid">{item.sub}</p>
              </div>
              <ChevronRight size={16} className="text-inkLight group-hover:text-primary transition-colors" />
            </motion.button>
          ))}
          
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + NAV_ITEMS.length * 0.05 }}
            onClick={() => {
              logout();
              router.replace("/");
            }}
            className="bg-red-50 p-5 rounded-2xl border border-red-100 shadow-sm hover:bg-red-100 transition-all flex items-center gap-4 text-left group active:scale-[0.98]"
          >
            <div className="w-14 h-14 bg-white text-red-500 rounded-2xl flex items-center justify-center shadow-sm">
              <LogOut size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-red-600">Logout</h4>
              <p className="text-xs text-red-400">Sign out and clear session</p>
            </div>
            <ChevronRight size={16} className="text-red-300" />
          </motion.button>
        </div>
      </main>

      <QrScannerModal isOpen={isScanning} onClose={() => setIsScanning(false)} />
    </div>
  );
}
