"use client";

import { motion } from "framer-motion";
import { ChevronLeft, User as UserIcon, Lock, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Header } from "../../components/ui/Header";
import { useStore } from "../../context/StoreContext";
import { apiClient } from "../../utils/apiClient";

export default function SettingsPage() {
  const router = useRouter();
  const { user, login, logout } = useStore();

  const [activeTab, setActiveTab] = useState<"profile" | "password" | "delete">("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (!user || user.is_guest) {
      router.replace("/menu");
    } else {
      setForm((prev) => ({ ...prev, name: user.name, phone: user.phone }));
    }
  }, [user, router]);

  if (!user || user.is_guest) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const resp = await apiClient.post("update-customer.php", {
        action: "edit_profile",
        user_id: user.id,
        name: form.name,
        phone: form.phone,
      });
      if (resp.status === "success") {
        setMessage("Profile updated successfully!");
        login({ ...user, name: form.name, phone: form.phone });
      } else {
        setError(resp.message || "Update failed.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const resp = await apiClient.post("update-customer.php", {
        action: "reset_password",
        user_id: user.id,
        current_password: form.currentPassword,
        new_password: form.newPassword,
      });
      if (resp.status === "success") {
        setMessage("Password updated successfully!");
        setForm({ ...form, currentPassword: "", newPassword: "" });
      } else {
        setError(resp.message || "Password update failed.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    setLoading(true);
    setError("");
    try {
      const resp = await apiClient.post("update-customer.php", {
        action: "delete_account",
        user_id: user.id,
      });
      if (resp.status === "success") {
        logout();
        router.replace("/");
      } else {
        setError(resp.message || "Failed to delete account.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete account.");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-bgBase min-h-screen">
      <Header />

      <div className="flex-1 p-4 md:p-8 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-50 border border-borderLite"
          >
            <ChevronLeft size={20} className="text-ink" />
          </button>
          <h1 className="text-2xl font-bold text-ink">Account Settings</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-borderLite overflow-hidden flex flex-col md:flex-row">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 bg-gray-50/50 border-r border-borderLite p-4 flex flex-row md:flex-col gap-2 overflow-x-auto">
            <button
              onClick={() => { setActiveTab("profile"); setMessage(""); setError(""); }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all whitespace-nowrap ${
                activeTab === "profile" ? "bg-accentLight text-primary font-bold" : "text-inkMid hover:bg-gray-100"
              }`}
            >
              <UserIcon size={18} />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => { setActiveTab("password"); setMessage(""); setError(""); }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all whitespace-nowrap ${
                activeTab === "password" ? "bg-accentLight text-primary font-bold" : "text-inkMid hover:bg-gray-100"
              }`}
            >
              <Lock size={18} />
              <span>Change Password</span>
            </button>
            <button
              onClick={() => { setActiveTab("delete"); setMessage(""); setError(""); }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all whitespace-nowrap ${
                activeTab === "delete" ? "bg-red-50 text-red-600 font-bold" : "text-red-500 hover:bg-red-50"
              }`}
            >
              <Trash2 size={18} />
              <span>Delete Account</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 md:p-8">
            {message && (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 mb-6">
                {message}
              </div>
            )}
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-6">
                {error}
              </div>
            )}

            {activeTab === "profile" && (
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleUpdateProfile}
                className="space-y-5"
              >
                <h2 className="text-lg font-bold text-ink mb-4">Edit Profile</h2>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-inkMid uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border-2 border-borderLite rounded-xl px-4 py-3 text-ink focus:border-primary focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-inkMid uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border-2 border-borderLite rounded-xl px-4 py-3 text-ink focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-inkMid uppercase tracking-wider">Email (Read Only)</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full border-2 border-borderLite bg-gray-50 rounded-xl px-4 py-3 text-inkMid focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primaryHover text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-70 mt-4"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </motion.form>
            )}

            {activeTab === "password" && (
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleResetPassword}
                className="space-y-5"
              >
                <h2 className="text-lg font-bold text-ink mb-4">Change Password</h2>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-inkMid uppercase tracking-wider">Current Password</label>
                  <input
                    type="password"
                    value={form.currentPassword}
                    onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                    className="w-full border-2 border-borderLite rounded-xl px-4 py-3 text-ink focus:border-primary focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-inkMid uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    className="w-full border-2 border-borderLite rounded-xl px-4 py-3 text-ink focus:border-primary focus:outline-none"
                    required
                    minLength={6}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primaryHover text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-70 mt-4"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </motion.form>
            )}

            {activeTab === "delete" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <h2 className="text-lg font-bold text-red-600 mb-2">Delete Account</h2>
                <p className="text-sm text-inkMid leading-relaxed mb-6">
                  Once you delete your account, you will lose access to all your order history. This action cannot be undone. 
                </p>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-70"
                >
                  {loading ? "Deleting..." : "Permanently Delete Account"}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
