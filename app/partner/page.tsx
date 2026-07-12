"use client";

import { motion } from "framer-motion";
import { Store, User, Phone, Mail, MapPin, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { apiClient } from "../../utils/apiClient";

export default function PartnerScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    contact_name: "",
    restaurant_name: "",
    address: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const resp = await apiClient.post("partner.php", form);
      if (resp.status === "success") {
        setStatus({ type: "success", msg: resp.message || "Admin will soon contact you." });
        setForm({
          contact_name: "",
          restaurant_name: "",
          address: "",
          phone: "",
          email: "",
        });
      } else {
        setStatus({ type: "error", msg: resp.message || "Failed to send request." });
      }
    } catch (err: any) {
      setStatus({ type: "error", msg: err.message || "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col relative bg-[#F7F5F2] overflow-x-hidden min-h-screen">
      {/* Decorative Circles */}
      <div className="absolute -top-32 -left-28 w-96 h-96 bg-[#FFDAC8] opacity-55 rounded-full blur-2xl" />
      <div className="absolute -bottom-32 -right-20 w-72 h-72 bg-[#FFE8D6] opacity-55 rounded-full blur-xl" />

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col mt-4 mb-6 relative"
        >
          <button 
            onClick={() => router.back()}
            className="absolute left-0 top-1 text-inkMid hover:text-ink transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex justify-center items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
              <Store size={22} />
            </div>
            <span className="text-2xl font-black text-ink tracking-tight">
              Partner With Us
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/80 backdrop-blur-md border border-white p-6 rounded-3xl shadow-xl space-y-5"
        >
          <div className="text-center space-y-2">
            <h1 className="text-xl font-extrabold text-ink tracking-tight">
              Grow Your Business
            </h1>
            <p className="text-sm text-inkMid font-medium px-2">
              Fill out the details below and we will contact you shortly.
            </p>
          </div>

          {status && (
            <div className={`${
              status.type === "success" 
                ? "bg-green-50 text-green-600 border-green-100" 
                : "bg-red-50 text-red-600 border-red-100"
            } text-sm px-4 py-3 rounded-xl border flex items-center gap-2`}>
              <span>{status.msg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-inkMid uppercase tracking-wider ml-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-inkLight" />
                <input
                  type="text"
                  name="contact_name"
                  value={form.contact_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="w-full bg-white border-2 border-borderLite rounded-2xl pl-11 pr-4 py-3 text-sm text-ink focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-inkMid uppercase tracking-wider ml-1">
                Restaurant Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-inkLight" />
                <input
                  type="text"
                  name="restaurant_name"
                  value={form.restaurant_name}
                  onChange={handleChange}
                  placeholder="The Golden Grill"
                  required
                  className="w-full bg-white border-2 border-borderLite rounded-2xl pl-11 pr-4 py-3 text-sm text-ink focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-inkMid uppercase tracking-wider ml-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-inkLight" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="contact@restaurant.com"
                  required
                  className="w-full bg-white border-2 border-borderLite rounded-2xl pl-11 pr-4 py-3 text-sm text-ink focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-inkMid uppercase tracking-wider ml-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-inkLight" />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="07123456789"
                  required
                  className="w-full bg-white border-2 border-borderLite rounded-2xl pl-11 pr-4 py-3 text-sm text-ink focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-inkMid uppercase tracking-wider ml-1">
                Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin size={18} className="absolute left-4 top-4 text-inkLight" />
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="123 Street Name, City"
                  required
                  rows={3}
                  className="w-full bg-white border-2 border-borderLite rounded-2xl pl-11 pr-4 py-3 text-sm text-ink focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primaryHover text-white font-bold text-base py-4 rounded-2xl shadow-[0_6px_20px_rgba(255,107,53,0.3)] transition-all flex items-center justify-center disabled:opacity-70 mt-4"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
