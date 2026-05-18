"use client";
import React, { useEffect, useState } from "react";
import { Header } from "../../../components/ui/Header";
import { apiClient } from "../../../utils/apiClient";
import Image from "next/image";

export default function AboutPage() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await apiClient.get("get-pages.php?slug=about");
      if (res.status === "success") {
        setContent(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-bgBase min-h-screen">
      <Header title="About Us" showBack />
      <main className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-8 py-12">
        <section className="bg-white p-8 rounded-3xl border border-borderLite shadow-sm space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : content ? (
            <>
              <div className="flex justify-center mb-8">
                 <Image src="/logo.png" alt="Gobite" width={120} height={120} className="object-contain" />
              </div>
              <h1 className="text-3xl font-black text-ink tracking-tight mb-6 text-center">
                {content.title}
              </h1>
              <div 
                className="text-inkMid leading-relaxed prose prose-slate max-w-none whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: content.description }}
              />
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="p-6 bg-accentLight rounded-2xl text-center">
                  <span className="block text-2xl font-black text-primary">Fast</span>
                  <span className="text-xs text-inkMid font-bold uppercase tracking-widest">Ordering</span>
                </div>
                <div className="p-6 bg-accentLight rounded-2xl text-center">
                  <span className="block text-2xl font-black text-primary">Secure</span>
                  <span className="text-xs text-inkMid font-bold uppercase tracking-widest">Sessions</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-inkMid text-center py-12">Failed to load content.</p>
          )}
        </section>
      </main>
    </div>
  );
}
