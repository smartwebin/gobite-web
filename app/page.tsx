"use client";

import { motion } from "framer-motion";
import { Copy, Navigation, QrCode, Lock, Phone, User, Mail, ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect, Suspense } from "react";
import { useStore } from "../context/StoreContext";
import { apiClient, setAuthToken } from "../utils/apiClient";

type AuthView = "welcome" | "login" | "signup" | "signup_otp_verify";

export default function GetStartedScreen() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center bg-[#F7F5F2] min-h-screen"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <GetStartedContent />
    </Suspense>
  );
}

function GetStartedContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || searchParams.get("t");

  const router = useRouter();
  const { login, setSessionInfo, user, refreshData, isLoading } = useStore();
  const [view, setView] = useState<AuthView>(token ? "welcome" : "login");
  const [isValidToken, setIsValidToken] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    identifier: "", // used for login
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // (Moved useEffect below handler declarations to avoid TDZ errors)

  const handleVerifyToken = async (t: string) => {
    setLoading(true);
    setError("");
    setIsValidToken(false);
    try {
      const resp = await apiClient.post("verify-qr.php", {
        qr_token: t,
        user_id: user?.id
      });
      if (resp.status === "success" && resp.data) {
        const d = resp.data;
        // Update context and ensure it persists
        setSessionInfo(
          d.restaurant_id.toString(),
          d.table_number?.toString() || "",
          d.table_id?.toString() || "0"
        );
        
        // Fetch fresh restaurant data based on verified token
        await refreshData(d.restaurant_id.toString());
        setIsValidToken(true);
        
        // If already logged in, go to menu. Otherwise stay to login/signup
        if (user) {
          router.push("/menu?from_scan=1");
        } else {
          setError("success:Table identified! Please login or continue as guest.");
        }
      } else {
        setSessionInfo("default", "", "0");
        setError("warning:The restaurant is not serving right now, but you can still login to your account.");
        setIsValidToken(false);
        setView("login");
      }
    } catch (err) {
      setSessionInfo("default", "", "0");
      setError("warning:The restaurant is not serving right now, but you can still login to your account.");
      setIsValidToken(false);
      setView("login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      handleVerifyToken(token);
    } else {
      const timer = setTimeout(() => {
        if (user) router.push("/dashboard");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [token, user]);

  // If we are still loading, or if we have a user (about to redirect to dashboard/menu),
  // or if we have a token and are currently verifying it (loading=true), show the spinner to prevent flicker.
  if (isLoading || user || (token && loading)) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F7F5F2] min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const resp = await apiClient.post("guest-login.php", {});
      if (resp.status === "success") {
        if (resp.data?.token) {
          setAuthToken(resp.data.token);
        }
        login({
          id: resp.data.user.id.toString(),
          name: resp.data.user.name,
          email: resp.data.user.email,
          phone: resp.data.user.phone,
          role: "customer",
          is_guest: true,
        });
        const dest = token ? "/menu?from_scan=1" : "/dashboard";
        router.push(dest);
      } else {
        setError(resp.message || "Guest login failed.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to continue as guest.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.identifier.trim() || !form.password.trim()) {
      setError("Please enter your email or phone, and password.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const resp = await apiClient.post("login.php", {
        email: form.identifier,
        password: form.password
      });

      if (resp.status === "success") {
        if (resp.data?.token) {
          setAuthToken(resp.data.token);
        }
        login({
          id: resp.data.user.id.toString(),
          name: resp.data.user.name,
          email: resp.data.user.email,
          phone: resp.data.user.phone,
          role: "customer",
        });
        const dest = token ? "/menu?from_scan=1" : "/dashboard";
        router.push(dest);
      } else {
        setError(resp.message || "Invalid credentials.");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Check server connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.password.trim() || !form.confirmPassword.trim()) {
      setError("Please fill in name and password.");
      return;
    }
    if (!form.email.trim()) {
      setError("Please provide your email address.");
      return;
    }
    if (form.phone.trim() && !/^\d{11}$/.test(form.phone.trim())) {
      setError("Please enter a valid 11-digit UK phone number (e.g. 07123456789).");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      const resp = await apiClient.post("signup.php", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password
      });

      if (resp.status === "success") {
        setError("");
        setView("login");
        setForm({...form, identifier: form.email || form.phone});
        // Set success message instead of alert
        setError("success:Registration successful! Please login.");
      } else {
        setError(resp.message || "Registration failed.");
      }
    } catch (err: any) {
      setError(err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (view) {
      case "welcome":
        return "Gobite";
      case "login":
        return "Welcome Back";
      case "signup":
        return "Create Account";
      case "signup_otp_verify":
        return form.phone ? "Verify Mobile" : "Verify Email";
    }
  };

  const getSubtitle = () => {
    switch (view) {
      case "welcome":
        return "Quickly order delicious food to your table.";
      case "login":
        return "Enter your email or phone and password";
      case "signup":
        return "Sign up to begin ordering";
      case "signup_otp_verify":
        return `We sent a code to ${form.phone || form.email}`;
    }
  };

  return (
    <div className="flex-1 flex flex-col relative bg-[#F7F5F2] overflow-x-hidden min-h-screen">
      {/* Decorative Circles */}
      <div className="absolute -top-32 -right-28 w-96 h-96 bg-[#FFDAC8] opacity-55 rounded-full blur-2xl" />
      <div className="absolute -bottom-32 -left-20 w-72 h-72 bg-[#FFE8D6] opacity-55 rounded-full blur-xl" />

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        {/* Header section */}
        {view !== "welcome" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mt-6 mb-6"
          >
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                <QrCode size={28} />
              </div>
              <span className="text-3xl font-black text-ink tracking-tight">
                Gobite
              </span>
            </div>
          </motion.div>
        )}
        
        {view === "welcome" && <div className="mt-16" />}

        <motion.div
          key={view}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/80 backdrop-blur-md border border-white p-6 rounded-3xl shadow-xl space-y-5"
        >
          {view === "welcome" && (
             <div className="flex justify-center mt-2 mb-6">
               <div className="flex flex-col items-center gap-3">
                 <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto">
                   <QrCode size={44} />
                 </div>
               </div>
             </div>
          )}

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold text-ink tracking-tight">
              {getTitle()}
            </h1>
            <p className="text-sm text-inkMid font-medium px-2">{getSubtitle()}</p>
          </div>

          {error && (
            <div className={`${
              error.startsWith("success:") 
                ? "bg-green-50 text-green-600 border-green-100" 
                : error.startsWith("warning:")
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-red-50 text-red-600 border-red-100"
            } text-sm px-4 py-3 rounded-xl border flex items-center gap-2`}>
              <span>{error.replace("success:", "").replace("warning:", "")}</span>
            </div>
          )}

          {/* ----- WELCOME VIEW ----- */}
          {view === "welcome" && (
            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-inkMid uppercase tracking-wider text-center pt-2">
                  How would you like to proceed?
                </p>
                <button
                  onClick={handleGuestLogin}
                  className="w-full bg-white border-2 border-borderLite hover:border-primary text-ink hover:text-primary font-bold text-base py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Navigation size={18} />
                  <span>Skip & continue as a guest</span>
                </button>
              </div>

              <div className="flex items-center gap-4 my-2">
                <div className="flex-1 h-px bg-borderLite" />
                <span className="text-xs font-semibold text-inkLight">OR</span>
                <div className="flex-1 h-px bg-borderLite" />
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setError("");
                    setView("login");
                  }}
                  className="w-full bg-primary hover:bg-primaryHover text-white font-bold text-base py-4 rounded-2xl shadow-[0_6px_20px_rgba(255,107,53,0.3)] transition-all flex items-center justify-center"
                >
                  Login to your account
                </button>
                <div className="pt-2 text-center">
                  <p className="text-sm text-inkMid">
                    Don't have an account?{" "}
                    <button
                      onClick={() => {
                        setError("");
                        setView("signup");
                      }}
                      className="text-primary font-bold hover:underline"
                    >
                      Sign Up
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ----- PASSWORD LOGIN VIEW ----- */}
          {view === "login" && (
            <form onSubmit={handleLogin} className="space-y-4 mt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-inkMid uppercase tracking-wider ml-1">
                  Email or Phone
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-inkLight" />
                  <input
                    type="text"
                    name="identifier"
                    value={form.identifier}
                    onChange={handleChange}
                    placeholder="john@example.com or 07123456789"
                    className="w-full bg-white border-2 border-borderLite rounded-2xl pl-11 pr-4 py-3 text-base text-ink focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-inkMid uppercase tracking-wider ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-inkLight" />
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full bg-white border-2 border-borderLite rounded-2xl pl-11 pr-4 py-3 text-base text-ink focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primaryHover text-white font-bold text-base py-4 rounded-2xl shadow-[0_6px_20px_rgba(255,107,53,0.3)] transition-all flex items-center justify-center disabled:opacity-70 mt-4"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          )}

          {/* ----- SIGNUP VIEW ----- */}
          {view === "signup" && (
            <form onSubmit={handleSignupSubmit} className="space-y-3 mt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-inkMid uppercase tracking-wider ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-inkLight" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full bg-white border-2 border-borderLite rounded-2xl pl-11 pr-4 py-2.5 text-sm text-ink focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-inkMid uppercase tracking-wider ml-1">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute text-inkLight left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="07123456789"
                    className="w-full bg-white border-2 border-borderLite rounded-2xl pl-9 pr-3 py-2.5 text-sm text-ink focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-inkMid uppercase tracking-wider ml-1">
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute text-inkLight left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full bg-white border-2 border-borderLite rounded-2xl pl-9 pr-3 py-2.5 text-sm text-ink focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-inkMid uppercase tracking-wider ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-inkLight" />
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className="w-full bg-white border-2 border-borderLite rounded-2xl pl-11 pr-4 py-2.5 text-sm text-ink focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-inkMid uppercase tracking-wider ml-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-inkLight" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="w-full bg-white border-2 border-borderLite rounded-2xl pl-11 pr-4 py-2.5 text-sm text-ink focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primaryHover text-white font-bold text-base py-4 rounded-2xl shadow-[0_6px_20px_rgba(255,107,53,0.3)] transition-all flex items-center justify-center disabled:opacity-70 mt-4"
              >
                {loading ? "Creating Account..." : "Next"}
              </button>
            </form>
          )}

          {/* ----- BOTTOM TOGGLE LINKS ----- */}
          {view !== "welcome" && view !== "signup_otp_verify" && (
            <div className="pt-2 border-t border-borderLite mt-2 text-center pb-2">
              {view === "signup" ? (
                <p className="text-sm text-inkMid">
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setError("");
                      setView("login");
                    }}
                    className="text-primary font-bold hover:underline"
                  >
                    Log In
                  </button>
                </p>
              ) : (
                <p className="text-sm text-inkMid">
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      setError("");
                      setView("signup");
                    }}
                    className="text-primary font-bold hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              )}
              {isValidToken && (
                <button
                    onClick={() => {
                      setError("");
                      setView("welcome");
                    }}
                    className="mt-4 text-xs font-semibold text-inkLight hover:text-ink transition-colors flex items-center justify-center gap-1 mx-auto"
                  >
                    Return to Welcome
                </button>
              )}
            </div>
          )}
          
          <p className="text-center text-[10px] text-inkLight leading-relaxed pt-1">
            By continuing, you agree to our{" "}
            <button
              onClick={() => router.push("/legal/terms")}
              className="text-primary font-semibold hover:underline cursor-pointer inline-block mx-0.5"
            >
              Terms
            </button>
            &amp;
            <button
              onClick={() => router.push("/legal/privacy")}
              className="text-primary font-semibold hover:underline cursor-pointer inline-block mx-0.5"
            >
              Privacy
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
