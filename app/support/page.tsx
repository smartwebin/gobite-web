import React from "react";
import { Header } from "../../components/ui/Header";
import { MessageSquare, Phone, Mail, HelpCircle } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="flex-1 flex flex-col bg-bgBase min-h-screen">
      <Header title="Support" showBack />
      <main className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-6 py-12">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-black text-ink tracking-tight">Need Help?</h2>
          <p className="text-inkMid font-medium">We're here to assist you with your orders.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="tel:+1234567890" className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-borderLite shadow-sm hover:border-primary transition-colors">
            <div className="w-12 h-12 bg-accentLight rounded-2xl flex items-center justify-center text-primary">
              <Phone size={24} />
            </div>
            <div className="text-left">
              <span className="block font-bold text-ink">Call Us</span>
              <span className="text-sm text-inkLight">+1 (234) 567-890</span>
            </div>
          </a>

          <a href="mailto:support@gobite.com" className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-borderLite shadow-sm hover:border-primary transition-colors">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
              <Mail size={24} />
            </div>
            <div className="text-left">
              <span className="block font-bold text-ink">Email Us</span>
              <span className="text-sm text-inkLight">support@gobite.com</span>
            </div>
          </a>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-borderLite shadow-sm mt-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-borderLite pb-4">
            <HelpCircle className="text-primary" size={24} />
            <h3 className="text-xl font-bold text-ink">Quick Help</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="font-bold text-ink">Where is my order?</h4>
              <p className="text-sm text-inkMid leading-relaxed">
                You can track the live status of your order in the "Order History" section accessible from the header.
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
  );
}
