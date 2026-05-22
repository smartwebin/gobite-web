"use client";
import React, { useEffect, useState } from "react";
import { Header } from "../../components/ui/Header";
import { PrivateRoute } from "../../components/ui/PrivateRoute";
import { Phone, Mail, HelpCircle, MessageCircle, MapPin } from "lucide-react";
import { apiClient } from "../../utils/apiClient";

export default function SupportPage() {
  const [support, setSupport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupport();
  }, []);

  const fetchSupport = async () => {
    try {
      const res = await apiClient.get("get-support.php");
      if (res.status === "success") {
        setSupport(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch support info", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PrivateRoute>
    <div className="flex-1 flex flex-col bg-bgBase min-h-screen">
      <Header title="Support" showBack />
      <main className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-6 py-12">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : support ? (
          <>
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-black text-ink tracking-tight">
                {support.title || "Need Help?"}
              </h2>
              <p className="text-inkMid font-medium">
                {support.content || "We're here to assist you with your orders."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {support.phone && (
                <a
                  href={`tel:${support.phone}`}
                  className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-borderLite shadow-sm hover:border-primary transition-colors"
                >
                  <div className="w-12 h-12 bg-accentLight rounded-2xl flex items-center justify-center text-primary">
                    <Phone size={24} />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-ink">Call Us</span>
                    <span className="text-sm text-inkLight">{support.phone}</span>
                  </div>
                </a>
              )}

              {support.email && (
                <a
                  href={`mailto:${support.email}`}
                  className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-borderLite shadow-sm hover:border-primary transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                    <Mail size={24} />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-ink">Email Us</span>
                    <span className="text-sm text-inkLight">{support.email}</span>
                  </div>
                </a>
              )}

              {support.whatsapp && (
                <a
                  href={`https://wa.me/${support.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-borderLite shadow-sm hover:border-primary transition-colors md:col-span-2"
                >
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-500">
                    <MessageCircle size={24} />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-ink">WhatsApp Us</span>
                    <span className="text-sm text-inkLight">{support.whatsapp}</span>
                  </div>
                </a>
              )}

              {support.address && (
                <div className="flex items-start gap-4 p-6 bg-white rounded-3xl border border-borderLite shadow-sm md:col-span-2">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-500 shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-ink">Our Address</span>
                    <span className="text-sm text-inkMid mt-1 leading-relaxed block">
                      {support.address}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-inkMid text-center py-12">Support information is currently unavailable.</p>
        )}

        <div className="bg-white p-8 rounded-3xl border border-borderLite shadow-sm mt-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-borderLite pb-4">
            <HelpCircle className="text-primary" size={24} />
            <h3 className="text-xl font-bold text-ink">Quick Help</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="font-bold text-ink">Where is my order?</h4>
              <p className="text-sm text-inkMid leading-relaxed">
                You can track the live status of your order in the "My Orders" section accessible from the header.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-ink">How to cancel?</h4>
              <p className="text-sm text-inkMid leading-relaxed">
                To cancel an order, please contact the restaurant staff immediately or use the support call button.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
    </PrivateRoute>
  );
}

